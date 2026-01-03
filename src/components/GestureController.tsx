import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

console.log("GestureController Module: Loading...");

export const GestureController = () => {
    const webcamRef = useRef<Webcam>(null);
    const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
    const [webcamEnabled, setWebcamEnabled] = useState(false);

    // Cursor State
    const [cursorActive, setCursorActive] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [gestureStatus, setGestureStatus] = useState<'IDLE' | 'CURSOR ACTIVE' | 'DETECTING'>('IDLE');

    // Refs for optimization
    const cursorActiveRef = useRef(false);
    const positionBuffer = useRef<{ x: number, y: number }[]>([]);
    const BUFFER_SIZE = 5;
    const lastGestureTime = useRef(0);
    const GESTURE_COOLDOWN = 1000; // ms between toggles

    // Custom Mouse Cursor Element Ref
    const cursorRef = useRef<HTMLDivElement>(null);

    // Initialize HandLandmarker
    useEffect(() => {
        console.log("GestureController: Mounting...");
        const initMediapipe = async () => {
            try {
                console.log("GestureController: Initializing MediaPipe...");
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );

                const landmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numHands: 1
                });

                console.log("GestureController: MediaPipe Initialized Successfully");
                setHandLandmarker(landmarker);
                setWebcamEnabled(true);
            } catch (error) {
                console.error("GestureController: Error initializing MediaPipe:", error);
            }
        };

        initMediapipe();
    }, []);

    // Helper: Detect Fist (All fingers curled)
    const isFist = (landmarks: any[]) => {
        // Check if fingertips are below knuckles for all 4 fingers (Index to Pinky)
        // Note: Y coordinates increase downwards
        const tips = [8, 12, 16, 20];
        const knuckles = [5, 9, 13, 17];

        let curledCount = 0;
        for (let i = 0; i < tips.length; i++) {
            if (landmarks[tips[i]].y > landmarks[knuckles[i]].y) {
                curledCount++;
            }
        }
        // Thumb check (tip x vs ip x depends on hand side, simplified to just check proximity to palm or if index/middle/ring/pinky are curled)
        return curledCount >= 4;
    };

    // Frame Loop
    useEffect(() => {
        let animationFrameId: number;
        let lastVideoTime = -1;

        const processResults = (results: any) => {
            if (results.landmarks && results.landmarks.length > 0) {
                const landmarks = results.landmarks[0];
                const now = Date.now();

                // 1. Check for Activation Gesture (Fist)
                if (isFist(landmarks)) {
                    if (now - lastGestureTime.current > GESTURE_COOLDOWN) {
                        const newState = !cursorActiveRef.current;
                        cursorActiveRef.current = newState;
                        setCursorActive(newState);
                        setGestureStatus(newState ? 'CURSOR ACTIVE' : 'IDLE');
                        lastGestureTime.current = now;
                        console.log("Gesture/Cursor Toggle:", newState);
                    }
                }

                // 2. Cursor Movement (Index Finger)
                if (cursorActiveRef.current) {
                    // We track even if not perfectly "pointing" to allow for relaxed hand, 
                    // but strictly tracking tip [8]
                    const rawX = landmarks[8].x;
                    const rawY = landmarks[8].y;

                    // Smoothing
                    positionBuffer.current.push({ x: rawX, y: rawY });
                    if (positionBuffer.current.length > BUFFER_SIZE) {
                        positionBuffer.current.shift();
                    }

                    const avgX = positionBuffer.current.reduce((a, b) => a + b.x, 0) / positionBuffer.current.length;
                    const avgY = positionBuffer.current.reduce((a, b) => a + b.y, 0) / positionBuffer.current.length;

                    // Mirror X coordinate (Cam Left = Screen Right)
                    // MediaPipe X is 0 (Left) to 1 (Right). 
                    // If user moves Right, Camera sees Left (X decreases). 
                    // We want Screen X to Increase. So usage of (1 - x) is correct for direct mapping?
                    // Let's assume standard selfie mirror:
                    // User Right Hand -> Right side of screen -> MP X > 0.5? 
                    // Actually, let's try raw x first, but inverted is usually natural for "Mirror" feel.
                    const screenX = (1 - avgX) * window.innerWidth;
                    const screenY = avgY * window.innerHeight;

                    setCursorPos({ x: screenX, y: screenY });
                }
            }
        };

        const loop = () => {
            if (webcamRef.current && webcamRef.current.video && handLandmarker) {
                const video = webcamRef.current.video;
                if (video.videoWidth > 0 && video.currentTime !== lastVideoTime) {
                    lastVideoTime = video.currentTime;
                    const results = handLandmarker.detectForVideo(video, performance.now());
                    processResults(results);
                }
            }
            animationFrameId = requestAnimationFrame(loop);
        };

        loop();

        return () => cancelAnimationFrame(animationFrameId);
    }, [handLandmarker]);

    return (
        <>
            {/* Control Panel */}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2 pointer-events-none">
                <div className={`
                    backdrop-blur-sm p-3 rounded-lg border border-white/10 text-xs font-bold uppercase tracking-widest mb-2 transition-colors duration-200
                    ${cursorActive ? 'bg-green-500 text-black' : 'bg-dark/80 text-white'}
                `}>
                    Status: <span>{gestureStatus}</span>
                </div>

                <div className="relative w-32 h-24 rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl bg-black">
                    {webcamEnabled && (
                        <Webcam
                            ref={webcamRef}
                            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                            audio={false}
                            width={320}
                            height={240}
                            videoConstraints={{
                                width: 320,
                                height: 240,
                                facingMode: "user"
                            }}
                        />
                    )}
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-widest text-right">
                    Fist: Toggle On/Off <br />
                    Index: Move Cursor
                </p>
            </div>

            {/* Virtual Cursor */}
            {cursorActive && (
                <div
                    className="fixed w-6 h-6 rounded-full border-2 border-white mix-blend-difference pointer-events-none z-[10000] transition-transform duration-75"
                    style={{
                        left: 0,
                        top: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)`,
                        boxShadow: '0 0 10px rgba(255,255,255,0.8)'
                    }}
                >
                    <div className="absolute inset-0 w-full h-full animate-ping rounded-full bg-white opacity-50"></div>
                </div>
            )}
        </>
    );
};

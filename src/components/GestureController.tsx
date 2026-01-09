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
    const [gestureStatus, setGestureStatus] = useState<'IDLE' | 'CURSOR ACTIVE' | 'DETECTING' | 'CLICKING' | 'SCROLL UP' | 'SCROLL DOWN'>('IDLE');

    // Refs for optimization
    const cursorActiveRef = useRef(false);
    const smoothedPosRef = useRef({ x: 0, y: 0 });
    const SMOOTHING_FACTOR = 0.2; // Adjustable: Lower = smoother but slower, Higher = faster but jittery
    const lastGestureTime = useRef(0);
    const GESTURE_COOLDOWN = 1000; // ms between toggles

    // Custom Mouse Cursor Element Ref


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



    // Frame Loop
    useEffect(() => {
        let animationFrameId: number;
        let lastVideoTime = -1;
        let lastClickTime = 0;
        const CLICK_COOLDOWN = 500;

        // Helper: Calculate Euclidean distance between two points
        const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
            return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        };

        // Helper: Detect Fist (All fingers curled)
        const isFist = (landmarks: any[]) => {
            const tips = [8, 12, 16, 20]; // Index, Middle, Ring, Pinky tips
            const pips = [6, 10, 14, 18];  // PIP joints
            const wrist = landmarks[0];

            let curledCount = 0;
            for (let i = 0; i < tips.length; i++) {
                if (getDistance(landmarks[tips[i]], wrist) < getDistance(landmarks[pips[i]], wrist)) {
                    curledCount++;
                }
            }
            return curledCount >= 4;
        };

        // Helper: Detect Pinch (Index tip close to Thumb tip)
        const isPinch = (landmarks: any[]) => {
            const thumbTip = landmarks[4];
            const indexTip = landmarks[8];
            const distance = getDistance(thumbTip, indexTip);
            return distance < 0.05;
        };

        // Helper: Detect Open Hand
        const isOpenHand = (landmarks: any[]) => {
            const tips = [8, 12, 16, 20];
            const pips = [6, 10, 14, 18];
            const wrist = landmarks[0];
            return tips.every((tip, i) => getDistance(landmarks[tip], wrist) > getDistance(landmarks[pips[i]], wrist));
        };

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
                        if (newState) {
                            const rawX = landmarks[8].x;
                            const rawY = landmarks[8].y;
                            smoothedPosRef.current = {
                                x: (1 - rawX) * window.innerWidth,
                                y: rawY * window.innerHeight
                            };
                        }
                        lastGestureTime.current = now;
                        console.log("Gesture/Cursor Toggle:", newState);
                    }
                }

                // 2. Cursor Movement (Index Finger) & Clicking
                if (cursorActiveRef.current) {
                    const rawX = landmarks[8].x;
                    const rawY = landmarks[8].y;

                    const targetX = (1 - rawX) * window.innerWidth;
                    const targetY = rawY * window.innerHeight;

                    const lx = smoothedPosRef.current.x;
                    const ly = smoothedPosRef.current.y;

                    const newX = lx + (targetX - lx) * SMOOTHING_FACTOR;
                    const newY = ly + (targetY - ly) * SMOOTHING_FACTOR;

                    smoothedPosRef.current = { x: newX, y: newY };

                    const screenX = newX;
                    const screenY = newY;

                    setCursorPos({ x: screenX, y: screenY });

                    // Scrolling (Edge Detection)
                    const scrollZone = 0.15;
                    const scrollAmount = 15;

                    if (screenY < window.innerHeight * scrollZone) {
                        window.scrollBy(0, -scrollAmount);
                        setGestureStatus('SCROLL UP');
                    } else if (screenY > window.innerHeight * (1 - scrollZone)) {
                        window.scrollBy(0, scrollAmount);
                        setGestureStatus('SCROLL DOWN');
                    }

                    // Click Detection (Pinch)
                    if (isPinch(landmarks)) {
                        if (now - lastClickTime > CLICK_COOLDOWN) {
                            console.log("Click triggered");
                            const element = document.elementFromPoint(screenX, screenY) as HTMLElement;
                            if (element) {
                                element.click();
                            }
                            lastClickTime = now;
                            setGestureStatus("CLICKING");
                            setTimeout(() => setGestureStatus("CURSOR ACTIVE"), 200);
                        }
                    }
                }

                // 3. Scrolling (Open Hand)
                if (isOpenHand(landmarks) && !isFist(landmarks)) {
                    const y = landmarks[9].y;
                    const scrollSpeed = 15;

                    if (y < 0.2) {
                        window.scrollBy(0, -scrollSpeed);
                        setGestureStatus('SCROLL UP');
                    } else if (y > 0.8) {
                        window.scrollBy(0, scrollSpeed);
                        setGestureStatus('SCROLL DOWN');
                    }
                } else if (!cursorActiveRef.current && !isFist(landmarks)) {
                    setGestureStatus('IDLE');
                } else if (cursorActiveRef.current && !isPinch(landmarks)) {
                    setGestureStatus('CURSOR ACTIVE');
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
                        <>
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
                            {/* Visual Feedback Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-4xl drop-shadow-lg filter">
                                    {gestureStatus === 'CLICKING' ? '👌' :
                                        gestureStatus === 'CURSOR ACTIVE' ? '👆' :
                                            gestureStatus === 'SCROLL UP' ? '⬆️' :
                                                gestureStatus === 'SCROLL DOWN' ? '⬇️' :
                                                    cursorActive ? '👀' : '✋'}
                                </span>
                            </div>
                        </>
                    )}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest text-right space-y-1">
                    <p>✊ Fist: Toggle On/Off</p>
                    <p>👆 Index: Move Cursor</p>
                    <p>👌 Pinch: Click</p>
                    <p>✋ Open: Scroll</p>
                </div>
            </div>

            {/* Virtual Cursor */}
            {cursorActive && (
                <div
                    className={`fixed pointer-events-none z-[10000] transition-all duration-100 flex items-center justify-center rounded-full
                        ${gestureStatus === 'CLICKING' ? 'w-4 h-4 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]' :
                            gestureStatus.includes('SCROLL') ? 'w-10 h-10 border-2 border-blue-400 bg-blue-400/20' :
                                'w-6 h-6 border-2 border-white mix-blend-difference'}
                    `}
                    style={{
                        left: 0,
                        top: 0,
                        transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)`,
                    }}
                >
                    {/* Inner Dot for precision */}
                    <div className={`rounded-full bg-white transition-all
                        ${gestureStatus === 'CLICKING' ? 'w-full h-full opacity-100' : 'w-1 h-1 opacity-80'}
                    `}></div>

                    {/* Ripple effect only on Click */}
                    {gestureStatus === 'CLICKING' && (
                        <div className="absolute inset-0 w-full h-full animate-ping rounded-full bg-red-500 opacity-75"></div>
                    )}
                </div>
            )}
        </>
    );
};

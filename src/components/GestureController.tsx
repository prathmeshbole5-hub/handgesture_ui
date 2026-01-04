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

    // Helper: Detect Pinch (Index tip close to Thumb tip)
    const isPinch = (landmarks: any[]) => {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const distance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2)
        );
        return distance < 0.05;
    };

    // Helper: Detect Open Hand (Fingers extended)
    const isOpenHand = (landmarks: any[]) => {
        const tips = [8, 12, 16, 20];
        const knuckles = [5, 9, 13, 17];
        // Check if tips are above knuckles (y is lower)
        return tips.every((tip, i) => landmarks[tip].y < landmarks[knuckles[i]].y);
    };

    // Frame Loop
    useEffect(() => {
        let animationFrameId: number;
        let lastVideoTime = -1;
        let lastClickTime = 0;
        const CLICK_COOLDOWN = 500;

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

                // 2. Cursor Movement (Index Finger) & Clicking
                if (cursorActiveRef.current) {
                    const rawX = landmarks[8].x;
                    const rawY = landmarks[8].y;

                    // Smoothing
                    positionBuffer.current.push({ x: rawX, y: rawY });
                    if (positionBuffer.current.length > BUFFER_SIZE) {
                        positionBuffer.current.shift();
                    }

                    const avgX = positionBuffer.current.reduce((a, b) => a + b.x, 0) / positionBuffer.current.length;
                    const avgY = positionBuffer.current.reduce((a, b) => a + b.y, 0) / positionBuffer.current.length;

                    const screenX = (1 - avgX) * window.innerWidth;
                    const screenY = avgY * window.innerHeight;

                    setCursorPos({ x: screenX, y: screenY });

                    // Click Detection (Pinch)
                    if (isPinch(landmarks)) {
                        if (now - lastClickTime > CLICK_COOLDOWN) {
                            console.log("Click triggered");
                            const element = document.elementFromPoint(screenX, screenY) as HTMLElement;
                            if (element) {
                                element.click();
                                // Add visual feedback if possible?
                                // Trigger a small ripple or distinct cursor state?
                                // For now, simple click.
                            }
                            lastClickTime = now;
                            setGestureStatus("CLICKING");
                            setTimeout(() => setGestureStatus("CURSOR ACTIVE"), 200);
                        }
                    }
                }

                // 3. Scrolling (Open Hand)
                // Only scroll if NOT in cursor mode (or maybe allow both? User said "first it was movieng doen and upward when i was doint with openhands")
                // Let's assume Open Hand is for Scrolling anytime, or maybe just when Cursor Mode is OFF? 
                // Using "Open Hand" while Cursor is Active might be conflicting if they open hand to move cursor.
                // However, user specifically asked for "Open Hand" behavior. 
                // Usually, "Index Pointing" = Cursor, "Open Hand" = Scroll, "Fist" = Toggle.
                // So if Open Hand is detected, we scroll.
                if (isOpenHand(landmarks) && !isFist(landmarks)) {
                    // Scroll based on Y position (Zone based)
                    const y = landmarks[9].y; // Use Middle finger knuckle or palm center
                    const scrollSpeed = 15;

                    if (y < 0.2) {
                        // Top of screen -> Scroll Up
                        window.scrollBy(0, -scrollSpeed);
                        setGestureStatus('SCROLL UP');
                    } else if (y > 0.8) {
                        // Bottom of screen -> Scroll Down
                        window.scrollBy(0, scrollSpeed);
                        setGestureStatus('SCROLL DOWN');
                    } else {
                        // Center - Neutral if we want just active scrolling
                        // Or we can leave status as previous
                    }
                } else if (!cursorActiveRef.current && !isFist(landmarks)) {
                    // Reset status if nothing matches and cursor is off
                    setGestureStatus('IDLE');
                } else if (cursorActiveRef.current && !isPinch(landmarks)) {
                    // If cursor active and not pinching, status is ACTIVE
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

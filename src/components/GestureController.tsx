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

    // ... (previous logic remains same, just modifying the UI return)

    return (
        <>
            {/* Control Panel / HUD */}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4 pointer-events-none select-none">

                {/* Status Indicator Pill */}
                <div className={`
                    backdrop-blur-md px-4 py-2 rounded-full border border-white/10 
                    text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg transition-all duration-300
                    flex items-center gap-2
                    ${cursorActive ? 'bg-primary/20 border-primary/50 text-white' : 'bg-black/50 text-white/50 border-white/5'}
                `}>
                    <div className={`w-2 h-2 rounded-full ${cursorActive ? 'bg-primary animate-pulse' : 'bg-red-500'}`}></div>
                    <span>{gestureStatus}</span>
                </div>

                {/* Main HUD Display */}
                <div className="relative group">
                    {/* HUD Frame */}
                    <div className="absolute -inset-2 bg-gradient-to-tr from-primary/20 to-transparent rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-white/10 bg-black/80 backdrop-blur-sm shadow-2xl">
                        {/* Grid Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px]"></div>

                        {webcamEnabled && (
                            <>
                                <Webcam
                                    ref={webcamRef}
                                    className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-30 grayscale mix-blend-screen"
                                    audio={false}
                                    width={320}
                                    height={240}
                                    videoConstraints={{
                                        width: 320,
                                        height: 240,
                                        facingMode: "user"
                                    }}
                                />

                                {/* HUD Data Overlay */}
                                <div className="absolute inset-0 p-2 flex flex-col justify-between font-mono text-[8px] text-primary/80">
                                    <div className="flex justify-between items-start">
                                        <span>G.CONTROLLER v1.0</span>
                                        <span>REC</span>
                                    </div>

                                    {/* Center Target */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-white/20 rounded-full flex items-center justify-center">
                                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span>X: {cursorPos.x.toFixed(0)}</span>
                                            <span>Y: {cursorPos.y.toFixed(0)}</span>
                                        </div>
                                        <span>{cursorActive ? 'ACTIVE' : 'STANDBY'}</span>
                                    </div>
                                </div>

                                {/* Dynamic Icon Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                                    {gestureStatus === 'CLICKING' && <div className="w-12 h-12 border-2 border-primary rounded-full animate-ping"></div>}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Quick Guide */}
                <div className="flex gap-2 text-[8px] text-white/30 uppercase tracking-widest font-mono">
                    <div className="flex items-center gap-1"><span className="text-primary font-bold">Fist</span> Toggle</div>
                    <div className="flex items-center gap-1"><span className="text-primary font-bold">Pinch</span> Click</div>
                </div>
            </div>

            {/* Virtual Cursor (Visuals) */}
            {cursorActive && (
                <div
                    className={`fixed pointer-events-none z-[10000] transition-all duration-75 ease-out mix-blend-difference
                        ${gestureStatus === 'CLICKING' ? 'scale-75' : 'scale-100'}
                    `}
                    style={{
                        left: 0,
                        top: 0,
                        transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)`,
                    }}
                >
                    <div className="relative -translate-x-1/2 -translate-y-1/2">
                        {/* Main Ring */}
                        <div className={`w-8 h-8 rounded-full border-2 transition-colors duration-200 flex items-center justify-center
                            ${gestureStatus === 'CLICKING' ? 'border-primary bg-primary/20' : 'border-white'}
                        `}>
                            {/* Inner Dot */}
                            <div className={`w-1 h-1 bg-white rounded-full ${gestureStatus === 'CLICKING' ? 'bg-primary' : ''}`}></div>
                        </div>

                        {/* Crosshairs */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-[1px] bg-white/50"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-[1px] bg-white/50"></div>
                    </div>
                </div>
            )}
        </>
    );
};

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

console.log("GestureController Module: Loading...");

const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // Index
    [0, 9], [9, 10], [10, 11], [11, 12], // Middle
    [0, 13], [13, 14], [14, 15], [15, 16], // Ring
    [0, 17], [17, 18], [18, 19], [19, 20]  // Pinky
];

export const GestureController = () => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
    const [isModelReady, setIsModelReady] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);

    // Cursor State
    const [cursorActive, setCursorActive] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [gestureStatus, setGestureStatus] = useState<'IDLE' | 'CURSOR ACTIVE' | 'DETECTING' | 'CLICKING' | 'SCROLL UP' | 'SCROLL DOWN'>('IDLE');

    // Trail State
    const [trail, setTrail] = useState<{ x: number, y: number, id: number }[]>([]);

    // Refs for optimization
    const cursorActiveRef = useRef(false);
    const smoothedPosRef = useRef({ x: 0, y: 0 });
    const lastHoveredElementRef = useRef<HTMLElement | null>(null);
    const isPinchedRef = useRef(false);
    const lastGestureTime = useRef(0);
    const GESTURE_COOLDOWN = 1000;

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
                setIsModelReady(true);
            } catch (error) {
                console.error("GestureController: Error initializing MediaPipe:", error);
            }
        };

        initMediapipe();
    }, []);

    // Frame Loop
    useEffect(() => {
        if (!isCameraActive || !isModelReady) return;

        let animationFrameId: number;
        let lastVideoTime = -1;
        let lastClickTime = 0;
        const CLICK_COOLDOWN = 500;

        const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
            return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        };

        const isFist = (landmarks: any[]) => {
            const tips = [8, 12, 16, 20];
            const pips = [6, 10, 14, 18];
            const wrist = landmarks[0];
            let curledCount = 0;
            for (let i = 0; i < tips.length; i++) {
                if (getDistance(landmarks[tips[i]], wrist) < getDistance(landmarks[pips[i]], wrist)) {
                    curledCount++;
                }
            }
            return curledCount >= 4;
        };

        const isOpenHand = (landmarks: any[]) => {
            const tips = [8, 12, 16, 20];
            const pips = [6, 10, 14, 18];
            const wrist = landmarks[0];
            return tips.every((tip, i) => getDistance(landmarks[tip], wrist) > getDistance(landmarks[pips[i]], wrist));
        };

        const drawSkeleton = (landmarks: any[]) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#00f2fe'; // Cyan

            for (const [start, end] of HAND_CONNECTIONS) {
                const p1 = landmarks[start];
                const p2 = landmarks[end];

                ctx.beginPath();
                // Mirror x coordinate because video is mirrored
                ctx.moveTo((1 - p1.x) * canvas.width, p1.y * canvas.height);
                ctx.lineTo((1 - p2.x) * canvas.width, p2.y * canvas.height);
                ctx.stroke();
            }

            // Draw landmarks
            ctx.fillStyle = '#4facfe'; // Blue-ish
            for (const landmark of landmarks) {
                ctx.beginPath();
                ctx.arc((1 - landmark.x) * canvas.width, landmark.y * canvas.height, 3, 0, 2 * Math.PI);
                ctx.fill();
            }
        };

        const updateHoverState = (x: number, y: number) => {
            const element = document.elementFromPoint(x, y) as HTMLElement;

            if (element !== lastHoveredElementRef.current) {
                if (lastHoveredElementRef.current) {
                    try {
                        lastHoveredElementRef.current.classList.remove('gesture-hover');
                        lastHoveredElementRef.current.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y }));
                        lastHoveredElementRef.current.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y }));
                    } catch (e) { }
                }

                if (element) {
                    let current: HTMLElement | null = element;
                    while (current && current.tagName !== 'BODY') {
                        if (
                            current.tagName === 'BUTTON' ||
                            current.tagName === 'A' ||
                            current.classList.contains('btn-glow') ||
                            current.classList.contains('glitch-hover') ||
                            current.onclick != null ||
                            window.getComputedStyle(current).cursor === 'pointer'
                        ) {
                            current.classList.add('gesture-hover');
                            break;
                        }
                        current = current.parentElement;
                    }
                    element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y }));
                    element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y }));
                }
                lastHoveredElementRef.current = element;
            }
        };

        const processResults = (results: any) => {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

            if (results.landmarks && results.landmarks.length > 0) {
                const landmarks = results.landmarks[0];
                const now = Date.now();

                // Draw Skeleton
                drawSkeleton(landmarks);

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
                        } else {
                            if (lastHoveredElementRef.current) {
                                lastHoveredElementRef.current.classList.remove('gesture-hover');
                                lastHoveredElementRef.current = null;
                            }
                            setTrail([]); // Clear trail on deactivate
                        }
                        lastGestureTime.current = now;
                    }
                }

                // 2. Cursor Movement & Clicking
                if (cursorActiveRef.current) {
                    const rawX = landmarks[8].x;
                    const rawY = landmarks[8].y;
                    const targetX = (1 - rawX) * window.innerWidth;
                    const targetY = rawY * window.innerHeight;

                    const lx = smoothedPosRef.current.x;
                    const ly = smoothedPosRef.current.y;

                    const dist = Math.sqrt(Math.pow(targetX - lx, 2) + Math.pow(targetY - ly, 2));
                    const minSmooth = 0.1;
                    const maxSmooth = 0.6;
                    const speedThreshold = 200;
                    const smoothFactor = minSmooth + (Math.min(dist, speedThreshold) / speedThreshold) * (maxSmooth - minSmooth);

                    const newX = lx + (targetX - lx) * smoothFactor;
                    const newY = ly + (targetY - ly) * smoothFactor;

                    smoothedPosRef.current = { x: newX, y: newY };
                    setCursorPos({ x: newX, y: newY });

                    // Update Trail
                    setTrail(prev => {
                        const newTrail = [...prev, { x: newX, y: newY, id: Date.now() }];
                        if (newTrail.length > 10) newTrail.shift();
                        return newTrail;
                    });

                    updateHoverState(newX, newY);

                    window.dispatchEvent(new MouseEvent('mousemove', {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        clientX: newX,
                        clientY: newY
                    }));

                    const scrollZone = 0.15;
                    const scrollAmount = 15;
                    if (newY < window.innerHeight * scrollZone) {
                        window.scrollBy(0, -scrollAmount);
                        setGestureStatus('SCROLL UP');
                    } else if (newY > window.innerHeight * (1 - scrollZone)) {
                        window.scrollBy(0, scrollAmount);
                        setGestureStatus('SCROLL DOWN');
                    }

                    const thumbTip = landmarks[4];
                    const indexTip = landmarks[8];
                    const pinchDist = getDistance(thumbTip, indexTip);
                    const PINCH_START = 0.04;
                    const PINCH_END = 0.08;

                    if (!isPinchedRef.current) {
                        if (pinchDist < PINCH_START) {
                            if (now - lastClickTime > CLICK_COOLDOWN) {
                                const element = document.elementFromPoint(newX, newY) as HTMLElement;
                                if (element) {
                                    element.click();
                                    element.classList.add('active');
                                    setTimeout(() => element.classList.remove('active'), 200);
                                }
                                lastClickTime = now;
                                setGestureStatus("CLICKING");
                                setTimeout(() => setGestureStatus("CURSOR ACTIVE"), 200);
                                isPinchedRef.current = true;
                            }
                        }
                    } else {
                        if (pinchDist > PINCH_END) {
                            isPinchedRef.current = false;
                        }
                    }
                }

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
                } else if (cursorActiveRef.current && !isPinchedRef.current) {
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
    }, [handLandmarker, isCameraActive, isModelReady]);

    return (
        <>
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4 pointer-events-none select-none">
                <div className={`
                    backdrop-blur-md px-4 py-2 rounded-full border border-white/10 
                    text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg transition-all duration-300
                    flex items-center gap-2 pointer-events-auto
                    ${isCameraActive ? (cursorActive ? 'bg-primary/20 border-primary/50 text-white' : 'bg-black/50 text-white/50 border-white/5') : 'bg-red-900/20 border-red-500/30 text-red-400'}
                `}>
                    <div className={`w-2 h-2 rounded-full ${isCameraActive ? (cursorActive ? 'bg-primary animate-pulse' : 'bg-yellow-500') : 'bg-red-500'}`}></div>
                    <span>{isCameraActive ? gestureStatus : 'OFFLINE'}</span>
                </div>

                <div className="relative group pointer-events-auto">
                    <div className="absolute -inset-2 bg-gradient-to-tr from-primary/20 to-transparent rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-white/10 bg-black/80 backdrop-blur-sm shadow-2xl transition-all duration-500">
                        <motion.button
                            onClick={() => setIsCameraActive(!isCameraActive)}
                            whileHover={{ scale: 1.2, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            className="absolute top-2 right-2 z-20 p-2 rounded-full hover:bg-white/10 transition-colors"
                            title={isCameraActive ? "Turn Off Camera" : "Turn On Camera"}
                        >
                            <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${isCameraActive ? 'border-primary bg-primary shadow-[0_0_10px_theme(colors.primary.DEFAULT)]' : 'border-red-500/50 bg-red-900/20'}`}></div>
                        </motion.button>

                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px]"></div>

                        {isCameraActive && isModelReady ? (
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
                                <canvas
                                    ref={canvasRef}
                                    className="absolute inset-0 w-full h-full pointer-events-none"
                                    width={320}
                                    height={240}
                                />

                                <div className="absolute inset-0 p-2 flex flex-col justify-between font-mono text-[8px] text-primary/80 pointer-events-none">
                                    <div className="flex justify-between items-start">
                                        <span>G.CONTROLLER v2.0</span>
                                        <span>REC</span>
                                    </div>

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

                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                                    {gestureStatus === 'CLICKING' && <div className="w-12 h-12 border-2 border-primary rounded-full animate-ping"></div>}
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 font-mono text-[10px] tracking-widest gap-2">
                                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                                    <div className="w-1 h-20 bg-white/10 rotate-45 absolute"></div>
                                </div>
                                <span>CAMERA OFF</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 text-[8px] text-white/30 uppercase tracking-widest font-mono">
                    <div className="flex items-center gap-1"><span className="text-primary font-bold">Fist</span> Toggle</div>
                    <div className="flex items-center gap-1"><span className="text-primary font-bold">Pinch</span> Click</div>
                </div>
            </div>

            <AnimatePresence>
                {cursorActive && (
                    <>
                        {trail.map((t, i) => (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0.5, scale: 0.8 }}
                                animate={{ opacity: 0, scale: 0.2 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="fixed pointer-events-none z-[9999] w-4 h-4 rounded-full bg-primary blur-sm"
                                style={{
                                    left: t.x,
                                    top: t.y,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            />
                        ))}
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
                                <div className={`w-8 h-8 rounded-full border-2 transition-colors duration-200 flex items-center justify-center
                                    ${gestureStatus === 'CLICKING' ? 'border-primary bg-primary/20' : 'border-white'}
                                `}>
                                    <div className={`w-1 h-1 bg-white rounded-full ${gestureStatus === 'CLICKING' ? 'bg-primary' : ''}`}></div>
                                </div>

                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-[1px] bg-white/50"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-[1px] bg-white/50"></div>
                            </div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

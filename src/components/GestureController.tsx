import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { FilesetResolver, HandLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';

export const GestureController = () => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
    const [webcamEnabled, setWebcamEnabled] = useState(false);
    const [gestureStatus, setGestureStatus] = useState<'IDLE' | 'SCROLL UP' | 'SCROLL DOWN' | 'STOP'>('IDLE');

    // Initialize HandLandmarker
    useEffect(() => {
        const initMediapipe = async () => {
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

            setHandLandmarker(landmarker);
            // Ask for permission immediately
            setWebcamEnabled(true);
        };

        initMediapipe();
    }, []);

    // Frame Loop
    useEffect(() => {
        let animationFrameId: number;
        let lastVideoTime = -1;

        const detectHands = () => {
            if (webcamRef.current && webcamRef.current.video && handLandmarker && canvasRef.current) {
                const video = webcamRef.current.video;
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');

                if (video.videoWidth > 0 && video.currentTime !== lastVideoTime) {
                    lastVideoTime = video.currentTime;

                    // Adjust canvas to video
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    const results = handLandmarker.detectForVideo(video, performance.now());

                    if (ctx) {
                        ctx.save();
                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                        // Draw visual guide lines for zones
                        const topZone = canvas.height * 0.3;
                        const bottomZone = canvas.height * 0.7;

                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(0, topZone);
                        ctx.lineTo(canvas.width, topZone);
                        ctx.moveTo(0, bottomZone);
                        ctx.lineTo(canvas.width, bottomZone);
                        ctx.stroke();

                        if (results.landmarks) {
                            const drawingUtils = new DrawingUtils(ctx);
                            for (const landmarks of results.landmarks) {
                                drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 3 });
                                drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 1 });

                                // Logic: Use Index Finger Tip (Index 8) or Wrist (Index 0) Y position
                                // Y is normalized [0, 1] (0 is top)
                                const y = landmarks[9].y; // Middle finger knuckle (more stable center)

                                if (y < 0.3) {
                                    setGestureStatus('SCROLL UP');
                                    window.scrollBy({ top: -15, behavior: 'auto' });
                                } else if (y > 0.7) {
                                    setGestureStatus('SCROLL DOWN');
                                    window.scrollBy({ top: 15, behavior: 'auto' });
                                } else {
                                    setGestureStatus('STOP');
                                }
                            }
                            if (results.landmarks.length === 0) {
                                setGestureStatus('IDLE');
                            }
                        }
                        ctx.restore();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(detectHands);
        };

        if (webcamEnabled) {
            detectHands();
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [handLandmarker, webcamEnabled]);

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2 pointer-events-none">
            <div className="bg-dark/80 backdrop-blur-sm p-3 rounded-lg border border-white/10 text-xs font-bold uppercase tracking-widest text-white mb-2">
                Gesture: <span className="text-primary">{gestureStatus}</span>
            </div>

            <div className="relative w-48 h-36 rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl bg-black">
                {webcamEnabled && (
                    <>
                        <Webcam
                            ref={webcamRef}
                            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" // Mirror
                            audio={false}
                            width={320}
                            height={240}
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" // Mirror to match video
                        />
                    </>
                )}
                {!webcamEnabled && <div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs">OFF</div>}
            </div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">
                Hand High: Up | Hand Low: Down
            </p>
        </div>
    );
}

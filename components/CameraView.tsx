
import React, { useRef, useEffect, useState, useCallback } from 'react';
import CameraIcon from './icons/CameraIcon';

interface CameraViewProps {
    onCapture: (imageData: string) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const startCamera = async () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: "user",
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    } 
                });
                if (isMounted) {
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                    setStream(mediaStream);
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                if (isMounted) {
                    setError("Could not access the camera. Please check permissions in your browser settings and refresh the page.");
                }
            }
        };

        startCamera();

        return () => {
            isMounted = false;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCaptureClick = useCallback(() => {
        if (videoRef.current && videoRef.current.readyState >= 3) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                onCapture(dataUrl);
            }
        }
    }, [onCapture]);
    
    if (error) {
        return <div className="flex items-center justify-center h-full text-red-400 text-center p-4">{error}</div>;
    }

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-black rounded-xl">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain rounded-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center z-10">
                <button
                    onClick={handleCaptureClick}
                    disabled={!stream}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-gray-300 hover:border-teal-400 transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl"
                    aria-label="Capture photo"
                >
                    <CameraIcon className="w-10 h-10 text-gray-800" />
                </button>
            </div>
        </div>
    );
};

export default CameraView;

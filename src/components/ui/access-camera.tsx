import React, { useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';

interface AccessCameraProps {
    onCapture: (file: File) => void;
    onClose: () => void;
}

export const AccessCamera: React.FC<AccessCameraProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string>('');

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setError('');
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError('No se pudo acceder a la cámara. Por favor verifica los permisos.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    React.useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const capturePhoto = useCallback(() => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                        onCapture(file);
                        stopCamera();
                    }
                }, 'image/jpeg', 0.8);
            }
        }
    }, [onCapture]);

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
            <div className="absolute top-4 right-4 z-10">
                <button onClick={() => { stopCamera(); onClose(); }} className="p-2 bg-gray-800 text-[#0A0A0A] rounded-full">
                    <X size={24} />
                </button>
            </div>

            {error ? (
                <div className="text-[#0A0A0A] p-4 text-center">
                    <p>{error}</p>
                    <button onClick={startCamera} className="mt-4 px-4 py-2 bg-green-600 rounded">Reintentar</button>
                </div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-8 flex gap-4">
                        <button
                            onClick={capturePhoto}
                            className="p-4 bg-white rounded-full shadow-lg hover:scale-105 transition-transform"
                        >
                            <div className="w-16 h-16 border-4 border-green-500 rounded-full bg-white"></div>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

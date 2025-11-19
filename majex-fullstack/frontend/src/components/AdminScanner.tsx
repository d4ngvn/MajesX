
import React, { useEffect, useRef, useState } from 'react';
import { ScanLine, CheckCircle, XCircle, Camera, RefreshCw, AlertTriangle } from 'lucide-react';
import { Booking } from '../types';

interface AdminScannerProps {
  onVerify: (qrData: string) => { valid: boolean; message: string; booking?: Booking };
}

export const AdminScanner: React.FC<AdminScannerProps> = ({ onVerify }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [result, setResult] = useState<{ valid: boolean; message: string; booking?: Booking } | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    const video = videoRef.current;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        
        if (video) {
          video.srcObject = stream;
          // Wait for video to be ready
          video.setAttribute("playsinline", "true"); // required to tell iOS safari we don't want fullscreen
          video.play();
          requestAnimationFrame(tick);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please ensure permissions are granted.");
        setLoading(false);
      }
    };

    const tick = () => {
      if (!isScanning) return;
      
      if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Use global jsQR from CDN
          // @ts-ignore
          const code = window.jsQR ? window.jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          }) : null;

          if (code) {
            handleScan(code.data);
            return; // Stop loop
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    if (isScanning && !result) {
      startCamera();
    } else {
      // Stop camera if not scanning
      if (video && video.srcObject) {
         const stream = video.srcObject as MediaStream;
         stream.getTracks().forEach(track => track.stop());
      }
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScanning, result]);

  const handleScan = (data: string) => {
    setIsScanning(false);
    // Verify logic
    const verificationResult = onVerify(data);
    setResult(verificationResult);
  };

  const resetScanner = () => {
    setResult(null);
    setIsScanning(true);
    setError('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">QR Access Verification</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {!result ? (
          <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
            {loading && (
               <div className="text-white flex flex-col items-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p>Starting Camera...</p>
               </div>
            )}
            
            {error && (
                <div className="text-white text-center p-6 bg-red-900/50 w-full h-full flex flex-col items-center justify-center">
                    <AlertTriangle className="w-12 h-12 mb-4 text-red-400" />
                    <p>{error}</p>
                </div>
            )}

            <video 
                ref={videoRef} 
                className={`absolute inset-0 w-full h-full object-cover ${!isScanning ? 'hidden' : ''}`} 
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {isScanning && !loading && !error && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-2 border-white/50 rounded-lg relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 -mt-1 -ml-1 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 -mt-1 -mr-1 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 -mb-1 -ml-1 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 -mb-1 -mr-1 rounded-br-lg"></div>
                        <div className="absolute inset-0 bg-indigo-500/10 animate-pulse"></div>
                    </div>
                    <p className="absolute bottom-8 text-white/80 bg-black/40 px-4 py-1 rounded-full text-sm backdrop-blur-sm">
                        Align QR code within frame
                    </p>
                </div>
            )}
          </div>
        ) : (
          <div className={`p-8 text-center ${result.valid ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 ${result.valid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {result.valid ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>
            
            <h3 className={`text-2xl font-bold mb-2 ${result.valid ? 'text-green-800' : 'text-red-800'}`}>
                {result.valid ? 'Access Granted' : 'Access Denied'}
            </h3>
            <p className={`text-lg mb-6 ${result.valid ? 'text-green-700' : 'text-red-700'}`}>
                {result.message}
            </p>

            {result.booking && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-sm mx-auto text-left mb-6">
                    <div className="space-y-3">
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-500 text-sm">Resident</span>
                            <span className="font-bold text-slate-800">{result.booking.userName}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-500 text-sm">Facility</span>
                            <span className="font-bold text-slate-800">{result.booking.facilityName}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span className="text-slate-500 text-sm">Date</span>
                            <span className="font-bold text-slate-800">{new Date(result.booking.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">Time Slot</span>
                            <span className="font-bold text-slate-800">{result.booking.timeSlot}</span>
                        </div>
                    </div>
                </div>
            )}

            <button 
                onClick={resetScanner}
                className="px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium flex items-center justify-center gap-2 mx-auto"
            >
                <RefreshCw className="w-4 h-4" /> Scan Next
            </button>
          </div>
        )}
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex gap-3 items-start">
         <Camera className="w-5 h-5 text-indigo-600 mt-0.5" />
         <div>
            <h4 className="font-bold text-indigo-900 text-sm">Usage Instructions</h4>
            <p className="text-sm text-indigo-700 mt-1">
                Point the camera at a resident's booking QR code. The system will automatically verify if the booking is valid for today and the correct facility.
            </p>
         </div>
      </div>
    </div>
  );
};

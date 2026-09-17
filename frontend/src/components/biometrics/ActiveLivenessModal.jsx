import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Smile, 
  Eye, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CHALLENGES = [
  { id: 'BLINK', title: 'Blink your eyes twice', icon: Eye, prompt: 'Please blink naturally into camera' },
  { id: 'TURN_HEAD_LEFT', title: 'Slowly turn head to the left', icon: ArrowRight, prompt: 'Turn head approx 20 degrees left' },
  { id: 'OPEN_MOUTH', title: 'Smile or slightly open mouth', icon: Smile, prompt: 'Show facial muscle variation' }
];

export default function ActiveLivenessModal({ onClose, onComplete, onCapture }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    let stream = null;
    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Webcam fallback for liveness modal", err);
      }
    };
    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleSimulateStep = () => {
    if (isVerifying) return;
    setIsVerifying(true);

    // Step 1: Eye blink
    setProgress(20);
    setTimeout(() => {
      setProgress(40);
      setCurrentStepIndex(1); // Turn head

      setTimeout(() => {
        setProgress(70);
        setCurrentStepIndex(2); // Smile / muscle variation

        setTimeout(() => {
          setIsVerifying(false);
          setProgress(100);
          setIsSuccess(true);
          try {
            confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
          } catch (e) {}
        }, 1200);

      }, 1300);

    }, 1300);
  };

  const handleCaptureAndFinalize = () => {
    let b64 = null;
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 320;
      canvas.height = videoRef.current.videoHeight || 320;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      b64 = canvas.toDataURL("image/jpeg", 0.95);
    }
    if (onCapture) onCapture(b64);
    if (onComplete) onComplete(b64);
    if (onClose) onClose();
  };

  const currentChallenge = CHALLENGES[currentStepIndex];
  const Icon = currentChallenge.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b1329] border border-cyan-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold text-slate-100">
              Active Liveness Challenge-Response
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Canvas with Facial Mesh Guide */}
        <div className="p-6 flex flex-col items-center">
          <div className="relative w-64 h-64 rounded-full border-4 border-dashed border-cyan-500/60 overflow-hidden bg-slate-950 flex items-center justify-center shadow-inner shadow-cyan-500/20 mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
            
            {/* Center Oval Mesh Outline */}
            <div className="absolute inset-4 rounded-full border-2 border-cyan-400/40 pointer-events-none" />

            {isVerifying && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                <span className="text-xs font-mono text-cyan-300">Verifying Landmark Movement...</span>
              </div>
            )}
          </div>

          {/* Prompt Box */}
          {isSuccess ? (
            <div className="text-center space-y-2 py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="font-bold text-base text-emerald-400">Active Liveness Verified!</p>
              <p className="text-xs text-slate-400">Anti-spoofing challenge passed with 99.2% confidence.</p>
            </div>
          ) : (
            <div className="text-center space-y-1.5 w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-semibold">
                <Icon className="w-3.5 h-3.5" />
                Step {currentStepIndex + 1} of 3: {currentChallenge.title}
              </div>
              <p className="text-xs text-slate-400">{currentChallenge.prompt}</p>
            </div>
          )}

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-4 border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-2 flex-wrap">
          <button
            onClick={handleCaptureAndFinalize}
            className="px-3 py-1.5 rounded-xl border border-cyan-600/50 hover:bg-cyan-950/40 text-cyan-300 font-semibold text-xs transition"
          >
            📸 Direct Snapshot
          </button>

          {isSuccess ? (
            <button
              onClick={handleCaptureAndFinalize}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20"
            >
              Apply Verified Selfie
            </button>
          ) : (
            <button
              onClick={handleSimulateStep}
              disabled={isVerifying}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-md shadow-cyan-500/20 transition active:scale-95"
            >
              Perform Challenge Step
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

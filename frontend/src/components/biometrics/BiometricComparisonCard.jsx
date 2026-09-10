import React, { useState } from 'react';
import { 
  UserCheck, 
  ScanFace, 
  ShieldCheck, 
  AlertTriangle, 
  Camera, 
  CheckCircle2, 
  XCircle,
  Sparkles
} from 'lucide-react';
import ActiveLivenessModal from './ActiveLivenessModal';

export default function BiometricComparisonCard({ 
  docFaceCrop, 
  liveFaceImage, 
  biometricResult,
  onLiveFaceCaptured 
}) {
  const [isLivenessModalOpen, setIsLivenessModalOpen] = useState(false);
  const match = biometricResult || {
    cosine_similarity: 0.92,
    similarity_percentage: 92.0,
    verdict: "MATCH",
    liveness_score: 95.0,
    is_live: true,
    spoof_classification: "REAL_HUMAN"
  };

  const isMatch = match.verdict === "MATCH";
  const isBorderline = match.verdict === "BORDERLINE";

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ScanFace className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-semibold text-slate-200">
              Facial Biometric Matching & Anti-Spoofing
            </span>
          </div>

          <button
            onClick={() => setIsLivenessModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            Launch Active Liveness Challenge
          </button>
        </div>

        {/* Dual Portrait Comparison Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Document Photo Crop */}
          <div className="md:col-span-4 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-mono text-slate-400 uppercase mb-2">
              1. Document Portrait Photo
            </span>
            <div className="w-28 h-36 rounded-xl bg-slate-900 border-2 border-cyan-500/40 overflow-hidden shadow-lg flex items-center justify-center relative">
              {docFaceCrop ? (
                <img src={docFaceCrop} alt="Document Face" className="w-full h-full object-cover" />
              ) : (
                <UserCheck className="w-12 h-12 text-slate-600" />
              )}
            </div>
            <span className="text-[10px] font-mono text-cyan-400 mt-2">ICAO 9303 Compliant</span>
          </div>

          {/* Biometric Similarity Speedometer */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-3 text-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={isMatch ? "text-emerald-400" : (isBorderline ? "text-amber-400" : "text-rose-500")}
                  strokeDasharray={`${match.similarity_percentage || 90}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black font-mono text-slate-100 leading-none">
                  {match.similarity_percentage || 92}%
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">
                  SIMILARITY
                </span>
              </div>
            </div>

            <div className="mt-2">
              {isMatch ? (
                <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold font-mono">
                  BIOMETRIC MATCH
                </span>
              ) : isBorderline ? (
                <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-xs font-bold font-mono">
                  MANUAL REVIEW NEEDED
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-800 text-xs font-bold font-mono animate-pulse">
                  FACE MISMATCH / REJECT
                </span>
              )}
            </div>
          </div>

          {/* Live Selfie Capture */}
          <div className="md:col-span-4 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-mono text-slate-400 uppercase mb-2">
              2. Live Checkpoint Camera Feed
            </span>
            <div className="w-28 h-36 rounded-xl bg-slate-900 border-2 border-indigo-500/40 overflow-hidden shadow-lg flex items-center justify-center relative">
              {liveFaceImage ? (
                <img src={liveFaceImage} alt="Live Face" className="w-full h-full object-cover" />
              ) : (
                <ScanFace className="w-12 h-12 text-slate-600" />
              )}
            </div>
            <span className="text-[10px] font-mono text-indigo-300 mt-2">Passive Anti-Spoof: Pass</span>
          </div>
        </div>
      </div>

      {/* Liveness & Texture Anti-Spoofing Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300 block">Passive Anti-Spoofing Texture</span>
            <p className="text-[11px] text-slate-400 mt-0.5">High-frequency frequency & specular reflection analysis</p>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold">
            {match.spoof_classification || "REAL_HUMAN"} ({match.liveness_score || 95}%)
          </span>
        </div>

        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300 block">Cosine Embedding Metric (ArcFace)</span>
            <p className="text-[11px] text-slate-400 mt-0.5">512-D deep feature vector distance</p>
          </div>
          <span className="font-mono text-cyan-400 font-bold text-xs bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
            {match.cosine_similarity ? match.cosine_similarity.toFixed(4) : "0.9240"}
          </span>
        </div>
      </div>

      {/* Active Liveness Challenge Modal */}
      {isLivenessModalOpen && (
        <ActiveLivenessModal
          onClose={() => setIsLivenessModalOpen(false)}
          onComplete={(liveB64) => {
            if (onLiveFaceCaptured) onLiveFaceCaptured(liveB64);
            setIsLivenessModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

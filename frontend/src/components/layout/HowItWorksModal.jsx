import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Scan, 
  Binary, 
  Layers, 
  UserCheck, 
  ShieldAlert, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';

const PIPELINE_STEPS = [
  {
    step: "01",
    title: "Document Ingestion & Edge Quality Gate",
    badge: "Optical Telemetry",
    icon: Scan,
    color: "cyan",
    summary: "Captures passport scan, applies 4-point homography rectification, and measures edge sharpness (Laplacian variance) & specular glare to ensure ICAO optical legibility.",
    tech: "Laplacian Variance > 80 | Tenengrad Focus Energy | Specular Glare < 8%"
  },
  {
    step: "02",
    title: "ICAO Doc 9303 MRZ Cryptographic Checksums",
    badge: "Checksum Engine",
    icon: Binary,
    color: "sky",
    summary: "Parses Machine Readable Zone (MRZ TD3/TD1), extracts holder details, and mathematically verifies 7-3-1 weight sum modulo 10 check digits for Doc#, DOB, Expiry, and Composite.",
    tech: "7-3-1 Weight Sum Modulo 10 | ICAO TD3 Format | Strict Field Reconciliation"
  },
  {
    step: "03",
    title: "Multi-Spectral Forensic Tamper Heatmaps",
    badge: "Spectral Forensics",
    icon: Layers,
    color: "purple",
    summary: "Simultaneously evaluates 6 physical and digital tamper layers: Error Level Analysis (ELA recompression), Spatial Rich Model (SRM noise), 2D FFT Moiré screen detection, Copy-Move keypoint matching, and JPEG Ghost analysis.",
    tech: "ELA Compression Residuals | SRM 30-Filter Bank | 2D FFT Frequency Peaks | ORB Match"
  },
  {
    step: "04",
    title: "ArcFace Facial Biometrics & Anti-Spoofing",
    badge: "Biometrics & PAD",
    icon: UserCheck,
    color: "emerald",
    summary: "Compares document portrait crop against live checkpoint selfie using 512-D deep embeddings (ArcFace cosine similarity) with ISO/IEC 30107-3 compliant passive texture and active challenge liveness.",
    tech: "512-D Cosine Metric > 0.65 Match | High-Freq Texture PAD | 3-Step Active Challenge"
  },
  {
    step: "05",
    title: "Interpol & Watchlist Intelligence Cross-Check",
    badge: "Watchlist Registry",
    icon: ShieldAlert,
    color: "rose",
    summary: "Performs real-time sub-millisecond querying against active Interpol Red Notices, stolen/lost passport databases (SLTD), and travel ban registries.",
    tech: "O(1) Indexed In-Memory Cache | Fuzzy Name Levenshtein Matching | Severity Hard-Stops"
  },
  {
    step: "06",
    title: "Explainable Risk Engine & SHA-256 Merkle Ledger",
    badge: "Audit & Ledger",
    icon: Lock,
    color: "amber",
    summary: "Fuses all multi-modal signals into a deterministic 0-100 risk score with plain-English officer explanations, sealing the inspection result in an immutable SHA-256 Merkle blockchain block.",
    tech: "Multi-Factor Weighted Scoring | Hard-Stop Rules | Cryptographic Merkle Anchoring"
  }
];

export default function HowItWorksModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#0a1024] border border-cyan-500/40 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 bg-[#0c142c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                AEGIS-ID Screening Grid — System Architecture & How It Works
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-modal AI-assisted document authentication, forensics & identity verification pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Intro Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/30 border border-cyan-500/30 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-slate-100">
                How AEGIS-ID Intercepts Counterfeits & Identity Fraud:
              </p>
              <p className="text-slate-400 leading-relaxed">
                Traditional checkpoint scanners rely purely on visual inspection or simple barcode reads. AEGIS-ID processes every document through a 6-stage multi-modal pipeline combining physical optical checks, cryptographic checksum verification, forensic spectral heatmaps, deep biometric facial embeddings, and live watchlist intelligence.
              </p>
            </div>
          </div>

          {/* 6 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PIPELINE_STEPS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center">
                        {item.step}
                      </span>
                      <span className="text-sm font-bold text-slate-200">{item.title}</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
                      {item.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[10px] font-mono text-cyan-300/90">
                    <span className="text-slate-500 block mb-0.5 font-sans uppercase font-bold text-[9px]">ENGINE SPEC:</span>
                    {item.tech}
                  </div>
                </div>
              );
            })}
          </div>

          {/* How To Test in Demo Mode */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> How to Test & Demo Different Scenarios
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300 pt-1">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-emerald-400 block mb-1">1. Authentic Passports</span>
                <p className="text-slate-400 text-[11px]">Click "Authentic Passport" vector to see how genuine ICAO checksums, clean ELA heatmaps, and biometric matches produce a 95+ score.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-rose-400 block mb-1">2. Tampered & Forged</span>
                <p className="text-slate-400 text-[11px]">Select "Altered Expiry" or "Fake MRZ" to see ELA thermal heatmaps highlight edited digits and mathematical check sums fail.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="font-bold text-purple-400 block mb-1">3. Screen Replay & Watchlist</span>
                <p className="text-slate-400 text-[11px]">Select "Screen Recapture" to see 2D FFT Moiré detection, or "Interpol Blacklist" to see immediate security hard-stops.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0c142c] flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Compliant with ICAO 9303, ISO/IEC 19794-5 & ISO/IEC 30107-3
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
          >
            Got It, Launch Screening
          </button>
        </div>
      </div>
    </div>
  );
}

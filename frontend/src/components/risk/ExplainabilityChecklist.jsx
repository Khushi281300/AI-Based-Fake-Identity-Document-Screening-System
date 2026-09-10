import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle,
  Sliders,
  Scale
} from 'lucide-react';

export default function ExplainabilityChecklist({ factorBreakdown }) {
  const factors = factorBreakdown || {
    document_quality: { score: 92.0, weight: "10%", status: "PASS" },
    mrz_integrity: { score: 100.0, weight: "20%", status: "PASS" },
    forensic_integrity: { score: 95.0, weight: "25%", status: "PASS" },
    biometric_verification: { score: 92.0, weight: "25%", status: "PASS" },
    database_watchlist: { score: 100.0, weight: "20%", status: "PASS" }
  };

  const factorItems = [
    {
      id: 'quality',
      title: '1. Document Physical & Optical Quality',
      key: 'document_quality',
      weight: '10%',
      desc: 'Evaluates Laplacian sharpness, edge blur, and laminate specular reflections.'
    },
    {
      id: 'mrz',
      title: '2. ICAO 9303 MRZ & Check-Digit Integrity',
      key: 'mrz_integrity',
      weight: '20%',
      desc: 'Mathematical verification of 7-3-1 weight check sums across doc#, DOB, and expiry.'
    },
    {
      id: 'forensics',
      title: '3. Multi-Layer Forensics & Tamper Analysis',
      key: 'forensic_integrity',
      weight: '25%',
      desc: 'Fused scores across ELA recompression, SRM noise, copy-move, and 2D FFT Moire.'
    },
    {
      id: 'biometrics',
      title: '4. Biometric Face Match & Active Liveness',
      key: 'biometric_verification',
      weight: '25%',
      desc: 'ArcFace 512-D cosine similarity and ISO 30107-3 anti-spoof challenge response.'
    },
    {
      id: 'database',
      title: '5. Watchlist & Identity Graph Cross-Check',
      key: 'database_watchlist',
      weight: '20%',
      desc: 'Real-time blacklist matching and cross-identity vector duplicate detection.'
    }
  ];

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-semibold text-slate-200">
            Explainable Decision Tree & Factor Weights
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Weighted Multi-Signal Model
        </span>
      </div>

      <div className="space-y-3">
        {factorItems.map((item) => {
          const factorData = factors[item.key] || { score: 90, status: "PASS" };
          const isPass = factorData.status === "PASS";
          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                isPass
                  ? 'bg-slate-900/50 border-slate-800'
                  : 'bg-rose-950/20 border-rose-800/60'
              }`}
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">{item.title}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400">
                    Weight: {item.weight}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">{item.desc}</p>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-100 block">
                    {factorData.score} / 100
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      isPass ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPass ? 'PASSED' : 'FLAGGED'}
                  </span>
                </div>

                {isPass ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

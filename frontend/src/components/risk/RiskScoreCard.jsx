import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  XOctagon, 
  CheckCircle2, 
  HelpCircle,
  FileCheck,
  Award
} from 'lucide-react';

export default function RiskScoreCard({ riskEvaluation, onGenerateCertificate }) {
  const evalData = riskEvaluation || {
    outcome: "VERIFIED",
    overall_risk_score: 95.5,
    confidence_score: 98.2,
    recommendation: "DOCUMENT AUTHENTICATED. Proceed with entry authorization.",
    critical_failures: [],
    warning_flags: []
  };

  const outcome = evalData.outcome || "VERIFIED";
  const score = evalData.overall_risk_score || 95;

  const isVerified = outcome === "VERIFIED";
  const isReview = outcome === "MANUAL_REVIEW";
  const isRejected = outcome === "REJECTED";

  return (
    <div className="space-y-4">
      {/* Hero Decision Outcome Banner */}
      <div
        className={`glass-panel p-6 border-2 transition-all duration-300 ${
          isVerified
            ? 'border-emerald-500/50 bg-emerald-950/20 shadow-emerald-500/10'
            : isReview
            ? 'border-amber-500/50 bg-amber-950/20 shadow-amber-500/10'
            : 'border-rose-500/60 bg-rose-950/30 shadow-rose-500/20'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-2xl ${
                isVerified
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : isReview
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-rose-500/20 border-rose-400 text-rose-300 animate-pulse'
              }`}
            >
              {isVerified ? (
                <ShieldCheck className="w-9 h-9" />
              ) : isReview ? (
                <AlertTriangle className="w-9 h-9" />
              ) : (
                <XOctagon className="w-9 h-9" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-black tracking-tight text-white font-mono">
                  {outcome === "VERIFIED" && "VERIFIED — ACCESS GRANTED"}
                  {outcome === "MANUAL_REVIEW" && "MANUAL REVIEW REQUIRED"}
                  {outcome === "REJECTED" && "REJECTED — FRAUD DETECTED"}
                </h2>
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                    isVerified
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : isReview
                      ? 'bg-amber-950 text-amber-300 border-amber-700'
                      : 'bg-rose-950 text-rose-300 border-rose-700'
                  }`}
                >
                  Score: {score} / 100
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {evalData.recommendation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onGenerateCertificate}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition"
            >
              <FileCheck className="w-4 h-4 text-cyan-400" />
              Generate Verifiable Receipt
            </button>
          </div>
        </div>
      </div>

      {/* Critical Failures / Warnings if any */}
      {evalData.critical_failures && evalData.critical_failures.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-rose-300">
            <XOctagon className="w-4 h-4 text-rose-400" />
            <span>Critical Security Violations (Hard-Stop Triggers):</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-2 text-rose-200/90 font-mono">
            {evalData.critical_failures.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {evalData.warning_flags && evalData.warning_flags.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Inspection Warnings & Advisories:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-2 text-amber-200/90 font-mono">
            {evalData.warning_flags.map((warn, idx) => (
              <li key={idx}>{warn}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Shield, Radio, Activity, User, Bell, CheckCircle2 } from 'lucide-react';

export default function Navbar({ activeTab, onSelectTab, systemStatus = "ONLINE" }) {
  return (
    <header className="border-b border-slate-800/80 bg-[#0a0f1d]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
      {/* Brand Identity */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300">
              AEGIS-ID
            </span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-semibold tracking-wide">
              ICAO 9303 v2.4
            </span>
          </div>
          <p className="text-xs text-slate-400">AI-Assisted Border Document & Identity Screening Grid</p>
        </div>
      </div>

      {/* Checkpoint Status Indicator */}
      <div className="hidden md:flex items-center gap-6 text-xs">
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
          <span className="text-slate-400 font-mono">CHECKPOINT:</span>
          <span className="text-cyan-400 font-semibold font-mono">BOMBAY-INTL-T2-E4</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-slate-400">GRID STATUS:</span>
          <span className="text-emerald-400 font-semibold">{systemStatus}</span>
        </div>

        <div className="flex items-center gap-2.5 pl-4 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-mono font-bold text-xs">
            742
          </div>
          <div className="text-left">
            <p className="text-slate-200 font-medium leading-none">Officer K. Sharma</p>
            <p className="text-[10px] text-slate-400 leading-none mt-1">Immigration Control</p>
          </div>
        </div>
      </div>
    </header>
  );
}

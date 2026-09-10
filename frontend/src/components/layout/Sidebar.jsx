import React from 'react';
import { 
  Scan, 
  Layers, 
  Binary, 
  UserCheck, 
  ShieldAlert, 
  BarChart3, 
  FileCheck2,
  Cpu
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab }) {
  const navItems = [
    { id: 'scanner', label: 'Document Screening', icon: Scan, badge: 'Live' },
    { id: 'forensics', label: 'Forensic Layers', icon: Layers },
    { id: 'mrz', label: 'MRZ & ICAO Engine', icon: Binary },
    { id: 'biometrics', label: 'Biometrics & Liveness', icon: UserCheck },
    { id: 'watchlist', label: 'Watchlist & Graph', icon: ShieldAlert },
    { id: 'analytics', label: 'Checkpoint Analytics', icon: BarChart3 },
    { id: 'audit', label: 'Blockchain Audit Ledger', icon: FileCheck2 }
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#080d1a]/80 backdrop-blur-lg flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-1.5">
        <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Screening Modules
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Hardware / Engine Status Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Edge Inference Engine
          </span>
          <span className="text-[10px] font-mono text-emerald-400">ONNX / CUDA</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full w-[24%]" />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>Latency: 18ms</span>
          <span>FPS: 30.0</span>
        </div>
      </div>
    </aside>
  );
}

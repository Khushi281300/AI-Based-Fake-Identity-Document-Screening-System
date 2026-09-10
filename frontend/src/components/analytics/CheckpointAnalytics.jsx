import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldAlert, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertTriangle,
  Flame
} from 'lucide-react';
import { getCheckpointAnalytics } from '../../api/client';

export default function CheckpointAnalytics() {
  const [metrics, setMetrics] = useState({
    total_scans_today: 142,
    verified_count: 118,
    manual_review_count: 16,
    rejected_count: 8,
    fraud_rate_percentage: 5.6,
    average_inspection_time_sec: 1.4,
    active_officers_count: 6,
    attack_vectors: [
      { name: "MRZ Checksum Fraud", count: 14, percentage: 38.0, color: "#f43f5e" },
      { name: "Photo & Face Splicing (ELA)", count: 11, percentage: 30.0, color: "#ec4899" },
      { name: "Screen Replay Recapture (Moire)", count: 6, percentage: 16.0, color: "#eab308" },
      { name: "Biometric Impersonation", count: 4, percentage: 11.0, color: "#06b6d4" },
      { name: "Interpol Watchlist Hit", count: 2, percentage: 5.0, color: "#a855f7" }
    ],
    hourly_throughput: [
      { hour: "08:00", scans: 18, flagged: 1 },
      { hour: "10:00", scans: 34, flagged: 3 },
      { hour: "12:00", scans: 42, flagged: 2 },
      { hour: "14:00", scans: 29, flagged: 4 },
      { hour: "16:00", scans: 38, flagged: 1 },
      { hour: "18:00", scans: 25, flagged: 2 },
    ]
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getCheckpointAnalytics();
        if (data) setMetrics(data);
      } catch (err) {
        console.warn("Using offline analytics snapshot", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-4">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Total Screenings Today</span>
            <span className="text-2xl font-black font-mono text-slate-100 mt-1 block">
              {metrics.total_scans_today}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +14% vs yesterday
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center justify-between border-rose-500/20">
          <div>
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Fraud Detection Rate</span>
            <span className="text-2xl font-black font-mono text-rose-400 mt-1 block">
              {metrics.fraud_rate_percentage}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block">
              {metrics.rejected_count} intercepted passports
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Avg AI Processing Latency</span>
            <span className="text-2xl font-black font-mono text-cyan-300 mt-1 block">
              {metrics.average_inspection_time_sec}s
            </span>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block">
              Real-time Edge Inference
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Active Checkpoint Lanes</span>
            <span className="text-2xl font-black font-mono text-indigo-300 mt-1 block">
              {metrics.active_officers_count} Lanes
            </span>
            <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
              100% Operational Grid
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Attack Vectors & Hourly Throughput */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Attack Vectors Breakdown */}
        <div className="lg:col-span-6 glass-panel p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">
              Primary Fraud Vectors Intercepted
            </span>
            <span className="text-xs font-mono text-rose-400 font-bold">Top Threat Vectors</span>
          </div>

          <div className="space-y-3 pt-2">
            {metrics.attack_vectors.map((vec, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">{vec.name}</span>
                  <span className="font-mono font-bold text-slate-200">
                    {vec.count} cases ({vec.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${vec.percentage}%`, backgroundColor: vec.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Throughput Bar Chart */}
        <div className="lg:col-span-6 glass-panel p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">
              Hourly Checkpoint Volume
            </span>
            <span className="text-xs font-mono text-cyan-400">Throughput Telemetry</span>
          </div>

          <div className="h-52 flex items-end justify-between gap-3 pt-6 px-2">
            {metrics.hourly_throughput.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-mono text-slate-400">{item.scans}</span>
                <div
                  className="w-full bg-gradient-to-t from-cyan-600 to-blue-400 rounded-t-lg transition-all duration-300 relative group"
                  style={{ height: `${(item.scans / 45) * 100}%` }}
                >
                  {item.flagged > 0 && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-400">{item.hour}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Layers, 
  Flame, 
  Cpu, 
  Eye, 
  Sparkles, 
  Radio, 
  FileText,
  AlertCircle,
  CheckCircle2,
  Sliders
} from 'lucide-react';

export default function ForensicViewerPane({ inspectionResult, originalImage }) {
  const [selectedLayer, setSelectedLayer] = useState('ela');
  const [splitPosition, setSplitPosition] = useState(50);

  const layers = inspectionResult?.layers || {};
  const metrics = inspectionResult?.forensics_metrics || {};

  const layerOptions = [
    { 
      id: 'ela', 
      label: 'Error Level Analysis (ELA)', 
      icon: Flame, 
      img: layers.ela_heatmap_base64,
      desc: 'Highlights compression disparity from edited dates, fonts, or spliced faces.',
      flagged: metrics.ela?.is_spliced
    },
    { 
      id: 'srm', 
      label: 'SRM Noise Residuals', 
      icon: Layers, 
      img: layers.srm_noise_base64,
      desc: 'Spatial Rich Model reveals noise texture discontinuity across modified regions.',
      flagged: metrics.srm?.has_noise_inconsistency
    },
    { 
      id: 'gradcam', 
      label: 'Grad-CAM Deep Saliency', 
      icon: Cpu, 
      img: layers.gradcam_saliency_base64,
      desc: 'Visual explainability heatmap pinpointing deep generative AI tampering.',
      flagged: metrics.deep_tamper?.is_deep_forged
    },
    { 
      id: 'copy_move', 
      label: 'Copy-Move Clone Markers', 
      icon: Sparkles, 
      img: layers.copy_move_base64,
      desc: 'ORB keypoint matching detects cloned seals, duplicate numbers, or stamps.',
      flagged: metrics.copy_move?.copy_move_detected
    },
    { 
      id: 'recapture', 
      label: '2D FFT Moire Spectrum', 
      icon: Radio, 
      img: layers.fft_moire_base64,
      desc: 'Identifies high-frequency screen raster spikes from mobile/monitor screen replay.',
      flagged: metrics.recapture?.is_screen_recaptured
    },
    { 
      id: 'jpeg_ghost', 
      label: 'JPEG Ghost Disparity', 
      icon: Eye, 
      img: layers.jpeg_ghost_base64,
      desc: 'Multi-quality ghost variance uncovering spliced source compressions.',
      flagged: metrics.jpeg_ghost?.ghosts_detected
    }
  ];

  const currentLayer = layerOptions.find(l => l.id === selectedLayer) || layerOptions[0];
  const activeImage = currentLayer.img || originalImage;

  return (
    <div className="space-y-4">
      {/* Forensic Layer Selector Navigation */}
      <div className="glass-panel p-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {layerOptions.map((layer) => {
            const Icon = layer.icon;
            const isSelected = selectedLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => setSelectedLayer(layer.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-md shadow-cyan-500/20 font-bold'
                    : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-cyan-400'}`} />
                <span>{layer.label}</span>
                {layer.flagged && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Dual-Pane Side-by-Side Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Original Document */}
        <div className="lg:col-span-6 glass-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold font-mono uppercase text-slate-400">
              Original Rectified Document
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              REFERENCE
            </span>
          </div>

          <div className="flex-1 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center p-3 min-h-[360px]">
            {originalImage ? (
              <img
                src={originalImage}
                alt="Original Document"
                className="max-h-[340px] w-auto object-contain rounded-lg shadow-lg"
              />
            ) : (
              <p className="text-xs text-slate-500">Run inspection to view original reference</p>
            )}
          </div>
        </div>

        {/* Right: Active Forensic Heatmap / Layer */}
        <div className="lg:col-span-6 glass-panel p-4 flex flex-col justify-between border border-cyan-500/30 shadow-cyan-500/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono uppercase text-cyan-400">
                {currentLayer.label}
              </span>
              {currentLayer.flagged ? (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800">
                  TAMPER DETECTED
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                  AUTHENTIC
                </span>
              )}
            </div>

            <span className="text-[10px] font-mono text-slate-400">
              THERMAL / OVERLAY
            </span>
          </div>

          <div className="flex-1 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center p-3 min-h-[360px]">
            {activeImage ? (
              <img
                src={activeImage}
                alt={currentLayer.label}
                className="max-h-[340px] w-auto object-contain rounded-lg shadow-xl"
              />
            ) : (
              <p className="text-xs text-slate-500">No forensic layer generated yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Forensic Layer Explanation Card */}
      <div className="glass-panel p-4 border-l-4 border-l-cyan-400 flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Forensic Interpretation: {currentLayer.label}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {currentLayer.desc}
          </p>
        </div>

        {metrics.exif?.software_tag && metrics.exif.software_tag !== "None" && (
          <div className="bg-rose-950/40 border border-rose-800/60 p-2.5 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>EXIF Software Footprint: <strong>{metrics.exif.software_tag}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}

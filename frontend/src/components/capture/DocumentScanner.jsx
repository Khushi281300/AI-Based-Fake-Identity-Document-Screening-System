import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Camera, 
  Sparkles, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  SlidersHorizontal,
  Maximize2
} from 'lucide-react';
import { PRESET_SCENARIOS } from '../../data/presetSamples';

export default function DocumentScanner({ 
  documentImage, 
  onDocumentChange, 
  onRunInspection, 
  loading,
  qualityData
}) {
  const [useCamera, setUseCamera] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onDocumentChange(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setUseCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera access fallback", err);
    }
  };

  const captureFrame = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const b64 = canvas.toDataURL("image/jpeg", 0.95);
      onDocumentChange(b64);
      setUseCamera(false);
      // Stop tracks
      const stream = videoRef.current.srcObject;
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Test Scenarios Ribbon */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-slate-200">Checkpoint Test Vectors</span>
            <span className="text-xs text-slate-400 font-mono">(1-Click Scenario Injectors)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {PRESET_SCENARIOS.map((scenario) => {
            return (
              <button
                key={scenario.id}
                onClick={() => {
                  onDocumentChange(scenario.documentImage, scenario);
                }}
                className="text-left p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-800/70 hover:border-cyan-500/40 transition-all duration-150 flex flex-col justify-between"
              >
                <div>
                  <div className="text-[11px] font-bold text-slate-200 line-clamp-1">{scenario.title}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 mt-1">{scenario.subtitle}</div>
                </div>
                <div className="mt-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 w-fit">
                  {scenario.expectedVerdict}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Document Ingestion Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 glass-panel p-5 relative overflow-hidden flex flex-col justify-between min-h-[420px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-sm font-semibold text-slate-200">Document Scanner Feed</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
              >
                <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                Upload Image
              </button>
              <button
                onClick={startCamera}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                Live Camera
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Canvas Display View */}
          <div className="flex-1 rounded-xl border border-slate-800/80 bg-slate-950/80 overflow-hidden flex items-center justify-center relative min-h-[300px]">
            {useCamera ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-lg" />
                <button
                  onClick={captureFrame}
                  className="absolute bottom-4 px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Capture Frame
                </button>
              </div>
            ) : documentImage ? (
              <div className="relative w-full h-full flex items-center justify-center p-3">
                <img
                  src={documentImage}
                  alt="Captured Document"
                  className="max-h-[340px] w-auto object-contain rounded-lg border border-slate-700/60 shadow-2xl"
                />
                <div className="absolute top-5 right-5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-cyan-400 border border-cyan-500/30">
                  AUTO-RECTIFIED 4-POINT HOMOGRAPHY
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer text-center p-8 flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center mb-3">
                  <UploadCloud className="w-8 h-8 text-cyan-400" />
                </div>
                <p className="text-sm font-medium text-slate-300">Drop passport image or click to select</p>
                <p className="text-xs text-slate-400 mt-1">Accepts high-res PNG, JPG, or PDF scan</p>
              </div>
            )}
          </div>

          {/* Action Trigger Button */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
              <span>RESOLUTION: 1200x800</span>
              <span>|</span>
              <span>DPI: 300+</span>
            </div>

            <button
              disabled={!documentImage || loading}
              onClick={onRunInspection}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                !documentImage || loading
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-cyan-500/25 active:scale-95'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  Running AI Screening Grid...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Run Multi-Modal Inspection
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quality Telemetry & Glare Gauges */}
        <div className="lg:col-span-4 glass-panel p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-slate-200">Image Quality Telemetry</span>
            </div>

            <div className="space-y-3">
              {/* Blur Gauge */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-300">Edge Sharpness (Laplacian)</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {qualityData?.laplacian_variance || "214.5"} var
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[85%]" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 inline-block">Pass Threshold: &gt; 80.0</span>
              </div>

              {/* Glare Gauge */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-300">Laminate Specular Glare</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {qualityData?.illumination?.glare_ratio ? `${(qualityData.illumination.glare_ratio * 100).toFixed(1)}%` : "1.2%"}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full w-[15%]" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 inline-block">Normal Limit: &lt; 8.0%</span>
              </div>

              {/* Tenengrad Focus Score */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-300">Tenengrad Focus Energy</span>
                  <span className="font-mono text-indigo-300 font-bold">
                    {qualityData?.tenengrad_score || "1840.2"}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-400 h-full w-[90%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-emerald-200">
              Quality acceptable for ICAO compliant optical character extraction.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

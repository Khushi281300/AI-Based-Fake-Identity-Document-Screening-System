import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Camera, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { PRESET_SCENARIOS } from '../../data/presetSamples';

const STEPS = [
  'Checking image sharpness...',
  'Reading passport security lines...',
  'Checking for photo alterations...',
  'Matching facial features...',
  'Verifying alert databases...',
];

const SCENARIO_THEMES = {
  'VERIFIED':      { dot: '#4A8C5C', bg: '#F0F8F3', border: '#BCDCC7', text: '#3B734A', badge: 'Genuine' },
  'MANUAL_REVIEW': { dot: '#B66D26', bg: '#FFF6EC', border: '#F8D6B0', text: '#945318', badge: 'Check Twice' },
  'REJECTED':      { dot: '#D14966', bg: '#FEF1F3', border: '#F8BAC7', text: '#B0334E', badge: 'Fake / Altered' },
};

export default function DocumentScanner({ documentImage, onDocumentChange, onRunInspection, loading, qualityData, currentScenario }) {
  const fileInputRef = useRef(null);
  const videoRef     = useRef(null);
  const [camera, setCamera] = useState(false);
  const [step, setStep]     = useState(0);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => setStep(s => (s + 1) % STEPS.length), 650);
    return () => clearInterval(interval);
  }, [loading]);

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onDocumentChange(ev.target.result, null);
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {}
  };

  const capture = () => {
    const canvas = document.createElement('canvas');
    canvas.width  = videoRef.current?.videoWidth  || 640;
    canvas.height = videoRef.current?.videoHeight || 480;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    onDocumentChange(canvas.toDataURL('image/jpeg', 0.95), null);
    videoRef.current?.srcObject?.getTracks().forEach(track => track.stop());
    setCamera(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header with cursive/italic font */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{
            fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, cursive, serif',
            fontStyle: 'italic',
            fontSize: 28,
            color: '#2E1B24',
            fontWeight: 700,
          }}>
            Passport & ID Check
          </h1>
          <p style={{ fontSize: 13, color: '#846271', marginTop: 2 }}>
            Pick a test document below or upload a photo to verify authenticity instantly.
          </p>
        </div>
      </div>

      {/* ── Test Sample Cards ── */}
      <div className="card" style={{ padding: 18, background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p className="section-label">Quick Test Samples</p>
          <span style={{ color: '#B99DAA', fontFamily: '"Caveat", cursive', fontSize: 16 }}>
            tap any sample to test
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {PRESET_SCENARIOS.map(scenario => {
            const theme = SCENARIO_THEMES[scenario.expectedVerdict] || SCENARIO_THEMES['VERIFIED'];
            const active = currentScenario?.id === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => onDocumentChange(scenario.documentImage, scenario)}
                style={{
                  background: active ? theme.bg : '#FFFDFD',
                  border: `1.5px solid ${active ? theme.border : '#F7DFE6'}`,
                  borderRadius: 16,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s ease',
                  boxShadow: active ? `0 4px 14px ${theme.border}` : '0 1px 4px rgba(212,120,154,0.04)',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#FFF4F7'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = '#FFFDFD'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: theme.dot, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: theme.text, textTransform: 'uppercase' }}>
                    {theme.badge}
                  </span>
                </div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#2E1B24',
                  lineHeight: 1.3,
                  marginBottom: 3,
                }}>
                  {scenario.title}
                </div>
                <div style={{ fontSize: 11, color: '#846271', lineHeight: 1.35 }}>
                  {scenario.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Scan Area ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18, alignItems: 'start' }}>

        {/* Document Display Box */}
        <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{
                fontFamily: '"Cormorant Garamond", Georgia, cursive, serif',
                fontStyle: 'italic',
                fontSize: 20,
                color: '#2E1B24',
              }}>
                Document Preview
              </h3>
              {currentScenario && (
                <p style={{ fontSize: 11.5, color: '#D4789A', fontWeight: 600, marginTop: 1 }}>
                  Loaded: {currentScenario.title}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => fileInputRef.current?.click()}>
                <UploadCloud size={14} color="#D4789A" /> Upload
              </button>
              <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={startCamera}>
                <Camera size={14} color="#D4789A" /> Camera
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
            </div>
          </div>

          {/* Image Container */}
          <div
            onClick={() => !documentImage && fileInputRef.current?.click()}
            style={{
              minHeight: 280,
              borderRadius: 16,
              background: '#FFF8FA',
              border: '1.5px dashed #F3D0DC',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
              cursor: documentImage ? 'default' : 'pointer',
            }}
          >
            {camera ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 20 }}>
                <video ref={videoRef} autoPlay playsInline style={{ maxHeight: 250, borderRadius: 12, border: '1.5px solid #F3D0DC' }} />
                <button className="btn btn-primary" onClick={capture}>
                  <Camera size={14} /> Take Photo
                </button>
              </div>
            ) : documentImage ? (
              <>
                <img src={documentImage} alt="Passport document" style={{ maxHeight: 270, maxWidth: '100%', objectFit: 'contain', borderRadius: 12 }} />
                {loading && <div className="scan-line" />}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 36 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: '#FDEEF3', border: '1.5px dashed #F3D0DC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <UploadCloud size={22} color="#D4789A" />
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#2E1B24', marginBottom: 4 }}>
                  Drop an ID photo here
                </p>
                <p style={{ fontSize: 12, color: '#B99DAA' }}>
                  or click to browse
                </p>
              </div>
            )}

            {/* Live Step Tracker Pill */}
            {loading && (
              <div style={{
                position: 'absolute', bottom: 12, left: 14, right: 14,
                background: 'rgba(255, 255, 255, 0.96)', borderRadius: 14,
                border: '1.5px solid #F3D0DC', padding: '10px 16px',
                display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: '0 4px 16px rgba(212,120,154,0.14)',
              }}>
                <Loader2 size={16} color="#D4789A" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#2E1B24', fontWeight: 600 }}>{STEPS[step]}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary"
              disabled={!documentImage || loading}
              onClick={onRunInspection}
              style={{ padding: '12px 34px', fontSize: 14, borderRadius: 14 }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Checking Document...
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Run Verification
                </>
              )}
            </button>
          </div>
        </div>

        {/* Image Clarity Side Card */}
        <div className="card" style={{ padding: 18, background: '#FFFFFF' }}>
          <p className="section-label">Image Clarity</p>
          <p style={{ fontSize: 12, color: '#846271', marginBottom: 14, marginTop: -2 }}>
            Clear photos ensure higher accuracy.
          </p>

          {[
            { label: 'Sharpness', pct: 88, note: 'Text is clear and sharp' },
            { label: 'Glare Check', pct: 95, note: 'No bright reflections' },
            { label: 'Focus', pct: 92, note: 'Well-focused camera shot' },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#573B48' }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4A8C5C' }}>{item.pct}%</span>
              </div>
              <div className="progress">
                <div className="progress-fill" style={{ width: `${item.pct}%`, background: '#4A8C5C' }} />
              </div>
              <p style={{ fontSize: 10.5, color: '#B99DAA', marginTop: 3 }}>{item.note}</p>
            </div>
          ))}

          <div style={{
            marginTop: 10, padding: '10px 12px', borderRadius: 12,
            background: '#F0F8F3', border: '1px solid #BCDCC7',
            fontSize: 12, color: '#3B734A', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <CheckCircle2 size={15} color="#4A8C5C" style={{ flexShrink: 0 }} />
            <span>Image is ready for verification</span>
          </div>
        </div>

      </div>
    </div>
  );
}

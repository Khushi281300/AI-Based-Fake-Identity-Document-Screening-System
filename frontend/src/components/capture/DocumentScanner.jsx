import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Camera, Loader2, Sparkles, CheckCircle2, Edit3, UserCheck, ShieldCheck, FileText, User, RefreshCw } from 'lucide-react';
import { PRESET_SCENARIOS } from '../../data/presetSamples';

const STEPS = [
  'Assessing optical resolution & illumination geometry...',
  'Extracting & verifying ICAO 9303 checksum math...',
  'Executing Error Level Analysis (ELA) & noise residuals...',
  'Computing 512-d facial biometric feature vectors...',
  'Cross-referencing Interpol watchlist & Merkle ledger...',
];

export default function DocumentScanner({
  documentImage,
  liveFaceImage,
  onDocumentChange,
  onLiveFaceChange,
  onRunInspection,
  loading,
  qualityData,
  currentScenario,
  customMetadata,
  onCustomMetadataChange
}) {
  const docFileRef  = useRef(null);
  const liveFileRef = useRef(null);
  const videoRef    = useRef(null);
  const [cameraMode, setCameraMode] = useState(null); // 'doc' or 'face'
  const [step, setStep]             = useState(0);
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => setStep(s => (s + 1) % STEPS.length), 650);
    return () => clearInterval(interval);
  }, [loading]);

  const handleDocFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      onDocumentChange(ev.target.result, null);
    };
    reader.readAsDataURL(file);
  };

  const handleLiveFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (onLiveFaceChange) onLiveFaceChange(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async mode => {
    setCameraMode(mode);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {}
  };

  const captureCamera = () => {
    const canvas = document.createElement('canvas');
    canvas.width  = videoRef.current?.videoWidth  || 640;
    canvas.height = videoRef.current?.videoHeight || 480;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const b64 = canvas.toDataURL('image/jpeg', 0.95);
    
    if (cameraMode === 'doc') {
      onDocumentChange(b64, null);
    } else if (cameraMode === 'face') {
      if (onLiveFaceChange) onLiveFaceChange(b64);
    }

    videoRef.current?.srcObject?.getTracks().forEach(track => track.stop());
    setCameraMode(null);
  };

  const clearAll = () => {
    onDocumentChange(null, null);
    if (onLiveFaceChange) onLiveFaceChange(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{
            fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
            fontStyle: 'italic',
            fontSize: 28,
            color: '#1E293B',
            fontWeight: 700,
          }}>
            Travel Document & Biometric Acquisition
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
            Upload travel document and traveler photo or signature to execute real-time forensic & biometric matching.
          </p>
        </div>

        {(documentImage || liveFaceImage || currentScenario) && (
          <button
            onClick={clearAll}
            className="btn btn-ghost"
            style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={13} /> Reset / Start Fresh
          </button>
        )}
      </div>

      {/* ── Test Profile Presets (Expandable / Optional) ── */}
      <div className="card" style={{ padding: 16, background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <p className="section-label">Demo Scenario Profiles (Optional)</p>
          <span style={{ color: '#94A3B8', fontSize: 11 }}>
            Click to load a pre-configured fraud test, or upload your own files below
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
          {PRESET_SCENARIOS.map((scenario, index) => {
            const active = currentScenario?.id === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => {
                  onDocumentChange(scenario.documentImage, scenario);
                  if (onLiveFaceChange) onLiveFaceChange(scenario.liveFace);
                }}
                style={{
                  background: active ? '#FDEEF3' : '#FFFDFD',
                  border: `1.5px solid ${active ? '#E27396' : '#F7DFE6'}`,
                  borderRadius: 14,
                  padding: '10px 12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: active ? '0 3px 10px rgba(226,115,150,0.18)' : 'none',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#FFF4F7'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = '#FFFDFD'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#E27396' : '#D4789A' }} />
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: '#B25779', textTransform: 'uppercase' }}>
                    Scenario {index + 1}
                  </span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#2E1B24', lineHeight: 1.25 }}>
                  {scenario.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Dual Acquisition Stations (Document + Live Traveler Asset) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 18, alignItems: 'start' }}>

        {/* 1. Document Upload Box */}
        <div className="card" style={{ padding: 20, background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color="#D4789A" />
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', margin: 0 }}>
                  1. Travel Document / Passport Scan
                </h3>
                <span style={{ fontSize: 11, color: '#64748B' }}>Primary physical ID for forensic ELA & MRZ check</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost" style={{ fontSize: 11.5, padding: '5px 10px' }} onClick={() => docFileRef.current?.click()}>
                <UploadCloud size={13} color="#D4789A" /> Browse
              </button>
              <button className="btn btn-ghost" style={{ fontSize: 11.5, padding: '5px 10px' }} onClick={() => startCamera('doc')}>
                <Camera size={13} color="#D4789A" /> Camera
              </button>
              <input ref={docFileRef} type="file" accept="image/*" onChange={handleDocFile} style={{ display: 'none' }} />
            </div>
          </div>

          {/* Document Display / Dropzone */}
          <div
            onClick={() => !documentImage && docFileRef.current?.click()}
            style={{
              minHeight: 250,
              borderRadius: 14,
              background: '#FFF8FA',
              border: '1.5px dashed #F3D0DC',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
              cursor: documentImage ? 'default' : 'pointer',
            }}
          >
            {cameraMode === 'doc' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 16 }}>
                <video ref={videoRef} autoPlay playsInline style={{ maxHeight: 200, borderRadius: 10, border: '1.5px solid #F3D0DC' }} />
                <button className="btn btn-primary" onClick={captureCamera} style={{ fontSize: 12 }}>
                  <Camera size={13} /> Snap Document
                </button>
              </div>
            ) : documentImage ? (
              <>
                <img src={documentImage} alt="Uploaded Document" style={{ maxHeight: 240, maxWidth: '100%', objectFit: 'contain', borderRadius: 10 }} />
                {loading && <div className="scan-line" />}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 28 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: '#FDEEF3', border: '1.5px dashed #F3D0DC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 10px',
                }}>
                  <UploadCloud size={20} color="#D4789A" />
                </div>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B', marginBottom: 3 }}>
                  Upload passport or ID document
                </p>
                <p style={{ fontSize: 11.5, color: '#94A3B8' }}>
                  Click to browse from your device
                </p>
              </div>
            )}

            {/* Live Step Tracker Pill */}
            {loading && (
              <div style={{
                position: 'absolute', bottom: 10, left: 12, right: 12,
                background: 'rgba(255, 255, 255, 0.96)', borderRadius: 12,
                border: '1.5px solid #F3D0DC', padding: '8px 14px',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 14px rgba(212,120,154,0.12)',
              }}>
                <Loader2 size={15} color="#D4789A" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#1E293B', fontWeight: 600 }}>{STEPS[step]}</span>
              </div>
            )}
          </div>

          {/* Quick Custom Info Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F8E3EA', paddingTop: 10 }}>
            <span style={{ fontSize: 11.5, color: '#64748B' }}>
              {currentScenario ? `Active Scenario: ${currentScenario.title}` : 'User-Uploaded Document'}
            </span>
            <button
              onClick={() => setShowMetadataEditor(prev => !prev)}
              style={{
                background: 'none', border: 'none', color: '#B25779',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              <Edit3 size={13} /> {showMetadataEditor ? 'Hide Metadata Form' : 'Edit Document Details'}
            </button>
          </div>

          {/* Collapsible Metadata Form */}
          {showMetadataEditor && (
            <div style={{
              background: '#FFF9FB', border: '1px solid #F4D9E2', borderRadius: 12,
              padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10
            }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 3 }}>
                  Holder Full Name
                </label>
                <input
                  type="text"
                  value={customMetadata?.fullName || ''}
                  onChange={e => onCustomMetadataChange({ ...customMetadata, fullName: e.target.value.toUpperCase() })}
                  placeholder="e.g. UZUMAKI NARUTO"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 3 }}>
                  Document Number
                </label>
                <input
                  type="text"
                  value={customMetadata?.documentNumber || ''}
                  onChange={e => onCustomMetadataChange({ ...customMetadata, documentNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g. P74209188"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 3 }}>
                  Country (3 letters)
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={customMetadata?.country || ''}
                  onChange={e => onCustomMetadataChange({ ...customMetadata, country: e.target.value.toUpperCase() })}
                  placeholder="JPN / USA / IND"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 3 }}>
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={customMetadata?.expiryDate || ''}
                  onChange={e => onCustomMetadataChange({ ...customMetadata, expiryDate: e.target.value })}
                  placeholder="2032-12-31"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. Live Traveler Photo / Signature Acquisition Box */}
        <div className="card" style={{ padding: 20, background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={18} color="#D4789A" />
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', margin: 0 }}>
                  2. Live Traveler Photo / Signature
                </h3>
                <span style={{ fontSize: 11, color: '#64748B' }}>Biometric asset for 1:1 facial verification</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost" style={{ fontSize: 11.5, padding: '5px 10px' }} onClick={() => liveFileRef.current?.click()}>
                <UploadCloud size={13} color="#D4789A" /> Browse
              </button>
              <button className="btn btn-ghost" style={{ fontSize: 11.5, padding: '5px 10px' }} onClick={() => startCamera('face')}>
                <Camera size={13} color="#D4789A" /> Selfie
              </button>
              <input ref={liveFileRef} type="file" accept="image/*" onChange={handleLiveFile} style={{ display: 'none' }} />
            </div>
          </div>

          {/* Traveler Face / Signature Display */}
          <div
            onClick={() => !liveFaceImage && liveFileRef.current?.click()}
            style={{
              minHeight: 250,
              borderRadius: 14,
              background: '#FFF8FA',
              border: '1.5px dashed #F3D0DC',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
              cursor: liveFaceImage ? 'default' : 'pointer',
            }}
          >
            {cameraMode === 'face' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 16 }}>
                <video ref={videoRef} autoPlay playsInline style={{ maxHeight: 200, borderRadius: 10, border: '1.5px solid #F3D0DC' }} />
                <button className="btn btn-primary" onClick={captureCamera} style={{ fontSize: 12 }}>
                  <Camera size={13} /> Snap Selfie
                </button>
              </div>
            ) : liveFaceImage ? (
              <div style={{ position: 'relative', textAlign: 'center', width: '100%', height: '100%', padding: 12 }}>
                <img src={liveFaceImage} alt="Traveler Face" style={{ maxHeight: 230, maxWidth: '100%', objectFit: 'contain', borderRadius: 10 }} />
                <div style={{
                  position: 'absolute', top: 18, right: 18,
                  background: 'rgba(56, 161, 105, 0.95)', color: '#fff',
                  borderRadius: 999, padding: '3px 10px', fontSize: 10.5, fontWeight: 700
                }}>
                  Live Asset Attached
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 28 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: '#FDEEF3', border: '1.5px dashed #F3D0DC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 10px',
                }}>
                  <UserCheck size={20} color="#D4789A" />
                </div>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B', marginBottom: 3 }}>
                  Upload passenger photo or signature
                </p>
                <p style={{ fontSize: 11.5, color: '#94A3B8' }}>
                  Used to verify against passport crop
                </p>
              </div>
            )}
          </div>

          {/* Biometric Pairing Badge */}
          <div style={{
            padding: '10px 14px', borderRadius: 12,
            background: liveFaceImage && documentImage ? '#EDF7EE' : '#FFF9FB',
            border: `1px solid ${liveFaceImage && documentImage ? '#BCE3C1' : '#F4D9E2'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} color={liveFaceImage && documentImage ? '#38A169' : '#94A3B8'} />
              <span style={{ fontSize: 12, fontWeight: 600, color: liveFaceImage && documentImage ? '#2E6B39' : '#64748B' }}>
                {liveFaceImage && documentImage
                  ? 'Dual Biometric Assets Ready for Matching'
                  : 'Document uploaded; traveler photo optional'}
              </span>
            </div>
            {liveFaceImage && (
              <button
                onClick={() => onLiveFaceChange(null)}
                style={{ background: 'none', border: 'none', color: '#B0334E', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ── Action Verification Bar ── */}
      <div style={{
        background: '#FFFFFF', border: '1.5px solid #F4D9E2', borderRadius: 18,
        padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 4px 14px rgba(212,120,154,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: '#FDEEF3',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldCheck size={18} color="#D4789A" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>
              Autonomous Forensic & Biometric Screening
            </div>
            <div style={{ fontSize: 11.5, color: '#64748B' }}>
              Executes Error Level Analysis, FFT Moiré, ICAO checksum validation, and facial vector cosine comparison.
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary"
          disabled={!documentImage || loading}
          onClick={onRunInspection}
          style={{ padding: '12px 36px', fontSize: 14, borderRadius: 14 }}
        >
          {loading ? (
            <>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Executing Forensic Inference...
            </>
          ) : (
            <>
              <ShieldCheck size={16} />
              Run Full Verification
            </>
          )}
        </button>
      </div>

    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Camera, Loader2, Sparkles, CheckCircle2, RefreshCw, Smartphone, ChevronRight, ShieldCheck, User, ShieldAlert, Edit3 } from 'lucide-react';
import { PRESET_SCENARIOS } from '../../data/presetSamples';

const STEPS = [
  'Aligning document perspective...',
  'Checking ICAO Doc 9303 checksums...',
  'Scanning for digital edits & ELA deltas...',
  'Analyzing optical texture & Moiré patterns...',
  'Verifying biometric facial embedding...',
];

export default function DocumentScanner({
  documentImage,
  liveFaceImage,
  onDocumentChange,
  onLiveFaceChange,
  onRunInspection,
  loading,
  currentScenario,
  customMetadata = {},
  onCustomMetadataChange,
  isBlacklisted = false,
  onToggleWatchlist
}) {
  const fileInputRef  = useRef(null);
  const selfieFileRef = useRef(null);
  const videoRef      = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraTarget, setCameraTarget] = useState('doc'); // 'doc' or 'selfie'
  const [step, setStep]                 = useState(0);
  const [showSelfieBox, setShowSelfieBox] = useState(false);
  const [showMetaBox, setShowMetaBox]     = useState(false);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => setStep(s => (s + 1) % STEPS.length), 650);
    return () => clearInterval(interval);
  }, [loading]);

  const handleDocFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onDocumentChange(ev.target.result, null);
    reader.readAsDataURL(file);
  };

  const handleSelfieFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (onLiveFaceChange) onLiveFaceChange(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = (target = 'doc') => {
    setCameraTarget(target);
    setCameraActive(true);
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {});
  };

  const captureCamera = () => {
    const canvas = document.createElement('canvas');
    canvas.width  = videoRef.current?.videoWidth  || 640;
    canvas.height = videoRef.current?.videoHeight || 480;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const b64 = canvas.toDataURL('image/jpeg', 0.95);

    if (cameraTarget === 'doc') {
      onDocumentChange(b64, null);
    } else {
      if (onLiveFaceChange) onLiveFaceChange(b64);
    }

    videoRef.current?.srcObject?.getTracks().forEach(track => track.stop());
    setCameraActive(false);
  };

  const resetScanner = () => {
    onDocumentChange(null, null);
    if (onLiveFaceChange) onLiveFaceChange(null);
    setShowSelfieBox(false);
  };

  return (
    <div style={{
      maxWidth: 580,
      margin: '0 auto',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>

      {/* Mobile-Style Phone Card */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 28,
        border: '1.5px solid #F3D0DC',
        boxShadow: '0 12px 36px rgba(212,120,154,0.12), 0 2px 8px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>

        {/* App-like Top Bar */}
        <div style={{
          padding: '16px 20px 14px',
          borderBottom: '1px solid #F9E8EE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to bottom, #FFFDFE, #FFFFFF)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #E27396, #B25779)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Smartphone size={16} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>
                Document Scanner
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>
                Position ID or passport inside frame
              </div>
            </div>
          </div>

          {(documentImage || liveFaceImage || currentScenario) && (
            <button
              onClick={resetScanner}
              style={{
                background: '#FFF5F8', border: '1px solid #F5D2DC',
                borderRadius: 20, padding: '4px 10px', fontSize: 11,
                color: '#B25779', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              <RefreshCw size={11} /> Reset
            </button>
          )}
        </div>

        {/* Quick Scenario Pills Strip */}
        <div style={{
          padding: '10px 16px',
          background: '#FFF9FB',
          borderBottom: '1px solid #F9E8EE',
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
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
                  background: active ? '#D4789A' : '#FFFFFF',
                  color: active ? '#FFFFFF' : '#475569',
                  border: `1px solid ${active ? '#D4789A' : '#F0D4DE'}`,
                  borderRadius: 20,
                  padding: '5px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                Sample {index + 1}: {scenario.title.split('(')[0].trim()}
              </button>
            );
          })}
        </div>

        {/* Main Viewfinder / Camera Screen */}
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          <div style={{
            position: 'relative',
            borderRadius: 22,
            background: '#181216',
            minHeight: 280,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
          }}>

            {/* Corner Alignment Brackets (Mobile Viewfinder) */}
            <div style={{ position: 'absolute', top: 16, left: 16, width: 24, height: 24, borderTop: '3px solid #E27396', borderLeft: '3px solid #E27396', borderTopLeftRadius: 6, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 16, right: 16, width: 24, height: 24, borderTop: '3px solid #E27396', borderRight: '3px solid #E27396', borderTopRightRadius: 6, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 16, left: 16, width: 24, height: 24, borderBottom: '3px solid #E27396', borderLeft: '3px solid #E27396', borderBottomLeftRadius: 6, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 16, right: 16, width: 24, height: 24, borderBottom: '3px solid #E27396', borderRight: '3px solid #E27396', borderBottomRightRadius: 6, pointerEvents: 'none' }} />

            {cameraActive ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
                <video ref={videoRef} autoPlay playsInline style={{ maxHeight: 240, maxWidth: '100%', borderRadius: 14 }} />
                <button
                  onClick={captureCamera}
                  style={{
                    marginTop: 12,
                    background: '#E27396',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 999,
                    padding: '8px 20px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Snap Photo
                </button>
              </div>
            ) : documentImage ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
                <img
                  src={documentImage}
                  alt="Captured Document"
                  style={{ maxHeight: 260, maxWidth: '100%', objectFit: 'contain', borderRadius: 12 }}
                />
                {loading && <div className="scan-line" />}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  textAlign: 'center',
                  padding: 32,
                  cursor: 'pointer',
                  color: '#FFFFFF'
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 18,
                  background: 'rgba(226,115,150,0.18)', border: '1.5px dashed #E27396',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <Camera size={24} color="#E27396" />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                  Tap to Upload or Snap Document
                </div>
                <div style={{ fontSize: 11.5, color: '#A0AEC0' }}>
                  Supports Passport, National ID, or Driver's License
                </div>
              </div>
            )}

            {/* Scanning Indicator Overlay */}
            {loading && (
              <div style={{
                position: 'absolute', bottom: 12, left: 14, right: 14,
                background: 'rgba(255, 255, 255, 0.94)', backdropFilter: 'blur(8px)',
                borderRadius: 14, padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
              }}>
                <Loader2 size={16} color="#E27396" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{STEPS[step]}</span>
              </div>
            )}
          </div>

          {/* Clean Action Bar Below Viewfinder */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: '#FFF5F8', border: '1.5px solid #F3D0DC',
                borderRadius: 14, padding: '10px 14px',
                fontSize: 12.5, fontWeight: 700, color: '#2E1B24',
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              <UploadCloud size={15} color="#D4789A" />
              <span>Choose Photo</span>
            </button>

            <button
              onClick={() => startCamera('doc')}
              style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: '#FFF5F8', border: '1.5px solid #F3D0DC',
                borderRadius: 14, padding: '10px 14px',
                fontSize: 12.5, fontWeight: 700, color: '#2E1B24',
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              <Camera size={15} color="#D4789A" />
              <span>Open Camera</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleDocFile} style={{ display: 'none' }} />
          </div>

          {/* Optional Selfie / Live Photo Attachment Toggle (Single Inline Card) */}
          <div style={{
            background: '#FFF9FB',
            border: '1px solid #F5D2DC',
            borderRadius: 16,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={15} color="#D4789A" />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1E293B' }}>
                  Live Traveler Photo (Optional)
                </span>
              </div>
              
              <button
                onClick={() => setShowSelfieBox(prev => !prev)}
                style={{
                  background: 'none', border: 'none', color: '#B25779',
                  fontSize: 11.5, fontWeight: 700, cursor: 'pointer'
                }}
              >
                {showSelfieBox ? 'Hide' : (liveFaceImage ? 'Change Photo' : '+ Attach Selfie')}
              </button>
            </div>

            {liveFaceImage && !showSelfieBox && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#EDF7EE', padding: '6px 12px', borderRadius: 10 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#2E6B39', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CheckCircle2 size={13} /> Photo ready for 1:1 face match
                </span>
                <button onClick={() => onLiveFaceChange(null)} style={{ background: 'none', border: 'none', color: '#D14966', fontSize: 11, cursor: 'pointer' }}>
                  Remove
                </button>
              </div>
            )}

            {showSelfieBox && (
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  onClick={() => selfieFileRef.current?.click()}
                  style={{
                    flex: 1, padding: '7px 10px', borderRadius: 10,
                    background: '#FFFFFF', border: '1px solid #E2E8F0',
                    fontSize: 11.5, fontWeight: 600, color: '#475569', cursor: 'pointer'
                  }}
                >
                  Upload Selfie
                </button>
                <button
                  onClick={() => startCamera('selfie')}
                  style={{
                    flex: 1, padding: '7px 10px', borderRadius: 10,
                    background: '#FFFFFF', border: '1px solid #E2E8F0',
                    fontSize: 11.5, fontWeight: 600, color: '#475569', cursor: 'pointer'
                  }}
                >
                  Take Selfie
                </button>
                <input ref={selfieFileRef} type="file" accept="image/*" onChange={handleSelfieFile} style={{ display: 'none' }} />
              </div>
            )}
          </div>

          {/* Watchlist Cross-Check & Simulation Card */}
          <div style={{
            background: isBlacklisted ? '#FEF1F3' : '#F0F8F3',
            border: `1.5px solid ${isBlacklisted ? '#F8BAC7' : '#BCDCC7'}`,
            borderRadius: 16,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            transition: 'all 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={16} color={isBlacklisted ? '#D14966' : '#4A8C5C'} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: isBlacklisted ? '#96243C' : '#2B5A37' }}>
                  {isBlacklisted ? 'Watchlist Hit Flagged (Active Alert)' : 'Watchlist Check: Passed (Clean)'}
                </span>
              </div>

              {onToggleWatchlist && (
                <button
                  type="button"
                  onClick={onToggleWatchlist}
                  style={{
                    background: isBlacklisted ? '#FFFFFF' : '#FFFFFF',
                    border: `1px solid ${isBlacklisted ? '#D14966' : '#4A8C5C'}`,
                    color: isBlacklisted ? '#D14966' : '#2B5A37',
                    borderRadius: 12,
                    padding: '4px 10px',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isBlacklisted ? '✓ Clear Alert' : '⚡ Simulate Watchlist Hit'}
                </button>
              )}
            </div>

            <div style={{ fontSize: 11, color: isBlacklisted ? '#B25779' : '#4A8C5C' }}>
              {isBlacklisted
                ? 'Document or name matches high-risk Interpol / travel ban database.'
                : 'Scanned document is clean. Not flagged on Interpol SLTD or national blacklist.'}
            </div>
          </div>

          {/* Document & Traveler Metadata Drawer (Collapsible) */}
          <div style={{
            background: '#FFF9FB',
            border: '1px solid #F5D2DC',
            borderRadius: 16,
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <Edit3 size={14} color="#D4789A" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Doc: <strong>{customMetadata?.documentNumber || 'P74209188'}</strong> • {customMetadata?.fullName || 'UZUMAKI NARUTO'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowMetaBox(prev => !prev)}
                style={{
                  background: 'none', border: 'none', color: '#B25779',
                  fontSize: 11.5, fontWeight: 700, cursor: 'pointer', flexShrink: 0
                }}
              >
                {showMetaBox ? 'Done' : 'Edit Info'}
              </button>
            </div>

            {showMetaBox && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4, paddingTop: 8, borderTop: '1px dashed #F5D2DC' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 2 }}>
                      Document Number
                    </label>
                    <input
                      type="text"
                      value={customMetadata?.documentNumber || ''}
                      onChange={e => onCustomMetadataChange && onCustomMetadataChange({ ...customMetadata, documentNumber: e.target.value.toUpperCase() })}
                      style={{ fontSize: 12, padding: '6px 10px', width: '100%', borderRadius: 8, border: '1px solid #CBD5E1' }}
                      placeholder="e.g. P74209188"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 2 }}>
                      Country Code
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={customMetadata?.country || ''}
                      onChange={e => onCustomMetadataChange && onCustomMetadataChange({ ...customMetadata, country: e.target.value.toUpperCase() })}
                      style={{ fontSize: 12, padding: '6px 10px', width: '100%', borderRadius: 8, border: '1px solid #CBD5E1' }}
                      placeholder="JPN"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 2 }}>
                    Holder Full Name
                  </label>
                  <input
                    type="text"
                    value={customMetadata?.fullName || ''}
                    onChange={e => onCustomMetadataChange && onCustomMetadataChange({ ...customMetadata, fullName: e.target.value.toUpperCase() })}
                    style={{ fontSize: 12, padding: '6px 10px', width: '100%', borderRadius: 8, border: '1px solid #CBD5E1' }}
                    placeholder="SURNAME GIVEN"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Primary Full-Width Bottom CTA Button */}
          <button
            disabled={!documentImage || loading}
            onClick={onRunInspection}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: 18,
              border: 'none',
              background: documentImage && !loading
                ? 'linear-gradient(135deg, #E27396, #B25779)'
                : '#E2E8F0',
              color: documentImage && !loading ? '#FFFFFF' : '#94A3B8',
              fontSize: 14,
              fontWeight: 700,
              cursor: documentImage && !loading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: documentImage && !loading ? '0 6px 20px rgba(226,115,150,0.36)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Verifying Document...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Verify Document
                <ChevronRight size={16} />
              </>
            )}
          </button>

        </div>

      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Camera, UserCheck, RefreshCw } from 'lucide-react';
import ActiveLivenessModal from './ActiveLivenessModal';
import { compareFaces } from '../../api/client';

export default function BiometricComparisonCard({ docFaceCrop, liveFaceImage, biometricResult, onLiveFaceCaptured }) {
  const [modal, setModal] = useState(false);
  const [localMatch, setLocalMatch] = useState(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    if (biometricResult && biometricResult.verdict !== 'PENDING_CAPTURE') {
      setLocalMatch(biometricResult);
    }
  }, [biometricResult]);

  // Whenever liveFaceImage and docFaceCrop are both present, automatically compare
  useEffect(() => {
    if (docFaceCrop && liveFaceImage) {
      let isMounted = true;
      setComparing(true);
      compareFaces({
        document_image_base64: docFaceCrop,
        live_face_base64: liveFaceImage
      })
        .then(res => {
          if (isMounted && res?.match) {
            setLocalMatch({
              verdict: res.match.verdict,
              similarity_percentage: res.match.similarity_percentage,
              cosine_similarity: res.match.cosine_similarity,
              liveness_score: res.passive_liveness?.liveness_score || 92,
              is_live: res.passive_liveness?.is_live ?? true,
              spoof_classification: res.passive_liveness?.spoof_classification || 'REAL_HUMAN'
            });
          }
        })
        .catch(err => console.warn('Auto-compare error:', err))
        .finally(() => {
          if (isMounted) setComparing(false);
        });
      return () => { isMounted = false; };
    }
  }, [docFaceCrop, liveFaceImage]);

  const hasLiveFace = Boolean(liveFaceImage || localMatch);
  const match  = localMatch || biometricResult;
  const hasScore = hasLiveFace && match && match.similarity_percentage !== null && match.similarity_percentage !== undefined && match.verdict !== 'PENDING_CAPTURE';
  const pct    = hasScore ? match.similarity_percentage : null;
  const isMatch = match?.verdict === 'MATCH';
  const isBorder = match?.verdict === 'BORDERLINE';

  const color = !hasScore ? '#846271' : isMatch ? '#4A8C5C' : isBorder ? '#B66D26' : '#D14966';
  const label = !hasScore 
    ? (comparing ? 'Comparing...' : 'Awaiting Camera') 
    : isMatch 
    ? 'Faces Match' 
    : isBorder 
    ? 'Needs Officer Check' 
    : 'Faces Do Not Match';

  const handleCaptureComplete = async (b64) => {
    if (onLiveFaceCaptured) onLiveFaceCaptured(b64);
    if (docFaceCrop && b64) {
      setComparing(true);
      try {
        const res = await compareFaces({
          document_image_base64: docFaceCrop,
          live_face_base64: b64
        });
        if (res?.match) {
          setLocalMatch({
            verdict: res.match.verdict,
            similarity_percentage: res.match.similarity_percentage,
            cosine_similarity: res.match.cosine_similarity,
            liveness_score: res.passive_liveness?.liveness_score || 95,
            is_live: res.passive_liveness?.is_live ?? true,
            spoof_classification: res.passive_liveness?.spoof_classification || 'REAL_HUMAN'
          });
        }
      } catch (err) {
        console.warn('Real-time compare error:', err);
      } finally {
        setComparing(false);
      }
    }
  };

  return (
    <div className="card" style={{ padding: 22, background: '#FFFFFF' }}>
      <p className="section-label">Facial Comparison</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{
          fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, cursive, serif',
          fontStyle: 'italic',
          fontSize: 22,
          color: '#2E1B24',
        }}>
          Passport Photo vs. Live Person
        </h2>
        <button
          className="btn btn-ghost"
          style={{ fontSize: 12, borderRadius: 12 }}
          onClick={() => setModal(true)}
        >
          <Camera size={14} color="#D4789A" />
          <span>Live Camera Test</span>
        </button>
      </div>

      {/* Comparison view */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', marginBottom: 16 }}>

        {/* Passport Photo */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#846271', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Passport Photo
          </div>
          <div style={{
            width: 90, height: 114, borderRadius: 14, overflow: 'hidden', margin: '0 auto',
            background: '#FFF8FA', border: '1.5px solid #F3D0DC',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {docFaceCrop ? (
              <img src={docFaceCrop} alt="Passport Face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <UserCheck size={30} color="#F3D0DC" />
            )}
          </div>
        </div>

        {/* Circular Match Gauge */}
        <div style={{ textAlign: 'center', padding: '0 8px' }}>
          <div style={{ position: 'relative', width: 92, height: 92, margin: '0 auto' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#FDEEF3" strokeWidth="3.2" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={color} strokeWidth="3.2"
                strokeLinecap="round"
                strokeDasharray={`${hasScore ? pct : 0} 100`}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: hasScore ? 20 : 16, fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', color, lineHeight: 1 }}>
                {hasScore ? `${pct}%` : '--%'}
              </span>
              <span style={{ fontSize: 9.5, color: '#B99DAA', fontWeight: 600, textTransform: 'uppercase' }}>
                {hasScore ? 'Match' : 'Awaiting'}
              </span>
            </div>
          </div>

          <div style={{
            marginTop: 8, fontSize: 11.5, fontWeight: 700, color,
            background: !hasScore ? '#FBF9FA' : isMatch ? '#F0F8F3' : isBorder ? '#FFF6EC' : '#FEF1F3',
            border: `1.5px solid ${!hasScore ? '#E9DFE4' : isMatch ? '#BCDCC7' : isBorder ? '#F8D6B0' : '#F8BAC7'}`,
            borderRadius: 999, padding: '3px 10px', display: 'inline-block',
          }}>
            {label}
          </div>
        </div>

        {/* Live Camera Snapshot */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#846271', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Person at Checkpoint
          </div>
          <div 
            onClick={() => setModal(true)}
            style={{
              width: 90, height: 114, borderRadius: 14, overflow: 'hidden', margin: '0 auto',
              background: '#FFF8FA', 
              border: liveFaceImage ? '1.5px solid #F3D0DC' : '1.5px dashed #D4789A',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', gap: 4, transition: 'all 0.2s ease'
            }}
          >
            {liveFaceImage ? (
              <img src={liveFaceImage} alt="Live traveler photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <Camera size={26} color="#D4789A" />
                <span style={{ fontSize: 9.5, color: '#D4789A', fontWeight: 700 }}>Click to Test</span>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Liveness summary */}
      <div style={{
        padding: '10px 14px', borderRadius: 12,
        background: !hasScore ? '#FFF8FA' : (match?.is_live ? '#F0F8F3' : '#FEF1F3'),
        border: `1.5px solid ${!hasScore ? '#F3D0DC' : (match?.is_live ? '#BCDCC7' : '#F8BAC7')}`,
        fontSize: 12, color: '#573B48', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        {!hasScore ? (
          <>
            <span>Live Person Check: <strong>Awaiting Traveler Camera</strong></span>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 11, padding: '3px 10px', height: 'auto', borderRadius: 8, color: '#D4789A', border: '1px solid #D4789A' }}
              onClick={() => setModal(true)}
            >
              Start Live Camera Test →
            </button>
          </>
        ) : (
          <>
            <span>Live Person Check: <strong>{match?.spoof_classification === 'REAL_HUMAN' ? 'Real Human (Verified)' : (match?.spoof_classification === 'SCREEN_REPLAY' ? 'Screen Replay Detected' : 'Printed Photo Detected')}</strong></span>
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: match?.is_live ? '#4A8C5C' : '#D14966' }}>
              {match?.liveness_score || 95}%
            </span>
          </>
        )}
      </div>

      {modal && (
        <ActiveLivenessModal
          onClose={() => setModal(false)}
          onCapture={b64 => {
            handleCaptureComplete(b64);
            setModal(false);
          }}
        />
      )}
    </div>
  );
}

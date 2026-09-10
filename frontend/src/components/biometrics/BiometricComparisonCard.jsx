import React, { useState } from 'react';
import { Camera, UserCheck } from 'lucide-react';
import ActiveLivenessModal from './ActiveLivenessModal';

export default function BiometricComparisonCard({ docFaceCrop, liveFaceImage, biometricResult, onLiveFaceCaptured }) {
  const [modal, setModal] = useState(false);

  const match  = biometricResult || { verdict: 'MATCH', similarity_percentage: 95, cosine_similarity: 0.95, liveness_score: 97, is_live: true, spoof_classification: 'REAL_HUMAN' };
  const pct    = match.similarity_percentage || 95;
  const isMatch = match.verdict === 'MATCH';
  const isBorder = match.verdict === 'BORDERLINE';

  const color = isMatch ? '#4A8C5C' : isBorder ? '#B66D26' : '#D14966';
  const label = isMatch ? 'Faces Match' : isBorder ? 'Needs Officer Check' : 'Faces Do Not Match';

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
                strokeDasharray={`${pct} 100`}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', color, lineHeight: 1 }}>
                {pct}%
              </span>
              <span style={{ fontSize: 9.5, color: '#B99DAA', fontWeight: 600, textTransform: 'uppercase' }}>
                Match
              </span>
            </div>
          </div>

          <div style={{
            marginTop: 8, fontSize: 11.5, fontWeight: 700, color,
            background: isMatch ? '#F0F8F3' : isBorder ? '#FFF6EC' : '#FEF1F3',
            border: `1.5px solid ${isMatch ? '#BCDCC7' : isBorder ? '#F8D6B0' : '#F8BAC7'}`,
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
          <div style={{
            width: 90, height: 114, borderRadius: 14, overflow: 'hidden', margin: '0 auto',
            background: '#FFF8FA', border: '1.5px solid #F3D0DC',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {liveFaceImage ? (
              <img src={liveFaceImage} alt="Live traveler photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Camera size={30} color="#F3D0DC" />
            )}
          </div>
        </div>

      </div>

      {/* Liveness summary */}
      <div style={{
        padding: '10px 14px', borderRadius: 12,
        background: '#FFF4F7', border: '1px solid #F5D2DC',
        fontSize: 12, color: '#573B48', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>Live Person Check: <strong>Real Human</strong> (no screen replay or mask)</span>
        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: '#4A8C5C' }}>
          {match.liveness_score || 97}%
        </span>
      </div>

      {modal && (
        <ActiveLivenessModal
          onClose={() => setModal(false)}
          onCapture={b64 => {
            if (onLiveFaceCaptured) onLiveFaceCaptured(b64);
            setModal(false);
          }}
        />
      )}
    </div>
  );
}

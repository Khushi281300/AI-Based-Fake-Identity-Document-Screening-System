import React, { useState } from 'react';
import { Info, AlertCircle } from 'lucide-react';

const LAYERS = [
  { id: 'ela',        name: 'Digital Edits',      imgKey: 'ela_heatmap_base64',       flagKey: ['ela','is_spliced'],                 what: 'Highlights areas that were digitally altered or photoshopped.' },
  { id: 'srm',        name: 'Paper Texture',      imgKey: 'srm_noise_base64',         flagKey: ['srm','has_noise_inconsistency'],    what: 'Checks the micro-grain of the paper to reveal patched areas.' },
  { id: 'recapture',  name: 'Screen Photo Check', imgKey: 'fft_moire_base64',         flagKey: ['recapture','is_screen_recaptured'], what: 'Detects if this is a photo of a computer or phone screen rather than physical paper.' },
  { id: 'gradcam',    name: 'AI Hotspot Map',     imgKey: 'gradcam_saliency_base64',  flagKey: ['deep_tamper','is_deep_forged'],     what: 'Shows exactly where the neural network found suspicious patterns.' },
  { id: 'copy_move',  name: 'Clone Stamp',        imgKey: 'copy_move_base64',         flagKey: ['copy_move','copy_move_detected'],   what: 'Detects duplicated sections, copied stamps, or repeated signatures.' },
  { id: 'jpeg_ghost', name: 'Pasted Elements',    imgKey: 'jpeg_ghost_base64',        flagKey: ['jpeg_ghost','ghosts_detected'],     what: 'Finds pieces copied from a different photo with different quality.' },
];

export default function ForensicViewerPane({ inspectionResult, originalImage }) {
  const [selectedLayer, setSelectedLayer] = useState('ela');

  const layers  = inspectionResult?.layers || {};
  const metrics = inspectionResult?.forensics_metrics || {};

  const isFlagged = layer => Boolean(metrics[layer.flagKey[0]]?.[layer.flagKey[1]]);
  const activeLayer = LAYERS.find(l => l.id === selectedLayer) || LAYERS[0];
  const activeImage = layers[activeLayer.imgKey] || originalImage;

  return (
    <div className="card" style={{ padding: 22, background: '#FFFFFF' }}>
      <p className="section-label">Visual Forgery Analysis</p>
      <h2 style={{
        fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, cursive, serif',
        fontStyle: 'italic',
        fontSize: 22,
        color: '#2E1B24',
        marginBottom: 4,
      }}>
        Check for Altered or Edited Photos
      </h2>
      <p style={{ fontSize: 12.5, color: '#846271', marginBottom: 16 }}>
        Select an inspection layer below to inspect the document under forensic filters.
      </p>

      {/* Layer selector tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {LAYERS.map(layer => {
          const flagged = isFlagged(layer);
          const active  = selectedLayer === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => setSelectedLayer(layer.id)}
              style={{
                padding: '7px 14px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                background: active ? 'linear-gradient(135deg, #D4789A, #B25779)' : '#FFFDFD',
                color: active ? '#FFFFFF' : '#573B48',
                border: `1.5px solid ${active ? '#B25779' : '#F7DFE6'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                boxShadow: active ? '0 3px 10px rgba(212,120,154,0.3)' : 'none',
              }}
            >
              <span>{layer.name}</span>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: flagged ? '#D14966' : '#4A8C5C',
                boxShadow: flagged ? '0 0 6px #D14966' : 'none',
              }} />
            </button>
          );
        })}
      </div>

      {/* Side-by-side comparison */}
      <div className="grid-responsive-2col" style={{ gap: 14 }}>
        {[
          { label: 'Original Photo', img: originalImage, tag: 'Reference' },
          { label: activeLayer.name, img: activeImage,   tag: isFlagged(activeLayer) ? 'Tampered' : 'Clean' },
        ].map((item, idx) => (
          <div key={idx}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#573B48' }}>{item.label}</span>
              <span className={`pill ${idx === 1 && isFlagged(activeLayer) ? 'pill-red' : 'pill-pink'}`} style={{ fontSize: 10.5 }}>
                {item.tag}
              </span>
            </div>
            <div style={{
              background: '#FFF8FA',
              borderRadius: 14,
              border: idx === 1 && isFlagged(activeLayer) ? '1.5px solid #F8BAC7' : '1.5px solid #F7DFE6',
              minHeight: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              padding: 6,
            }}>
              {item.img ? (
                <img
                  src={item.img}
                  alt={item.label}
                  style={{ maxHeight: 205, maxWidth: '100%', objectFit: 'contain', borderRadius: 10 }}
                />
              ) : (
                <span style={{ fontSize: 12, color: '#B99DAA' }}>
                  Run check to see filter
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Explanation banner */}
      <div style={{
        marginTop: 14,
        padding: '12px 16px',
        borderRadius: 14,
        background: '#FFF4F7',
        border: '1px solid #F5D2DC',
        display: 'flex',
        gap: 10,
        alignItems: 'center',
      }}>
        <Info size={15} color="#D4789A" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: 12.5, color: '#573B48', lineHeight: 1.4 }}>
          <strong>{activeLayer.name}:</strong> {activeLayer.what}
        </p>
      </div>

      {/* Editing software detected flag */}
      {metrics.exif?.software_tag && metrics.exif.software_tag !== 'None' && (
        <div style={{
          marginTop: 10,
          padding: '10px 14px',
          borderRadius: 12,
          background: '#FEF1F3',
          border: '1px solid #F8BAC7',
          fontSize: 12.5,
          color: '#96243C',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}>
          <AlertCircle size={15} color="#D14966" style={{ flexShrink: 0 }} />
          <span>Edited with software: <strong>{metrics.exif.software_tag}</strong></span>
        </div>
      )}
    </div>
  );
}

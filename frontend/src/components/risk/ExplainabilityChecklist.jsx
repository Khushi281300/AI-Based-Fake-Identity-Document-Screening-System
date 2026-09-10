import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const CHECKS = [
  { key: 'document_quality',       name: 'Photo Quality',        weight: '10%', what: 'Checks if the document photo is clear, sharp, and easy to read.' },
  { key: 'mrz_integrity',          name: 'Security Codes',       weight: '20%', what: 'Confirms that the bottom line numbers mathematically match the passport data.' },
  { key: 'forensic_integrity',     name: 'Tampering Check',      weight: '25%', what: 'Scans for cut-and-paste edits, altered text, or cloned elements.' },
  { key: 'biometric_verification', name: 'Face Match',           weight: '25%', what: 'Compares the passport portrait with the traveler’s live camera shot.' },
  { key: 'database_watchlist',     name: 'Alert List Check',     weight: '20%', what: 'Checks against lost, stolen, and travel-ban databases.' },
];

export default function ExplainabilityChecklist({ factorBreakdown }) {
  const factors = factorBreakdown || {
    document_quality:       { score: 92, status: 'PASS' },
    mrz_integrity:          { score: 100, status: 'PASS' },
    forensic_integrity:     { score: 95, status: 'PASS' },
    biometric_verification: { score: 92, status: 'PASS' },
    database_watchlist:     { score: 100, status: 'PASS' },
  };

  return (
    <div className="card" style={{ padding: 22, background: '#FFFFFF' }}>
      <p className="section-label">Inspection Breakdown</p>
      <h2 style={{
        fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, cursive, serif',
        fontStyle: 'italic',
        fontSize: 22,
        color: '#2E1B24',
        marginBottom: 4,
      }}>
        What Was Checked
      </h2>
      <p style={{ fontSize: 12.5, color: '#846271', marginBottom: 18 }}>
        Here is the breakdown of the 5 key safety factors evaluated by the AI.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CHECKS.map(item => {
          const factor = factors[item.key] || { score: 90, status: 'PASS' };
          const ok = factor.status === 'PASS' || factor.score >= 70;
          return (
            <div
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '12px 16px',
                borderRadius: 16,
                background: ok ? '#FFFDFD' : '#FEF1F3',
                border: `1.5px solid ${ok ? '#F7DFE6' : '#F8BAC7'}`,
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ flexShrink: 0 }}>
                {ok ? (
                  <CheckCircle2 size={22} color="#4A8C5C" />
                ) : (
                  <XCircle size={22} color="#D14966" />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: '#2E1B24' }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: 11, color: '#B99DAA', fontWeight: 500 }}>
                    ({item.weight} weight)
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#846271', marginTop: 2, lineHeight: 1.35 }}>
                  {item.what}
                </p>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontSize: 18,
                  fontWeight: 800,
                  fontFamily: '"JetBrains Mono", monospace',
                  color: ok ? '#4A8C5C' : '#D14966',
                }}>
                  {factor.score}
                </div>
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: ok ? '#4A8C5C' : '#D14966',
                  textTransform: 'uppercase',
                }}>
                  {ok ? 'Passed' : 'Failed'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

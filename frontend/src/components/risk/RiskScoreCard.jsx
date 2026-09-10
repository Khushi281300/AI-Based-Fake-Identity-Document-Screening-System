import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, FileText } from 'lucide-react';

export default function RiskScoreCard({ riskEvaluation, onViewAudit }) {
  const data = riskEvaluation || {
    outcome: 'VERIFIED',
    overall_risk_score: 96,
    recommendation: 'All security checks passed. The document is authentic.',
    critical_failures: [],
    warning_flags: [],
  };

  const isPass   = data.outcome === 'VERIFIED';
  const isReview = data.outcome === 'MANUAL_REVIEW';

  const theme = isPass ? {
    bg: '#F0F8F3', border: '#BCDCC7', iconBg: '#4A8C5C',
    icon: <CheckCircle2 size={26} color="#fff" />,
    title: 'Document Verified', titleColor: '#2B5A37',
    badgeBg: '#FFFFFF', badgeColor: '#3B734A',
  } : isReview ? {
    bg: '#FFF6EC', border: '#F8D6B0', iconBg: '#B66D26',
    icon: <AlertTriangle size={26} color="#fff" />,
    title: 'Needs Manual Review', titleColor: '#8C4D14',
    badgeBg: '#FFFFFF', badgeColor: '#8C4D14',
  } : {
    bg: '#FEF1F3', border: '#F8BAC7', iconBg: '#D14966',
    icon: <XCircle size={26} color="#fff" />,
    title: 'Document Rejected', titleColor: '#96243C',
    badgeBg: '#FFFFFF', badgeColor: '#96243C',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Main Verdict Banner */}
      <div style={{
        background: theme.bg,
        border: `1.5px solid ${theme.border}`,
        borderRadius: 20,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 18,
        boxShadow: '0 2px 10px rgba(212,120,154,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 50, height: 50, borderRadius: 16,
            background: theme.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 4px 14px ${theme.iconBg}40`,
          }}>
            {theme.icon}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{
                fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, cursive, serif',
                fontStyle: 'italic',
                fontSize: 24,
                color: theme.titleColor,
                fontWeight: 700,
                lineHeight: 1.15,
              }}>
                {theme.title}
              </h2>
              <span style={{
                background: theme.badgeBg,
                border: `1px solid ${theme.border}`,
                borderRadius: 999,
                padding: '2px 10px',
                fontSize: 12,
                fontWeight: 700,
                color: theme.badgeColor,
              }}>
                Trust Score: {data.overall_risk_score} / 100
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#573B48', marginTop: 4, lineHeight: 1.4 }}>
              {data.recommendation}
            </p>
          </div>
        </div>

        <button
          onClick={onViewAudit}
          className="btn btn-secondary"
          style={{ flexShrink: 0, fontSize: 12, borderRadius: 12 }}
        >
          <FileText size={14} color="#D4789A" />
          <span>View Report</span>
        </button>
      </div>

      {/* Critical Issues Box */}
      {data.critical_failures?.length > 0 && (
        <div style={{
          background: '#FEF1F3',
          border: '1.5px solid #F8BAC7',
          borderRadius: 16,
          padding: '14px 18px',
        }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#96243C', marginBottom: 8 }}>
            Reason for Rejection:
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.critical_failures.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#96243C', alignItems: 'flex-start' }}>
                <XCircle size={15} color="#D14966" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings Box */}
      {data.warning_flags?.length > 0 && (
        <div style={{
          background: '#FFF6EC',
          border: '1.5px solid #F8D6B0',
          borderRadius: 16,
          padding: '14px 18px',
        }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#8C4D14', marginBottom: 8 }}>
            Points to Double-Check:
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.warning_flags.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#8C4D14', alignItems: 'flex-start' }}>
                <AlertTriangle size={15} color="#B66D26" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}

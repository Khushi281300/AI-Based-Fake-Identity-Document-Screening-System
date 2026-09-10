import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function MRZCard({ documentFields }) {
  const mrz = documentFields || {};
  const checkDigits = mrz.check_digits || {};
  const rawMRZ = mrz.raw_mrz || [
    'P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<',
    'L898902C36UTO7408122F3004159ZE184226B<<<<<10',
  ];
  const allValid = mrz.all_check_digits_valid !== false;

  const checks = [
    { id: 'doc', name: 'Passport Number', item: checkDigits.document_number || { expected: '6', calculated: '6', valid: true }, what: 'Verifies the document ID number is genuine.' },
    { id: 'dob', name: 'Date of Birth',   item: checkDigits.date_of_birth    || { expected: '2', calculated: '2', valid: true }, what: 'Verifies birth date checksum digits.' },
    { id: 'exp', name: 'Expiration Date', item: checkDigits.expiry_date      || { expected: '9', calculated: '9', valid: true }, what: 'Detects if the expiration was altered.' },
    { id: 'com', name: 'Total Checksum',  item: checkDigits.composite        || { expected: '0', calculated: '0', valid: true }, what: 'Full security check over all combined fields.' },
  ];

  return (
    <div className="card" style={{ padding: 22, background: '#FFFFFF' }}>
      <p className="section-label">Security Line Verification</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{
          fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, cursive, serif',
          fontStyle: 'italic',
          fontSize: 22,
          color: '#2E1B24',
        }}>
          Passport Bottom Line Check
        </h2>
        {allValid ? (
          <span className="pill pill-green">All digits match</span>
        ) : (
          <span className="pill pill-red">Code mismatch detected</span>
        )}
      </div>

      <p style={{ fontSize: 12.5, color: '#846271', marginBottom: 14 }}>
        The bottom lines on passports contain security checksums. If someone edits the text on the document, these numbers will not match.
      </p>

      {/* Raw MRZ Box in a stylish warm dark container */}
      <div style={{
        background: '#23171D',
        borderRadius: 14,
        padding: '12px 16px',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 12,
        color: '#F9CBD9',
        letterSpacing: '0.06em',
        lineHeight: 1.6,
        marginBottom: 16,
        overflowX: 'auto',
        border: '1px solid #3B232E',
      }}>
        {rawMRZ.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </div>

      {/* 4 Checks Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {checks.map(check => {
          const ok = check.item.valid !== false;
          return (
            <div
              key={check.id}
              style={{
                padding: '12px 14px',
                borderRadius: 14,
                background: ok ? '#FFFDFD' : '#FEF1F3',
                border: `1.5px solid ${ok ? '#F7DFE6' : '#F8BAC7'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#2E1B24' }}>
                  {check.name}
                </span>
                {ok ? (
                  <CheckCircle2 size={16} color="#4A8C5C" />
                ) : (
                  <XCircle size={16} color="#D14966" />
                )}
              </div>
              <p style={{ fontSize: 11, color: '#846271', lineHeight: 1.3 }}>
                {check.what}
              </p>
              <div style={{
                marginTop: 6,
                fontSize: 11,
                fontFamily: '"JetBrains Mono", monospace',
                color: ok ? '#4A8C5C' : '#D14966',
                fontWeight: 600,
              }}>
                Expected: {check.item.expected} • Got: {check.item.calculated}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

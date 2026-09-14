import React from 'react';
import { Scan, Microscope, CreditCard, Users, AlertCircle, BarChart2, ClipboardList } from 'lucide-react';

const TABS = [
  { id: 'scanner',    label: '1. Scan Document',   sub: 'Upload or select ID',      Icon: Scan },
  { id: 'mrz',        label: '2. MRZ Validation',  sub: 'ICAO check-digit math',    Icon: CreditCard },
  { id: 'forensics',  label: '3. Tamper Detection',sub: 'Splicing & forgery scan',  Icon: Microscope },
  { id: 'biometrics', label: '4. Face Match',      sub: 'Photo vs live traveler',   Icon: Users },
  { id: 'watchlist',  label: '5. Watchlist Check', sub: 'Blacklist & Interpol',     Icon: AlertCircle },
  { id: 'analytics',  label: 'Analytics',          sub: 'Checkpoint stats',         Icon: BarChart2 },
  { id: 'audit',      label: 'Audit Trail',        sub: 'Blockchain ledger & log',  Icon: ClipboardList },
];

export default function Sidebar({ activeTab, onSelectTab }) {
  return (
    <aside style={{
      width: 215,
      background: '#FFFFFF',
      borderRight: '1.5px solid #F4D9E2',
      padding: '16px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      flexShrink: 0,
      overflowY: 'auto',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px 8px',
      }}>
        <span style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#D4789A',
        }}>
          Navigation
        </span>
        <span style={{
          fontFamily: '"Caveat", cursive',
          fontSize: 15,
          color: '#B99DAA',
        }}>
          quick menu
        </span>
      </div>

      {TABS.map(({ id, label, sub, Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onSelectTab(id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 10px',
              borderRadius: 14,
              border: active ? '1.5px solid #F3D0DC' : '1.5px solid transparent',
              background: active ? '#FDEEF3' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'left',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#FFF4F7'; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active ? 'linear-gradient(135deg, #D4789A, #B25779)' : '#FFF8FA',
              border: active ? 'none' : '1px solid #F7DFE6',
              boxShadow: active ? '0 2px 8px rgba(212,120,154,0.3)' : 'none',
            }}>
              <Icon size={15} color={active ? '#fff' : '#B99DAA'} />
            </div>
            <div>
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                color: active ? '#2E1B24' : '#573B48',
                lineHeight: 1.25,
              }}>
                {label}
              </div>
              <div style={{ fontSize: 10.5, color: '#846271', lineHeight: 1.2, marginTop: 1 }}>
                {sub}
              </div>
            </div>
          </button>
        );
      })}
    </aside>
  );
}

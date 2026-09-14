import React, { useState } from 'react';
import { Shield, ChevronDown, Check, Sparkles, User, LogOut } from 'lucide-react';

export default function Navbar({ engineMode = 'LIVE_BACKEND', backendUrl = '' }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [officerName, setOfficerName] = useState('Tanjiro Kamado');
  const [isOnline, setIsOnline] = useState(true);

  return (
    <header style={{
      background: '#FFFFFF',
      borderBottom: '1.5px solid #F4D9E2',
      padding: '0 28px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 2px 12px rgba(212,120,154,0.06)',
    }}>

      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 12,
          background: 'linear-gradient(135deg, #E27396, #8C3A5E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 3px 10px rgba(212,120,154,0.32)',
          flexShrink: 0,
        }}>
          <Shield size={18} color="#fff" />
        </div>
        <div>
          <span style={{
            fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, cursive, serif',
            fontStyle: 'italic',
            fontSize: 24,
            fontWeight: 700,
            color: '#2E1B24',
            letterSpacing: '-0.01em',
          }}>
            Sukitōru
          </span>
          <span style={{
            fontSize: 12,
            color: '#B99DAA',
            marginLeft: 8,
            fontWeight: 500,
            fontFamily: '"Caveat", cursive',
            letterSpacing: '0.02em',
          }}>
            透き通る世界 • see-through screening
          </span>
        </div>
      </div>

      {/* Real-time Engine Status Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          background: engineMode === 'LIVE_BACKEND' ? '#EDF7EE' : '#F7F0FA',
          border: `1.5px solid ${engineMode === 'LIVE_BACKEND' ? '#BCE3C1' : '#E2CEF0'}`,
          borderRadius: 999,
          padding: '5px 14px',
          fontSize: 12,
          color: engineMode === 'LIVE_BACKEND' ? '#2E6B39' : '#6A3587',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: engineMode === 'LIVE_BACKEND' ? '#38A169' : '#9B51E0',
            boxShadow: engineMode === 'LIVE_BACKEND' ? '0 0 8px #38A169' : 'none'
          }} />
          <span>{engineMode === 'LIVE_BACKEND' ? 'LIVE ENGINE: ACTIVE' : 'SCENARIO DEMO MODE'}</span>
        </div>

        {/* Step Guide */}
        <div style={{
          background: '#FFF4F7',
          border: '1.5px solid #F5D2DC',
          borderRadius: 999,
          padding: '5px 16px',
          fontSize: 12,
          color: '#846271',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ color: '#D4789A', fontWeight: 700 }}>1. Choose</span>
          <span style={{ color: '#E8C5D2' }}>›</span>
          <span>2. Check</span>
          <span style={{ color: '#E8C5D2' }}>›</span>
          <span>3. Result</span>
        </div>
      </div>

      {/* Working Profile Section for "Uzumaki Naruto" */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowProfileMenu(prev => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: showProfileMenu ? '#FDEEF3' : '#FFFDFD',
            border: '1.5px solid #F3D0DC',
            borderRadius: 18,
            padding: '4px 12px 4px 6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#FDEEF3'}
          onMouseLeave={e => { if (!showProfileMenu) e.currentTarget.style.background = '#FFFDFD'; }}
        >
          {/* Avatar with status indicator */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 14,
              background: 'linear-gradient(135deg, #FCE8EE, #F8CBD9)',
              border: '1.5px solid #F3D0DC',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Cormorant Garamond", Georgia, cursive, serif',
              fontStyle: 'italic',
              fontSize: 16, fontWeight: 700, color: '#B25779',
            }}>
              UN
            </div>
            <span style={{
              position: 'absolute', bottom: -1, right: -1,
              width: 10, height: 10, borderRadius: '50%',
              background: isOnline ? '#4A8C5C' : '#B99DAA',
              border: '2px solid #FFFFFF',
            }} />
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, cursive, serif',
              fontStyle: 'italic',
              fontSize: 17,
              fontWeight: 700,
              color: '#2E1B24',
              lineHeight: 1.15,
            }}>
              {officerName}
            </div>
            <div style={{ fontSize: 10.5, color: '#846271', fontWeight: 500 }}>
              {isOnline ? 'Active Officer' : 'Away'} • Gate 12
            </div>
          </div>

          <ChevronDown size={14} color="#B99DAA" style={{ marginLeft: 2 }} />
        </button>

        {/* Working Profile Dropdown */}
        {showProfileMenu && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 240,
            background: '#FFFFFF',
            border: '1.5px solid #F3D0DC',
            borderRadius: 18,
            boxShadow: '0 8px 24px rgba(212,120,154,0.14)',
            padding: 14,
            zIndex: 100,
          }}>
            <div style={{
              paddingBottom: 10,
              borderBottom: '1px solid #F7DFE6',
              marginBottom: 10,
            }}>
              <div style={{
                fontFamily: '"Cormorant Garamond", Georgia, cursive, serif',
                fontStyle: 'italic',
                fontSize: 18,
                fontWeight: 700,
                color: '#2E1B24',
              }}>
                {officerName}
              </div>
              <div style={{ fontSize: 11, color: '#846271', marginTop: 2 }}>
                Officer ID: #HASHIRA-01 • Corps Division
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                onClick={() => { setIsOnline(prev => !prev); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '7px 10px', borderRadius: 10,
                  background: '#FFF9FB', border: '1px solid #F7DFE6',
                  fontSize: 12, color: '#573B48', cursor: 'pointer',
                }}
              >
                <span>Status: {isOnline ? 'Online' : 'Away'}</span>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: isOnline ? '#4A8C5C' : '#B99DAA',
                }} />
              </button>

              <button
                onClick={() => {
                  const newName = prompt('Enter officer name:', officerName);
                  if (newName) setOfficerName(newName.trim());
                  setShowProfileMenu(false);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 10px', borderRadius: 10,
                  background: 'transparent', border: 'none',
                  fontSize: 12, color: '#573B48', cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FDEEF3'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <User size={13} color="#D4789A" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => setShowProfileMenu(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 10px', borderRadius: 10,
                  background: 'transparent', border: 'none',
                  fontSize: 12, color: '#D14966', cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FEF1F3'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={13} color="#D14966" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

    </header>
  );
}

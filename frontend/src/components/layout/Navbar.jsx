import React, { useState } from 'react';
import { Shield, ChevronDown, Check, Sparkles, User, LogOut, Settings, Server, CheckCircle2, AlertCircle, X, RefreshCw } from 'lucide-react';
import { getBackendUrl, setBackendUrl, checkHealth } from '../../api/client';

export default function Navbar({ engineMode = 'LIVE_BACKEND', backendUrl = '' }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [officerName, setOfficerName] = useState('Uzumaki Naruto');
  const [isOnline, setIsOnline] = useState(true);
  const [showBackendModal, setShowBackendModal] = useState(false);
  const [customUrl, setCustomUrl] = useState(getBackendUrl());
  const [testStatus, setTestStatus] = useState(null);
  const [testMessage, setTestMessage] = useState('');

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Pinging backend /health endpoint...');
    setBackendUrl(customUrl);
    try {
      const data = await checkHealth();
      setTestStatus('success');
      setTestMessage(`Connected successfully! Version: ${data.version || '1.0.0'}`);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      setTestStatus('failed');
      setTestMessage(
        err.message?.includes('Network Error')
          ? 'Network Error: Cannot reach this URL. If using Render, free instances take ~50s to wake up.'
          : `Connection failed: ${err.message}`
      );
    }
  };

  const handleResetDefault = () => {
    const defaultUrl = 'http://localhost:8000/api/v1';
    setCustomUrl(defaultUrl);
    setBackendUrl(null);
    setTestStatus(null);
    setTestMessage('Reset to default URL.');
  };

  return (
    <header
      className="navbar-header"
      style={{
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
      }}
    >

      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: 'linear-gradient(135deg, #1E293B, #D4789A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 3px 10px rgba(30,41,59,0.25)',
          flexShrink: 0,
        }}>
          <Shield size={18} color="#fff" />
        </div>
        <div>
          <span style={{
            fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
            fontStyle: 'italic',
            fontSize: 22,
            fontWeight: 700,
            color: '#1E293B',
            letterSpacing: '-0.01em',
          }}>
            ARGUS
          </span>
          <span
            className="hide-on-mobile"
            style={{
              fontSize: 11,
              color: '#64748B',
              marginLeft: 8,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            Border Grid
          </span>
        </div>
      </div>

      {/* Real-time Engine Status Badge & Backend Config Trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          onClick={() => setShowBackendModal(true)}
          title="Click to configure Python Backend URL"
          style={{
            background: engineMode === 'LIVE_BACKEND' ? '#EDF7EE' : '#F7F0FA',
            border: `1.5px solid ${engineMode === 'LIVE_BACKEND' ? '#BCE3C1' : '#E2CEF0'}`,
            borderRadius: 999,
            padding: '4px 12px',
            fontSize: 11,
            color: engineMode === 'LIVE_BACKEND' ? '#2E6B39' : '#6A3587',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: engineMode === 'LIVE_BACKEND' ? '#38A169' : '#9B51E0',
            boxShadow: engineMode === 'LIVE_BACKEND' ? '0 0 8px #38A169' : 'none'
          }} />
          <span>{engineMode === 'LIVE_BACKEND' ? 'LIVE ENGINE' : 'SCENARIO DEMO'}</span>
          <Settings size={12} style={{ opacity: 0.65, marginLeft: 2 }} />
        </div>

        {/* Step Guide */}
        <div
          className="hide-on-mobile"
          style={{
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
          }}
        >
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
            <div style={{ fontSize: 10.5, color: '#64748B', fontWeight: 600 }}>
              {isOnline ? 'Senior Inspection Officer' : 'Away'} • Gate 12
            </div>
          </div>

          <ChevronDown size={14} color="#94A3B8" style={{ marginLeft: 2 }} />
        </button>

        {/* Working Profile Dropdown */}
        {showProfileMenu && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 250,
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
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2, fontWeight: 500 }}>
                Officer ID: #KON-742 • Border Control Division
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

      {/* Backend API Configuration Modal */}
      {showBackendModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: 24, width: '100%', maxWidth: 520,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1.5px solid #F3D0DC',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px', background: '#FFF8FA', borderBottom: '1.5px solid #F3D0DC',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Server size={18} color="#D4789A" />
                <span style={{ fontWeight: 700, fontSize: 15, color: '#2E1B24' }}>
                  Backend API & Cloud Connection
                </span>
              </div>
              <button
                onClick={() => setShowBackendModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#846271' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                background: engineMode === 'LIVE_BACKEND' ? '#F0F8F3' : '#FFF9EC',
                border: `1px solid ${engineMode === 'LIVE_BACKEND' ? '#BCDCC7' : '#F8D6B0'}`,
                borderRadius: 14, padding: '10px 14px', fontSize: 12,
                color: engineMode === 'LIVE_BACKEND' ? '#2B5A37' : '#8A5314',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                {engineMode === 'LIVE_BACKEND' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>
                  Current Engine: <strong>{engineMode === 'LIVE_BACKEND' ? 'Live FastAPI Backend Connected' : 'Scenario Demo (Frontend Fallback)'}</strong>
                </span>
              </div>

              <p style={{ fontSize: 12, color: '#573B48', lineHeight: 1.5 }}>
                Vercel only hosts the static React website. For live Python AI inspection on phones and the web, point this frontend to your deployed Python FastAPI service (e.g. Render, Railway, or localtunnel).
              </p>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#846271', display: 'block', marginBottom: 6 }}>
                  Backend API Base URL
                </label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  placeholder="https://aegis-screening-backend.onrender.com/api/v1"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 12,
                    border: '1.5px solid #F3D0DC', fontSize: 13,
                    fontFamily: '"JetBrains Mono", monospace', outline: 'none'
                  }}
                />
              </div>

              {testStatus && (
                <div style={{
                  padding: '8px 12px', borderRadius: 10, fontSize: 11.5,
                  background: testStatus === 'success' ? '#EDF7EE' : (testStatus === 'testing' ? '#F4F9FD' : '#FEF1F3'),
                  color: testStatus === 'success' ? '#2E6B39' : (testStatus === 'testing' ? '#1E40AF' : '#D14966'),
                  border: `1px solid ${testStatus === 'success' ? '#BCE3C1' : (testStatus === 'testing' ? '#BFDBFE' : '#F8BAC7')}`,
                  display: 'flex', alignItems: 'center', gap: 6
                }}>
                  {testStatus === 'testing' && <RefreshCw size={14} className="animate-spin" />}
                  {testStatus === 'success' && <CheckCircle2 size={14} />}
                  {testStatus === 'failed' && <AlertCircle size={14} />}
                  <span>{testMessage}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing'}
                  style={{
                    flex: 1, padding: '11px 16px', borderRadius: 14,
                    background: 'linear-gradient(135deg, #D4789A 0%, #B8597C 100%)',
                    color: '#fff', border: 'none', fontWeight: 700, fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  {testStatus === 'testing' ? 'Testing...' : 'Test & Save URL'}
                </button>
                <button
                  onClick={handleResetDefault}
                  style={{
                    padding: '11px 14px', borderRadius: 14,
                    background: '#FFF4F7', color: '#B25779',
                    border: '1.5px solid #F5D2DC', fontWeight: 600, fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}

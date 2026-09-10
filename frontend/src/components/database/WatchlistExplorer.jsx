import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Plus, X } from 'lucide-react';
import { getWatchlist, addToWatchlist } from '../../api/client';

export default function WatchlistExplorer() {
  const [watchlist, setWatchlist] = useState([
    {
      id: 1,
      document_number: "X99887766",
      holder_name: "VIKTOR REZNIKOV",
      reason: "Lost & Stolen Passport Database - Counterfeiting Alert",
      severity: "CRITICAL",
      listed_date: "2026-04-12"
    },
    {
      id: 2,
      document_number: "P12345678",
      holder_name: "MARCUS VANCE",
      reason: "Reported Lost in Transit by Passport Agency",
      severity: "HIGH",
      listed_date: "2026-06-20"
    },
    {
      id: 3,
      document_number: "N55443322",
      holder_name: "ALEKSEI VOLKOV",
      reason: "Travel Ban - Revoked Visa & Identity Flag",
      severity: "CRITICAL",
      listed_date: "2026-08-01"
    }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDocNum, setNewDocNum] = useState('');
  const [newName, setNewName] = useState('');
  const [newReason, setNewReason] = useState('');

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await getWatchlist();
        if (res?.watchlist?.length > 0) {
          setWatchlist(res.watchlist);
        }
      } catch (err) {
        console.warn("Using offline watchlist cache", err);
      }
    };
    fetchList();
  }, []);

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!newDocNum || !newName) return;
    try {
      await addToWatchlist({
        document_number: newDocNum,
        holder_name: newName,
        reason: newReason || "Security Alert",
        severity: "HIGH"
      });
      setWatchlist(prev => [
        ...prev,
        {
          id: Date.now(),
          document_number: newDocNum.toUpperCase(),
          holder_name: newName.toUpperCase(),
          reason: newReason || "Security Alert",
          severity: "HIGH",
          listed_date: new Date().toISOString().split('T')[0]
        }
      ]);
      setShowAddModal(false);
      setNewDocNum('');
      setNewName('');
      setNewReason('');
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = watchlist.filter(item =>
    item.document_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.holder_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title */}
      <div>
        <h1 style={{
          fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, cursive, serif',
          fontStyle: 'italic',
          fontSize: 28,
          color: '#2E1B24',
        }}>
          Alert & Wanted List
        </h1>
        <p style={{ fontSize: 13, color: '#846271', marginTop: 2 }}>
          Passports and identity documents flagged for fraud, theft, or travel restrictions.
        </p>
      </div>

      {/* Action Bar */}
      <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: '#FEF1F3', border: '1px solid #F8BAC7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldAlert size={18} color="#D14966" />
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#2E1B24' }}>
              Active Registry
            </div>
            <div style={{ fontSize: 11, color: '#846271' }}>
              {watchlist.length} documents on file
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', width: 240 }}>
            <Search size={14} color="#B99DAA" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              placeholder="Search document # or name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 34, fontSize: 12 }}
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ fontSize: 12, padding: '9px 16px', borderRadius: 12 }}
          >
            <Plus size={14} /> Add New Entry
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden', background: '#FFFFFF' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: '#FFF8FA', borderBottom: '1.5px solid #F7DFE6', color: '#846271', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 16px' }}>Document #</th>
              <th style={{ padding: '12px 16px' }}>Name</th>
              <th style={{ padding: '12px 16px' }}>Alert Reason</th>
              <th style={{ padding: '12px 16px' }}>Severity</th>
              <th style={{ padding: '12px 16px' }}>Listed Date</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #F9EBF0' }}>
                <td style={{ padding: '14px 16px', fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: '#D4789A' }}>
                  {item.document_number}
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: '#2E1B24' }}>
                  {item.holder_name}
                </td>
                <td style={{ padding: '14px 16px', color: '#573B48' }}>
                  {item.reason}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span className={`pill ${item.severity === 'CRITICAL' ? 'pill-red' : 'pill-amber'}`}>
                    {item.severity}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: '#846271', fontFamily: '"JetBrains Mono", monospace', fontSize: 11.5 }}>
                  {item.listed_date}
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#D14966', background: '#FEF1F3', padding: '3px 8px', borderRadius: 6 }}>
                    ACTIVE ALERT
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(46, 27, 36, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid #F3D0DC',
            borderRadius: 20,
            width: '100%',
            maxWidth: 420,
            padding: 24,
            boxShadow: '0 12px 36px rgba(212,120,154,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{
                fontFamily: '"Cormorant Garamond", Georgia, cursive, serif',
                fontStyle: 'italic',
                fontSize: 22,
                color: '#2E1B24',
              }}>
                Add Document to Alert List
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B99DAA' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddEntry} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#573B48', display: 'block', marginBottom: 4 }}>
                  Document Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. L99228811"
                  value={newDocNum}
                  onChange={e => setNewDocNum(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#573B48', display: 'block', marginBottom: 4 }}>
                  Holder Name
                </label>
                <input
                  type="text"
                  placeholder="SURNAME FIRSTNAME"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#573B48', display: 'block', marginBottom: 4 }}>
                  Reason for Flag
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stolen passport reported by holder"
                  value={newReason}
                  onChange={e => setNewReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Alert Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

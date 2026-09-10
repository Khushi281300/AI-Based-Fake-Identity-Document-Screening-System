import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Plus, 
  Trash2, 
  AlertOctagon, 
  GitFork, 
  UserX,
  Radio,
  CheckCircle
} from 'lucide-react';
import { getWatchlist, addToWatchlist } from '../../api/client';

export default function WatchlistExplorer() {
  const [watchlist, setWatchlist] = useState([
    {
      id: 1,
      document_number: "X99887766",
      holder_name: "VIKTOR REZNIKOV",
      reason: "INTERPOL_RED_NOTICE - Counterfeit Syndicate",
      severity: "CRITICAL",
      listed_date: "2026-04-12"
    },
    {
      id: 2,
      document_number: "P12345678",
      holder_name: "MARCUS VANCE",
      reason: "STOLEN_PASSPORT_DATABASE - Lost in Transit",
      severity: "HIGH",
      listed_date: "2026-06-20"
    },
    {
      id: 3,
      document_number: "N55443322",
      holder_name: "ALEKSEI VOLKOV",
      reason: "TRAVEL_BAN_FLAG - Visa Overstay & Identity Fraud",
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
        reason: newReason || "MANUAL_SECURITY_FLAG",
        severity: "HIGH"
      });
      setWatchlist(prev => [
        ...prev,
        {
          id: Date.now(),
          document_number: newDocNum.toUpperCase(),
          holder_name: newName.toUpperCase(),
          reason: newReason || "MANUAL_SECURITY_FLAG",
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
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <span className="text-sm font-semibold text-slate-200">
            Blacklist & Interpol Watchlist Registry
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
            {watchlist.length} Active Records
          </span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search document# or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Watchlist Flag
          </button>
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono text-[11px]">
              <th className="p-3.5">DOCUMENT NO.</th>
              <th className="p-3.5">HOLDER NAME</th>
              <th className="p-3.5">ALERT REASON</th>
              <th className="p-3.5">SEVERITY</th>
              <th className="p-3.5">DATE LISTED</th>
              <th className="p-3.5 text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/40 transition">
                <td className="p-3.5 font-bold text-cyan-300">{item.document_number}</td>
                <td className="p-3.5 text-slate-200">{item.holder_name}</td>
                <td className="p-3.5 text-slate-400 max-w-xs truncate">{item.reason}</td>
                <td className="p-3.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.severity === "CRITICAL"
                        ? "bg-rose-950 text-rose-300 border border-rose-800"
                        : "bg-amber-950 text-amber-300 border border-amber-800"
                    }`}
                  >
                    {item.severity}
                  </span>
                </td>
                <td className="p-3.5 text-slate-400">{item.listed_date}</td>
                <td className="p-3.5 text-right">
                  <span className="text-[10px] text-rose-400 font-bold flex items-center justify-end gap-1">
                    <Radio className="w-2.5 h-2.5 animate-ping" /> ACTIVE
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1329] border border-rose-500/40 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-400" />
              Add Blacklist / Travel Ban Entry
            </h3>
            <form onSubmit={handleAddEntry} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Document Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. X99887766"
                  value={newDocNum}
                  onChange={(e) => setNewDocNum(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Holder Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JOHN DOE"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 uppercase focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Reason / Interpol Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Counterfeit Travel Document Syndicate"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:border-rose-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg"
                >
                  Confirm Watchlist Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

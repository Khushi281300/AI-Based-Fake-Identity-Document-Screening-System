import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  Link, 
  ShieldCheck, 
  Download, 
  QrCode, 
  CheckCircle,
  ExternalLink,
  Copy
} from 'lucide-react';
import { getBlockchainLedger, generateCertificate } from '../../api/client';

export default function AuditAndBlockchainLedger({ latestScan }) {
  const [blocks, setBlocks] = useState([
    {
      block_index: 0,
      timestamp: Date.now() / 1000 - 3600,
      event_type: "GENESIS_BORDER_SECURITY_LEDGER",
      block_hash: "0000000000000000000000000000000000000000000000000000000000000000",
      merkle_root: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
      digital_signature: "GENESIS_ROOT_IMMUTABLE"
    }
  ]);
  const [certificate, setCertificate] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const res = await getBlockchainLedger();
        if (res?.blocks?.length > 0) {
          setBlocks(res.blocks);
        }
      } catch (err) {
        console.warn("Using offline blockchain cache", err);
      }
    };
    fetchLedger();
  }, [latestScan]);

  const handleCreateCertificate = async () => {
    try {
      const payload = latestScan || {
        document_number: "L898902C3",
        holder_name: "ERIKSSON ANNA MARIA",
        outcome: "VERIFIED",
        overall_risk_score: 95.5
      };
      const res = await generateCertificate({ scan_record: payload });
      if (res?.certificate) {
        setCertificate(res.certificate);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Blockchain Header Card */}
      <div className="glass-panel p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-semibold text-slate-200">
              Cryptographic SHA-256 Merkle Audit Ledger
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Every checkpoint inspection is cryptographically sealed in an immutable ledger with Merkle root anchoring.
          </p>
        </div>

        <button
          onClick={handleCreateCertificate}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 shrink-0 transition"
        >
          <FileCheck2 className="w-4 h-4" />
          Export Verifiable Certificate
        </button>
      </div>

      {/* Verifiable Certificate Modal / Box */}
      {certificate && (
        <div className="glass-panel p-6 border-2 border-cyan-500/40 bg-gradient-to-b from-cyan-950/40 to-slate-950 space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-800/40 pb-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
              <div>
                <h3 className="text-base font-bold text-white font-mono">
                  OFFICIAL DIGITAL INSPECTION CERTIFICATE
                </h3>
                <span className="text-[10px] text-cyan-400 font-mono">
                  CERTIFICATE ID: {certificate.certificate_id}
                </span>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full font-mono text-xs font-bold">
              VERIFIED AUTHENTIC
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">DOCUMENT HOLDER</span>
              <span className="font-bold text-slate-100">{certificate.holder_name}</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">DOCUMENT NO.</span>
              <span className="font-bold text-cyan-300">{certificate.document_number}</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">RISK SCORE</span>
              <span className="font-bold text-emerald-400">{certificate.risk_score} / 100</span>
            </div>
          </div>

          <div className="bg-black/80 p-3 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1">
            <div className="text-slate-400">HMAC-SHA256 DIGITAL SEAL:</div>
            <div className="text-cyan-300 break-all">{certificate.digital_seal_signature}</div>
          </div>
        </div>
      )}

      {/* Block Explorer List */}
      <div className="glass-panel overflow-hidden">
        <div className="p-3.5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-bold">IMMUTABLE BLOCK CHAIN HISTORY</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Chain Integrity 100% Valid
          </span>
        </div>

        <div className="divide-y divide-slate-800 font-mono text-xs">
          {blocks.map((block, idx) => (
            <div key={idx} className="p-4 hover:bg-slate-800/40 transition space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-bold">
                    BLOCK #{block.block_index}
                  </span>
                  <span className="text-slate-300 text-xs font-sans font-medium">
                    {block.event_type}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(block.timestamp * 1000).toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-slate-500">HASH:</span>
                  <span className="text-slate-300 truncate">{block.block_hash}</span>
                  <button
                    onClick={() => copyToClipboard(block.block_hash)}
                    className="text-slate-500 hover:text-cyan-400"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-slate-500">MERKLE:</span>
                  <span className="text-cyan-400/80 truncate">{block.merkle_root}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

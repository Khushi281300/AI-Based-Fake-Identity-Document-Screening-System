import React from 'react';
import { 
  Binary, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Check, 
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';

export default function MRZCard({ documentFields, reconciliation }) {
  const mrz = documentFields || {};
  const checkDigits = mrz.check_digits || {};
  const rawMRZ = mrz.raw_mrz || [
    "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
    "L898902C36UTO7408122F3004159ZE184226B<<<<<10"
  ];

  const checksList = [
    {
      id: 'doc_num',
      name: 'Document Number Checksum',
      key: 'document_number',
      item: checkDigits.document_number || { expected: '6', calculated: '6', valid: true },
      desc: 'Validates passport sequence using 7-3-1 weight sum modulo 10.'
    },
    {
      id: 'dob',
      name: 'Date of Birth Checksum',
      key: 'date_of_birth',
      item: checkDigits.date_of_birth || { expected: '2', calculated: '2', valid: true },
      desc: 'Validates holder birth date against printed optical records.'
    },
    {
      id: 'expiry',
      name: 'Expiry Date Checksum',
      key: 'expiry_date',
      item: checkDigits.expiry_date || { expected: '9', calculated: '9', valid: true },
      desc: 'Detects illegal extension or tampered expiration digits.'
    },
    {
      id: 'composite',
      name: 'Overall Composite Checksum',
      key: 'composite',
      item: checkDigits.composite || { expected: '0', calculated: '0', valid: true },
      desc: 'Mathematically verifies all data fields across the entire machine readable zone.'
    }
  ];

  return (
    <div className="space-y-4">
      {/* MRZ Character Grid Box */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Binary className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-slate-200">ICAO Doc 9303 MRZ Optical Grid</span>
            <span className="text-xs font-mono text-cyan-400">({mrz.format || "TD3"} Standard)</span>
          </div>

          {mrz.all_check_digits_valid ? (
            <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              CHECKSUMS VALID
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md bg-rose-950/80 text-rose-300 border border-rose-800 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              CHECKSUM CORRUPTED / TAMPERED
            </span>
          )}
        </div>

        {/* Character Stream Display */}
        <div className="bg-black/90 p-4 rounded-xl border border-cyan-900/40 font-mono text-base tracking-widest text-cyan-300 shadow-inner overflow-x-auto space-y-2">
          {rawMRZ.map((line, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-slate-600 text-xs select-none">L{idx + 1}</span>
              <span className="font-bold text-sky-300 hover:text-white transition cursor-text">
                {line}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Check-Digit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {checksList.map((check) => {
          const isValid = check.item.valid;
          return (
            <div
              key={check.id}
              className={`glass-panel p-4 flex flex-col justify-between border ${
                isValid
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : 'border-rose-500/50 bg-rose-950/20 shadow-lg shadow-rose-500/10'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-300">{check.name}</span>
                  {isValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 animate-bounce" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{check.desc}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block">EXPECTED</span>
                  <span className="font-bold text-slate-200">{check.item.expected}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">CALCULATED</span>
                  <span className={`font-bold ${isValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {check.item.calculated}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] block">STATUS</span>
                  <span className={`font-bold ${isValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isValid ? 'VALID' : 'FAIL'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Decoded Structured Document Fields */}
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-slate-200">Decoded Structured Metadata</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">FULL NAME</span>
            <span className="font-bold text-slate-100 mt-0.5 block">{mrz.full_name || "ERIKSSON ANNA MARIA"}</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">DOCUMENT NUMBER</span>
            <span className="font-mono font-bold text-cyan-300 mt-0.5 block">{mrz.document_number || "L898902C3"}</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">DATE OF BIRTH</span>
            <span className="font-mono font-bold text-slate-100 mt-0.5 block">{mrz.date_of_birth || "1974-08-12"}</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] block">EXPIRY DATE</span>
            <span className="font-mono font-bold text-slate-100 mt-0.5 block">{mrz.expiry_date || "2030-04-15"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

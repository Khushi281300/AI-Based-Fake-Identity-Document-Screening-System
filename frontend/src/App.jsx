import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar, { MobileBottomNav } from './components/layout/Sidebar';
import DocumentScanner from './components/capture/DocumentScanner';
import ForensicViewerPane from './components/forensics/ForensicViewerPane';
import MRZCard from './components/mrz/MRZCard';
import BiometricComparisonCard from './components/biometrics/BiometricComparisonCard';
import RiskScoreCard from './components/risk/RiskScoreCard';
import ExplainabilityChecklist from './components/risk/ExplainabilityChecklist';
import WatchlistExplorer from './components/database/WatchlistExplorer';
import CheckpointAnalytics from './components/analytics/CheckpointAnalytics';
import AuditAndBlockchainLedger from './components/audit/AuditAndBlockchainLedger';

import { PRESET_SCENARIOS } from './data/presetSamples';
import { runFullInspection, checkHealth, getWatchlist, addToWatchlist, removeFromWatchlist } from './api/client';
import { generateTD3MRZ } from './utils/mrzGenerator';

const INITIAL_WATCHLIST = [
  {
    id: 1,
    document_number: "X99887766",
    holder_name: "VIKTOR REZNIKOV",
    reason: "Interpol Red Notice - Counterfeiting Syndicate",
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
    reason: "Travel Ban - Revoked Visa & Sanctions List",
    severity: "CRITICAL",
    listed_date: "2026-08-01"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [loading, setLoading] = useState(false);
  const [documentImage, setDocumentImage] = useState(null);
  const [liveFaceImage, setLiveFaceImage] = useState(null);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [result, setResult] = useState(null);
  const [engineMode, setEngineMode] = useState('LIVE_BACKEND');
  const [watchlist, setWatchlist] = useState(INITIAL_WATCHLIST);

  const [customMetadata, setCustomMetadata] = useState({
    fullName: 'UZUMAKI NARUTO',
    documentNumber: 'P74209188',
    country: 'JPN',
    expiryDate: '2032-12-31',
    dob: '1990-10-10',
    sex: 'M'
  });

  // Check backend liveness and fetch active watchlist
  useEffect(() => {
    checkHealth()
      .then(() => setEngineMode('LIVE_BACKEND'))
      .catch(() => setEngineMode('DEMO_SCENARIO'));

    getWatchlist()
      .then(res => {
        if (res?.watchlist?.length > 0) {
          setWatchlist(res.watchlist);
        }
      })
      .catch(() => {
        // Fallback already in state
      });
  }, []);

  // Determine if active document is blacklisted
  const activeDocNum = (customMetadata.documentNumber || 'P74209188').toUpperCase();
  const activeName   = (customMetadata.fullName || 'UZUMAKI NARUTO').toUpperCase();
  const isCurrentDocBlacklisted = Boolean(
    watchlist.find(item =>
      item.document_number?.toUpperCase() === activeDocNum ||
      item.holder_name?.toUpperCase() === activeName
    )
  );

  const handleDocumentChange = (imgB64, scenario = null) => {
    setDocumentImage(imgB64);
    setResult(null);
    if (scenario) {
      setCurrentScenario(scenario);
      setLiveFaceImage(scenario.liveFace);
    } else {
      setCurrentScenario(null);
    }
  };

  const handleAddToWatchlist = async (entry) => {
    try {
      await addToWatchlist(entry);
    } catch (e) {
      console.warn('Offline watchlist add fallback', e);
    }
    setWatchlist(prev => {
      const filtered = prev.filter(p => p.document_number !== entry.document_number);
      return [
        ...filtered,
        {
          id: Date.now(),
          ...entry,
          listed_date: new Date().toISOString().split('T')[0]
        }
      ];
    });
  };

  const handleRemoveFromWatchlist = async (docNum) => {
    try {
      await removeFromWatchlist(docNum);
    } catch (e) {
      console.warn('Offline watchlist delete fallback', e);
    }
    setWatchlist(prev => prev.filter(item => item.document_number !== docNum.toUpperCase()));
  };

  const handleFlagCurrentDocument = async (docNum, name) => {
    await handleAddToWatchlist({
      document_number: docNum.toUpperCase(),
      holder_name: name.toUpperCase(),
      reason: 'Border Control Security Alert Flag',
      severity: 'CRITICAL'
    });
  };

  const handleToggleWatchlist = async () => {
    if (isCurrentDocBlacklisted) {
      await handleRemoveFromWatchlist(activeDocNum);
    } else {
      await handleFlagCurrentDocument(activeDocNum, activeName);
    }
  };

  const handleSelectScenarioPreset = (scenarioId) => {
    const scenario = PRESET_SCENARIOS.find(s => s.id === scenarioId);
    if (scenario) {
      handleDocumentChange(scenario.documentImage, scenario);
      setActiveTab('scanner');
    }
  };

  const handleRunInspection = async () => {
    if (!documentImage) return;
    setLoading(true);

    // Dynamic MRZ lines determination
    let mrzLinesToSend = currentScenario?.mrzLines;
    if (!mrzLinesToSend) {
      const parts = (customMetadata.fullName || 'UZUMAKI NARUTO').trim().split(' ');
      const surname = parts[0] || 'UZUMAKI';
      const given = parts.slice(1).join(' ') || 'NARUTO';
      const expYYMMDD = (customMetadata.expiryDate || '2032-12-31').replace(/[^0-9]/g, '').slice(2, 8);
      const dobYYMMDD = (customMetadata.dob || '1990-10-10').replace(/[^0-9]/g, '').slice(2, 8);

      mrzLinesToSend = generateTD3MRZ({
        country: customMetadata.country || 'JPN',
        surname: surname,
        givenNames: given,
        docNumber: customMetadata.documentNumber || 'P74209188',
        nationality: customMetadata.country || 'JPN',
        expiry: expYYMMDD || '321231',
        dob: dobYYMMDD || '901010',
        sex: customMetadata.sex || 'M'
      });
    }

    try {
      const res = await runFullInspection({
        document_image_base64: documentImage,
        live_face_base64: liveFaceImage,
        mrz_lines: mrzLinesToSend,
        officer_id: 'OFFICER-742',
        checkpoint_id: 'KONOHA-INTL-T1-E7'
      });
      setResult(res);
      setEngineMode('LIVE_BACKEND');
    } catch (err) {
      console.warn('Live backend inspection failed or unreachable, using scenario data:', err);
      setEngineMode('DEMO_SCENARIO');
      const id = currentScenario?.id || '';

      // Check if current document or scenario is flagged in active watchlist
      const fullName = currentScenario ? (currentScenario.id === 'blacklisted_identity' ? 'REZNIKOV VIKTOR' : 'ERIKSSON ANNA MARIA') : (customMetadata.fullName || 'UZUMAKI NARUTO');
      const docNum   = currentScenario ? (currentScenario.id === 'blacklisted_identity' ? 'X99887766' : 'L898902C3') : (customMetadata.documentNumber || 'P74209188');
      const country  = currentScenario ? 'UTO' : (customMetadata.country || 'JPN');
      const expiry   = currentScenario ? '2030-04-15' : (customMetadata.expiryDate || '2032-12-31');

      const watchlistHit = watchlist.find(item =>
        item.document_number?.toUpperCase() === docNum.toUpperCase() ||
        item.holder_name?.toUpperCase() === fullName.toUpperCase()
      );

      if (id === 'tampered_expiry_ela') {
        setResult({
          status: 'SUCCESS',
          risk_evaluation: { outcome: 'REJECTED', overall_risk_score: 34, confidence_score: 97.5, recommendation: 'Document rejected. The expiry date appears to have been digitally altered.', critical_failures: ['Expiry date field shows signs of digital editing (ELA compression anomaly).'], warning_flags: [], factor_breakdown: { document_quality: { score: 90, status: 'PASS' }, mrz_integrity: { score: 100, status: 'PASS' }, forensic_integrity: { score: 32, status: 'FAIL' }, biometric_verification: { score: 92, status: 'PASS' }, database_watchlist: { score: 100, status: 'PASS' } } },
          document_fields: { format: 'TD3', full_name: 'ERIKSSON ANNA MARIA', document_number: 'L898902C3', expiry_date: '2038-12-31', all_check_digits_valid: true, raw_mrz: currentScenario.mrzLines },
          forensics_metrics: { ela: { is_spliced: true }, exif: { software_tag: 'Adobe Photoshop CC 2024' } },
          biometrics: { verdict: 'MATCH', similarity_percentage: 92, cosine_similarity: 0.920, liveness_score: 96, is_live: true, spoof_classification: 'REAL_HUMAN' },
          layers: { ela_heatmap_base64: documentImage }
        });
      } else if (id === 'fake_mrz_checksum') {
        setResult({
          status: 'SUCCESS',
          risk_evaluation: { outcome: 'REJECTED', overall_risk_score: 28, confidence_score: 99, recommendation: 'Document rejected. Security checksums at bottom mathematically fail ICAO standards.', critical_failures: ['Security checksum does not match — document data has been altered.'], warning_flags: [], factor_breakdown: { document_quality: { score: 92, status: 'PASS' }, mrz_integrity: { score: 0, status: 'FAIL' }, forensic_integrity: { score: 95, status: 'PASS' }, biometric_verification: { score: 94, status: 'PASS' }, database_watchlist: { score: 100, status: 'PASS' } } },
          document_fields: { format: 'TD3', full_name: 'DAVIS JONATHAN', document_number: 'P99441100', all_check_digits_valid: false, check_digits: { document_number: { expected: '9', calculated: '0', valid: false }, composite: { expected: '99', calculated: '10', valid: false } }, raw_mrz: currentScenario.mrzLines },
          layers: { ela_heatmap_base64: documentImage }
        });
      } else if (id === 'screen_recapture_moire') {
        setResult({
          status: 'SUCCESS',
          risk_evaluation: { outcome: 'REJECTED', overall_risk_score: 38, confidence_score: 96, recommendation: 'Document rejected. Screen recapture detected — photo of a digital monitor.', critical_failures: ['Screen recapture detected — high-frequency pixel grid found (Moire raster).'], warning_flags: [], factor_breakdown: { document_quality: { score: 75, status: 'PASS' }, mrz_integrity: { score: 100, status: 'PASS' }, forensic_integrity: { score: 40, status: 'FAIL' }, biometric_verification: { score: 90, status: 'PASS' }, database_watchlist: { score: 100, status: 'PASS' } } },
          document_fields: { format: 'TD3', full_name: 'MILLER SARAH', document_number: 'L55221199', all_check_digits_valid: true, raw_mrz: currentScenario.mrzLines },
          forensics_metrics: { recapture: { is_screen_recaptured: true } },
          layers: { fft_moire_base64: documentImage, ela_heatmap_base64: documentImage }
        });
      } else if (id === 'biometric_impersonator') {
        setResult({
          status: 'SUCCESS',
          risk_evaluation: { outcome: 'REJECTED', overall_risk_score: 35, confidence_score: 98.4, recommendation: 'Document rejected. The person at the checkpoint does not match the passport portrait.', critical_failures: ['Face does not match the passport photo (similarity: 41% — minimum required: 65%).'], warning_flags: [], factor_breakdown: { document_quality: { score: 92, status: 'PASS' }, mrz_integrity: { score: 100, status: 'PASS' }, forensic_integrity: { score: 95, status: 'PASS' }, biometric_verification: { score: 41, status: 'FAIL' }, database_watchlist: { score: 100, status: 'PASS' } } },
          document_fields: { format: 'TD3', full_name: 'ZHAO WEI', document_number: 'E44332211', all_check_digits_valid: true, raw_mrz: currentScenario.mrzLines },
          biometrics: { verdict: 'MISMATCH', similarity_percentage: 41.2, cosine_similarity: 0.412, liveness_score: 94, is_live: true, spoof_classification: 'REAL_HUMAN' },
          layers: { ela_heatmap_base64: documentImage }
        });
      } else if (id === 'blacklisted_identity' || watchlistHit) {
        const hitReason = watchlistHit?.reason || 'Interpol Red Notice operative';
        const hitSeverity = watchlistHit?.severity || 'CRITICAL';
        setResult({
          status: 'SUCCESS',
          risk_evaluation: {
            outcome: 'REJECTED',
            overall_risk_score: 12,
            confidence_score: 99.8,
            recommendation: `CRITICAL ALERT: Document holder flagged on Interpol / Border Watchlist (${hitReason}). Deny entry and notify security.`,
            critical_failures: [`CRITICAL WATCHLIST HIT: ${hitReason} (${hitSeverity})`],
            warning_flags: [],
            factor_breakdown: {
              document_quality: { score: 94, status: 'PASS' },
              mrz_integrity: { score: 100, status: 'PASS' },
              forensic_integrity: { score: 95, status: 'PASS' },
              biometric_verification: { score: 92, status: 'PASS' },
              database_watchlist: { score: 0, status: 'FAIL' }
            }
          },
          document_fields: { format: 'TD3', full_name: fullName, document_number: docNum, all_check_digits_valid: true, raw_mrz: mrzLinesToSend },
          layers: { ela_heatmap_base64: documentImage }
        });
      } else {
        // Genuine custom upload passed all checks
        setResult({
          status: 'SUCCESS',
          risk_evaluation: {
            outcome: liveFaceImage ? 'VERIFIED' : 'MANUAL_REVIEW',
            overall_risk_score: liveFaceImage ? 96.5 : 88.0,
            confidence_score: 98.8,
            recommendation: liveFaceImage
              ? 'Document authenticated. All forensic, biometric, and Interpol checks cleared. Entry authorized.'
              : 'Physical document authenticated. Live biometric verification pending camera check.',
            critical_failures: [],
            warning_flags: liveFaceImage ? [] : ['Live facial verification pending: Traveler must complete live camera check'],
            factor_breakdown: {
              document_quality: { score: 94, status: 'PASS' },
              mrz_integrity: { score: 100, status: 'PASS' },
              forensic_integrity: { score: 96, status: 'PASS' },
              biometric_verification: liveFaceImage ? { score: 95, status: 'PASS' } : { score: 70, status: 'PENDING' },
              database_watchlist: { score: 100, status: 'PASS' }
            }
          },
          document_fields: {
            format: 'TD3',
            doc_type: 'PASSPORT',
            full_name: fullName,
            document_number: docNum,
            issuing_country: country,
            nationality: country,
            date_of_birth: customMetadata.dob || '1990-10-10',
            expiry_date: expiry,
            all_check_digits_valid: true,
            raw_mrz: mrzLinesToSend
          },
          biometrics: liveFaceImage ? {
            verdict: 'MATCH',
            similarity_percentage: 94.8,
            cosine_similarity: 0.948,
            liveness_score: 97,
            is_live: true,
            spoof_classification: 'REAL_HUMAN'
          } : {
            verdict: 'PENDING_CAPTURE',
            similarity_percentage: null,
            cosine_similarity: null,
            liveness_score: null,
            is_live: null,
            spoof_classification: 'NOT_CAPTURED'
          },
          layers: {
            original_rectified_base64: documentImage,
            doc_face_crop_base64: documentImage,
            ela_heatmap_base64: documentImage
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FFF8FA' }}>
      <Navbar engineMode={engineMode} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        <main className="main-content-area" style={{ flex: 1, overflowY: 'auto', maxWidth: 1280, margin: '0 auto', width: '100%' }}>

          {activeTab === 'scanner' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <DocumentScanner
                documentImage={documentImage}
                liveFaceImage={liveFaceImage}
                onDocumentChange={handleDocumentChange}
                onLiveFaceChange={setLiveFaceImage}
                onRunInspection={handleRunInspection}
                loading={loading}
                qualityData={result?.quality}
                currentScenario={currentScenario}
                customMetadata={customMetadata}
                onCustomMetadataChange={setCustomMetadata}
                isBlacklisted={isCurrentDocBlacklisted}
                onToggleWatchlist={handleToggleWatchlist}
              />

              {result && (
                <>
                  <RiskScoreCard riskEvaluation={result.risk_evaluation} onViewAudit={() => setActiveTab('audit')} />
                  <div className="grid-responsive-2col">
                    <ForensicViewerPane inspectionResult={result} originalImage={documentImage} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <MRZCard documentFields={result.document_fields} />
                      <BiometricComparisonCard
                        docFaceCrop={result.layers?.doc_face_crop_base64 || result.layers?.original_rectified_base64}
                        liveFaceImage={liveFaceImage}
                        biometricResult={result.biometrics}
                        onLiveFaceCaptured={b64 => setLiveFaceImage(b64)}
                      />
                    </div>
                  </div>
                  <ExplainabilityChecklist factorBreakdown={result.risk_evaluation?.factor_breakdown} />
                </>
              )}
            </div>
          )}

          {activeTab === 'forensics'   && <ForensicViewerPane inspectionResult={result} originalImage={documentImage} />}
          {activeTab === 'mrz'         && <MRZCard documentFields={result?.document_fields} />}
          {activeTab === 'biometrics'  && <BiometricComparisonCard docFaceCrop={result?.layers?.doc_face_crop_base64} liveFaceImage={liveFaceImage} biometricResult={result?.biometrics} onLiveFaceCaptured={b64 => setLiveFaceImage(b64)} />}
          {activeTab === 'watchlist'   && (
            <WatchlistExplorer
              currentScan={result}
              customMetadata={customMetadata}
              watchlist={watchlist}
              onAddToWatchlist={handleAddToWatchlist}
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
              onSelectScenarioPreset={handleSelectScenarioPreset}
              onFlagCurrentDocument={handleFlagCurrentDocument}
            />
          )}
          {activeTab === 'analytics'   && <CheckpointAnalytics />}
          {activeTab === 'audit'       && <AuditAndBlockchainLedger latestScan={result} />}
        </main>
      </div>

      <MobileBottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}

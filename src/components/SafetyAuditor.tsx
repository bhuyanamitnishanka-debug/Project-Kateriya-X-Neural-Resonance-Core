import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, ArrowRight, RefreshCw, CheckCircle2, XCircle, FileDown, Download } from 'lucide-react';
import { BIOLOGICAL_SAFETY_TEST_CASES } from '../data/scientificData';
import { generateSessionPdf } from '../utils/pdfGenerator';

export const SafetyAuditor: React.FC = () => {
  const [inputHypothesis, setInputHypothesis] = useState<string>(
    BIOLOGICAL_SAFETY_TEST_CASES[0].hypothesis
  );
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const runAudit = async (customText?: string) => {
    const text = customText || inputHypothesis;
    if (!text.trim() || isAuditing) return;

    setIsAuditing(true);
    setAuditResult(null);

    try {
      const response = await fetch('/api/safety-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hypothesis: text }),
      });

      const data = await response.json();
      setAuditResult(data.audit);
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleDownloadSafetyPdf = () => {
    setIsExportingPdf(true);
    try {
      generateSessionPdf({
        sessionTitle: 'Kateriya-X Biological Safety & Audit Dossier',
        subjectId: 'KX-AUDIT-SAFE-901',
        leadInvestigator: 'Chief Biosafety Officer / Neuro-Engineer',
        activeNodeName: 'Blood-Brain Barrier & Cortical Matrix',
        activeRegion: 'Systemic & Transcranial Delivery Envelope',
        glutamateLevel: 60,
        gabaLevel: 40,
        eiRatio: '1.50',
        recallScore: 88,
        isLtpActive: false,
        contactImpedance: '7.8',
        laserFluence: '14.2',
        wavelength: 1064,
        acousticFreq: '10.4',
        acousticPressure: '18.4',
        axialResolution: '280',
        snr: '34.2',
        safetyAuditHypothesis: inputHypothesis,
        safetyAuditResult: auditResult,
        notes: 'Biological safety evaluation complete. Organic solvents and unshielded lysis vectors rejected; engineered biocompatible AAV/LNP and photoacoustic array approved.',
      });

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to generate Safety PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Biological Safety & Hypothesis Auditor
            </h3>
            <p className="text-xs text-slate-400">
              Rigorous 3-step validation: Premise Validation → Biochemical Failure Analysis → Viable Engineered Pivot
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-rose-400 bg-rose-950/60 border border-rose-800 px-2.5 py-1 rounded">
            BIOSAFETY LEVEL-1 / IN SILICO AUDIT
          </span>

          {/* GENERATE AND DOWNLOAD PDF SUMMARY BUTTON IN SAFETY AUDITOR */}
          <button
            onClick={handleDownloadSafetyPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white rounded transition shadow-lg shadow-cyan-600/20"
            title="Download PDF Summary of the safety audit report and resonance telemetry"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'Exporting PDF...' : 'Download Safety PDF'}</span>
          </button>
        </div>
      </div>

      {/* Export Success Notification */}
      {exportSuccess && (
        <div className="bg-emerald-950/90 border-b border-emerald-800 px-4 py-2 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>Safety Dossier Downloaded:</strong> Official PDF report containing hypothesis evaluation, cytotoxicity analysis, and resonance metrics saved!
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">PDF SAVED</span>
        </div>
      )}

      <div className="p-5 space-y-5">
        {/* Presets Grid */}
        <div>
          <span className="text-xs font-semibold text-slate-300 block mb-2">
            Select Radical / Hazardous Test Proposals:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BIOLOGICAL_SAFETY_TEST_CASES.map((tc, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputHypothesis(tc.hypothesis);
                  runAudit(tc.hypothesis);
                }}
                className={`p-2.5 rounded-lg border text-left transition flex items-start justify-between gap-2 text-xs ${
                  inputHypothesis === tc.hypothesis
                    ? 'bg-rose-950/40 border-rose-700/80 text-rose-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="font-semibold block text-white">{tc.name}</span>
                  <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{tc.hypothesis}</span>
                </div>
                <span className="text-[10px] font-mono text-rose-400 font-bold shrink-0 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-900">
                  {tc.dangerLevel}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Or Input Any Medical / Sci-Fi Delivery Hypothesis to Audit:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputHypothesis}
              onChange={(e) => setInputHypothesis(e.target.value)}
              placeholder="e.g. Can we deliver Channelrhodopsin through ultrasound microbubbles or ethanol solvent?"
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={() => runAudit()}
              disabled={isAuditing || !inputHypothesis.trim()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-rose-600/20"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Audit Hypothesis</span>
            </button>
          </div>
        </div>

        {/* Audit Results Container */}
        {isAuditing && (
          <div className="p-8 border border-slate-800 rounded-xl bg-slate-950/50 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-rose-400" />
            <p className="text-xs text-slate-400 font-mono">
              Running cellular lysis, membrane thermodynamics, and acoustic impedance simulations...
            </p>
          </div>
        )}

        {auditResult && (
          <div className="border border-slate-800 rounded-xl bg-slate-950/80 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Audit Resolution & Engineering Pivot
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-cyan-400">
                  Protocol: Kateriya-X Safe Transduction
                </span>
                <button
                  onClick={handleDownloadSafetyPdf}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-xs flex items-center gap-1 border border-cyan-800/60"
                  title="Download PDF"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Report</span>
                </button>
              </div>
            </div>

            <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed space-y-3">
              {auditResult.split('\n').map((line: string, i: number) => {
                if (line.startsWith('### ')) {
                  return (
                    <h4 key={i} className="text-sm font-bold text-cyan-300 mt-4 mb-2 tracking-wide uppercase">
                      {line.replace('### ', '')}
                    </h4>
                  );
                } else if (line.startsWith('**') && line.endsWith('**')) {
                  return (
                    <p key={i} className="text-sm font-bold text-white mt-2">
                      {line.replace(/\*\*/g, '')}
                    </p>
                  );
                } else if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                  return (
                    <div key={i} className="flex items-start gap-2 my-1 pl-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <span>{line.replace(/^[\*\-]\s+/, '')}</span>
                    </div>
                  );
                } else if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
                  return null;
                }
                return <p key={i}>{line}</p>;
              })}
            </div>

            {/* Static Visual Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs mb-1">
                  <XCircle className="w-4 h-4" /> Why The Proposal Fails Biochemically
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Triggers lipid membrane dissolution, widespread capillary endothelial cell lysis, and protein denaturation, causing fatal neuroinflammation and acute acoustic impedance collapse.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-1">
                  <CheckCircle2 className="w-4 h-4" /> Engineered Kateriya-X Alternative
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Uses ApoE-functionalized biomimetic lipid nanoparticles or AAV-PHP.eB retrograde viral capsids crossing the intact Blood-Brain Barrier via receptor-mediated transcytosis, coupled with pulsed NIR-II photoacoustic arrays.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

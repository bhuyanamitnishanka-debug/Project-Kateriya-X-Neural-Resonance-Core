import React, { useState } from 'react';
import { Activity, Brain, Zap, RefreshCw, FileDown, CheckCircle2, Sliders, ShieldCheck, Download } from 'lucide-react';
import { EngramNode } from '../types';
import { generateSessionPdf } from '../utils/pdfGenerator';

export const EngramMap: React.FC = () => {
  const [glutamateLevel, setGlutamateLevel] = useState<number>(65); // %
  const [gabaLevel, setGabaLevel] = useState<number>(35); // %
  const [selectedNodeId, setSelectedNodeId] = useState<string>('ca1');
  const [isLtpActive, setIsLtpActive] = useState<boolean>(false);
  const [recallScore, setRecallScore] = useState<number>(84);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Subject and investigator session details
  const [subjectId, setSubjectId] = useState<string>('KX-SUBJ-8492');
  const [investigatorName, setInvestigatorName] = useState<string>('Dr. S. Kateriya Research Fellow');
  const [sessionNotes, setSessionNotes] = useState<string>('High-density opto-acoustic resonance verified. Theta-burst LTP potentiation stable across hippocampal CA1 network.');

  const initialNodes: EngramNode[] = [
    {
      id: 'ca1',
      name: 'Hippocampus (CA1)',
      region: 'Medial Temporal Lobe',
      description: 'Primary episodic memory consolidation hub. Expresses high density of NMDA/AMPA receptors; subject to theta-frequency opto-acoustic LTP.',
      neurotransmitters: ['Glutamate (AMPA/NMDA)', 'Acetylcholine'],
      connectivity: ['ca3', 'mpfc', 'bla'],
      x: 230,
      y: 190,
      activationLevel: 0.85,
      optogeneticTarget: 'CaMKIIα::ChR2-H134R',
    },
    {
      id: 'ca3',
      name: 'Hippocampus (CA3)',
      region: 'Dentate Gyrus Recurrent Loop',
      description: 'Pattern completion and rapid associative memory storage via recurrent collaterals. Highly susceptible to optogenetic tag-and-recall paradigms.',
      neurotransmitters: ['Glutamate', 'Mossy Fiber Dynorphin'],
      connectivity: ['ca1'],
      x: 160,
      y: 220,
      activationLevel: 0.72,
      optogeneticTarget: 'Fos::tTA / TRE::Chrimson',
    },
    {
      id: 'bla',
      name: 'Basolateral Amygdala (BLA)',
      region: 'Limbic Complex',
      description: 'Emotional valence and conditioned fear engrams. Targeted by optogenetic ArchT silencers to extinguish traumatic recall non-invasively.',
      neurotransmitters: ['Glutamate', 'GABA Interneurons', 'CRF'],
      connectivity: ['ca1', 'mpfc', 'striatum'],
      x: 290,
      y: 240,
      activationLevel: 0.45,
      optogeneticTarget: 'Syn1::eNpHR3.0 / ChR2',
    },
    {
      id: 'mpfc',
      name: 'Medial Prefrontal Cortex (mPFC)',
      region: 'Frontal Cortex',
      description: 'Remote memory storage and top-down cognitive inhibition. Sends dense GABAergic feedback to amygdalar intercalated cells.',
      neurotransmitters: ['Glutamate', 'Dopamine D1/D2', 'GABA'],
      connectivity: ['ca1', 'bla', 'striatum'],
      x: 370,
      y: 120,
      activationLevel: 0.68,
      optogeneticTarget: 'CaMKIIα::Chronos',
    },
    {
      id: 'striatum',
      name: 'Dorsal Striatum',
      region: 'Basal Ganglia',
      description: 'Procedural engrams, motor habits, and sensorimotor integration. Coordinates with thalamic feedback loops.',
      neurotransmitters: ['GABA (MSNs)', 'Dopamine', 'Substance P'],
      connectivity: ['mpfc', 'bla'],
      x: 340,
      y: 200,
      activationLevel: 0.54,
      optogeneticTarget: 'Drd1/Drd2::ChR2',
    },
  ];

  const [nodes, setNodes] = useState<EngramNode[]>(initialNodes);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const triggerLtp = () => {
    setIsLtpActive(true);
    setRecallScore((prev) => Math.min(99, prev + 8));

    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        activationLevel: Math.min(1.0, node.activationLevel + 0.2),
      }))
    );

    setTimeout(() => {
      setIsLtpActive(false);
    }, 1800);
  };

  const resetEngrams = () => {
    setNodes(initialNodes);
    setRecallScore(84);
  };

  const handleDownloadPdf = () => {
    setIsExportingPdf(true);
    try {
      generateSessionPdf({
        sessionTitle: 'Kateriya-X Neural Resonance Research Session',
        subjectId,
        leadInvestigator: investigatorName,
        activeNodeName: selectedNode.name,
        activeRegion: selectedNode.region,
        glutamateLevel,
        gabaLevel,
        eiRatio: (glutamateLevel / gabaLevel).toFixed(2),
        recallScore,
        isLtpActive,
        contactImpedance: '7.8',
        laserFluence: '14.2',
        wavelength: 1064,
        acousticFreq: '10.4',
        acousticPressure: '18.4',
        axialResolution: '280',
        snr: '34.2',
        cognitiveState: 'Focused',
        stateConfidence: 94.6,
        alphaPower: 38.2,
        betaPower: 46.5,
        deltaPower: 15.3,
        entrainmentActive: isLtpActive,
        notes: sessionNotes,
      });

      setExportSuccess(true);
      setShowExportModal(false);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Whole-Brain Engram & Neuroplasticity Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Glutamate (AMPA/NMDA) vs GABA synaptic dynamics & opto-acoustic LTP read/write
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerLtp}
            disabled={isLtpActive}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white rounded transition shadow-lg shadow-indigo-600/20"
          >
            <Zap className={`w-3.5 h-3.5 ${isLtpActive ? 'animate-bounce text-amber-300' : ''}`} />
            <span>{isLtpActive ? 'Inducing LTP...' : 'Opto-Acoustic LTP Pulse'}</span>
          </button>

          {/* GENERATE AND DOWNLOAD PDF SUMMARY BUTTON */}
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white rounded transition shadow-lg shadow-cyan-600/20"
            title="Generate and download a comprehensive clinical PDF report of current resonance metrics and engram session data"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Generate & Download PDF</span>
          </button>

          <button
            onClick={resetEngrams}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded border border-slate-700 transition"
            title="Reset Engrams"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Export Success Toast Banner */}
      {exportSuccess && (
        <div className="bg-emerald-950/90 border-b border-emerald-800 px-4 py-2 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>Dossier Generated:</strong> Session PDF downloaded with opto-acoustic resonance metrics, engram coordinates, and biosafety checksum!
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">PDF EXPORT COMPLETE</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Interactive Neural Network Canvas / SVG */}
        <div className="lg:col-span-8 p-6 bg-slate-950 flex flex-col items-center justify-center relative min-h-[380px]">
          {/* Engram Brain Map SVG */}
          <svg viewBox="0 0 520 340" className="w-full max-w-xl h-72 select-none">
            <defs>
              <linearGradient id="brainOutlineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Anatomical brain silhouette guide */}
            <path
              d="M 120 220 C 80 180 80 120 150 70 C 220 30 350 40 420 90 C 470 130 470 200 420 250 C 370 290 320 280 280 290 C 230 300 170 270 120 220 Z"
              fill="url(#brainOutlineGrad)"
              stroke="#334155"
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />

            {/* Synaptic Connection Lines */}
            {nodes.map((source) =>
              source.connectivity.map((targetId) => {
                const target = nodes.find((n) => n.id === targetId);
                if (!target) return null;

                const isConnectedToSelected =
                  source.id === selectedNodeId || target.id === selectedNodeId;
                const connectionStroke = isConnectedToSelected
                  ? isLtpActive
                    ? '#fbbf24'
                    : '#38bdf8'
                  : '#334155';

                return (
                  <g key={`${source.id}-${target.id}`}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={connectionStroke}
                      strokeWidth={isConnectedToSelected ? (isLtpActive ? 3 : 2) : 1}
                      strokeOpacity={isConnectedToSelected ? 0.9 : 0.4}
                    />
                    {isLtpActive && (
                      <circle
                        cx={(source.x + target.x) / 2}
                        cy={(source.y + target.y) / 2}
                        r="3"
                        fill="#fbbf24"
                      />
                    )}
                  </g>
                );
              })
            )}

            {/* Engram Nodes */}
            {nodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const radius = 12 + node.activationLevel * 8;

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="cursor-pointer transition-transform duration-200"
                >
                  {/* Outer pulse halo */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius + 8}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      className="animate-spin origin-center"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius}
                    fill={isSelected ? '#0284c7' : '#1e293b'}
                    stroke={isSelected ? '#38bdf8' : '#475569'}
                    strokeWidth="2"
                  />

                  {/* Inner excitation core */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius * 0.55}
                    fill={node.activationLevel > 0.7 ? '#10b981' : '#f59e0b'}
                  />

                  {/* Node Label */}
                  <text
                    x={node.x}
                    y={node.y + radius + 14}
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : '#94a3b8'}
                    fontSize="10"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    fontFamily="sans-serif"
                  >
                    {node.name.split(' (')[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Real-Time Engram Metrics Ribbon */}
          <div className="w-full max-w-xl mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-900 border border-slate-800 p-2 rounded">
              <span className="text-[10px] text-slate-400 block">Engram Recall Fidelity</span>
              <span className="font-mono font-bold text-emerald-400">{recallScore}%</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2 rounded">
              <span className="text-[10px] text-slate-400 block">Synaptic Plasticity (LTP)</span>
              <span className={`font-mono font-bold ${isLtpActive ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}`}>
                {isLtpActive ? '+14.8 dB Boost' : 'Stable Potentiation'}
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2 rounded">
              <span className="text-[10px] text-slate-400 block">E/I Synaptic Ratio</span>
              <span className="font-mono font-bold text-indigo-400">{(glutamateLevel / gabaLevel).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Selected Engram Node Details & Neurotransmitters */}
        <div className="lg:col-span-4 p-5 bg-slate-950/80 border-t lg:border-t-0 lg:border-l border-slate-800 space-y-4 text-xs">
          <div className="pb-2 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">{selectedNode.name}</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                {selectedNode.region}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed">
              {selectedNode.description}
            </p>
          </div>

          {/* Neurochemical Profile */}
          <div>
            <span className="text-slate-300 font-semibold block mb-1">Active Neurotransmitters:</span>
            <div className="flex flex-wrap gap-1">
              {selectedNode.neurotransmitters.map((nt, idx) => (
                <span
                  key={idx}
                  className="bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-mono"
                >
                  {nt}
                </span>
              ))}
            </div>
          </div>

          {/* Optogenetic Targeting Construct */}
          <div>
            <span className="text-slate-300 font-semibold block mb-1">Targeted Genetic Construct:</span>
            <div className="bg-slate-900 border border-slate-800 p-2 rounded font-mono text-cyan-300 text-[11px]">
              {selectedNode.optogeneticTarget}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Delivered via retrograde viral vector; activated via opto-acoustic resonance.
            </p>
          </div>

          {/* Glutamate vs GABA Balance Sliders */}
          <div className="pt-2 border-t border-slate-800/80 space-y-3">
            <span className="text-slate-200 font-semibold block">Excitation / Inhibition Balance:</span>
            
            {/* Glutamate */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-emerald-400">Glutamate (Excitatory AMPA/NMDA):</span>
                <span className="font-mono font-bold text-emerald-400">{glutamateLevel}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="90"
                value={glutamateLevel}
                onChange={(e) => setGlutamateLevel(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* GABA */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-indigo-400">GABA (Inhibitory GABAA/B):</span>
                <span className="font-mono font-bold text-indigo-400">{gabaLevel}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={gabaLevel}
                onChange={(e) => setGabaLevel(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* PDF Export Configuration Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-cyan-400" />
                <h4 className="font-bold text-sm text-white">Generate Research Session PDF</h4>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-300">
              This will generate an official PDF dossier containing current opto-acoustic resonance telemetry, engram coordinates, E/I ratio, and biosafety checksums.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Subject ID / Patient Code:</label>
                <input
                  type="text"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Lead Investigator:</label>
                <input
                  type="text"
                  value={investigatorName}
                  onChange={(e) => setInvestigatorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Clinical / Engram Session Notes:</label>
                <textarea
                  rows={2}
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              {/* Summary Metrics Included in PDF */}
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1 text-[11px] font-mono text-slate-300">
                <div className="flex justify-between">
                  <span>Target Node:</span>
                  <span className="text-cyan-400 font-bold">{selectedNode.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>E/I Synaptic Ratio:</span>
                  <span className="text-emerald-400 font-bold">{(glutamateLevel / gabaLevel).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contact Impedance:</span>
                  <span className="text-amber-400 font-bold">7.8 kΩ</span>
                </div>
                <div className="flex justify-between">
                  <span>Laser Fluence / Wavelength:</span>
                  <span className="text-indigo-400 font-bold">14.2 mJ/cm² (1064 nm)</span>
                </div>
                <div className="flex justify-between">
                  <span>Acoustic Echo Frequency:</span>
                  <span className="text-emerald-400 font-bold">10.4 MHz (PMUT Array)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExportingPdf ? 'Compiling PDF...' : 'Download PDF Dossier'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

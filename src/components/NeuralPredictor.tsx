import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Activity, Zap, Play, Pause, RefreshCw, Sliders, ShieldCheck, FileDown, Radio, BarChart3, AlertCircle } from 'lucide-react';
import { generateSessionPdf } from '../utils/pdfGenerator';

type CognitiveState = 'Focused' | 'Relaxed' | 'Fatigued';

interface ChannelConfig {
  name: string;
  region: string;
  color: string;
}

const CHANNELS: ChannelConfig[] = [
  { name: 'Ch1: Frontal (Fz)', region: 'Executive / Beta Rhythms', color: '#38bdf8' },
  { name: 'Ch2: Motor (Cz)', region: 'Sensorimotor / Mu Rhythms', color: '#818cf8' },
  { name: 'Ch3: Parietal (Pz)', region: 'Associative / Alpha-Delta', color: '#34d399' },
  { name: 'Ch4: Occipital (Oz)', region: 'Visual / Alpha Entrainment', color: '#f59e0b' },
];

export const NeuralPredictor: React.FC = () => {
  // Signal Modulation Sliders
  const [focusBias, setFocusBias] = useState<number>(2.8); // Beta wave weight (0.1 - 5.0)
  const [alphaBias, setAlphaBias] = useState<number>(1.2); // Alpha wave weight (0.1 - 5.0)
  const [deltaBias, setDeltaBias] = useState<number>(0.8); // Delta wave weight (0.1 - 5.0)
  const [noiseFloor, setNoiseFloor] = useState<number>(0.5); // Sensor EMG noise (0.1 - 2.0)

  // System States
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [isDannActive, setIsDannActive] = useState<boolean>(true); // Domain-Adversarial Neural Network
  const [selectedSubject, setSelectedSubject] = useState<'subjectA' | 'subjectB' | 'invariant'>('invariant');
  const [samplingRate, setSamplingRate] = useState<number>(250); // 250 Hz standard BCI rate
  const [windowSize] = useState<number>(500); // 2-second observational epoch

  // 1D-CNN Inference Outputs
  const [predictedState, setPredictedState] = useState<CognitiveState>('Focused');
  const [probabilities, setProbabilities] = useState<{ focused: number; relaxed: number; fatigued: number }>({
    focused: 78.4,
    relaxed: 15.2,
    fatigued: 6.4,
  });
  const [packetsIngested, setPacketsIngested] = useState<number>(1420);
  const [inferenceLatencyMs, setInferenceLatencyMs] = useState<number>(4.2);
  const [historyStates, setHistoryStates] = useState<CognitiveState[]>(['Focused', 'Focused', 'Focused', 'Focused', 'Focused']);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef<number>(0);

  // Re-compute 1D-CNN Forward Pass & Logits
  useEffect(() => {
    // Subject specific bias modifier
    let subjAlphaMod = 1.0;
    let subjBetaMod = 1.0;
    let subjNoiseMod = 1.0;

    if (!isDannActive) {
      if (selectedSubject === 'subjectA') {
        subjAlphaMod = 1.8; // High baseline alpha due to individual skull conductivity
      } else if (selectedSubject === 'subjectB') {
        subjBetaMod = 1.7; // Thin cortical bone, high baseline beta
        subjNoiseMod = 1.4;
      }
    }

    const effectiveBeta = focusBias * subjBetaMod;
    const effectiveAlpha = alphaBias * subjAlphaMod;
    const effectiveDelta = deltaBias;
    const effectiveNoise = noiseFloor * subjNoiseMod;

    // Simulate 1D-CNN Softmax Head with Non-linear Conv1D Feature Extraction
    const logitFocused = effectiveBeta * 1.6 - (effectiveAlpha * 0.4 + effectiveDelta * 0.8) - effectiveNoise * 0.2;
    const logitRelaxed = effectiveAlpha * 1.8 - (effectiveBeta * 0.5 + effectiveDelta * 0.6) - effectiveNoise * 0.15;
    const logitFatigued = effectiveDelta * 2.1 - (effectiveBeta * 0.7 + effectiveAlpha * 0.3) + effectiveNoise * 0.1;

    // Softmax calculation
    const expF = Math.exp(Math.max(-5, Math.min(5, logitFocused)));
    const expR = Math.exp(Math.max(-5, Math.min(5, logitRelaxed)));
    const expD = Math.exp(Math.max(-5, Math.min(5, logitFatigued)));
    const sumExp = expF + expR + expD;

    const pF = Math.round((expF / sumExp) * 1000) / 10;
    const pR = Math.round((expR / sumExp) * 1000) / 10;
    const pD = Math.round((100 - pF - pR) * 10) / 10;

    setProbabilities({ focused: pF, relaxed: pR, fatigued: Math.max(0, pD) });

    let state: CognitiveState = 'Focused';
    if (pR > pF && pR > pD) state = 'Relaxed';
    else if (pD > pF && pD > pR) state = 'Fatigued';

    setPredictedState(state);
    setHistoryStates((prev) => [state, ...prev.slice(0, 19)]);
    setInferenceLatencyMs(Math.round((3.8 + Math.random() * 1.2) * 10) / 10);
  }, [focusBias, alphaBias, deltaBias, noiseFloor, isDannActive, selectedSubject]);

  // Real-time Waveform Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      timeRef.current += 0.045;
      const t = timeRef.current;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += 35) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw each EEG channel
      const channelSpacing = height / 4;

      CHANNELS.forEach((ch, idx) => {
        const yCenter = channelSpacing * idx + channelSpacing / 2;

        // Label
        ctx.fillStyle = ch.color;
        ctx.font = '9.5px monospace';
        ctx.fillText(ch.name, 10, yCenter - 14);

        // Center zero-line
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(120, yCenter);
        ctx.lineTo(width - 10, yCenter);
        ctx.stroke();

        // Waveform
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();

        for (let x = 120; x < width - 10; x += 2) {
          const sampleT = t + (x - 120) * 0.02;

          // Rhythms modulated by user sliders
          const delta = Math.sin(2 * Math.PI * 0.25 * sampleT) * deltaBias * 0.6;
          const alpha = Math.sin(2 * Math.PI * 1.5 * sampleT) * alphaBias * 0.8;
          const beta = Math.sin(2 * Math.PI * 3.5 * sampleT) * focusBias * 0.7;

          // Noise
          const pseudoNoise = (Math.sin(sampleT * 17.3) + Math.cos(sampleT * 31.7)) * (noiseFloor * 0.35);

          // Channel specific weighting
          let chAmp = 0;
          if (idx === 0) chAmp = beta * 1.3 + delta * 0.4 + pseudoNoise; // Frontal
          else if (idx === 1) chAmp = beta * 0.8 + alpha * 0.6 + pseudoNoise; // Motor
          else if (idx === 2) chAmp = alpha * 1.0 + delta * 0.8 + pseudoNoise; // Parietal
          else chAmp = alpha * 1.5 + delta * 0.3 + pseudoNoise; // Occipital

          const y = yCenter + Math.max(-28, Math.min(28, chAmp * 12));
          if (x === 120) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      if (isStreaming) {
        setPacketsIngested((prev) => prev + 1);
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isStreaming, focusBias, alphaBias, deltaBias, noiseFloor]);

  const handleDownloadPdf = () => {
    generateSessionPdf({
      sessionTitle: 'Kateriya-X 1D-CNN Neural Predictor Report',
      subjectId: selectedSubject === 'invariant' ? 'KX-INVARIANT-NORM' : selectedSubject.toUpperCase(),
      leadInvestigator: 'BCI Machine Learning Specialist',
      activeNodeName: 'Frontal-Occipital Cognitive Tracking Envelope',
      activeRegion: 'Prefrontal Cortex (Fz) & Occipital Cortex (Oz)',
      glutamateLevel: Math.round(probabilities.focused * 0.7 + 20),
      gabaLevel: Math.round(probabilities.relaxed * 0.6 + 20),
      eiRatio: (probabilities.focused / Math.max(1, probabilities.relaxed)).toFixed(2),
      recallScore: 89,
      isLtpActive: false,
      contactImpedance: '7.8',
      laserFluence: '14.2',
      wavelength: 1064,
      acousticFreq: '10.4',
      acousticPressure: '18.4',
      axialResolution: '280',
      snr: '34.2',
      cognitiveState: predictedState,
      stateConfidence: Math.round(probabilities[predictedState.toLowerCase() as keyof typeof probabilities]),
      alphaPower: probabilities.relaxed,
      betaPower: probabilities.focused,
      deltaPower: probabilities.fatigued,
      entrainmentActive: false,
      notes: `1D-CNN Ingestion Active. Sampling: ${samplingRate} Hz. Domain Adaptation (DANN): ${isDannActive ? 'ENABLED' : 'DISABLED'}. Latency: ${inferenceLatencyMs} ms.`,
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur space-y-0">
      {/* Component Header Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                1D-CNN Neural Predictor & Domain-Adversarial Core
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                PyTorch 1D-CNN / DANN
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time classification of cognitive focus states (Focused, Relaxed, Fatigued) from streamable 4-channel telemetry
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded border border-slate-700 transition"
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isStreaming ? 'Pause Stream' : 'Live Stream'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white rounded transition shadow-lg shadow-cyan-600/20"
            title="Export session dossier with 1D-CNN cognitive prediction metrics"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Predictor PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Section: Live Waveforms & Ingestion Canvas */}
        <div className="lg:col-span-8 p-5 bg-slate-950 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                Raw Telemetry Stream (Ring Buffer: 500 Samples · 250 Hz)
              </span>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ws://gateway:8765
                </span>
                <span>Packets: {packetsIngested}</span>
                <span>Latency: {inferenceLatencyMs} ms</span>
              </div>
            </div>

            {/* Oscilloscope Canvas */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-2 shadow-inner">
              <canvas
                ref={canvasRef}
                width={640}
                height={260}
                className="w-full h-64 rounded-lg bg-slate-950 select-none"
              />
            </div>
          </div>

          {/* 1D-CNN Layer-by-Layer Architectural Flow Pipeline */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
            <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
              1D-CNN Tensor Transformation Architecture
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px] font-mono">
              <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Input Tensor</span>
                <span className="text-cyan-400 font-bold">[4, 500]</span>
                <span className="text-slate-400 block text-[9px]">4 Ch · 2.0s</span>
              </div>
              <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Conv1D Block 1</span>
                <span className="text-indigo-400 font-bold">[16, 250]</span>
                <span className="text-slate-400 block text-[9px]">k=15, s=2</span>
              </div>
              <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Conv1D Block 2</span>
                <span className="text-indigo-400 font-bold">[32, 125]</span>
                <span className="text-slate-400 block text-[9px]">k=7, s=1</span>
              </div>
              <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">AdaptivePool1D</span>
                <span className="text-emerald-400 font-bold">[64, 1]</span>
                <span className="text-slate-400 block text-[9px]">Global Mean</span>
              </div>
              <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Dense Softmax</span>
                <span className="text-amber-400 font-bold">[3 Classes]</span>
                <span className="text-slate-400 block text-[9px]">CrossEntropy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Prediction Outcome & Signal Modulation Controls */}
        <div className="lg:col-span-4 p-5 bg-slate-950/80 border-t lg:border-t-0 lg:border-l border-slate-800 space-y-4 text-xs">
          {/* Main State Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono block">
              Inferred Cognitive State
            </span>
            <div className="flex items-center justify-center gap-2">
              <span
                className={`text-2xl font-black tracking-tight ${
                  predictedState === 'Focused'
                    ? 'text-cyan-400'
                    : predictedState === 'Relaxed'
                    ? 'text-amber-400'
                    : 'text-indigo-400'
                }`}
              >
                {predictedState}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-950 border border-slate-800 text-slate-300">
                {probabilities[predictedState.toLowerCase() as keyof typeof probabilities]}%
              </span>
            </div>

            {/* Probability Bars */}
            <div className="space-y-1.5 pt-2 text-left">
              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-cyan-400 font-medium">Focused (Beta 15–30 Hz):</span>
                  <span className="font-mono font-bold text-cyan-400">{probabilities.focused}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full transition-all duration-300" style={{ width: `${probabilities.focused}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-amber-400 font-medium">Relaxed (Alpha 8–12 Hz):</span>
                  <span className="font-mono font-bold text-amber-400">{probabilities.relaxed}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full transition-all duration-300" style={{ width: `${probabilities.relaxed}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-indigo-400 font-medium">Fatigued (Delta 1–4 Hz):</span>
                  <span className="font-mono font-bold text-indigo-400">{probabilities.fatigued}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-400 h-full rounded-full transition-all duration-300" style={{ width: `${probabilities.fatigued}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Domain Adaptation (DANN) Mode */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Cross-Subject Invariance (DANN)
              </span>
              <button
                onClick={() => setIsDannActive(!isDannActive)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                  isDannActive ? 'bg-emerald-950 border border-emerald-800 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isDannActive ? 'ACTIVE' : 'OFF'}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Gradient Reversal Layer (GRL) strips individual skull geometry differences, preventing cross-subject failure.
            </p>

            <div className="grid grid-cols-3 gap-1 pt-1">
              {[
                { id: 'invariant', label: 'Invariant' },
                { id: 'subjectA', label: 'Subject A' },
                { id: 'subjectB', label: 'Subject B' },
              ].map((subj) => (
                <button
                  key={subj.id}
                  onClick={() => setSelectedSubject(subj.id as any)}
                  className={`py-1 text-[10px] rounded font-medium transition ${
                    selectedSubject === subj.id
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-800'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {subj.label}
                </button>
              ))}
            </div>
          </div>

          {/* Signal Tuning Sliders */}
          <div className="space-y-3 pt-1">
            <span className="font-bold text-slate-300 block uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Telemetry Tuning Sliders
            </span>

            {/* Slider 1: Focus Bias (Beta) */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Cognitive Focus Target (Beta Wave):</span>
                <span className="font-mono font-bold text-cyan-400">{focusBias.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={focusBias}
                onChange={(e) => setFocusBias(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Slider 2: Alpha Wave Bias */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Relaxation Target (Alpha Wave):</span>
                <span className="font-mono font-bold text-amber-400">{alphaBias.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={alphaBias}
                onChange={(e) => setAlphaBias(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Slider 3: Delta Wave Bias */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Fatigue Target (Delta Wave):</span>
                <span className="font-mono font-bold text-indigo-400">{deltaBias.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={deltaBias}
                onChange={(e) => setDeltaBias(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Slider 4: Noise Floor */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Sensor Noise (EMG Artifacts):</span>
                <span className="font-mono font-bold text-rose-400">{noiseFloor.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={noiseFloor}
                onChange={(e) => setNoiseFloor(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

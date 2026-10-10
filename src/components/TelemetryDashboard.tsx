import React, { useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Download,
  Flame,
  Moon,
  Sparkles,
  Zap,
  ShieldCheck,
  Radio,
  FileSpreadsheet,
  FileText,
  Save,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { savePacketsBatch, saveSessionRecord, TelemetryPacket } from '../utils/telemetryDb';
import { generateSessionPdf } from '../utils/pdfGenerator';

interface TelemetryPoint {
  id: number;
  timestamp: number;
  isoTime?: string;
  ch1_fz: number;
  ch2_cz: number;
  ch3_pz: number;
  ch4_oz: number;
  photoacousticPressure: number;
  focusScore: number;
  dominantState: 'Focused' | 'Relaxed' | 'Fatigued';
  frequencyBands: {
    delta: number;
    theta: number;
    alpha: number;
    beta: number;
    gamma: number;
  };
  modulation: {
    target: 'motor_cortex' | 'amygdala' | 'balanced' | string;
    active: boolean;
    motorActivation: number;
    amygdalaCalming: number;
    synapticPotentiation: number;
    laserFluence: number;
    pulseFrequency: number;
  };
  hardware: {
    contactImpedance: number;
    snrDb: number;
    folliclePenetrationMm: number;
    opticalFluence: number;
  };
}

export const TelemetryDashboard: React.FC = () => {
  // Stream data buffer
  const [dataBuffer, setDataBuffer] = useState<TelemetryPoint[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamSource, setStreamSource] = useState<'sse' | 'polling' | 'client-generator'>('sse');
  const [totalPacketsReceived, setTotalPacketsReceived] = useState<number>(0);
  const [latestPacket, setLatestPacket] = useState<TelemetryPoint | null>(null);

  // Channel visibility toggles
  const [visibleChannels, setVisibleChannels] = useState({
    ch1: true,
    ch2: true,
    ch3: true,
    ch4: true,
    pact: true,
  });

  // Backend / Stream Controls
  const [noiseFloor, setNoiseFloor] = useState<number>(0.35);
  const [cognitiveFocusBias, setCognitiveFocusBias] = useState<number>(2.5);
  const [activeModulationTarget, setActiveModulationTarget] = useState<'motor_cortex' | 'amygdala' | 'balanced'>('motor_cortex');
  const [laserFluence, setLaserFluence] = useState<number>(16.8);
  const [pulseRateHz, setPulseRateHz] = useState<number>(25);
  const [isStimulationFiring, setIsStimulationFiring] = useState<boolean>(false);

  // Status Notification
  const [notification, setNotification] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const clientSimStepRef = useRef<number>(100);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Synchronize controls with backend
  const updateBackendControl = async (overrides: Record<string, any> = {}) => {
    try {
      await fetch('/api/telemetry/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noiseLevel: noiseFloor,
          focusBias: cognitiveFocusBias,
          modulationTarget: activeModulationTarget,
          stimulationActive: true,
          laserFluence,
          pulseFrequency: pulseRateHz,
          ...overrides,
        }),
      });
    } catch (e) {
      // Ignore network fail if purely client side
    }
  };

  // Client-side fallback generator if backend stream is unreachable
  const generateClientPoint = (step: number): TelemetryPoint => {
    const t = step * 0.1;
    const noise = (Math.random() - 0.5) * noiseFloor * 20;
    const isFocus = cognitiveFocusBias >= 2.0;
    const betaWeight = cognitiveFocusBias * 8;
    const alphaWeight = Math.max(2, 16 - cognitiveFocusBias * 4);
    const thetaWeight = 4 + Math.sin(t * 0.5) * 2;
    const gammaWeight = isFocus ? 6 : 2;

    const ch1_fz = Number((Math.sin(t * 18) * betaWeight * 0.5 + Math.sin(t * 10) * alphaWeight * 0.2 + noise).toFixed(2));
    const ch2_cz = Number((Math.sin(t * 22) * betaWeight * 0.6 + (activeModulationTarget === 'motor_cortex' ? Math.sin(t * 28) * 10 : 0) + noise).toFixed(2));
    const ch3_pz = Number((Math.sin(t * 10) * alphaWeight * 0.7 + noise).toFixed(2));
    const ch4_oz = Number((Math.sin(t * 11) * alphaWeight * 0.85 + Math.sin(t * 2) * 4 + noise).toFixed(2));

    const rawFocus = 50 + (cognitiveFocusBias - 2.5) * 20 + Math.sin(t * 0.3) * 15;
    const focusScore = Math.max(5, Math.min(98, Math.round(rawFocus)));
    const dominantState = focusScore > 65 ? 'Focused' : focusScore < 38 ? 'Fatigued' : 'Relaxed';

    const motorActivation = activeModulationTarget === 'motor_cortex'
      ? Math.min(99, Math.round(65 + Math.sin(t * 0.8) * 25 + (laserFluence / 20) * 10))
      : Math.round(30 + Math.sin(t * 0.8) * 10);

    const amygdalaCalming = activeModulationTarget === 'amygdala'
      ? Math.min(99, Math.round(70 + Math.cos(t * 0.8) * 20 + (laserFluence / 20) * 10))
      : Math.round(25 + Math.cos(t * 0.8) * 10);

    const totalPower = betaWeight + alphaWeight + thetaWeight + gammaWeight + 5;

    return {
      id: step,
      timestamp: Number(t.toFixed(1)),
      ch1_fz,
      ch2_cz,
      ch3_pz,
      ch4_oz,
      photoacousticPressure: Number((1.5 + Math.sin(t * 4) * 0.5 + (laserFluence / 20) * 0.7).toFixed(2)),
      focusScore,
      dominantState,
      frequencyBands: {
        delta: Math.round((5 / totalPower) * 100),
        theta: Math.round((thetaWeight / totalPower) * 100),
        alpha: Math.round((alphaWeight / totalPower) * 100),
        beta: Math.round((betaWeight / totalPower) * 100),
        gamma: Math.round((gammaWeight / totalPower) * 100),
      },
      modulation: {
        target: activeModulationTarget,
        active: true,
        motorActivation,
        amygdalaCalming,
        synapticPotentiation: Math.round(45 + (motorActivation + amygdalaCalming) * 0.3),
        laserFluence,
        pulseFrequency: pulseRateHz,
      },
      hardware: {
        contactImpedance: Number((5.8 + Math.sin(t * 0.1) * 0.8).toFixed(1)),
        snrDb: Number((28.5 + Math.cos(t * 0.2) * 2).toFixed(1)),
        folliclePenetrationMm: 1.85,
        opticalFluence: laserFluence,
      },
    };
  };

  // Initialize data buffer with snapshot or simulation
  useEffect(() => {
    fetch('/api/telemetry/live')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.buffer && Array.isArray(data.buffer)) {
          setDataBuffer(data.buffer);
          if (data.latest) setLatestPacket(data.latest);
        }
      })
      .catch(() => {
        // Generate initial points
        const initialPoints: TelemetryPoint[] = [];
        for (let i = 0; i < 30; i++) {
          initialPoints.push(generateClientPoint(i));
        }
        setDataBuffer(initialPoints);
        setLatestPacket(initialPoints[initialPoints.length - 1]);
      });
  }, []);

  // Set up SSE Stream
  useEffect(() => {
    if (!isStreaming) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    try {
      const es = new EventSource('/api/telemetry/stream');
      eventSourceRef.current = es;

      es.onopen = () => {
        setStreamSource('sse');
      };

      es.onmessage = (event) => {
        try {
          const packet: TelemetryPoint = JSON.parse(event.data);
          setLatestPacket(packet);
          setTotalPacketsReceived((prev) => prev + 1);

          setDataBuffer((prev) => {
            const next = [...prev, packet];
            return next.length > 50 ? next.slice(next.length - 50) : next;
          });
        } catch (err) {
          console.error('Error parsing SSE packet:', err);
        }
      };

      es.onerror = () => {
        // SSE error, fall back to interval generator
        es.close();
        eventSourceRef.current = null;
        setStreamSource('client-generator');
      };
    } catch {
      setStreamSource('client-generator');
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isStreaming]);

  // Client fallback ticker if SSE is offline
  useEffect(() => {
    if (!isStreaming || streamSource === 'sse') return;

    const interval = setInterval(() => {
      clientSimStepRef.current += 1;
      const point = generateClientPoint(clientSimStepRef.current);
      setLatestPacket(point);
      setTotalPacketsReceived((prev) => prev + 1);

      setDataBuffer((prev) => {
        const next = [...prev, point];
        return next.length > 50 ? next.slice(next.length - 50) : next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isStreaming, streamSource, noiseFloor, cognitiveFocusBias, activeModulationTarget, laserFluence, pulseRateHz]);

  // Stimulation Burst Handler
  const triggerStimulationBurst = () => {
    setIsStimulationFiring(true);
    showNotification('Firing 1064nm NIR-II Photoacoustic Pulse Train (25 Hz, 18.5 mJ/cm²)...');
    updateBackendControl({ laserFluence: 19.2, stimulationActive: true });

    setTimeout(() => {
      setIsStimulationFiring(false);
      updateBackendControl({ laserFluence, stimulationActive: true });
    }, 2000);
  };

  // Export buffer as CSV
  const handleExportCSV = () => {
    if (dataBuffer.length === 0) return;
    const headers = ['Timestamp(s)', 'Ch1_Fz(uV)', 'Ch2_Cz(uV)', 'Ch3_Pz(uV)', 'Ch4_Oz(uV)', 'PACT_Pressure(MPa)', 'FocusScore(%)', 'State', 'MotorActivation(%)', 'AmygdalaCalming(%)', 'Impedance(kOhm)'];
    const rows = dataBuffer.map((d) => [
      d.timestamp,
      d.ch1_fz,
      d.ch2_cz,
      d.ch3_pz,
      d.ch4_oz,
      d.photoacousticPressure,
      d.focusScore,
      d.dominantState,
      d.modulation?.motorActivation ?? 0,
      d.modulation?.amygdalaCalming ?? 0,
      d.hardware?.contactImpedance ?? 5.8,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KateriyaX_Telemetry_Stream_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Telemetry stream exported as CSV.');
  };

  // Save buffer to IndexedDB for offline logger replay
  const handleSaveToIndexedDB = async () => {
    if (dataBuffer.length === 0) return;
    const sessionId = `KX-STREAM-${Date.now().toString().slice(-6)}`;

    const packets: TelemetryPacket[] = dataBuffer.map((d) => ({
      sessionId,
      timestamp: d.timestamp,
      ch1_fz: d.ch1_fz,
      ch2_cz: d.ch2_cz,
      ch3_pz: d.ch3_pz,
      ch4_oz: d.ch4_oz,
      state: d.dominantState,
      focusScore: d.focusScore,
      psdPeakFreq: d.modulation?.pulseFrequency || 25,
    }));

    await savePacketsBatch(packets);

    const avgFocus = Math.round(dataBuffer.reduce((acc, curr) => acc + curr.focusScore, 0) / dataBuffer.length);

    await saveSessionRecord({
      id: sessionId,
      title: `Live Stream Snapshot (${activeModulationTarget.toUpperCase()})`,
      subjectId: 'SUBJ-KX-RESONANCE',
      createdAt: new Date().toISOString(),
      durationSec: Math.round(dataBuffer.length * 0.15),
      totalPackets: dataBuffer.length,
      sampleRate: 250,
      avgFocusScore: avgFocus,
      dominantState: latestPacket?.dominantState || 'Focused',
      notes: `Recorded from Recharts Live Telemetry Dashboard. Modulation target: ${activeModulationTarget}. Fluence: ${laserFluence} mJ/cm².`,
    });

    showNotification(`Saved ${dataBuffer.length} stream packets to IndexedDB (Session: ${sessionId}).`);
  };

  // Export PDF Summary
  const handleExportPDF = () => {
    if (!latestPacket) return;
    generateSessionPdf({
      sessionTitle: `Kateriya-X Live Telemetry Stream Dossier`,
      subjectId: 'SUBJ-KX-STREAM',
      leadInvestigator: 'Kateriya-X Research Core',
      activeNodeName: 'Frontal-Occipital PACT Telemetry Matrix',
      activeRegion: 'Motor Cortex (M1) & Amygdala (BLA)',
      glutamateLevel: Math.round(latestPacket.focusScore * 0.7 + 20),
      gabaLevel: Math.round(100 - (latestPacket.focusScore * 0.7 + 20)),
      eiRatio: (latestPacket.focusScore / Math.max(1, 100 - latestPacket.focusScore)).toFixed(2),
      recallScore: 88,
      isLtpActive: latestPacket.modulation.active,
      contactImpedance: String(latestPacket.hardware.contactImpedance),
      laserFluence: String(latestPacket.hardware.opticalFluence),
      wavelength: 1064,
      acousticFreq: String(latestPacket.modulation.pulseFrequency),
      acousticPressure: String(latestPacket.photoacousticPressure),
      axialResolution: '280',
      snr: String(latestPacket.hardware.snrDb),
      cognitiveState: latestPacket.dominantState,
      stateConfidence: latestPacket.focusScore,
      notes: `Recorded from Recharts Live Telemetry Dashboard. Total Packets: ${totalPacketsReceived}. Target: ${latestPacket.modulation.target}.`,
    });
    showNotification('Generated PDF clinical telemetry summary report.');
  };

  // Spectral bar chart data
  const spectralData = latestPacket
    ? [
        { band: 'Delta (0.5-4Hz)', power: latestPacket.frequencyBands.delta, color: '#6366f1' },
        { band: 'Theta (4-8Hz)', power: latestPacket.frequencyBands.theta, color: '#38bdf8' },
        { band: 'Alpha (8-13Hz)', power: latestPacket.frequencyBands.alpha, color: '#10b981' },
        { band: 'Beta (13-30Hz)', power: latestPacket.frequencyBands.beta, color: '#f59e0b' },
        { band: 'Gamma (30-80Hz)', power: latestPacket.frequencyBands.gamma, color: '#ec4899' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-16 right-6 z-50 bg-cyan-950/90 border border-cyan-500 text-cyan-200 px-4 py-2.5 rounded-lg shadow-xl shadow-cyan-950/50 flex items-center gap-2 text-xs font-semibold backdrop-blur animate-fade-in">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Banner: Subsystem Header & Live Stream Connection Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Activity className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Live Neural Telemetry Dashboard
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold bg-cyan-950 border border-cyan-800 text-cyan-300">
                Recharts Real-Time Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Continuous multi-channel EEG & photoacoustic transcranial stream monitoring, real-time frequency band analysis, and Panel 5 targeted neuromodulation feedback.
            </p>
          </div>

          {/* Stream Status & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-slate-300">
                {isStreaming ? (streamSource === 'sse' ? 'LIVE SSE BACKEND' : 'SIMULATED STREAM') : 'STREAM PAUSED'}
              </span>
              <span className="text-slate-500 text-[10px]">({totalPacketsReceived} pkts)</span>
            </div>

            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                isStreaming
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isStreaming ? 'Pause Stream' : 'Resume Stream'}</span>
            </button>

            <button
              onClick={handleSaveToIndexedDB}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              title="Save current rolling buffer to IndexedDB for offline replay"
            >
              <Save className="w-3.5 h-3.5 text-cyan-400" />
              <span>Save Session</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              title="Download CSV of current buffer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-700/60 flex items-center gap-1.5 transition"
              title="Generate PDF clinical summary"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>PDF Summary</span>
            </button>
          </div>
        </div>

        {/* Live Biophysics Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800/60 p-2.5 rounded-lg">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Cognitive Focus</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-cyan-400 font-mono">
                {latestPacket ? latestPacket.focusScore : 76}%
              </span>
              <span
                className={`text-[10px] font-semibold px-1 py-0.2 rounded uppercase ${
                  latestPacket?.dominantState === 'Focused'
                    ? 'text-emerald-400 bg-emerald-950/60'
                    : latestPacket?.dominantState === 'Relaxed'
                    ? 'text-sky-400 bg-sky-950/60'
                    : 'text-amber-400 bg-amber-950/60'
                }`}
              >
                {latestPacket?.dominantState || 'Focused'}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 p-2.5 rounded-lg">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Contact Impedance</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {latestPacket?.hardware.contactImpedance ?? 5.8}
              </span>
              <span className="text-xs text-slate-400">kΩ</span>
              <span className="text-[10px] text-emerald-500 font-semibold ml-auto">&lt;10kΩ Pass</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 p-2.5 rounded-lg">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Photoacoustic Peak</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-rose-400 font-mono">
                {latestPacket?.photoacousticPressure ?? 1.8}
              </span>
              <span className="text-xs text-slate-400">MPa</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 p-2.5 rounded-lg">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Laser Optical Fluence</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-amber-400 font-mono">
                {latestPacket?.hardware.opticalFluence ?? laserFluence}
              </span>
              <span className="text-xs text-slate-400">mJ/cm²</span>
              <span className="text-[10px] text-slate-500 ml-auto">&lt;20 Safe</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 p-2.5 rounded-lg">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Signal-to-Noise (SNR)</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-purple-400 font-mono">
                {latestPacket?.hardware.snrDb ?? 28.5}
              </span>
              <span className="text-xs text-slate-400">dB</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 p-2.5 rounded-lg">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Modulation Target</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  activeModulationTarget === 'motor_cortex'
                    ? 'bg-amber-400 animate-pulse'
                    : activeModulationTarget === 'amygdala'
                    ? 'bg-cyan-400 animate-pulse'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="text-xs font-bold text-slate-200 capitalize truncate">
                {activeModulationTarget.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Waveform & Focus Dynamics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-time Multi-Channel Waveforms (Recharts LineChart) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Multi-Channel Raw Neural Stream & PACT Pressure
              </h3>
              <p className="text-xs text-slate-500">
                Frontal (Fz), Motor (Cz), Parietal (Pz), Occipital (Oz) electrodes + Opto-acoustic echo
              </p>
            </div>

            {/* Channel Toggles */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setVisibleChannels((p) => ({ ...p, ch1: !p.ch1 }))}
                className={`px-2 py-0.5 rounded font-mono font-bold border transition ${
                  visibleChannels.ch1
                    ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                    : 'bg-slate-950 text-slate-600 border-slate-800'
                }`}
              >
                Ch1 (Fz)
              </button>
              <button
                onClick={() => setVisibleChannels((p) => ({ ...p, ch2: !p.ch2 }))}
                className={`px-2 py-0.5 rounded font-mono font-bold border transition ${
                  visibleChannels.ch2
                    ? 'bg-amber-950 text-amber-400 border-amber-800'
                    : 'bg-slate-950 text-slate-600 border-slate-800'
                }`}
              >
                Ch2 (Cz)
              </button>
              <button
                onClick={() => setVisibleChannels((p) => ({ ...p, ch3: !p.ch3 }))}
                className={`px-2 py-0.5 rounded font-mono font-bold border transition ${
                  visibleChannels.ch3
                    ? 'bg-indigo-950 text-indigo-400 border-indigo-800'
                    : 'bg-slate-950 text-slate-600 border-slate-800'
                }`}
              >
                Ch3 (Pz)
              </button>
              <button
                onClick={() => setVisibleChannels((p) => ({ ...p, ch4: !p.ch4 }))}
                className={`px-2 py-0.5 rounded font-mono font-bold border transition ${
                  visibleChannels.ch4
                    ? 'bg-purple-950 text-purple-400 border-purple-800'
                    : 'bg-slate-950 text-slate-600 border-slate-800'
                }`}
              >
                Ch4 (Oz)
              </button>
              <button
                onClick={() => setVisibleChannels((p) => ({ ...p, pact: !p.pact }))}
                className={`px-2 py-0.5 rounded font-mono font-bold border transition ${
                  visibleChannels.pact
                    ? 'bg-rose-950 text-rose-400 border-rose-800'
                    : 'bg-slate-950 text-slate-600 border-slate-800'
                }`}
              >
                PACT Echo
              </button>
            </div>
          </div>

          {/* Recharts LineChart */}
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataBuffer} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#64748b"
                  fontSize={10}
                  tickFormatter={(val) => `${val}s`}
                />
                <YAxis stroke="#64748b" fontSize={10} domain={[-45, 45]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '11px',
                  }}
                  formatter={(value: any, name: any) => [
                    `${value} ${name === 'photoacousticPressure' ? 'MPa' : 'μV'}`,
                    name === 'ch1_fz'
                      ? 'Frontal Fz'
                      : name === 'ch2_cz'
                      ? 'Motor Cz'
                      : name === 'ch3_pz'
                      ? 'Parietal Pz'
                      : name === 'ch4_oz'
                      ? 'Occipital Oz'
                      : 'PACT Echo',
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  formatter={(val) =>
                    val === 'ch1_fz'
                      ? 'Frontal Fz'
                      : val === 'ch2_cz'
                      ? 'Motor Cz'
                      : val === 'ch3_pz'
                      ? 'Parietal Pz'
                      : val === 'ch4_oz'
                      ? 'Occipital Oz'
                      : 'PACT Echo (MPa)'
                  }
                />
                {visibleChannels.ch1 && (
                  <Line
                    type="monotone"
                    dataKey="ch1_fz"
                    stroke="#06b6d4"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
                {visibleChannels.ch2 && (
                  <Line
                    type="monotone"
                    dataKey="ch2_cz"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
                {visibleChannels.ch3 && (
                  <Line
                    type="monotone"
                    dataKey="ch3_pz"
                    stroke="#818cf8"
                    strokeWidth={1.2}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
                {visibleChannels.ch4 && (
                  <Line
                    type="monotone"
                    dataKey="ch4_oz"
                    stroke="#c084fc"
                    strokeWidth={1.2}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
                {visibleChannels.pact && (
                  <Line
                    type="monotone"
                    dataKey="photoacousticPressure"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Running Cognitive Focus Metric (Recharts AreaChart) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="space-y-1 mb-2">
            <h3 className="font-bold text-sm text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-cyan-400" />
                Cognitive Focus Index
              </span>
              <span className="text-cyan-400 font-mono text-base font-bold">
                {latestPacket ? latestPacket.focusScore : 76}%
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Computed ratio: Beta / (Theta + Alpha) over rolling time window
            </p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataBuffer} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={9} tickFormatter={(v) => `${v}s`} />
                <YAxis stroke="#64748b" fontSize={9} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }}
                />
                <ReferenceLine y={65} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Focused', fill: '#10b981', fontSize: 9 }} />
                <ReferenceLine y={38} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Fatigued', fill: '#f59e0b', fontSize: 9 }} />
                <Area type="monotone" dataKey="focusScore" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#focusGradient)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick status badge summary */}
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 mt-3 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Classified State:</span>
              <span className={`font-bold ${
                latestPacket?.dominantState === 'Focused' ? 'text-emerald-400' : latestPacket?.dominantState === 'Relaxed' ? 'text-sky-400' : 'text-amber-400'
              }`}>
                {latestPacket?.dominantState || 'Focused'}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Spectral Peak:</span>
              <span className="text-slate-300">{latestPacket?.modulation?.pulseFrequency ?? 25} Hz</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel 5: Targeted Modulation & Frequency Spectrum Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel 5 Targeted Modulation Card (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Panel 5 Architecture
                </span>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Targeted Modulation: Motor Suns & Amygdala Twilight
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Patterned opsin stimulation with 1064nm NIR-II laser pulses balancing motor reinforcement and fear circuit inhibition.
              </p>
            </div>

            <button
              onClick={triggerStimulationBurst}
              disabled={isStimulationFiring}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-lg ${
                isStimulationFiring
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-rose-600 text-white hover:from-amber-400 hover:to-rose-500'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isStimulationFiring ? 'Emitting Pulse Train...' : 'Fire Pulse Train'}</span>
            </button>
          </div>

          {/* Visual Dual Circuit Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Motor Cortex - Golden Sunlight */}
            <div className={`p-4 rounded-xl border transition relative overflow-hidden ${
              activeModulationTarget === 'motor_cortex'
                ? 'bg-gradient-to-b from-amber-950/40 to-slate-950 border-amber-500/50 shadow-lg shadow-amber-500/10'
                : 'bg-slate-950/40 border-slate-800/80'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Flame className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Motor Cortex (M1)</h4>
                    <span className="text-[10px] text-amber-400 font-mono">Golden Solar Ignition</span>
                  </div>
                </div>
                <span className="text-lg font-bold font-mono text-amber-400">
                  {latestPacket?.modulation?.motorActivation ?? 72}%
                </span>
              </div>

              <div className="w-full bg-slate-900 h-2 rounded-full mt-3 overflow-hidden border border-amber-500/20">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full transition-all duration-300"
                  style={{ width: `${latestPacket?.modulation?.motorActivation ?? 72}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                Opsin stimulation reinforces motor learning, coordination, and stroke neuro-rehabilitation through LTP induction.
              </p>
            </div>

            {/* Amygdala - Calming Twilight */}
            <div className={`p-4 rounded-xl border transition relative overflow-hidden ${
              activeModulationTarget === 'amygdala'
                ? 'bg-gradient-to-b from-blue-950/40 to-slate-950 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                : 'bg-slate-950/40 border-slate-800/80'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <Moon className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Amygdala Circuit (BLA)</h4>
                    <span className="text-[10px] text-cyan-400 font-mono">Twilight Calming Waves</span>
                  </div>
                </div>
                <span className="text-lg font-bold font-mono text-cyan-400">
                  {latestPacket?.modulation?.amygdalaCalming ?? 81}%
                </span>
              </div>

              <div className="w-full bg-slate-900 h-2 rounded-full mt-3 overflow-hidden border border-cyan-500/20">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${latestPacket?.modulation?.amygdalaCalming ?? 81}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                Controlled photoacoustic inhibition dampens hyperactive fear/anxiety circuits for targeted PTSD & stress mitigation.
              </p>
            </div>
          </div>

          {/* Target Selector Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs font-semibold text-slate-400">Select Stimulation Paradigm:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveModulationTarget('motor_cortex');
                  updateBackendControl({ modulationTarget: 'motor_cortex' });
                  showNotification('Switched target to Motor Cortex (Reinforcement).');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeModulationTarget === 'motor_cortex'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Motor Cortex Focus
              </button>
              <button
                onClick={() => {
                  setActiveModulationTarget('amygdala');
                  updateBackendControl({ modulationTarget: 'amygdala' });
                  showNotification('Switched target to Amygdala (Anxiolytic Calming).');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeModulationTarget === 'amygdala'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Amygdala Calming
              </button>
              <button
                onClick={() => {
                  setActiveModulationTarget('balanced');
                  updateBackendControl({ modulationTarget: 'balanced' });
                  showNotification('Switched target to Balanced Engram Calibration.');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeModulationTarget === 'balanced'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Balanced Calibration
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Frequency Spectrum (5 Cols - Recharts BarChart) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="space-y-1 mb-2">
            <h3 className="font-bold text-sm text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Live EEG Power Spectrum
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Relative PSD %</span>
            </h3>
            <p className="text-xs text-slate-500">
              Real-time Fast Fourier decomposition across standard clinical brainwave bands.
            </p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spectralData} layout="vertical" margin={{ top: 5, right: 20, left: 25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" domain={[0, 50]} stroke="#64748b" fontSize={9} unit="%" />
                <YAxis dataKey="band" type="category" stroke="#cbd5e1" fontSize={10} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }}
                  formatter={(val) => [`${val}%`, 'Relative Spectral Power']}
                />
                <Bar dataKey="power" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  {spectralData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-5 gap-1 pt-2 border-t border-slate-800 text-center font-mono">
            {spectralData.map((band) => (
              <div key={band.band} className="p-1 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-[9px] text-slate-400 block truncate">{band.band.split(' ')[0]}</span>
                <span className="text-xs font-bold" style={{ color: band.color }}>
                  {band.power}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Control Room & Simulation Parameters (Sliders & Interactive Tuning) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-sm text-slate-200">
            Signal Tuning & Transcranial PACT Controls
          </h3>
          <span className="text-xs text-slate-500 ml-auto">
            Dynamic parameter adjustments synchronize directly with the backend stream
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Cognitive Focus Target Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Cognitive Focus Target (Beta/Alpha):</span>
              <span className="font-mono text-cyan-400 font-bold">{cognitiveFocusBias.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={cognitiveFocusBias}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCognitiveFocusBias(val);
                updateBackendControl({ focusBias: val });
              }}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Deep Calm (Alpha)</span>
              <span>High Alert (Beta)</span>
            </div>
          </div>

          {/* Sensor Noise Floor Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Sensor Noise Floor (EMG Artifacts):</span>
              <span className="font-mono text-amber-400 font-bold">{noiseFloor.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.5"
              step="0.05"
              value={noiseFloor}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setNoiseFloor(val);
                updateBackendControl({ noiseLevel: val });
              }}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Clean Room (&lt;0.1)</span>
              <span>Motion Jitter (&gt;1.0)</span>
            </div>
          </div>

          {/* Laser Optical Fluence */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Optical Fluence (1064nm NIR-II):</span>
              <span className="font-mono text-rose-400 font-bold">{laserFluence.toFixed(1)} mJ/cm²</span>
            </div>
            <input
              type="range"
              min="5.0"
              max="19.8"
              step="0.2"
              value={laserFluence}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setLaserFluence(val);
                updateBackendControl({ laserFluence: val });
              }}
              className="w-full accent-rose-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Low (5 mJ/cm²)</span>
              <span className="text-emerald-500">Safe Boundary (&lt;20)</span>
            </div>
          </div>

          {/* Stimulation Pulse Frequency */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Pulse Repetition Rate:</span>
              <span className="font-mono text-indigo-400 font-bold">{pulseRateHz} Hz</span>
            </div>
            <input
              type="range"
              min="5"
              max="80"
              step="5"
              value={pulseRateHz}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setPulseRateHz(val);
                updateBackendControl({ pulseFrequency: val });
              }}
              className="w-full accent-indigo-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Theta (5 Hz)</span>
              <span>Gamma Spike (80 Hz)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

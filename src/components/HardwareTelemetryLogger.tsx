import React, { useState, useEffect, useRef } from 'react';
import { Database, Play, Pause, Square, Download, Trash2, HardDrive, RefreshCw, Activity, CheckCircle2, AlertTriangle, FileSpreadsheet, FileCode, Eye, Radio, Sparkles } from 'lucide-react';
import {
  TelemetryPacket,
  TelemetrySession,
  saveSessionRecord,
  savePacketsBatch,
  getAllSessions,
  getSessionPackets,
  deleteSession,
  exportSessionToCSV,
  exportSessionToJSON,
  getBrowserStorageStats,
} from '../utils/telemetryDb';
import { generateSessionPdf } from '../utils/pdfGenerator';

export const HardwareTelemetryLogger: React.FC = () => {
  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [sessionSubjectId, setSessionSubjectId] = useState<string>('SUBJ-KX-882');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [packetCount, setPacketCount] = useState<number>(0);

  // Live Telemetry Values
  const [focusFactor, setFocusFactor] = useState<number>(76.4);
  const [currentState, setCurrentState] = useState<'DEEP FOCUS' | 'ALPHA CALM' | 'SIG_LOW'>('DEEP FOCUS');
  const [activeChannelFz, setActiveChannelFz] = useState<number>(0);
  const [activeChannelOz, setActiveChannelOz] = useState<number>(0);

  // Offline Sessions List & Storage Stats
  const [savedSessions, setSavedSessions] = useState<TelemetrySession[]>([]);
  const [selectedSessionForReplay, setSelectedSessionForReplay] = useState<TelemetrySession | null>(null);
  const [replayPackets, setReplayPackets] = useState<TelemetryPacket[]>([]);
  const [replayIndex, setReplayIndex] = useState<number>(0);
  const [storageStats, setStorageStats] = useState<{ usageMB: number; quotaMB: number; percent: number }>({ usageMB: 0, quotaMB: 1000, percent: 0 });
  const [notification, setNotification] = useState<string | null>(null);

  // Buffer for batch writing to IndexedDB (writes every 250 packets or 1s)
  const packetBatchBufferRef = useRef<TelemetryPacket[]>([]);
  const lastWriteTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<number | null>(null);

  // Canvas Refs
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const spectrumCanvasRef = useRef<HTMLCanvasElement>(null);
  const timeCounterRef = useRef<number>(0);

  // Load saved sessions on mount
  const refreshSessions = async () => {
    try {
      const sessions = await getAllSessions();
      setSavedSessions(sessions);
      const stats = await getBrowserStorageStats();
      setStorageStats(stats);
    } catch (e) {
      console.error('Error loading sessions from IndexedDB:', e);
    }
  };

  useEffect(() => {
    refreshSessions();
  }, []);

  // Show transient toast
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Start a new recording session
  const startRecording = () => {
    const newId = `KX-LOG-${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}`;
    setCurrentSessionId(newId);
    setElapsedSeconds(0);
    setPacketCount(0);
    packetBatchBufferRef.current = [];
    setSelectedSessionForReplay(null);
    setIsRecording(true);

    showToast(`Session ${newId} initialized. Streaming packets to IndexedDB.`);
  };

  // Stop recording and finalize session record
  const stopRecording = async () => {
    if (!isRecording) return;
    setIsRecording(false);

    // Flush any pending buffer packets to IndexedDB
    if (packetBatchBufferRef.current.length > 0) {
      await savePacketsBatch(packetBatchBufferRef.current);
      packetBatchBufferRef.current = [];
    }

    const finalSession: TelemetrySession = {
      id: currentSessionId,
      title: `Neural Telemetry Session ${currentSessionId.slice(-6)}`,
      subjectId: sessionSubjectId,
      createdAt: new Date().toISOString(),
      durationSec: Math.round(elapsedSeconds * 10) / 10,
      totalPackets: packetCount,
      sampleRate: 250,
      avgFocusScore: Math.round(focusFactor * 10) / 10,
      dominantState: currentState === 'DEEP FOCUS' ? 'Focused' : currentState === 'ALPHA CALM' ? 'Relaxed' : 'Fatigued',
      notes: 'Captured via Kateriya-X Hardware Telemetry Logger. Stored in IndexedDB for offline inspection.',
      sizeBytes: packetCount * 64,
    };

    await saveSessionRecord(finalSession);
    await refreshSessions();
    showToast(`Session ${currentSessionId} saved to IndexedDB (${packetCount} packets).`);
  };

  // Real-time packet generator & batch-writer to IndexedDB
  useEffect(() => {
    let animFrameId: number;

    const streamLoop = () => {
      timeCounterRef.current += 0.04;
      const t = timeCounterRef.current;

      // Realistic synthetic waveforms mirroring BCI stream
      const rawFz = 2.0 * Math.sin(2 * Math.PI * 10.0 * t) + (Math.random() - 0.5) * 0.8;
      const rawCz = 1.6 * Math.sin(2 * Math.PI * 14.0 * t) + (Math.random() - 0.5) * 0.7;
      const rawPz = 1.2 * Math.sin(2 * Math.PI * 18.0 * t) + (Math.random() - 0.5) * 0.6;
      const rawOz = 1.8 * Math.sin(2 * Math.PI * 22.0 * t) + (Math.random() - 0.5) * 0.8;

      setActiveChannelFz(rawFz);
      setActiveChannelOz(rawOz);

      const calculatedFocus = Math.min(99.4, Math.max(10.0, Math.abs(rawOz) * 25 + 35));
      setFocusFactor(Math.round(calculatedFocus * 10) / 10);

      const stateName: 'DEEP FOCUS' | 'ALPHA CALM' | 'SIG_LOW' =
        calculatedFocus > 60 ? 'DEEP FOCUS' : calculatedFocus > 35 ? 'ALPHA CALM' : 'SIG_LOW';
      setCurrentState(stateName);

      // If recording, build packet and queue into batch
      if (isRecording && currentSessionId) {
        const newPacket: TelemetryPacket = {
          sessionId: currentSessionId,
          timestamp: Math.round(t * 1000) / 1000,
          ch1_fz: rawFz,
          ch2_cz: rawCz,
          ch3_pz: rawPz,
          ch4_oz: rawOz,
          state: stateName === 'DEEP FOCUS' ? 'Focused' : stateName === 'ALPHA CALM' ? 'Relaxed' : 'Fatigued',
          focusScore: calculatedFocus,
          psdPeakFreq: stateName === 'DEEP FOCUS' ? 22.0 : 10.0,
        };

        packetBatchBufferRef.current.push(newPacket);
        setPacketCount((c) => c + 1);

        // Auto-flush to IndexedDB every 50 packets (approx every 200-300ms)
        const now = Date.now();
        if (packetBatchBufferRef.current.length >= 50 || now - lastWriteTimeRef.current >= 1000) {
          const batchToFlush = [...packetBatchBufferRef.current];
          packetBatchBufferRef.current = [];
          lastWriteTimeRef.current = now;

          savePacketsBatch(batchToFlush).catch((err) => {
            console.error('Failed to commit batch to IndexedDB:', err);
          });
        }
      }

      // Draw real-time waveforms on canvas
      drawWaveforms(rawFz, rawOz);
      drawSpectrum(calculatedFocus, stateName);

      animFrameId = requestAnimationFrame(streamLoop);
    };

    animFrameId = requestAnimationFrame(streamLoop);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [isRecording, currentSessionId]);

  // Session timer ticker
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setElapsedSeconds((s) => s + 0.1);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  // Draw Waveform Oscilloscope Canvas
  const drawWaveforms = (fzVal: number, ozVal: number) => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const t = timeCounterRef.current;

    ctx.fillStyle = '#060c1f';
    ctx.fillRect(0, 0, w, h);

    // Neon Cyber Grid
    ctx.strokeStyle = '#101f42';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Channel 1: Frontal Fz (Cyan #00f0ff)
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let x = 0; x < w; x += 2) {
      const sampleT = t - (w - x) * 0.015;
      const y = h * 0.3 + (Math.sin(sampleT * 10) * 20 + Math.cos(sampleT * 3) * 6);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Channel 4: Occipital Oz (Hot Pink #ff007f)
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let x = 0; x < w; x += 2) {
      const sampleT = t - (w - x) * 0.015;
      const y = h * 0.7 + (Math.sin(sampleT * 22) * 18 + Math.sin(sampleT * 7) * 8);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Trace Legend
    ctx.fillStyle = '#00f0ff';
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText(`⚡ CH1: FRONTAL (Fz) [${fzVal.toFixed(2)} µV]`, 12, 22);

    ctx.fillStyle = '#ff007f';
    ctx.fillText(`⚡ CH4: OCCIPITAL (Oz) [${ozVal.toFixed(2)} µV]`, 12, h * 0.55);
  };

  // Draw Welch Spectrum Canvas
  const drawSpectrum = (focusScore: number, state: string) => {
    const canvas = spectrumCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#060c1f';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = '#101f42';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Draw Welch curve with glowing green phosphor fill (#39ff14)
    ctx.beginPath();
    ctx.moveTo(0, h - 15);

    const centerFreq = state === 'DEEP FOCUS' ? 22.0 : 10.0;

    for (let x = 0; x < w; x += 3) {
      const freq = (x / w) * 45;
      const power = Math.exp(-Math.pow(freq - centerFreq, 2) / 10) * (focusScore * 0.8) + (Math.sin(x * 0.1) * 3 + 4);
      const y = h - 15 - (power / 100) * (h - 35);
      ctx.lineTo(x, y);
    }

    ctx.lineTo(w, h - 15);
    ctx.closePath();

    // Phosphor decay fill
    ctx.fillStyle = 'rgba(57, 255, 20, 0.12)';
    ctx.fill();

    // Outline
    ctx.strokeStyle = '#39ff14';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Spectrum Legend
    ctx.fillStyle = '#39ff14';
    ctx.font = '10px "Courier New", monospace';
    ctx.fillText(`RESONANCE SPECTRAL POWER (WELCH PSD) · PEAK: ${centerFreq.toFixed(1)} Hz`, 12, 22);
  };

  // Replay a session from IndexedDB
  const handleLoadSessionForReplay = async (session: TelemetrySession) => {
    setSelectedSessionForReplay(session);
    try {
      const packets = await getSessionPackets(session.id);
      setReplayPackets(packets);
      setReplayIndex(0);
      showToast(`Loaded ${packets.length} packets from session ${session.id} for offline inspection.`);
    } catch (e) {
      console.error('Error fetching session packets:', e);
    }
  };

  // Delete session handler
  const handleDeleteSession = async (sessionId: string) => {
    if (confirm(`Delete session ${sessionId} and purge its packets from IndexedDB?`)) {
      await deleteSession(sessionId);
      if (selectedSessionForReplay?.id === sessionId) {
        setSelectedSessionForReplay(null);
        setReplayPackets([]);
      }
      await refreshSessions();
      showToast(`Session ${sessionId} purged from IndexedDB.`);
    }
  };

  // CSV Export handler
  const handleExportCsv = async (sessionId: string) => {
    try {
      await exportSessionToCSV(sessionId);
      showToast(`Downloaded kateriya_x_telemetry_${sessionId}.csv`);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  // JSON Export handler
  const handleExportJson = async (session: TelemetrySession) => {
    try {
      await exportSessionToJSON(session.id, session);
      showToast(`Downloaded kateriya_x_telemetry_${session.id}.json`);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  // PDF Export for saved session
  const handleExportPdfForSession = (session: TelemetrySession) => {
    generateSessionPdf({
      sessionTitle: `Kateriya-X Telemetry Dossier (${session.id})`,
      subjectId: session.subjectId,
      leadInvestigator: 'Offline Telemetry Investigator',
      activeNodeName: 'Frontal-Occipital Neural Ingestion Node',
      activeRegion: 'Cortical Brainwave Array',
      glutamateLevel: Math.round(session.avgFocusScore * 0.7 + 20),
      gabaLevel: Math.round(100 - (session.avgFocusScore * 0.7 + 20)),
      eiRatio: (session.avgFocusScore / (100 - session.avgFocusScore)).toFixed(2),
      recallScore: 92,
      isLtpActive: false,
      contactImpedance: '7.8',
      laserFluence: '14.2',
      wavelength: 1064,
      acousticFreq: '10.4',
      acousticPressure: '18.4',
      axialResolution: '280',
      snr: '34.2',
      cognitiveState: session.dominantState,
      stateConfidence: session.avgFocusScore,
      notes: `IndexedDB Offline Session Analysis. Duration: ${session.durationSec}s · Total Packets: ${session.totalPackets}.`,
    });
  };

  return (
    <div className="bg-[#040814] border border-[#1e293b] rounded-xl overflow-hidden shadow-2xl font-mono text-slate-200">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="bg-[#0b132b] border-b border-[#00f0ff] px-4 py-2 flex items-center justify-between text-xs text-[#00f0ff]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00f0ff]" />
            <span>{notification}</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400">INDEXEDDB OK</span>
        </div>
      )}

      {/* Cyberpunk Branding Header */}
      <div className="p-5 border-b-2 border-[#00f0ff] bg-[#060c1f] flex flex-wrap items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,240,255,0.12)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] animate-ping" />
            <h2 className="text-base sm:text-lg font-black tracking-widest text-[#00f0ff] drop-shadow-[0_0_10px_rgba(0,240,255,0.7)]">
              SYSTEM STATUS: ACTIVE // KATERIYA-X
            </h2>
            <span className="text-[10px] font-bold text-[#39ff14] bg-[#0b132b] border border-[#39ff14]/50 px-2 py-0.5 rounded">
              INDEXEDDB LOGGER
            </span>
          </div>
          <p className="text-[11px] text-[#70859e] tracking-wider mt-1">
            NEURAL RESONANCE SYSTEM - ADVANCED MAPPING AND MODULATION // HARDWARE TELEMETRY LOGGER
          </p>
        </div>

        {/* Global Storage & Offline Indicator */}
        <div className="flex items-center gap-4 text-xs">
          <div className="bg-[#0b132b] border border-[#1e293b] px-3 py-1.5 rounded flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#00f0ff]" />
            <div>
              <span className="text-[10px] text-[#70859e] block">BROWSER INDEXEDDB</span>
              <span className="text-[#00f0ff] font-bold text-[11px]">{storageStats.usageMB} MB USED</span>
            </div>
          </div>

          <div className="bg-[#0b132b] border border-[#39ff14]/40 px-3 py-1.5 rounded flex items-center gap-2 text-[#39ff14]">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[11px] font-bold">OFFLINE PERSISTENCE READY</span>
          </div>
        </div>
      </div>

      {/* Cyber Grid Metrics Panel (3 Neon KPI Cards) */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#040814]">
        {/* Card 1: Quantum State Intel */}
        <div className="p-4 rounded border border-[#00f0ff] bg-[#0b132b] shadow-[inset_0_0_15px_rgba(0,240,255,0.1)]">
          <span className="text-[11px] text-[#70859e] tracking-wider block mb-1">
            QUANTUM STATE INTEL
          </span>
          <div className="text-2xl font-black text-[#39ff14] drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]">
            {currentState}
          </div>
          <p className="text-[10px] text-[#70859e] mt-1">
            Real-time multi-channel classification stream
          </p>
        </div>

        {/* Card 2: Resonance Profile Weight */}
        <div className="p-4 rounded border border-[#ff007f] bg-[#0b132b] shadow-[inset_0_0_15px_rgba(255,0,127,0.1)]">
          <span className="text-[11px] text-[#70859e] tracking-wider block mb-1">
            RESONANCE PROFILE WEIGHT
          </span>
          <div className="text-2xl font-black text-[#ff007f] drop-shadow-[0_0_8px_rgba(255,0,127,0.6)]">
            {focusFactor.toFixed(1)}%
          </div>
          <p className="text-[10px] text-[#70859e] mt-1">
            Beta/Alpha spectral density power factor
          </p>
        </div>

        {/* Card 3: Modulation Matrix / Storage Status */}
        <div className="p-4 rounded border border-[#eab308] bg-[#0b132b] shadow-[inset_0_0_15px_rgba(234,179,8,0.1)]">
          <span className="text-[11px] text-[#70859e] tracking-wider block mb-1">
            MODULATION MATRIX STATUS
          </span>
          <div className="text-2xl font-black text-[#eab308] drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
            {isRecording ? 'ENVELOPE LOCK' : 'TELEMETRY STANDBY'}
          </div>
          <p className="text-[10px] text-[#70859e] mt-1">
            {isRecording ? `Logging to IDB · ${packetCount} packets` : 'Ready for session capture'}
          </p>
        </div>
      </div>

      {/* Recording Control Console & Trigger Strip */}
      <div className="px-5 py-3 bg-[#060c1f] border-y border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#70859e] uppercase tracking-wider">
            Active Recording Engine:
          </span>

          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-4 py-2 bg-[#0b132b] hover:bg-[#111e42] text-[#00f0ff] border border-[#00f0ff] rounded font-bold text-xs flex items-center gap-2 shadow-[0_0_10px_rgba(0,240,255,0.3)] transition"
            >
              <Play className="w-3.5 h-3.5 fill-current text-[#00f0ff]" />
              <span>START IDB SESSION RECORDING</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-4 py-2 bg-[#ff007f]/20 hover:bg-[#ff007f]/30 text-[#ff007f] border border-[#ff007f] rounded font-bold text-xs flex items-center gap-2 shadow-[0_0_12px_rgba(255,0,127,0.5)] transition animate-pulse"
            >
              <Square className="w-3.5 h-3.5 fill-current text-[#ff007f]" />
              <span>STOP & COMMIT SESSION ({packetCount} PKTS)</span>
            </button>
          )}

          {isRecording && (
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-[#39ff14] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-ping" />
                REC: {elapsedSeconds.toFixed(1)}s
              </span>
              <span className="text-slate-400">ID: {currentSessionId}</span>
            </div>
          )}
        </div>

        {/* Subject ID Config */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#70859e]">Subject Code:</span>
          <input
            type="text"
            value={sessionSubjectId}
            onChange={(e) => setSessionSubjectId(e.target.value)}
            disabled={isRecording}
            className="bg-[#0b132b] border border-[#1e293b] focus:border-[#00f0ff] rounded px-2.5 py-1 text-[#00f0ff] text-xs font-mono outline-none"
          />
        </div>
      </div>

      {/* Dual High-Contrast Monitoring Scopes */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5 bg-[#040814]">
        {/* Scope 1: Time-Domain Waveforms */}
        <div className="rounded border border-[#1e293b] overflow-hidden bg-[#060c1f] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#101f42]">
            <span className="text-xs font-bold text-[#00f0ff] tracking-wide">
              WAVEFORM REAL-TIME ANALYSIS // TIME-DOMAIN
            </span>
            <span className="text-[10px] text-[#70859e]">POTENTIAL (µV) · 250 Hz</span>
          </div>
          <canvas
            ref={waveformCanvasRef}
            width={580}
            height={220}
            className="w-full h-56 rounded bg-[#060c1f]"
          />
        </div>

        {/* Scope 2: Frequency Spectrum (Welch PSD) */}
        <div className="rounded border border-[#1e293b] overflow-hidden bg-[#060c1f] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#101f42]">
            <span className="text-xs font-bold text-[#39ff14] tracking-wide">
              FREQUENCY SPECTRUM RESONANCE MAP // WELCH PSD
            </span>
            <span className="text-[10px] text-[#70859e]">POWER MAGNITUDE (dB)</span>
          </div>
          <canvas
            ref={spectrumCanvasRef}
            width={580}
            height={220}
            className="w-full h-56 rounded bg-[#060c1f]"
          />
        </div>
      </div>

      {/* Replay Scrubber Mode if Session Selected */}
      {selectedSessionForReplay && (
        <div className="mx-5 mb-5 p-4 rounded border border-[#00f0ff] bg-[#060c1f] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#101f42]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#00f0ff]" />
              <span className="text-xs font-bold text-[#00f0ff]">
                OFFLINE REPLAY & PACKET SCRUBBER: {selectedSessionForReplay.id}
              </span>
            </div>
            <button
              onClick={() => setSelectedSessionForReplay(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕ Exit Replay
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Subject: {selectedSessionForReplay.subjectId} · Total Recorded Packets: {replayPackets.length} · Duration: {selectedSessionForReplay.durationSec}s · Average Focus: {selectedSessionForReplay.avgFocusScore}%
          </p>

          {replayPackets.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[#70859e]">
                <span>Timeline Scrubber: Packet #{replayIndex + 1} of {replayPackets.length}</span>
                <span className="text-[#00f0ff]">
                  T = {replayPackets[replayIndex]?.timestamp.toFixed(2)}s | State: {replayPackets[replayIndex]?.state} | Focus: {replayPackets[replayIndex]?.focusScore.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(0, replayPackets.length - 1)}
                value={replayIndex}
                onChange={(e) => setReplayIndex(Number(e.target.value))}
                className="w-full accent-[#00f0ff]"
              />

              {/* Instant channel readouts at this timestamp */}
              <div className="grid grid-cols-4 gap-2 pt-1 text-center text-xs">
                <div className="bg-[#0b132b] p-1.5 rounded border border-[#1e293b]">
                  <span className="text-[#70859e] text-[10px] block">CH1 (Fz)</span>
                  <span className="text-[#00f0ff] font-bold">{replayPackets[replayIndex]?.ch1_fz.toFixed(2)} µV</span>
                </div>
                <div className="bg-[#0b132b] p-1.5 rounded border border-[#1e293b]">
                  <span className="text-[#70859e] text-[10px] block">CH2 (Cz)</span>
                  <span className="text-[#818cf8] font-bold">{replayPackets[replayIndex]?.ch2_cz.toFixed(2)} µV</span>
                </div>
                <div className="bg-[#0b132b] p-1.5 rounded border border-[#1e293b]">
                  <span className="text-[#70859e] text-[10px] block">CH3 (Pz)</span>
                  <span className="text-[#34d399] font-bold">{replayPackets[replayIndex]?.ch3_pz.toFixed(2)} µV</span>
                </div>
                <div className="bg-[#0b132b] p-1.5 rounded border border-[#1e293b]">
                  <span className="text-[#70859e] text-[10px] block">CH4 (Oz)</span>
                  <span className="text-[#ff007f] font-bold">{replayPackets[replayIndex]?.ch4_oz.toFixed(2)} µV</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Offline IndexedDB Sessions Archive & Export Center */}
      <div className="p-5 border-t border-[#1e293b] bg-[#060c1f] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#00f0ff]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Offline IndexedDB Telemetry Archive (Stored In Browser Memory)
            </h3>
          </div>
          <button
            onClick={refreshSessions}
            className="p-1 text-slate-400 hover:text-white flex items-center gap-1 text-xs"
            title="Refresh database records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {savedSessions.length === 0 ? (
          <div className="p-6 rounded border border-dashed border-[#1e293b] text-center text-xs text-[#70859e]">
            No offline telemetry sessions logged yet. Click &ldquo;START IDB SESSION RECORDING&rdquo; above to stream neural packets into IndexedDB.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#1e293b] rounded">
            <table className="min-w-full divide-y divide-[#1e293b] text-xs">
              <thead className="bg-[#0b132b] text-[#70859e]">
                <tr>
                  <th className="px-3 py-2 text-left">Session ID</th>
                  <th className="px-3 py-2 text-left">Subject</th>
                  <th className="px-3 py-2 text-left">Recorded Time</th>
                  <th className="px-3 py-2 text-left">Duration</th>
                  <th className="px-3 py-2 text-left">Packets</th>
                  <th className="px-3 py-2 text-left">Dominant State</th>
                  <th className="px-3 py-2 text-left">Avg Focus</th>
                  <th className="px-3 py-2 text-right">Offline Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/60 text-slate-300">
                {savedSessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-[#0b132b]/80 transition">
                    <td className="px-3 py-2 font-bold text-[#00f0ff]">{sess.id}</td>
                    <td className="px-3 py-2 text-slate-300">{sess.subjectId}</td>
                    <td className="px-3 py-2 text-slate-400">
                      {new Date(sess.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-3 py-2 font-mono">{sess.durationSec}s</td>
                    <td className="px-3 py-2 font-mono text-emerald-400">{sess.totalPackets}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        sess.dominantState === 'Focused'
                          ? 'bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]/40'
                          : sess.dominantState === 'Relaxed'
                          ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40'
                          : 'bg-indigo-950 text-indigo-300'
                      }`}>
                        {sess.dominantState}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-[#ff007f]">{sess.avgFocusScore}%</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleLoadSessionForReplay(sess)}
                          className="px-2 py-1 bg-[#0b132b] hover:bg-[#111e42] text-[#00f0ff] border border-[#00f0ff]/50 rounded text-[10px] flex items-center gap-1"
                          title="Inspect raw packets in offline scope"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Replay</span>
                        </button>

                        <button
                          onClick={() => handleExportCsv(sess.id)}
                          className="px-2 py-1 bg-[#0b132b] hover:bg-[#111e42] text-[#39ff14] border border-[#39ff14]/50 rounded text-[10px] flex items-center gap-1"
                          title="Export raw packets to CSV spreadsheet"
                        >
                          <FileSpreadsheet className="w-3 h-3" />
                          <span>CSV</span>
                        </button>

                        <button
                          onClick={() => handleExportJson(sess)}
                          className="px-2 py-1 bg-[#0b132b] hover:bg-[#111e42] text-amber-400 border border-amber-400/50 rounded text-[10px] flex items-center gap-1"
                          title="Export full session to JSON"
                        >
                          <FileCode className="w-3 h-3" />
                          <span>JSON</span>
                        </button>

                        <button
                          onClick={() => handleExportPdfForSession(sess)}
                          className="px-2 py-1 bg-[#0b132b] hover:bg-[#111e42] text-cyan-300 border border-cyan-400/50 rounded text-[10px] flex items-center gap-1"
                          title="Export clinical PDF summary dossier"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </button>

                        <button
                          onClick={() => handleDeleteSession(sess.id)}
                          className="p-1 hover:text-rose-400 text-slate-500 rounded"
                          title="Purge session from IndexedDB"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

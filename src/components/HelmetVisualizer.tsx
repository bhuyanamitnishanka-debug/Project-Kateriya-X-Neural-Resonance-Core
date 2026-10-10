import React, { useState, useEffect } from 'react';
import { Eye, Layers, ShieldCheck, Activity, Radio, Cpu, RefreshCw } from 'lucide-react';

export const HelmetVisualizer: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<'all' | 'comb' | 'optics' | 'acoustic' | 'engram'>('all');
  const [pulsePhase, setPulsePhase] = useState<number>(0);
  const [isFiring, setIsFiring] = useState<boolean>(true);

  useEffect(() => {
    if (!isFiring) return;
    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, [isFiring]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur">
      {/* Visualizer Title Bar */}
      <div className="p-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Kateriya-X Neural Resonance Helmet
            </h3>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded">
              NON-INVASIVE OPTO-ACOUSTIC ARRAY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-spectral ray tracing: NIR-II laser pulses + thermoelastic ultrasonic echo matrix
          </p>
        </div>

        {/* Layer Filters */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeLayer === 'all' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Composite View
          </button>
          <button
            onClick={() => setActiveLayer('comb')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeLayer === 'comb' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Micro-Comb Matrix
          </button>
          <button
            onClick={() => setActiveLayer('optics')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeLayer === 'optics' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            NIR-II Optics
          </button>
          <button
            onClick={() => setActiveLayer('engram')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeLayer === 'engram' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Engram Hologram
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Visual Canvas Area */}
        <div className="lg:col-span-8 p-6 bg-radial from-slate-900 via-slate-950 to-slate-950 flex flex-col items-center justify-center relative min-h-[420px] overflow-hidden">
          
          {/* Background Grid & Laboratory Ambience */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Interactive Helmet SVG Diagram */}
          <div className="relative w-full max-w-xl h-80 flex items-center justify-center">
            <svg
              viewBox="0 0 600 400"
              className="w-full h-full drop-shadow-2xl select-none"
            >
              <defs>
                <linearGradient id="chassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="50%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>
                <linearGradient id="titaniumRing" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#cbd5e1" />
                  <stop offset="50%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
                <linearGradient id="domeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.08" />
                </linearGradient>
                <radialGradient id="hologramGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#0284c7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                </radialGradient>
                <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Head Silhouette Base */}
              <path
                d="M 280 140 C 340 140 370 180 370 230 C 370 280 340 330 300 340 C 260 350 220 330 200 290 C 190 250 200 200 230 160 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.5"
                opacity="0.8"
              />
              {/* Hair representation */}
              <path
                d="M 215 170 C 210 200 210 230 220 250 C 225 240 230 220 235 210 C 240 230 245 250 250 240 C 260 210 270 180 275 165 Z"
                fill="#0f172a"
                opacity="0.9"
              />

              {/* LAYER: Engram Synaptic Projection (Holographic HUD) */}
              {(activeLayer === 'all' || activeLayer === 'engram') && (
                <g className="transition-opacity duration-300">
                  {/* Hologram Floating Screen Box */}
                  <rect
                    x="20"
                    y="40"
                    width="190"
                    height="130"
                    rx="10"
                    fill="#0369a1"
                    fillOpacity="0.12"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                  <text x="32" y="60" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    ENGRAM SYNAPSE MAP
                  </text>
                  
                  {/* Neural nodes inside hologram */}
                  <circle cx="60" cy="100" r="4" fill="#38bdf8" />
                  <circle cx="110" cy="80" r="5" fill="#f59e0b" />
                  <circle cx="150" cy="115" r="4.5" fill="#38bdf8" />
                  <circle cx="95" cy="135" r="4" fill="#10b981" />
                  <circle cx="160" cy="75" r="3.5" fill="#38bdf8" />

                  {/* Synaptic connection paths */}
                  <line x1="60" y1="100" x2="110" y2="80" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.7" />
                  <line x1="110" y1="80" x2="150" y2="115" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.8" />
                  <line x1="60" y1="100" x2="95" y2="135" stroke="#10b981" strokeWidth="1.2" strokeOpacity="0.6" />
                  <line x1="95" y1="135" x2="150" y2="115" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.7" />
                  <line x1="110" y1="80" x2="160" y2="75" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.5" />

                  {/* Pulsing action potential packet */}
                  <circle
                    cx={60 + (pulsePhase / 100) * 50}
                    cy={100 - (pulsePhase / 100) * 20}
                    r="2.5"
                    fill="#ffffff"
                    filter="url(#laserGlow)"
                  />
                  <circle
                    cx={110 + (pulsePhase / 100) * 40}
                    cy={80 + (pulsePhase / 100) * 35}
                    r="2.5"
                    fill="#fbbf24"
                    filter="url(#laserGlow)"
                  />

                  {/* Holographic Projection Rays from Helmet */}
                  <path
                    d="M 210 110 L 260 145"
                    stroke="#06b6d4"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    strokeOpacity="0.5"
                  />
                </g>
              )}

              {/* LAYER: Transcranial Laser Pulses (NIR-II 1064nm) */}
              {(activeLayer === 'all' || activeLayer === 'optics') && (
                <g>
                  {/* Optical beams through skull */}
                  <line x1="280" y1="120" x2="295" y2="190" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" opacity="0.85" />
                  <line x1="310" y1="115" x2="315" y2="195" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" opacity="0.85" />
                  <line x1="340" y1="125" x2="330" y2="190" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" opacity="0.85" />

                  {/* Ultrasonic thermoelastic echo circles expanding back */}
                  <circle cx="295" cy="190" r={(pulsePhase % 40) + 5} fill="none" stroke="#06b6d4" strokeWidth="1.2" opacity={1 - (pulsePhase % 40) / 40} />
                  <circle cx="315" cy="195" r={((pulsePhase + 15) % 40) + 5} fill="none" stroke="#06b6d4" strokeWidth="1.2" opacity={1 - ((pulsePhase + 15) % 40) / 40} />
                  <circle cx="330" cy="190" r={((pulsePhase + 28) % 40) + 5} fill="none" stroke="#06b6d4" strokeWidth="1.2" opacity={1 - ((pulsePhase + 28) % 40) / 40} />
                </g>
              )}

              {/* LAYER: Clear Geodesic Dome */}
              <path
                d="M 240 145 C 255 105 320 85 375 110 C 405 125 415 155 410 185 C 385 175 325 155 240 145 Z"
                fill="url(#domeGrad)"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeOpacity="0.6"
              />

              {/* LAYER: Micro-Comb Dry Sensor Array (Inside Dome gliding through hair) */}
              {(activeLayer === 'all' || activeLayer === 'comb') && (
                <g>
                  {[
                    { x1: 265, y1: 135, x2: 265, y2: 155 },
                    { x1: 280, y1: 120, x2: 280, y2: 158 },
                    { x1: 295, y1: 112, x2: 295, y2: 160 },
                    { x1: 310, y1: 108, x2: 310, y2: 162 },
                    { x1: 325, y1: 106, x2: 325, y2: 165 },
                    { x1: 340, y1: 110, x2: 340, y2: 168 },
                    { x1: 355, y1: 118, x2: 355, y2: 170 },
                    { x1: 370, y1: 130, x2: 370, y2: 172 },
                    { x1: 385, y1: 145, x2: 385, y2: 175 },
                  ].map((comb, i) => (
                    <g key={i}>
                      <line
                        x1={comb.x1}
                        y1={comb.y1}
                        x2={comb.x2}
                        y2={comb.y2}
                        stroke="#94a3b8"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      {/* Gold PEDOT tip */}
                      <circle cx={comb.x2} cy={comb.y2} r="2.2" fill="#f59e0b" />
                    </g>
                  ))}
                  <text x="315" y="100" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    MICRO-COMB PILLAR ARRAY (250 µm PITCH)
                  </text>
                </g>
              )}

              {/* LAYER: Main White & Titanium Helmet Chassis */}
              {/* Forehead & Crown Frame */}
              <path
                d="M 230 145 C 240 90 325 70 395 95 C 445 115 450 160 445 200 C 440 240 435 280 430 310 C 420 330 395 330 390 305 C 385 280 390 230 395 195 C 350 170 290 160 230 145 Z"
                fill="url(#chassisGrad)"
                stroke="#64748b"
                strokeWidth="1.5"
                filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.4))"
              />

              {/* Brow Band with Metallic Accent */}
              <path
                d="M 230 145 C 275 160 340 170 395 195 L 398 205 C 340 180 275 170 228 152 Z"
                fill="url(#titaniumRing)"
                stroke="#475569"
                strokeWidth="1"
              />

              {/* Ear Module / Temporal Transducer Pod */}
              <circle cx="410" cy="305" r="22" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2.5" />
              <circle cx="410" cy="305" r="14" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
              <circle cx="410" cy="305" r="5" fill="#0ea5e9" />

              {/* Logo Badge on Helmet Side */}
              <text x="390" y="240" fill="#0f172a" fontSize="11" fontWeight="900" letterSpacing="1" fontFamily="sans-serif">
                KATERIYA-X
              </text>
              <text x="390" y="252" fill="#64748b" fontSize="6.5" fontWeight="bold" letterSpacing="0.5" fontFamily="monospace">
                OPTO-ACOUSTIC CORE
              </text>

              {/* Glowing Status Indicator Strip on Brow */}
              <line x1="260" y1="162" x2="310" y2="175" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" filter="url(#laserGlow)" />
              <line x1="320" y1="178" x2="350" y2="185" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setIsFiring(!isFiring)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs font-medium transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFiring ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
              {isFiring ? 'Pause Ray Tracing' : 'Resume Ray Tracing'}
            </button>
            <span className="text-[11px] text-slate-400 font-mono">
              Mode: <span className="text-cyan-300">NIR-II Pulsed Transcranial PACT</span>
            </span>
          </div>
        </div>

        {/* Live Biophysical Telemetry Dashboard */}
        <div className="lg:col-span-4 p-5 bg-slate-950/80 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
                Biophysical Telemetry
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                NOMINAL SPEC
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              {/* Telemetry Row 1 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Scalp Contact Impedance:</span>
                  <span className="font-mono font-bold text-cyan-400">7.8 kΩ</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: '82%' }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Anagen follicle spacing achieved (<span className="text-emerald-400">&lt;10 kΩ goal</span>)
                </p>
              </div>

              {/* Telemetry Row 2 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Laser Fluence (1064 nm):</span>
                  <span className="font-mono font-bold text-amber-400">14.2 mJ/cm²</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '71%' }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  ANSI Z136 Safe Limit: &le; 20 mJ/cm²
                </p>
              </div>

              {/* Telemetry Row 3 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Acoustic Echo Frequency:</span>
                  <span className="font-mono font-bold text-emerald-400">10.4 MHz</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '88%' }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  PMUT array: 1024 channels, 240 µm axial resolution
                </p>
              </div>

              {/* Telemetry Row 4 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Target Opsin:</span>
                  <span className="font-mono font-bold text-indigo-400">ChR2-H134R / Chrimson</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Co-discovered by Prof. Suneel Kateriya; expressed via AAV-PHP.eB retrograde vector
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Non-Invasive Verification</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Eliminates surgical craniotomy while bypassing hair attenuation through 250 µm mechanical micro-pillars.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

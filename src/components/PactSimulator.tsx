import React, { useState, useEffect, useRef } from 'react';
import { Waves, Sliders, ShieldCheck, AlertTriangle, Play, Pause, RotateCcw } from 'lucide-react';

export const PactSimulator: React.FC = () => {
  // Simulation parameters
  const [wavelength, setWavelength] = useState<number>(1064); // nm
  const [pulseWidth, setPulseWidth] = useState<number>(6); // ns
  const [fluence, setFluence] = useState<number>(14); // mJ/cm²
  const [transducerFreq, setTransducerFreq] = useState<number>(10); // MHz
  const [skullThickness, setSkullThickness] = useState<number>(7); // mm
  const [targetDepth, setTargetDepth] = useState<number>(32); // mm
  const [isRunning, setIsRunning] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Derived calculations
  const soundSpeed = 1540; // m/s in brain tissue
  const skullSoundSpeed = 3100; // m/s in cortical bone
  const isAnsiSafe = fluence <= 20;

  // Optical absorption & scattering based on wavelength
  const getOpticsParams = (wl: number) => {
    if (wl === 470) return { name: 'Blue (470 nm)', scatter: 'Extremely High', skullTrans: 2.1, optOpsin: 'ChR2 wt' };
    if (wl === 590) return { name: 'Amber (590 nm)', scatter: 'Moderate', skullTrans: 8.4, optOpsin: 'Chrimson / ReaChR' };
    if (wl === 1064) return { name: 'NIR-II (1064 nm)', scatter: 'Minimal (Optimal Window)', skullTrans: 41.2, optOpsin: 'PACT Opsin Resonance' };
    return { name: 'NIR-II Extended (1280 nm)', scatter: 'Low (Deepest Penetration)', skullTrans: 48.7, optOpsin: 'Deep Engram Targets' };
  };

  const optics = getOpticsParams(wavelength);
  // Axial resolution: R_ax ≈ 0.88 * c / B (where B ≈ 0.8 * f)
  const axialResolutionUm = Math.round((0.88 * soundSpeed) / (0.8 * transducerFreq));
  // Lateral resolution approx
  const lateralResolutionUm = Math.round((1.02 * (soundSpeed / (transducerFreq * 1e6)) * (targetDepth * 1e-3)) / 0.02 * 1e6);
  // Pressure amplitude p0 = Gruneisen parameter * absorption * fluence
  const estimatedPressureKPa = (0.2 * (optics.skullTrans / 100) * fluence * 12).toFixed(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      timeRef.current += 0.035;
      const t = timeRef.current;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += 30) {
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

      // Layer 1: Scalp & Hair Interface (Top, y: 0 to 45)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, 45);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText('SCALP & MICRO-COMB SENSOR PLANE (Z = 0 mm)', 15, 25);

      // Micro-comb sensor pillars
      for (let x = 60; x < width - 60; x += 35) {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(x - 2, 0, 4, 38);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(x, 38, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Layer 2: Parietal Skull Bone (y: 45 to 45 + skullThickness * 5)
      const skullY = 45;
      const skullH = skullThickness * 5;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, skullY, width, skullH);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, skullY, width, skullH);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`PARIETAL BONE (Thickness: ${skullThickness} mm, c = ${skullSoundSpeed} m/s)`, 15, skullY + skullH / 2 + 4);

      // Layer 3: Cerebral Cortex & Hippocampal Depth (y: skullY + skullH to bottom)
      const brainY = skullY + skullH;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, brainY, width, height - brainY);
      ctx.fillStyle = '#64748b';
      ctx.fillText(`CORTEX TISSUE MATRIX (Target Depth: ${targetDepth} mm)`, 15, brainY + 25);

      // Target Neuron Location
      const neuronX = width / 2;
      const neuronY = brainY + Math.min(targetDepth * 4.2, height - brainY - 40);

      // 1. LASER PULSE PROPAGATION (Downwards from emitter)
      const laserPulseCycle = (t * 2) % 6; // cycle
      if (laserPulseCycle < 2) {
        const pulseProgress = laserPulseCycle / 2;
        const currentPulseY = skullY + (neuronY - skullY) * pulseProgress;

        // Draw laser beam
        const grad = ctx.createLinearGradient(neuronX, 0, neuronX, currentPulseY);
        const laserColor = wavelength === 470 ? '#38bdf8' : wavelength === 590 ? '#f59e0b' : '#ef4444';
        grad.addColorStop(0, laserColor);
        grad.addColorStop(1, 'rgba(255,255,255,0.9)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(neuronX - 25, 30);
        ctx.lineTo(neuronX, currentPulseY);
        ctx.moveTo(neuronX + 25, 30);
        ctx.lineTo(neuronX, currentPulseY);
        ctx.stroke();

        // Laser wavefront
        ctx.fillStyle = laserColor;
        ctx.beginPath();
        ctx.arc(neuronX, currentPulseY, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. THERMOELASTIC EXPANSION & ULTRASONIC ECHOES (Expanding spheres upwards)
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(neuronX, neuronY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText('ChR2 Engram Node', neuronX + 14, neuronY + 4);

      // Acoustic echo wavefronts expanding outward
      for (let ring = 0; ring < 4; ring++) {
        const ringTime = (t * 1.5 + ring * 0.8) % 3;
        const radius = ringTime * 85;
        if (radius > 5) {
          ctx.strokeStyle = `rgba(6, 182, 212, ${Math.max(0, 1 - ringTime / 3)})`;
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 2]);
          ctx.beginPath();
          ctx.arc(neuronX, neuronY, radius, Math.PI, 2 * Math.PI); // Upward acoustic arc
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // PMUT Sensor Array Receiving Highlights at Scalp
      const echoArrival = (t * 1.5) % 3;
      if (echoArrival > 1.8) {
        ctx.fillStyle = 'rgba(34, 211, 238, 0.4)';
        ctx.fillRect(neuronX - 90, 0, 180, 42);
      }

      if (isRunning) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [wavelength, pulseWidth, fluence, transducerFreq, skullThickness, targetDepth, isRunning]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Waves className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Transcranial Photoacoustic Computed Tomography (PACT)
            </h3>
            <p className="text-xs text-slate-400">
              Laser-to-sound thermoelastic engram readout through human skull bone
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded border border-slate-700 transition"
          >
            {isRunning ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isRunning ? 'Pause Beam' : 'Start Beam'}</span>
          </button>
          <button
            onClick={() => {
              setWavelength(1064);
              setPulseWidth(6);
              setFluence(14);
              setTransducerFreq(10);
              setSkullThickness(7);
              setTargetDepth(32);
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded border border-slate-700 transition"
            title="Reset Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Interactive Canvas */}
        <div className="lg:col-span-8 p-4 bg-slate-950 flex flex-col items-center justify-center relative">
          <canvas
            ref={canvasRef}
            width={640}
            height={380}
            className="w-full max-w-2xl rounded-lg border border-slate-800 shadow-inner bg-slate-950"
          />

          {/* Quick Metrics Bar below Canvas */}
          <div className="w-full max-w-2xl mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded">
              <span className="text-[10px] text-slate-400 block">Optical Transmission</span>
              <span className="font-mono font-bold text-cyan-400">{optics.skullTrans}%</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded">
              <span className="text-[10px] text-slate-400 block">Axial Resolution</span>
              <span className="font-mono font-bold text-emerald-400">{axialResolutionUm} µm</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded">
              <span className="text-[10px] text-slate-400 block">Lateral Resolution</span>
              <span className="font-mono font-bold text-indigo-400">{lateralResolutionUm} µm</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded">
              <span className="text-[10px] text-slate-400 block">Acoustic Pressure (p₀)</span>
              <span className="font-mono font-bold text-amber-400">{estimatedPressureKPa} kPa</span>
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="lg:col-span-4 p-5 bg-slate-950/80 border-t lg:border-t-0 lg:border-l border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-slate-200 tracking-wider uppercase flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" /> Transcranial Parameters
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              {optics.optOpsin}
            </span>
          </div>

          {/* Slider 1: Wavelength */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 font-medium">Laser Wavelength (λ):</span>
              <span className="font-mono font-bold text-cyan-400">{wavelength} nm</span>
            </div>
            <div className="grid grid-cols-4 gap-1 mb-1.5">
              {[470, 590, 1064, 1280].map((wl) => (
                <button
                  key={wl}
                  onClick={() => setWavelength(wl)}
                  className={`py-1 text-[10px] font-mono rounded font-semibold transition ${
                    wavelength === wl
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {wl} nm
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">{optics.name} · Scattering: {optics.scatter}</p>
          </div>

          {/* Slider 2: Laser Fluence */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 font-medium">Laser Fluence:</span>
              <span className={`font-mono font-bold ${isAnsiSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                {fluence} mJ/cm²
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="30"
              step="1"
              value={fluence}
              onChange={(e) => setFluence(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
              <span>ANSI Limit: 20 mJ/cm²</span>
              {isAnsiSafe ? (
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3 h-3" /> Safe Limit
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1 font-semibold">
                  <AlertTriangle className="w-3 h-3" /> Exceeds Safe MPE
                </span>
              )}
            </div>
          </div>

          {/* Slider 3: Transducer Ultrasonic Frequency */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 font-medium">Ultrasound Frequency (f):</span>
              <span className="font-mono font-bold text-indigo-400">{transducerFreq} MHz</span>
            </div>
            <input
              type="range"
              min="3"
              max="15"
              step="1"
              value={transducerFreq}
              onChange={(e) => setTransducerFreq(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Higher frequency improves axial resolution but increases skull bone attenuation.
            </p>
          </div>

          {/* Slider 4: Skull Bone Thickness */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 font-medium">Skull Cortical Thickness:</span>
              <span className="font-mono font-bold text-slate-200">{skullThickness} mm</span>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              step="0.5"
              value={skullThickness}
              onChange={(e) => setSkullThickness(Number(e.target.value))}
              className="w-full accent-slate-400"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Average human adult skull thickness: 6.5–8.0 mm.
            </p>
          </div>

          {/* Slider 5: Deep Tissue Target Depth */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 font-medium">Target Neural Depth:</span>
              <span className="font-mono font-bold text-amber-400">{targetDepth} mm</span>
            </div>
            <input
              type="range"
              min="10"
              max="65"
              step="1"
              value={targetDepth}
              onChange={(e) => setTargetDepth(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Cortex: 10–25 mm · Hippocampus: 30–50 mm · Thalamus: &gt;55 mm.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

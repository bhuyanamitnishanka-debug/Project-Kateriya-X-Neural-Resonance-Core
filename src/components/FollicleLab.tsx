import React, { useState, useEffect, useRef } from 'react';
import { Zap, CheckCircle2, Sliders, AlertCircle } from 'lucide-react';

export const FollicleLab: React.FC = () => {
  const [hairDensity, setHairDensity] = useState<number>(260); // hairs / cm²
  const [pillarPitch, setPillarPitch] = useState<number>(250); // µm
  const [pillarDiameter, setPillarDiameter] = useState<number>(200); // µm
  const [combPenetration, setCombPenetration] = useState<number>(85); // %
  const [coatingType, setCoatingType] = useState<'pedot' | 'gold' | 'silver'>('pedot');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Biophysical calculations
  // Average inter-follicular distance L_f ≈ 10000 / sqrt(hairDensity) in µm
  const interFollicularDistanceUm = Math.round(10000 / Math.sqrt(hairDensity));
  const clearanceGapUm = pillarPitch - pillarDiameter;

  // Contact Impedance calculation
  const baseImpedance = coatingType === 'pedot' ? 6.5 : coatingType === 'gold' ? 8.2 : 9.5;
  const penetrationFactor = Math.max(1, (100 - combPenetration) * 0.4);
  const calculatedImpedanceKOhms = (baseImpedance * (penetrationFactor * 0.15 + 0.85)).toFixed(1);
  const isOptimal = Number(calculatedImpedanceKOhms) < 10;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Dermal Layers
    const stratumY = height - 70;

    // 1. Dermis & Hypodermis (Bottom layer)
    ctx.fillStyle = '#1e1b4b'; // Deep sub-epidermal
    ctx.fillRect(0, stratumY + 20, width, 50);

    // 2. Epidermis & Stratum Corneum
    ctx.fillStyle = '#312e81';
    ctx.fillRect(0, stratumY, width, 20);
    ctx.strokeStyle = '#4338ca';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, stratumY, width, 20);

    ctx.fillStyle = '#a5b4fc';
    ctx.font = '10px monospace';
    ctx.fillText('STRATUM CORNEUM / EPIDERMAL BOUNDARY (Contact Target)', 15, stratumY + 14);

    // 3. Hair Follicles & Shafts (Anagen Phase)
    const follicleSpacing = Math.max(30, (interFollicularDistanceUm / 600) * 80);
    const hairCount = Math.floor(width / follicleSpacing);

    for (let i = 1; i <= hairCount; i++) {
      const follicleX = i * follicleSpacing;

      // Bulb in dermis
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(follicleX, stratumY + 30, 8, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair shaft extending upward through air
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(follicleX, stratumY + 25);
      // Curl / angle to hair shaft
      const curlOffset = Math.sin(i) * 12;
      ctx.quadraticCurveTo(follicleX + curlOffset, stratumY - 60, follicleX + curlOffset * 1.5, 20);
      ctx.stroke();
    }

    // 4. Descending Micro-Comb Sensor Array
    // Comb base plate at top
    const combY = 20 + ((100 - combPenetration) / 100) * 130;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(40, combY - 18, width - 80, 18);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(40, combY - 18, width - 80, 18);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText('KATERIYA-X MICRO-COMB RIGID SUBSTRATE', 50, combY - 6);

    // Individual Micro-Pillars gliding down
    const pillarSpacingPx = Math.max(20, (pillarPitch / 500) * 50);
    const pillarWidthPx = Math.max(3, (pillarDiameter / 350) * 6);
    const pillarCount = Math.floor((width - 100) / pillarSpacingPx);

    for (let p = 1; p <= pillarCount; p++) {
      const pX = 50 + p * pillarSpacingPx;
      const tipY = Math.min(stratumY, combY + 120);

      // Pillar shaft
      ctx.fillStyle = '#64748b';
      ctx.fillRect(pX - pillarWidthPx / 2, combY, pillarWidthPx, tipY - combY);

      // Conductive tip coating
      ctx.fillStyle = coatingType === 'pedot' ? '#06b6d4' : coatingType === 'gold' ? '#f59e0b' : '#cbd5e1';
      ctx.beginPath();
      ctx.arc(pX, tipY, pillarWidthPx / 2 + 1, 0, Math.PI * 2);
      ctx.fill();

      // Contact glow if touching stratum corneum
      if (tipY >= stratumY - 2) {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.beginPath();
        ctx.arc(pX, tipY, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [hairDensity, pillarPitch, pillarDiameter, combPenetration, coatingType, interFollicularDistanceUm]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Hair Follicle Biophysics & Dry Micro-Comb Lab
            </h3>
            <p className="text-xs text-slate-400">
              Anagen phase inter-follicular navigation for sub-10 kΩ contact impedance without conductive gels
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded font-mono font-bold flex items-center gap-1.5 ${
            isOptimal ? 'bg-emerald-950 border border-emerald-800 text-emerald-400' : 'bg-amber-950 border border-amber-800 text-amber-400'
          }`}>
            {isOptimal ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>Impedance: {calculatedImpedanceKOhms} kΩ</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Visual Cross-Section Canvas */}
        <div className="lg:col-span-8 p-4 bg-slate-950 flex flex-col items-center justify-center">
          <canvas
            ref={canvasRef}
            width={640}
            height={340}
            className="w-full max-w-2xl rounded-lg border border-slate-800 shadow-inner bg-slate-950"
          />

          {/* Comparative Impedance Table */}
          <div className="w-full max-w-2xl mt-4 overflow-x-auto border border-slate-800 rounded-lg">
            <table className="min-w-full divide-y divide-slate-800 text-xs">
              <thead className="bg-slate-900 text-slate-300 font-semibold">
                <tr>
                  <th className="px-3 py-2 text-left">BCI Interface Modality</th>
                  <th className="px-3 py-2 text-left">Contact Mechanism</th>
                  <th className="px-3 py-2 text-left">Impedance Range</th>
                  <th className="px-3 py-2 text-left">Preparation / Degradation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-400 text-[11px]">
                <tr>
                  <td className="px-3 py-2 text-slate-300 font-medium">Standard Wet Disc EEG</td>
                  <td className="px-3 py-2">Electrolyte paste</td>
                  <td className="px-3 py-2 font-mono">5 – 15 kΩ</td>
                  <td className="px-3 py-2">Pastes dry out within 3–4 hrs; messy clean-up</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-slate-300 font-medium">Conventional Flat Dry EEG</td>
                  <td className="px-3 py-2">Resting atop hair layer</td>
                  <td className="px-3 py-2 font-mono text-rose-400">150 – 350 kΩ</td>
                  <td className="px-3 py-2">Severe baseline drift & motion artifacts</td>
                </tr>
                <tr className="bg-cyan-950/20 text-cyan-200">
                  <td className="px-3 py-2 font-bold text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Kateriya-X Micro-Comb
                  </td>
                  <td className="px-3 py-2 font-semibold">250 µm Pillars glide between hairs</td>
                  <td className="px-3 py-2 font-mono font-bold text-emerald-400">&lt; 8.4 kΩ</td>
                  <td className="px-3 py-2 text-slate-300">Zero paste, zero abrasion, zero signal fade</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Biophysical Sliders Panel */}
        <div className="lg:col-span-4 p-5 bg-slate-950/80 border-t lg:border-t-0 lg:border-l border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-400" /> Follicle Parameters
            </span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
              Anagen 88%
            </span>
          </div>

          {/* Slider 1: Follicular Density */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 font-medium">Scalp Follicle Density:</span>
              <span className="font-mono font-bold text-amber-400">{hairDensity} hairs/cm²</span>
            </div>
            <input
              type="range"
              min="150"
              max="350"
              step="5"
              value={hairDensity}
              onChange={(e) => setHairDensity(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>Inter-follicular distance:</span>
              <span className="font-mono text-cyan-300 font-semibold">{interFollicularDistanceUm} µm</span>
            </div>
          </div>

          {/* Slider 2: Micro-Comb Pitch */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 font-medium">Pillar Pitch Spacing:</span>
              <span className="font-mono font-bold text-cyan-400">{pillarPitch} µm</span>
            </div>
            <input
              type="range"
              min="180"
              max="450"
              step="10"
              value={pillarPitch}
              onChange={(e) => setPillarPitch(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Optimal pitch matches human Anagen inter-follicle spacing (250–350 µm).
            </p>
          </div>

          {/* Slider 3: Pillar Diameter */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 font-medium">Pillar Diameter:</span>
              <span className="font-mono font-bold text-slate-200">{pillarDiameter} µm</span>
            </div>
            <input
              type="range"
              min="100"
              max="300"
              step="10"
              value={pillarDiameter}
              onChange={(e) => setPillarDiameter(Number(e.target.value))}
              className="w-full accent-slate-400"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Clearance gap between pillars: {clearanceGapUm} µm.
            </p>
          </div>

          {/* Slider 4: Scalp Engagement / Penetration */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-300 font-medium">Comb Scalp Engagement:</span>
              <span className="font-mono font-bold text-emerald-400">{combPenetration}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={combPenetration}
              onChange={(e) => setCombPenetration(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Micro-pillars gently depress epidermal stratum corneum without piercing skin.
            </p>
          </div>

          {/* Tip Coating Selector */}
          <div>
            <span className="text-slate-300 font-medium block mb-1.5">Tip Conductive Coating:</span>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setCoatingType('pedot')}
                className={`py-1.5 text-[10px] rounded font-semibold transition ${
                  coatingType === 'pedot'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                PEDOT:PSS
              </button>
              <button
                onClick={() => setCoatingType('gold')}
                className={`py-1.5 text-[10px] rounded font-semibold transition ${
                  coatingType === 'gold'
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Au Nano-coat
              </button>
              <button
                onClick={() => setCoatingType('silver')}
                className={`py-1.5 text-[10px] rounded font-semibold transition ${
                  coatingType === 'silver'
                    ? 'bg-slate-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Ag/AgCl Dry
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

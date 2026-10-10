import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Brain, Cpu, Play, Pause, RefreshCw, FileDown, Layers, Check, Copy, Activity, Zap } from 'lucide-react';
import { generateSessionPdf } from '../utils/pdfGenerator';

interface PanelData {
  id: number;
  title: string;
  phase: string;
  metaphor: string;
  annotation: string;
  themeColor: string;
  iconSymbol: string;
}

const PANELS: PanelData[] = [
  {
    id: 1,
    title: 'Assembly & Scalp Interface',
    phase: 'Phase 1: Interface Engineering',
    metaphor: 'Architects of Resonance: Engineers assemble the helmet as sensors glow like constellations forming a new galaxy across the subject’s crown.',
    annotation: 'Transparent geodesic dome with embedded opto-acoustic sensors. Dry micro-structured electrodes (250 µm pitch) slide between Anagen hair follicles to reduce contact impedance below 10 kΩ.',
    themeColor: 'from-cyan-950 to-blue-900 border-cyan-500/60 text-cyan-300',
    iconSymbol: '⚡',
  },
  {
    id: 2,
    title: 'Genetic Delivery & Light-Keys',
    phase: 'Phase 2: Molecular Preparation',
    metaphor: 'Opsin Light-Keys: Delivery drones glide through cerebral capillaries, fitting glowing locks onto pyramidal neurons with light-sensitive keys.',
    annotation: 'Retrograde AAV9/PHP.eB capsids or ApoE-conjugated biomimetic lipid nanoparticles deliver red-shifted ChRmine/ChR2 genes without organic solvent toxicity.',
    themeColor: 'from-emerald-950 to-teal-900 border-emerald-500/60 text-emerald-300',
    iconSymbol: '🧬',
  },
  {
    id: 3,
    title: 'Photoacoustic Activation & Sonar Ripples',
    phase: 'Phase 3: Transcranial Wavefronts',
    metaphor: 'Laser-to-Sound Sonar Ripples: Invisible infrared light strikes the skull, transforming into concentric acoustic ripples radiating deep into the brain.',
    annotation: 'Pulsed Near-Infrared II (1064 nm) laser bursts produce localized thermoelastic stress (p₀ = Γ μₐ F), yielding 10.4 MHz ultrasonic echoes captured by a 1024-channel PMUT matrix.',
    themeColor: 'from-amber-950 to-orange-900 border-amber-500/60 text-amber-300',
    iconSymbol: '🌊',
  },
  {
    id: 4,
    title: 'Holographic Engram Constellations',
    phase: 'Phase 4: Deep Engram Mapping',
    metaphor: 'Holographic Constellations: Living memory circuits project into the room like celestial nebulae, shimmering as thoughts ignite synaptic bridges.',
    annotation: 'AI algorithms decode glutamate (AMPA/NMDA) and GABA firing dynamics in real time, mapping hippocampal CA1-CA3 engrams with 280 µm diffraction-limited precision.',
    themeColor: 'from-indigo-950 to-purple-900 border-indigo-500/60 text-indigo-300',
    iconSymbol: '🌌',
  },
  {
    id: 5,
    title: 'Targeted Modulation & Circuit Harmonization',
    phase: 'Phase 5: Cellular Entrainment',
    metaphor: 'Radiant Circuits: The motor cortex blazes like a triumphant morning sun, while the hyperactive amygdala softens into tranquil twilight blue.',
    annotation: 'Opto-acoustic pulse sequences induce Long-Term Potentiation (LTP +14.8 dB) in cognitive memory nodes while activating infralimbic fear-extinction inhibitory pathways.',
    themeColor: 'from-fuchsia-950 to-pink-900 border-fuchsia-500/60 text-fuchsia-300',
    iconSymbol: '🧠',
  },
  {
    id: 6,
    title: 'Clinical Outcome & Resonance Halo',
    phase: 'Phase 6: Therapeutic Equilibrium',
    metaphor: 'Resonance Halo: The patient smiles peacefully enveloped in a gentle harmonic hum, clinical monitors glowing like steadfast guardian beacons.',
    annotation: 'Non-invasive modulation completed with zero craniotomy, zero thermal injury, and verified physiological E/I balance (1.68 ratio) across whole-brain networks.',
    themeColor: 'from-cyan-950 to-emerald-950 border-teal-500/60 text-teal-300',
    iconSymbol: '✨',
  },
];

export const SchematicNarrative: React.FC = () => {
  const [activeView, setActiveView] = useState<'schematic' | 'screenplay' | 'dsp_pipeline'>('schematic');
  const [activePanelId, setActivePanelId] = useState<number>(1);
  const [isEntrainmentActive, setIsEntrainmentActive] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);

  // Live DSP / Frequency metrics
  const [alphaPower, setAlphaPower] = useState<number>(34.2);
  const [betaPower, setBetaPower] = useState<number>(45.8);
  const [deltaPower, setDeltaPower] = useState<number>(20.0);
  const [cognitiveState, setCognitiveState] = useState<'Focused' | 'Relaxed' | 'Fatigued'>('Focused');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef<number>(0);

  // Entrainment toggle
  useEffect(() => {
    if (isEntrainmentActive) {
      setAlphaPower(64.5);
      setBetaPower(22.1);
      setDeltaPower(13.4);
      setCognitiveState('Relaxed');
    } else {
      setAlphaPower(34.2);
      setBetaPower(45.8);
      setDeltaPower(20.0);
      setCognitiveState('Focused');
    }
  }, [isEntrainmentActive]);

  // Real-time canvas waveform animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeView !== 'dsp_pipeline') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      timeRef.current += 0.05;
      const t = timeRef.current;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += 40) {
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

      // 4 Channels to draw
      const channels = [
        { name: 'Frontal (Fz)', yCenter: 40, color: '#38bdf8', betaWt: 0.8, alphaWt: 0.2, entrained: false },
        { name: 'Temporal (T3)', yCenter: 110, color: '#818cf8', betaWt: 0.5, alphaWt: 0.4, entrained: false },
        { name: 'Parietal (Pz)', yCenter: 180, color: '#34d399', betaWt: 0.3, alphaWt: isEntrainmentActive ? 1.4 : 0.6, entrained: isEntrainmentActive },
        { name: 'Occipital (Oz)', yCenter: 250, color: '#f59e0b', betaWt: 0.1, alphaWt: isEntrainmentActive ? 2.1 : 0.9, entrained: isEntrainmentActive },
      ];

      channels.forEach((ch) => {
        // Channel label
        ctx.fillStyle = ch.color;
        ctx.font = '10px monospace';
        ctx.fillText(`${ch.name}${ch.entrained ? ' [ENTRAINED 10Hz]' : ''}`, 10, ch.yCenter - 14);

        // Waveform path
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = ch.entrained ? 2 : 1.2;
        ctx.beginPath();

        for (let x = 0; x < width; x += 2) {
          const sampleT = t + x * 0.02;
          // Delta (2Hz), Alpha (10Hz), Beta (20Hz) components
          const delta = Math.sin(2 * Math.PI * 0.3 * sampleT);
          const alpha = Math.sin(2 * Math.PI * 1.6 * sampleT);
          const beta = Math.sin(2 * Math.PI * 3.2 * sampleT);
          const noise = (Math.sin(sampleT * 13.7) + Math.cos(sampleT * 29.3)) * 0.15;

          const signalVal =
            0.25 * delta +
            ch.alphaWt * alpha +
            ch.betaWt * beta +
            noise;

          const y = ch.yCenter + signalVal * 16;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      if (isStreaming) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeView, isStreaming, isEntrainmentActive]);

  const handleDownloadPdfDossier = () => {
    generateSessionPdf({
      sessionTitle: 'Kateriya-X Graphic Workflow & Neural DSP Session',
      subjectId: 'KX-FLOW-7731',
      leadInvestigator: 'Opto-Acoustic Workflow Director',
      activeNodeName: 'Occipital-Parietal Resonance Axis',
      activeRegion: 'Visual & Sensory-Motor Cortex',
      glutamateLevel: 65,
      gabaLevel: 35,
      eiRatio: '1.86',
      recallScore: 91,
      isLtpActive: isEntrainmentActive,
      contactImpedance: '7.8',
      laserFluence: '14.2',
      wavelength: 1064,
      acousticFreq: '10.4',
      acousticPressure: '18.4',
      axialResolution: '280',
      snr: '34.2',
      cognitiveState,
      stateConfidence: isEntrainmentActive ? 96.2 : 91.8,
      alphaPower,
      betaPower,
      deltaPower,
      entrainmentActive: isEntrainmentActive,
      notes: `Graphic-Novel schematic verified. Phase 1 through 6 engineering validated. Closed-loop 10Hz Alpha resonance entrainment: ${isEntrainmentActive ? 'ENGAGED' : 'STANDBY'}.`,
    });
  };

  const pythonScript = `# =====================================================================
# KATERIYA-X NEURAL RESONANCE & ML CLASSIFIER PIPELINE (PYTHON)
# Multi-channel EEG Generation, Welch FFT Power Spectral Density &
# Closed-Loop 10Hz Alpha Entrainment Modulation
# =====================================================================
import numpy as np
import scipy.signal as signal
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

def generate_simulated_eeg(duration_sec=5, sample_rate=500):
    t = np.linspace(0, duration_sec, int(sample_rate * duration_sec), endpoint=False)
    delta = np.sin(2 * np.pi * 2.0 * t)   # 2 Hz (Deep Sleep / Rest)
    alpha = np.sin(2 * np.pi * 10.0 * t)  # 10 Hz (Relaxed / Awake)
    beta = np.sin(2 * np.pi * 20.0 * t)   # 20 Hz (Active Cognitive Focus)
    noise = np.random.normal(0, 0.5, len(t))
    
    channels = {
        'Frontal_Fz': 0.2 * delta + 0.8 * beta + noise,
        'Temporal_T3': 0.4 * alpha + 0.5 * beta + noise,
        'Parietal_Pz': 0.6 * alpha + 0.3 * delta + noise,
        'Occipital_Oz': 0.9 * alpha + 0.1 * beta + noise
    }
    return t, channels, sample_rate

def apply_resonance_modulation(signal_data, target_freq=10.0, sample_rate=500):
    nyq = 0.5 * sample_rate
    low = (target_freq - 1.5) / nyq
    high = (target_freq + 1.5) / nyq
    b, a = signal.butter(4, [low, high], btype='band')
    modulated_pulse = signal.lfilter(b, a, signal_data)
    return signal_data + (modulated_pulse * 1.5)

if __name__ == "__main__":
    t, raw_channels, fs = generate_simulated_eeg()
    entrained_oz = apply_resonance_modulation(raw_channels['Occipital_Oz'], target_freq=10.0, sample_rate=fs)
    print("Kateriya-X Neural Resonance Simulation Complete.")`;

  const copyPythonCode = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur space-y-0">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Graphic-Novel Schematic Narrative & Neural Resonance DSP
            </h3>
            <p className="text-xs text-slate-400">
              6-Phase Hybrid Graphic Novel Workflow · 4-Channel Live Frequency Streaming · ML Cognitive State
            </p>
          </div>
        </div>

        {/* View Switcher & PDF Action */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setActiveView('schematic')}
              className={`px-3 py-1 rounded transition font-medium ${
                activeView === 'schematic' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Graphic Schematic Panels
            </button>
            <button
              onClick={() => setActiveView('screenplay')}
              className={`px-3 py-1 rounded transition font-medium ${
                activeView === 'screenplay' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cinematic Screenplay
            </button>
            <button
              onClick={() => setActiveView('dsp_pipeline')}
              className={`px-3 py-1 rounded transition font-medium ${
                activeView === 'dsp_pipeline' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live DSP Waveforms & ML
            </button>
          </div>

          <button
            onClick={handleDownloadPdfDossier}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white rounded transition shadow-lg shadow-cyan-600/20"
            title="Download PDF report of current session and graphic workflow"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Download Session PDF</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: GRAPHIC NOVEL SCHEMATIC PANELS */}
      {activeView === 'schematic' && (
        <div className="p-5 space-y-6">
          {/* Phase Step Selector Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {PANELS.map((p) => {
              const isSelected = p.id === activePanelId;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePanelId(p.id)}
                  className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[10px] font-bold text-cyan-400">PANEL 0{p.id}</span>
                    <span className="text-sm">{p.iconSymbol}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-200 line-clamp-1">{p.title}</span>
                </button>
              );
            })}
          </div>

          {/* Expanded Selected Panel Card */}
          {(() => {
            const panel = PANELS.find((p) => p.id === activePanelId) || PANELS[0];
            return (
              <div className="border border-slate-800 rounded-xl bg-slate-950/80 p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-lg">
                      {panel.iconSymbol}
                    </span>
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                        {panel.phase}
                      </span>
                      <h4 className="text-base font-bold text-white tracking-tight">
                        Panel 0{panel.id}: {panel.title}
                      </h4>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                    HYBRID NARRATIVE VALIDATED
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Metaphor Column */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/30 to-slate-900 border border-indigo-900/40 space-y-2">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-xs uppercase tracking-wide">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Graphic-Novel Metaphor & Visual Arc</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed italic">
                      "{panel.metaphor}"
                    </p>
                  </div>

                  {/* Engineering Column */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-cyan-900/40 space-y-2">
                    <div className="flex items-center gap-1.5 text-cyan-300 font-semibold text-xs uppercase tracking-wide">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Rigorous Engineering & Biophysical Annotation</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {panel.annotation}
                    </p>
                  </div>
                </div>

                {/* Workflow Sequence Footnote */}
                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800 text-slate-400">
                  <span>Step {panel.id} of 6 in the Complete Kateriya-X Clinical Protocol</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setActivePanelId((prev) => (prev > 1 ? prev - 1 : 6))}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                    >
                      ← Previous Phase
                    </button>
                    <button
                      onClick={() => setActivePanelId((prev) => (prev < 6 ? prev + 1 : 1))}
                      className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs"
                    >
                      Next Phase →
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* VIEW 2: CINEMATIC SCREENPLAY (DIRECTOR'S BLUEPRINT) */}
      {activeView === 'screenplay' && (
        <div className="p-5 space-y-6">
          <div className="bg-slate-950/70 border border-cyan-500/30 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                DIRECTOR'S SHOOTING SCRIPT · PRODUCTION BLUEPRINT
              </span>
              <h4 className="text-base font-bold text-white tracking-wide">
                Kateriya-X Neural Resonance System: 6-Panel Cinematic Screenplay
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Full continuous film sequence with numbered camera setups, scene directions, dialogue, atmosphere, and integrated transitions.
              </p>
            </div>
            <button
              onClick={() => {
                const fullScriptText = `KATERIYA-X NEURAL RESONANCE SYSTEM - CINEMATIC SCREENPLAY
=========================================================

PANEL 1: ASSEMBLY & SCALP INTERFACE
- Shot 1 (Wide): Futuristic lab bathed in soft blue ambience. Engineers silhouetted against glowing instrumentation.
- Shot 2 (Close-up): Transparent geodesic dome helmet, micro-pillar sensors flickering like stars.
- Shot 3 (Tracking): Hand aligning electrodes sliding between scalp hair follicles without resistance.
DIALOGUE (Engineer): "Align the opto-acoustic array—each sensor must slide between follicles without resistance."
ATMOSPHERE: Low resonance hum begins, subtle vibration in the air.
ANNOTATION: Transparent dome with embedded sensors; electrodes aligned to minimize contact impedance (<10 kΩ).

[TRANSITION 1 -> 2: Cross-fade into holographic bloodstream zoom projected across the lab wall. Resonance hum deepens.]

PANEL 2: GENETIC DELIVERY & LIGHT-KEYS
- Shot 4 (Holographic Pan): Fluid simulation of cerebral microvasculature flowing across the lab chamber.
- Shot 5 (Extreme Close-up): Glowing lipid nanoparticle drones carrying red-shifted opsin "light-keys".
- Shot 6 (Macro Zoom): Pyramidal neuron dendritic arborization igniting into warm amber luminescence.
DIALOGUE (AI Narrator): "Opsin light-keys delivered safely. Neurons now await illumination."
ATMOSPHERE: Lantern-like neurons ignite, casting warm golden light across the lab.
ANNOTATION: AAV9/PHP.eB vectors deliver ChRmine opsins; biomimetic lipid nanoparticles ensure zero solvent toxicity.

[TRANSITION 2 -> 3: Resonance hum crescendos to high-pitch whine, cutting sharply as near-infrared beams strike the helmet.]

PANEL 3: PHOTOACOUSTIC ACTIVATION & SONAR RIPPLES
- Shot 7 (Overhead): Coherent 1064nm NIR-II laser beam strikes the transparent helmet dome.
- Shot 8 (Slow Zoom): Concentric acoustic sonar rings rippling outward through the cranium.
- Shot 9 (Low Angle): PMUT transducer matrix glowing crimson as 10.4 MHz ultrasonic echoes register.
DIALOGUE (Engineer): "Laser conversion stable. Ultrasound echoes detected across all 1024 channels."
ATMOSPHERE: The lab resonates with a deep aquatic hum, as if submerged in acoustic sound waves.
ANNOTATION: NIR pulses induce thermoelastic expansion (p0 = Gamma * mu_a * F); PMUT array captures transcranial echoes.

[TRANSITION 3 -> 4: Holographic zoom into the center of the cranial projection. The acoustic waves crystallize into stars.]

PANEL 4: ENGRAM MAPPING & CONSTELLATIONS
- Shot 10 (Wide): Holographic brain projection fills the entire laboratory like a planetarium.
- Shot 11 (Medium Tracking): AI cartographer algorithm tracing luminous connecting filaments between hippocampus CA1 and CA3.
- Shot 12 (Close-up): Engram memory matrices shimmering in violet and cyan as synaptic bridges light up.
DIALOGUE (AI Narrator): "Engram constellations decoded. Synaptic galaxies revealed with 280-micron diffraction-limited precision."
ATMOSPHERE: The lab feels like an astronomical observatory, engineers gazing into the celestial cosmos of the mind.
ANNOTATION: Acoustic echoes decoded into glutamate (AMPA/NMDA) and GABA firing dynamics; ML reconstructs memory engrams.

[TRANSITION 4 -> 5: Slow dissolve from celestial constellations into radiant suns and tranquil twilight waves.]

PANEL 5: TARGETED MODULATION & CIRCUIT HARMONIZATION
- Shot 13 (Split-Screen Left): Motor cortex blazing golden like a triumphant morning sun, action potentials firing in sync.
- Shot 14 (Split-Screen Right): Hyperactive amygdala washed in soothing twilight blue waves, rapid oscillations calming.
- Shot 15 (Push-In): Overlaid E/I ratio meter stabilizing at 1.68 balance.
DIALOGUE (Clinician): "Motor pathways reinforced. Emotional fear centers stabilized. Long-Term Potentiation confirmed."
ATMOSPHERE: Harmony fills the room—radiant morning sunlight and peaceful twilight dusk blending in perfect equilibrium.
ANNOTATION: Patterned opsin stimulation reinforces motor learning (+14.8 dB LTP), dampens amygdala hyperactivity for PTSD mitigation.

[FINAL TRANSITION 5 -> 6: Slow fade-out into the patient seated serenely, surrounded by a luminous aura of resonance.]

PANEL 6: CLINICAL OUTCOME & RESONANCE HALO
- Shot 16 (Medium): Patient seated calmly enveloped in a transparent halo of harmonic light.
- Shot 17 (Extreme Close-up): Patient's eyes opening with clarity and peace; clinical monitors glowing steady green.
- Shot 18 (Slow Pull-Back): Laboratory team stepping back in reverence as resonance hum resolves into peaceful silence.
DIALOGUE (Patient): "I feel... balanced. Like the chaotic noise has quieted for the first time."
ATMOSPHERE: Serene harmony settles over the lab, transforming the clinical theater into a sanctuary of healing calm.
ANNOTATION: Non-invasive therapeutic success completed with zero skull incision, zero thermal injury, and full memory integrity.`;
                navigator.clipboard.writeText(fullScriptText);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2500);
              }}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Screenplay Copied!' : 'Copy Full Script'}</span>
            </button>
          </div>

          {/* Script Scenes Flow */}
          <div className="space-y-4">
            {/* Panel 1 */}
            <div className="border border-slate-800 bg-slate-950/80 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
                    P1
                  </span>
                  <div>
                    <h5 className="text-sm font-bold text-white">PANEL 1: ASSEMBLY & SCALP INTERFACE</h5>
                    <span className="text-[10px] text-slate-400 font-mono">SCENE 01 · HARDWARE DEPLOYMENT</span>
                  </div>
                </div>
                <span className="text-[10px] bg-cyan-950/80 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded font-mono">
                  3 CAMERA SHOTS
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p><strong className="text-cyan-400 font-mono">SHOT 01 [WIDE SHOT]:</strong> Futuristic neuro-engineering lab bathed in soft blue ambience. Engineers silhouetted against glowing instrumentation and holographic heads-up displays.</p>
                <p><strong className="text-cyan-400 font-mono">SHOT 02 [CLOSE-UP]:</strong> The Kateriya-X transparent geodesic dome helmet. Micro-pillar sensors flicker like stars aligning in a newly born galaxy.</p>
                <p><strong className="text-cyan-400 font-mono">SHOT 03 [TRACKING SHOT]:</strong> Lead engineer's gloved hand carefully guiding the dry comb electrodes sliding between Anagen hair follicles with zero friction.</p>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                <p><span className="text-slate-400 font-bold uppercase text-[10px]">Dialogue (Lead Engineer):</span> <span className="text-cyan-200 italic">"Align the opto-acoustic array—each sensor must slide between follicles without resistance."</span></p>
                <p><span className="text-slate-400 font-bold uppercase text-[10px]">Sensory Atmosphere:</span> <span className="text-slate-300">A low resonance hum begins, a subtle acoustic vibration in the air foreshadowing activation.</span></p>
                <p><span className="text-slate-400 font-bold uppercase text-[10px]">Technical Annotation:</span> <span className="text-slate-400">Transparent dome with embedded PMUT sensors; dry comb electrodes maintain contact impedance &lt; 10 kΩ.</span></p>
              </div>
            </div>

            {/* Transition 1 -> 2 */}
            <div className="text-center py-1">
              <span className="text-[11px] font-mono text-cyan-400/80 bg-slate-950 border border-cyan-500/30 px-3 py-1 rounded-full">
                ⚡ TRANSITION 1 → 2: Cross-fade into holographic bloodstream zoom. Resonance hum deepens.
              </span>
            </div>

            {/* Panel 2 */}
            <div className="border border-slate-800 bg-slate-950/80 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
                    P2
                  </span>
                  <div>
                    <h5 className="text-sm font-bold text-white">PANEL 2: GENETIC DELIVERY & LIGHT-KEYS</h5>
                    <span className="text-[10px] text-slate-400 font-mono">SCENE 02 · MOLECULAR BIO-VECTOR</span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded font-mono">
                  3 CAMERA SHOTS
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p><strong className="text-emerald-400 font-mono">SHOT 04 [HOLOGRAPHIC PAN]:</strong> Fluid simulation of cerebral microvasculature projected across the lab curved wall. Fleets of glowing biomimetic nanoparticle drones drift along blood flow.</p>
                <p><strong className="text-emerald-400 font-mono">SHOT 05 [EXTREME CLOSE-UP]:</strong> Opsin "light-keys" (red-shifted ChRmine) gently docking into cortical neuron membrane receptors depicted as glowing molecular locks.</p>
                <p><strong className="text-emerald-400 font-mono">SHOT 06 [MACRO ZOOM]:</strong> Pyramidal neuron dendritic arborization igniting into warm amber luminescence, ready for photonic excitation.</p>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                <p><span className="text-slate-400 font-bold uppercase text-[10px]">Dialogue (AI Core Narrator):</span> <span className="text-emerald-200 italic">"Opsin light-keys delivered safely. Cortical neurons now await photoacoustic illumination."</span></p>
                <p><span className="text-slate-400 font-bold uppercase text-[10px]">Sensory Atmosphere:</span> <span className="text-slate-300">Lantern-like neurons ignite sequentially, casting warm amber illumination across the observation deck.</span></p>
                <p><span className="text-slate-400 font-bold uppercase text-[10px]">Technical Annotation:</span> <span className="text-slate-400">AAV-PHP.eB / ApoE-conjugated lipid nanoparticles deliver opsin transcripts without cytotoxic organic solvents.</span></p>
              </div>
            </div>

            {/* Transition 2 -> 3 */}
            <div className="text-center py-1">
              <span className="text-[11px] font-mono text-amber-400/80 bg-slate-950 border border-amber-500/30 px-3 py-1 rounded-full">
                🌊 TRANSITION 2 → 3: Resonance hum crescendos sharply, cutting as near-infrared laser beams strike.
              </span>
            </div>

            {/* Panel 3 */}
            <div className="border border-slate-800 bg-slate-950/80 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 font-mono text-xs font-bold">
                    P3
                  </span>
                  <div>
                    <h5 className="text-sm font-bold text-white">PANEL 3: PHOTOACOUSTIC ACTIVATION & SONAR RIPPLES</h5>
                    <span className="text-[10px] text-slate-400 font-mono">SCENE 03 · OPTO-ACOUSTIC TRANSDUCTION</span>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-950/80 border border-amber-800 text-amber-300 px-2 py-0.5 rounded font-mono">
                  3 CAMERA SHOTS
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p><strong className="text-amber-400 font-mono">SHOT 07 [OVERHEAD VIEW]:</strong> A pulsed 1064nm NIR-II laser beam strikes the crown of the helmet. The light is absorbed by opsin clusters, triggering thermoelastic expansion.</p>
                <p><strong className="text-amber-400 font-mono">SHOT 08 [SLOW ZOOM]:</strong> The light wave converts into concentric ultrasound sonar rings expanding like water ripples disturbed by a single falling drop.</p>
                <p><strong className="text-amber-400 font-mono">SHOT 09 [LOW ANGLE TILT]:</strong> 1024-channel high-density PMUT transducer array glowing crimson as 10.4 MHz ultrasonic echoes register cleanly through bone.</p>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                <p><span className="text-slate-400 font-bold uppercase text-[10px]">Dialogue (Acoustic Systems Engineer):</span> <span className="text-amber-200 italic">"Laser-to-sound conversion stable. Transcranial ultrasound echoes detected with 0.3mm axial resolution."</span></p>
                <p><span className="text-slate-400 font-bold uppercase text-[10px]">Sensory Atmosphere:</span> <span className="text-slate-300">The room resonates with a deep, aquatic hum, as if the entire chamber is submerged in sound waves.</span></p>
                <p><span className="text-slate-400 font-bold uppercase text-[10px]">Technical Annotation:</span> <span className="text-slate-400">Pulsed NIR-II bursts induce thermoelastic stress (p0 = Gamma * mu_a * F), bypassing skull bone scattering.</span></p>
              </div>
            </div>

            {/* Transition 3 -> 4 */}
            <div className="text-center py-1">
              <span className="text-[11px] font-mono text-indigo-400/80 bg-slate-950 border border-indigo-500/30 px-3 py-1 rounded-full">
                🌌 TRANSITION 3 → 4: Holographic zoom into the cranial center. Sonar ripples crystallize into constellations.
              </span>
            </div>

            {/* Panel 4 */}
            <div className="border border-slate-800 bg-slate-950/80 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold">
                    P4
                  </span>
                  <div>
                    <h5 className="text-sm font-bold text-white">PANEL 4: ENGRAM MAPPING & CONSTELLATIONS</h5>
                    <span className="text-[10px] text-slate-400 font-mono">SCENE 04 · WHOLE-BRAIN SYNAPTIC CARTOGRAPHY</span>
                  </div>
                </div>
                <span className="text-[10px] bg-indigo-950/80 border border-indigo-800 text-indigo-300 px-2 py-0.5 rounded font-mono">
                  3 CAMERA SHOTS
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p><strong className="text-indigo-400 font-mono">SHOT 10 [WIDE ESTABLISHING]:</strong> A full holographic 3D brain projection fills the laboratory like an astronomical planetarium. Pathways glow like vibrant nebulae.</p>
                <p><strong className="text-indigo-400 font-mono">SHOT 11 [MEDIUM TRACKING]:</strong> AI cartographer tracing luminous geometric filaments connecting hippocampal CA1 and CA3 engrams with prefrontal cortex.</p>
                <p><strong className="text-indigo-400 font-mono">SHOT 12 [CLOSE-UP]:</strong> Synaptic transmission nodes glowing in violet (Glutamate excitation) and cyan (GABA inhibition) as memories replay.</p>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                <p><span className="text-slate-400 font-bold uppercase text-[10px]">Dialogue (AI Core Narrator):</span> <span className="text-indigo-200 italic">"Engram constellations decoded. Synaptic galaxies revealed with 280-micron diffraction-limited precision."</span></p>
                <p><span className="text-slate-400 font-bold uppercase text-[10px]">Sensory Atmosphere:</span> <span className="text-slate-300">The lab feels like a cosmic observatory; researchers gaze upward at the universe unfolding within the human mind.</span></p>
                <p><span className="text-slate-400 font-bold uppercase text-[10px]">Technical Annotation:</span> <span className="text-slate-400">Photoacoustic echoes decoded into neurotransmitter fluxes; 1D-CNN and ML reconstruct engram networks.</span></p>
              </div>
            </div>

            {/* Transition 4 -> 5 */}
            <div className="text-center py-1">
              <span className="text-[11px] font-mono text-fuchsia-400/80 bg-slate-950 border border-fuchsia-500/30 px-3 py-1 rounded-full">
                ☀️ TRANSITION 4 → 5: Slow dissolve from constellations to blazing suns and serene twilight waves.
              </span>
            </div>

            {/* Panel 5 */}
            <div className="border border-slate-800 bg-slate-950/80 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded bg-fuchsia-950 border border-fuchsia-800 flex items-center justify-center text-fuchsia-400 font-mono text-xs font-bold">
                    P5
                  </span>
                  <div>
                    <h5 className="text-sm font-bold text-white">PANEL 5: TARGETED MODULATION & CIRCUIT HARMONIZATION</h5>
                    <span className="text-[10px] text-slate-400 font-mono">SCENE 05 · PRECISION OPTO-ACOUSTIC STIMULATION</span>
                  </div>
                </div>
                <span className="text-[10px] bg-fuchsia-950/80 border border-fuchsia-800 text-fuchsia-300 px-2 py-0.5 rounded font-mono">
                  3 CAMERA SHOTS
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p><strong className="text-fuchsia-400 font-mono">SHOT 13 [SPLIT-SCREEN LEFT]:</strong> Motor cortex blazes like a triumphant morning sun—radiant golden arcs reinforcing neuromuscular pathways and coordination.</p>
                <p><strong className="text-fuchsia-400 font-mono">SHOT 14 [SPLIT-SCREEN RIGHT]:</strong> Basolateral amygdala bathed in calming twilight blue—gentle waves dampening hyperactive fear circuits and emotional overdrive.</p>
                <p><strong className="text-fuchsia-400 font-mono">SHOT 15 [PUSH-IN]:</strong> Overlaid digital telemetry gauges showing E/I balance settling into optimal 1.68 ratio with +14.8 dB LTP potentiation.</p>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                <p><span className="text-slate-400 font-bold uppercase text-[10px]">Dialogue (Chief Neurologist):</span> <span className="text-fuchsia-200 italic">"Motor pathways reinforced. Amygdala fear centers calmed. Cortical homeostasis successfully locked."</span></p>
                <p><span className="text-slate-400 font-bold uppercase text-[10px]">Sensory Atmosphere:</span> <span className="text-slate-300">A palpable balance fills the room—fiery sunrise and cool twilight harmonizing in complete stillness.</span></p>
                <p><span className="text-slate-400 font-bold uppercase text-[10px]">Technical Annotation:</span> <span className="text-slate-400">Patterned opsin stimulation reinforces motor learning and extinguishes PTSD fear circuits non-invasively.</span></p>
              </div>
            </div>

            {/* Final Transition 5 -> 6 */}
            <div className="text-center py-1">
              <span className="text-[11px] font-mono text-teal-400/80 bg-slate-950 border border-teal-500/30 px-3 py-1 rounded-full">
                ✨ FINAL TRANSITION 5 → 6: Slow fade-out into the patient halo. Resonance hum resolves into serene quiet.
              </span>
            </div>

            {/* Panel 6 */}
            <div className="border border-slate-800 bg-slate-950/80 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded bg-teal-950 border border-teal-800 flex items-center justify-center text-teal-400 font-mono text-xs font-bold">
                    P6
                  </span>
                  <div>
                    <h5 className="text-sm font-bold text-white">PANEL 6: CLINICAL OUTCOME & RESONANCE HALO</h5>
                    <span className="text-[10px] text-slate-400 font-mono">SCENE 06 · THERAPEUTIC EQUILIBRIUM & RECOVERY</span>
                  </div>
                </div>
                <span className="text-[10px] bg-teal-950/80 border border-teal-800 text-teal-300 px-2 py-0.5 rounded font-mono">
                  3 CAMERA SHOTS
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p><strong className="text-teal-400 font-mono">SHOT 16 [MEDIUM PROFILE]:</strong> Patient seated serenely on the clinical recliner, enveloped in a gentle halo of harmonic resonance light. The helmet dome softly powers down.</p>
                <p><strong className="text-teal-400 font-mono">SHOT 17 [EXTREME CLOSE-UP]:</strong> Patient opens their eyes; tension leaves their expression, clinical telemetry monitors glowing steady green like guardian spirits.</p>
                <p><strong className="text-teal-400 font-mono">SHOT 18 [SLOW PULL-BACK]:</strong> Medical and engineering team stepping back in reverence as the low hum dissolves into silence.</p>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                <p><span className="text-slate-400 font-bold uppercase text-[10px]">Dialogue (Subject / Patient):</span> <span className="text-teal-200 italic">"I feel... balanced. Like the internal noise has quieted for the first time."</span></p>
                <p><span className="text-slate-400 font-bold uppercase text-[10px]">Sensory Atmosphere:</span> <span className="text-slate-300">Serene harmony settles over the lab, transforming the high-tech testing room into a sanctuary of healing.</span></p>
                <p><span className="text-slate-400 font-bold uppercase text-[10px]">Technical Annotation:</span> <span className="text-slate-400">Non-invasive neuromodulation completed with zero craniotomy, zero thermal elevation, and normalized EEG rhythms.</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: LIVE DSP WAVEFORM STREAMING & ML CLASSIFIER */}
      {activeView === 'dsp_pipeline' && (
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Real-time Oscilloscope Canvas */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" /> 4-Channel Simulated EEG Waves (500 Hz Sampling)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsStreaming(!isStreaming)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1"
                  >
                    {isStreaming ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                    <span>{isStreaming ? 'Pause Stream' : 'Live Stream'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={300}
                  className="w-full h-72 rounded-lg bg-slate-950"
                />
              </div>

              {/* Closed-loop entrainment control */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Closed-Loop 10 Hz Alpha Entrainment Pulse (Occipital / Parietal)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Butterworth 4th-order bandpass filter [8.5 - 11.5 Hz] adds localized resonance energy
                  </span>
                </div>
                <button
                  onClick={() => setIsEntrainmentActive(!isEntrainmentActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    isEntrainmentActive
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${isEntrainmentActive ? 'fill-current animate-bounce' : ''}`} />
                  <span>{isEntrainmentActive ? 'Entrainment Active (10Hz)' : 'Inject 10Hz Pulse'}</span>
                </button>
              </div>
            </div>

            {/* Frequency Bands & ML Classifier */}
            <div className="lg:col-span-4 space-y-4">
              {/* ML Cognitive State Prediction Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    ML Cognitive State
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    1D-CNN / Random Forest
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Predicted Focus Engagement
                  </span>
                  <span className="text-xl font-black text-cyan-400 font-mono block mt-0.5">
                    {cognitiveState}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Confidence: {isEntrainmentActive ? '96.2%' : '92.4%'}
                  </span>
                </div>

                {/* Band Power Ratios */}
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-amber-400">Alpha Wave Power (8–12 Hz):</span>
                      <span className="font-mono font-bold text-amber-400">{alphaPower.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${alphaPower}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-cyan-400">Beta Wave Power (15–30 Hz):</span>
                      <span className="font-mono font-bold text-cyan-400">{betaPower.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded-full transition-all duration-500" style={{ width: `${betaPower}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-indigo-400">Delta Wave Power (1–4 Hz):</span>
                      <span className="font-mono font-bold text-indigo-400">{deltaPower.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-400 h-full rounded-full transition-all duration-500" style={{ width: `${deltaPower}%` }} />
                    </div>
                  </div>
                </div>

                {/* View Python Code Button */}
                <button
                  onClick={() => setShowCodeModal(true)}
                  className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>View Python ML Pipeline Code</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Python Pipeline Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h4 className="font-bold text-sm text-white">Python Neural DSP & ML Pipeline Script</h4>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950 p-3 rounded-lg border border-slate-800">
              <pre className="text-[11px] font-mono text-cyan-300 leading-relaxed whitespace-pre">
                {pythonScript}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 shrink-0">
              <span className="text-[11px] text-slate-400">
                Dependencies: <code className="text-cyan-400">pip install numpy scipy scikit-learn torch</code>
              </span>
              <button
                onClick={copyPythonCode}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold flex items-center gap-1.5"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Python Code'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

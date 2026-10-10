import React, { useState } from 'react';
import { Sparkles, Brain, Cpu, Send, RefreshCw, Layers, ShieldCheck } from 'lucide-react';
import { SUPERHERO_TRANSLATIONS } from '../data/scientificData';
import { SuperheroConcept } from '../types';

export const SuperheroTranslator: React.FC = () => {
  const [selectedConcept, setSelectedConcept] = useState<SuperheroConcept>(SUPERHERO_TRANSLATIONS[0]);
  const [customHeroInput, setCustomHeroInput] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [customResult, setCustomResult] = useState<string | null>(null);

  const handleTranslateCustom = async () => {
    if (!customHeroInput.trim() || isTranslating) return;
    setIsTranslating(true);
    setCustomResult(null);

    try {
      const response = await fetch('/api/superhero-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroConcept: customHeroInput }),
      });
      const data = await response.json();
      setCustomResult(data.translation);
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Superhero Lore to Peer-Reviewed Translation Lab
            </h3>
            <p className="text-xs text-slate-400">
              Transforming sci-fi gadgetry into rigorous optogenetic, photoacoustic, and biophysical engineering
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/70 border border-cyan-800 px-2.5 py-1 rounded">
          GADGETRY TRANSLATION CORE
        </span>
      </div>

      <div className="p-5 space-y-6">
        {/* Pre-Loaded Superhero Models */}
        <div>
          <span className="text-xs font-semibold text-slate-300 block mb-2.5">
            Select Canonical Lore Blueprint:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {SUPERHERO_TRANSLATIONS.map((hero) => {
              const isSelected = selectedConcept.id === hero.id;
              return (
                <button
                  key={hero.id}
                  onClick={() => {
                    setSelectedConcept(hero);
                    setCustomResult(null);
                  }}
                  className={`p-3 rounded-lg border text-left transition ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold block uppercase">
                    {hero.character}
                  </span>
                  <span className="text-xs font-bold text-white block mt-0.5">
                    {hero.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Superhero Translator Input */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Or Translate Any Sci-Fi / Superhero Lore into Rigorous Medical Reality:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customHeroInput}
              onChange={(e) => setCustomHeroInput(e.target.value)}
              placeholder="e.g. Doctor Octopus neural interface, Batman sonar cowl, Professor X mental link..."
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={handleTranslateCustom}
              disabled={isTranslating || !customHeroInput.trim()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-cyan-600/20"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Translate Blueprint</span>
            </button>
          </div>
        </div>

        {/* Display Active Blueprint */}
        {isTranslating && (
          <div className="p-8 border border-slate-800 rounded-xl bg-slate-950/50 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            <p className="text-xs text-slate-400 font-mono">
              Translating comic lore into biophysical parameters, optical windows, and ion channels...
            </p>
          </div>
        )}

        {customResult ? (
          <div className="border border-slate-800 rounded-xl bg-slate-950/80 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Custom Blueprint Translation
              </span>
              <span className="text-[10px] font-mono text-slate-400">Peer-Reviewed Spec</span>
            </div>
            <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {customResult}
            </div>
          </div>
        ) : (
          <div className="border border-slate-800 rounded-xl bg-slate-950/80 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  {selectedConcept.name}
                </span>
                <span className="text-[11px] text-cyan-400 font-mono">
                  Character Lore: {selectedConcept.character}
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                VALIDATED BIOPHYSIQUE
              </span>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase block mb-1">
                  1. Comic Book & Sci-Fi Lore
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedConcept.sourceLore}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900 border border-cyan-900/50">
                <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase block mb-1">
                  2. Peer-Reviewed Medical Reality
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedConcept.medicalReality}
                </p>
              </div>
            </div>

            {/* Technical Parameters Table */}
            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="min-w-full divide-y divide-slate-800 text-xs">
                <thead className="bg-slate-900 text-slate-300 font-semibold">
                  <tr>
                    <th className="px-3 py-2 text-left">Subsystem</th>
                    <th className="px-3 py-2 text-left">Kateriya-X Engineering Specification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 text-[11px]">
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-400">Opto-Acoustic Band:</td>
                    <td className="px-3 py-2 font-mono text-cyan-300">{selectedConcept.transductionBand}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-400">Acoustic Echo Dynamics:</td>
                    <td className="px-3 py-2 font-mono text-indigo-300">{selectedConcept.acousticEcho}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-400">Target Opsin / Channel:</td>
                    <td className="px-3 py-2 font-mono text-emerald-300">{selectedConcept.channelTarget}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-slate-400">Material & Sensor Stack:</td>
                    <td className="px-3 py-2 font-mono text-slate-300">{selectedConcept.materialStack}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

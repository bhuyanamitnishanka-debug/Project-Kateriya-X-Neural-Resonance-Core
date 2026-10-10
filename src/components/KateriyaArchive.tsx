import React, { useState } from 'react';
import { BookOpen, Award, ExternalLink, Dna, Filter, Sparkles, CheckCircle2 } from 'lucide-react';
import { CHANNELRHODOPSIN_VARIANTS } from '../data/scientificData';
import { ChannelrhodopsinVariant } from '../types';

export const KateriyaArchive: React.FC = () => {
  const [selectedVariant, setSelectedVariant] = useState<ChannelrhodopsinVariant>(CHANNELRHODOPSIN_VARIANTS[0]);
  const [filterWavelength, setFilterWavelength] = useState<'all' | 'blue' | 'amber' | 'red'>('all');

  const filteredVariants = CHANNELRHODOPSIN_VARIANTS.filter((v) => {
    if (filterWavelength === 'blue') return v.activationWavelength <= 500;
    if (filterWavelength === 'amber') return v.activationWavelength > 500 && v.activationWavelength < 600;
    if (filterWavelength === 'red') return v.activationWavelength >= 600;
    return true;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur space-y-6">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Prof. Suneel Kateriya Memorial & Optogenetics Archive
            </h3>
            <p className="text-xs text-slate-400">
              Co-Discovery of Channelrhodopsin-1 & 2 · Foundational Bedrock for the 2026 Nobel Prize in Physiology or Medicine
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2.5 py-1 rounded">
          JNU / HEGEMANN LAB ARCHIVE
        </span>
      </div>

      <div className="p-5 space-y-6">
        {/* Memorial Historical Timeline Section */}
        <div className="rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-900/60 p-5">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm mb-3">
            <Dna className="w-4 h-4 text-cyan-400" />
            <span>The Molecular Revolution of Channelrhodopsin (ChR1 & ChR2)</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            In 2002, <strong>Professor Suneel Kateriya</strong>, working in close collaboration with Peter Hegemann and Georg Nagel, identified and cloned the genuine light-gated ion channel <em>Channelrhodopsin-1 (ChR1)</em> from the green flagellate alga <em>Chlamydomonas reinhardtii</em>. This landmark breakthrough (published in <em>Science</em>, 2002) revealed that a single protein could act simultaneously as a light sensor and an ion channel—defying prevailing dogma that photoreceptors required complex G-protein enzymatic cascades.
          </p>

          <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
            This foundational discovery—extended in 2003 with <em>Channelrhodopsin-2 (ChR2)</em>—enabled neuroscientists worldwide to genetically target specific neuronal populations and trigger action potentials with microsecond millimetric light pulses, transforming modern neurobiology and directly laying the foundation for the <strong>2026 Nobel Prize in Physiology or Medicine</strong>.
          </p>

          {/* Key Citation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-3 border-t border-cyan-900/40">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs">
              <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">
                SEMINAL PUBLICATION I · SCIENCE (2002)
              </span>
              <p className="font-semibold text-white">
                "Channelrhodopsin-1: A Light-Gated Proton Channel in Green Algae"
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Nagel G., Ollig D., Fuhrmann M., <strong>Kateriya S.</strong>, Musti A.M., Bamberg E., Hegemann P.
              </p>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs">
              <span className="text-[10px] font-mono text-indigo-400 font-bold block mb-1">
                SEMINAL PUBLICATION II · NATURE (2003)
              </span>
              <p className="font-semibold text-white">
                "Channelrhodopsin-2, a directly light-gated cation-selective membrane channel"
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Nagel G., Szellas T., Huhn W., <strong>Kateriya S.</strong>, Adeishvili N., Berthold P., Ollig D., Hegemann P., Bamberg E.
              </p>
            </div>
          </div>
        </div>

        {/* Channelrhodopsin Variant Catalog */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Engineered Channelrhodopsin Variant Catalog
              </h4>
              <p className="text-[11px] text-slate-400">
                Spectroscopic activation profiles, decay kinetics, and photoacoustic compatibility
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setFilterWavelength('all')}
                className={`px-2 py-0.5 rounded transition ${
                  filterWavelength === 'all' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Variants
              </button>
              <button
                onClick={() => setFilterWavelength('blue')}
                className={`px-2 py-0.5 rounded transition ${
                  filterWavelength === 'blue' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Blue (≤500 nm)
              </button>
              <button
                onClick={() => setFilterWavelength('amber')}
                className={`px-2 py-0.5 rounded transition ${
                  filterWavelength === 'amber' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Amber (500–600 nm)
              </button>
              <button
                onClick={() => setFilterWavelength('red')}
                className={`px-2 py-0.5 rounded transition ${
                  filterWavelength === 'red' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Red (≥600 nm)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Variant List Buttons */}
            <div className="space-y-1.5 md:col-span-1">
              {filteredVariants.map((variant) => {
                const isSelected = selectedVariant.name === variant.name;
                return (
                  <button
                    key={variant.name}
                    onClick={() => setSelectedVariant(variant)}
                    className={`w-full p-2.5 rounded-lg border text-left transition flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/80 text-white font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: variant.peakAbsorptionColor }}
                      />
                      <span>{variant.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      {variant.activationWavelength} nm
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Variant Deep Dive Card */}
            <div className="md:col-span-2 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h5 className="font-bold text-white text-sm flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedVariant.peakAbsorptionColor }}
                    />
                    {selectedVariant.name}
                  </h5>
                  <span className="text-[11px] text-slate-400 italic">
                    Source: {selectedVariant.organism} (Discovered {selectedVariant.discoveryYear})
                  </span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  λ_max = {selectedVariant.activationWavelength} nm
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Off-Kinetics (Deactivation):</span>
                  <span className="font-mono font-bold text-emerald-400">{selectedVariant.decayKinetics}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Ion Permeability:</span>
                  <span className="font-mono font-bold text-indigo-400">{selectedVariant.ionConductance}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Light Sensitivity:</span>
                  <span className="font-mono font-bold text-amber-400">{selectedVariant.photoSensitivity}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Kateriya-X PACT Coupling:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {selectedVariant.activationWavelength >= 590 ? 'Deep Transcranial' : 'Cortical Surface'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Biomedical Application:</span>
                <p className="text-slate-300 leading-relaxed text-[11px] bg-slate-900/60 p-2.5 rounded border border-slate-800">
                  {selectedVariant.biomedicalUse}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

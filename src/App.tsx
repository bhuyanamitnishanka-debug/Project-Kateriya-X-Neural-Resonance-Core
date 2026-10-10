import React, { useState, useEffect } from 'react';
import { SupportedLanguage } from './types';
import { Header } from './components/Header';
import { HelmetVisualizer } from './components/HelmetVisualizer';
import { ConsoleChat } from './components/ConsoleChat';
import { PactSimulator } from './components/PactSimulator';
import { FollicleLab } from './components/FollicleLab';
import { EngramMap } from './components/EngramMap';
import { SafetyAuditor } from './components/SafetyAuditor';
import { NeuralPredictor } from './components/NeuralPredictor';
import { HardwareTelemetryLogger } from './components/HardwareTelemetryLogger';
import { TelemetryDashboard } from './components/TelemetryDashboard';
import { SuperheroTranslator } from './components/SuperheroTranslator';
import { SchematicNarrative } from './components/SchematicNarrative';
import { KateriyaArchive } from './components/KateriyaArchive';
import { ChevronDown, ChevronUp, Cpu, Award } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [activeTab, setActiveTab] = useState<string>('assistant');
  const [showHelmetVisualizer, setShowHelmetVisualizer] = useState<boolean>(true);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  useEffect(() => {
    // Ping server health
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'operational') {
          setIsBackendConnected(true);
        }
      })
      .catch(() => {
        setIsBackendConnected(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Main Navigation Header */}
      <Header
        language={language}
        setLanguage={setLanguage}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendConnected={isBackendConnected}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Collapsible Kateriya-X Helmet Visualizer & Ray Tracing Header */}
        <section aria-label="Helmet Visualizer" className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Kateriya-X Neural Resonance System Hardware Architecture
            </span>
            <button
              onClick={() => setShowHelmetVisualizer(!showHelmetVisualizer)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium transition"
            >
              <span>{showHelmetVisualizer ? 'Collapse Hardware Model' : 'Expand Hardware Model'}</span>
              {showHelmetVisualizer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showHelmetVisualizer && <HelmetVisualizer />}
        </section>

        {/* Dynamic Tab Subsystems */}
        <section aria-label="Active Subsystem Console" className="space-y-4">
          {activeTab === 'assistant' && (
            <ConsoleChat language={language} setLanguage={setLanguage} />
          )}

          {activeTab === 'dashboard' && <TelemetryDashboard />}

          {activeTab === 'simulator' && <PactSimulator />}

          {activeTab === 'follicle' && <FollicleLab />}

          {activeTab === 'engram' && <EngramMap />}

          {activeTab === 'safety' && <SafetyAuditor />}

          {activeTab === 'predictor' && <NeuralPredictor />}

          {activeTab === 'logger' && <HardwareTelemetryLogger />}

          {activeTab === 'schematic' && <SchematicNarrative />}

          {activeTab === 'superhero' && <SuperheroTranslator />}

          {activeTab === 'archive' && <KateriyaArchive />}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="font-semibold text-slate-400">Project Kateriya-X</span>
            <span>· Non-Invasive Opto-Acoustic BCI & Neural Resonance Core</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>In Memory of Prof. Suneel Kateriya (1973–2024)</span>
            <span aria-hidden="true">·</span>
            <span>JNU & Hegemann Lab Optogenetics Legacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

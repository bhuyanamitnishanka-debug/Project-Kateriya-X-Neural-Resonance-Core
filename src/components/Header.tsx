import React from 'react';
import { SupportedLanguage } from '../types';
import { MULTILINGUAL_UI } from '../data/scientificData';
import { Activity, ShieldCheck, Zap, Waves, Brain, Sparkles, BookOpen, Cpu, Radio, Database, LineChart } from 'lucide-react';

interface HeaderProps {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isBackendConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  activeTab,
  setActiveTab,
  isBackendConnected,
}) => {
  const t = MULTILINGUAL_UI[language];

  const navItems = [
    { id: 'assistant', label: t.navAssistant, icon: Brain },
    { id: 'dashboard', label: (t as any).navDashboard || 'Telemetry Dashboard', icon: LineChart },
    { id: 'simulator', label: t.navSimulator, icon: Waves },
    { id: 'follicle', label: t.navFollicle, icon: Zap },
    { id: 'engram', label: t.navEngram, icon: Activity },
    { id: 'safety', label: t.navSafety, icon: ShieldCheck },
    { id: 'predictor', label: t.navPredictor, icon: Radio },
    { id: 'logger', label: t.navLogger, icon: Database },
    { id: 'schematic', label: t.navSchematic, icon: Sparkles },
    { id: 'superhero', label: t.navSuperhero, icon: Cpu },
    { id: 'archive', label: t.navArchive, icon: BookOpen },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50 text-slate-100">
      {/* Top Banner: Suneel Kateriya Memorial Context */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-b border-cyan-800/30 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-cyan-300 font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{t.memorialBadge}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Channelrhodopsin-1 & 2 Core</span>
            <span aria-hidden="true">·</span>
            <span>2026 Nobel Physiology/Medicine Baseline</span>
            <span aria-hidden="true">·</span>
            <span className={`inline-flex items-center gap-1 ${isBackendConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {isBackendConnected ? 'Core Engine Online' : 'Simulation Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-xl tracking-tighter">
            KX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
                {t.systemTitle}
              </h1>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-1.5 py-0.5 rounded">
                PACT-BCI
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono tracking-wide">
              {t.systemSubtitle}
            </p>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
              language === 'en'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
              language === 'hi'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => setLanguage('or')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
              language === 'or'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ଓଡ଼ିଆ
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="max-w-7xl mx-auto px-4 overflow-x-auto border-t border-slate-900 scrollbar-none">
        <div className="flex items-center gap-1 py-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};

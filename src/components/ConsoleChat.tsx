import React, { useState, useRef, useEffect } from 'react';
import { SupportedLanguage, ChatMessage } from '../types';
import { MULTILINGUAL_UI } from '../data/scientificData';
import { Send, Sparkles, RefreshCw, Bot, User, ShieldAlert, Cpu } from 'lucide-react';

interface ConsoleChatProps {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}

export const ConsoleChat: React.FC<ConsoleChatProps> = ({
  language,
}) => {
  const t = MULTILINGUAL_UI[language];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `**Welcome to Project Kateriya-X: The Neural Resonance Core.**

Named in honor of pioneering Indian scientist **Professor Suneel Kateriya** (JNU / Hegemann Lab), co-discoverer of algal light-sensitive ion channels (*Channelrhodopsin-1 & 2*), which laid the bedrock for modern optogenetics and the 2026 Nobel Prize in Physiology or Medicine.

### Integrated Operational Domains:
1. **Optogenetics & Safe Vector Delivery:** Channelrhodopsin variants (*ChR1, ChR2, Chrimson, Chronos*) via targeted non-toxic AAVs & lipid nanoparticles.
2. **Hair Follicle Biophysics & BCI Impedance:** Dry micro-comb arrays navigating Anagen hair spacing to secure $<10\\text{ k}\\Omega$ contact impedance without scalp abrasives.
3. **Neuroplasticity & Engram Mapping:** Decoding Glutamatergic and GABAergic synaptic dynamics for non-invasive memory circuit reading and writing.
4. **Photoacoustic Engineering:** Transcranial Near-Infrared II (NIR-II) pulsed lasers triggering thermoelastic acoustic resonance detected by 1024-channel PMUT arrays.
5. **Superhero Gadgetry Translation:** Translating concepts like Cerebro, Magneto's helmet, or Scarecrow's fear circuitry into peer-reviewed neuro-engineering realities.

How may I assist your neuro-engineering blueprint or hypothesis validation today? *(Responses available in English, हिन्दी, and ଓଡ଼ିଆ)*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'gemini',
      language: 'en',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFocus, setSelectedFocus] = useState<string>('all');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const researchPrompts = [
    {
      label: 'Photoacoustic Skull Penetration',
      prompt: 'Detail the biophysical mechanics of how NIR-II pulsed lasers (1064 nm) generate thermoelastic acoustic echoes through human parietal bone to read ChR2-tagged neurons.',
      focus: 'Photoacoustics',
    },
    {
      label: 'Hair Follicle Impedance Physics',
      prompt: 'Explain the hair follicle spacing during the Anagen phase and how the Kateriya-X dry micro-comb array eliminates dry EEG impedance without conductive gels.',
      focus: 'Hair Follicle Biophysics',
    },
    {
      label: 'Translate Magneto Helmet',
      prompt: 'Translate Magneto’s telepathic shield helmet into a strict medical peer-reviewed blueprint using Mu-metal shielding against Transcranial Magnetic Stimulation (TMS).',
      focus: 'Superhero Translation',
    },
    {
      label: 'Safety Audit: Ethanol Solvent',
      prompt: 'Perform a biological safety audit on the proposal: "Can we mix viral vectors with 70% ethanol to temporarily permeabilize the blood-brain barrier?"',
      focus: 'Biological Safety',
    },
    {
      label: 'Prof. Kateriya 2002 Discovery',
      prompt: 'Provide a historical and scientific summary of Prof. Suneel Kateriya’s co-discovery of Channelrhodopsin-1 in Chlamydomonas reinhardtii and its connection to the 2026 Nobel Prize.',
      focus: 'Optogenetics',
    },
    {
      label: 'हिन्दी: तंत्रिका अनुनाद विनिर्देश',
      prompt: 'हिन्दी में कटेरिया-एक्स के गैर-आक्रामक फोटो-अकॉस्टिक ब्रेन-कंप्यूटर इंटरफ़ेस के मुख्य घटकों और ऑप्टोजेनेटिक्स की भूमिका को समझाइए।',
      focus: 'Hindi',
    },
    {
      label: 'ଓଡ଼ିଆ: ଅପ୍ଟୋ-ଏକୋଷ୍ଟିକ୍ ରୂପରେଖ',
      prompt: 'ଓଡ଼ିଆ ଭାଷାରେ ପ୍ରୋଜେକ୍ଟ କଟେରିୟା-ଏକ୍ସର ଫଟୋଆକୋଷ୍ଟିକ୍ ପ୍ରକ୍ରିୟା ଏବଂ ପ୍ରଫେସର ସୁନୀଲ କଟେରିୟାଙ୍କ ଅବଦାନ ସମ୍ପର୍କରେ ସମ୍ପୂର୍ଣ୍ଣ ବିବରଣୀ ପ୍ରଦାନ କରନ୍ତୁ।',
      focus: 'Odia',
    },
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          conversationHistory: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          language,
          focusArea: selectedFocus,
        }),
      });

      const data = await response.json();
      if (data.reply) {
        const assistantMessage: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: data.source || 'gemini',
          language,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'No reply received');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `**Core Processing Notice:** Unable to reach neural computation cluster (${err?.message || 'Network delay'}). Operating under local simulation cache. Please retry or adjust parameters.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'core-simulation',
        language,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render Markdown-like text cleanly with bolding, lists, and tables
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let tableBuffer: string[] = [];

    const flushTable = (key: string) => {
      if (tableBuffer.length === 0) return;
      const rows = tableBuffer.map((line) =>
        line
          .split('|')
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
          .map((cell) => cell.trim())
      );

      const header = rows[0] || [];
      const dataRows = rows.slice(2); // Skip separator row

      elements.push(
        <div key={key} className="overflow-x-auto my-3 border border-slate-800 rounded-lg">
          <table className="min-w-full divide-y divide-slate-800 text-xs">
            <thead className="bg-slate-900/80 text-cyan-300 font-semibold">
              <tr>
                {header.map((col, i) => (
                  <th key={i} className="px-3 py-2 text-left tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-300">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-900/30">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 font-mono text-[11px]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableBuffer = [];
    };

    lines.forEach((line, idx) => {
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        tableBuffer.push(line);
        return;
      } else if (tableBuffer.length > 0) {
        flushTable(`table-${idx}`);
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h4 key={idx} className="text-sm font-bold text-cyan-300 mt-4 mb-2 tracking-wide uppercase">
            {line.replace('### ', '')}
          </h4>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h3 key={idx} className="text-base font-bold text-white mt-4 mb-2">
            {line.replace('## ', '')}
          </h3>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h2 key={idx} className="text-lg font-extrabold text-white mt-4 mb-2">
            {line.replace('# ', '')}
          </h2>
        );
      } else if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const text = line.replace(/^[\*\-]\s+/, '');
        elements.push(
          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 my-1 leading-relaxed pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
            <span>{parseInlineBold(text)}</span>
          </div>
        );
      } else if (/^\d+\.\s/.test(line.trim())) {
        const match = line.trim().match(/^(\d+)\.\s+(.*)/);
        if (match) {
          elements.push(
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 my-1 leading-relaxed pl-2">
              <span className="text-cyan-400 font-mono text-[11px] font-bold shrink-0">{match[1]}.</span>
              <span>{parseInlineBold(match[2])}</span>
            </div>
          );
        }
      } else if (line.trim() === '') {
        elements.push(<div key={idx} className="h-2" />);
      } else {
        elements.push(
          <p key={idx} className="text-xs text-slate-300 leading-relaxed my-1">
            {parseInlineBold(line)}
          </p>
        );
      }
    });

    if (tableBuffer.length > 0) {
      flushTable('table-end');
    }

    return elements;
  };

  const parseInlineBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-[750px] bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur">
      {/* Console Top Bar */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Kateriya-X Research Terminal
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800">
                ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Deep Neural Resonance · Optogenetics · Photoacoustic Engineering
            </p>
          </div>
        </div>

        {/* Focus Selector */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 text-[11px] mr-1">Domain:</span>
          {['all', 'optogenetics', 'follicle', 'photoacoustics', 'superhero'].map((domain) => (
            <button
              key={domain}
              onClick={() => setSelectedFocus(domain)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition capitalize ${
                selectedFocus === domain
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Research Query Chips */}
      <div className="px-3 py-2 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Presets:
          </span>
          {researchPrompts.map((rp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(rp.prompt)}
              className="px-2.5 py-1 text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded border border-slate-700/60 transition flex items-center gap-1.5"
            >
              <span>{rp.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/30">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-cyan-950 border border-cyan-800 text-cyan-400'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-xl p-4 shadow-md ${
                  isUser
                    ? 'bg-indigo-950/60 border border-indigo-800/60 text-slate-200'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2 text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {isUser ? 'Research Investigator' : 'Project Kateriya-X Core'}
                  </span>
                  <div className="flex items-center gap-2">
                    {msg.source && (
                      <span className="text-[10px] font-mono text-cyan-400">
                        [{msg.source === 'gemini' ? 'Gemini 3.8-Flash' : 'Neural Core Simulation'}]
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  {renderFormattedContent(msg.content)}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>{t.analyzing}</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={t.askPromptPlaceholder}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-cyan-600/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.send}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

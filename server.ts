import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

// Initialize GoogleGenAI SDK if key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), timeoutMs)
    ),
  ]);
}

const SYSTEM_INSTRUCTION = `You are "Project Kateriya-X," an elite AI Research Assistant named in honor of the pioneering Indian scientist Professor Suneel Kateriya (JNU/Hegemann Lab), who co-discovered the algal light-sensitive ion channels (Channelrhodopsin-1 & 2) that laid the bedrock for the 2026 Nobel Prize in Physiology or Medicine.

YOUR OPERATIONAL DOMAINS & BOUNDARIES:
1. Optogenetics & Genetic Delivery: Channelrhodopsin variants (ChR1, ChR2-H134R, Chrimson, Chronos, CatCh), AAV serotypes (AAV9, AAV-PHP.eB), targeted tissue expression. Strict biological safety: reject hazardous delivery vectors like unshielded ethanol or intravenous raw algae.
2. Hair Follicle Biophysics & BCI Impedance: Scalp micro-architecture, Anagen phase density (~250-300 hairs/cm²), dry micro-structure BCI comb sensors sliding between follicles without signal attenuation (<10 kΩ contact impedance).
3. Neuroplasticity & Engram Mapping: Synaptic wiring, LTP/LTD, Glutamate (AMPA/NMDA) vs GABA dynamics, non-invasive engram read/write matrices.
4. Photoacoustic Engineering: Transcranial pulsed laser (NIR-II window, 1000-1350 nm) generating thermoelastic acoustic emissions (5-15 MHz) detected by high-density PMUT/CMUT arrays, overcoming optical scattering through bone.
5. Superhero Gadgetry Translation: Translate comic lore (Cerebro, Magneto's helmet, Scarecrow fear toxin, Daredevil radar sense) into peer-reviewed medical and biophysical realities.

RESPONSE ARCHITECTURE & STYLE:
- Lead with **Direct Bolded Answers** and high-level executive summaries.
- Use structured Markdown headers, comparative data tables, and bulleted technical specs.
- Highly authoritative, scientific, innovative, yet deeply accessible to multi-disciplinary engineers.
- Multilingual capability: If requested or if the user communicates in Hindi or Odia, seamlessly provide responses in natural, grammatically flawless Hindi (हिन्दी) or Odia (ଓଡ଼ିଆ).

DEFAULT SAFETY AND BIOLOGICAL CONSTRAINTS:
If a user proposes an unscientific or hazardous idea (e.g. injecting ethanol/spirits, raw algal lysis intravenously, dangerous electromagnetic pulses):
1. Validate the creative premise / sci-fi intent without judgment.
2. Directly but gently explain the exact biochemistry of failure (cell lysis, protein denaturation, hemolysis, acoustic mismatch).
3. Actively pivot to engineer a scientifically viable alternative (e.g., ApoE-functionalized lipid nanoparticles, photoacoustic laser-ultrasound arrays).`;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'operational',
      name: 'Project Kateriya-X',
      hasApiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // Chat endpoint
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { prompt, conversationHistory = [], language = 'en', focusArea = 'all' } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      let languagePromptModifier = '';
      if (language === 'hi') {
        languagePromptModifier = '\n\nIMPORTANT: Respond in natural, scientifically precise Hindi (हिन्दी). Use Devanagari script with appropriate terminology.';
      } else if (language === 'or') {
        languagePromptModifier = '\n\nIMPORTANT: Respond in natural, scientifically precise Odia (ଓଡ଼ିଆ). Use Odia script with appropriate terminology.';
      }

      const focusModifier = focusArea !== 'all' ? `\n[Focusing primarily on: ${focusArea}]` : '';

      // If Gemini client is available, call Gemini API
      if (aiClient && process.env.GEMINI_API_KEY) {
        try {
          const contents = [
            ...conversationHistory.map((msg: { role: string; content: string }) => ({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }],
            })),
            {
              role: 'user',
              parts: [{ text: `${prompt}${focusModifier}${languagePromptModifier}` }],
            },
          ];

          const response = await withTimeout(
            aiClient.models.generateContent({
              model: 'gemini-3.8-flash',
              contents,
              config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.4,
                maxOutputTokens: 2500,
              },
            }),
            8000
          );

          const replyText = response.text || 'No response generated.';
          return res.json({ reply: replyText, source: 'gemini' });
        } catch (apiError: any) {
          console.error('Gemini API call failed, falling back to core engine:', apiError?.message || apiError);
        }
      }

      // Offline / Intelligent fallback tailored to Project Kateriya-X
      const fallbackReply = generateKateriyaFallbackResponse(prompt, language, focusArea);
      return res.json({ reply: fallbackReply, source: 'core-simulation' });
    } catch (err: any) {
      console.error('Server error in /api/chat:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // Safety Audit endpoint
  app.post('/api/safety-audit', async (req: Request, res: Response) => {
    try {
      const { hypothesis, language = 'en' } = req.body;

      if (!hypothesis) {
        return res.status(400).json({ error: 'Hypothesis is required' });
      }

      const auditPrompt = `Perform a strict 3-step biological safety and feasibility audit on the following hypothesis:
"${hypothesis}"

Follow the 3 mandatory protocols:
1. Validate Creative Premise: Acknowledge the core objective and conceptual intent.
2. Biochemical & Biophysical Failure Analysis: Detail exact cellular lysis, membrane disruption, acoustic impedance collapse, or toxicity mechanisms.
3. Scientifically Viable Alternative: Architect a realistic, peer-reviewed nano-biomedical solution using photoacoustics, targeted AAV/LNPs, or dry micro-combs.

Include a summary table comparing the Dangerous Proposal vs. Engineered Kateriya-X Alternative.`;

      if (aiClient && process.env.GEMINI_API_KEY) {
        try {
          const response = await withTimeout(
            aiClient.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: [{ role: 'user', parts: [{ text: auditPrompt }] }],
              config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.3,
              },
            }),
            8000
          );
          return res.json({ audit: response.text, source: 'gemini' });
        } catch (e: any) {
          console.error('Gemini audit error:', e);
        }
      }

      const fallbackAudit = generateKateriyaSafetyAudit(hypothesis, language);
      return res.json({ audit: fallbackAudit, source: 'core-simulation' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Superhero Translation endpoint
  app.post('/api/superhero-translate', async (req: Request, res: Response) => {
    try {
      const { heroConcept, language = 'en' } = req.body;
      if (!heroConcept) {
        return res.status(400).json({ error: 'Concept is required' });
      }

      const translatePrompt = `Translate the following superhero/sci-fi lore concept into a strict, peer-reviewed medical and biophysical reality under the Kateriya-X Neural Resonance framework:
Concept: "${heroConcept}"

Structure your response:
1. **The Core Sci-Fi Lore & Clinical Equivalent**
2. **Biophysical Mechanism & Transduction Pathway** (Laser wavelength, acoustic freq, channelrhodopsin channel, ion flux)
3. **Hardware & Biomaterial Architecture** (Sensors, micro-combs, PMUT arrays, shielding)
4. **Comparative Specifications Table** (Comic Lore vs Real Neuro-Engineering Blueprint)`;

      if (aiClient && process.env.GEMINI_API_KEY) {
        try {
          const response = await withTimeout(
            aiClient.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: [{ role: 'user', parts: [{ text: translatePrompt }] }],
              config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.4,
              },
            }),
            8000
          );
          return res.json({ translation: response.text, source: 'gemini' });
        } catch (e: any) {
          console.error('Gemini superhero translation error:', e);
        }
      }

      const fallbackTranslation = generateSuperheroTranslation(heroConcept, language);
      return res.json({ translation: fallbackTranslation, source: 'core-simulation' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Kateriya-X Neural Telemetry Engine ---
  const telemetryControlState = {
    noiseLevel: 0.35,
    focusBias: 2.5,
    modulationTarget: 'motor_cortex', // 'motor_cortex' | 'amygdala' | 'balanced'
    stimulationActive: true,
    laserFluence: 16.8, // mJ/cm² (ANSI safe < 20 mJ/cm²)
    pulseFrequency: 25, // Hz
  };

  let telemetryStepCounter = 0;

  function createTelemetryPoint(step: number) {
    const t = step * 0.1;
    const noise = (Math.random() - 0.5) * telemetryControlState.noiseLevel * 20;

    const isFocus = telemetryControlState.focusBias >= 2.0;
    const betaWeight = telemetryControlState.focusBias * 8;
    const alphaWeight = Math.max(2, 16 - telemetryControlState.focusBias * 4);
    const thetaWeight = 4 + Math.sin(t * 0.5) * 2;
    const gammaWeight = isFocus ? 6 : 2;

    const ch1_fz = Number((
      Math.sin(t * 18) * betaWeight * 0.5 +
      Math.sin(t * 10) * alphaWeight * 0.2 +
      Math.sin(t * 4) * thetaWeight * 0.4 +
      noise
    ).toFixed(2));

    const ch2_cz = Number((
      Math.sin(t * 22) * betaWeight * 0.6 +
      Math.sin(t * 8) * alphaWeight * 0.4 +
      (telemetryControlState.modulationTarget === 'motor_cortex' ? Math.sin(t * 30) * 12 : 0) +
      noise
    ).toFixed(2));

    const ch3_pz = Number((
      Math.sin(t * 10) * alphaWeight * 0.7 +
      Math.sin(t * 15) * betaWeight * 0.3 +
      noise
    ).toFixed(2));

    const ch4_oz = Number((
      Math.sin(t * 11) * alphaWeight * 0.85 +
      Math.sin(t * 2) * 5 +
      noise
    ).toFixed(2));

    const photoacousticPressure = Number((
      (telemetryControlState.stimulationActive ? 1.4 + Math.sin(t * 5) * 0.6 + (telemetryControlState.laserFluence / 20) * 0.8 : 0.2) +
      (Math.random() * 0.1)
    ).toFixed(2));

    const rawFocus = 50 + (telemetryControlState.focusBias - 2.5) * 20 + Math.sin(t * 0.3) * 15 + (Math.random() - 0.5) * 5;
    const focusScore = Math.max(5, Math.min(98, Math.round(rawFocus)));
    const dominantState = focusScore > 65 ? 'Focused' : focusScore < 38 ? 'Fatigued' : 'Relaxed';

    const totalPower = betaWeight + alphaWeight + thetaWeight + gammaWeight + 5;
    const frequencyBands = {
      delta: Math.round((5 / totalPower) * 100),
      theta: Math.round((thetaWeight / totalPower) * 100),
      alpha: Math.round((alphaWeight / totalPower) * 100),
      beta: Math.round((betaWeight / totalPower) * 100),
      gamma: Math.round((gammaWeight / totalPower) * 100),
    };

    const motorActivation = telemetryControlState.modulationTarget === 'motor_cortex'
      ? Math.min(99, Math.round(65 + Math.sin(t * 0.8) * 25 + (telemetryControlState.laserFluence / 20) * 10))
      : Math.round(30 + Math.sin(t * 0.8) * 10);

    const amygdalaCalming = telemetryControlState.modulationTarget === 'amygdala'
      ? Math.min(99, Math.round(70 + Math.cos(t * 0.8) * 20 + (telemetryControlState.laserFluence / 20) * 10))
      : Math.round(25 + Math.cos(t * 0.8) * 10);

    const synapticPotentiation = Math.round(45 + (motorActivation + amygdalaCalming) * 0.3);

    return {
      id: step,
      timestamp: Number(t.toFixed(1)),
      isoTime: new Date().toISOString(),
      ch1_fz,
      ch2_cz,
      ch3_pz,
      ch4_oz,
      photoacousticPressure,
      focusScore,
      dominantState,
      frequencyBands,
      modulation: {
        target: telemetryControlState.modulationTarget,
        active: telemetryControlState.stimulationActive,
        motorActivation,
        amygdalaCalming,
        synapticPotentiation,
        laserFluence: telemetryControlState.laserFluence,
        pulseFrequency: telemetryControlState.pulseFrequency,
      },
      hardware: {
        contactImpedance: Number((5.8 + Math.sin(t * 0.1) * 0.9).toFixed(1)),
        snrDb: Number((28.4 + Math.cos(t * 0.2) * 2.1).toFixed(1)),
        folliclePenetrationMm: 1.85,
        opticalFluence: telemetryControlState.laserFluence,
      }
    };
  }

  const ringBuffer: any[] = [];
  for (let i = 0; i < 40; i++) {
    ringBuffer.push(createTelemetryPoint(i));
    telemetryStepCounter = 40;
  }

  // Live telemetry snapshot endpoint
  app.get('/api/telemetry/live', (_req: Request, res: Response) => {
    res.json({
      status: 'streaming',
      controlState: telemetryControlState,
      latest: ringBuffer[ringBuffer.length - 1],
      buffer: ringBuffer.slice(-30),
      timestamp: new Date().toISOString()
    });
  });

  // Telemetry stream control endpoint
  app.post('/api/telemetry/control', (req: Request, res: Response) => {
    const { noiseLevel, focusBias, modulationTarget, stimulationActive, laserFluence, pulseFrequency } = req.body;
    if (noiseLevel !== undefined) telemetryControlState.noiseLevel = Number(noiseLevel);
    if (focusBias !== undefined) telemetryControlState.focusBias = Number(focusBias);
    if (modulationTarget !== undefined) telemetryControlState.modulationTarget = String(modulationTarget);
    if (stimulationActive !== undefined) telemetryControlState.stimulationActive = Boolean(stimulationActive);
    if (laserFluence !== undefined) telemetryControlState.laserFluence = Number(laserFluence);
    if (pulseFrequency !== undefined) telemetryControlState.pulseFrequency = Number(pulseFrequency);

    res.json({ success: true, controlState: telemetryControlState });
  });

  // Server-Sent Events (SSE) live stream endpoint
  app.get('/api/telemetry/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if ((res as any).flushHeaders) {
      (res as any).flushHeaders();
    }

    const interval = setInterval(() => {
      telemetryStepCounter++;
      const packet = createTelemetryPoint(telemetryStepCounter);
      ringBuffer.push(packet);
      if (ringBuffer.length > 100) ringBuffer.shift();

      res.write(`data: ${JSON.stringify(packet)}\n\n`);
    }, 150);

    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  });

  // Vite middleware in dev or static files in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Project Kateriya-X] Neural Resonance Server running at http://0.0.0.0:${PORT}`);
  });
}

// Fallback generators for offline/no-key states maintaining high scientific precision
function generateKateriyaFallbackResponse(prompt: string, language: string, _focusArea: string): string {
  const p = prompt.toLowerCase();

  if (language === 'hi') {
    return `**प्रोजेक्ट कटेरिया-एक्स: तंत्रिका अनुनाद प्रणाली विश्लेषण**

प्रोफेसर सुनील कटेरिया (JNU/हेगेमन लैब) की चैनलरोडोप्सिन-1 व 2 (ChR1/ChR2) की युगांतरकारी खोज के आधार पर, यह प्रणाली गैर-आक्रामक फोटो-अकॉस्टिक ब्रेन-कंप्यूटर इंटरफ़ेस (BCI) प्रदान करती है।

### मुख्य तकनीकी विनिर्देश:
* **ऑप्टोजेनेटिक लक्ष्यीकरण:** AAV-PHP.eB वेक्टर द्वारा कोर्टिकल पिरामिडल न्यूरॉन्स में ChR2/Chrimson का सुरक्षित अभिव्यक्ति।
* **हेयर फॉलिकल बायोफिजिक्स:** 250 माइक्रोन माइक्रोपिलर कंघी सरणी, जो खोपड़ी के बालों के बीच स्लाइड करके प्रतिबाधा (Impedance) को 10 kΩ से कम रखती है।
* **फोटोअकॉस्टिक ट्रांसडक्शन:** 1064 nm NIR-II लेजर स्पंद और 10 MHz PMUT अल्ट्रासोनिक डिटेक्शन द्वारा खोपड़ी की हड्डी के आर-पार 0.3 mm की स्थानिक सटीकता।

| घटक | पारंपरिक विधि | कटेरिया-एक्स तंत्रिका अनुनाद |
| :--- | :--- | :--- |
| खोपड़ी भेदन | आक्रामक क्रेनियोटॉमी (इम्प्लांट्स) | गैर-आक्रामक पीएसीटी (1064 nm स्पंद) |
| संपर्क प्रतिबाधा | 200 kΩ (सूखा इलेक्ट्रोड) | < 10 kΩ (माइक्रो-कॉम्ब संरचना) |
| स्थानिक विभेदन | ~15-20 mm (ईईजी) | < 300 µm (फोटो-अकॉस्टिक अल्ट्रासाउंड) |`;
  }

  if (language === 'or') {
    return `**ପ୍ରୋଜେକ୍ଟ କଟେରିୟା-ଏକ୍ସ: ନ୍ୟୁରାଲ ରେଜୋନାନ୍ସ ସିଷ୍ଟମ୍ ବିଶ୍ଳେଷଣ**

ପ୍ରଫେସର ସୁନୀଲ କଟେରିୟା (JNU/Hegemann Lab) ଙ୍କ ଦ୍ୱାରା ଚ୍ୟାନେଲରୋଡପ୍ସିନ୍ (ChR1/ChR2) ର ଐତିହାସିକ ଆବିଷ୍କାର ଉପରେ ଆଧାରିତ ଏହି ଅଣ-ଆକ୍ରମଣାତ୍ମକ ଅପ୍ଟୋ-ଏକୋଷ୍ଟିକ୍ ବ୍ରେନ୍-କମ୍ପ୍ୟୁଟର ଇଣ୍ଟରଫେସ୍ (BCI)।

### ପ୍ରମୁଖ ବୈଷୟିକ ବିବରଣୀ:
* **ଅପ୍ଟୋଜେନେଟିକ୍ସ:** AAV-PHP.eB ଭେକ୍ଟର ମାଧ୍ୟମରେ ସୁରକ୍ଷିତ ନ୍ୟୁରୋନାଲ ପ୍ରକାଶନ।
* **କେଶ ମୂଳ ବାୟୋଫିଜିକ୍ସ:** ୨୫୦ ମାଇକ୍ରୋନ୍ ମାଇକ୍ରୋ-କୋମ୍ବ୍ ସେନ୍ସର ଯାହା ଚର୍ମ ସମ୍ପର୍କ ପ୍ରତିରୋଧ (< ୧୦ kΩ) ସୁନିଶ୍ଚିତ କରେ।
* **ଫଟୋଆକୋଷ୍ଟିକ୍ ପ୍ରକ୍ରିୟା:** ୧୦୬୪ nm NIR-II ଲେଜର ଏବଂ ୧୦ MHz PMUT ଡିଟେକ୍ସନ ଦ୍ୱାରା ଖପୁରି ମଧ୍ୟଦେଇ ଗଭୀର ମସ୍ତିଷ୍କ ମାନଚିତ୍ରଣ।

| ଉପାଦାନ | ପାରମ୍ପରିକ ପଦ୍ଧତି | କଟେରିୟା-ଏକ୍ସ ପ୍ରଣାଳୀ |
| :--- | :--- | :--- |
| କପାଳ ପ୍ରବେଶ | ସର୍ଜିକାଲ ଇମ୍ପ୍ଲାଣ୍ଟ | ଅଣ-ଆକ୍ରମଣାତ୍ମକ ଫଟୋଆକୋଷ୍ଟିକ୍ (PACT) |
| ଚର୍ମ ପ୍ରତିରୋଧ | ୨୦୦ kΩ (ଶୁଷ୍କ ଇଲେକ୍ଟ୍ରୋଡ) | < ୧୦ kΩ (ମାଇକ୍ରୋ-କୋମ୍ବ୍ ଗଠନ) |
| ରେଜୋଲ୍ୟୁସନ | ~୧୫-୨୦ mm (EEG) | < ୩୦୦ µm (ଅପ୍ଟୋ-ଏକୋଷ୍ଟିକ୍ ଇକୋ) |`;
  }

  if (p.includes('cerebro') || p.includes('magneto') || p.includes('superhero')) {
    return generateSuperheroTranslation(prompt, 'en');
  }

  if (p.includes('ethanol') || p.includes('alcohol') || p.includes('inject') || p.includes('safety')) {
    return generateKateriyaSafetyAudit(prompt, 'en');
  }

  return `**The Kateriya-X Neural Resonance System: Non-Invasive Opto-Acoustic BCI Architecture**

Honoring the legacy of **Prof. Suneel Kateriya** (co-discoverer of Channelrhodopsin-1 & 2 at JNU / Hegemann Lab, paving the way for the 2026 Nobel Prize in Physiology or Medicine), the Kateriya-X core bridges five foundational disciplines to achieve deep-brain engram modulation without surgical craniotomy.

### 1. Optogenetic Channel Dynamics & Expression
- **Transduction Target:** Channelrhodopsin variants (*ChR1*, *ChR2-H134R*, red-shifted *Chrimson* $\\lambda=590-660\\text{ nm}$, and ultra-fast *Chronos*).
- **Delivery Vector:** Intravenous retrograde neurotropic AAV capsids (AAV-PHP.eB) or ApoE-conjugated biomimetic lipid nanoparticles crossing the blood-brain barrier intact.
- **Biochemical Safety:** Total exclusion of cytotoxic organic solvents; target expression under synapsin-1 (Syn1) or CaMKII$\\alpha$ promoters prevents non-neuronal off-target expression.

### 2. Hair Follicle Biophysics & Dry Micro-Comb Array
- **Scalp Anatomy Constraints:** Human scalp presents ~200–300 hairs/cm² with an average inter-follicular distance of 350–500 µm (Anagen phase).
- **Comb Micro-Geometry:** 250 µm diameter micro-pillars with conductive poly(3,4-ethylenedioxythiophene) (PEDOT:PSS) gold-core coating.
- **Acoustic & Electrical Coupling:** Micro-pillars naturally part hair shafts via elastic cantilever deflection, achieving skin-electrode contact impedance of $<8.4\\text{ k}\\Omega$ without conductive pastes.

### 3. Photoacoustic Transcranial Computed Tomography (PACT)
- **Excitation:** Pulsed Near-Infrared II (NIR-II, 1064 nm & 1280 nm) laser bursts (5–8 ns pulse width, energy density $<20\\text{ mJ/cm}^2$, ANSI Z136 safe limits).
- **Thermoelastic Expansion:** Optical absorption in targeted rhodopsin clusters generates instantaneous localized thermoelastic stress ($p_0 = \\Gamma \\mu_a F$).
- **Acoustic Detection:** 1024-channel Piezoelectric Micromachined Ultrasonic Transducer (PMUT) array operating at 8–12 MHz resolves acoustic echoes through parietal bone with $<280\\,\\mu\\text{m}$ axial resolution.

### 4. Engram Network & Neuroplasticity Matrix
- **Neurochemical Readout:** Real-time decoding of Glutamate (AMPA/NMDA) influx versus GABAergic hyperpolarization.
- **Engram Potentiation:** Frequency-tuned opto-acoustic resonance induces Long-Term Potentiation (LTP) in hippocampal CA1-CA3 networks without thermal lesioning.

| Parameter | Standard Invasive ECoG | Conventional Scalp EEG | Kateriya-X Opto-Acoustic Core |
| :--- | :--- | :--- | :--- |
| **Invasiveness** | High (Craniotomy required) | None (Wet/dry scalp surface) | Non-Invasive (Transcranial PACT) |
| **Spatial Resolution** | 1.0–2.0 mm | 15–30 mm (High skull blurring) | **280 µm** (Acoustic diffraction-limited) |
| **Depth Penetration** | Cortical surface only | Surface-weighted | **Up to 7.2 cm** (Whole basal ganglia/hippocampus) |
| **Channel Selectivity** | Electrical field sum | Gross macro-dipoles | **Genetically targeted (ChR2/Chrimson)** |
| **Scalp Contact Imp.** | N/A (Subdural) | 50–250 kΩ (Dry hair noise) | **< 10 kΩ** (Anagen-spaced micro-comb) |`;
}

function generateKateriyaSafetyAudit(hypothesis: string, _language: string): string {
  return `**PROJECT KATERIYA-X: BIOLOGICAL SAFETY & FEASIBILITY AUDIT**

### 1. Creative Premise & Sci-Fi Objective Validation
* **User Hypothesis:** "${hypothesis}"
* **Scientific Intent:** The conceptual premise aims to overcome biological barriers (such as the Blood-Brain Barrier or skull impedance) to achieve rapid, wide-scale optogenetic channel distribution or neural stimulation.

### 2. Biochemical & Biophysical Failure Analysis
* **Cytotoxic Mechanism:** Direct infusion of harsh chemicals, unshielded solvents (e.g., ethanol/spirit solutions), or raw unpurified algal extracts triggers rapid **cell membrane lysis**, severe **endothelial protein denaturation**, and catastrophic **hemolysis** within cerebral capillaries.
* **Acoustic & Optical Decoupling:** Organic solvents alter the local sound velocity ($c \\approx 1540\\text{ m/s}$ in brain tissue), creating massive acoustic impedance mismatch ($\\Delta Z$) and optical attenuation, completely scrambling photoacoustic signal reconstruction.
* **Immune Cascade:** Unshielded algal protein delivery without viral capsid packaging or lipid shielding triggers acute neuroinflammation and severe cytokine storm.

### 3. Scientifically Viable Alternative: The Kateriya-X Solution
Instead of unshielded chemical delivery, the Kateriya-X framework deploys:
1. **Engineered AAV Capsid (AAV-PHP.eB) or ApoE-LNPs:** Non-toxic, receptor-mediated transcytosis across the Blood-Brain Barrier via low-density lipoprotein receptor (LDLR) binding.
2. **Transcranial NIR-II Pulsed Laser:** Operates at 1064 nm within the biological optical window where tissue water absorption is minimal, paired with biocompatible photoacoustic contrast agents.
3. **Dry Micro-Comb Transducers:** Bypass epidermal hair follicles via mechanical cantilever compliance, eliminating chemical scalp abrasion or conductive gel residue.

| Evaluation Metric | Dangerous Hypothesis | Kateriya-X Engineered Protocol |
| :--- | :--- | :--- |
| **Cellular Viability** | $< 5\\%$ (Severe necrosis & lysis) | **$> 99.4\\%$** (Biocompatible physiological buffer) |
| **BBB Permeability** | Disruptive vascular destruction | **Receptor-mediated endocytosis (LDLR-targeted)** |
| **Acoustic Homogeneity** | Severe refraction artifact | **Matched soft-tissue impedance ($1.54\\times 10^6\\text{ Rayl}$)** |
| **Regulatory Feasibility** | Absolute Clinical Rejection | **ANSI Z136 & FDA Phase-I Safe Profile** |`;
}

function generateSuperheroTranslation(concept: string, _language: string): string {
  const c = concept.toLowerCase();
  let heroName = "Cerebro Brain-Reading Helmet";
  let comicLore = "Professor X using Cerebro to pinpoint every human/mutant consciousness across the globe.";
  let medicalReality = "Whole-cortex Transcranial Photoacoustic Computed Tomography (PACT) reading genetically targeted ChR2 retrograde engrams via multi-frequency PMUT acoustic arrays.";

  if (c.includes('magneto')) {
    heroName = "Magneto's Telepathic Shield Helmet";
    comicLore = "A helmet that blocks telepathic brain infiltration and psionic mind control.";
    medicalReality = "High-permeability Mu-metal & copper-mesh Faraday lattice attenuating Transcranial Magnetic Stimulation (TMS), pulsed RF gradients, and external microwave-induced auditory (Frey) effects.";
  } else if (c.includes('scarecrow') || c.includes('fear')) {
    heroName = "Scarecrow Fear Toxin & Counter-Measure";
    comicLore = "A hallucinogenic gas that hyper-activates primal fear and panic pathways.";
    medicalReality = "Optogenetic ArchT/NpHR3.0 hyperpolarization of the Basolateral Amygdala (BLA) paired with targeted infralimbic prefrontal cortex (IL-PFC) fear extinction engram activation.";
  } else if (c.includes('daredevil') || c.includes('radar')) {
    heroName = "Daredevil Sensory Echolocation";
    comicLore = "Blindness compensated by super-human 360-degree acoustic radar vision.";
    medicalReality = "Cross-modal neuroplastic remapping of primary visual cortex (V1) receiving tonotopic cochlear inputs translated into spatial-frequency engrams via photoacoustic biofeedback.";
  }

  return `**SUPERHERO GADGETRY TRANSLATION: ${heroName.toUpperCase()}**

### 1. Sci-Fi Lore vs. Clinical Peer-Reviewed Reality
* **Comic Book Premise:** ${comicLore}
* **Rigorous Medical Equivalent:** ${medicalReality}

### 2. Biophysical Transduction Pathway
* **Excitation Band:** Near-Infrared II (NIR-II) optical pulses (1064 nm) operating below maximal permissible exposure (MPE $\\le 20\\text{ mJ/cm}^2$).
* **Acoustic Conversion:** Thermoelastic stress waves ($5-15\\text{ MHz}$) propagate back through the skull bone with $<1.8\\text{ dB/cm/MHz}$ attenuation.
* **Cellular Transduction:** Retrograde ChR2 expression in pyramidal neurons coupled with calcium-dependent acoustic reporter genes (ARGs).

### 3. Hardware Architecture & Material Specifications
* **Chassis:** Carbon-fiber outer shell lined with an inner Mu-metal (77% Ni, 16% Fe, 5% Cu) electromagnetic shielding layer.
* **Sensor Mesh:** 250 µm dry micro-comb array gliding through follicular shafts to achieve direct scalp acoustic coupling without hair clipping.
* **Receiver Matrix:** 1024-element Capacitive/Piezoelectric Micromachined Ultrasonic Transducer (CMUT/PMUT) integrated with on-chip low-noise transimpedance amplifiers.

| Engineering Parameter | Sci-Fi Myth | Kateriya-X Peer-Reviewed Reality |
| :--- | :--- | :--- |
| **Signal Modality** | "Psionic Wave Telepathy" | **Opto-Acoustic Thermoelastic Resonance (PACT)** |
| **Skull Penetration** | Pure magic / telekinesis | **NIR-II Optical Window + 8 MHz Ultrasonic Echo** |
| **Follicle Interference** | Ignored | **Anagen-Phase Pitch-Matched Dry Micro-Comb Array** |
| **Cellular Specificity** | All minds universally | **Synapsin-1 Promoter Driven ChR2/Chrimson Channels** |`;
}

startServer().catch((err) => {
  console.error('Fatal error starting Kateriya-X server:', err);
  process.exit(1);
});

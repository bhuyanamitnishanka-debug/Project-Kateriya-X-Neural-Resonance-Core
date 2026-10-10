import { ChannelrhodopsinVariant, SuperheroConcept } from '../types';

export const CHANNELRHODOPSIN_VARIANTS: ChannelrhodopsinVariant[] = [
  {
    name: 'Channelrhodopsin-1 (ChR1)',
    organism: 'Chlamydomonas reinhardtii',
    discoveryYear: 2002,
    activationWavelength: 500,
    peakAbsorptionColor: '#0ea5e9',
    decayKinetics: 'τ_off ≈ 80 ms',
    ionConductance: 'Proton-selective (H+), weak Na+',
    biomedicalUse: 'Foundational algal channel co-discovered by Prof. Suneel Kateriya, Georg Nagel, and Peter Hegemann. Established light-gated conductance.',
    photoSensitivity: 'High (0.1 mW/mm²)'
  },
  {
    name: 'Channelrhodopsin-2 (ChR2 wt)',
    organism: 'Chlamydomonas reinhardtii',
    discoveryYear: 2003,
    activationWavelength: 470,
    peakAbsorptionColor: '#3b82f6',
    decayKinetics: 'τ_off ≈ 12 ms',
    ionConductance: 'Non-selective cation (Na+, K+, H+, Ca2+)',
    biomedicalUse: 'Universal workhorse of optogenetics. Triggers action potentials upon blue light stimulation.',
    photoSensitivity: 'Moderate (1.0 mW/mm²)'
  },
  {
    name: 'ChR2-H134R',
    organism: 'Engineered Mutant (C. reinhardtii)',
    discoveryYear: 2005,
    activationWavelength: 470,
    peakAbsorptionColor: '#2563eb',
    decayKinetics: 'τ_off ≈ 18 ms',
    ionConductance: 'Enhanced Na+/Ca2+ influx',
    biomedicalUse: 'Higher stationary photocurrents (~2x wild-type). Standard for in vivo circuit interrogation.',
    photoSensitivity: 'High (0.5 mW/mm²)'
  },
  {
    name: 'Chrimson',
    organism: 'Chlamydomonas noctigama',
    discoveryYear: 2014,
    activationWavelength: 590,
    peakAbsorptionColor: '#ef4444',
    decayKinetics: 'τ_off ≈ 22 ms',
    ionConductance: 'Non-selective cation (Ca2+, Na+)',
    biomedicalUse: 'Red-shifted activation (590-660 nm) enables deeper photon penetration through bone and biological tissue.',
    photoSensitivity: 'High (0.3 mW/mm²)'
  },
  {
    name: 'Chronos',
    organism: 'Stigeoclonium helveticum',
    discoveryYear: 2014,
    activationWavelength: 500,
    peakAbsorptionColor: '#06b6d4',
    decayKinetics: 'τ_off ≈ 3.6 ms',
    ionConductance: 'High cation flux',
    biomedicalUse: 'Ultra-fast sub-millisecond deactivation kinetics. Can drive neural spiking at >100 Hz.',
    photoSensitivity: 'Extremely High (0.05 mW/mm²)'
  },
  {
    name: 'CatCh (Ca2+ Translocating)',
    organism: 'Engineered Mutant (L132C)',
    discoveryYear: 2011,
    activationWavelength: 474,
    peakAbsorptionColor: '#6366f1',
    decayKinetics: 'τ_off ≈ 15 ms',
    ionConductance: '70-fold increased Ca2+ permeability',
    biomedicalUse: 'Induces fast action potentials with 70-fold lower light intensity; triggers secondary Ca2+ second messengers.',
    photoSensitivity: 'Ultra-sensitive'
  },
  {
    name: 'ReaChR',
    organism: 'Red-activatable chimeric opsin',
    discoveryYear: 2013,
    activationWavelength: 610,
    peakAbsorptionColor: '#dc2626',
    decayKinetics: 'τ_off ≈ 110 ms',
    ionConductance: 'Broad cation permeability',
    biomedicalUse: 'Permits non-invasive transcranial optical activation in intact mammalian skull models.',
    photoSensitivity: 'High (0.2 mW/mm²)'
  }
];

export const SUPERHERO_TRANSLATIONS: SuperheroConcept[] = [
  {
    id: 'cerebro',
    name: "Professor X's Cerebro Helmet",
    character: 'Charles Xavier (X-Men)',
    sourceLore: 'A hemispherical helmet amplifying telepathic powers to locate, read, and communicate with millions of minds simultaneously.',
    medicalReality: 'Transcranial Photoacoustic Computed Tomography (PACT) array with 1024 PMUT elements. Reads retrograde-targeted Channelrhodopsin engram activity via thermoelastic acoustic resonance at 8–12 MHz through intact skull.',
    transductionBand: 'Pulsed NIR-II (1064 nm & 1280 nm) + 10 MHz PMUT ultrasound echo',
    acousticEcho: 'Δt = 32 µs transit time, axial resolution = 240 µm',
    channelTarget: 'Retrograde AAV-PHP.eB driving ChR2-H134R under Synapsin-1 promoter',
    materialStack: 'Dry micro-comb PEDOT:PSS sensor layer, Mu-metal EMI attenuation, beryllium-copper RF shield'
  },
  {
    id: 'magneto',
    name: "Magneto's Telepathic Shield Helmet",
    character: 'Erik Lehnsherr (Magneto)',
    sourceLore: 'A custom helmet completely impervious to psychic intrusion, psionic commands, and telepathic memory probes.',
    medicalReality: 'High-permeability Mu-metal (80% Ni, 15% Fe, 5% Mo) & silver-nanowire Faraday cage. Provides >85 dB attenuation against Transcranial Magnetic Stimulation (TMS), focused electromagnetic pulses, and RF carrier fields.',
    transductionBand: 'Static & low-frequency magnetic attenuation (0.1 Hz - 100 kHz) + RF microwave shielding',
    acousticEcho: 'Acoustic impedance decoupling layer preventing external ultrasonic shear wave coupling',
    channelTarget: 'Stabilizes endogenous GABAergic tonic inhibition, preventing opto-acoustic evoked discharges',
    materialStack: 'Multi-layer Mu-metal laminates (1.2 mm), copper-mesh ground grid, dielectric acoustic barrier'
  },
  {
    id: 'scarecrow',
    name: "Scarecrow Fear Toxin & Extinction Antidote",
    character: 'Dr. Jonathan Crane (Scarecrow)',
    sourceLore: 'An aerosolized synthetic gas that induces overwhelming hallucinations of primal terror and paralyzing dread.',
    medicalReality: 'Optogenetic ArchT / eNpHR3.0 hyperpolarization of the Basolateral Amygdala (BLA) coupled with photoacoustic stimulation of Infralimbic Prefrontal Cortex (IL-PFC) fear extinction pathways.',
    transductionBand: '590 nm yellow/amber inhibition band + 1064 nm photoacoustic excitation',
    acousticEcho: 'Real-time acoustic telemetry of local cerebral blood flow (CBF) in central amygdaloid nucleus',
    channelTarget: 'Co-expressed eNpHR3.0 (silencing) and ChR2-H134R (fear extinction engrams)',
    materialStack: 'Targeted intranasal biomimetic lipid nanoparticles delivering mRNA constructs'
  },
  {
    id: 'daredevil',
    name: "Daredevil Sensory Echolocation Matrix",
    character: 'Matt Murdock (Daredevil)',
    sourceLore: 'Total visual blindness converted into a heightened 360-degree radar/echolocation sense mapping the physical environment in real time.',
    medicalReality: 'Cross-modal neuroplastic remapping of primary visual cortex (V1) to receive high-frequency tonotopic auditory representations. Photoacoustic biofeedback pulses stimulate retinotopic V1 coordinates.',
    transductionBand: 'High-frequency acoustic echo array (20-100 kHz) mapped to 1064 nm opto-acoustic pulses in V1',
    acousticEcho: 'Spatial time-of-flight acoustic triangulation rendered as cortical engram phasic potentials',
    channelTarget: 'Chrimson expression in layer 4 cortical interneurons of the calcarine sulcus',
    materialStack: 'Temporal bone acoustic waveguides, conformal occipital micro-comb transceiver'
  }
];

export const BIOLOGICAL_SAFETY_TEST_CASES = [
  {
    name: 'Ethanol / Spirit Solvent for BBB Penetration',
    hypothesis: 'Can we dissolve Channelrhodopsin viral vectors in 70% ethanol or spirit solution to temporarily dissolve the Blood-Brain Barrier for instant intravenous delivery?',
    dangerLevel: 'CRITICAL HAZARD',
  },
  {
    name: 'Direct Intravenous Raw Algal Culture Injection',
    hypothesis: 'Injecting live Chlamydomonas reinhardtii green algal cells directly into the femoral vein so the body absorbs ChR1 and ChR2 naturally.',
    dangerLevel: 'FATAL BIOHAZARD',
  },
  {
    name: 'High-Energy Continuous Wave Laser Scalp Illumination',
    hypothesis: 'Directing a 50W continuous blue laser (473 nm) through the scalp and skull bone to activate deep hippocampal neurons directly.',
    dangerLevel: 'SEVERE THERMAL HAZARD',
  },
  {
    name: 'Unregulated Mega-Tesla Electromagnetic Pulse',
    hypothesis: 'Applying an ultra-high 200 Tesla pulsed magnetic field across the cranium to instantaneously rewrite all memory engrams.',
    dangerLevel: 'ELECTRODYNAMIC DAMAGE',
  }
];

export const MULTILINGUAL_UI = {
  en: {
    systemTitle: 'PROJECT KATERIYA-X',
    systemSubtitle: 'NEURAL RESONANCE CORE · NON-INVASIVE OPTO-ACOUSTIC BCI',
    memorialBadge: 'In honor of Prof. Suneel Kateriya (JNU/Hegemann Lab) · Co-discoverer of ChR1 & ChR2',
    navAssistant: 'Research Assistant',
    navDashboard: 'Telemetry Dashboard',
    navSimulator: 'Opto-Acoustic PACT Sim',
    navFollicle: 'Hair Follicle & Micro-Comb',
    navEngram: 'Engram & Synaptic Map',
    navSafety: 'Biological Safety Auditor',
    navPredictor: '1D-CNN Focus Predictor',
    navLogger: 'Hardware Telemetry Logger',
    navSuperhero: 'Superhero Lore Translator',
    navSchematic: 'Graphic Workflow & DSP',
    navArchive: 'Prof. Kateriya Archive',
    statusOperational: 'Opto-Acoustic Core Operational',
    askPromptPlaceholder: 'Ask Project Kateriya-X about optogenetics, follicle biophysics, photoacoustics, or engrams...',
    send: 'Query Core',
    analyzing: 'Processing Transcranial Computation...',
  },
  hi: {
    systemTitle: 'प्रोजेक्ट कटेरिया-एक्स',
    systemSubtitle: 'तंत्रिका अनुनाद कोर · गैर-आक्रामक ऑप्टो-अकॉस्टिक बीसीआई',
    memorialBadge: 'प्रो. सुनील कटेरिया (JNU/हेगेमन लैब) के सम्मान में · ChR1 व ChR2 के सह-खोजकर्ता',
    navAssistant: 'अनुसंधान सहायक (AI)',
    navDashboard: 'टेलीमेट्री डैशबोर्ड',
    navSimulator: 'फोटो-अकॉस्टिक सिमुलेटर',
    navFollicle: 'हेयर फॉलिकल व माइक्रो-कॉम्ब',
    navEngram: 'एंग्राम व सिनैप्टिक मानचित्र',
    navSafety: 'जैविक सुरक्षा लेखा परीक्षक',
    navPredictor: '1D-CNN फ़ोकस प्रेडिक्टर',
    navLogger: 'हार्डवेयर टेलीमेट्री लॉगर',
    navSuperhero: 'सुपरहीरो तकनीक अनुवादक',
    navSchematic: 'ग्राफिक वर्कफ़्लो व डीएसपी',
    navArchive: 'प्रो. कटेरिया अभिलेखागार',
    statusOperational: 'तंत्रिका अनुनाद कोर सक्रिय',
    askPromptPlaceholder: 'ऑप्टोजेनेटिक्स, हेयर फॉलिकल बायोफिजिक्स या फोटो-अकॉस्टिक तकनीक के बारे में पूछें...',
    send: 'पूछें',
    analyzing: 'गणना की जा रही है...',
  },
  or: {
    systemTitle: 'ପ୍ରୋଜେକ୍ଟ କଟେରିୟା-ଏକ୍ସ',
    systemSubtitle: 'ନ୍ୟୁରାଲ ରେଜୋନାନ୍ସ କୋର · ଅଣ-ଆକ୍ରମଣାତ୍ମକ ଅପ୍ଟୋ-ଏକୋଷ୍ଟିକ୍ BCI',
    memorialBadge: 'ପ୍ରଫେସର ସୁନୀଲ କଟେରିୟାଙ୍କ ସମ୍ମାନାର୍ଥେ · ChR1 ଓ ChR2 ର ସହ-ଆବିଷ୍କାରକ',
    navAssistant: 'ଅନୁସନ୍ଧାନ ସହାୟକ (AI)',
    navDashboard: 'ଟେଲିମେଟ୍ରି ଡ୍ୟାସବୋର୍ଡ',
    navSimulator: 'ଫଟୋ-ଏକୋଷ୍ଟିକ୍ ସିମୁଲେଟର',
    navFollicle: 'କେଶ ମୂଳ ଓ ମାଇକ୍ରୋ-କୋମ୍ବ୍',
    navEngram: 'ଏନଗ୍ରାମ ଓ ସିନାପ୍ଟିକ୍ ମ୍ୟାପ୍',
    navSafety: 'ଜୈବିକ ସୁରକ୍ଷା ଅଡିଟ୍',
    navPredictor: '1D-CNN ଫୋକସ୍ ପ୍ରେଡିକ୍ଟର୍',
    navLogger: 'ହାର୍ଡୱେର୍ ଟେଲିମେଟ୍ରି ଲଗର୍',
    navSuperhero: 'ସୁପରହିରୋ ପ୍ରଯୁକ୍ତି ଅନୁବାଦ',
    navSchematic: 'ଗ୍ରାଫିକ ୱାର୍କଫ୍ଲୋ ଓ DSP',
    navArchive: 'ପ୍ରଫେସର କଟେରିୟା ଅଭିଲେଖାଗାର',
    statusOperational: 'ନ୍ୟୁରାଲ ରେଜୋନାନ୍ସ କୋର ସକ୍ରିୟ',
    askPromptPlaceholder: 'ଅପ୍ଟୋଜେନେଟିକ୍ସ, କେଶ ମୂଳ ବାୟୋଫିଜିକ୍ସ କିମ୍ବା ଫଟୋ-ଏକୋଷ୍ଟିକ୍ସ ବିଷୟରେ ପଚାରନ୍ତୁ...',
    send: 'ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ',
    analyzing: 'ଗଣନା ଚାଲିଛି...',
  }
};

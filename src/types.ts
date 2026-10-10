export type SupportedLanguage = 'en' | 'hi' | 'or';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'gemini' | 'core-simulation';
  language?: SupportedLanguage;
}

export interface ChannelrhodopsinVariant {
  name: string;
  organism: string;
  discoveryYear: number;
  activationWavelength: number; // nm
  peakAbsorptionColor: string;
  decayKinetics: string; // e.g., "10 ms"
  ionConductance: string; // e.g., "H+, Na+, K+, Ca2+"
  biomedicalUse: string;
  photoSensitivity: string;
}

export interface EngramNode {
  id: string;
  name: string;
  region: string;
  description: string;
  neurotransmitters: string[];
  connectivity: string[];
  x: number;
  y: number;
  activationLevel: number; // 0 to 1
  optogeneticTarget: string;
}

export interface SafetyAuditResult {
  hypothesis: string;
  premiseValidation: string;
  biochemicalFailure: string;
  engineeredAlternative: string;
  comparisonMetrics: {
    metric: string;
    dangerousApproach: string;
    kateriyaProtocol: string;
  }[];
}

export interface SuperheroConcept {
  id: string;
  name: string;
  character: string;
  sourceLore: string;
  medicalReality: string;
  transductionBand: string;
  acousticEcho: string;
  channelTarget: string;
  materialStack: string;
}

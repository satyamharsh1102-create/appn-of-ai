export type NavSection =
  | 'dashboard'
  | 'recognition'
  | 'tts'
  | 'library'
  | 'about';

export type GestureCategory =
  | 'Greeting'
  | 'Politeness'
  | 'Response'
  | 'Expression'
  | 'Assistance'
  | 'Everyday'
  | 'Actions';

export interface SignGesture {
  id: string;
  word: string;
  category: GestureCategory;
  shortCue: string;
  description: string;
  detectionRule: string;
  imageUrl: string;
}

export interface RecognitionRecord {
  id: string;
  word: string;
  confidence: number;
  timestamp: string;
}

export interface TtsSettings {
  voiceURI: string;
  rate: number;
  pitch: number;
  autoSpeak: boolean;
}

export interface ClassificationResult {
  gestureId: string;
  word: string;
  confidence: number;
  summary: string;
}

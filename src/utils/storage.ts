import { RecognitionRecord, TtsSettings } from '../types';

const KEYS = {
  transcript: 'signbridge_transcript_v1',
  history: 'signbridge_history_v1',
  tts: 'signbridge_tts_v1',
} as const;

export const DEFAULT_TTS_SETTINGS: TtsSettings = {
  voiceURI: '',
  rate: 1,
  pitch: 1,
  autoSpeak: false,
};

export function loadTranscript(): string {
  try {
    return localStorage.getItem(KEYS.transcript) ?? '';
  } catch {
    return '';
  }
}

export function saveTranscript(value: string): void {
  try {
    localStorage.setItem(KEYS.transcript, value);
  } catch {
    // Ignore storage quota or private mode restrictions
  }
}

export function loadHistory(): RecognitionRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.history);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(records: RecognitionRecord[]): void {
  try {
    localStorage.setItem(KEYS.history, JSON.stringify(records.slice(0, 30)));
  } catch {
    // Ignore storage quota or private mode restrictions
  }
}

export function loadTtsSettings(): TtsSettings {
  try {
    const raw = localStorage.getItem(KEYS.tts);
    if (!raw) return DEFAULT_TTS_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<TtsSettings>;
    return {
      voiceURI: typeof parsed.voiceURI === 'string' ? parsed.voiceURI : '',
      rate: typeof parsed.rate === 'number' ? parsed.rate : 1,
      pitch: typeof parsed.pitch === 'number' ? parsed.pitch : 1,
      autoSpeak: Boolean(parsed.autoSpeak),
    };
  } catch {
    return DEFAULT_TTS_SETTINGS;
  }
}

export function saveTtsSettings(settings: TtsSettings): void {
  try {
    localStorage.setItem(KEYS.tts, JSON.stringify(settings));
  } catch {
    // Ignore storage quota or private mode restrictions
  }
}

import { TtsSettings } from '../types';

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeaking(): void {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.cancel();
}

export function speakText(
  text: string,
  settings: TtsSettings,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (message: string) => void;
  }
): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  if (!isSpeechSynthesisSupported()) {
    callbacks?.onError?.(
      'Web Speech API is not supported in this browser. Try Chrome, Edge, or Safari.'
    );
    return false;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(trimmed);
  utterance.rate = settings.rate;
  utterance.pitch = settings.pitch;

  if (settings.voiceURI) {
    const voices = window.speechSynthesis.getVoices();
    const matched = voices.find((voice) => voice.voiceURI === settings.voiceURI);
    if (matched) {
      utterance.voice = matched;
    }
  }

  utterance.onstart = () => callbacks?.onStart?.();
  utterance.onend = () => callbacks?.onEnd?.();
  utterance.onerror = () => {
    callbacks?.onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
  return true;
}

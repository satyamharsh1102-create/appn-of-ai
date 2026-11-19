import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Square,
  Trash2,
  Volume2,
} from 'lucide-react';
import { SUPPORTED_GESTURES } from '../data/gestures';
import { TtsSettings } from '../types';
import {
  isSpeechSynthesisSupported,
  speakText,
  stopSpeaking,
} from '../utils/speech';

interface TextToSpeechViewProps {
  transcript: string;
  onChangeTranscript: (value: string) => void;
  onClearTranscript: () => void;
  ttsSettings: TtsSettings;
  onUpdateTtsSettings: (next: TtsSettings) => void;
}

export function TextToSpeechView({
  transcript,
  onChangeTranscript,
  onClearTranscript,
  ttsSettings,
  onUpdateTtsSettings,
}: TextToSpeechViewProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const supported = isSpeechSynthesisSupported();

  useEffect(() => {
    if (!supported) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      const sorted = [...available].sort((a, b) => {
        const aEn = a.lang.toLowerCase().startsWith('en') ? 0 : 1;
        const bEn = b.lang.toLowerCase().startsWith('en') ? 0 : 1;
        if (aEn !== bEn) return aEn - bEn;
        return a.name.localeCompare(b.name);
      });
      setVoices(sorted);
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      stopSpeaking();
    };
  }, [supported]);

  const handleSpeak = () => {
    setSpeechError(null);
    if (!transcript.trim()) return;

    speakText(transcript, ttsSettings, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: (msg) => {
        setIsSpeaking(false);
        setSpeechError(msg);
      },
    });
  };

  const handleStop = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  const handleAppendPhrase = (phrase: string) => {
    const trimmed = transcript.trim();
    const next = trimmed ? `${trimmed} ${phrase}` : phrase;
    onChangeTranscript(next);
  };

  const handleCopy = async () => {
    if (!transcript.trim()) return;
    try {
      await navigator.clipboard.writeText(transcript.trim());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setSpeechError('Could not copy text to clipboard in this browser.');
    }
  };

  const wordCount = transcript.trim()
    ? transcript.trim().split(/\s+/).length
    : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Text-to-Speech Output
        </h1>
        <p className="text-sm text-slate-600">
          Words translated from Sign Recognition appear below automatically. Edit
          the text or click Speak to hear it aloud using the Web Speech API.
        </p>
      </div>

      {!supported && (
        <div
          role="alert"
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-sm text-amber-900"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Speech synthesis unavailable</p>
            <p className="text-amber-800 mt-0.5">
              Your current browser does not expose the Web Speech API. Try
              opening SignBridge in Google Chrome, Microsoft Edge, or Safari.
            </p>
          </div>
        </div>
      )}

      {speechError && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-sm text-red-900"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p>{speechError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main transcript editor & controls */}
        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="tts-transcript-box"
              className="text-sm font-semibold text-slate-900"
            >
              Recognized Text
            </label>
            <span className="text-xs text-slate-500 tabular-nums">
              {wordCount} {wordCount === 1 ? 'word' : 'words'} ·{' '}
              {transcript.length} chars
            </span>
          </div>

          <textarea
            id="tts-transcript-box"
            rows={7}
            value={transcript}
            onChange={(e) => onChangeTranscript(e.target.value)}
            placeholder="Recognized sign language words will appear here. You can also type or insert phrases below to test voice output..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-y"
          />

          <div className="flex flex-wrap items-center gap-3">
            {isSpeaking ? (
              <button
                type="button"
                onClick={handleStop}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                <Square className="w-4 h-4 fill-current shrink-0" />
                <span>Stop Speaking</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSpeak}
                disabled={!supported || !transcript.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <Volume2 className="w-4 h-4 shrink-0" />
                <span>Speak</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              disabled={!transcript.trim()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 shrink-0" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                handleStop();
                onClearTranscript();
              }}
              disabled={!transcript}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 ml-auto"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span>Clear Text</span>
            </button>
          </div>

          {/* Quick insert phrases */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <p className="text-xs font-medium text-slate-500">
              Quick-insert supported sign phrases
            </p>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_GESTURES.map((gesture) => (
                <button
                  key={gesture.id}
                  type="button"
                  onClick={() => handleAppendPhrase(gesture.word)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 transition-colors whitespace-nowrap"
                >
                  + {gesture.word}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Voice settings panel */}
        <aside className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Voice Settings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Saved automatically in Local Storage
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="voice-select"
                className="block text-xs font-medium text-slate-700"
              >
                Browser Voice
              </label>
              <select
                id="voice-select"
                value={ttsSettings.voiceURI}
                onChange={(e) =>
                  onUpdateTtsSettings({
                    ...ttsSettings,
                    voiceURI: e.target.value,
                  })
                }
                disabled={!supported || voices.length === 0}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">System Default Voice</option>
                {voices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="rate-slider" className="font-medium text-slate-700">
                  Speaking Speed
                </label>
                <span className="font-mono tabular-nums text-slate-600">
                  {ttsSettings.rate.toFixed(1)}x
                </span>
              </div>
              <input
                id="rate-slider"
                type="range"
                min="0.6"
                max="1.5"
                step="0.1"
                value={ttsSettings.rate}
                onChange={(e) =>
                  onUpdateTtsSettings({
                    ...ttsSettings,
                    rate: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="pitch-slider" className="font-medium text-slate-700">
                  Voice Pitch
                </label>
                <span className="font-mono tabular-nums text-slate-600">
                  {ttsSettings.pitch.toFixed(1)}
                </span>
              </div>
              <input
                id="pitch-slider"
                type="range"
                min="0.7"
                max="1.4"
                step="0.1"
                value={ttsSettings.pitch}
                onChange={(e) =>
                  onUpdateTtsSettings({
                    ...ttsSettings,
                    pitch: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-violet-600"
              />
            </div>

            <div className="pt-3 border-t border-slate-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ttsSettings.autoSpeak}
                  onChange={(e) =>
                    onUpdateTtsSettings({
                      ...ttsSettings,
                      autoSpeak: e.target.checked,
                    })
                  }
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  <span className="block font-medium text-slate-900">
                    Auto-speak live recognitions
                  </span>
                  Automatically pronounce each gesture as soon as it is
                  confirmed in Sign Recognition.
                </span>
              </label>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

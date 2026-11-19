import {
  ArrowRight,
  BookOpen,
  Camera,
  Hand,
  Info,
  MessageSquareText,
  Scan,
  Trash2,
  Volume2,
} from 'lucide-react';
import { SUPPORTED_GESTURES } from '../data/gestures';
import { NavSection, RecognitionRecord, TtsSettings } from '../types';
import { isSpeechSynthesisSupported, speakText } from '../utils/speech';
import { Logo } from './Logo';
import { SignImage } from './SignImage';

interface DashboardViewProps {
  history: RecognitionRecord[];
  transcript: string;
  ttsSettings: TtsSettings;
  onNavigate: (section: NavSection) => void;
  onClearHistory: () => void;
}

const HERO_IMAGE_URL =
  '/src/assets/images/dashboard_hero_signbridge_1795114708111.jpg';

const FEATURED_GESTURE_IDS = ['hello', 'thank_you', 'i_love_you', 'peace'];

export function DashboardView({
  history,
  transcript,
  ttsSettings,
  onNavigate,
  onClearHistory,
}: DashboardViewProps) {
  const featuredGestures = FEATURED_GESTURE_IDS.map((id) =>
    SUPPORTED_GESTURES.find((g) => g.id === id)
  ).filter((g): g is (typeof SUPPORTED_GESTURES)[number] => Boolean(g));

  const quickLinks: ReadonlyArray<{
    section: NavSection;
    title: string;
    description: string;
    icon: typeof Camera;
    accentClass: string;
  }> = [
    {
      section: 'recognition',
      title: 'Sign Recognition',
      description:
        'Open your webcam to track 21 hand landmarks with MediaPipe and translate gestures live.',
      icon: Camera,
      accentClass: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
    },
    {
      section: 'tts',
      title: 'Text-to-Speech',
      description:
        'Convert recognized words into natural spoken audio using your browser’s Web Speech API.',
      icon: Volume2,
      accentClass: 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white',
    },
    {
      section: 'library',
      title: 'Sign Library',
      description: `Browse visual illustrations and handshape guides for all ${SUPPORTED_GESTURES.length} supported gestures.`,
      icon: BookOpen,
      accentClass: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
    },
    {
      section: 'about',
      title: 'About Project',
      description:
        'Review the problem statement, objectives, architecture, future scope, and local setup steps.',
      icon: Info,
      accentClass: 'bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white',
    },
  ];

  const transcriptWordCount = transcript.trim()
    ? transcript.trim().split(/\s+/).length
    : 0;

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Modern Gradient Header Hero Split */}
      <section className="rounded-3xl overflow-hidden shadow-[0_14px_38px_-14px_rgba(37,99,235,0.28)] bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-between gap-9 text-white">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-xs text-blue-100/90">
                <Logo inverted />
                <span aria-hidden="true" className="text-white/35">
                  /
                </span>
                <span>AI Sign Language Translation</span>
              </div>

              <div className="space-y-3.5">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.16]">
                  Bridge Every Gesture into Clear Text and Voice
                </h1>
                <p className="text-base text-blue-100/95 leading-relaxed max-w-xl">
                  SignBridge makes everyday sign communication accessible right
                  in the browser. Detect 21 real-time hand landmarks with
                  MediaPipe Hands and turn {SUPPORTED_GESTURES.length} essential
                  gestures into readable text and natural speech.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('recognition')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-blue-700 bg-white hover:bg-blue-50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Camera className="w-4 h-4 shrink-0" />
                  <span>Start Recognition</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('library')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white bg-white/12 ring-1 ring-white/25 hover:bg-white/20 hover:-translate-y-0.5 transition-all duration-200 ease-out whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <span>Explore {SUPPORTED_GESTURES.length} Signs</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/15 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-blue-100/90">
              <span>
                <strong className="font-semibold text-white">01.</strong> Show
                hand to camera
              </span>
              <span aria-hidden="true" className="text-white/35">
                ·
              </span>
              <span>
                <strong className="font-semibold text-white">02.</strong> Match
                21 landmarks
              </span>
              <span aria-hidden="true" className="text-white/35">
                ·
              </span>
              <span>
                <strong className="font-semibold text-white">03.</strong> Read
                &amp; speak aloud
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white min-h-[250px] lg:min-h-full overflow-hidden">
            <SignImage
              src={HERO_IMAGE_URL}
              alt="Illustration of hand landmark nodes translating into acoustic voice waves"
              label="SignBridge Visual Pipeline"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Full-Width Summary Metrics Strip */}
      <section
        aria-label="System summary"
        className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6"
      >
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-[0_6px_24px_-8px_rgba(15,23,42,0.08)] flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">
              Supported Gestures
            </p>
            <p className="text-3xl font-bold text-slate-900 tabular-nums font-display">
              {SUPPORTED_GESTURES.length}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Greetings · Responses · Expressions · Actions
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Hand className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-[0_6px_24px_-8px_rgba(15,23,42,0.08)] flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">
              Recognitions Logged
            </p>
            <p className="text-3xl font-bold text-slate-900 tabular-nums font-display">
              {history.length}
            </p>
            <p className="text-xs text-slate-500 tabular-nums leading-relaxed">
              {transcriptWordCount}{' '}
              {transcriptWordCount === 1 ? 'word' : 'words'} in current speech
              transcript
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <MessageSquareText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-[0_6px_24px_-8px_rgba(15,23,42,0.08)] flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">
              Hand Landmarks
            </p>
            <p className="text-3xl font-bold text-slate-900 tabular-nums font-display">
              21
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              On-device 3D tracking via MediaPipe Hands
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Scan className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Featured Signs Visual Preview */}
      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-slate-900">
              Featured Signs
            </h2>
            <p className="text-sm text-slate-500">
              A quick glimpse from the {SUPPORTED_GESTURES.length}-sign visual
              reference library
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('library')}
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 whitespace-nowrap shrink-0"
          >
            <span>View all {SUPPORTED_GESTURES.length} signs</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {featuredGestures.map((gesture) => (
            <button
              key={gesture.id}
              type="button"
              onClick={() => onNavigate('library')}
              className="group text-left bg-white rounded-2xl overflow-hidden shadow-[0_6px_24px_-8px_rgba(15,23,42,0.08)] hover:shadow-[0_16px_32px_-10px_rgba(37,99,235,0.16)] hover:-translate-y-1 transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <div className="aspect-4/3 bg-slate-50 border-b border-slate-100 overflow-hidden">
                <SignImage
                  src={gesture.imageUrl}
                  alt={`${gesture.word} sign illustration`}
                  label={gesture.word}
                  className="w-full h-full group-hover:scale-[1.04] transition-transform duration-200 ease-out"
                />
              </div>
              <div className="p-4 sm:p-5 space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors duration-200 truncate">
                    {gesture.word}
                  </p>
                  <span className="text-[11px] text-slate-500 shrink-0">
                    {gesture.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {gesture.shortCue}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Quick Access Modules */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-slate-900">
              Quick Access
            </h2>
            <p className="text-sm text-slate-500">
              Jump directly to any SignBridge workspace module
            </p>
          </div>
          <span className="text-xs text-slate-500">4 workspace modules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.section}
                type="button"
                onClick={() => onNavigate(item.section)}
                className="group text-left bg-white rounded-2xl p-6 shadow-[0_6px_24px_-8px_rgba(15,23,42,0.08)] hover:shadow-[0_16px_32px_-10px_rgba(37,99,235,0.16)] hover:-translate-y-1 transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-200 ${item.accentClass}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors duration-200">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 transition-transform duration-200 group-hover:translate-x-1">
                  <span>Open section</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Bottom Activity & Active Transcript Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Recent Recognition Activity */}
        <section className="lg:col-span-2 bg-white rounded-2xl shadow-[0_6px_24px_-8px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col">
          <div className="px-6 sm:px-7 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Recent Recognitions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Stored privately in Browser Local Storage
              </p>
            </div>
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 whitespace-nowrap shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="px-6 sm:px-7 py-12 text-center space-y-4 my-auto">
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                No gestures have been logged yet. Open Sign Recognition to
                translate your first sign in real time.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('recognition')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
              >
                <Camera className="w-4 h-4" />
                <span>Open Sign Recognition</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.slice(0, 5).map((record) => (
                <div
                  key={record.id}
                  className="px-6 sm:px-7 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors duration-150"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {record.word}
                    </p>
                    <p className="text-xs text-slate-500 tabular-nums mt-0.5">
                      {new Date(record.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                      <span className="mx-1.5" aria-hidden="true">
                        ·
                      </span>
                      {new Date(record.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-slate-600 shrink-0">
                    {Math.round(record.confidence * 100)}% match
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Speech Transcript Card */}
        <section className="bg-gradient-to-br from-blue-50/60 via-white to-violet-50/70 rounded-2xl p-6 sm:p-7 shadow-[0_6px_24px_-8px_rgba(15,23,42,0.08)] flex flex-col justify-between gap-6">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">
                Speech Transcript
              </h2>
              <span className="text-xs text-slate-500 tabular-nums">
                {transcriptWordCount}{' '}
                {transcriptWordCount === 1 ? 'word' : 'words'}
              </span>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed min-h-[96px]">
              {transcript.trim() ? (
                transcript
              ) : (
                <span className="text-slate-500">
                  Your translated sign phrases will collect here ready for
                  instant browser speech playback.
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200/60">
            <button
              type="button"
              onClick={() => speakText(transcript, ttsSettings)}
              disabled={!transcript.trim() || !isSpeechSynthesisSupported()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 hover:-translate-y-0.5 hover:shadow-sm disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:hover:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap"
            >
              <Volume2 className="w-3.5 h-3.5 shrink-0" />
              <span>Speak Now</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('tts')}
              className="group inline-flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 hover:text-blue-700 hover:bg-white/90 transition-all duration-200 whitespace-nowrap"
            >
              <span>Open Editor</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

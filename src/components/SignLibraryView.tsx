import { useMemo, useState } from 'react';
import { Camera, Search, Volume2 } from 'lucide-react';
import { SUPPORTED_GESTURES } from '../data/gestures';
import { GestureCategory, NavSection, TtsSettings } from '../types';
import { isSpeechSynthesisSupported, speakText } from '../utils/speech';
import { SignImage } from './SignImage';

interface SignLibraryViewProps {
  ttsSettings: TtsSettings;
  onNavigate: (section: NavSection) => void;
}

const CATEGORIES: ReadonlyArray<'All' | GestureCategory> = [
  'All',
  'Greeting',
  'Politeness',
  'Response',
  'Expression',
  'Assistance',
  'Everyday',
  'Actions',
];

export function SignLibraryView({
  ttsSettings,
  onNavigate,
}: SignLibraryViewProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | GestureCategory>(
    'All'
  );
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const filteredGestures = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return SUPPORTED_GESTURES.filter((gesture) => {
      const matchesCategory =
        selectedCategory === 'All' || gesture.category === selectedCategory;
      const matchesQuery =
        !normalized ||
        gesture.word.toLowerCase().includes(normalized) ||
        gesture.description.toLowerCase().includes(normalized) ||
        gesture.category.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory]);

  const handlePronounce = (id: string, word: string) => {
    if (!isSpeechSynthesisSupported()) return;
    speakText(word, ttsSettings, {
      onStart: () => setSpeakingId(id),
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign Library
          </h1>
          <p className="text-sm text-slate-600">
            Visual text-to-sign reference for all {SUPPORTED_GESTURES.length}{' '}
            hand gestures supported in this SignBridge prototype.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search signs..."
            aria-label="Search supported signs"
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Category filter bar */}
      <div
        className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit max-w-full"
        role="tablist"
        aria-label="Filter signs by category"
      >
        {CATEGORIES.map((category) => {
          const active = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {filteredGestures.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
          <p className="text-sm text-slate-600">
            No signs matched &ldquo;{query}&rdquo;. Clear the search or select
            another category.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-xl text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGestures.map((gesture) => {
            const isSpeaking = speakingId === gesture.id;
            return (
              <article
                key={gesture.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col hover:border-blue-300 transition-colors"
              >
                <div className="aspect-4/3 bg-slate-50 border-b border-slate-100 overflow-hidden">
                  <SignImage
                    src={gesture.imageUrl}
                    alt={`Illustration of the ${gesture.word} sign language gesture`}
                    label={gesture.word}
                    className="w-full h-full"
                  />
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">
                        {gesture.word}
                      </h2>
                      <span className="text-xs text-slate-500 shrink-0">
                        {gesture.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {gesture.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handlePronounce(gesture.id, gesture.word)}
                      disabled={!isSpeechSynthesisSupported()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                    >
                      <Volume2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{isSpeaking ? 'Speaking...' : 'Pronounce'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate('recognition')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 hover:bg-blue-50 transition-colors whitespace-nowrap"
                    >
                      <Camera className="w-3.5 h-3.5 shrink-0" />
                      <span>Try in Camera</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useCallback, useState } from 'react';
import { AboutProjectView } from './components/AboutProjectView';
import { DashboardView } from './components/DashboardView';
import { Sidebar } from './components/Sidebar';
import { SignLibraryView } from './components/SignLibraryView';
import { SignRecognitionView } from './components/SignRecognitionView';
import { TextToSpeechView } from './components/TextToSpeechView';
import { TopBar } from './components/TopBar';
import { SUPPORTED_GESTURES } from './data/gestures';
import { NavSection, RecognitionRecord, TtsSettings } from './types';
import {
  loadHistory,
  loadTranscript,
  loadTtsSettings,
  saveHistory,
  saveTranscript,
  saveTtsSettings,
} from './utils/storage';

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [transcript, setTranscript] = useState<string>(() => loadTranscript());
  const [history, setHistory] = useState<RecognitionRecord[]>(() =>
    loadHistory()
  );
  const [ttsSettings, setTtsSettings] = useState<TtsSettings>(() =>
    loadTtsSettings()
  );

  const handleChangeTranscript = useCallback((value: string) => {
    setTranscript(value);
    saveTranscript(value);
  }, []);

  const handleClearTranscript = useCallback(() => {
    setTranscript('');
    saveTranscript('');
  }, []);

  const handleWordRecognized = useCallback(
    (word: string, confidence: number) => {
      setTranscript((prev) => {
        const trimmed = prev.trim();
        const next = trimmed ? `${trimmed} ${word}` : word;
        saveTranscript(next);
        return next;
      });

      setHistory((prev) => {
        const entry: RecognitionRecord = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          word,
          confidence,
          timestamp: new Date().toISOString(),
        };
        const next = [entry, ...prev].slice(0, 30);
        saveHistory(next);
        return next;
      });
    },
    []
  );

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  const handleUpdateTtsSettings = useCallback((next: TtsSettings) => {
    setTtsSettings(next);
    saveTtsSettings(next);
  }, []);

  const handleNavigate = useCallback((section: NavSection) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={handleNavigate}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        supportedCount={SUPPORTED_GESTURES.length}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          activeSection={activeSection}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNavigate={handleNavigate}
        />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-12">
          {activeSection === 'dashboard' && (
            <DashboardView
              history={history}
              transcript={transcript}
              ttsSettings={ttsSettings}
              onNavigate={handleNavigate}
              onClearHistory={handleClearHistory}
            />
          )}

          {activeSection === 'recognition' && (
            <SignRecognitionView
              transcript={transcript}
              onWordRecognized={handleWordRecognized}
              onClearTranscript={handleClearTranscript}
              ttsSettings={ttsSettings}
              onUpdateTtsSettings={handleUpdateTtsSettings}
              onNavigate={handleNavigate}
            />
          )}

          {activeSection === 'tts' && (
            <TextToSpeechView
              transcript={transcript}
              onChangeTranscript={handleChangeTranscript}
              onClearTranscript={handleClearTranscript}
              ttsSettings={ttsSettings}
              onUpdateTtsSettings={handleUpdateTtsSettings}
            />
          )}

          {activeSection === 'library' && (
            <SignLibraryView
              ttsSettings={ttsSettings}
              onNavigate={handleNavigate}
            />
          )}

          {activeSection === 'about' && (
            <AboutProjectView onNavigate={handleNavigate} />
          )}
        </main>
      </div>
    </div>
  );
}

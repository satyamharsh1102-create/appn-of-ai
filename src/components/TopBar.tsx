import { Camera, Menu, Volume2 } from 'lucide-react';
import { NavSection } from '../types';

interface TopBarProps {
  activeSection: NavSection;
  onOpenMobileMenu: () => void;
  onNavigate: (section: NavSection) => void;
}

const SECTION_LABELS: Record<NavSection, string> = {
  dashboard: 'Dashboard',
  recognition: 'Sign Recognition',
  tts: 'Text-to-Speech',
  library: 'Sign Library',
  about: 'About Project',
};

export function TopBar({
  activeSection,
  onOpenMobileMenu,
  onNavigate,
}: TopBarProps) {
  const isRecognition = activeSection === 'recognition';

  return (
    <header className="h-16 bg-gradient-to-r from-blue-50/90 via-white/95 to-violet-50/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_12px_-4px_rgba(37,99,235,0.08)] sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all duration-200 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm min-w-0">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="text-slate-600 hover:text-blue-700 transition-colors duration-200 whitespace-nowrap shrink-0"
          >
            SignBridge
          </button>
          <span className="text-slate-300 select-none" aria-hidden="true">
            /
          </span>
          <span className="font-semibold text-slate-900 truncate">
            {SECTION_LABELS[activeSection]}
          </span>
        </nav>
      </div>

      <div className="shrink-0">
        {isRecognition ? (
          <button
            type="button"
            onClick={() => onNavigate('tts')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
          >
            <Volume2 className="w-4 h-4 shrink-0" />
            <span>Text-to-Speech</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate('recognition')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span>Start Recognition</span>
          </button>
        )}
      </div>
    </header>
  );
}

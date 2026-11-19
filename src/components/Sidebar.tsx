import {
  BookOpen,
  Camera,
  Info,
  LayoutDashboard,
  Volume2,
  X,
} from 'lucide-react';
import { NavSection } from '../types';
import { Logo } from './Logo';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  supportedCount: number;
}

const NAV_ITEMS: ReadonlyArray<{
  id: NavSection;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'recognition', label: 'Sign Recognition', icon: Camera },
  { id: 'tts', label: 'Text-to-Speech', icon: Volume2 },
  { id: 'library', label: 'Sign Library', icon: BookOpen },
  { id: 'about', label: 'About Project', icon: Info },
];

export function Sidebar({
  activeSection,
  onSelectSection,
  mobileOpen,
  onCloseMobile,
  supportedCount,
}: SidebarProps) {
  const handleSelect = (section: NavSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 shrink-0">
        <button
          type="button"
          onClick={() => handleSelect('dashboard')}
          className="text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded-lg"
        >
          <Logo />
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-out whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-[0_2px_10px_-4px_rgba(37,99,235,0.2)]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:translate-x-0.5'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-blue-600' : 'text-slate-400'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
        <p className="font-medium text-slate-700">Academic Prototype</p>
        <p className="tabular-nums">
          {supportedCount} gestures · MediaPipe Hands · Local browser processing
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {navContent}
      </aside>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[82vw] h-full shadow-xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}

interface LogoProps {
  compact?: boolean;
  inverted?: boolean;
}

export function Logo({ compact = false, inverted = false }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5 select-none whitespace-nowrap shrink-0">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${
          inverted
            ? 'bg-white/18 backdrop-blur-xs ring-1 ring-white/25'
            : 'bg-gradient-to-br from-blue-600 to-violet-600 shadow-xs'
        }`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="text-white"
        >
          <path
            d="M4 16.5C6.5 11.5 10 9 12 9C14 9 17.5 11.5 20 16.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M7.5 16.5C9 13.5 10.6 12.2 12 12.2C13.4 12.2 15 13.5 16.5 16.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.75"
          />
          <circle cx="12" cy="6.2" r="1.8" fill="currentColor" />
        </svg>
      </div>
      {!compact && (
        <span
          className={`font-display text-lg font-bold tracking-tight ${
            inverted ? 'text-white' : 'text-slate-900'
          }`}
        >
          SignBridge
        </span>
      )}
    </div>
  );
}

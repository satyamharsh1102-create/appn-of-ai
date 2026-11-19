import { useState } from 'react';
import { Hand } from 'lucide-react';

interface SignImageProps {
  src: string;
  alt: string;
  label: string;
  className?: string;
}

export function SignImage({ src, alt, label, className = '' }: SignImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-violet-50 text-slate-600 p-6 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Hand className="w-10 h-10 text-blue-600 mb-2" />
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
      loading="lazy"
    />
  );
}

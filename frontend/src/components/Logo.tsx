type LogoProps = {
  className?: string;
  showText?: boolean;
  compact?: boolean;
  variant?: 'dark' | 'light';
};

export default function Logo({
  className = '',
  showText = true,
  compact = false,
  variant = 'dark',
}: LogoProps) {
  const titleClass = variant === 'light' ? 'text-white' : 'text-brand-900';
  const subtitleClass = variant === 'light' ? 'text-slate-400' : 'text-brand-700';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 48 48"
        className={compact ? 'h-8 w-8' : 'h-10 w-10'}
        aria-hidden="true"
        role="img"
      >
        <rect width="48" height="48" rx="12" fill="#0B3A4A" />
        <path
          d="M14 30 L24 12 L34 30 Z"
          stroke="#2DD4BF"
          strokeWidth="2.8"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="24" cy="26" r="3" fill="#F8FAFC" />
        <path d="M16 35 H32" stroke="#94A3B8" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      {showText && (
        <div className="leading-tight">
          <span
            className={`block font-display text-base font-semibold tracking-tight sm:text-lg ${titleClass}`}
          >
            Emergent
          </span>
          <span
            className={`block text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs ${subtitleClass}`}
          >
            Technologies
          </span>
        </div>
      )}
    </div>
  );
}

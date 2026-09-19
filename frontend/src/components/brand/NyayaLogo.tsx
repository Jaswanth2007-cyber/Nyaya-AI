import React from 'react';

interface NyayaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  /** Landing page uses a permanently dark cinematic stage, so its logo colors
   * stay fixed regardless of the app-wide theme toggle. Auth/Workspace pages
   * omit this so the logo follows the theme variables instead. */
  fixed?: boolean;
}

export const NyayaLogo: React.FC<NyayaLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  fixed = false
}) => {
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  }[size];

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl'
  }[size];

  const inkClass = fixed ? 'text-[#f4f1ea]' : 'text-[var(--ink)]';
  const goldClass = fixed ? 'text-[#c9a463]' : 'text-[var(--gold)]';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Custom Geometric Legal Pillar / Structured AI Mark */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes} ${inkClass}`}>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Left Vertical Pillar */}
          <path d="M6 6H9V26H6V6Z" fill="currentColor" />
          {/* Right Vertical Pillar */}
          <path d="M23 6H26V26H23V6Z" fill="currentColor" />
          {/* Diagonal Legal Cross-Beam / N Structure */}
          <path d="M9 6L23 26H19.5L6 6H9Z" fill="currentColor" fillOpacity="0.45" />
          {/* Central Scales / Justice Dot Indicator */}
          <circle cx="16" cy="16" r="2" className={goldClass} fill="currentColor" />
          {/* Horizontal Top Balance Cap */}
          <rect x="4" y="4" width="24" height="1.5" rx="0.75" fill="currentColor" fillOpacity="0.7" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-semibold tracking-tight font-sans ${inkClass} ${textSizes}`}>
            Nyaya<span className={`font-light ml-0.5 ${goldClass}`}>-AI</span>
          </span>
        </div>
      )}
    </div>
  );
};

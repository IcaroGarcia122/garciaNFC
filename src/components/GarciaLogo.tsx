import React from 'react';

interface GarciaLogoProps {
  variant?: 'full' | 'compact' | 'monogram' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

/**
 * GarciaIcon: The iconic 'G' squircle badge from the brand visual identity board,
 * hoodie chest embroidery, and lanyard.
 */
export const GarciaIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 40, 
  className = '' 
}) => {
  return (
    <div 
      className={`relative flex items-center justify-center select-none rounded-[14px] bg-gradient-to-b from-[#0C1B33] to-[#060D1A] border-2 border-[#0066FE] shadow-[0_0_18px_rgba(0,102,254,0.35)] transition-transform duration-200 hover:scale-105 ${className}`}
      style={{ width: size, height: size * 0.85 }}
    >
      {/* Gloss reflection line */}
      <div className="absolute inset-0 rounded-[12px] bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
      
      {/* Monogram G */}
      <svg
        viewBox="0 0 100 80"
        className="w-[72%] h-[72%] fill-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M78 28H46C34.95 28 26 36.95 26 48C26 59.05 34.95 68 46 68H70C74.42 68 78 64.42 78 60V46H54V54H68V60H46C39.37 60 34 54.63 34 48C34 41.37 39.37 36 46 36H78V28Z" />
        {/* Mini registered R mark */}
        <circle cx="88" cy="22" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <text x="88" y="24" fontSize="6" fontWeight="bold" textAnchor="middle" fill="currentColor">R</text>
      </svg>
    </div>
  );
};

/**
 * GarciaWordmark: Vector-crafted reproduction of the bold geometric GARCIA logo
 * with the characteristic chamfered/cut letterforms and "design" pill.
 */
export const GarciaLogo: React.FC<GarciaLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showSubtitle = true
}) => {
  // Size scales
  const sizeConfig = {
    sm: { height: 26, fontSize: 18, iconSize: 26, subSize: 'text-[9px]' },
    md: { height: 34, fontSize: 24, iconSize: 34, subSize: 'text-[11px]' },
    lg: { height: 44, fontSize: 32, iconSize: 44, subSize: 'text-[13px]' },
    xl: { height: 56, fontSize: 42, iconSize: 56, subSize: 'text-[15px]' }
  }[size];

  if (variant === 'monogram') {
    return <GarciaIcon size={sizeConfig.iconSize} className={className} />;
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Optional Monogram */}
      {(variant === 'full' || variant === 'badge') && (
        <GarciaIcon size={sizeConfig.iconSize} />
      )}

      <div className="flex flex-col justify-center">
        {/* GARCIA Wordmark with registered mark */}
        <div className="flex items-baseline gap-0.5 leading-none">
          <span 
            className="font-[900] tracking-wider text-white uppercase italic transform -skew-x-2 flex items-center"
            style={{ 
              fontFamily: "'Arquivo', sans-serif",
              fontSize: sizeConfig.fontSize,
              letterSpacing: '0.08em'
            }}
          >
            GARCIA
          </span>
          <span className="text-[#0066FE] font-bold text-[10px] -translate-y-2 ml-0.5">
            ®
          </span>
        </div>

        {/* Subtitle tag / badge: design */}
        {showSubtitle && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-slate-300 font-medium tracking-wide lowercase ${sizeConfig.subSize}`}>
              design
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0066FE] animate-pulse" />
            <span className="text-[10px] text-blue-400/90 font-semibold tracking-wider uppercase">
              NFC Studio
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

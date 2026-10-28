import React from 'react';

interface BlushFitLogoProps {
  className?: string;
  height?: number | string;
  showTag?: boolean;
}

export const BlushFitLogo: React.FC<BlushFitLogoProps> = ({
  className = '',
  height = 36,
  showTag = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Imagem da Logo Oficial BlushFit */}
      <div className="bg-black/90 dark:bg-black/60 px-2.5 py-1 rounded-xl border border-border/40 shadow-xs flex items-center justify-center">
        <img
          src="/logo-blushfit-transparent.png"
          alt="BlushFit"
          style={{ height: typeof height === 'number' ? `${height}px` : height }}
          className="object-contain filter brightness-105"
        />
      </div>

      {showTag && (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          PHIBO ERP
        </span>
      )}
    </div>
  );
};

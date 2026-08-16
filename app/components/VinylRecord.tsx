'use client';

import React from 'react';

interface VinylRecordProps {
  isPlaying: boolean;
  artworkUrl?: string;
  size?: 'desktop' | 'mobile';
}

export const VinylRecord: React.FC<VinylRecordProps> = ({
  isPlaying,
  artworkUrl,
  size = 'desktop',
}) => {
  const sizeClasses = size === 'desktop' ? 'w-20 h-20 min-w-20' : 'w-16 h-16 min-w-16';

  return (
    <div className={`relative rounded-full shadow-2xl overflow-hidden p-1 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 border border-white/20 select-none ${sizeClasses}`}>
      {/* Vinyl record container with spin animation */}
      <div
        className={`relative w-full h-full rounded-full flex items-center justify-center ${
          isPlaying ? 'animate-spin-running' : 'animate-spin-paused'
        }`}
        style={{
          background: 'radial-gradient(circle, #1a1a1a 0%, #0d0d0d 65%, #050505 100%)',
        }}
      >
        {/* Subtle Vinyl Grooves */}
        <div className="absolute inset-1 rounded-full border border-white/[0.08]" />
        <div className="absolute inset-2.5 rounded-full border border-white/[0.06]" />
        <div className="absolute inset-4 rounded-full border border-white/[0.04]" />

        {/* Center Record Label / Artwork */}
        <div className="relative w-1/2 h-1/2 rounded-full overflow-hidden border border-amber-glow/30 flex items-center justify-center bg-slate-900 shadow-inner">
          {artworkUrl ? (
            <img
              src={artworkUrl}
              alt="Track Artwork"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-crimson to-maroon flex items-center justify-center">
              <span className="text-[7px] font-mono tracking-tighter text-amber-glow/80 font-bold">
                GOTHAM
              </span>
            </div>
          )}

          {/* Spindle hole: 12px bg-black/70 ring-2 ring-white/40 */}
          <div className="absolute w-[12px] h-[12px] rounded-full bg-black/80 ring-2 ring-white/40 shadow-inner z-10" />
        </div>
      </div>
    </div>
  );
};

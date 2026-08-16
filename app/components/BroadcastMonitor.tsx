'use client';

import React from 'react';

interface BroadcastMonitorProps {
  videoId: string;
  isMonitorExpanded: boolean;
  onToggleMonitor: () => void;
  containerId: string;
}

export const BroadcastMonitor: React.FC<BroadcastMonitorProps> = ({
  videoId,
  isMonitorExpanded,
  onToggleMonitor,
  containerId,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto mb-4 transition-all duration-300">
      {/* Vintage Noir Broadcast CRT Screen Monitor */}
      <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-slate-950/90 shadow-2xl p-2 noir-glass">
        {/* Top Header Bar of Monitor */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 mb-2 font-mono text-[10px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-crimson-bright animate-ping" />
            <span className="text-slate-200 tracking-wider font-semibold uppercase">
              LIVE BROADCAST MONITOR // CH 88.4
            </span>
          </div>
          <button
            onClick={onToggleMonitor}
            className="hover:text-amber-glow transition-colors cursor-pointer uppercase text-[9px] tracking-wider"
          >
            {isMonitorExpanded ? '[- COMPACT]' : '[+ EXPAND]'}
          </button>
        </div>

        {/* 16:9 Aspect Video YouTube Player Frame */}
        <div
          className={`relative w-full aspect-video rounded-lg overflow-hidden bg-black border border-white/10 transition-all duration-300 ${
            isMonitorExpanded ? 'h-auto max-h-[300px]' : 'h-36 sm:h-44'
          }`}
        >
          {/* Scanline CRT overlay effect */}
          <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40" />

          {/* YouTube Iframe container targeted by YouTube Player API */}
          <div id={containerId} className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';

interface HeaderProps {
  listenerCount: number;
  onOpenAbout: () => void;
  onOpenArchive: () => void;
  onOpenPlaylists: () => void;
  currentPlaylistName: string;
}

export const Header: React.FC<HeaderProps> = ({
  listenerCount,
  onOpenAbout,
  onOpenArchive,
  onOpenPlaylists,
  currentPlaylistName,
}) => {
  const [timeParts, setTimeParts] = useState<{ time: string; period: string }>({
    time: '11:42',
    period: 'PM',
  });

  useEffect(() => {
    const updateTime = () => {
      try {
        const formatter = new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        const formatted = formatter.format(new Date());
        const match = formatted.match(/(\d+:\d+)\s*([APap][Mm])/);
        if (match) {
          setTimeParts({
            time: match[1],
            period: match[2].toUpperCase(),
          });
        } else {
          setTimeParts({ time: formatted, period: '' });
        }
      } catch (e) {
        const now = new Date();
        const hrs = String(now.getHours() % 12 || 12);
        const mins = String(now.getMinutes()).padStart(2, '0');
        const period = now.getHours() >= 12 ? 'PM' : 'AM';
        setTimeParts({ time: `${hrs}:${mins}`, period });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const [hours, minutes] = timeParts.time.split(':');

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 sm:px-8 sm:py-5 pt-safe pl-safe pr-safe bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-auto">
      {/* Top Left: Digital Clock */}
      <div className="flex items-center gap-2 font-mono text-xs text-amber-glow drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] select-none">
        <span className="inline-block w-2 h-2 rounded-full bg-crimson-bright animate-pulse" />
        <span className="font-bold text-slate-100 text-sm">
          {hours}
          <span className="animate-blink text-amber-glow mx-[1px]">:</span>
          {minutes}
        </span>
        <span className="text-[10px] text-amber-glow/90 font-mono tracking-wider font-semibold">{timeParts.period} IST</span>
      </div>

      {/* Top Center: Listener Count & Playlist tag */}
      <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-black/75 border border-white/20 backdrop-blur-md shadow-xl">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson-bright opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-crimson-bright"></span>
        </span>
        <span className="text-[11px] font-mono tracking-widest text-slate-200 uppercase font-semibold">
          {listenerCount.toLocaleString()} LISTENING
        </span>
        <span className="text-slate-600">|</span>
        <button
          onClick={onOpenPlaylists}
          className="text-[11px] font-mono tracking-wider text-amber-glow hover:text-white transition-colors uppercase cursor-pointer font-bold"
        >
          {currentPlaylistName}
        </button>
      </div>

      {/* Top Right: Styled Noir Buttons */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono tracking-wider">
        <button
          onClick={onOpenPlaylists}
          className="px-3 py-1 rounded-full bg-black/70 hover:bg-amber-glow hover:text-black border border-white/20 text-amber-glow transition-all cursor-pointer font-semibold shadow-md backdrop-blur-md"
        >
          CHANNEL
        </button>
        <button
          onClick={onOpenArchive}
          className="px-3 py-1 rounded-full bg-black/70 hover:bg-white hover:text-black border border-white/20 text-slate-200 transition-all cursor-pointer font-semibold shadow-md backdrop-blur-md"
        >
          ARCHIVE
        </button>
        <button
          onClick={onOpenAbout}
          className="px-3 py-1 rounded-full bg-black/70 hover:bg-white hover:text-black border border-white/20 text-slate-200 transition-all cursor-pointer font-semibold shadow-md backdrop-blur-md"
        >
          ABOUT
        </button>
      </div>
    </header>
  );
};

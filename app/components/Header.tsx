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
        // Formatted is e.g. "11:42 pm" or "11:42 PM"
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
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 sm:px-8 sm:py-5 pt-safe pl-safe pr-safe bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
      {/* Top Left: Digital Clock */}
      <div className="flex items-center gap-2 tracking-widest text-xs font-mono text-slate-300/90 select-none">
        <span className="inline-block w-2 h-2 rounded-full bg-crimson-bright animate-pulse" />
        <span className="font-semibold text-slate-200">
          {hours}
          <span className="animate-blink text-crimson-bright mx-[1px]">:</span>
          {minutes}
        </span>
        <span className="text-[10px] text-slate-400 font-sans tracking-normal font-medium">{timeParts.period} IST</span>
      </div>

      {/* Top Center: Listener Count & Playlist tag */}
      <div className="hidden md:flex items-center gap-3 px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson-bright opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-crimson-bright"></span>
        </span>
        <span className="text-[11px] font-mono tracking-widest text-slate-300 uppercase">
          {listenerCount.toLocaleString()} LISTENING
        </span>
        <span className="text-slate-600">|</span>
        <button
          onClick={onOpenPlaylists}
          className="text-[11px] font-mono tracking-wider text-amber-glow/90 hover:text-amber-glow transition-colors uppercase cursor-pointer"
        >
          {currentPlaylistName}
        </button>
      </div>

      {/* Top Right: Minimal Social & Navigation */}
      <div className="flex items-center gap-4 text-xs font-mono tracking-widest text-slate-400">
        <button
          onClick={onOpenPlaylists}
          className="md:hidden hover:text-slate-200 text-amber-glow/90 transition-colors uppercase cursor-pointer text-[11px]"
        >
          PLAYLISTS
        </button>
        <button
          onClick={onOpenArchive}
          className="hover:text-slate-100 transition-colors uppercase cursor-pointer text-[11px]"
        >
          ARCHIVE
        </button>
        <button
          onClick={onOpenAbout}
          className="hover:text-slate-100 transition-colors uppercase cursor-pointer text-[11px]"
        >
          ABOUT
        </button>
      </div>
    </header>
  );
};

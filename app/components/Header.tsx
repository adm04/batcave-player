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
  const [timeState, setTimeState] = useState<{
    timeStr: string;
    period: string;
    dateStr: string;
  }>({
    timeStr: '9:16',
    period: 'pm',
    dateStr: 'SUNDAY, 16 AUGUST · IST',
  });

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeFormatter = new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        const formattedTime = timeFormatter.format(now);
        const match = formattedTime.match(/(\d+:\d+)\s*([APap][Mm])/);

        const dateFormatter = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Kolkata',
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        });
        const formattedDate = `${dateFormatter.format(now).toUpperCase()} · IST`;

        if (match) {
          setTimeState({
            timeStr: match[1],
            period: match[2].toLowerCase(),
            dateStr: formattedDate,
          });
        }
      } catch (e) {
        const now = new Date();
        const hrs = String(now.getHours() % 12 || 12);
        const mins = String(now.getMinutes()).padStart(2, '0');
        const period = now.getHours() >= 12 ? 'pm' : 'am';
        setTimeState({
          timeStr: `${hrs}:${mins}`,
          period,
          dateStr: 'SUNDAY, 16 AUGUST · IST',
        });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* TOP LEFT HEADER GROUP (Deluxe Saloon layout) */}
      <div className="fixed top-4 left-4 sm:top-6 sm:left-8 z-40 flex flex-col gap-1.5 text-slate-100 font-sans pointer-events-auto select-none">
        {/* Large Digital Time */}
        <div className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-slate-100 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
          {timeState.timeStr}
          <span className="text-sm sm:text-base text-slate-300 font-mono font-normal ml-1.5 uppercase">
            {timeState.period}
          </span>
        </div>

        {/* Date & Timezone */}
        <div className="text-[10px] sm:text-xs font-mono tracking-widest text-slate-300/90 uppercase font-semibold drop-shadow">
          {timeState.dateStr}
        </div>

        {/* Listener Pill */}
        <div className="flex items-center gap-2 mt-1 px-3 py-1 rounded-full bg-black/70 border border-white/15 w-fit backdrop-blur-md shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="text-[11px] font-mono text-slate-200 font-medium">
            {listenerCount.toLocaleString()} listening
          </span>
        </div>

        {/* Built-by Credit Pill */}
        <div className="flex items-center gap-2 mt-0.5">
          <a
            href="https://x.com"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] font-mono text-slate-400 hover:text-amber-glow hover:border-amber-glow/40 transition-all shadow-sm"
          >
            built by <span className="font-bold">𝕏 @adm04</span>
          </a>
        </div>
      </div>

      {/* TOP RIGHT HEADER GROUP (Deluxe Saloon layout) */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-8 z-40 flex flex-col items-end gap-2.5 pointer-events-auto select-none max-w-[280px] sm:max-w-xs">
        {/* Navigation Pill Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPlaylists}
            className="px-4 py-1.5 rounded-full bg-black/70 border border-white/20 text-slate-200 hover:text-amber-glow hover:border-amber-glow text-xs font-mono tracking-wider transition-all backdrop-blur-md shadow-lg cursor-pointer font-semibold"
          >
            Playlists
          </button>
          <button
            onClick={onOpenArchive}
            className="px-4 py-1.5 rounded-full bg-black/70 border border-white/20 text-slate-200 hover:text-white hover:border-white/40 text-xs font-mono tracking-wider transition-all backdrop-blur-md shadow-lg cursor-pointer font-semibold"
          >
            All tracks
          </button>
        </div>

        {/* Support & Station Info Card */}
        <div className="p-3.5 rounded-2xl bg-black/75 border border-white/15 backdrop-blur-md text-right shadow-2xl space-y-2">
          <p className="text-[11px] text-slate-300 leading-snug">
            Help us keep this station running. Your support means a lot.
          </p>
          <div className="flex items-center justify-end gap-2 text-[10px] font-mono">
            <button
              onClick={onOpenAbout}
              className="px-3 py-1 rounded-md bg-amber-glow text-black font-bold hover:bg-amber-400 transition-colors shadow"
            >
              Support
            </button>
            <button
              onClick={onOpenAbout}
              className="px-3 py-1 rounded-md bg-crimson-bright text-white font-bold hover:bg-crimson transition-colors shadow"
            >
              About
            </button>
          </div>
        </div>

        {/* Nostalgia Banner */}
        <button
          onClick={onOpenAbout}
          className="hidden sm:block px-3 py-1.5 rounded-full bg-black/60 border border-white/15 text-[10.5px] text-amber-glow/90 hover:text-amber-glow font-mono tracking-wide backdrop-blur-md transition-all text-right cursor-pointer"
        >
          Click here to enjoy your old school memories ↗
        </button>
      </div>
    </>
  );
};

'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Track } from '../types/music';
import { VinylRecord } from './VinylRecord';
import { SeekBar } from './SeekBar';

interface DesktopPlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  artworkUrl?: string;
}

export const DesktopPlayer: React.FC<DesktopPlayerProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onPrev,
  onNext,
  onSeek,
  artworkUrl,
}) => {
  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="hidden sm:flex items-center gap-4 w-full max-w-xl p-3 pr-6 rounded-full noir-glass pointer-events-auto transition-all duration-300">
      {/* Vinyl Record */}
      <VinylRecord
        isPlaying={isPlaying}
        artworkUrl={artworkUrl}
        size="desktop"
      />

      {/* Track Info & Seek Bar */}
      <div className="flex-1 flex flex-col justify-center min-w-0 px-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2 truncate">
            <h2 className="text-[15px] font-semibold text-slate-100 truncate tracking-wide">
              {currentTrack.title}
            </h2>
            <span className="text-[12.5px] text-white/70 truncate">
              {currentTrack.artist}
            </span>
          </div>
          {currentTrack.film && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-glow/80 whitespace-nowrap hidden lg:inline">
              {currentTrack.film} · {currentTrack.year}
            </span>
          )}
        </div>

        {/* Seek Bar */}
        <SeekBar
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
        />

        {/* Elapsed & Duration */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 -mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="flex items-center gap-2 pl-2 border-l border-white/10">
        <button
          onClick={onPrev}
          title="Previous Track"
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={onPlayPause}
          title={isPlaying ? 'Pause' : 'Play'}
          className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-b from-crimson-bright to-crimson text-white shadow-lg shadow-crimson/50 ring-1 ring-white/25 hover:scale-105 transition-all cursor-pointer active:scale-95"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        <button
          onClick={onNext}
          title="Next Track"
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

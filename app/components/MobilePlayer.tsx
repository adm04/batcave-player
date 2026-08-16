'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Track } from '../types/music';
import { VinylRecord } from './VinylRecord';
import { SeekBar } from './SeekBar';

interface MobilePlayerProps {
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

export const MobilePlayer: React.FC<MobilePlayerProps> = ({
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
    <div className="sm:hidden flex flex-col gap-3 w-full max-w-sm p-4 rounded-[26px] noir-glass pointer-events-auto shadow-2xl transition-all duration-300">
      {/* ROW 1: 64px Vinyl + Title/Artist */}
      <div className="flex items-center gap-3">
        <VinylRecord
          isPlaying={isPlaying}
          artworkUrl={artworkUrl}
          size="mobile"
        />

        <div className="flex-1 flex flex-col justify-center min-w-0">
          <h2 className="text-sm font-semibold text-slate-100 truncate tracking-wide">
            {currentTrack.title}
          </h2>
          <p className="text-[12.5px] text-white/70 truncate">
            {currentTrack.artist}
          </p>
          {currentTrack.film && (
            <p className="text-[10px] font-mono uppercase tracking-wider text-amber-glow/80 truncate mt-0.5">
              {currentTrack.film} · {currentTrack.year}
            </p>
          )}
        </div>
      </div>

      {/* ROW 2: Full-width Seek Bar */}
      <div className="-my-1">
        <SeekBar
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
        />
      </div>

      {/* ROW 3: Time Elapsed/Duration + Centered Transport Controls */}
      <div className="flex items-center justify-between pt-1">
        {/* Elapsed Time */}
        <span className="text-[11px] font-mono text-slate-400 w-10 text-left">
          {formatTime(currentTime)}
        </span>

        {/* Centered Transport Targets (Min 44px touch targets) */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onPrev}
            title="Previous Track"
            className="w-11 h-11 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Play Button: 52px circle, crimson gradient, ring-1 ring-white/25, drop shadow */}
          <button
            onClick={onPlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
            className="w-[52px] h-[52px] rounded-full flex items-center justify-center bg-gradient-to-b from-crimson-bright to-crimson text-white shadow-xl shadow-crimson/50 ring-1 ring-white/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            title="Next Track"
            className="w-11 h-11 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Duration Time */}
        <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, ExternalLink, ChevronDown } from 'lucide-react';

export interface TrackData {
  id: string;
  title: string;
  subtitle: string;
  artist: string;
  coverUrl: string;
  audioUrl?: string;
  youtubeId?: string;
  duration: string;
  spotifyUrl: string;
  ytMusicUrl: string;
}

const DEFAULT_TRACKS: TrackData[] = [
  {
    id: 'roja',
    title: 'Roja Jaaneman',
    subtitle: 'Roja Jaaneman · Roja (1992)',
    artist: 'Hariharan',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
    duration: '54:07',
    spotifyUrl: 'https://open.spotify.com/search/roja%20jaaneman',
    ytMusicUrl: 'https://music.youtube.com/search?q=roja+jaaneman',
  },
  {
    id: 'gotham-rain',
    title: 'Gotham Rain & Fog Horns',
    subtitle: 'Batcave Ambient · Noir Transmission (1939)',
    artist: 'The Midnight Vigilante',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
    duration: '42:15',
    spotifyUrl: 'https://open.spotify.com/search/gotham%20rain%20ambient',
    ytMusicUrl: 'https://music.youtube.com/search?q=gotham+rain+ambient',
  },
  {
    id: 'crime-alley',
    title: 'Shadows Along Crime Alley',
    subtitle: 'Sunset Metropolis · Dark Jazz',
    artist: 'Bohren & Der Club of Gore',
    coverUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=300&auto=format&fit=crop&q=80',
    duration: '38:40',
    spotifyUrl: 'https://open.spotify.com/search/bohren%20club%20of%20gore',
    ytMusicUrl: 'https://music.youtube.com/search?q=bohren+and+der+club+of+gore',
  },
];

interface DesktopPlayerProps {
  onNext?: () => void;
  onPrev?: () => void;
}

export const DesktopPlayer: React.FC<DesktopPlayerProps> = () => {
  const [trackIndex, setTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(19);
  const [volume, setVolume] = useState<number>(80);

  const currentTrack = DEFAULT_TRACKS[trackIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTimeSec((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setTrackIndex((prev) => (prev + 1) % DEFAULT_TRACKS.length);
    setCurrentTimeSec(0);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setTrackIndex((prev) => (prev - 1 + DEFAULT_TRACKS.length) % DEFAULT_TRACKS.length);
    setCurrentTimeSec(0);
    setIsPlaying(true);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins}:${String(remainderSecs).padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl bg-[#141416]/90 border border-white/10 p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl text-slate-100 font-sans select-none">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Left Album Cover Art Thumbnail (Audio-only, no video frame) */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-lg flex-shrink-0 bg-black border border-white/10 group">
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-amber-glow text-black flex items-center justify-center shadow-lg"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
            </button>
          </div>
        </div>

        {/* Right Info & Controls Container */}
        <div className="flex-1 w-full space-y-2.5">
          {/* Header Row: Song Title, Subtitle, Chevron */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 overflow-hidden">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white truncate font-sans">
                {currentTrack.title}
              </h2>
              <p className="text-xs text-slate-300 font-medium truncate">
                {currentTrack.subtitle}
              </p>
              <p className="text-[11px] text-slate-400 font-mono tracking-wide">
                {currentTrack.artist}
              </p>
            </div>
            <button className="text-slate-400 hover:text-white transition-colors p-1">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Seekbar Timeline */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 tracking-wider">
              <span>{formatTime(currentTimeSec)}</span>
              <span>{currentTrack.duration}</span>
            </div>
            <div className="relative w-full h-1.5 rounded-full bg-slate-800 cursor-pointer overflow-hidden group">
              <div
                className="h-full bg-slate-200 group-hover:bg-amber-glow transition-all rounded-full"
                style={{ width: `${Math.min(100, (currentTimeSec / 3247) * 100)}%` }}
              />
            </div>
          </div>

          {/* Bottom Control Bar: Prev, Play/Pause, Next, Volume, Spotify / YT Music */}
          <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
            {/* Playback Transport Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="text-slate-300 hover:text-white transition-colors p-1"
                title="Previous track"
              >
                <SkipBack className="w-4 h-4 fill-slate-300 hover:fill-white" />
              </button>
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-white hover:bg-slate-200 text-black flex items-center justify-center transition-transform active:scale-95 shadow-md"
                title="Play/Pause"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
              </button>
              <button
                onClick={handleNext}
                className="text-slate-300 hover:text-white transition-colors p-1"
                title="Next track"
              >
                <SkipForward className="w-4 h-4 fill-slate-300 hover:fill-white" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="hidden sm:flex items-center gap-2 text-slate-400">
              <Volume2 className="w-3.5 h-3.5" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-20 h-1 rounded-lg accent-white bg-slate-800 cursor-pointer"
              />
            </div>

            {/* Platform Outward Link Buttons (Deluxe Saloon style) */}
            <div className="flex items-center gap-2 text-[10px] font-mono ml-auto">
              <a
                href={currentTrack.spotifyUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-full bg-black/60 border border-white/15 text-slate-200 hover:text-white hover:border-white/40 transition-colors flex items-center gap-1 shadow-sm"
              >
                <span>Spotify</span> <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a
                href={currentTrack.ytMusicUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-full bg-black/60 border border-white/15 text-slate-200 hover:text-white hover:border-white/40 transition-colors flex items-center gap-1 shadow-sm"
              >
                <span>YT Music</span> <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

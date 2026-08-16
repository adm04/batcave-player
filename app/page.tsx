'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { track } from '@vercel/analytics';
import { PLAYLISTS } from './data/playlists';
import { Track } from './types/music';
import { Header } from './components/Header';
import { DesktopPlayer } from './components/DesktopPlayer';
import { MobilePlayer } from './components/MobilePlayer';
import { BroadcastMonitor } from './components/BroadcastMonitor';
import { TapeDeck } from './components/TapeDeck';
import { AboutModal } from './components/AboutModal';
import { ArchiveModal } from './components/ArchiveModal';
import { PlaylistModal } from './components/PlaylistModal';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

export default function Home() {
  const [activeDeckMode, setActiveDeckMode] = useState<'broadcast' | 'tape'>('broadcast');

  const [currentPlaylistId, setCurrentPlaylistId] = useState<string>('noir-nights');
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMonitorExpanded, setIsMonitorExpanded] = useState<boolean>(false);

  // Modals
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState<boolean>(false);
  const [isPlaylistsOpen, setIsPlaylistsOpen] = useState<boolean>(false);

  // YouTube Player instance ref
  const playerRef = useRef<any>(null);
  const isApiReadyRef = useRef<boolean>(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentPlaylist = PLAYLISTS.find((p) => p.id === currentPlaylistId) || PLAYLISTS[0];
  const currentTrack: Track = currentPlaylist.tracks[currentTrackIndex] || currentPlaylist.tracks[0];
  const artworkUrl = `https://img.youtube.com/vi/${currentTrack.videoId}/hqdefault.jpg`;

  // Start progress timer
  const startProgressTimer = useCallback(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const time = playerRef.current.getCurrentTime() || 0;
        const dur = playerRef.current.getDuration() || currentTrack.duration || 0;
        setCurrentTime(time);
        if (dur > 0) setDuration(dur);
      }
    }, 1000);
  }, [currentTrack.duration]);

  const stopProgressTimer = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Initialize or load video into YouTube Player
  const loadTrackInPlayer = useCallback((videoId: string, autoPlay: boolean) => {
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      if (autoPlay) {
        playerRef.current.loadVideoById(videoId);
        setIsPlaying(true);
      } else {
        playerRef.current.cueVideoById(videoId);
        setIsPlaying(false);
      }
    }
  }, []);

  // Next Track handler
  const handleNext = useCallback(() => {
    const nextIndex = (currentTrackIndex + 1) % currentPlaylist.tracks.length;
    setCurrentTrackIndex(nextIndex);
    setCurrentTime(0);
    const nextTrack = currentPlaylist.tracks[nextIndex];
    loadTrackInPlayer(nextTrack.videoId, true);
    track('next', { trackId: nextTrack.id, videoId: nextTrack.videoId });
    track('track_change', { trackId: nextTrack.id });
  }, [currentPlaylist.tracks, currentTrackIndex, loadTrackInPlayer]);

  // Previous Track handler
  const handlePrev = useCallback(() => {
    const prevIndex = (currentTrackIndex - 1 + currentPlaylist.tracks.length) % currentPlaylist.tracks.length;
    setCurrentTrackIndex(prevIndex);
    setCurrentTime(0);
    const prevTrack = currentPlaylist.tracks[prevIndex];
    loadTrackInPlayer(prevTrack.videoId, true);
    track('previous', { trackId: prevTrack.id, videoId: prevTrack.videoId });
    track('track_change', { trackId: prevTrack.id });
  }, [currentPlaylist.tracks, currentTrackIndex, loadTrackInPlayer]);

  // Handle YouTube State Change
  const onPlayerStateChange = useCallback(
    (event: any) => {
      const YTState = window.YT.PlayerState;
      if (event.data === YTState.PLAYING) {
        setIsPlaying(true);
        startProgressTimer();
      } else if (event.data === YTState.PAUSED) {
        setIsPlaying(false);
        stopProgressTimer();
      } else if (event.data === YTState.ENDED) {
        setIsPlaying(false);
        stopProgressTimer();
        handleNext();
      }
    },
    [startProgressTimer, stopProgressTimer, handleNext]
  );

  // Handle YouTube Error (Skip track on error)
  const onPlayerError = useCallback(
    (event: any) => {
      console.warn('YouTube Player error code:', event.data);
      track('youtube_error', {
        errorCode: event.data,
        videoId: currentTrack.videoId,
      });
      setTimeout(() => {
        handleNext();
      }, 1000);
    },
    [currentTrack.videoId, handleNext]
  );

  // Instantiate YouTube IFrame Player API
  useEffect(() => {
    const initPlayer = () => {
      if (window.YT && window.YT.Player && !playerRef.current) {
        playerRef.current = new window.YT.Player('youtube-player-container', {
          height: '100%',
          width: '100%',
          videoId: currentTrack.videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            fs: 1,
            origin: typeof window !== 'undefined' ? window.location.origin : '',
          },
          events: {
            onReady: () => {
              isApiReadyRef.current = true;
              if (playerRef.current && playerRef.current.getDuration) {
                setDuration(playerRef.current.getDuration() || currentTrack.duration);
              }
            },
            onStateChange: onPlayerStateChange,
            onError: onPlayerError,
          },
        });
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      stopProgressTimer();
    };
  }, [onPlayerStateChange, onPlayerError, stopProgressTimer, currentTrack.videoId, currentTrack.duration]);

  // Play / Pause toggle
  const handlePlayPause = () => {
    if (!playerRef.current || !isApiReadyRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
      track('pause', { trackId: currentTrack.id });
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
      track('play', { trackId: currentTrack.id, videoId: currentTrack.videoId });
    }
  };

  // Seek bar handler
  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(newTime, true);
    }
  };

  // Switch Playlist handler
  const handleSelectPlaylist = (playlistId: string) => {
    if (playlistId === currentPlaylistId) return;
    setCurrentPlaylistId(playlistId);
    setCurrentTrackIndex(0);
    setCurrentTime(0);

    const targetPlaylist = PLAYLISTS.find((p) => p.id === playlistId) || PLAYLISTS[0];
    const firstTrack = targetPlaylist.tracks[0];
    loadTrackInPlayer(firstTrack.videoId, true);

    track('playlist_change', { playlistId });
    track('track_change', { trackId: firstTrack.id });
  };

  // Direct track select handler from Archive
  const handleSelectTrack = (playlistId: string, trackIdx: number) => {
    setCurrentPlaylistId(playlistId);
    setCurrentTrackIndex(trackIdx);
    setCurrentTime(0);

    const targetPlaylist = PLAYLISTS.find((p) => p.id === playlistId) || PLAYLISTS[0];
    const selectedTrack = targetPlaylist.tracks[trackIdx];
    loadTrackInPlayer(selectedTrack.videoId, true);

    track('track_change', { trackId: selectedTrack.id });
  };

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-between overflow-hidden">
      {/* 1. Fixed Hero Background */}
      <div className="hero-bg -z-20 pointer-events-none" />

      {/* Searchlight Beam sweep effect when active */}
      <div className="sky fixed inset-0 -z-18 pointer-events-none">
        <div className="beam-wrap">
          <div className="beam" />
        </div>
      </div>

      {/* Dark Cinematic Gradient Overlay */}
      <div className="fixed inset-0 -z-15 bg-gradient-to-b from-black/40 via-transparent to-black/85 pointer-events-none" />

      {/* 2. Film / Paper Grain Overlay */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none mix-blend-mode-overlay opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 3. Top Information Row Header */}
      <Header
        listenerCount={1284}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenArchive={() => setIsArchiveOpen(true)}
        onOpenPlaylists={() => setIsPlaylistsOpen(true)}
        currentPlaylistName={currentPlaylist.name}
      />

      {/* Mode Switcher Tabs (Shortwave Broadcast vs Wayne Tape Deck) */}
      <div className="pt-20 sm:pt-24 z-20 flex items-center justify-center gap-2">
        <button
          onClick={() => setActiveDeckMode('broadcast')}
          className={`px-4 py-1.5 rounded-full font-mono text-xs tracking-wider uppercase transition-all cursor-pointer ${
            activeDeckMode === 'broadcast'
              ? 'bg-crimson-bright text-white shadow-lg shadow-crimson/40 font-bold ring-1 ring-white/30'
              : 'bg-black/60 text-slate-400 hover:text-slate-200 border border-white/10'
          }`}
        >
          SHORTWAVE BROADCAST
        </button>
        <button
          onClick={() => setActiveDeckMode('tape')}
          className={`px-4 py-1.5 rounded-full font-mono text-xs tracking-wider uppercase transition-all cursor-pointer ${
            activeDeckMode === 'tape'
              ? 'bg-amber-glow text-slate-950 shadow-lg shadow-amber-glow/40 font-bold ring-1 ring-white/30'
              : 'bg-black/60 text-slate-400 hover:text-slate-200 border border-white/10'
          }`}
        >
          WAYNE Δ-1939 TAPE DECK
        </button>
      </div>

      {/* 4. Center Audio Interface Section */}
      <div className="w-full px-4 pb-8 sm:pb-12 z-20 flex flex-col items-center gap-3 max-w-4xl">
        {activeDeckMode === 'broadcast' ? (
          <>
            {/* Visible YouTube 16:9 Aspect Broadcast Monitor */}
            <BroadcastMonitor
              videoId={currentTrack.videoId}
              isMonitorExpanded={isMonitorExpanded}
              onToggleMonitor={() => setIsMonitorExpanded(!isMonitorExpanded)}
              containerId="youtube-player-container"
            />

            {/* Desktop Music Player */}
            <DesktopPlayer
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              onPlayPause={handlePlayPause}
              onPrev={handlePrev}
              onNext={handleNext}
              onSeek={handleSeek}
              artworkUrl={artworkUrl}
            />

            {/* Mobile Music Player */}
            <MobilePlayer
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              onPlayPause={handlePlayPause}
              onPrev={handlePrev}
              onNext={handleNext}
              onSeek={handleSeek}
              artworkUrl={artworkUrl}
            />
          </>
        ) : (
          /* Wayne Acoustics Δ-1939 Tape Deck */
          <TapeDeck />
        )}
      </div>

      {/* Modals */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <ArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        playlists={PLAYLISTS}
        onSelectTrack={handleSelectTrack}
        currentTrackId={currentTrack.id}
      />

      <PlaylistModal
        isOpen={isPlaylistsOpen}
        onClose={() => setIsPlaylistsOpen(false)}
        playlists={PLAYLISTS}
        currentPlaylistId={currentPlaylistId}
        onSelectPlaylist={handleSelectPlaylist}
      />
    </main>
  );
}

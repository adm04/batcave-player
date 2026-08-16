'use client';

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DesktopPlayer } from './components/DesktopPlayer';
import { TapeDeck } from './components/TapeDeck';
import { AboutModal } from './components/AboutModal';
import { ArchiveModal } from './components/ArchiveModal';
import { PlaylistModal } from './components/PlaylistModal';
import { PLAYLISTS } from './data/playlists';

export default function Home() {
  const basePath = process.env.NODE_ENV === 'production' ? '/batcave-player' : '';
  const [bgUrl, setBgUrl] = useState<string>(`${basePath}/bg/scene-wide.png`);

  // Modals state
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState<boolean>(false);
  const [isPlaylistsOpen, setIsPlaylistsOpen] = useState<boolean>(false);
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string>('noir-nights');

  const currentPlaylist = PLAYLISTS.find((p) => p.id === currentPlaylistId) || PLAYLISTS[0];

  // Responsive background image handler (landscape vs portrait)
  useEffect(() => {
    const updateBg = () => {
      if (window.innerWidth < 768 || window.matchMedia('(orientation: portrait)').matches) {
        setBgUrl(`${basePath}/bg/scene-tall.png`);
      } else {
        setBgUrl(`${basePath}/bg/scene-wide.png`);
      }
    };

    updateBg();
    window.addEventListener('resize', updateBg);
    window.addEventListener('orientationchange', updateBg);
    return () => {
      window.removeEventListener('resize', updateBg);
      window.removeEventListener('orientationchange', updateBg);
    };
  }, [basePath]);

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-end p-4 pb-4 overflow-x-hidden bg-charcoal text-slate-100 antialiased">
      {/* 1. Immersive Hero Background (Deluxe Saloon style) */}
      <div
        className="hero-bg -z-20 pointer-events-none"
        style={{ backgroundImage: `url('${bgUrl}')` }}
      />

      {/* Searchlight Beam sweep effect */}
      <div className="sky fixed inset-0 -z-18 pointer-events-none">
        <div className="beam-wrap">
          <div className="beam" />
        </div>
      </div>

      {/* Dark Cinematic Gradient Overlay */}
      <div className="fixed inset-0 -z-15 bg-gradient-to-b from-black/60 via-transparent to-black/95 pointer-events-none" />

      {/* 2. Pulp Film / Paper Grain Overlay */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none mix-blend-mode-overlay opacity-25"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 3. Top Control Groups Header (Exact 1-to-1 Deluxe Saloon Layout) */}
      <Header
        listenerCount={605}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenArchive={() => setIsArchiveOpen(true)}
        onOpenPlaylists={() => setIsPlaylistsOpen(true)}
        currentPlaylistName={currentPlaylist.name}
      />

      {/* 4. Bottom Main Content Area: Deluxe Saloon Player & Resized Skeuomorphic Tape Deck */}
      <div className="w-full px-2 sm:px-4 pt-28 sm:pt-36 pb-3 z-20 flex flex-col items-center justify-end gap-6 max-w-xl mx-auto">
        {/* Main Floating Deluxe Saloon Audio Player */}
        <DesktopPlayer />

        {/* Resized Compact Wayne Acoustics Δ-1939 Skeuomorphic Tape Recorder at the end */}
        <TapeDeck />
      </div>

      {/* Centered Footer */}
      <footer className="text-center font-mono text-[10px] tracking-wider text-slate-400/80 z-20 pb-1">
        contact: deluxesaloon.space@gmail.com
      </footer>

      {/* Atmospheric Modals */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <ArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        playlists={PLAYLISTS}
        onSelectTrack={() => {}}
        currentTrackId="track-1"
      />

      <PlaylistModal
        isOpen={isPlaylistsOpen}
        onClose={() => setIsPlaylistsOpen(false)}
        playlists={PLAYLISTS}
        currentPlaylistId={currentPlaylistId}
        onSelectPlaylist={(id) => setCurrentPlaylistId(id)}
      />
    </main>
  );
}

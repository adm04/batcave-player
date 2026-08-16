'use client';

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
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
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-center p-4 sm:p-6 overflow-x-hidden bg-charcoal text-slate-100 antialiased">
      {/* 1. Immersive Hero Background */}
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
      <div className="fixed inset-0 -z-15 bg-gradient-to-b from-black/50 via-transparent to-black/90 pointer-events-none" />

      {/* 2. Pulp Film / Paper Grain Overlay */}
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

      {/* High Contrast Header Container */}
      <div className="pt-20 sm:pt-24 pb-4 px-4 text-center z-10 pointer-events-none">
        <div className="max-w-md mx-auto space-y-1 bg-black/60 p-3.5 sm:p-4 rounded-2xl border border-white/15 backdrop-blur-md shadow-2xl pointer-events-auto">
          <p className="font-mono text-[10px] sm:text-xs tracking-[0.35em] uppercase text-amber-glow font-bold drop-shadow">
            GOTHAM SHORTWAVE TRANSMISSION // 1939
          </p>
          <h1 className="font-mono text-xl sm:text-3xl font-extrabold tracking-widest text-slate-100 uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            BATCAVE TAPE DECK
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-sans italic drop-shadow">
            "A solitary vigilante shortwave tape deck, running live"
          </p>
        </div>
      </div>

      {/* 4. Perfectly Centered Centerpiece Retro Tape Deck */}
      <div className="w-full px-2 sm:px-4 pb-8 z-20 flex flex-col items-center justify-center max-w-xl mx-auto my-auto">
        <TapeDeck />
      </div>

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

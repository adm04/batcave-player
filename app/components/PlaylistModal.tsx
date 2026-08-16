'use client';

import React from 'react';
import { X, ListMusic, Radio } from 'lucide-react';
import { Playlist } from '../types/music';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
  currentPlaylistId: string;
  onSelectPlaylist: (playlistId: string) => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({
  isOpen,
  onClose,
  playlists,
  currentPlaylistId,
  onSelectPlaylist,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 rounded-3xl noir-glass border border-white/20 text-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-crimson/30 border border-crimson-bright/40 text-crimson-bright">
              <ListMusic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-mono text-sm tracking-widest text-slate-100 uppercase font-bold">
                SELECT TRANSMISSION CHANNEL
              </h2>
              <p className="text-xs font-mono text-slate-400">ATMOSPHERIC BROADCAST CHANNELS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Playlist Selector Buttons */}
        <div className="space-y-3">
          {playlists.map((playlist) => {
            const isSelected = playlist.id === currentPlaylistId;
            return (
              <button
                key={playlist.id}
                onClick={() => {
                  onSelectPlaylist(playlist.id);
                  onClose();
                }}
                className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-r from-crimson/40 to-maroon/40 border-crimson-bright shadow-lg shadow-crimson/30'
                    : 'bg-black/40 border-white/10 hover:border-white/25 hover:bg-white/5'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 font-mono text-[10px] text-crimson-bright font-bold">
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span>ACTIVE</span>
                  </div>
                )}
                <h3 className="font-mono text-sm font-bold text-slate-100 tracking-widest uppercase">
                  {playlist.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">{playlist.tagline}</p>
                <p className="text-[10px] font-mono text-amber-glow/80 mt-2">
                  {playlist.tracks.length} TRANSMISSIONS IN CHANNEL
                </p>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 font-mono text-xs tracking-wider transition-all cursor-pointer"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

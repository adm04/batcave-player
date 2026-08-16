'use client';

import React from 'react';
import { X, Disc, Calendar, Film } from 'lucide-react';
import { Playlist } from '../types/music';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
  onSelectTrack: (playlistId: string, trackIndex: number) => void;
  currentTrackId: string;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  onClose,
  playlists,
  onSelectTrack,
  currentTrackId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl noir-glass border border-white/20 text-slate-200 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-glow/20 border border-amber-glow/40 text-amber-glow">
              <Disc className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-mono text-sm tracking-widest text-slate-100 uppercase font-bold">
                BROADCAST ARCHIVE LOGS
              </h2>
              <p className="text-xs font-mono text-slate-400">HISTORICAL TRANSMISSIONS (1938–1948)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Playlists & Tracks List */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="space-y-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <h3 className="font-mono text-xs font-semibold text-amber-glow tracking-widest uppercase">
                  {playlist.name}
                </h3>
                <span className="text-[10px] font-mono text-slate-400">{playlist.tagline}</span>
              </div>

              <div className="space-y-1.5">
                {playlist.tracks.map((track, idx) => {
                  const isCurrent = track.id === currentTrackId;
                  return (
                    <button
                      key={track.id}
                      onClick={() => {
                        onSelectTrack(playlist.id, idx);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-crimson/30 border-crimson-bright text-white shadow-md'
                          : 'bg-black/30 border-white/5 hover:border-white/20 hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs text-slate-500 w-5">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="truncate">
                          <p className={`text-xs font-medium truncate ${isCurrent ? 'text-white' : 'text-slate-200'}`}>
                            {track.title}
                          </p>
                          <p className="text-[11px] text-white/60 truncate">{track.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 flex-shrink-0">
                        {track.film && (
                          <span className="hidden sm:inline-flex items-center gap-1">
                            <Film className="w-3 h-3 text-slate-500" />
                            {track.film}
                          </span>
                        )}
                        {track.year && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {track.year}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 font-mono text-xs tracking-wider transition-all cursor-pointer"
          >
            RETURN TO BROADCAST
          </button>
        </div>
      </div>
    </div>
  );
};

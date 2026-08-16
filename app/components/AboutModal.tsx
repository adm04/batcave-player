'use client';

import React from 'react';
import { X, Radio, Shield, Moon } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl noir-glass border border-white/20 text-slate-200 shadow-2xl overflow-hidden">
        {/* Decorative corner light */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-crimson-bright/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-crimson/30 border border-crimson-bright/40 text-crimson-bright">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-mono text-sm tracking-widest text-slate-100 uppercase font-bold">
                STATION OVERVIEW // 1942
              </h2>
              <p className="text-xs font-mono text-amber-glow/80">SHORTWAVE FREQUENCY 88.4 MHz</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs font-sans text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <p className="italic text-slate-200 border-l-2 border-crimson-bright pl-3 py-0.5">
            "A forgotten late-night transmission broadcasting from a lonely cavern cavernous height, high above the art-deco towers of Gotham."
          </p>

          <p>
            You are listening to an unlisted shortwave channel operating past midnight. Far below, the gargoyles stand silent in the crimson dusk, rain slicks the pavement, and the solitary cape watches over a sleeping metropolis.
          </p>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 font-mono text-[11px]">
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="w-4 h-4 text-crimson-bright" />
              <span>STATION IDENTITY: ANONYMOUS VIGILANTE BROADCAST</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Moon className="w-4 h-4 text-amber-glow" />
              <span>BROADCAST TIME: 00:00 - 05:00 IST</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-white/10">
            AUDIO ENGINE: ENCRYPTED SHORTWAVE // YOUTUBE EMBED IFRAME
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-crimson-bright hover:bg-crimson text-white font-mono text-xs tracking-wider transition-all cursor-pointer shadow-lg shadow-crimson/30"
          >
            CLOSE TRANSMISSION
          </button>
        </div>
      </div>
    </div>
  );
};

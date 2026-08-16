'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, Power, Upload, Volume2 } from 'lucide-react';

interface TapeItem {
  id: string;
  name: string;
  cat: string;
  type?: 'synth' | 'file';
  url?: string;
  gen?: () => () => void;
}

export const TapeDeck: React.FC = () => {
  const [powered, setPowered] = useState<boolean>(false);
  const [playing, setPlaying] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('STANDBY');
  const [counterValue, setCounterValue] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.7);

  // Audio Context & Synth refs
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<any>(null);
  const stopFnRef = useRef<(() => void) | null>(null);
  const mediaElRef = useRef<HTMLAudioElement | null>(null);
  const counterIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  // Dragging volume ref
  const volKnobRef = useRef<HTMLDivElement>(null);
  const isDraggingVolRef = useRef<boolean>(false);
  const startYRef = useRef<number>(0);
  const startVolRef = useRef<number>(0.7);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Equalizer DOM refs
  const eqContainerRef = useRef<HTMLDivElement>(null);

  // Built-in Synthesized Cassettes
  const getEnsureCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const masterGain = ctx.createGain();
      masterGain.gain.value = volume;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;

      masterGain.connect(analyser);
      analyser.connect(ctx.destination);

      ctxRef.current = ctx;
      masterGainRef.current = masterGain;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return { ctx: ctxRef.current, masterGain: masterGainRef.current };
  }, [volume]);

  // Rain Ambient Generator
  const genRain = useCallback(() => {
    const { ctx, masterGain } = getEnsureCtx();
    if (!ctx || !masterGain) return () => {};

    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 0.6;

    const gain = ctx.createGain();
    gain.gain.value = 0.5;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start();

    const thunderTimer = setInterval(() => {
      if (Math.random() < 0.35 && ctx.state === 'running') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 45 + Math.random() * 20;
        const tg = ctx.createGain();
        tg.gain.value = 0;
        osc.connect(tg);
        tg.connect(masterGain);
        const t = ctx.currentTime;
        tg.gain.linearRampToValueAtTime(0.25, t + 1.2);
        tg.gain.linearRampToValueAtTime(0, t + 4);
        osc.start(t);
        osc.stop(t + 4.2);
      }
    }, 3500);

    return () => {
      clearInterval(thunderTimer);
      try {
        noise.stop();
        noise.disconnect();
        filter.disconnect();
        gain.disconnect();
      } catch (e) {}
    };
  }, [getEnsureCtx]);

  // Batcave Hum Generator
  const genHum = useCallback(() => {
    const { ctx, masterGain } = getEnsureCtx();
    if (!ctx || !masterGain) return () => {};

    const t = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 55;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 58.5;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 120;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = ctx.createGain();
    gain.gain.value = 0.35;

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    osc1.start(t);
    osc2.start(t);
    lfo.start(t);

    const dripTimer = setInterval(() => {
      if (Math.random() < 0.4 && ctx.state === 'running') {
        const d = ctx.createOscillator();
        d.type = 'sine';
        d.frequency.setValueAtTime(1200 + Math.random() * 400, ctx.currentTime);
        d.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.25);
        const dg = ctx.createGain();
        dg.gain.value = 0.15;
        d.connect(dg);
        dg.connect(masterGain);
        dg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        d.start();
        d.stop(ctx.currentTime + 0.32);
      }
    }, 2200);

    return () => {
      clearInterval(dripTimer);
      try {
        osc1.stop();
        osc2.stop();
        lfo.stop();
        osc1.disconnect();
        osc2.disconnect();
        filter.disconnect();
        gain.disconnect();
      } catch (e) {}
    };
  }, [getEnsureCtx]);

  // Night Patrol Synth Generator
  const genSynth = useCallback(() => {
    const { ctx, masterGain } = getEnsureCtx();
    if (!ctx || !masterGain) return () => {};

    const bassOsc = ctx.createOscillator();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.value = 55;
    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.value = 220;
    const bassGain = ctx.createGain();
    bassGain.gain.value = 0.25;
    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(masterGain);
    bassOsc.start();

    const delay = ctx.createDelay();
    delay.delayTime.value = 0.32;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    delay.connect(feedback);
    feedback.connect(delay);
    const delayOut = ctx.createGain();
    delayOut.gain.value = 0.5;
    delay.connect(delayOut);
    delayOut.connect(masterGain);

    const scale = [220, 261.6, 293.7, 329.6, 392, 440];
    let step = 0;
    const arpGain = ctx.createGain();
    arpGain.gain.value = 0.16;
    arpGain.connect(masterGain);
    arpGain.connect(delay);

    const arpTimer = setInterval(() => {
      if (ctx.state === 'running') {
        const freq = scale[step % scale.length] * (step % 8 < 4 ? 1 : 2);
        step++;
        const o = ctx.createOscillator();
        o.type = 'square';
        o.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.value = 0;
        o.connect(g);
        g.connect(arpGain);
        const t = ctx.currentTime;
        g.gain.linearRampToValueAtTime(0.5, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        o.start(t);
        o.stop(t + 0.3);
      }
    }, 260);

    return () => {
      clearInterval(arpTimer);
      try {
        bassOsc.stop();
        bassOsc.disconnect();
        bassFilter.disconnect();
        bassGain.disconnect();
        delay.disconnect();
        feedback.disconnect();
        delayOut.disconnect();
        arpGain.disconnect();
      } catch (e) {}
    };
  }, [getEnsureCtx]);

  const [playlist, setPlaylist] = useState<TapeItem[]>([
    { id: 'rain', name: 'Gotham Rain', cat: 'SIDE A · AMBIENT', gen: genRain },
    { id: 'hum', name: 'Batcave Hum', cat: 'SIDE A · DRONE', gen: genHum },
    { id: 'synth', name: 'Night Patrol Synth', cat: 'SIDE B · SYNTH', gen: genSynth },
  ]);

  const currentTape = playlist[currentIndex] || playlist[0];

  // Stop active sources
  const stopCurrentSource = useCallback(() => {
    if (stopFnRef.current) {
      try {
        stopFnRef.current();
      } catch (e) {}
      stopFnRef.current = null;
    }
    if (mediaElRef.current) {
      mediaElRef.current.pause();
      mediaElRef.current.src = '';
      mediaElRef.current = null;
    }
  }, []);

  const stopCounter = useCallback(() => {
    if (counterIntervalRef.current) {
      clearInterval(counterIntervalRef.current);
      counterIntervalRef.current = null;
    }
  }, []);

  const startCounter = useCallback(() => {
    stopCounter();
    counterIntervalRef.current = setInterval(() => {
      setCounterValue((prev) => (prev + 1) % 10000);
    }, 1000);
  }, [stopCounter]);

  // EQ Animation Tick
  const startEQ = useCallback(() => {
    if (rafRef.current) return;
    const tick = () => {
      if (analyserRef.current && dataArrayRef.current && eqContainerRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const bars = eqContainerRef.current.children;
        for (let i = 0; i < bars.length; i++) {
          const val = dataArrayRef.current[i % dataArrayRef.current.length] / 255;
          (bars[i] as HTMLElement).style.height = `${Math.max(6, val * 100)}%`;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopEQ = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (eqContainerRef.current) {
      const bars = eqContainerRef.current.children;
      for (let i = 0; i < bars.length; i++) {
        (bars[i] as HTMLElement).style.height = '6%';
      }
    }
  }, []);

  const pausePlayback = useCallback(() => {
    if (mediaElRef.current) mediaElRef.current.pause();
    setPlaying(false);
    setStatusText(powered ? 'PAUSED' : 'STANDBY');
    stopCounter();
    stopEQ();
  }, [powered, stopCounter, stopEQ]);

  const startPlayback = useCallback(() => {
    if (!powered) return;
    const { ctx, masterGain } = getEnsureCtx();
    if (!ctx || !masterGain) return;

    const tape = playlist[currentIndex];
    if (tape.type === 'file' && tape.url) {
      if (!mediaElRef.current) {
        mediaElRef.current = new Audio(tape.url);
        mediaElRef.current.loop = true;
        const src = ctx.createMediaElementSource(mediaElRef.current);
        src.connect(masterGain);
      }
      mediaElRef.current.play();
    } else if (tape.gen) {
      if (!stopFnRef.current) {
        stopFnRef.current = tape.gen();
      }
    }
    setPlaying(true);
    setStatusText('PLAYING');
    startCounter();
    startEQ();
  }, [powered, getEnsureCtx, playlist, currentIndex, startCounter, startEQ]);

  const stopPlayback = useCallback(() => {
    stopCurrentSource();
    pausePlayback();
    setCounterValue(0);
    setStatusText(powered ? 'STOPPED' : 'STANDBY');
  }, [stopCurrentSource, pausePlayback, powered]);

  const loadTrack = useCallback(
    (index: number, autoPlay: boolean) => {
      stopCurrentSource();
      const newIdx = ((index % playlist.length) + playlist.length) % playlist.length;
      setCurrentIndex(newIdx);
      setCounterValue(0);
      if (autoPlay && powered) {
        setTimeout(() => {
          startPlayback();
        }, 50);
      } else {
        pausePlayback();
      }
    },
    [playlist.length, stopCurrentSource, powered, startPlayback, pausePlayback]
  );

  // Power Toggle
  const togglePower = () => {
    const nextPower = !powered;
    setPowered(nextPower);
    if (nextPower) {
      getEnsureCtx();
      setStatusText('BOOTING…');
      setTimeout(() => {
        setStatusText('STANDBY');
      }, 550);
    } else {
      stopPlayback();
      setStatusText('STANDBY');
      if (ctxRef.current && ctxRef.current.state === 'running') {
        ctxRef.current.suspend();
      }
    }
  };

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newTapes: TapeItem[] = files.map((file) => ({
      id: `up-${Date.now()}-${Math.random()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      cat: 'SIDE A · YOUR TAPE',
      type: 'file',
      url: URL.createObjectURL(file),
    }));

    setPlaylist((prev) => [...prev, ...newTapes]);
    setCurrentIndex(playlist.length); // target first newly uploaded tape
    if (!powered) setPowered(true);
    setTimeout(() => {
      loadTrack(playlist.length, true);
    }, 100);
    e.target.value = '';
  };

  // Volume knob drag handler
  const handlePointerDownVol = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingVolRef.current = true;
    startYRef.current = e.clientY;
    startVolRef.current = volume;
    if (volKnobRef.current) {
      volKnobRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMoveVol = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingVolRef.current) return;
    const delta = (startYRef.current - e.clientY) / 120;
    const newVol = Math.min(1, Math.max(0, startVolRef.current + delta));
    setVolume(newVol);
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = newVol;
    }
  };

  const handlePointerUpVol = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingVolRef.current = false;
  };

  const volAngle = -135 + volume * 270;

  return (
    <div className="w-full max-w-[560px] mx-auto my-6 flex flex-col items-center gap-5 text-slate-100 font-sans select-none">
      {/* Brand Header */}
      <div className="text-center">
        <div className="font-mono text-[11px] tracking-[0.35em] text-slate-400 uppercase">
          WAYNE ACOUSTICS · EST. 1939
        </div>
        <h2 className="font-mono text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-slate-100 mt-1">
          BATCAVE <span className="text-amber-glow">TAPE</span> DECK
        </h2>
      </div>

      {/* Main Deck Container */}
      <div
        className={`w-full rounded-3xl p-5 sm:p-6 shadow-2xl relative border border-white/10 transition-all duration-300 ${
          powered ? 'bg-slate-950/90' : 'bg-slate-950/70'
        } noir-glass`}
      >
        {/* Deck Top Plate & Power Switch */}
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[10px] tracking-widest text-slate-400 uppercase">
            MODEL <b className="text-amber-glow/90 font-bold">Δ-1939</b>
            <br />
            SERIAL GC-0417
          </div>

          <div className="flex items-center gap-3">
            {/* LED indicator */}
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                powered
                  ? 'bg-amber-glow shadow-[0_0_10px_2px_rgba(255,179,71,0.85)]'
                  : 'bg-crimson-bright opacity-40 animate-pulse'
              }`}
            />

            {/* Toggle switch */}
            <button
              onClick={togglePower}
              title="Power Toggle"
              className="w-13 h-7 rounded-lg bg-black border border-white/20 p-0.5 relative cursor-pointer shadow-inner"
            >
              <div
                className={`w-5 h-5 rounded-md transition-all duration-200 ${
                  powered
                    ? 'translate-x-6 bg-gradient-to-b from-amber-glow to-amber-600 shadow-md'
                    : 'translate-x-0 bg-gradient-to-b from-slate-700 to-slate-900'
                }`}
              />
            </button>
            <span className="font-mono text-[9px] tracking-widest text-slate-400 uppercase">
              POWER
            </span>
          </div>
        </div>

        {/* LCD Screen Display */}
        <div
          className={`rounded-xl p-3.5 bg-black/90 border border-white/10 shadow-inner relative overflow-hidden transition-all duration-500 ${
            powered ? 'brightness-100 saturate-100' : 'brightness-40 saturate-30'
          }`}
        >
          <div className="flex justify-between items-baseline font-mono text-[10px] tracking-widest text-lime-400 uppercase mb-1">
            <span>{statusText}</span>
            <span>GTH · 91.9</span>
          </div>

          {/* Track Title Display */}
          <div className="h-6 overflow-hidden mb-2">
            <span className="font-mono text-base font-bold text-amber-glow uppercase tracking-wider drop-shadow-[0_0_6px_rgba(255,183,3,0.5)]">
              {currentTape ? currentTape.name : '—'}
            </span>
          </div>

          {/* Equalizer Bars */}
          <div ref={eqContainerRef} className="flex items-end gap-[3px] h-8 mb-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <i
                key={i}
                className="flex-1 bg-gradient-to-t from-amber-700 to-amber-glow rounded-t-[1px] transition-all duration-75 shadow-[0_0_4px_rgba(255,183,3,0.35)]"
                style={{ height: '6%' }}
              />
            ))}
          </div>

          {/* Tape Counter */}
          <div className="flex justify-between items-center font-mono text-[10px] text-lime-600 tracking-wider">
            <span>TAPE COUNTER</span>
            <span className="bg-black px-2 py-0.5 rounded text-amber-glow text-xs font-bold border border-white/10 shadow-inner">
              {String(counterValue).padStart(4, '0')}
            </span>
          </div>
        </div>

        {/* Cassette Window */}
        <div className="mt-4 bg-slate-950/90 rounded-2xl p-4 border border-white/10 shadow-inner relative">
          <div
            className={`rounded-xl p-4 transition-all duration-300 relative border border-black/20 ${
              powered
                ? 'bg-gradient-to-b from-[#d6cfae] to-[#bfb68f] opacity-100 grayscale-0'
                : 'bg-slate-800 opacity-40 grayscale'
            }`}
          >
            {/* Screws */}
            <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-slate-700" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-slate-700" />
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-slate-700" />
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-slate-700" />

            {/* Cassette Label */}
            <div className="bg-amber-50 border-2 border-slate-900 rounded p-2 text-center mb-3">
              <div className="font-mono text-[8px] tracking-widest text-slate-600">
                {currentTape ? currentTape.cat : 'SIDE A · GOTHAM FM'}
              </div>
              <div className="font-mono text-sm font-bold text-slate-900 uppercase truncate">
                {currentTape ? currentTape.name : 'Select a tape'}
              </div>
            </div>

            {/* Revolving Reels */}
            <div className="flex justify-between items-center px-4">
              <div
                className={`w-14 h-14 rounded-full border-2 border-black/40 flex items-center justify-center bg-slate-900 shadow-md ${
                  playing && powered ? 'animate-spin-running' : 'animate-spin-paused'
                }`}
              >
                <div className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-black ring-1 ring-white/30" />
                </div>
              </div>

              <div
                className={`w-14 h-14 rounded-full border-2 border-black/40 flex items-center justify-center bg-slate-900 shadow-md ${
                  playing && powered ? 'animate-spin-running' : 'animate-spin-paused'
                }`}
              >
                <div className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-black ring-1 ring-white/30" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => loadTrack(currentIndex - 1, true)}
            title="Previous Tape"
            className="w-12 h-11 rounded-lg bg-gradient-to-b from-slate-800 to-slate-950 border border-white/10 flex items-center justify-center text-slate-200 hover:text-white active:translate-y-0.5 transition-all cursor-pointer shadow-md"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={stopPlayback}
            title="Stop"
            className="w-12 h-11 rounded-lg bg-gradient-to-b from-slate-800 to-slate-950 border border-white/10 flex items-center justify-center text-slate-200 hover:text-white active:translate-y-0.5 transition-all cursor-pointer shadow-md"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={() => {
              if (!powered) togglePower();
              if (playing) pausePlayback();
              else startPlayback();
            }}
            title={playing ? 'Pause' : 'Play'}
            className="w-16 h-12 rounded-lg bg-gradient-to-b from-amber-glow to-amber-600 border border-amber-400 flex items-center justify-center text-slate-950 active:translate-y-0.5 transition-all cursor-pointer shadow-lg shadow-amber-glow/20"
          >
            {playing ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => loadTrack(currentIndex + 1, true)}
            title="Next Tape"
            className="w-12 h-11 rounded-lg bg-gradient-to-b from-slate-800 to-slate-950 border border-white/10 flex items-center justify-center text-slate-200 hover:text-white active:translate-y-0.5 transition-all cursor-pointer shadow-md"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Lower Control Bar: Volume & File Upload */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
          {/* Rotary Volume Knob */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <div className="flex flex-col items-center">
              <div
                ref={volKnobRef}
                onPointerDown={handlePointerDownVol}
                onPointerMove={handlePointerMoveVol}
                onPointerUp={handlePointerUpVol}
                onPointerCancel={handlePointerUpVol}
                title="Rotate to adjust Volume"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 via-slate-900 to-black border border-white/20 shadow-md relative cursor-pointer touch-none"
              >
                <div
                  className="absolute top-1 left-1/2 w-0.5 h-2.5 bg-amber-glow rounded-full -translate-x-1/2 origin-[1px_16px] transition-transform duration-75"
                  style={{ transform: `translateX(-50%) rotate(${volAngle}deg)` }}
                />
              </div>
              <span className="font-mono text-[9px] tracking-widest text-slate-400 uppercase mt-1">
                VOL {Math.round(volume * 100)}%
              </span>
            </div>
          </div>

          {/* Insert Tape Upload */}
          <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/15 bg-black/40 hover:bg-white/10 text-slate-300 hover:text-amber-glow font-mono text-xs tracking-wider transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>INSERT TAPE</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Physical Tape Shelf */}
      <div className="w-full">
        <div className="font-mono text-[10px] tracking-widest text-slate-400 uppercase mb-2">
          TAPE SHELF
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {playlist.map((t, i) => {
            const isActive = i === currentIndex;
            return (
              <button
                key={t.id}
                onClick={() => {
                  if (!powered) togglePower();
                  loadTrack(i, true);
                }}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-100/90 border-amber-glow text-slate-950 font-bold shadow-lg shadow-amber-glow/20 scale-[1.02]'
                    : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-white/25 hover:bg-slate-800'
                }`}
              >
                <div className="font-mono text-[8px] tracking-widest opacity-75">{t.cat}</div>
                <div className="font-mono text-xs uppercase truncate mt-0.5">{t.name}</div>
                <div className="flex gap-1.5 mt-2">
                  <span className="w-3 h-3 rounded-full bg-slate-950 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-slate-950 inline-block" />
                </div>
              </button>
            );
          })}

          {/* Upload card button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl text-center border border-dashed border-white/20 text-slate-400 hover:text-amber-glow hover:border-amber-glow/60 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 min-h-[78px]"
          >
            <span className="text-lg font-bold">+</span>
            <span className="font-mono text-[9px] tracking-widest uppercase">INSERT TAPE</span>
          </button>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward } from 'lucide-react';

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

  // Equalizer DOM ref
  const eqContainerRef = useRef<HTMLDivElement>(null);

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
    if (typeof document !== 'undefined') {
      document.body.classList.remove('playing');
    }
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
    if (typeof document !== 'undefined') {
      document.body.classList.add('playing');
    }
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

  const togglePower = () => {
    const nextPower = !powered;
    setPowered(nextPower);
    if (typeof document !== 'undefined') {
      if (nextPower) {
        document.body.classList.add('powered');
      } else {
        document.body.classList.remove('powered');
        document.body.classList.remove('playing');
      }
    }
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
    setCurrentIndex(playlist.length);
    if (!powered) togglePower();
    setTimeout(() => {
      loadTrack(playlist.length, true);
    }, 100);
    e.target.value = '';
  };

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

  const handlePointerUpVol = () => {
    isDraggingVolRef.current = false;
  };

  const volAngle = -135 + volume * 270;

  return (
    <div className="rig">
      <div className="brandline">
        <div className="kicker">Wayne Acoustics · Est. 1939</div>
        <h1>
          Batcave <span>Tape</span> Deck
        </h1>
      </div>

      <div className="deck">
        <div className="deck-top">
          <div className="plate">
            MODEL <b>Δ-1939</b>
            <br />
            SERIAL GC-0417
          </div>
          <div className="switch-unit">
            <div>
              <div
                className="toggle"
                onClick={togglePower}
                role="switch"
                aria-checked={powered}
                aria-label="Power"
              >
                <div className="knob" />
              </div>
              <div className="toggle-label">Power</div>
            </div>
            <div className="led" id="led" />
          </div>
        </div>

        <div className="screen">
          <div className="screen-row1">
            <span>{statusText}</span>
            <span>GTH · 91.9</span>
          </div>
          <div className="track-title">
            <span>{currentTape ? currentTape.name.toUpperCase() : '—'}</span>
          </div>
          <div className="eq" ref={eqContainerRef}>
            {Array.from({ length: 24 }).map((_, i) => (
              <i key={i} style={{ height: '6%' }} />
            ))}
          </div>
          <div className="counter-row">
            <span>TAPE COUNTER</span>
            <span className="counter">{String(counterValue).padStart(4, '0')}</span>
          </div>
        </div>

        <div className="cassette-window">
          <div className="tape-body">
            <div className="screws s1" />
            <div className="screws s2" />
            <div className="screws s3" />
            <div className="screws s4" />
            <div className="tape-label">
              <div className="cat">{currentTape ? currentTape.cat : 'SIDE A · GOTHAM FM'}</div>
              <div className="name">{currentTape ? currentTape.name : 'Select a tape'}</div>
            </div>
            <div className="reels">
              <div className="reel">
                <svg viewBox="0 0 56 56">
                  <g fill="none" stroke="#6b6b60" strokeWidth="2">
                    <circle cx="28" cy="28" r="15" />
                    <line x1="28" y1="13" x2="28" y2="43" />
                    <line x1="13" y1="28" x2="43" y2="28" />
                    <line x1="17.6" y1="17.6" x2="38.4" y2="38.4" />
                    <line x1="17.6" y1="38.4" x2="38.4" y2="17.6" />
                  </g>
                </svg>
              </div>
              <div className="reel">
                <svg viewBox="0 0 56 56">
                  <g fill="none" stroke="#6b6b60" strokeWidth="2">
                    <circle cx="28" cy="28" r="15" />
                    <line x1="28" y1="13" x2="28" y2="43" />
                    <line x1="13" y1="28" x2="43" y2="28" />
                    <line x1="17.6" y1="17.6" x2="38.4" y2="38.4" />
                    <line x1="17.6" y1="38.4" x2="38.4" y2="17.6" />
                  </g>
                </svg>
              </div>
            </div>
            <div className="tape-window-strip" />
          </div>
        </div>

        <div className="transport">
          <button className="tbtn" onClick={() => loadTrack(currentIndex - 1, true)} title="Previous tape">
            <SkipBack />
          </button>
          <button className="tbtn" onClick={stopPlayback} title="Stop">
            <Square />
          </button>
          <button
            className="tbtn play"
            onClick={() => {
              if (!powered) togglePower();
              if (playing) pausePlayback();
              else startPlayback();
            }}
            title="Play/Pause"
          >
            {playing ? <Pause /> : <Play />}
          </button>
          <button className="tbtn" onClick={() => loadTrack(currentIndex + 1, true)} title="Next tape">
            <SkipForward />
          </button>
        </div>

        <div className="lowerbar">
          <div className="vol-unit">
            <span className="vol-label">VOL</span>
            <div className="knob-wrap">
              <div
                className="knob"
                ref={volKnobRef}
                onPointerDown={handlePointerDownVol}
                onPointerMove={handlePointerMoveVol}
                onPointerUp={handlePointerUpVol}
                onPointerCancel={handlePointerUpVol}
              >
                <div className="tick" style={{ transform: `translateX(-50%) rotate(${volAngle}deg)` }} />
              </div>
            </div>
          </div>
          <label className="eject">
            ▵ Insert tape
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="shelf">
        <div className="shelf-label">Tape shelf</div>
        <div className="shelf-row">
          {playlist.map((t, i) => (
            <div
              key={t.id}
              className={`tape-card ${i === currentIndex ? 'active' : ''}`}
              onClick={() => {
                if (!powered) togglePower();
                loadTrack(i, true);
              }}
            >
              <div className="cat">{t.cat}</div>
              <div className="name">{t.name}</div>
              <div className="reel-mini">
                <i />
                <i />
              </div>
            </div>
          ))}
          <label className="tape-card upload" onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}>
            <div className="plus">+</div>
            <span>Insert tape</span>
          </label>
        </div>
      </div>
    </div>
  );
};

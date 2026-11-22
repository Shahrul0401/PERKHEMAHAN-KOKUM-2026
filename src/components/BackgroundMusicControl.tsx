import React, { useEffect, useRef, useState } from 'react';
import {
  Music,
  Pause,
  Play,
  Upload,
  Volume2,
  VolumeX,
  X,
  Radio,
  Link2,
  Trash2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export type BuiltInTrackId = 'CAMP_SPIRIT' | 'CAMPFIRE_NIGHT' | 'EXPLORACE_MARCH' | 'CUSTOM';

interface TrackOption {
  id: BuiltInTrackId;
  title: string;
  subtitle: string;
}

const TRACK_OPTIONS: TrackOption[] = [
  {
    id: 'CAMP_SPIRIT',
    title: 'Melodi Semangat Perkhemahan',
    subtitle: 'Instrumental akustik ceria & harmoni (Terbina Dalam)',
  },
  {
    id: 'CAMPFIRE_NIGHT',
    title: 'Malam Unggun Api & Rimba',
    subtitle: 'Melodi tenang & santai suasana perkhemahan (Terbina Dalam)',
  },
  {
    id: 'EXPLORACE_MARCH',
    title: 'Rentak Kawad & Explorace',
    subtitle: 'Irama aktif & bersemangat untuk aktiviti LDK (Terbina Dalam)',
  },
  {
    id: 'CUSTOM',
    title: 'Muzik Pilihan Sendiri (MP3 / Audio)',
    subtitle: 'Fail MP3 yang dimuat naik atau pautan URL audio',
  },
];

const STORAGE_BGM_TRACK_KEY = 'sk_lupak_2026_bgm_track_v1';
const STORAGE_BGM_VOLUME_KEY = 'sk_lupak_2026_bgm_volume_v1';
const STORAGE_BGM_CUSTOM_URL_KEY = 'sk_lupak_2026_bgm_custom_url_v1';
const STORAGE_BGM_CUSTOM_NAME_KEY = 'sk_lupak_2026_bgm_custom_name_v1';

export const BackgroundMusicControl: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BGM_VOLUME_KEY);
      return saved ? Number(saved) : 0.35;
    } catch {
      return 0.35;
    }
  });
  const [selectedTrack, setSelectedTrack] = useState<BuiltInTrackId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BGM_TRACK_KEY) as BuiltInTrackId | null;
      return saved || 'CAMP_SPIRIT';
    } catch {
      return 'CAMP_SPIRIT';
    }
  });
  const [customAudioUrl, setCustomAudioUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_BGM_CUSTOM_URL_KEY) || '';
    } catch {
      return '';
    }
  });
  const [customAudioName, setCustomAudioName] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_BGM_CUSTOM_NAME_KEY) || '';
    } catch {
      return '';
    }
  });
  const [urlInput, setUrlInput] = useState('');
  const [audioError, setAudioError] = useState<string | null>(null);

  // Refs for Web Audio API synth and HTMLAudioElement for custom MP3
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);
  const stepRef = useRef<number>(0);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const effectiveVolume = isMuted ? 0 : volume;

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BGM_VOLUME_KEY, String(volume));
    } catch {
      // ignore
    }
  }, [volume]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BGM_TRACK_KEY, selectedTrack);
    } catch {
      // ignore
    }
  }, [selectedTrack]);

  // Update live gain / HTML audio volume
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        effectiveVolume * 0.25,
        audioCtxRef.current.currentTime,
        0.08
      );
    }
    if (htmlAudioRef.current) {
      htmlAudioRef.current.volume = Math.max(0, Math.min(1, effectiveVolume));
    }
  }, [effectiveVolume]);

  const stopAllAudio = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
    }
  };

  const playNote = (
    ctx: AudioContext,
    dest: AudioNode,
    freq: number,
    duration: number,
    type: OscillatorType = 'triangle',
    gainLevel = 0.35,
    delay = 0
  ) => {
    const startTime = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(noteGain);
    noteGain.connect(dest);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  };

  const startBuiltInSynth = (track: Exclude<BuiltInTrackId, 'CUSTOM'>) => {
    stopAllAudio();
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContextClass();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (!masterGainRef.current) {
      const gain = ctx.createGain();
      gain.gain.value = effectiveVolume * 0.25;
      gain.connect(ctx.destination);
      masterGainRef.current = gain;
    }

    const dest = masterGainRef.current;
    stepRef.current = 0;

    if (track === 'CAMP_SPIRIT') {
      // Warm C-major / G-major / Am / F camp acoustic progression
      const chords = [
        [261.63, 329.63, 392.0, 523.25], // C
        [392.0, 493.88, 587.33, 783.99], // G
        [220.0, 261.63, 329.63, 440.0], // Am
        [174.61, 220.0, 261.63, 349.23], // F
      ];
      const melody = [523.25, 659.25, 587.33, 523.25, 493.88, 587.33, 523.25, 440.0];

      const tick = () => {
        const s = stepRef.current;
        const chord = chords[Math.floor(s / 2) % chords.length];
        // Bass note
        playNote(ctx, dest, chord[0] / 2, 0.9, 'sine', 0.4, 0);
        // Arpeggio notes
        playNote(ctx, dest, chord[1], 0.55, 'triangle', 0.22, 0.18);
        playNote(ctx, dest, chord[2], 0.55, 'triangle', 0.22, 0.36);
        // Melody accent
        playNote(ctx, dest, melody[s % melody.length], 0.65, 'sine', 0.28, 0);
        stepRef.current += 1;
      };
      tick();
      intervalRef.current = window.setInterval(tick, 650);
    } else if (track === 'CAMPFIRE_NIGHT') {
      // Peaceful ambient pentatonic night melody
      const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 392.0, 329.63];
      const padBase = [130.81, 164.81, 196.0, 146.83];

      const tick = () => {
        const s = stepRef.current;
        const note = notes[s % notes.length];
        const pad = padBase[Math.floor(s / 2) % padBase.length];
        playNote(ctx, dest, pad, 1.8, 'sine', 0.32, 0);
        playNote(ctx, dest, note, 1.3, 'sine', 0.24, 0.25);
        playNote(ctx, dest, note * 1.5, 1.1, 'triangle', 0.12, 0.55);
        stepRef.current += 1;
      };
      tick();
      intervalRef.current = window.setInterval(tick, 1100);
    } else if (track === 'EXPLORACE_MARCH') {
      // Energetic rhythmic cadence for Explorace / Kawad
      const bassLine = [146.83, 146.83, 174.61, 196.0, 220.0, 196.0, 174.61, 164.81];
      const leadLine = [587.33, 659.25, 698.46, 783.99, 880.0, 783.99, 698.46, 659.25];

      const tick = () => {
        const s = stepRef.current;
        playNote(ctx, dest, bassLine[s % bassLine.length], 0.38, 'triangle', 0.42, 0);
        playNote(ctx, dest, leadLine[s % leadLine.length], 0.32, 'sine', 0.26, 0);
        playNote(ctx, dest, leadLine[(s + 2) % leadLine.length] * 0.5, 0.25, 'triangle', 0.2, 0.22);
        stepRef.current += 1;
      };
      tick();
      intervalRef.current = window.setInterval(tick, 450);
    }
  };

  const startPlayback = async (trackToPlay = selectedTrack, customUrlToUse = customAudioUrl) => {
    setAudioError(null);
    stopAllAudio();

    if (trackToPlay === 'CUSTOM') {
      if (!customUrlToUse) {
        setAudioError('Sila muat naik fail MP3 atau masukkan pautan URL audio terlebih dahulu.');
        setIsPlaying(false);
        return;
      }
      try {
        if (!htmlAudioRef.current) {
          htmlAudioRef.current = new Audio();
          htmlAudioRef.current.loop = true;
        }
        htmlAudioRef.current.src = customUrlToUse;
        htmlAudioRef.current.volume = Math.max(0, Math.min(1, effectiveVolume));
        await htmlAudioRef.current.play();
        setIsPlaying(true);
      } catch {
        setAudioError(
          'Gagal memainkan fail audio/pautan ini. Pastikan format MP3/WAV sah atau muat naik fail terus dari peranti.'
        );
        setIsPlaying(false);
      }
    } else {
      startBuiltInSynth(trackToPlay);
      setIsPlaying(true);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAllAudio();
      setIsPlaying(false);
    } else {
      startPlayback(selectedTrack, customAudioUrl);
    }
  };

  const handleSelectTrack = (trackId: BuiltInTrackId) => {
    setSelectedTrack(trackId);
    setAudioError(null);
    if (isPlaying || trackId !== 'CUSTOM') {
      startPlayback(trackId, customAudioUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioError(null);

    const objectUrl = URL.createObjectURL(file);
    setCustomAudioUrl(objectUrl);
    setCustomAudioName(file.name);
    setSelectedTrack('CUSTOM');

    // Also try saving small files as data URL in localStorage so it persists on reload
    if (file.size <= 3.5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          try {
            localStorage.setItem(STORAGE_BGM_CUSTOM_URL_KEY, reader.result);
            localStorage.setItem(STORAGE_BGM_CUSTOM_NAME_KEY, file.name);
          } catch {
            // Quota exceeded — keep objectUrl for current session
          }
        }
      };
      reader.readAsDataURL(file);
    } else {
      try {
        localStorage.setItem(STORAGE_BGM_CUSTOM_NAME_KEY, `${file.name} (Sesi Semasa)`);
      } catch {
        // ignore
      }
    }

    startPlayback('CUSTOM', objectUrl);
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setCustomAudioUrl(trimmed);
    setCustomAudioName(trimmed.split('/').pop() || 'Pautan Audio MP3');
    setSelectedTrack('CUSTOM');
    setUrlInput('');
    try {
      localStorage.setItem(STORAGE_BGM_CUSTOM_URL_KEY, trimmed);
      localStorage.setItem(STORAGE_BGM_CUSTOM_NAME_KEY, trimmed.split('/').pop() || 'Pautan Audio MP3');
    } catch {
      // ignore
    }
    startPlayback('CUSTOM', trimmed);
  };

  const handleClearCustomAudio = () => {
    stopAllAudio();
    setIsPlaying(false);
    setCustomAudioUrl('');
    setCustomAudioName('');
    try {
      localStorage.removeItem(STORAGE_BGM_CUSTOM_URL_KEY);
      localStorage.removeItem(STORAGE_BGM_CUSTOM_NAME_KEY);
    } catch {
      // ignore
    }
    setSelectedTrack('CAMP_SPIRIT');
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  return (
    <>
      {/* Top Header Compact Music Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer ${
          isPlaying
            ? 'bg-amber-500/25 border-amber-400/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
            : 'bg-white/5 hover:bg-white/15 border-white/15 text-slate-200'
        }`}
        title={
          isPlaying
            ? 'Muzik Latar Sedang Dimainkan — Klik untuk kawalan & tukar lagu'
            : 'Muzik Latar Aplikasi — Klik untuk mainkan atau muat naik MP3'
        }
        aria-label="Kawalan Muzik Latar"
      >
        <Music className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
        {isPlaying && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-950" />
        )}
      </button>

      {/* Responsive Modal for Background Music Control & Custom MP3 Upload */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[65] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2.5 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[86dvh] sm:max-h-[88vh] rounded-2xl sm:rounded-3xl glass-panel-elevated border border-white/20 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Sticky Header */}
              <div className="shrink-0 px-3.5 sm:px-5 py-3 sm:py-4 border-b border-white/15 bg-[#0b2246]/95 flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-extrabold text-sm sm:text-base text-white leading-snug">
                      Muzik Latar Perkhemahan
                    </h3>
                    <p className="text-[11px] text-amber-300 truncate">
                      {isPlaying ? 'Sedang Dimainkan' : 'Dijeda / Berhenti'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white shrink-0 cursor-pointer"
                  aria-label="Tutup Kawalan Muzik"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-3.5 sm:px-5 py-3 sm:py-4 space-y-3">
                {/* Main Play/Pause & Volume Bar */}
                <div className="p-3 rounded-2xl bg-[#112233]/90 border border-white/15 space-y-3">
                  <div className="flex items-center justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      className={`flex-1 min-h-[40px] px-4 py-2 rounded-xl font-display font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        isPlaying
                          ? 'bg-rose-500/25 hover:bg-rose-500/35 border border-rose-400/40 text-rose-200'
                          : 'bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] text-slate-950 shadow-md'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Hentikan / Jeda Muzik</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Mainkan Muzik Latar</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMuted((m) => !m)}
                      className="min-h-[40px] px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 flex items-center justify-center cursor-pointer"
                      title={isMuted ? 'Nyahbisu (Unmute)' : 'Bisukan (Mute)'}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-rose-300" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-amber-300" />
                      )}
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="font-semibold">Laraskan Kelantangan (Volume)</span>
                      <span className="font-mono font-bold text-amber-300">
                        {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setIsMuted(false);
                        setVolume(Number(e.target.value));
                      }}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                </div>

                {audioError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-400/40 text-[11px] text-rose-200 font-medium">
                    {audioError}
                  </div>
                )}

                {/* Track Selection List */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300 px-1">
                    1. Pilih Melodi Terbina Dalam atau Muzik Sendiri
                  </p>
                  <div className="space-y-1.5">
                    {TRACK_OPTIONS.map((track) => {
                      const active = selectedTrack === track.id;
                      return (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => handleSelectTrack(track.id)}
                          className={`w-full p-2.5 sm:p-3 rounded-xl border text-left flex items-start justify-between gap-2.5 transition-all cursor-pointer ${
                            active
                              ? 'bg-amber-500/20 border-amber-400/50 text-white'
                              : 'bg-[#112233]/75 hover:bg-[#112233] border-white/10 text-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <Radio
                              className={`w-4 h-4 shrink-0 mt-0.5 ${
                                active ? 'text-amber-300' : 'text-slate-400'
                              }`}
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-white leading-snug">
                                {track.title}
                              </p>
                              <p className="text-[10px] text-slate-300 mt-0.5">
                                {track.id === 'CUSTOM' && customAudioName
                                  ? `Fail aktif: ${customAudioName}`
                                  : track.subtitle}
                              </p>
                            </div>
                          </div>
                          {active && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-400/25 border border-amber-300/40 text-amber-200 text-[10px] font-bold shrink-0">
                              {isPlaying ? 'Aktif' : 'Dipilih'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Upload Custom MP3 or Paste Audio URL */}
                <div className="p-3 rounded-2xl bg-[#112233]/90 border border-sky-400/25 space-y-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                    2. Muat Naik Lagu MP3 Sendiri (Dari Telefon / Komputer)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 min-h-[36px] px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Pilih Fail MP3 / Audio</span>
                    </button>
                    {customAudioUrl && (
                      <button
                        type="button"
                        onClick={handleClearCustomAudio}
                        className="min-h-[36px] px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 text-rose-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Padam fail audio sendiri"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Direct URL input */}
                  <div className="pt-1 space-y-1.5">
                    <label className="block text-[10px] font-semibold text-slate-300">
                      Atau tampal pautan terus URL fail MP3:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex-1">
                        <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          placeholder="https://contoh.com/lagu-perkhemahan.mp3"
                          className="w-full min-h-[34px] pl-8 pr-2.5 py-1 rounded-xl glass-input text-[11px] text-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyUrl}
                        disabled={!urlInput.trim()}
                        className="min-h-[34px] px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-amber-300 cursor-pointer disabled:opacity-40"
                      >
                        Guna
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="shrink-0 px-3.5 sm:px-5 py-2.5 sm:py-3 border-t border-white/15 bg-[#0b2246]/95 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="min-h-[38px] px-5 py-1.5 rounded-xl bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] text-slate-950 text-xs font-extrabold cursor-pointer shadow-md"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

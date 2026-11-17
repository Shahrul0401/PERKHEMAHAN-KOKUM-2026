import React from 'react';
import {
  ArrowRight,
  Calendar,
  ClipboardEdit,
  Clock,
  LayoutGrid,
  MapPin,
} from 'lucide-react';

interface WelcomeLoginViewProps {
  onEnterApp: (initialTab: 'JADUAL' | 'EXPLORACE') => void;
}

export const WelcomeLoginView: React.FC<WelcomeLoginViewProps> = ({
  onEnterApp,
}) => {
  return (
    <div className="min-h-screen w-full camp-gradient-bg flex items-center justify-center p-3 sm:p-6 lg:p-10 relative overflow-x-hidden">
      {/* Main Glassmorphic Card Container (No Header) */}
      <main className="relative z-10 w-full max-w-[1060px] rounded-2xl sm:rounded-[28px] p-4 sm:p-8 lg:p-10 glass-panel">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 lg:gap-9 items-center">
          {/* Left Column: Poster Image (@imej 2) */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <div className="w-full rounded-xl sm:rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-[#112233]/60">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-11-17_at_7.27.40_AM_a3649f86.jpeg"
                alt="Poster Rasmi Program Perkhemahan Kokurikulum SK Lupak 2026"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover block"
              />
            </div>
          </div>

          {/* Right Column: Content & Action Buttons */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-4 sm:space-y-5">
            {/* Top Kicker, 3D School Logo, Main Title & Motto */}
            <div>
              <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
                <img
                  src="/assets/aistudio/LOGO_SK_3D__1__62639ca8.png"
                  alt="Logo Rasmi SK Lupak"
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 sm:w-14 sm:h-14 object-contain drop-shadow-lg shrink-0"
                />
                <p className="text-[11px] sm:text-sm font-bold text-amber-400 tracking-wide leading-snug">
                  Selamat Datang Ke Aplikasi Rasmi Perkhemahan
                </p>
              </div>
              <h1 className="font-display font-extrabold text-xl sm:text-3xl lg:text-4xl text-white leading-tight tracking-tight">
                Program Perkhemahan Kokurikulum SK Lupak 2026
              </h1>
              <p className="mt-1.5 sm:mt-2.5 text-xs sm:text-base text-slate-300 font-medium">
                &ldquo;Bersama Membina Insan Cemerlang&rdquo;
              </p>
            </div>

            {/* 3 Unit Uniform Cards with Official Logos (Pengakap, TKRS, Puteri Islam with Pink card) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Box 1: PENGAKAP (Blue) */}
              <div className="rounded-xl sm:rounded-2xl bg-[#3b669c]/55 border border-sky-300/35 px-2 py-2.5 sm:px-3 sm:py-3.5 flex flex-col items-center justify-center text-center shadow-inner hover:scale-[1.02] transition-transform min-w-0">
                <div className="w-9 h-9 sm:w-14 sm:h-14 mb-1.5 sm:mb-2 flex items-center justify-center">
                  <img
                    src="/assets/aistudio/PERSEKUTUAN_PENGAKAP_MALAYSIA_21372bf0.png"
                    alt="Logo Persekutuan Pengakap Malaysia"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>
                <span className="font-display font-extrabold text-[10px] sm:text-sm text-white tracking-tight sm:tracking-wide leading-tight uppercase">
                  PENGAKAP
                </span>
              </div>

              {/* Box 2: TKRS (Green / Teal) */}
              <div className="rounded-xl sm:rounded-2xl bg-[#277971]/60 border border-emerald-300/35 px-2 py-2.5 sm:px-3 sm:py-3.5 flex flex-col items-center justify-center text-center shadow-inner hover:scale-[1.02] transition-transform min-w-0">
                <div className="w-9 h-9 sm:w-14 sm:h-14 mb-1.5 sm:mb-2 flex items-center justify-center">
                  <img
                    src="/assets/aistudio/KADET_REMAJA_SEKOLAH_872fa552.png"
                    alt="Logo Tunas Kadet Remaja Sekolah (TKRS)"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>
                <span className="font-display font-extrabold text-[10px] sm:text-sm text-white tracking-tight sm:tracking-wide leading-tight uppercase">
                  TKRS
                </span>
              </div>

              {/* Box 3: PUTERI ISLAM (Pink Background & Pink Border as requested) */}
              <div className="rounded-xl sm:rounded-2xl bg-pink-500/35 border border-pink-400/60 px-2 py-2.5 sm:px-3 sm:py-3.5 flex flex-col items-center justify-center text-center shadow-inner hover:scale-[1.02] transition-transform min-w-0">
                <div className="w-9 h-9 sm:w-14 sm:h-14 mb-1.5 sm:mb-2 flex items-center justify-center">
                  <img
                    src="/assets/aistudio/PERGERAKAN_PUTERI_ISLAM_MALAYSIA_3e27523c.png"
                    alt="Logo Pergerakan Puteri Islam Malaysia"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>
                <span className="font-display font-extrabold text-[10px] sm:text-sm text-white tracking-tight sm:tracking-wide leading-tight uppercase">
                  PUTERI ISLAM
                </span>
              </div>
            </div>

            {/* Event Details Card (Tarikh, Masa, Tempat) */}
            <div className="rounded-xl sm:rounded-2xl bg-[#112233]/85 border border-white/10 px-3.5 sm:px-5 py-3 divide-y divide-white/10">
              <div className="py-2 first:pt-0.5 last:pb-0.5 flex items-center justify-between gap-2 text-[11px] sm:text-sm">
                <div className="flex items-center gap-2 text-slate-300 shrink-0">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                  <span>Tarikh Perkhemahan</span>
                </div>
                <span className="font-mono font-bold text-white text-right tabular-nums">
                  24 - 26 November 2026
                </span>
              </div>

              <div className="py-2 first:pt-0.5 last:pb-0.5 flex items-center justify-between gap-2 text-[11px] sm:text-sm">
                <div className="flex items-center gap-2 text-slate-300 shrink-0">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" />
                  <span>Masa</span>
                </div>
                <span className="font-mono font-bold text-white text-right tabular-nums">
                  7:00 Pagi - 12:30 Tgh Hari
                </span>
              </div>

              <div className="py-2 first:pt-0.5 last:pb-0.5 flex items-center justify-between gap-2 text-[11px] sm:text-sm">
                <div className="flex items-center gap-2 text-slate-300 shrink-0">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                  <span>Tempat</span>
                </div>
                <span className="font-bold text-white text-right">
                  Padang &amp; Tapak Kem SK Lupak
                </span>
              </div>
            </div>

            {/* Stacked Action Buttons matching Image 1 */}
            <div className="space-y-2.5 sm:space-y-3 pt-0.5">
              <button
                type="button"
                onClick={() => onEnterApp('JADUAL')}
                className="w-full min-h-[46px] sm:min-h-[52px] px-4 sm:px-6 py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] hover:brightness-105 border border-amber-200/40 text-slate-950 font-display font-bold text-xs sm:text-base shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LayoutGrid className="w-4 h-4 text-slate-950 shrink-0" />
                <span>Enter</span>
                <ArrowRight className="w-4 h-4 text-slate-950 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onEnterApp('EXPLORACE')}
                className="w-full min-h-[46px] sm:min-h-[52px] px-4 sm:px-6 py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#1992f4] via-[#1d75ec] to-[#2157e2] hover:brightness-110 border border-sky-300/40 text-white font-display font-bold text-xs sm:text-base shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ClipboardEdit className="w-4 h-4 text-white shrink-0" />
                <span>Rekod Keputusan Pantas (Guru)</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

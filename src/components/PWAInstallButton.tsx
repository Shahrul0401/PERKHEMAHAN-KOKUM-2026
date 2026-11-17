import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-300 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
        title="Pasang Aplikasi ke Skrin Utama Peranti"
        aria-label="Pasang Aplikasi"
      >
        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowGuide(true)}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/15 text-slate-200 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
        title={isIOS ? 'Panduan Pasang di iOS' : 'Aplikasi Mudah Alih (PWA)'}
        aria-label="Aplikasi Mudah Alih"
      >
        <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl glass-panel-elevated p-6 shadow-2xl border border-white/20 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                Pasang Aplikasi Kem SK Lupak 2026
              </h3>
              <button
                onClick={() => setShowGuide(false)}
                className="min-h-[36px] min-w-[36px] rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-300 leading-relaxed">
              <p>
                Aplikasi ini dilengkapi teknologi <strong>PWA Luar Talian (Offline-First)</strong> supaya para guru boleh memasukkan markah di tapak perkhemahan walaupun tanpa liputan internet.
              </p>
              {isIOS ? (
                <div className="p-3.5 rounded-xl bg-[#112233]/90 border border-white/10 space-y-1.5 text-xs">
                  <p className="font-semibold text-amber-400">Langkah Pasang di iPhone / iPad (Safari):</p>
                  <p>1. Tekan ikon <strong>Kongsi (Share)</strong> pada bar bawah pelayar Safari.</p>
                  <p>2. Tatal ke bawah dan pilih <strong>&ldquo;Add to Home Screen&rdquo; (Tambah ke Skrin Utama)</strong>.</p>
                  <p>3. Tekan <strong>Add</strong> di penjuru kanan atas.</p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#112233]/90 border border-white/10 space-y-1.5 text-xs">
                  <p className="font-semibold text-amber-400">Langkah Pasang di Android / Chrome / Edge:</p>
                  <p>1. Klik menu tiga titik di penjuru kanan atas pelayar atau ikon <strong>Pasang (Install)</strong> pada bar alamat.</p>
                  <p>2. Pilih <strong>&ldquo;Install app&rdquo;</strong> atau <strong>&ldquo;Add to Home screen&rdquo;</strong>.</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full min-h-[44px] rounded-xl bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] text-slate-950 font-bold text-sm transition-all cursor-pointer"
            >
              Faham &amp; Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};

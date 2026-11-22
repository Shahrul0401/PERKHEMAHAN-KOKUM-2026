import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, Lock, Unlock, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  contextLabel?: string;
  onClose: () => void;
  onUnlockSuccess: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  contextLabel = 'Pemarkahan & Anugerah / Pelaporan',
  onClose,
  onUnlockSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMsg(null);
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === 'admin') {
      setErrorMsg(null);
      setPassword('');
      onUnlockSuccess();
    } else {
      setErrorMsg('Password tidak sah. Sila masukkan password admin yang betul.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl glass-panel-elevated p-5 sm:p-6 border border-amber-400/35 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-white">
                    Masukkan Password
                  </h3>
                  <p className="text-[11px] sm:text-xs text-amber-300 font-medium">
                    Pengesahan Kemaskini: {contextLabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Tutup Modal Password"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="p-3 rounded-2xl bg-[#112233]/90 border border-white/10 text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                Bahagian ini berada dalam <strong className="text-amber-300">Mod Paparan Sahaja (View Only)</strong> untuk pengguna umum. Masukkan password sekali sahaja untuk mengaktifkan akses kemaskini pada peranti ini.
              </div>

              <div>
                <label
                  htmlFor="admin-password-input"
                  className="block text-xs font-bold text-slate-200 mb-1.5"
                >
                  Password Kemaskini
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    id="admin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Masukkan password..."
                    autoComplete="off"
                    className="w-full min-h-[44px] pl-3.5 pr-11 py-2 rounded-xl glass-input text-sm font-semibold text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-300 cursor-pointer"
                    aria-label={showPassword ? 'Sembunyikan Password' : 'Papar Password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Batal (View Sahaja)
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] px-5 py-2 rounded-xl bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] hover:brightness-105 text-slate-950 font-display font-extrabold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Sahkan &amp; Buka Kemaskini</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface AdminAccessBannerProps {
  isUnlocked: boolean;
  sectionName: string;
  onRequestUnlock: () => void;
  onLockAgain: () => void;
}

export const AdminAccessBanner: React.FC<AdminAccessBannerProps> = ({
  isUnlocked,
  sectionName,
  onRequestUnlock,
  onLockAgain,
}) => {
  return (
    <div
      className={`rounded-2xl px-4 py-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
        isUnlocked
          ? 'bg-emerald-500/15 border-emerald-400/35 text-emerald-100'
          : 'bg-amber-500/15 border-amber-400/40 text-amber-100'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
            isUnlocked
              ? 'bg-emerald-500/25 border-emerald-400/40 text-emerald-300'
              : 'bg-amber-500/25 border-amber-400/40 text-amber-300'
          }`}
        >
          {isUnlocked ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
        </div>
        <div>
          <p className="font-display font-bold text-xs sm:text-sm text-white">
            {isUnlocked
              ? `Mod Kemaskini Aktif — ${sectionName}`
              : `Mod Paparan Sahaja (View Only) — ${sectionName}`}
          </p>
          <p className="text-[11px] text-slate-300">
            {isUnlocked
              ? 'Password telah disahkan pada peranti ini. Anda bebas mengemaskini markah dan laporan tanpa perlu memasukkan password berulang kali.'
              : 'Pengguna umum hanya boleh melihat paparan ini. Klik butang di sebelah untuk memasukkan password bagi mengemaskini data.'}
          </p>
        </div>
      </div>

      {isUnlocked ? (
        <button
          type="button"
          onClick={onLockAgain}
          className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
          title="Kembali ke Mod Paparan Sahaja (View Only)"
        >
          <Lock className="w-3.5 h-3.5 text-amber-300" />
          <span>Kunci (View Only)</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onRequestUnlock}
          className="min-h-[38px] px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] hover:brightness-105 text-slate-950 font-display font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Masukkan Password Kemaskini</span>
        </button>
      )}
    </div>
  );
};

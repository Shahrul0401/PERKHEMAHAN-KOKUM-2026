import React, { useState } from 'react';
import {
  Award,
  Camera,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Lock,
  Plus,
  Sparkles,
  Trash2,
  Trophy,
} from 'lucide-react';
import { AwardItem, CampAppState, OPRReportData } from '../types/camp';
import { exportKeputusanPDF, exportOPRPDF } from '../utils/pdfExporter';
import { AdminAccessBanner } from './AdminPasswordModal';

interface AwardsAndOPRSectionProps {
  state: CampAppState;
  isEditUnlocked: boolean;
  onRequestUnlock: () => void;
  onLockAgain: () => void;
  onUpdateAwards: (awards: AwardItem[], desc: string) => void;
  onUpdateOPR: (opr: OPRReportData, desc: string) => void;
}

export const AwardsAndOPRSection: React.FC<AwardsAndOPRSectionProps> = ({
  state,
  isEditUnlocked,
  onRequestUnlock,
  onLockAgain,
  onUpdateAwards,
  onUpdateOPR,
}) => {
  const [subView, setSubView] = useState<'AWARDS' | 'OPR'>('AWARDS');
  const [isExportingKeputusan, setIsExportingKeputusan] = useState(false);
  const [isExportingOPR, setIsExportingOPR] = useState(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Auto-calculate winners from live scores
  const handleAutoSyncWinners = () => {
    if (!isEditUnlocked) {
      onRequestUnlock();
      return;
    }
    // 1. Top Explorace Group
    const expRanked = [...state.groups]
      .map((g) => ({
        name: g.name,
        total: state.stations.reduce(
          (sum, st) => sum + (state.exploraceScores[g.id]?.[st.id] ?? 0),
          0
        ),
      }))
      .sort((a, b) => b.total - a.total);

    // 2. Top Ikhtiar Hidup Group
    const ikhRanked = [...state.groups]
      .map((g) => {
        const sc = state.ikhtiarScores[g.id] || { kerjasama: 0, penyediaan: 0, rasa: 0 };
        return { name: g.name, total: sc.kerjasama + sc.penyediaan + sc.rasa };
      })
      .sort((a, b) => b.total - a.total);

    // 3. Kawad Kaki Rankings
    const kawadRanked = [...state.uniformUnits]
      .map((u) => {
        const sc = state.kawadScores[u.id] || { arahan: 0, keseragaman: 0, nadaSuara: 0 };
        return { name: u.name, total: sc.arahan + sc.keseragaman + sc.nadaSuara };
      })
      .sort((a, b) => b.total - a.total);

    const updatedAwards = state.awards.map((aw) => {
      if (aw.autoKey === 'EXPLORACE_TOP' && expRanked[0]) {
        return {
          ...aw,
          winner: `${expRanked[0].name} (${expRanked[0].total} Markah)`,
        };
      }
      if (aw.autoKey === 'IKHTIAR_TOP' && ikhRanked[0]) {
        return {
          ...aw,
          winner: `${ikhRanked[0].name} (${ikhRanked[0].total}%)`,
        };
      }
      if (aw.autoKey === 'KAWAD_1' && kawadRanked[0]) {
        return { ...aw, winner: `${kawadRanked[0].name} (${kawadRanked[0].total}%)` };
      }
      if (aw.autoKey === 'KAWAD_2' && kawadRanked[1]) {
        return { ...aw, winner: `${kawadRanked[1].name} (${kawadRanked[1].total}%)` };
      }
      if (aw.autoKey === 'KAWAD_3' && kawadRanked[2]) {
        return { ...aw, winner: `${kawadRanked[2].name} (${kawadRanked[2].total}%)` };
      }
      return aw;
    });

    onUpdateAwards(
      updatedAwards,
      'Auto-jana senarai pemenang berdasarkan markah tertinggi semasa'
    );
    triggerToast('Senarai pemenang berjaya dikemaskini daripada markah tertinggi semasa!');
  };

  const handleWinnerChange = (id: string, newWinner: string) => {
    if (!isEditUnlocked) {
      onRequestUnlock();
      return;
    }
    const next = state.awards.map((a) =>
      a.id === id ? { ...a, winner: newWinner } : a
    );
    const target = state.awards.find((a) => a.id === id);
    onUpdateAwards(next, `Kemaskini pemenang ${target?.title}: ${newWinner}`);
  };

  const handleTitleChange = (id: string, newTitle: string) => {
    if (!isEditUnlocked) {
      onRequestUnlock();
      return;
    }
    const next = state.awards.map((a) =>
      a.id === id ? { ...a, title: newTitle } : a
    );
    onUpdateAwards(next, `Kemaskini nama anugerah kadet: ${newTitle}`);
  };

  const handleDownloadKeputusanPDF = async () => {
    setIsExportingKeputusan(true);
    try {
      await exportKeputusanPDF(state);
      triggerToast('Laporan Keputusan Rasmi (PDF) berjaya dimuat turun.');
    } finally {
      setIsExportingKeputusan(false);
    }
  };

  const handleDownloadOPRPDF = async () => {
    setIsExportingOPR(true);
    try {
      await exportOPRPDF(state);
      triggerToast('Laporan One Page Report (OPR PDF) berjaya dimuat turun.');
    } finally {
      setIsExportingOPR(false);
    }
  };

  const handlePhotoUpload = (photoId: string, file: File | undefined) => {
    if (!isEditUnlocked) {
      onRequestUnlock();
      return;
    }
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const updatedPhotos = state.oprData.photos.map((p) =>
          p.id === photoId ? { ...p, dataUrl: reader.result as string } : p
        );
        onUpdateOPR(
          { ...state.oprData, photos: updatedPhotos },
          `Muat naik gambar dokumentasi OPR (${photoId})`
        );
        triggerToast('Gambar dokumentasi OPR berjaya dikemaskini.');
      }
    };
    reader.readAsDataURL(file);
  };

  const umumAwards = state.awards.filter((a) => a.category === 'UMUM');
  const kawadAwards = state.awards.filter((a) => a.category === 'KAWAD');
  const kadetAwards = state.awards.filter((a) => a.category === 'KADET');

  // Live Kawad Kaki rankings directly from Carta Pertandingan Kawad Kaki Asas
  const kawadMetrics = [...state.uniformUnits]
    .map((u) => {
      const sc = state.kawadScores[u.id] || { arahan: 0, keseragaman: 0, nadaSuara: 0 };
      const total = sc.arahan + sc.keseragaman + sc.nadaSuara;
      return { unit: u, sc, total };
    })
    .sort((a, b) => b.total - a.total);

  const getUnitLogoAndTheme = (unitName: string) => {
    const upper = unitName.toUpperCase();
    if (upper.includes('PENGAKAP')) {
      return {
        logo: '/assets/aistudio/PERSEKUTUAN_PENGAKAP_MALAYSIA_21372bf0.png',
        cardClass: 'bg-[#3b669c]/45 border-sky-300/35',
        barClass: 'from-sky-400 to-blue-600',
      };
    }
    if (upper.includes('PUTERI')) {
      return {
        logo: '/assets/aistudio/PERGERAKAN_PUTERI_ISLAM_MALAYSIA_3e27523c.png',
        cardClass: 'bg-pink-500/30 border-pink-400/55',
        barClass: 'from-pink-400 to-rose-500',
      };
    }
    return {
      logo: '/assets/aistudio/KADET_REMAJA_SEKOLAH_872fa552.png',
      cardClass: 'bg-[#277971]/50 border-emerald-300/35',
      barClass: 'from-emerald-400 to-teal-500',
    };
  };

  // Resolve structured numbered array for OPR sections
  const objektifItems: string[] =
    Array.isArray(state.oprData.objektif) && state.oprData.objektif.length > 0
      ? state.oprData.objektif
      : [''];

  const ringkasanItems: string[] =
    Array.isArray(state.oprData.ringkasanList) && state.oprData.ringkasanList.length > 0
      ? state.oprData.ringkasanList
      : (state.oprData.ringkasanAktiviti || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);

  const kekuatanItems: string[] =
    Array.isArray(state.oprData.kekuatanList) && state.oprData.kekuatanList.length > 0
      ? state.oprData.kekuatanList
      : (state.oprData.kekuatan || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);

  const penambahbaikanItems: string[] =
    Array.isArray(state.oprData.penambahbaikanList) &&
    state.oprData.penambahbaikanList.length > 0
      ? state.oprData.penambahbaikanList
      : (state.oprData.penambahbaikan || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);

  const updateOprListSection = (
    section: 'objektif' | 'ringkasan' | 'kekuatan' | 'penambahbaikan',
    nextItems: string[],
    actionDesc: string
  ) => {
    if (!isEditUnlocked) {
      onRequestUnlock();
      return;
    }
    if (section === 'objektif') {
      onUpdateOPR({ ...state.oprData, objektif: nextItems }, actionDesc);
    } else if (section === 'ringkasan') {
      onUpdateOPR(
        {
          ...state.oprData,
          ringkasanList: nextItems,
          ringkasanAktiviti: nextItems.join('\n'),
        },
        actionDesc
      );
    } else if (section === 'kekuatan') {
      onUpdateOPR(
        {
          ...state.oprData,
          kekuatanList: nextItems,
          kekuatan: nextItems.join('\n'),
        },
        actionDesc
      );
    } else {
      onUpdateOPR(
        {
          ...state.oprData,
          penambahbaikanList: nextItems,
          penambahbaikan: nextItems.join('\n'),
        },
        actionDesc
      );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner + PDF Export Action Bar */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-amber-400 font-bold">
            <span>SENARAI ANUGERAH &amp; LAPORAN SEKOLAH</span>
            <span aria-hidden="true">·</span>
            <span>11 HAMPER · 6 TROFI · 81 SIJIL PENYERTAAN</span>
          </div>
          <h2 className="mt-1 font-display font-bold text-base sm:text-xl lg:text-2xl text-white leading-snug">
            Senarai Anugerah, Eksport Keputusan &amp; One Page Report (OPR) PDF
          </h2>
          <p className="mt-1 text-[11px] sm:text-sm text-slate-300 leading-relaxed">
            Urus senarai pemenang kategori umum &amp; kawad kaki, serta jana laporan rasmi PDF untuk simpanan fail sekolah.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2">
          {/* Sub-view switcher */}
          <div className="grid grid-cols-2 sm:flex items-center p-1 rounded-xl bg-[#112233]/90 border border-white/10 gap-1">
            <button
              type="button"
              onClick={() => setSubView('AWARDS')}
              className={`min-h-[36px] sm:min-h-[38px] px-2 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                subView === 'AWARDS'
                  ? 'bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span>Senarai Anugerah</span>
            </button>
            <button
              type="button"
              onClick={() => setSubView('OPR')}
              className={`min-h-[36px] sm:min-h-[38px] px-2 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                subView === 'OPR'
                  ? 'bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>One Page Report</span>
            </button>
          </div>

          {/* Direct PDF Download Buttons */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <button
              type="button"
              disabled={isExportingKeputusan}
              onClick={handleDownloadKeputusanPDF}
              className="min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#1992f4] via-[#1d75ec] to-[#2157e2] hover:brightness-110 border border-sky-300/40 text-white text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
              <span>
                {isExportingKeputusan ? 'Menjana...' : 'PDF Keputusan'}
              </span>
            </button>

            <button
              type="button"
              disabled={isExportingOPR}
              onClick={handleDownloadOPRPDF}
              className="min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] hover:brightness-105 text-slate-950 text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>{isExportingOPR ? 'Menjana...' : 'Eksport PDF OPR'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Password / View-Only Status Banner */}
      <AdminAccessBanner
        isUnlocked={isEditUnlocked}
        sectionName="Komponen Anugerah & Pelaporan (OPR)"
        onRequestUnlock={onRequestUnlock}
        onLockAgain={onLockAgain}
      />

      {toastMsg && (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[11px] sm:text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* VIEW 1: SENARAI ANUGERAH (EXACT MATCH OF senarai_anugerah_c28963ef.pdf) */}
      {subView === 'AWARDS' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Action bar to auto-populate from live scores */}
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-sm sm:text-base text-white">
                Penyegerakan Pemenang Automatik &amp; Senarai Kumpulan
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 leading-relaxed">
                8 Kumpulan: Aldebaran, Acrux, Altair, Capella, Arcturus, Alphard, Pollux, Regulus &nbsp;|&nbsp; 3 Badan Beruniform: TKRS, Pengakap, Pergerakan Puteri Islam Malaysia
              </p>
            </div>
            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={handleAutoSyncWinners}
                className="w-full sm:w-auto min-h-[38px] sm:min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>Auto-Isi Pemenang Dari Markah Semasa</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* KATEGORI UMUM (1-8) */}
            <div className="lg:col-span-7 glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6">
              <div className="pb-3 sm:pb-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display font-bold text-sm sm:text-lg text-white flex items-center gap-2">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                  <span>KATEGORI UMUM (8 ANUGERAH UTAMA)</span>
                </h3>
                <span className="text-[11px] sm:text-xs text-slate-400">Pilih Nama Kumpulan (8 Kumpulan)</span>
              </div>

              <div className="mt-4 divide-y divide-white/10">
                {umumAwards.map((aw) => (
                  <div
                    key={aw.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 font-mono font-bold text-xs text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                        {aw.order}
                      </span>
                      <div>
                        <p className="font-display font-bold text-sm sm:text-base text-white">
                          {aw.title}
                        </p>
                        <p className="text-[11px] text-slate-400">{aw.notes}</p>
                      </div>
                    </div>

                    <div className="w-full sm:w-64 shrink-0 flex items-center gap-1.5">
                      {isEditUnlocked ? (
                        <select
                          value={
                            state.groups.some((g) => aw.winner.startsWith(g.name))
                              ? state.groups.find((g) => aw.winner.startsWith(g.name))!.name
                              : state.groups[0]?.name || aw.winner
                          }
                          onChange={(e) => handleWinnerChange(aw.id, e.target.value)}
                          className="w-full min-h-[40px] px-3 py-1.5 rounded-xl glass-input text-xs font-bold text-emerald-300 cursor-pointer"
                        >
                          {state.groups.map((g) => (
                            <option key={g.id} value={g.name} className="bg-slate-900 text-white">
                              {g.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <button
                          type="button"
                          onClick={onRequestUnlock}
                          className="w-full min-h-[40px] px-3 py-1.5 rounded-xl glass-input text-xs font-bold text-emerald-300 flex items-center justify-between gap-2 cursor-pointer text-left"
                          title="Klik untuk masukkan password kemaskini"
                        >
                          <span className="truncate">{aw.winner}</span>
                          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* KATEGORI KAWAD KAKI TERBAIK & 6 KADET TERBAIK */}
            <div className="lg:col-span-5 space-y-6">
              {/* KATEGORI KAWAD KAKI TERBAIK (SYNCED LIVE FROM CARTA PERTANDINGAN KAWAD KAKI ASAS) */}
              <div className="glass-panel rounded-3xl p-5 sm:p-6">
                <div className="pb-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                      <span>KATEGORI KAWAD KAKI TERBAIK</span>
                    </h3>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Disegerakkan secara automatik daripada Carta Pertandingan Kawad Kaki Asas.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
                    Auto-Carta Markah
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {kawadAwards.map((aw, idx) => {
                    const rankedItem = kawadMetrics[idx];
                    const unitName = rankedItem ? rankedItem.unit.name : aw.winner;
                    const theme = getUnitLogoAndTheme(unitName);
                    return (
                      <div
                        key={aw.id}
                        className={`p-3.5 rounded-2xl border space-y-2 ${theme.cardClass}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={theme.logo}
                              alt={unitName}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 object-contain shrink-0 drop-shadow"
                            />
                            <div className="min-w-0">
                              <span className="font-mono font-bold text-[11px] text-amber-300 block">
                                #{aw.order} · {aw.title}
                              </span>
                              <p className="font-display font-bold text-sm sm:text-base text-white leading-tight">
                                {unitName}
                              </p>
                            </div>
                          </div>
                          {rankedItem && (
                            <span className="font-mono font-extrabold text-base sm:text-lg text-amber-300 tabular-nums shrink-0">
                              {rankedItem.total}%
                            </span>
                          )}
                        </div>
                        {rankedItem && (
                          <div className="pt-1.5 border-t border-white/15 flex flex-wrap items-center justify-between gap-1 text-[10px] sm:text-[11px] font-mono text-slate-200 tabular-nums">
                            <span>Arahan: {rankedItem.sc.arahan}/40</span>
                            <span>Keseragaman: {rankedItem.sc.keseragaman}/30</span>
                            <span>Suara: {rankedItem.sc.nadaSuara}/30</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 6 TROFI & SIJIL KADET TERBAIK */}
              <div className="glass-panel rounded-3xl p-5 sm:p-6">
                <div className="pb-3 border-b border-white/10">
                  <h3 className="font-display font-bold text-base text-white">
                    6 Trofi &amp; Sijil Kadet Terbaik (AJK Hadiah)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Nama kategori anugerah dan nama penerima boleh diubah suai terus di bawah.
                  </p>
                </div>
                <div className="mt-3.5 space-y-3">
                  {kadetAwards.map((aw) => (
                    <div
                      key={aw.id}
                      className="p-3 rounded-2xl bg-slate-950/55 border border-white/10 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/35 font-mono font-bold text-[11px] text-amber-300 flex items-center justify-center shrink-0 tabular-nums">
                          {aw.order}
                        </span>
                        <input
                          type="text"
                          value={aw.title}
                          readOnly={!isEditUnlocked}
                          onClick={() => {
                            if (!isEditUnlocked) onRequestUnlock();
                          }}
                          onChange={(e) => handleTitleChange(aw.id, e.target.value)}
                          placeholder="Nama Kategori Anugerah (cth: Kadet Terbaik TKRS - Putera)"
                          aria-label={`Nama Anugerah Kadet ${aw.order}`}
                          className={`w-full min-h-[36px] px-3 py-1 rounded-xl glass-input text-xs font-bold text-amber-300 ${
                            !isEditUnlocked ? 'cursor-pointer opacity-85' : ''
                          }`}
                        />
                      </div>
                      <input
                        type="text"
                        value={aw.winner}
                        readOnly={!isEditUnlocked}
                        onClick={() => {
                          if (!isEditUnlocked) onRequestUnlock();
                        }}
                        onChange={(e) => handleWinnerChange(aw.id, e.target.value)}
                        placeholder="Nama Penerima / Pemenang"
                        aria-label={`Pemenang Anugerah Kadet ${aw.order}`}
                        className={`w-full min-h-[38px] px-3 py-1.5 rounded-xl glass-input text-xs text-emerald-200 font-medium ${
                          !isEditUnlocked ? 'cursor-pointer opacity-85' : ''
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ONE PAGE REPORT (OPR) STUDIO & LIVE PREVIEW */}
      {subView === 'OPR' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Form to Customize ALL OPR Content & Upload Photos */}
          <div className="lg:col-span-5 glass-panel rounded-3xl p-4 sm:p-6 space-y-4">
            <div className="pb-3 border-b border-white/10">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display font-bold text-base sm:text-lg text-white">
                  Kemaskini Kandungan One Page Report (OPR)
                </h3>
                {!isEditUnlocked && (
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-[10px] font-bold text-amber-300 flex items-center gap-1 shrink-0">
                    <Lock className="w-3 h-3" />
                    <span>View Only</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isEditUnlocked ? (
                  <>
                    Sunting semua maklumat laporan, tambah item bernombor (1, 2, 3...) dengan butang <strong>+</strong>, atau muat naik gambar aktiviti.
                  </>
                ) : (
                  'Klik pada mana-mana ruangan di bawah untuk memasukkan password bagi mengemaskini laporan OPR.'
                )}
              </p>
            </div>

            <div
              onClickCapture={(e) => {
                if (!isEditUnlocked) {
                  e.preventDefault();
                  e.stopPropagation();
                  onRequestUnlock();
                }
              }}
              onKeyDownCapture={(e) => {
                if (!isEditUnlocked && e.key !== 'Tab') {
                  e.preventDefault();
                  e.stopPropagation();
                  onRequestUnlock();
                }
              }}
              className={`space-y-3.5 ${
                !isEditUnlocked ? 'cursor-pointer select-none opacity-90' : ''
              }`}
            >
              {/* Maklumat Asas Program */}
              <div className="p-3.5 rounded-2xl bg-slate-950/55 border border-white/10 space-y-3">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Maklumat Asas Program (Boleh Diedit)
                </p>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Nama Program
                  </label>
                  <input
                    type="text"
                    value={state.oprData.namaProgram}
                    onChange={(e) =>
                      onUpdateOPR(
                        { ...state.oprData, namaProgram: e.target.value },
                        'Kemaskini Nama Program OPR'
                      )
                    }
                    className="w-full min-h-[38px] px-3 py-1.5 rounded-xl glass-input text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Anjuran
                  </label>
                  <input
                    type="text"
                    value={state.oprData.anjuran}
                    onChange={(e) =>
                      onUpdateOPR(
                        { ...state.oprData, anjuran: e.target.value },
                        'Kemaskini Anjuran OPR'
                      )
                    }
                    className="w-full min-h-[38px] px-3 py-1.5 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Tarikh Pelaksanaan
                    </label>
                    <input
                      type="text"
                      value={state.oprData.tarikh}
                      onChange={(e) =>
                        onUpdateOPR(
                          { ...state.oprData, tarikh: e.target.value },
                          'Kemaskini Tarikh OPR'
                        )
                      }
                      className="w-full min-h-[38px] px-3 py-1.5 rounded-xl glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Masa Pelaksanaan
                    </label>
                    <input
                      type="text"
                      value={state.oprData.masa}
                      onChange={(e) =>
                        onUpdateOPR(
                          { ...state.oprData, masa: e.target.value },
                          'Kemaskini Masa OPR'
                        )
                      }
                      className="w-full min-h-[38px] px-3 py-1.5 rounded-xl glass-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Tempat
                  </label>
                  <input
                    type="text"
                    value={state.oprData.tempat}
                    onChange={(e) =>
                      onUpdateOPR(
                        { ...state.oprData, tempat: e.target.value },
                        'Kemaskini Tempat OPR'
                      )
                    }
                    className="w-full min-h-[38px] px-3 py-1.5 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Sasaran Peserta
                    </label>
                    <input
                      type="text"
                      value={state.oprData.sasaran}
                      onChange={(e) =>
                        onUpdateOPR(
                          { ...state.oprData, sasaran: e.target.value },
                          'Kemaskini Sasaran OPR'
                        )
                      }
                      className="w-full min-h-[38px] px-3 py-1.5 rounded-xl glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Kehadiran Peserta
                    </label>
                    <input
                      type="text"
                      value={state.oprData.kehadiran}
                      onChange={(e) =>
                        onUpdateOPR(
                          { ...state.oprData, kehadiran: e.target.value },
                          'Kemaskini Kehadiran OPR'
                        )
                      }
                      className="w-full min-h-[38px] px-3 py-1.5 rounded-xl glass-input text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 1. OBJEKTIF PROGRAM (Numbered items 1, 2, 3... with + button) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/55 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Objektif Program
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Senarai bernombor ({objektifItems.length} item)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateOprListSection(
                        'objektif',
                        [...objektifItems, ''],
                        `Tambah Objektif Program #${objektifItems.length + 1}`
                      )
                    }
                    className="min-h-[32px] px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/40 text-emerald-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                    title="Tambah Objektif Baru"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah No. {objektifItems.length + 1}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {objektifItems.map((item, idx) => (
                    <div key={`obj-${idx}`} className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/35 font-mono font-bold text-[11px] text-emerald-300 flex items-center justify-center shrink-0 mt-1.5 tabular-nums">
                        {idx + 1}
                      </span>
                      <textarea
                        rows={2}
                        value={item}
                        onChange={(e) => {
                          const next = [...objektifItems];
                          next[idx] = e.target.value;
                          updateOprListSection(
                            'objektif',
                            next,
                            `Kemaskini Objektif Program #${idx + 1}`
                          );
                        }}
                        placeholder={`Masukkan objektif program ke-${idx + 1}...`}
                        className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs leading-relaxed"
                      />
                      {objektifItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = objektifItems.filter((_, i) => i !== idx);
                            updateOprListSection(
                              'objektif',
                              next,
                              `Padam Objektif Program #${idx + 1}`
                            );
                          }}
                          className="w-7 h-7 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 border border-rose-400/30 text-rose-300 flex items-center justify-center shrink-0 mt-1.5 cursor-pointer transition-colors"
                          title={`Padam Objektif #${idx + 1}`}
                          aria-label={`Padam Objektif #${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. RINGKASAN AKTIVITI & KEPUTUSAN RASMI (Numbered items 1, 2, 3... with + button) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/55 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                      Ringkasan Aktiviti &amp; Keputusan Rasmi
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Senarai bernombor ({ringkasanItems.length} item)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateOprListSection(
                        'ringkasan',
                        [...ringkasanItems, ''],
                        `Tambah Ringkasan Aktiviti #${ringkasanItems.length + 1}`
                      )
                    }
                    className="min-h-[32px] px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/40 text-sky-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                    title="Tambah Ringkasan Aktiviti Baru"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah No. {ringkasanItems.length + 1}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {ringkasanItems.map((item, idx) => (
                    <div key={`ringkasan-${idx}`} className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-400/35 font-mono font-bold text-[11px] text-sky-300 flex items-center justify-center shrink-0 mt-1.5 tabular-nums">
                        {idx + 1}
                      </span>
                      <textarea
                        rows={2}
                        value={item}
                        onChange={(e) => {
                          const next = [...ringkasanItems];
                          next[idx] = e.target.value;
                          updateOprListSection(
                            'ringkasan',
                            next,
                            `Kemaskini Ringkasan Aktiviti #${idx + 1}`
                          );
                        }}
                        placeholder={`Masukkan ringkasan aktiviti / keputusan ke-${idx + 1}...`}
                        className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs leading-relaxed"
                      />
                      {ringkasanItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = ringkasanItems.filter((_, i) => i !== idx);
                            updateOprListSection(
                              'ringkasan',
                              next,
                              `Padam Ringkasan Aktiviti #${idx + 1}`
                            );
                          }}
                          className="w-7 h-7 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 border border-rose-400/30 text-rose-300 flex items-center justify-center shrink-0 mt-1.5 cursor-pointer transition-colors"
                          title={`Padam Ringkasan #${idx + 1}`}
                          aria-label={`Padam Ringkasan #${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. KEKUATAN / IMPAK PROGRAM (Numbered items 1, 2, 3... with + button) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/55 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Kekuatan / Impak
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Senarai bernombor ({kekuatanItems.length} item)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateOprListSection(
                        'kekuatan',
                        [...kekuatanItems, ''],
                        `Tambah Kekuatan / Impak #${kekuatanItems.length + 1}`
                      )
                    }
                    className="min-h-[32px] px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/40 text-amber-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                    title="Tambah Kekuatan / Impak Baru"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah No. {kekuatanItems.length + 1}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {kekuatanItems.map((item, idx) => (
                    <div key={`kekuatan-${idx}`} className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/35 font-mono font-bold text-[11px] text-amber-300 flex items-center justify-center shrink-0 mt-1.5 tabular-nums">
                        {idx + 1}
                      </span>
                      <textarea
                        rows={2}
                        value={item}
                        onChange={(e) => {
                          const next = [...kekuatanItems];
                          next[idx] = e.target.value;
                          updateOprListSection(
                            'kekuatan',
                            next,
                            `Kemaskini Kekuatan / Impak #${idx + 1}`
                          );
                        }}
                        placeholder={`Masukkan kekuatan / impak program ke-${idx + 1}...`}
                        className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs leading-relaxed"
                      />
                      {kekuatanItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = kekuatanItems.filter((_, i) => i !== idx);
                            updateOprListSection(
                              'kekuatan',
                              next,
                              `Padam Kekuatan / Impak #${idx + 1}`
                            );
                          }}
                          className="w-7 h-7 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 border border-rose-400/30 text-rose-300 flex items-center justify-center shrink-0 mt-1.5 cursor-pointer transition-colors"
                          title={`Padam Kekuatan #${idx + 1}`}
                          aria-label={`Padam Kekuatan #${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. PENAMBAHBAIKAN (Numbered items 1, 2, 3... with + button) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/55 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                      Penambahbaikan
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Senarai bernombor ({penambahbaikanItems.length} item)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateOprListSection(
                        'penambahbaikan',
                        [...penambahbaikanItems, ''],
                        `Tambah Penambahbaikan #${penambahbaikanItems.length + 1}`
                      )
                    }
                    className="min-h-[32px] px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/35 border border-purple-400/40 text-purple-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                    title="Tambah Cadangan Penambahbaikan Baru"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah No. {penambahbaikanItems.length + 1}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {penambahbaikanItems.map((item, idx) => (
                    <div key={`penambahbaikan-${idx}`} className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-400/35 font-mono font-bold text-[11px] text-purple-300 flex items-center justify-center shrink-0 mt-1.5 tabular-nums">
                        {idx + 1}
                      </span>
                      <textarea
                        rows={2}
                        value={item}
                        onChange={(e) => {
                          const next = [...penambahbaikanItems];
                          next[idx] = e.target.value;
                          updateOprListSection(
                            'penambahbaikan',
                            next,
                            `Kemaskini Penambahbaikan #${idx + 1}`
                          );
                        }}
                        placeholder={`Masukkan cadangan penambahbaikan ke-${idx + 1}...`}
                        className="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs leading-relaxed"
                      />
                      {penambahbaikanItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = penambahbaikanItems.filter((_, i) => i !== idx);
                            updateOprListSection(
                              'penambahbaikan',
                              next,
                              `Padam Penambahbaikan #${idx + 1}`
                            );
                          }}
                          className="w-7 h-7 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 border border-rose-400/30 text-rose-300 flex items-center justify-center shrink-0 mt-1.5 cursor-pointer transition-colors"
                          title={`Padam Penambahbaikan #${idx + 1}`}
                          aria-label={`Padam Penambahbaikan #${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Editable Signatories Section (Disediakan, Disemak, Disahkan & Jawatan) */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <p className="text-xs font-bold text-amber-400">
                  Maklumat Pengesahan Laporan OPR (Boleh Diedit):
                </p>

                {/* 1. Disediakan Oleh */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 space-y-2">
                  <p className="text-[11px] font-bold text-emerald-300">
                    1. Disediakan Oleh:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Nama Penyedia
                      </label>
                      <input
                        type="text"
                        value={state.oprData.disediakanOleh}
                        onChange={(e) =>
                          onUpdateOPR(
                            { ...state.oprData, disediakanOleh: e.target.value },
                            'Kemaskini nama Disediakan Oleh pada OPR'
                          )
                        }
                        placeholder="Nama pegawai penyedia"
                        className="w-full min-h-[36px] px-2.5 py-1.5 rounded-lg glass-input text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Jawatan Penyedia
                      </label>
                      <input
                        type="text"
                        value={state.oprData.jawatanPenyedia}
                        onChange={(e) =>
                          onUpdateOPR(
                            { ...state.oprData, jawatanPenyedia: e.target.value },
                            'Kemaskini jawatan Disediakan Oleh pada OPR'
                          )
                        }
                        placeholder="Jawatan penyedia"
                        className="w-full min-h-[36px] px-2.5 py-1.5 rounded-lg glass-input text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Disemak Oleh */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 space-y-2">
                  <p className="text-[11px] font-bold text-sky-300">
                    2. Disemak Oleh:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Nama Penyemak
                      </label>
                      <input
                        type="text"
                        value={state.oprData.disemakOleh}
                        onChange={(e) =>
                          onUpdateOPR(
                            { ...state.oprData, disemakOleh: e.target.value },
                            'Kemaskini nama Disemak Oleh pada OPR'
                          )
                        }
                        placeholder="Nama pegawai penyemak"
                        className="w-full min-h-[36px] px-2.5 py-1.5 rounded-lg glass-input text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Jawatan Penyemak
                      </label>
                      <input
                        type="text"
                        value={state.oprData.jawatanPenyemak}
                        onChange={(e) =>
                          onUpdateOPR(
                            { ...state.oprData, jawatanPenyemak: e.target.value },
                            'Kemaskini jawatan Disemak Oleh pada OPR'
                          )
                        }
                        placeholder="Jawatan penyemak"
                        className="w-full min-h-[36px] px-2.5 py-1.5 rounded-lg glass-input text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Disahkan Oleh */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 space-y-2">
                  <p className="text-[11px] font-bold text-amber-300">
                    3. Disahkan Oleh:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Nama Pengesah
                      </label>
                      <input
                        type="text"
                        value={state.oprData.disahkanOleh}
                        onChange={(e) =>
                          onUpdateOPR(
                            { ...state.oprData, disahkanOleh: e.target.value },
                            'Kemaskini nama Disahkan Oleh pada OPR'
                          )
                        }
                        placeholder="Nama pegawai pengesah"
                        className="w-full min-h-[36px] px-2.5 py-1.5 rounded-lg glass-input text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Jawatan Pengesah
                      </label>
                      <input
                        type="text"
                        value={state.oprData.jawatanPengesah}
                        onChange={(e) =>
                          onUpdateOPR(
                            { ...state.oprData, jawatanPengesah: e.target.value },
                            'Kemaskini jawatan Disahkan Oleh pada OPR'
                          )
                        }
                        placeholder="Jawatan pengesah"
                        className="w-full min-h-[36px] px-2.5 py-1.5 rounded-lg glass-input text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Photo Upload Slots */}
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs font-bold text-emerald-300 mb-2.5 flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  <span>Muat Naik &amp; Edit 4 Gambar Dokumentasi (Telefon / Dron):</span>
                </p>
                <div className="space-y-2.5">
                  {state.oprData.photos.map((ph, idx) => (
                    <div
                      key={ph.id}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="text-[11px] font-mono font-bold text-amber-300 shrink-0">
                            #{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={ph.tag}
                            onChange={(e) => {
                              const nextPhotos = state.oprData.photos.map((item) =>
                                item.id === ph.id ? { ...item, tag: e.target.value } : item
                              );
                              onUpdateOPR(
                                { ...state.oprData, photos: nextPhotos },
                                `Kemaskini label/hari gambar OPR #${idx + 1}`
                              );
                            }}
                            placeholder="Label Hari / LDK"
                            className="w-full min-h-[30px] px-2 py-0.5 rounded-lg glass-input text-[11px] font-bold text-amber-200"
                          />
                        </div>
                        <label className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-[11px] font-semibold text-emerald-200 cursor-pointer shrink-0">
                          Pilih Gambar
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePhotoUpload(ph.id, e.target.files?.[0])}
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={ph.caption}
                        onChange={(e) => {
                          const nextPhotos = state.oprData.photos.map((item) =>
                            item.id === ph.id ? { ...item, caption: e.target.value } : item
                          );
                          onUpdateOPR(
                            { ...state.oprData, photos: nextPhotos },
                            `Kemaskini kapsyen gambar OPR #${idx + 1}`
                          );
                        }}
                        placeholder="Kapsyen gambar aktiviti..."
                        className="w-full min-h-[34px] px-2.5 py-1 rounded-lg glass-input text-[11px]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isExportingOPR}
              onClick={handleDownloadOPRPDF}
              className="w-full min-h-[44px] sm:min-h-[46px] px-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer text-center"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>
                {isExportingOPR
                  ? 'Sedang Menjana Fail PDF OPR...'
                  : 'Muat Turun Laporan OPR (PDF)'}
              </span>
            </button>
          </div>

          {/* Right Column: Live Visual A4 Preview of the One Page Report (OPR) */}
          <div className="lg:col-span-7 glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-white/10">
              <div>
                <h3 className="font-display font-bold text-sm sm:text-lg text-white">
                  Pratonton Rasmi One Page Report (OPR) SK Lupak 2026
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  Format standard rekod dokumentasi kokurikulum sekolah (Tersusun Mengikut Nombor)
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadOPRPDF}
                className="min-h-[34px] sm:min-h-[38px] px-3 sm:px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-[11px] sm:text-xs font-semibold text-emerald-300 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Cetak / PDF</span>
              </button>
            </div>

            {/* Simulated A4 Paper Sheet */}
            <div className="mt-3.5 sm:mt-4 rounded-2xl bg-white text-slate-900 p-4 sm:p-7 shadow-2xl space-y-3.5 sm:space-y-4">
              {/* OPR Top Banner */}
              <div className="rounded-xl bg-[#062c2b] text-white p-3.5 sm:p-4 text-center">
                <p className="text-[9px] sm:text-[10px] font-bold tracking-widest text-amber-300">
                  SEKOLAH KEBANGSAAN LUPAK
                </p>
                <h4 className="font-display font-extrabold text-sm sm:text-lg mt-0.5 leading-snug">
                  ONE PAGE REPORT (OPR) — LAPORAN AKTIVITI KOKURIKULUM
                </h4>
                <p className="text-[11px] sm:text-xs text-emerald-200 font-semibold mt-0.5">
                  {state.oprData.namaProgram}
                </p>
              </div>

              {/* Metadata Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] sm:text-xs bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-700">Anjuran:</span>{' '}
                  <span className="text-slate-900">{state.oprData.anjuran}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Tarikh &amp; Masa:</span>{' '}
                  <span className="text-slate-900">
                    {state.oprData.tarikh} ({state.oprData.masa})
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Tempat:</span>{' '}
                  <span className="text-slate-900">{state.oprData.tempat}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Sasaran:</span>{' '}
                  <span className="text-slate-900">{state.oprData.sasaran}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-bold text-slate-700">Kehadiran Peserta:</span>{' '}
                  <span className="text-slate-900">{state.oprData.kehadiran}</span>
                </div>
              </div>

              {/* Objectives & Summary (Both Numbered 1, 2, 3...) */}
              <div className="space-y-2.5 text-[11px] sm:text-xs">
                <div className="p-3 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-900 uppercase tracking-wide text-[10px] sm:text-[11px] mb-1.5">
                    Objektif Program:
                  </p>
                  <ol className="list-decimal list-outside pl-4 space-y-1 text-slate-700 leading-relaxed">
                    {objektifItems
                      .filter((it) => it.trim().length > 0)
                      .map((obj, i) => (
                        <li key={i} className="pl-0.5">
                          {obj}
                        </li>
                      ))}
                  </ol>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-emerald-50/40">
                  <p className="font-bold text-emerald-950 uppercase tracking-wide text-[10px] sm:text-[11px] mb-1.5">
                    Ringkasan Aktiviti &amp; Keputusan Rasmi:
                  </p>
                  <ol className="list-decimal list-outside pl-4 space-y-1 text-slate-700 leading-relaxed">
                    {ringkasanItems
                      .filter((it) => it.trim().length > 0)
                      .map((item, i) => (
                        <li key={i} className="pl-0.5">
                          {item}
                        </li>
                      ))}
                  </ol>
                </div>
              </div>

              {/* Strengths & Improvements (Both Numbered 1, 2, 3...) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] sm:text-xs">
                <div className="p-3 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-900 text-[10px] sm:text-[11px] uppercase mb-1.5">
                    Kekuatan / Impak:
                  </p>
                  <ol className="list-decimal list-outside pl-4 space-y-1 text-slate-700 leading-relaxed">
                    {kekuatanItems
                      .filter((it) => it.trim().length > 0)
                      .map((item, i) => (
                        <li key={i} className="pl-0.5">
                          {item}
                        </li>
                      ))}
                  </ol>
                </div>
                <div className="p-3 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-900 text-[10px] sm:text-[11px] uppercase mb-1.5">
                    Penambahbaikan:
                  </p>
                  <ol className="list-decimal list-outside pl-4 space-y-1 text-slate-700 leading-relaxed">
                    {penambahbaikanItems
                      .filter((it) => it.trim().length > 0)
                      .map((item, i) => (
                        <li key={i} className="pl-0.5">
                          {item}
                        </li>
                      ))}
                  </ol>
                </div>
              </div>

              {/* 2x2 Photo Grid */}
              <div>
                <p className="font-bold text-slate-900 text-[10px] sm:text-[11px] uppercase mb-2">
                  Gambar Dokumentasi Aktiviti Perkhemahan:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {state.oprData.photos.map((ph) => (
                    <div
                      key={ph.id}
                      className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                    >
                      <div className="h-32 w-full bg-slate-900 overflow-hidden">
                        <img
                          src={ph.dataUrl}
                          alt={ph.caption}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2 bg-white">
                        <p className="text-[10px] font-bold text-emerald-800">{ph.tag}</p>
                        <p className="text-[11px] text-slate-700 line-clamp-1">{ph.caption}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signatures Footer */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-700">
                <div>
                  <p className="text-slate-400">Disediakan oleh:</p>
                  <p className="font-bold text-slate-900 mt-1.5 sm:mt-3">{state.oprData.disediakanOleh}</p>
                  <p className="text-[10px]">{state.oprData.jawatanPenyedia}</p>
                </div>
                <div>
                  <p className="text-slate-400">Disemak oleh:</p>
                  <p className="font-bold text-slate-900 mt-1.5 sm:mt-3">{state.oprData.disemakOleh}</p>
                  <p className="text-[10px]">{state.oprData.jawatanPenyemak}</p>
                </div>
                <div>
                  <p className="text-slate-400">Disahkan oleh:</p>
                  <p className="font-bold text-slate-900 mt-1.5 sm:mt-3">{state.oprData.disahkanOleh}</p>
                  <p className="text-[10px]">{state.oprData.jawatanPengesah}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

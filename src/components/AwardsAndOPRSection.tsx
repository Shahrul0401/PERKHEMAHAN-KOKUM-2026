import React, { useState } from 'react';
import {
  Award,
  Camera,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { AwardItem, CampAppState, OPRReportData } from '../types/camp';
import { exportKeputusanPDF, exportOPRPDF } from '../utils/pdfExporter';

interface AwardsAndOPRSectionProps {
  state: CampAppState;
  onUpdateAwards: (awards: AwardItem[], desc: string) => void;
  onUpdateOPR: (opr: OPRReportData, desc: string) => void;
}

export const AwardsAndOPRSection: React.FC<AwardsAndOPRSectionProps> = ({
  state,
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
    const next = state.awards.map((a) =>
      a.id === id ? { ...a, winner: newWinner } : a
    );
    const target = state.awards.find((a) => a.id === id);
    onUpdateAwards(next, `Kemaskini pemenang ${target?.title}: ${newWinner}`);
  };

  const handleTitleChange = (id: string, newTitle: string) => {
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
                <span className="text-[11px] sm:text-xs text-slate-400">Pilih / Taip Nama Kumpulan</span>
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
                      {aw.order <= 7 ? (
                        <select
                          value={
                            state.groups.some((g) => aw.winner.startsWith(g.name))
                              ? state.groups.find((g) => aw.winner.startsWith(g.name))!.name
                              : aw.winner
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
                        <input
                          type="text"
                          value={aw.winner}
                          onChange={(e) => handleWinnerChange(aw.id, e.target.value)}
                          placeholder="Nama Komandan Terbaik"
                          className="w-full min-h-[40px] px-3 py-1.5 rounded-xl glass-input text-xs font-bold text-amber-300"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* KATEGORI KAWAD KAKI TERBAIK & 6 KADET TERBAIK */}
            <div className="lg:col-span-5 space-y-6">
              {/* KATEGORI KAWAD KAKI TERBAIK */}
              <div className="glass-panel rounded-3xl p-5 sm:p-6">
                <h3 className="font-display font-bold text-lg text-white pb-3.5 border-b border-white/10 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>KATEGORI KAWAD KAKI TERBAIK</span>
                </h3>
                <div className="mt-4 space-y-3">
                  {kawadAwards.map((aw) => (
                    <div
                      key={aw.id}
                      className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-amber-300">
                          #{aw.order} · {aw.title}
                        </span>
                        <span className="text-slate-400">Unit Uniform</span>
                      </div>
                      <input
                        type="text"
                        value={aw.winner}
                        onChange={(e) => handleWinnerChange(aw.id, e.target.value)}
                        list="uniform-units-list"
                        className="w-full min-h-[40px] px-3 py-1.5 rounded-xl glass-input text-xs font-bold text-white"
                      />
                    </div>
                  ))}
                  <datalist id="uniform-units-list">
                    <option value="TUNAS KADET REMAJA SEKOLAH" />
                    <option value="PENGAKAP" />
                    <option value="PERGERAKAN PUTERI ISLAM MALAYSIA" />
                  </datalist>
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
                          onChange={(e) => handleTitleChange(aw.id, e.target.value)}
                          placeholder="Nama Kategori Anugerah (cth: Kadet Terbaik TKRS - Putera)"
                          aria-label={`Nama Anugerah Kadet ${aw.order}`}
                          className="w-full min-h-[36px] px-3 py-1 rounded-xl glass-input text-xs font-bold text-amber-300"
                        />
                      </div>
                      <input
                        type="text"
                        value={aw.winner}
                        onChange={(e) => handleWinnerChange(aw.id, e.target.value)}
                        placeholder="Nama Penerima / Pemenang"
                        aria-label={`Pemenang Anugerah Kadet ${aw.order}`}
                        className="w-full min-h-[38px] px-3 py-1.5 rounded-xl glass-input text-xs text-emerald-200 font-medium"
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
          {/* Left Column: Interactive Form to Customize OPR Content & Upload Photos */}
          <div className="lg:col-span-5 glass-panel rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-lg text-white">
                 Kemaskini Kandungan One Page Report (OPR)
              </h3>
              <p className="text-xs text-slate-300">
                Sunting maklumat laporan atau muat naik gambar aktiviti sebenar sebelum eksport ke PDF.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Program
                </label>
                <input
                  type="text"
                  value={state.oprData.namaProgram}
                  onChange={(e) =>
                    onUpdateOPR(
                      { ...state.oprData, namaProgram: e.target.value },
                      'Kemaskini tajuk OPR'
                    )
                  }
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl glass-input text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tarikh Pelaksanaan
                  </label>
                  <input
                    type="text"
                    value={state.oprData.tarikh}
                    onChange={(e) =>
                      onUpdateOPR(
                        { ...state.oprData, tarikh: e.target.value },
                        'Kemaskini tarikh OPR'
                      )
                    }
                    className="w-full min-h-[40px] px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kehadiran Peserta
                  </label>
                  <input
                    type="text"
                    value={state.oprData.kehadiran}
                    onChange={(e) =>
                      onUpdateOPR(
                        { ...state.oprData, kehadiran: e.target.value },
                        'Kemaskini kehadiran OPR'
                      )
                    }
                    className="w-full min-h-[40px] px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ringkasan Pelaksanaan Aktiviti
                </label>
                <textarea
                  rows={3}
                  value={state.oprData.ringkasanAktiviti}
                  onChange={(e) =>
                    onUpdateOPR(
                      { ...state.oprData, ringkasanAktiviti: e.target.value },
                      'Kemaskini ringkasan aktiviti OPR'
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kekuatan / Impak Program
                </label>
                <textarea
                  rows={2}
                  value={state.oprData.kekuatan}
                  onChange={(e) =>
                    onUpdateOPR(
                      { ...state.oprData, kekuatan: e.target.value },
                      'Kemaskini kekuatan OPR'
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cadangan Penambahbaikan
                </label>
                <textarea
                  rows={2}
                  value={state.oprData.penambahbaikan}
                  onChange={(e) =>
                    onUpdateOPR(
                      { ...state.oprData, penambahbaikan: e.target.value },
                      'Kemaskini penambahbaikan OPR'
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs leading-relaxed"
                />
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
                  <span>Muat Naik 4 Gambar Dokumentasi (Telefon / Dron):</span>
                </p>
                <div className="space-y-2.5">
                  {state.oprData.photos.map((ph, idx) => (
                    <div
                      key={ph.id}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono font-bold text-amber-300">
                          Gambar #{idx + 1}: {ph.tag}
                        </span>
                        <label className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-[11px] font-semibold text-emerald-200 cursor-pointer">
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
                        className="w-full min-h-[34px] px-2.5 py-1 rounded-lg glass-input text-[11px]"
                      />
                    </div>
                  ))}
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
          </div>

          {/* Right Column: Live Visual A4 Preview of the One Page Report (OPR) */}
          <div className="lg:col-span-7 glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-white/10">
              <div>
                <h3 className="font-display font-bold text-sm sm:text-lg text-white">
                  Pratonton Rasmi One Page Report (OPR) SK Lupak 2026
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  Format standard rekod dokumentasi kokurikulum sekolah
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
                  <span className="font-bold text-slate-700">Sasaran &amp; Kehadiran:</span>{' '}
                  <span className="text-slate-900">{state.oprData.kehadiran}</span>
                </div>
              </div>

              {/* Objectives & Summary */}
              <div className="space-y-2 text-[11px] sm:text-xs">
                <div className="p-3 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-900 uppercase tracking-wide text-[10px] sm:text-[11px] mb-1">
                    Objektif Program:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700 leading-relaxed">
                    {state.oprData.objektif.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ol>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-emerald-50/40">
                  <p className="font-bold text-emerald-950 uppercase tracking-wide text-[10px] sm:text-[11px] mb-1">
                    Ringkasan Aktiviti &amp; Keputusan Rasmi:
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    {state.oprData.ringkasanAktiviti}
                  </p>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] sm:text-xs">
                <div className="p-3 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-900 text-[10px] sm:text-[11px] uppercase mb-1">
                    Kekuatan / Impak:
                  </p>
                  <p className="text-slate-700 leading-relaxed">{state.oprData.kekuatan}</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-900 text-[10px] sm:text-[11px] uppercase mb-1">
                    Penambahbaikan:
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    {state.oprData.penambahbaikan}
                  </p>
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

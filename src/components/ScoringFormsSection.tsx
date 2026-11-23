import React, { useState } from 'react';
import {
  BarChart3,
  Flame,
  Flag,
  Minus,
  Plus,
  Trophy,
} from 'lucide-react';
import {
  ExploraceScoresMap,
  ExploraceStation,
  GroupInfo,
  IkhtiarHidupScore,
  IkhtiarHidupScoresMap,
  KawadKakiScore,
  KawadKakiScoresMap,
  UniformUnit,
} from '../types/camp';

import { AdminAccessBanner } from './AdminPasswordModal';

interface ScoringFormsSectionProps {
  groups: GroupInfo[];
  uniformUnits: UniformUnit[];
  stations: ExploraceStation[];
  exploraceScores: ExploraceScoresMap;
  ikhtiarScores: IkhtiarHidupScoresMap;
  kawadScores: KawadKakiScoresMap;
  isEditUnlocked: boolean;
  onRequestUnlock: () => void;
  onLockAgain: () => void;
  onUpdateIkhtiar: (groupId: string, updated: IkhtiarHidupScore, desc: string) => void;
  onUpdateKawad: (unitId: string, updated: KawadKakiScore, desc: string) => void;
}

export const ScoringFormsSection: React.FC<ScoringFormsSectionProps> = ({
  groups,
  uniformUnits,
  stations,
  exploraceScores,
  ikhtiarScores,
  kawadScores,
  isEditUnlocked,
  onRequestUnlock,
  onLockAgain,
  onUpdateIkhtiar,
  onUpdateKawad,
}) => {
  const [activeTab, setActiveTab] = useState<'IKHTIAR' | 'KAWAD' | 'CHARTS'>('IKHTIAR');

  // Helper to update Ikhtiar Hidup field safely (requires admin password unlock)
  const handleIkhtiarField = (
    group: GroupInfo,
    field: keyof IkhtiarHidupScore,
    maxVal: number,
    rawVal: number
  ) => {
    if (!isEditUnlocked) {
      onRequestUnlock();
      return;
    }
    const current = ikhtiarScores[group.id] || { kerjasama: 0, penyediaan: 0, rasa: 0 };
    const clamped = Math.max(0, Math.min(maxVal, Math.round(rawVal)));
    const next = { ...current, [field]: clamped };
    onUpdateIkhtiar(
      group.id,
      next,
      `Kemaskini markah Ikhtiar Hidup ${group.name} (${field}: ${clamped}/${maxVal})`
    );
  };

  // Helper to update Kawad Kaki field safely (requires admin password unlock)
  const handleKawadField = (
    unit: UniformUnit,
    field: keyof KawadKakiScore,
    maxVal: number,
    rawVal: number
  ) => {
    if (!isEditUnlocked) {
      onRequestUnlock();
      return;
    }
    const current = kawadScores[unit.id] || { arahan: 0, keseragaman: 0, nadaSuara: 0 };
    const clamped = Math.max(0, Math.min(maxVal, Math.round(rawVal)));
    const next = { ...current, [field]: clamped };
    onUpdateKawad(
      unit.id,
      next,
      `Kemaskini markah Kawad Kaki ${unit.name} (${field}: ${clamped}/${maxVal})`
    );
  };

  // Compute aggregated metrics for Automatic Charts
  const maxExplorace = stations.reduce((acc, s) => acc + s.maxMarks, 0);
  const groupMetrics = groups.map((grp) => {
    const expTotal = stations.reduce(
      (sum, st) => sum + (exploraceScores[grp.id]?.[st.id] ?? 0),
      0
    );
    const ikh = ikhtiarScores[grp.id] || { kerjasama: 0, penyediaan: 0, rasa: 0 };
    const ikhTotal = ikh.kerjasama + ikh.penyediaan + ikh.rasa;
    const grandTotal = expTotal + ikhTotal;
    return {
      group: grp,
      expTotal,
      ikh,
      ikhTotal,
      grandTotal,
    };
  });

  const rankedByGrand = [...groupMetrics].sort((a, b) => b.grandTotal - a.grandTotal);
  const rankedByIkhtiar = [...groupMetrics].sort((a, b) => b.ikhTotal - a.ikhTotal);

  const kawadMetrics = uniformUnits
    .map((u) => {
      const sc = kawadScores[u.id] || { arahan: 0, keseragaman: 0, nadaSuara: 0 };
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Form Switcher */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-amber-400 font-bold">
            <span>BORANG PEMARKAHAN RASMI</span>
            <span aria-hidden="true">·</span>
            <span>AJK PENILAIAN: TN HJ SABLI BIN MAT JANEH/ EN SALLEH BIN SALIP/ PN JUHANI BINTI NORMAN</span>
          </div>
          <h2 className="mt-1 font-display font-bold text-base sm:text-xl lg:text-2xl text-white leading-snug">
            Borang Pemarkahan Ikhtiar Hidup, Kawad Kaki &amp; Carta Automatik
          </h2>
          <p className="mt-1 text-[11px] sm:text-sm text-slate-300 leading-relaxed">
            Rubrik rasmi mengikut lampiran Borang Pemarkahan SK Lupak beserta analisis kedudukan masa nyata.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:flex items-center p-1 rounded-xl bg-[#112233]/90 border border-white/10 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('IKHTIAR')}
            className={`min-h-[36px] sm:min-h-[38px] px-1.5 sm:px-3.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer text-center ${
              activeTab === 'IKHTIAR'
                ? 'bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="leading-tight">Ikhtiar Hidup</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('KAWAD')}
            className={`min-h-[36px] sm:min-h-[38px] px-1.5 sm:px-3.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer text-center ${
              activeTab === 'KAWAD'
                ? 'bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Flag className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="leading-tight">Kawad Asas</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CHARTS')}
            className={`min-h-[36px] sm:min-h-[38px] px-1.5 sm:px-3.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer text-center ${
              activeTab === 'CHARTS'
                ? 'bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="leading-tight">Carta Markah</span>
          </button>
        </div>
      </div>

      {/* Password / View-Only Status Banner */}
      <AdminAccessBanner
        isUnlocked={isEditUnlocked}
        sectionName="Komponen Pemarkahan (Ikhtiar Hidup & Kawad Kaki)"
        onRequestUnlock={onRequestUnlock}
        onLockAgain={onLockAgain}
      />

      {/* TAB 1: BORANG PEMARKAHAN IKHTIAR HIDUP */}
      {activeTab === 'IKHTIAR' && (
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6">
          <div className="pb-3.5 sm:pb-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-sm sm:text-lg text-white">
                BORANG PEMARKAHAN IKHTIAR HIDUP (LDK 4 — MASAKAN RIMBA)
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                Pecahan Penilaian: Kerjasama (30%) &nbsp;·&nbsp; Penyediaan Makanan (30%) &nbsp;·&nbsp; Rasa Masakan (40%) &nbsp;=&nbsp; Jumlah Markah (100%)
              </p>
            </div>
            <span className="font-mono text-[11px] sm:text-xs text-amber-400 font-bold">
              Juara Semasa: {rankedByIkhtiar[0]?.group.name} ({rankedByIkhtiar[0]?.ikhTotal}%)
            </span>
          </div>

          {/* Mobile Card Layout (No Horizontal Overflow on Mobile) */}
          <div className="mt-3.5 space-y-3 md:hidden">
            {groups.map((grp) => {
              const sc = ikhtiarScores[grp.id] || {
                kerjasama: 0,
                penyediaan: 0,
                rasa: 0,
              };
              const total = sc.kerjasama + sc.penyediaan + sc.rasa;
              return (
                <div
                  key={grp.id}
                  className="p-3.5 rounded-2xl bg-[#112233]/85 border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs text-slate-950 shrink-0"
                        style={{ backgroundColor: grp.colorHex }}
                      >
                        {grp.number}
                      </span>
                      <div className="min-w-0">
                        <div className="font-display font-bold text-sm text-white leading-tight">
                          {grp.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {grp.guruKumpulan}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block">Jumlah</span>
                      <span className="font-mono font-extrabold text-base text-amber-400 tabular-nums">
                        {total}%
                      </span>
                    </div>
                  </div>

                  {/* 3 Rubric Rows */}
                  {(
                    [
                      { key: 'kerjasama' as const, label: 'Kerjasama (30%)', max: 30, val: sc.kerjasama },
                      { key: 'penyediaan' as const, label: 'Penyediaan Makanan (30%)', max: 30, val: sc.penyediaan },
                      { key: 'rasa' as const, label: 'Rasa Masakan (40%)', max: 40, val: sc.rasa },
                    ]
                  ).map((rubric) => (
                    <div
                      key={rubric.key}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="text-[11px] font-medium text-slate-300">
                        {rubric.label}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            handleIkhtiarField(grp, rubric.key, rubric.max, rubric.val - 1)
                          }
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={rubric.max}
                          value={rubric.val}
                          readOnly={!isEditUnlocked}
                          onClick={() => {
                            if (!isEditUnlocked) onRequestUnlock();
                          }}
                          onChange={(e) =>
                            handleIkhtiarField(grp, rubric.key, rubric.max, Number(e.target.value))
                          }
                          className={`w-13 h-8 text-center rounded-lg glass-input font-mono font-bold text-xs text-white tabular-nums ${
                            !isEditUnlocked ? 'cursor-pointer opacity-80' : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleIkhtiarField(grp, rubric.key, rubric.max, rubric.val + 1)
                          }
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Desktop Table Layout */}
          <div className="mt-4 hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[780px]">
              <thead>
                <tr className="bg-[#112233]/95 text-white text-xs font-display border-b border-white/15">
                  <th className="p-3.5 w-14 text-center border-r border-white/10">BIL</th>
                  <th className="p-3.5 border-r border-white/10">KUMPULAN</th>
                  <th className="p-3.5 text-center border-r border-white/10">
                    KERJASAMA (30%)
                  </th>
                  <th className="p-3.5 text-center border-r border-white/10">
                    PENYEDIAAN MAKANAN (30%)
                  </th>
                  <th className="p-3.5 text-center border-r border-white/10">
                    RASA MASAKAN (40%)
                  </th>
                  <th className="p-3.5 text-center text-amber-400">
                    JUMLAH MARKAH (100%)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-xs sm:text-sm">
                {groups.map((grp) => {
                  const sc = ikhtiarScores[grp.id] || {
                    kerjasama: 0,
                    penyediaan: 0,
                    rasa: 0,
                  };
                  const total = sc.kerjasama + sc.penyediaan + sc.rasa;
                  return (
                    <tr key={grp.id} className="hover:bg-white/[0.03]">
                      <td className="p-3 text-center font-mono font-bold text-slate-300 border-r border-white/10 tabular-nums">
                        {grp.number}
                      </td>
                      <td className="p-3 border-r border-white/10">
                        <div className="font-display font-bold text-white">{grp.name}</div>
                        <div className="text-[11px] text-slate-400">{grp.guruKumpulan}</div>
                      </td>

                      {/* Kerjasama (30%) */}
                      <td className="p-3 border-r border-white/10">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleIkhtiarField(grp, 'kerjasama', 30, sc.kerjasama - 1)
                            }
                            className="min-h-[38px] min-w-[38px] rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min={0}
                            max={30}
                            value={sc.kerjasama}
                            readOnly={!isEditUnlocked}
                            onClick={() => {
                              if (!isEditUnlocked) onRequestUnlock();
                            }}
                            onChange={(e) =>
                              handleIkhtiarField(grp, 'kerjasama', 30, Number(e.target.value))
                            }
                            className={`w-16 min-h-[38px] text-center rounded-lg glass-input font-mono font-bold text-sm text-white tabular-nums ${
                              !isEditUnlocked ? 'cursor-pointer opacity-80' : ''
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleIkhtiarField(grp, 'kerjasama', 30, sc.kerjasama + 1)
                            }
                            className="min-h-[38px] min-w-[38px] rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Penyediaan Makanan (30%) */}
                      <td className="p-3 border-r border-white/10">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleIkhtiarField(grp, 'penyediaan', 30, sc.penyediaan - 1)
                            }
                            className="min-h-[38px] min-w-[38px] rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min={0}
                            max={30}
                            value={sc.penyediaan}
                            readOnly={!isEditUnlocked}
                            onClick={() => {
                              if (!isEditUnlocked) onRequestUnlock();
                            }}
                            onChange={(e) =>
                              handleIkhtiarField(grp, 'penyediaan', 30, Number(e.target.value))
                            }
                            className={`w-16 min-h-[38px] text-center rounded-lg glass-input font-mono font-bold text-sm text-white tabular-nums ${
                              !isEditUnlocked ? 'cursor-pointer opacity-80' : ''
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleIkhtiarField(grp, 'penyediaan', 30, sc.penyediaan + 1)
                            }
                            className="min-h-[38px] min-w-[38px] rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Rasa Masakan (40%) */}
                      <td className="p-3 border-r border-white/10">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleIkhtiarField(grp, 'rasa', 40, sc.rasa - 1)}
                            className="min-h-[38px] min-w-[38px] rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min={0}
                            max={40}
                            value={sc.rasa}
                            readOnly={!isEditUnlocked}
                            onClick={() => {
                              if (!isEditUnlocked) onRequestUnlock();
                            }}
                            onChange={(e) =>
                              handleIkhtiarField(grp, 'rasa', 40, Number(e.target.value))
                            }
                            className={`w-16 min-h-[38px] text-center rounded-lg glass-input font-mono font-bold text-sm text-white tabular-nums ${
                              !isEditUnlocked ? 'cursor-pointer opacity-80' : ''
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => handleIkhtiarField(grp, 'rasa', 40, sc.rasa + 1)}
                            className="min-h-[38px] min-w-[38px] rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Jumlah Markah (100%) */}
                      <td className="p-3 text-center font-mono font-extrabold text-base text-amber-400 tabular-nums">
                        {total}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BORANG PEMARKAHAN PERTANDINGAN KAWAD ASAS */}
      {activeTab === 'KAWAD' && (
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6">
          <div className="pb-3.5 sm:pb-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-sm sm:text-lg text-white">
                BORANG PEMARKAHAN PERTANDINGAN KAWAD ASAS (LDK 5 — UNIT BERUNIFORM)
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                Pecahan Penilaian: Penyampaian Arahan (40%) &nbsp;·&nbsp; Keseragaman (30%) &nbsp;·&nbsp; Nada Suara (30%) &nbsp;=&nbsp; Jumlah Markah (100%)
              </p>
            </div>
            <span className="font-mono text-[11px] sm:text-xs text-amber-400 font-bold">
              Mendahului Johan: {kawadMetrics[0]?.unit.name} ({kawadMetrics[0]?.total}%)
            </span>
          </div>

          {/* Mobile Card Layout for Kawad Kaki */}
          <div className="mt-3.5 space-y-3 md:hidden">
            {uniformUnits.map((unit) => {
              const sc = kawadScores[unit.id] || {
                arahan: 0,
                keseragaman: 0,
                nadaSuara: 0,
              };
              const total = sc.arahan + sc.keseragaman + sc.nadaSuara;
              const theme = getUnitLogoAndTheme(unit.name);
              return (
                <div
                  key={unit.id}
                  className={`p-3.5 rounded-2xl border space-y-3 ${theme.cardClass}`}
                >
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/15">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={theme.logo}
                        alt={unit.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 object-contain shrink-0 drop-shadow"
                      />
                      <span className="font-display font-bold text-sm text-white leading-tight">
                        {unit.name}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-200 block">Jumlah</span>
                      <span className="font-mono font-extrabold text-base text-amber-300 tabular-nums">
                        {total}%
                      </span>
                    </div>
                  </div>

                  {(
                    [
                      { key: 'arahan' as const, label: 'Penyampaian Arahan (40%)', max: 40, val: sc.arahan },
                      { key: 'keseragaman' as const, label: 'Keseragaman (30%)', max: 30, val: sc.keseragaman },
                      { key: 'nadaSuara' as const, label: 'Nada Suara (30%)', max: 30, val: sc.nadaSuara },
                    ]
                  ).map((rubric) => (
                    <div
                      key={rubric.key}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="text-[11px] font-medium text-white">
                        {rubric.label}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            handleKawadField(unit, rubric.key, rubric.max, rubric.val - 1)
                          }
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={rubric.max}
                          value={rubric.val}
                          readOnly={!isEditUnlocked}
                          onClick={() => {
                            if (!isEditUnlocked) onRequestUnlock();
                          }}
                          onChange={(e) =>
                            handleKawadField(unit, rubric.key, rubric.max, Number(e.target.value))
                          }
                          className={`w-13 h-8 text-center rounded-lg glass-input font-mono font-bold text-xs text-white tabular-nums ${
                            !isEditUnlocked ? 'cursor-pointer opacity-80' : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleKawadField(unit, rubric.key, rubric.max, rubric.val + 1)
                          }
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Desktop Table Layout */}
          <div className="mt-4 hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-[#112233]/95 text-white text-xs font-display border-b border-white/15">
                  <th className="p-3.5 w-14 text-center border-r border-white/10">BIL</th>
                  <th className="p-3.5 border-r border-white/10">
                    KUMPULAN / UNIT BERUNIFORM
                  </th>
                  <th className="p-3.5 text-center border-r border-white/10">
                    PENYAMPAIAN ARAHAN (40%)
                  </th>
                  <th className="p-3.5 text-center border-r border-white/10">
                    KESERAGAMAN (30%)
                  </th>
                  <th className="p-3.5 text-center border-r border-white/10">
                    NADA SUARA (30%)
                  </th>
                  <th className="p-3.5 text-center text-amber-400">
                    JUMLAH MARKAH (100%)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-xs sm:text-sm">
                {uniformUnits.map((unit) => {
                  const sc = kawadScores[unit.id] || {
                    arahan: 0,
                    keseragaman: 0,
                    nadaSuara: 0,
                  };
                  const total = sc.arahan + sc.keseragaman + sc.nadaSuara;
                  const theme = getUnitLogoAndTheme(unit.name);
                  return (
                    <tr key={unit.id} className="hover:bg-white/[0.03]">
                      <td className="p-4 text-center font-mono font-bold text-slate-300 border-r border-white/10 tabular-nums">
                        {unit.number}
                      </td>
                      <td className="p-4 font-display font-bold text-base text-white border-r border-white/10">
                        <div className="flex items-center gap-3">
                          <img
                            src={theme.logo}
                            alt={unit.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 object-contain shrink-0 drop-shadow"
                          />
                          <span>{unit.name}</span>
                        </div>
                      </td>

                      {/* Penyampaian Arahan (40%) */}
                      <td className="p-4 border-r border-white/10">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleKawadField(unit, 'arahan', 40, sc.arahan - 1)
                            }
                            className="min-h-[40px] min-w-[40px] rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min={0}
                            max={40}
                            value={sc.arahan}
                            readOnly={!isEditUnlocked}
                            onClick={() => {
                              if (!isEditUnlocked) onRequestUnlock();
                            }}
                            onChange={(e) =>
                              handleKawadField(unit, 'arahan', 40, Number(e.target.value))
                            }
                            className={`w-16 min-h-[40px] text-center rounded-lg glass-input font-mono font-bold text-sm text-white tabular-nums ${
                              !isEditUnlocked ? 'cursor-pointer opacity-80' : ''
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleKawadField(unit, 'arahan', 40, sc.arahan + 1)
                            }
                            className="min-h-[40px] min-w-[40px] rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Keseragaman (30%) */}
                      <td className="p-4 border-r border-white/10">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleKawadField(unit, 'keseragaman', 30, sc.keseragaman - 1)
                            }
                            className="min-h-[40px] min-w-[40px] rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min={0}
                            max={30}
                            value={sc.keseragaman}
                            readOnly={!isEditUnlocked}
                            onClick={() => {
                              if (!isEditUnlocked) onRequestUnlock();
                            }}
                            onChange={(e) =>
                              handleKawadField(
                                unit,
                                'keseragaman',
                                30,
                                Number(e.target.value)
                              )
                            }
                            className={`w-16 min-h-[40px] text-center rounded-lg glass-input font-mono font-bold text-sm text-white tabular-nums ${
                              !isEditUnlocked ? 'cursor-pointer opacity-80' : ''
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleKawadField(unit, 'keseragaman', 30, sc.keseragaman + 1)
                            }
                            className="min-h-[40px] min-w-[40px] rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Nada Suara (30%) */}
                      <td className="p-4 border-r border-white/10">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleKawadField(unit, 'nadaSuara', 30, sc.nadaSuara - 1)
                            }
                            className="min-h-[40px] min-w-[40px] rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min={0}
                            max={30}
                            value={sc.nadaSuara}
                            readOnly={!isEditUnlocked}
                            onClick={() => {
                              if (!isEditUnlocked) onRequestUnlock();
                            }}
                            onChange={(e) =>
                              handleKawadField(
                                unit,
                                'nadaSuara',
                                30,
                                Number(e.target.value)
                              )
                            }
                            className={`w-16 min-h-[40px] text-center rounded-lg glass-input font-mono font-bold text-sm text-white tabular-nums ${
                              !isEditUnlocked ? 'cursor-pointer opacity-80' : ''
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleKawadField(unit, 'nadaSuara', 30, sc.nadaSuara + 1)
                            }
                            className="min-h-[40px] min-w-[40px] rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Jumlah Markah (100%) */}
                      <td className="p-4 text-center font-mono font-extrabold text-lg text-amber-400 tabular-nums">
                        {total}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CARTA MARKAH AUTOMATIK (VISUAL ANALYTICS) */}
      {activeTab === 'CHARTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Combined Group Leaderboard Chart (Explorace + Ikhtiar Hidup) */}
          <div className="lg:col-span-7 glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-white/10">
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                  <span>Carta Kedudukan Keseluruhan 8 Kumpulan</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                  Gabungan Markah Explorace ({maxExplorace}m) + Ikhtiar Hidup (100m) = Maksimum {maxExplorace + 100}m
                </p>
              </div>
            </div>

            <div className="mt-4 sm:mt-5 space-y-3.5 sm:space-y-4">
              {rankedByGrand.map((item, idx) => {
                const maxCombined = maxExplorace + 100;
                const expWidth = Math.round((item.expTotal / maxCombined) * 100);
                const ikhWidth = Math.round((item.ikhTotal / maxCombined) * 100);

                return (
                  <div key={item.group.id} className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white/10 font-mono font-bold text-white flex items-center justify-center tabular-nums">
                          {idx + 1}
                        </span>
                        <span className="font-display font-bold text-xs sm:text-sm text-white">
                          {item.group.name}
                        </span>
                        <span className="text-slate-400 hidden sm:inline">
                          ({item.group.guruKumpulan})
                        </span>
                      </div>
                      <div className="font-mono text-[11px] sm:text-xs tabular-nums">
                        <span className="text-sky-300">Exp:{item.expTotal}</span>
                        <span className="mx-1 text-slate-500">+</span>
                        <span className="text-amber-300">Ikh:{item.ikhTotal}</span>
                        <span className="mx-1 text-slate-500">=</span>
                        <span className="font-bold text-xs sm:text-sm text-amber-400">
                          {item.grandTotal}m
                        </span>
                      </div>
                    </div>

                    {/* Stacked Progress Bar */}
                    <div className="w-full h-3 sm:h-3.5 rounded-full bg-[#112233]/90 overflow-hidden flex border border-white/10">
                      <div
                        className="h-full bg-[#1992f4] transition-all duration-300"
                        style={{ width: `${expWidth}%` }}
                        title={`Explorace: ${item.expTotal}`}
                      />
                      <div
                        className="h-full bg-amber-400 transition-all duration-300"
                        style={{ width: `${ikhWidth}%` }}
                        title={`Ikhtiar Hidup: ${item.ikhTotal}`}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-3 sm:gap-6 text-[11px] sm:text-xs text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#1992f4] inline-block" />
                  Markah Explorace ({maxExplorace}m)
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
                  Markah Ikhtiar Hidup (100m)
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Kawad Kaki Unit Uniform Chart + Category Leaders */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6">
              <h3 className="font-display font-bold text-base sm:text-lg text-white pb-3 border-b border-white/10">
                Carta Pertandingan Kawad Kaki Asas
              </h3>
              <div className="mt-4 space-y-3.5 sm:space-y-4">
                {kawadMetrics.map((km, idx) => {
                  const rankTitles = ['JOHAN', 'NAIB JOHAN', 'TEMPAT KE-3'];
                  const theme = getUnitLogoAndTheme(km.unit.name);
                  return (
                    <div
                      key={km.unit.id}
                      className={`p-3 sm:p-3.5 rounded-2xl border space-y-2 ${theme.cardClass}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <img
                            src={theme.logo}
                            alt={km.unit.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0 drop-shadow"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] sm:text-[11px] font-mono font-bold text-amber-300 block">
                              {rankTitles[idx] || `TEMPAT KE-${idx + 1}`}
                            </span>
                            <h4 className="font-display font-bold text-sm sm:text-base text-white leading-tight">
                              {km.unit.name}
                            </h4>
                          </div>
                        </div>
                        <span className="font-mono font-extrabold text-lg sm:text-xl text-amber-300 tabular-nums shrink-0">
                          {km.total}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[#112233]/90 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${theme.barClass} transition-all duration-300`}
                          style={{ width: `${km.total}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] sm:text-[11px] font-mono text-slate-200 tabular-nums">
                        <span>Arahan: {km.sc.arahan}/40</span>
                        <span>Keseragaman: {km.sc.keseragaman}/30</span>
                        <span>Suara: {km.sc.nadaSuara}/30</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Clock,
  Compass,
  Edit3,
  Grid,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  Settings2,
  Trash2,
  Trophy,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { INITIAL_STATIONS } from '../data/initialData';
import { ExploraceScoresMap, ExploraceStation, GroupInfo } from '../types/camp';

interface ExploraceSectionProps {
  stations: ExploraceStation[];
  groups: GroupInfo[];
  scores: ExploraceScoresMap;
  onUpdateScore: (groupId: string, stationId: string, val: number, desc: string) => void;
  onUpdateStations: (newStations: ExploraceStation[], desc: string) => void;
}

export const ExploraceSection: React.FC<ExploraceSectionProps> = ({
  stations,
  groups,
  scores,
  onUpdateScore,
  onUpdateStations,
}) => {
  const [subTab, setSubTab] = useState<'QUICK' | 'MATRIX' | 'MANAGE'>('QUICK');
  const [selectedStationId, setSelectedStationId] = useState<string>(
    stations[0]?.id || 'st-1'
  );
  const [editingStation, setEditingStation] = useState<ExploraceStation | null>(null);
  const [isNewStation, setIsNewStation] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const activeStation =
    stations.find((s) => s.id === selectedStationId) || stations[0] || null;

  const totalMaxMarks = stations.reduce((acc, s) => acc + s.maxMarks, 0);
  const totalDuration = stations.reduce((acc, s) => acc + s.durationMinutes, 0);

  const getGroupTotal = (groupId: string) => {
    return stations.reduce((sum, st) => sum + (scores[groupId]?.[st.id] ?? 0), 0);
  };

  // Ranked groups by total Explorace score
  const rankedGroups = [...groups]
    .map((g) => ({ group: g, total: getGroupTotal(g.id) }))
    .sort((a, b) => b.total - a.total);

  const handleSetScore = (group: GroupInfo, station: ExploraceStation, rawVal: number) => {
    const clamped = Math.max(0, Math.min(station.maxMarks, Math.round(rawVal)));
    onUpdateScore(
      group.id,
      station.id,
      clamped,
      `Markah Explorace ${group.name} (${station.name}): ${clamped}/${station.maxMarks}`
    );
  };

  const openAddStationModal = () => {
    const nextNum = stations.length + 1;
    setIsNewStation(true);
    setEditingStation({
      id: `st-${Date.now()}`,
      number: nextNum,
      name: `STESEN ${nextNum}`,
      pic: 'GURU BERTUGAS',
      maxMarks: 10,
      location: 'Kawasan Padang Sekolah (Unit Gelandangan)',
      task: 'Tugasan Cabaran Baharu',
      durationMinutes: 10,
    });
  };

  const openEditStationModal = (station: ExploraceStation) => {
    setIsNewStation(false);
    setEditingStation({ ...station });
  };

  const handleSaveStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStation) return;

    if (isNewStation) {
      const updated = [...stations, editingStation];
      onUpdateStations(updated, `Tambah stesen baharu: ${editingStation.name} (${editingStation.task})`);
      setSelectedStationId(editingStation.id);
    } else {
      const updated = stations.map((s) => (s.id === editingStation.id ? editingStation : s));
      onUpdateStations(updated, `Kemaskini maklumat ${editingStation.name}: ${editingStation.task}`);
    }
    setEditingStation(null);
    setIsNewStation(false);
  };

  const handleDeleteStation = (station: ExploraceStation) => {
    const remaining = stations
      .filter((s) => s.id !== station.id)
      .map((s, idx) => ({ ...s, number: idx + 1 }));
    onUpdateStations(remaining, `Padam ${station.name} (${station.task})`);
    setConfirmDeleteId(null);
    if (selectedStationId === station.id && remaining.length > 0) {
      setSelectedStationId(remaining[0].id);
    }
  };

  const handleResetDefaultStations = () => {
    onUpdateStations(INITIAL_STATIONS, 'Tetapkan semula 8 Stesen Explorace rasmi SK Lupak');
    setSelectedStationId(INITIAL_STATIONS[0].id);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-amber-400 font-bold">
            <span>LDK 3 • HARI KEDUA (25 NOV 2026)</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{stations.length} STESEN</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">JUMLAH MARKAH: {totalMaxMarks}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">TEMPOH: {totalDuration} MINIT</span>
          </div>
          <h2 className="mt-1 font-display font-bold text-base sm:text-xl lg:text-2xl text-white leading-snug">
            Borang Pemarkahan &amp; Pengurusan Aktiviti Explorace
          </h2>
          <p className="mt-1 text-[11px] sm:text-sm text-slate-300 leading-relaxed">
            Kemasukan markah pantas bagi 8 Kumpulan serta pengurusan PIC Stesen, Lokasi Stesen &amp; Tugasan (boleh diedit dan dipadam).
          </p>
        </div>

        {/* Segmented Mode Control (3 columns on mobile so it never overflows) */}
        <div className="grid grid-cols-3 sm:flex items-center p-1 rounded-xl bg-[#112233]/90 border border-white/10 gap-1">
          <button
            type="button"
            onClick={() => setSubTab('QUICK')}
            className={`min-h-[36px] sm:min-h-[38px] px-1.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer text-center ${
              subTab === 'QUICK'
                ? 'bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="leading-tight">Kemasukan Pantas</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('MATRIX')}
            className={`min-h-[36px] sm:min-h-[38px] px-1.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer text-center ${
              subTab === 'MATRIX'
                ? 'bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Grid className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="leading-tight">Jadual Penuh</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('MANAGE')}
            className={`min-h-[36px] sm:min-h-[38px] px-1.5 sm:px-3.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer text-center ${
              subTab === 'MANAGE'
                ? 'bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Settings2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="leading-tight">Urus Stesen ({stations.length})</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: KEMASUKAN PANTAS (MOBILE-OPTIMIZED) */}
      {subTab === 'QUICK' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Left Column: Station Selector & Active Station Details + Quick Group Score Pad */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-5">
            {/* Horizontal / Grid Station Selector */}
            <div className="glass-panel rounded-2xl sm:rounded-3xl p-3.5 sm:p-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-300">
                  Pilih Stesen Untuk Kemasukan Markah Pantas:
                </span>
                <button
                  type="button"
                  onClick={openAddStationModal}
                  className="text-[11px] sm:text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Stesen</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                {stations.map((st) => {
                  const isSel = activeStation?.id === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStationId(st.id)}
                      className={`min-h-[58px] sm:min-h-[64px] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-left border transition-all cursor-pointer min-w-0 ${
                        isSel
                          ? 'bg-gradient-to-br from-[#1992f4]/40 to-[#277971]/45 border-amber-400 text-white shadow-md'
                          : 'bg-[#112233]/85 hover:bg-white/10 border-white/10 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-display font-bold text-[11px] sm:text-xs text-white">
                          {st.name}
                        </span>
                        <span className="font-mono text-[11px] sm:text-xs text-amber-400 font-bold tabular-nums shrink-0">
                          {st.maxMarks}m
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-300 truncate mt-1">{st.task}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Station Info & Score Pad */}
            {activeStation ? (
              <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-white/10">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-emerald-300 font-medium">
                      <span className="font-bold">{activeStation.name}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">Markah Penilaian: {activeStation.maxMarks}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Tempoh: {activeStation.durationMinutes} minit
                      </span>
                    </div>
                    <h3 className="mt-1 font-display font-bold text-base sm:text-xl text-white leading-snug">
                      Tugasan: {activeStation.task}
                    </h3>
                    <div className="mt-2 space-y-1 text-[11px] sm:text-xs text-slate-300">
                      <p className="flex items-start gap-1.5">
                        <Users className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>PIC Stesen:</strong> {activeStation.pic}
                        </span>
                      </p>
                      <p className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Lokasi Stesen:</strong> {activeStation.location}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditStationModal(activeStation)}
                      className="min-h-[36px] sm:min-h-[40px] px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-[11px] sm:text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Edit Stesen</span>
                    </button>
                    {stations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(activeStation.id)}
                        className="min-h-[36px] sm:min-h-[40px] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 text-[11px] sm:text-xs font-semibold text-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Padam</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 8 Groups Fast Score Rows */}
                <div className="mt-3 sm:mt-4 divide-y divide-white/10">
                  {groups.map((grp) => {
                    const currentVal = scores[grp.id]?.[activeStation.id] ?? 0;
                    const halfVal = Math.round(activeStation.maxMarks / 2);
                    return (
                      <div
                        key={grp.id}
                        className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3"
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <span
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center font-mono font-bold text-xs text-slate-950 shrink-0"
                            style={{ backgroundColor: grp.colorHex }}
                          >
                            {grp.number}
                          </span>
                          <div className="min-w-0">
                            <p className="font-display font-bold text-sm sm:text-base text-white leading-tight">
                              {grp.name}
                            </p>
                            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                              Fasi: {grp.guruKumpulan}
                            </p>
                          </div>
                        </div>

                        {/* Quick Tactile Buttons (Responsive & Never Overflows on Mobile) */}
                        <div className="flex items-center justify-between sm:justify-end gap-1 sm:gap-1.5 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => handleSetScore(grp, activeStation, 0)}
                            className="min-h-[38px] sm:min-h-[42px] px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] sm:text-xs font-mono text-slate-300 cursor-pointer"
                          >
                            0
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetScore(grp, activeStation, halfVal)}
                            className="min-h-[38px] sm:min-h-[42px] px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] sm:text-xs font-mono text-slate-300 cursor-pointer"
                          >
                            {halfVal}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetScore(grp, activeStation, currentVal - 1)}
                            className="min-h-[38px] min-w-[38px] sm:min-h-[42px] sm:min-w-[42px] rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center text-white cursor-pointer"
                            aria-label="Kurangkan 1 markah"
                          >
                            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>

                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              max={activeStation.maxMarks}
                              value={currentVal}
                              onChange={(e) =>
                                handleSetScore(grp, activeStation, Number(e.target.value))
                              }
                              className="w-13 sm:w-16 min-h-[38px] sm:min-h-[42px] text-center rounded-lg sm:rounded-xl glass-input font-mono font-bold text-sm sm:text-base text-emerald-300 tabular-nums"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSetScore(grp, activeStation, currentVal + 1)}
                            className="min-h-[38px] min-w-[38px] sm:min-h-[42px] sm:min-w-[42px] rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center text-white cursor-pointer"
                            aria-label="Tambah 1 markah"
                          >
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleSetScore(grp, activeStation, activeStation.maxMarks)
                            }
                            className="min-h-[38px] sm:min-h-[42px] px-2 sm:px-3 rounded-lg sm:rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-[11px] sm:text-xs font-mono font-bold text-emerald-300 cursor-pointer whitespace-nowrap"
                          >
                            Maks ({activeStation.maxMarks})
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          {/* Right Column: Live Automatic Explorace Leaderboard Chart */}
          <div className="lg:col-span-4 glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                <h3 className="font-display font-bold text-sm sm:text-lg text-white">
                  Carta Markah Explorace
                </h3>
              </div>
              <span className="font-mono text-[11px] sm:text-xs text-emerald-300 tabular-nums">
                Maks: {totalMaxMarks}m
              </span>
            </div>

            <div className="mt-3.5 sm:mt-4 space-y-3 sm:space-y-3.5">
              {rankedGroups.map((item, idx) => {
                const pct =
                  totalMaxMarks > 0
                    ? Math.min(100, Math.round((item.total / totalMaxMarks) * 100))
                    : 0;
                return (
                  <div key={item.group.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-400 w-5 tabular-nums">
                          #{idx + 1}
                        </span>
                        <span className="font-display font-bold text-white">
                          {item.group.name}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs sm:text-sm text-emerald-300 tabular-nums">
                        {item.total} / {totalMaxMarks}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-950/80 overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: item.group.colorHex,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: JADUAL MATRIKS PENUH (VIEW ONLY - DATA DARI KEMASUKAN PANTAS) */}
      {subTab === 'MATRIX' && (
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                Borang Rasmi Matriks Explorace ({stations.length} Stesen × 8 Kumpulan)
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                Paparan rujukan sahaja (View-Only). Semua data dan markah dikemas kini secara automatik berdasarkan input di tab <span className="font-semibold text-amber-300">Kemasukan Pantas</span>.
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-[11px] font-semibold text-amber-300 self-start sm:self-auto">
              Paparan Sahaja (View-Only)
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[980px] text-xs">
              <thead>
                {/* Row 1: STESEN NUMBER */}
                <tr className="bg-slate-950/90 text-white border-b border-white/15">
                  <th className="p-3 w-12 text-center border-r border-white/10 font-mono">BIL</th>
                  <th className="p-3 w-44 border-r border-white/10 font-display font-bold">
                    MAKLUMAT / KUMPULAN
                  </th>
                  {stations.map((st) => (
                    <th
                      key={st.id}
                      className="p-3 border-r border-white/10 text-center font-display font-bold min-w-[115px]"
                    >
                      <span>{st.name}</span>
                    </th>
                  ))}
                  <th className="p-3 w-24 text-center font-display font-bold text-emerald-300">
                    JUMLAH ({totalMaxMarks})
                  </th>
                </tr>

                {/* Row 2: PIC STESEN */}
                <tr className="bg-amber-500/10 border-b border-white/10">
                  <td className="p-2.5 border-r border-white/10" />
                  <td className="p-2.5 font-bold text-amber-300 border-r border-white/10">
                    PIC STESEN
                  </td>
                  {stations.map((st) => (
                    <td
                      key={st.id}
                      className="p-2.5 text-center font-semibold text-slate-200 border-r border-white/10 leading-snug"
                    >
                      {st.pic}
                    </td>
                  ))}
                  <td className="p-2.5 text-center font-mono text-slate-400">—</td>
                </tr>

                {/* Row 3: MARKAH PENILAIAN */}
                <tr className="bg-emerald-500/10 border-b border-white/10">
                  <td className="p-2.5 border-r border-white/10" />
                  <td className="p-2.5 font-bold text-emerald-300 border-r border-white/10">
                    MARKAH PENILAIAN
                  </td>
                  {stations.map((st) => (
                    <td
                      key={st.id}
                      className="p-2.5 text-center font-mono font-bold text-sm text-emerald-300 border-r border-white/10 tabular-nums"
                    >
                      {st.maxMarks}
                    </td>
                  ))}
                  <td className="p-2.5 text-center font-mono font-bold text-sm text-emerald-300 tabular-nums">
                    {totalMaxMarks}
                  </td>
                </tr>

                {/* Row 4: LOKASI STESEN */}
                <tr className="bg-slate-900/60 border-b border-white/10">
                  <td className="p-2.5 border-r border-white/10" />
                  <td className="p-2.5 font-semibold text-sky-300 border-r border-white/10">
                    <div>LOKASI STESEN</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      (Ditetapkan oleh Unit Gelandangan)
                    </div>
                  </td>
                  {stations.map((st) => (
                    <td
                      key={st.id}
                      className="p-2.5 text-center text-slate-300 border-r border-white/10 leading-snug"
                    >
                      {st.location}
                    </td>
                  ))}
                  <td className="p-2.5 text-center text-slate-400">—</td>
                </tr>

                {/* Row 5: TUGASAN SETIAP STESEN */}
                <tr className="bg-slate-950/75 border-b border-white/15">
                  <td className="p-2.5 text-center font-bold text-slate-300 border-r border-white/10">
                    Stesen
                  </td>
                  <td className="p-2.5 font-bold text-white border-r border-white/10">
                    NAMA KUMPULAN
                  </td>
                  {stations.map((st) => (
                    <td
                      key={st.id}
                      className="p-2.5 text-center font-semibold text-white border-r border-white/10 leading-snug"
                    >
                      {st.task}
                    </td>
                  ))}
                  <td className="p-2.5 text-center font-bold text-emerald-300">MARKAH</td>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {groups.map((grp) => {
                  const total = getGroupTotal(grp.id);
                  return (
                    <tr key={grp.id} className="hover:bg-white/[0.03]">
                      <td className="p-2.5 text-center font-mono font-bold text-slate-300 border-r border-white/10 tabular-nums">
                        {grp.number}
                      </td>
                      <td className="p-2.5 font-display font-bold text-white border-r border-white/10">
                        <div>{grp.name}</div>
                        <div className="text-[10px] font-sans font-normal text-slate-400">
                          {grp.guruKumpulan}
                        </div>
                      </td>
                      {stations.map((st) => {
                        const val = scores[grp.id]?.[st.id] ?? 0;
                        return (
                          <td
                            key={st.id}
                            className="p-2.5 text-center border-r border-white/10"
                          >
                            <span
                              className={`inline-flex items-center justify-center min-w-[44px] px-2.5 py-1 rounded-lg font-mono font-bold text-sm tabular-nums ${
                                val > 0
                                  ? 'bg-emerald-500/15 border border-emerald-400/30 text-emerald-200'
                                  : 'bg-white/5 border border-white/10 text-slate-400'
                              }`}
                            >
                              {val}
                            </span>
                          </td>
                        );
                      })}
                      <td className="p-2.5 text-center font-mono font-bold text-base text-emerald-300 tabular-nums">
                        {total}
                      </td>
                    </tr>
                  );
                })}

                {/* Bottom Row: Tempoh (minit) */}
                <tr className="bg-slate-950/80 font-mono text-slate-200">
                  <td className="p-3 border-r border-white/10" />
                  <td className="p-3 font-bold text-amber-300 border-r border-white/10">
                    Tempoh (minit)
                  </td>
                  {stations.map((st) => (
                    <td
                      key={st.id}
                      className="p-3 text-center font-bold text-amber-300 border-r border-white/10 tabular-nums"
                    >
                      {st.durationMinutes}m
                    </td>
                  ))}
                  <td className="p-3 text-center font-bold text-amber-300 tabular-nums">
                    {totalDuration}m
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PENGURUSAN STESEN (TAMBAH / EDIT / PADAM PIC, LOKASI & TUGASAN) */}
      {subTab === 'MANAGE' && (
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 sm:pb-4 border-b border-white/10">
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                Senarai &amp; Pengurusan Stesen Explorace (Edit &amp; Padam)
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                Ubah suai Nama PIC Stesen, Lokasi Stesen, Tugasan, Markah Maksimum atau Tempoh Masa bagi setiap stesen.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDefaultStations}
                className="min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-[11px] sm:text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Pulihkan Asal</span>
              </button>
              <button
                type="button"
                onClick={openAddStationModal}
                className="min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Tambah Stesen</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {stations.map((st) => (
              <div
                key={st.id}
                className="p-3.5 sm:p-5 rounded-2xl bg-slate-950/60 border border-white/10 flex flex-col justify-between gap-3.5 sm:gap-4 hover:border-emerald-400/30 transition-colors"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center font-mono font-bold text-xs text-emerald-300 shrink-0">
                        {st.number}
                      </span>
                      <h4 className="font-display font-bold text-sm sm:text-base text-white leading-snug">
                        {st.name} — {st.task}
                      </h4>
                    </div>
                    <span className="font-mono text-[11px] sm:text-xs font-bold text-emerald-300 tabular-nums shrink-0">
                      {st.maxMarks} Markah · {st.durationMinutes} Minit
                    </span>
                  </div>

                  <div className="mt-2.5 sm:mt-3 space-y-1.5 text-[11px] sm:text-xs text-slate-300">
                    <p className="flex items-start gap-2">
                      <Users className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>PIC Stesen:</strong> {st.pic}
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Lokasi Stesen:</strong> {st.location}
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Tugasan:</strong> {st.task}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditStationModal(st)}
                    className="min-h-[36px] sm:min-h-[38px] px-3 sm:px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-[11px] sm:text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span>Edit Stesen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(st.id)}
                    className="min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 text-[11px] sm:text-xs font-semibold text-rose-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Padam</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Edit or Add Station */}
      {editingStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl glass-panel-elevated p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-lg text-white">
                {isNewStation ? 'Tambah Stesen Explorace Baharu' : `Edit ${editingStation.name}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingStation(null)}
                className="min-h-[36px] min-w-[36px] rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStation} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kod / Nama Stesen
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStation.name}
                    onChange={(e) =>
                      setEditingStation({ ...editingStation, name: e.target.value })
                    }
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl glass-input text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tugasan Stesen
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStation.task}
                    onChange={(e) =>
                      setEditingStation({ ...editingStation, task: e.target.value })
                    }
                    placeholder="Contoh: Cipta Bendera Kumpulan"
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Guru / PIC Stesen
                </label>
                <input
                  type="text"
                  required
                  value={editingStation.pic}
                  onChange={(e) =>
                    setEditingStation({ ...editingStation, pic: e.target.value })
                  }
                  placeholder="Contoh: PN JUHANI & WAN JUZLIYA"
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lokasi Stesen (Ditetapkan oleh Unit Gelandangan)
                </label>
                <input
                  type="text"
                  required
                  value={editingStation.location}
                  onChange={(e) =>
                    setEditingStation({ ...editingStation, location: e.target.value })
                  }
                  placeholder="Contoh: Astaka / Padang Kawad"
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Markah Penilaian Maksimum
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={editingStation.maxMarks}
                    onChange={(e) =>
                      setEditingStation({
                        ...editingStation,
                        maxMarks: Math.max(1, Number(e.target.value)),
                      })
                    }
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tempoh Masa (Minit)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    required
                    value={editingStation.durationMinutes}
                    onChange={(e) =>
                      setEditingStation({
                        ...editingStation,
                        durationMinutes: Math.max(1, Number(e.target.value)),
                      })
                    }
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingStation(null)}
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Simpan Maklumat Stesen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deleting Station */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl glass-panel-elevated p-6 border border-rose-400/30 shadow-2xl">
            <h3 className="font-display font-bold text-lg text-white">
              Sahkan Padam Stesen Explorace?
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Adakah anda pasti mahu memadam{' '}
              <strong>
                {stations.find((s) => s.id === confirmDeleteId)?.name} (
                {stations.find((s) => s.id === confirmDeleteId)?.task})
              </strong>
              ? Anda boleh memulihkan semula 8 stesen asal pada bila-bila masa.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const st = stations.find((s) => s.id === confirmDeleteId);
                  if (st) handleDeleteStation(st);
                }}
                className="min-h-[42px] px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold cursor-pointer"
              >
                Ya, Padam Stesen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

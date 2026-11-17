import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Edit3,
  LayoutGrid,
  List,
  Plus,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import { ScheduleSlot } from '../types/camp';

interface ScheduleSectionProps {
  schedule: ScheduleSlot[];
  onUpdateSchedule: (updated: ScheduleSlot[], actionDesc: string) => void;
}

const DAY_META = [
  {
    day: 1 as const,
    label: 'Hari Pertama',
    date: '24 November 2026 (Selasa)',
    shortDate: 'Selasa, 24 Nov',
    theme: 'Pendaftaran, LDK 1 (Ikatan) & LDK 2 (Bantuan Kecemasan)',
  },
  {
    day: 2 as const,
    label: 'Hari Kedua',
    date: '25 November 2026 (Rabu)',
    shortDate: 'Rabu, 25 Nov',
    theme: 'LDK 3 (Aktiviti Explorace 8 Stesen) & LDK 4 (Ikhtiar Hidup)',
  },
  {
    day: 3 as const,
    label: 'Hari Ketiga',
    date: '26 November 2026 (Khamis)',
    shortDate: 'Khamis, 26 Nov',
    theme: 'LDK 5 (Pertandingan Kawad Kaki), Refleksi & Majlis Penutup',
  },
];

// Exact time table rows matching JADUAL_PROGRAM_PERKHEMAHAN_118c2b85.pdf
const OFFICIAL_TIMETABLE_MATRIX = [
  {
    masa: '7.00 - 7.30',
    d1: 'TAKLIMAT & KEM KOMANDAN',
    d2: 'LDK 3 (TAKLIMAT EXPLORACE)',
    d3: 'TAKLIMAT KOMANDAN',
    highlightD2: true,
  },
  {
    masa: '7.30 - 8.00',
    d1: 'PEMBAHAGIAN 8 KUMPULAN',
    d2: 'AKTIVITI EXPLORACE',
    d3: 'LDK 5 (PERSIAPAN KAWAD)',
    highlightD3: true,
  },
  {
    masa: '8.00 - 8.30',
    d1: 'LDK 1 :',
    d2: '(1 JAM 30 MINIT)',
    d3: 'PERTANDINGAN KAWAD KAKI',
    highlightD1: true,
  },
  {
    masa: '8.30 - 9.00',
    d1: 'IKATAN (TEORI & AMALI)',
    d2: 'AKTIVITI EXPLORACE (SAMBUNGAN)',
    d3: 'PERTANDINGAN KAWAD KAKI',
  },
  {
    masa: '9.00 - 9.30',
    d1: '(1 JAM 30 MINIT)',
    d2: 'LDK 4 :',
    d3: 'REHAT',
    highlightD2: true,
  },
  {
    masa: '9.30 - 10.00',
    d1: 'REHAT',
    d2: 'IKHTIAR HIDUP',
    d3: 'REFLEKSI DAN POSTMORTEM',
  },
  {
    masa: '10.00 - 10.30',
    d1: 'LDK 2 :',
    d2: 'IKHTIAR HIDUP',
    d3: 'MAJLIS PENUTUP DAN PENYAMPAIAN HADIAH',
    highlightD1: true,
  },
  {
    masa: '10.30 - 11.00',
    d1: 'BANTUAN KECEMASAN (TEORI & AMALI)',
    d2: 'IKHTIAR HIDUP',
    d3: 'MAJLIS PENUTUP DAN PENYAMPAIAN HADIAH',
  },
  {
    masa: '11.00 - 11.30',
    d1: '1 JAM 30 MINIT',
    d2: 'IKHTIAR HIDUP',
    d3: 'MAJLIS PENUTUP DAN PENYAMPAIAN HADIAH',
  },
  {
    masa: '11.30 - 12.00',
    d1: 'MAKAN TENGAHARI',
    d2: 'PENILAIAN DAN MAKAN TENGAHARI',
    d3: 'BERSURAI',
  },
  {
    masa: '12.00 - 12.30',
    d1: 'SOLAT ZOHOR BERJEMAAH',
    d2: 'SOLAT ZOHOR BERJEMAAH',
    d3: '-',
    greenD1D2: true,
  },
];

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  schedule,
  onUpdateSchedule,
}) => {
  const [selectedDay, setSelectedDay] = useState<1 | 2 | 3>(1);
  const [viewMode, setViewMode] = useState<'DAILY' | 'MATRIX'>('DAILY');
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  const filteredSlots = schedule.filter((s) => s.day === selectedDay);
  const currentDayMeta = DAY_META.find((d) => d.day === selectedDay) || DAY_META[0];

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    if (isAddingNew) {
      onUpdateSchedule(
        [...schedule, editingSlot],
        `Tambah slot jadual: ${editingSlot.title} (Hari ${editingSlot.day})`
      );
    } else {
      onUpdateSchedule(
        schedule.map((s) => (s.id === editingSlot.id ? editingSlot : s)),
        `Kemaskini slot jadual: ${editingSlot.title}`
      );
    }
    setEditingSlot(null);
    setIsAddingNew(false);
  };

  const handleDeleteSlot = (slot: ScheduleSlot) => {
    onUpdateSchedule(
      schedule.filter((s) => s.id !== slot.id),
      `Padam slot jadual: ${slot.title}`
    );
  };

  const openNewSlotModal = () => {
    setIsAddingNew(true);
    setEditingSlot({
      id: `sch-${Date.now()}`,
      day: selectedDay,
      dateLabel: currentDayMeta.date,
      timeRange: '12.30 - 1.00',
      title: '',
      subtitle: '',
      durationNote: '30 Minit',
      category: 'LDK',
      pic: 'Kem Komandan & Guru Kumpulan',
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Section Header */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-amber-400 font-bold">
            <span>MURID TAHAP 2</span>
            <span aria-hidden="true">·</span>
            <span>24–26 NOVEMBER 2026</span>
          </div>
          <h2 className="mt-1 font-display font-bold text-base sm:text-xl lg:text-2xl text-white leading-snug">
            Jadual &amp; Aturcara Program Perkhemahan (3 Hari)
          </h2>
          <p className="mt-1 text-[11px] sm:text-sm text-slate-300 leading-relaxed">
            Susunan lengkap 5 LDK, Pertandingan Explorace, Ikhtiar Hidup, Kawad Kaki &amp; Majlis Penutup SK Lupak.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="grid grid-cols-2 sm:flex items-center p-1 rounded-xl bg-[#112233]/90 border border-white/10">
          <button
            type="button"
            onClick={() => setViewMode('DAILY')}
            className={`min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'DAILY'
                ? 'bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5 shrink-0" />
            <span>Ikut Hari</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('MATRIX')}
            className={`min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'MATRIX'
                ? 'bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
            <span>Jadual Penuh 3 Hari</span>
          </button>
        </div>
      </div>

      {viewMode === 'DAILY' ? (
        <>
          {/* Day Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {DAY_META.map((dm) => {
              const active = selectedDay === dm.day;
              return (
                <button
                  key={dm.day}
                  type="button"
                  onClick={() => setSelectedDay(dm.day)}
                  className={`min-h-[60px] sm:min-h-[72px] p-2.5 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-all cursor-pointer border min-w-0 ${
                    active
                      ? 'bg-gradient-to-br from-[#1992f4]/35 via-[#277971]/40 to-[#112233]/90 border-amber-400/70 shadow-lg'
                      : 'glass-panel hover:bg-white/10 border-white/10'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
                    <span className="font-display font-bold text-xs sm:text-base text-white leading-tight">
                      {dm.label.toUpperCase()}
                    </span>
                    <span className="font-mono text-[10px] sm:text-xs text-amber-400 font-bold tabular-nums">
                      {dm.shortDate}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] sm:text-xs text-slate-300 line-clamp-1 hidden sm:block">
                    {dm.theme}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Day Banner + Add Slot Action */}
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 sm:pb-4 border-b border-white/10">
              <div>
                <h3 className="font-display font-bold text-sm sm:text-lg text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                  <span>
                    {currentDayMeta.label} — {currentDayMeta.date}
                  </span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">{currentDayMeta.theme}</p>
              </div>
              <button
                type="button"
                onClick={openNewSlotModal}
                className="w-full sm:w-auto min-h-[38px] sm:min-h-[42px] px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] hover:brightness-105 text-slate-950 font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Tambah Slot Masa</span>
              </button>
            </div>

            {/* Slot Timeline List */}
            <div className="mt-3 sm:mt-4 divide-y divide-white/10">
              {filteredSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="py-3.5 sm:py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-white/[0.02] rounded-xl px-1 sm:px-2 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 min-w-0">
                    {/* Time Column */}
                    <div className="sm:w-36 shrink-0 flex sm:block items-center justify-between">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-xs sm:text-sm text-emerald-300 tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{slot.timeRange}</span>
                      </div>
                      {slot.durationNote && (
                        <p className="text-[10px] sm:text-[11px] text-amber-300/90 sm:mt-0.5 font-mono">
                          Tempoh: {slot.durationNote}
                        </p>
                      )}
                    </div>

                    {/* Details Column */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 mb-0.5">
                        <span className="text-emerald-300 font-semibold">{slot.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <UserCheck className="w-3 h-3 text-sky-400 shrink-0" />
                          <span className="break-words">{slot.pic}</span>
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-sm sm:text-base text-white leading-snug">
                        {slot.title}
                      </h4>
                      <p className="text-[11px] sm:text-sm text-slate-300 mt-0.5 leading-relaxed">
                        {slot.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Edit / Delete Controls */}
                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNew(false);
                        setEditingSlot({ ...slot });
                      }}
                      className="min-h-[34px] sm:min-h-[38px] px-2.5 sm:px-3 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] sm:text-xs text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(slot)}
                      className="min-h-[34px] min-w-[34px] sm:min-h-[38px] sm:min-w-[38px] rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/20 text-rose-300 flex items-center justify-center transition-colors cursor-pointer"
                      title="Padam slot ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* OFFICIAL 3-DAY MATRIX TABLE VIEW (Exact Replica of JADUAL_PROGRAM_PERKHEMAHAN_118c2b85.pdf) */
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-7 overflow-hidden">
          <div className="text-center pb-4 sm:pb-5 border-b border-white/10">
            <h3 className="font-display font-extrabold text-base sm:text-2xl text-white">
              PROGRAM PERKHEMAHAN KOKURIKULUM SK LUPAK 2026
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-1">
              MURID TAHAP 2 &nbsp;|&nbsp; PERINGKAT SEKOLAH TAHUN 2026M &nbsp;•&nbsp; 24–26 NOVEMBER 2026 &nbsp;•&nbsp; SK LUPAK
            </p>
          </div>

          <div className="mt-4 sm:mt-5 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="bg-slate-950/90 text-white border-b border-white/15 text-xs font-display">
                  <th className="py-3.5 px-4 font-bold w-32 border-r border-white/10">MASA</th>
                  <th className="py-3.5 px-4 font-bold border-r border-white/10">
                    <div>HARI PERTAMA</div>
                    <div className="text-[11px] font-mono text-emerald-300 font-normal mt-0.5">
                      24 NOVEMBER 2026 (SELASA)
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-bold border-r border-white/10">
                    <div>HARI KEDUA</div>
                    <div className="text-[11px] font-mono text-sky-300 font-normal mt-0.5">
                      25 NOVEMBER 2026 (RABU)
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-bold">
                    <div>HARI KETIGA</div>
                    <div className="text-[11px] font-mono text-amber-300 font-normal mt-0.5">
                      26 NOVEMBER 2026 (KHAMIS)
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-xs sm:text-sm">
                {OFFICIAL_TIMETABLE_MATRIX.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.03]">
                    <td className="py-3 px-4 font-mono font-bold text-slate-200 border-r border-white/10 tabular-nums whitespace-nowrap">
                      {row.masa}
                    </td>
                    <td
                      className={`py-3 px-4 border-r border-white/10 font-medium ${
                        row.highlightD1
                          ? 'bg-amber-400/20 text-amber-200 font-bold'
                          : row.greenD1D2
                          ? 'bg-emerald-500/20 text-emerald-200 font-semibold'
                          : 'text-slate-200'
                      }`}
                    >
                      {row.d1}
                    </td>
                    <td
                      className={`py-3 px-4 border-r border-white/10 font-medium ${
                        row.highlightD2
                          ? 'bg-amber-400/20 text-amber-200 font-bold'
                          : row.greenD1D2
                          ? 'bg-emerald-500/20 text-emerald-200 font-semibold'
                          : 'text-slate-200'
                      }`}
                    >
                      {row.d2}
                    </td>
                    <td
                      className={`py-3 px-4 font-medium ${
                        row.highlightD3
                          ? 'bg-amber-400/20 text-amber-200 font-bold'
                          : 'text-slate-200'
                      }`}
                    >
                      {row.d3}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Editing or Adding a Schedule Slot */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl glass-panel-elevated p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-lg text-white">
                {isAddingNew ? 'Tambah Slot Jadual Baharu' : 'Kemaskini Slot Jadual'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="min-h-[36px] min-w-[36px] rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hari Program
                  </label>
                  <select
                    value={editingSlot.day}
                    onChange={(e) => {
                      const d = Number(e.target.value) as 1 | 2 | 3;
                      const dm = DAY_META.find((m) => m.day === d) || DAY_META[0];
                      setEditingSlot({ ...editingSlot, day: d, dateLabel: dm.date });
                    }}
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value={1} className="bg-slate-900">Hari 1 (24 Nov 2026)</option>
                    <option value={2} className="bg-slate-900">Hari 2 (25 Nov 2026)</option>
                    <option value={3} className="bg-slate-900">Hari 3 (26 Nov 2026)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Masa (Contoh: 8.00 - 9.30)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSlot.timeRange}
                    onChange={(e) => setEditingSlot({ ...editingSlot, timeRange: e.target.value })}
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tajuk Slot / Aktiviti LDK
                </label>
                <input
                  type="text"
                  required
                  value={editingSlot.title}
                  onChange={(e) => setEditingSlot({ ...editingSlot, title: e.target.value })}
                  placeholder="Contoh: LDK 1 : IKATAN (TEORI & AMALI)"
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Huraian / Catatan Aktiviti
                </label>
                <textarea
                  rows={2}
                  value={editingSlot.subtitle}
                  onChange={(e) => setEditingSlot({ ...editingSlot, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pegawai / AJK Bertugas (PIC)
                  </label>
                  <input
                    type="text"
                    value={editingSlot.pic}
                    onChange={(e) => setEditingSlot({ ...editingSlot, pic: e.target.value })}
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nota Tempoh (Pilihan)
                  </label>
                  <input
                    type="text"
                    value={editingSlot.durationNote || ''}
                    onChange={(e) =>
                      setEditingSlot({ ...editingSlot, durationNote: e.target.value })
                    }
                    placeholder="Contoh: 1 Jam 30 Minit"
                    className="w-full min-h-[42px] px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Simpan Slot Jadual
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

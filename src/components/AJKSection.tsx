import React, { useState } from 'react';
import {
  Edit3,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { AJKMember } from '../types/camp';

interface AJKSectionProps {
  ajkList: AJKMember[];
  onUpdateAJK: (updated: AJKMember[], desc: string) => void;
}

const CATEGORY_LABELS: Record<AJKMember['category'], string> = {
  INDUK: 'Jawatankuasa Induk',
  PELAKSANA: 'Jawatankuasa Pelaksana',
  GURU_KUMPULAN: 'Guru Kumpulan (Fasi LDK & Ikhtiar Hidup)',
  EXPLORACE: 'Ketua Stesen Explorace',
};

export const AJKSection: React.FC<AJKSectionProps> = ({
  ajkList,
  onUpdateAJK,
}) => {
  const [filterCat, setFilterCat] = useState<'ALL' | AJKMember['category']>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingMember, setEditingMember] = useState<AJKMember | null>(null);
  const [isNew, setIsNew] = useState<boolean>(false);

  const filteredList = ajkList.filter((item) => {
    const matchCat = filterCat === 'ALL' || item.category === filterCat;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.jawatan.toLowerCase().includes(q) ||
      item.namaGuru.toLowerCase().includes(q) ||
      item.catatan.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    if (isNew) {
      onUpdateAJK(
        [...ajkList, editingMember],
        `Tambah AJK: ${editingMember.jawatan} (${editingMember.namaGuru})`
      );
    } else {
      onUpdateAJK(
        ajkList.map((m) => (m.id === editingMember.id ? editingMember : m)),
        `Kemaskini AJK: ${editingMember.jawatan}`
      );
    }
    setEditingMember(null);
    setIsNew(false);
  };

  const handleDelete = (member: AJKMember) => {
    onUpdateAJK(
      ajkList.filter((m) => m.id !== member.id),
      `Padam AJK: ${member.jawatan}`
    );
  };

  const openAddModal = () => {
    setIsNew(true);
    setEditingMember({
      id: `ajk-${Date.now()}`,
      category: filterCat === 'ALL' ? 'PELAKSANA' : filterCat,
      jawatan: '',
      namaGuru: '',
      catatan: '',
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-amber-400 font-bold">
            <span>JAWATANKUASA PROGRAM PERKHEMAHAN</span>
            <span aria-hidden="true">·</span>
            <span>SK LUPAK 2026</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{ajkList.length} SENARAI TUGAS</span>
          </div>
          <h2 className="mt-1 font-display font-bold text-base sm:text-xl lg:text-2xl text-white leading-snug">
            Senarai Jawatankuasa Induk, Pelaksana &amp; Fasilitator Kumpulan
          </h2>
          <p className="mt-1 text-[11px] sm:text-sm text-slate-300 leading-relaxed">
            Rujukan rasmi bidang tugas guru, AJK Pelaksana, Guru Kumpulan (Aldebaran – Regulus) &amp; Ketua Stesen.
          </p>
        </div>

        <div className="flex items-center">
          <button
            type="button"
            onClick={openAddModal}
            className="w-full sm:w-auto min-h-[38px] sm:min-h-[40px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] hover:brightness-105 text-slate-950 font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Tambah AJK</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Category Segmented Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              ['ALL', 'Semua AJK'],
              ['INDUK', 'AJK Induk'],
              ['PELAKSANA', 'AJK Pelaksana'],
              ['GURU_KUMPULAN', 'Guru Kumpulan (8)'],
              ['EXPLORACE', 'Ketua Stesen (8)'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilterCat(key)}
              className={`min-h-[34px] sm:min-h-[38px] px-2.5 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                filterCat === key
                  ? 'bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] text-slate-950 shadow-sm'
                  : 'bg-[#112233]/85 hover:bg-white/10 text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama guru atau jawatan..."
            className="w-full min-h-[38px] sm:min-h-[40px] pl-9 pr-3.5 py-2 rounded-xl glass-input text-xs"
          />
        </div>
      </div>

      {/* AJK Mobile Cards & Desktop Table */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 overflow-hidden">
        {/* Mobile Card View */}
        <div className="space-y-3 md:hidden">
          {filteredList.map((item, idx) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-[#112233]/85 border border-white/10 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-emerald-300 font-semibold block">
                    #{idx + 1} · {CATEGORY_LABELS[item.category]}
                  </span>
                  <h4 className="font-display font-bold text-sm text-white leading-snug mt-0.5">
                    {item.jawatan}
                  </h4>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNew(false);
                      setEditingMember({ ...item });
                    }}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-emerald-300 cursor-pointer"
                    title="Edit AJK"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center text-rose-300 cursor-pointer"
                    title="Padam AJK"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-200">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{item.namaGuru}</span>
              </div>

              {item.catatan && (
                <p className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-white/10">
                  {item.catatan}
                </p>
              )}
            </div>
          ))}
          {filteredList.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400">
              Tiada rekod AJK ditemui bagi carian ini.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-slate-950/85 text-white text-xs font-display border-b border-white/15">
                <th className="p-3.5 w-14 text-center border-r border-white/10">BIL</th>
                <th className="p-3.5 w-64 border-r border-white/10">JAWATANKUASA</th>
                <th className="p-3.5 w-64 border-r border-white/10">NAMA GURU / PEGAWAI</th>
                <th className="p-3.5 border-r border-white/10">CATATAN / BIDANG TUGAS</th>
                <th className="p-3.5 w-24 text-center">TINDAKAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-xs sm:text-sm">
              {filteredList.map((item, idx) => (
                <tr key={item.id} className="hover:bg-white/[0.03]">
                  <td className="p-3.5 text-center font-mono text-slate-400 border-r border-white/10 tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="p-3.5 border-r border-white/10">
                    <div className="font-display font-bold text-white">{item.jawatan}</div>
                    <div className="text-[11px] text-emerald-300 mt-0.5">
                      {CATEGORY_LABELS[item.category]}
                    </div>
                  </td>
                  <td className="p-3.5 font-semibold text-sky-200 border-r border-white/10">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{item.namaGuru}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-300 border-r border-white/10 leading-relaxed">
                    {item.catatan}
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNew(false);
                          setEditingMember({ ...item });
                        }}
                        className="min-h-[34px] min-w-[34px] rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-emerald-300 cursor-pointer"
                        title="Edit AJK"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="min-h-[34px] min-w-[34px] rounded-lg bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center text-rose-300 cursor-pointer"
                        title="Padam AJK"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Tiada rekod AJK ditemui bagi carian ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit/Add AJK */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl glass-panel-elevated p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>{isNew ? 'Tambah Senarai AJK Baharu' : 'Kemaskini Maklumat AJK'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="min-h-[36px] min-w-[36px] rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kategori Jawatankuasa
                </label>
                <select
                  value={editingMember.category}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      category: e.target.value as AJKMember['category'],
                    })
                  }
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl glass-input text-xs"
                >
                  <option value="INDUK" className="bg-slate-900">Jawatankuasa Induk</option>
                  <option value="PELAKSANA" className="bg-slate-900">Jawatankuasa Pelaksana</option>
                  <option value="GURU_KUMPULAN" className="bg-slate-900">Guru Kumpulan (Fasi)</option>
                  <option value="EXPLORACE" className="bg-slate-900">Ketua Stesen Explorace</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Jawatan / Jawatankuasa
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.jawatan}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, jawatan: e.target.value })
                  }
                  placeholder="Contoh: AJK DOKUMENTASI PHOTO DAN VIDEO"
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl glass-input text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Guru / Pegawai
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.namaGuru}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, namaGuru: e.target.value })
                  }
                  placeholder="Contoh: MOHD FADZIL BIN MD NOH"
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan / Perincian Tugas
                </label>
                <textarea
                  rows={3}
                  value={editingMember.catatan}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, catatan: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Simpan AJK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

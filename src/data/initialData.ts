import {
  AJKMember,
  AwardItem,
  CampAppState,
  ExploraceScoresMap,
  ExploraceStation,
  GroupInfo,
  IkhtiarHidupScoresMap,
  KawadKakiScoresMap,
  OPRReportData,
  ScheduleSlot,
  UniformUnit,
  UserAccount,
} from '../types/camp';

export const REFERENCE_PDFS = [
  {
    id: 'jadual',
    title: 'Jadual Program Perkhemahan',
    filename: 'JADUAL_PROGRAM_PERKHEMAHAN_118c2b85.pdf',
    url: '/assets/aistudio/JADUAL_PROGRAM_PERKHEMAHAN_118c2b85.pdf',
    desc: 'Jadual 3 Hari (24–26 November 2026) Murid Tahap 2 SK Lupak',
  },
  {
    id: 'explorace',
    title: 'Borang & Senarai Stesen Explorace',
    filename: 'aktiviti_xplorace_cafca367.pdf',
    url: '/assets/aistudio/aktiviti_xplorace_cafca367.pdf',
    desc: '8 Stesen, 8 Kumpulan, PIC Stesen, Markah & Tempoh',
  },
  {
    id: 'pemarkahan',
    title: 'Borang Pemarkahan Ikhtiar Hidup & Kawad',
    filename: 'borang_pemarkahan_165772b8.pdf',
    url: '/assets/aistudio/borang_pemarkahan_165772b8.pdf',
    desc: 'Rubrik Pemarkahan Ikhtiar Hidup (100%) & Kawad Asas (100%)',
  },
  {
    id: 'ajk',
    title: 'Senarai Jawatankuasa (AJK) Program',
    filename: 'senarai_AJK_7b685373.pdf',
    url: '/assets/aistudio/senarai_AJK_7b685373.pdf',
    desc: 'AJK Induk, Pelaksana, Guru Kumpulan & Ketua Stesen',
  },
  {
    id: 'anugerah',
    title: 'Senarai Kategori Anugerah & Badan Beruniform',
    filename: 'senarai_anugerah_c28963ef.pdf',
    url: '/assets/aistudio/senarai_anugerah_c28963ef.pdf',
    desc: '8 Kategori Umum, 3 Kategori Kawad Kaki & Senarai Kumpulan',
  },
];

export const TEACHER_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr-penyelaras',
    name: 'ALIF AKRAM BIN NOR KASANI',
    role: 'URUSETIA',
    designation: 'Penyelaras Program & Admin Sistem',
    pin: '2026',
  },
  {
    id: 'usr-setiausaha',
    name: 'EN JAMALUDIN BIN JAPAR',
    role: 'URUSETIA',
    designation: 'Setiausaha Perkhemahan & AJK Keselamatan',
    pin: '2026',
  },
  {
    id: 'usr-penilaian',
    name: 'PN JUHANI BINTI NORMAN',
    role: 'PENILAIAN',
    designation: 'Ketua AJK Penilaian & Ketua Stesen 1',
    pin: '2026',
  },
  {
    id: 'usr-komandan',
    name: 'EN AZMAN BIN SAIDIN',
    role: 'KOMANDAN',
    designation: 'Kem Komandan',
    pin: '2026',
  },
  {
    id: 'usr-pkkokum',
    name: 'EN HARUN BIN HJ SUNTRAK',
    role: 'PENTADBIR',
    designation: 'Penasihat / PK Kokurikulum & Ketua Stesen 7',
    pin: '2026',
  },
  {
    id: 'usr-gb',
    name: 'TN HJ SABLI BIN MD JANEH',
    role: 'PENTADBIR',
    designation: 'Penaung / Guru Besar SK Lupak',
    pin: '2026',
  },
];

export const INITIAL_GROUPS: GroupInfo[] = [
  {
    id: 'grp-1',
    number: 1,
    name: 'ALDEBARAN',
    guruKumpulan: 'EN FADZIL & USTAZAH RAUDAH',
    colorHex: '#10b981',
    badgeText: 'Bintang Taurus',
  },
  {
    id: 'grp-2',
    number: 2,
    name: 'ACRUX',
    guruKumpulan: 'CIK HAWA & USTAZAH AZZLINA',
    colorHex: '#0ea5e9',
    badgeText: 'Bintang Crux',
  },
  {
    id: 'grp-3',
    number: 3,
    name: 'ALTAIR',
    guruKumpulan: 'CIK IZATUL & PN HADIJAH',
    colorHex: '#f59e0b',
    badgeText: 'Bintang Aquila',
  },
  {
    id: 'grp-4',
    number: 4,
    name: 'CAPELLA',
    guruKumpulan: 'UST SHAHRUL & JAMAL',
    colorHex: '#8b5cf6',
    badgeText: 'Bintang Auriga',
  },
  {
    id: 'grp-5',
    number: 5,
    name: 'ARCTURUS',
    guruKumpulan: 'HUSLI & SULAIMAN',
    colorHex: '#ec4899',
    badgeText: 'Bintang Bootes',
  },
  {
    id: 'grp-6',
    number: 6,
    name: 'ALPHARD',
    guruKumpulan: 'PN JUHANI & AISAH',
    colorHex: '#14b8a6',
    badgeText: 'Bintang Hydra',
  },
  {
    id: 'grp-7',
    number: 7,
    name: 'POLLUX',
    guruKumpulan: 'UST HIMI & TC MIMI',
    colorHex: '#f97316',
    badgeText: 'Bintang Gemini',
  },
  {
    id: 'grp-8',
    number: 8,
    name: 'REGULUS',
    guruKumpulan: 'RAZI & ZUL',
    colorHex: '#3b82f6',
    badgeText: 'Bintang Leo',
  },
];

export const INITIAL_UNIFORM_UNITS: UniformUnit[] = [
  { id: 'uni-1', number: 1, name: 'PENGAKAP', shortName: 'Pengakap' },
  { id: 'uni-2', number: 2, name: 'PERGERAKAN PUTERI ISLAM MALAYSIA', shortName: 'Puteri Islam' },
  { id: 'uni-3', number: 3, name: 'TUNAS KADET REMAJA SEKOLAH', shortName: 'TKRS' },
];

export const INITIAL_STATIONS: ExploraceStation[] = [
  {
    id: 'st-1',
    number: 1,
    name: 'STESEN 1',
    pic: 'PN JUHANI & WAN JUZLIYA',
    maxMarks: 10,
    location: 'Astaka / Tapak Perhimpunan (Unit Gelandangan)',
    task: 'Cipta Bendera Kumpulan / Logo Bendera',
    durationMinutes: 10,
  },
  {
    id: 'st-2',
    number: 2,
    name: 'STESEN 2',
    pic: 'U. RAUDAH & PN HADIJAH',
    maxMarks: 5,
    location: 'Zon Padang Timur (Unit Gelandangan)',
    task: 'Laluan Berhalangan',
    durationMinutes: 5,
  },
  {
    id: 'st-3',
    number: 3,
    name: 'STESEN 3',
    pic: 'SITI AISAH BINTI MAT YASSIN & USTAZAH AZZLINA',
    maxMarks: 15,
    location: 'Laman Herba Sekolah (Unit Gelandangan)',
    task: 'Misi Selamatkan Kehidupan Tanaman Anak Pokok',
    durationMinutes: 7,
  },
  {
    id: 'st-4',
    number: 4,
    name: 'STESEN 4',
    pic: 'UST SHAHRUL DAN HAWASATO / SIR ZUL',
    maxMarks: 15,
    location: 'Dewan Terbuka SK Lupak (Unit Gelandangan)',
    task: 'Pertolongan Cemas / Balutan Asas',
    durationMinutes: 5,
  },
  {
    id: 'st-5',
    number: 5,
    name: 'STESEN 5',
    pic: 'HUSLI DAN RAZI',
    maxMarks: 20,
    location: 'Zon Rimba & Ikhtiar Hidup (Unit Gelandangan)',
    task: 'Cabaran Hasilkan Api',
    durationMinutes: 20,
  },
  {
    id: 'st-6',
    number: 6,
    name: 'STESEN 6',
    pic: 'SYAZA & IZZATUL',
    maxMarks: 15,
    location: 'Sudut Kokurikulum (Unit Gelandangan)',
    task: 'Bina Gajet (Rekacipta Ikatan)',
    durationMinutes: 15,
  },
  {
    id: 'st-7',
    number: 7,
    name: 'STESEN 7',
    pic: 'UST HARUN & USTAZAH HIMI',
    maxMarks: 10,
    location: 'Koridor Blok Akademik (Unit Gelandangan)',
    task: 'Radio Rosak (Komunikasi Berpasukan)',
    durationMinutes: 5,
  },
  {
    id: 'st-8',
    number: 8,
    name: 'STESEN 8',
    pic: 'SIR ZUL & SULAIMAN',
    maxMarks: 10,
    location: 'Gelanggang Serbaguna (Unit Gelandangan)',
    task: 'Lontar Gelung Sasaran',
    durationMinutes: 5,
  },
];

export const INITIAL_EXPLORACE_SCORES: ExploraceScoresMap = {
  'grp-1': { 'st-1': 9, 'st-2': 5, 'st-3': 14, 'st-4': 14, 'st-5': 19, 'st-6': 14, 'st-7': 9, 'st-8': 9 }, // 93
  'grp-2': { 'st-1': 8, 'st-2': 4, 'st-3': 13, 'st-4': 13, 'st-5': 17, 'st-6': 13, 'st-7': 8, 'st-8': 8 }, // 84
  'grp-3': { 'st-1': 9, 'st-2': 5, 'st-3': 13, 'st-4': 14, 'st-5': 18, 'st-6': 13, 'st-7': 9, 'st-8': 8 }, // 89
  'grp-4': { 'st-1': 8, 'st-2': 4, 'st-3': 12, 'st-4': 12, 'st-5': 16, 'st-6': 12, 'st-7': 8, 'st-8': 9 }, // 81
  'grp-5': { 'st-1': 9, 'st-2': 4, 'st-3': 14, 'st-4': 13, 'st-5': 18, 'st-6': 14, 'st-7': 8, 'st-8': 8 }, // 88
  'grp-6': { 'st-1': 10, 'st-2': 5, 'st-3': 14, 'st-4': 13, 'st-5': 17, 'st-6': 13, 'st-7': 9, 'st-8': 9 }, // 90
  'grp-7': { 'st-1': 8, 'st-2': 4, 'st-3': 13, 'st-4': 12, 'st-5': 16, 'st-6': 12, 'st-7': 7, 'st-8': 8 }, // 80
  'grp-8': { 'st-1': 9, 'st-2': 4, 'st-3': 13, 'st-4': 14, 'st-5': 17, 'st-6': 13, 'st-7': 8, 'st-8': 9 }, // 87
};

export const INITIAL_IKHTIAR_SCORES: IkhtiarHidupScoresMap = {
  'grp-1': { kerjasama: 28, penyediaan: 27, rasa: 36 }, // 91
  'grp-2': { kerjasama: 27, penyediaan: 26, rasa: 35 }, // 88
  'grp-3': { kerjasama: 29, penyediaan: 28, rasa: 38 }, // 95 (Top Masakan Rimba)
  'grp-4': { kerjasama: 26, penyediaan: 25, rasa: 33 }, // 84
  'grp-5': { kerjasama: 28, penyediaan: 27, rasa: 35 }, // 90
  'grp-6': { kerjasama: 27, penyediaan: 28, rasa: 34 }, // 89
  'grp-7': { kerjasama: 26, penyediaan: 26, rasa: 34 }, // 86
  'grp-8': { kerjasama: 28, penyediaan: 26, rasa: 35 }, // 89
};

export const INITIAL_KAWAD_SCORES: KawadKakiScoresMap = {
  'uni-1': { arahan: 36, keseragaman: 27, nadaSuara: 28 }, // PENGAKAP: 91
  'uni-2': { arahan: 35, keseragaman: 26, nadaSuara: 27 }, // PUTERI ISLAM: 88
  'uni-3': { arahan: 38, keseragaman: 28, nadaSuara: 28 }, // TKRS: 94
};

export const INITIAL_SCHEDULE: ScheduleSlot[] = [
  // HARI PERTAMA - 24 NOVEMBER 2026 (SELASA)
  {
    id: 'sch-1-1',
    day: 1,
    dateLabel: 'Selasa, 24 November 2026',
    timeRange: '7.00 - 7.30',
    title: 'TAKLIMAT & KEM KOMANDAN',
    subtitle: 'Pendaftaran peserta (81 murid Tahap 2) & taklimat disiplin perkhemahan',
    category: 'TAKLIMAT',
    pic: 'En Azman Bin Saidin, Cik Hawasato & U. Raudah',
  },
  {
    id: 'sch-1-2',
    day: 1,
    dateLabel: 'Selasa, 24 November 2026',
    timeRange: '7.30 - 8.00',
    title: 'PEMBAHAGIAN 8 KUMPULAN',
    subtitle: 'Kumpulan Aldebaran, Acrux, Altair, Capella, Arcturus, Alphard, Pollux & Regulus',
    category: 'TAKLIMAT',
    pic: 'Semua Guru Kumpulan (Fasi LDK)',
  },
  {
    id: 'sch-1-3',
    day: 1,
    dateLabel: 'Selasa, 24 November 2026',
    timeRange: '8.00 - 9.30',
    title: 'LDK 1 : IKATAN (TEORI & AMALI)',
    subtitle: 'Slot 8.00-8.30, 8.30-9.00 & 9.00-9.30 — Kemahiran asas ikatan & simpulan perkhemahan',
    durationNote: '1 Jam 30 Minit',
    category: 'LDK',
    pic: 'Pengacara: Siti Aisah | Fasi Setiap LDK',
  },
  {
    id: 'sch-1-4',
    day: 1,
    dateLabel: 'Selasa, 24 November 2026',
    timeRange: '9.30 - 10.00',
    title: 'REHAT / MINUM PAGI',
    subtitle: 'Rehat & pengurusan diri peserta',
    category: 'REHAT',
    pic: 'Hjh Noraidah, Pn Jaliah & AKP',
  },
  {
    id: 'sch-1-5',
    day: 1,
    dateLabel: 'Selasa, 24 November 2026',
    timeRange: '10.00 - 11.30',
    title: 'LDK 2 : BANTUAN KECEMASAN (TEORI & AMALI)',
    subtitle: 'Slot 10.00-10.30, 10.30-11.00 & 11.00-11.30 — Asas pertolongan cemas & balutan anduh',
    durationNote: '1 Jam 30 Minit',
    category: 'LDK',
    pic: 'Pengacara: Siti Aisah | Fasi Setiap LDK',
  },
  {
    id: 'sch-1-6',
    day: 1,
    dateLabel: 'Selasa, 24 November 2026',
    timeRange: '11.30 - 12.00',
    title: 'MAKAN TENGAHARI',
    subtitle: 'Makanan tengahari disediakan untuk Guru & Murid',
    category: 'REHAT',
    pic: 'AJK Makanan: Hjh Noraidah, Pn Jaliah & AKP',
  },
  {
    id: 'sch-1-7',
    day: 1,
    dateLabel: 'Selasa, 24 November 2026',
    timeRange: '12.00 - 12.30',
    title: 'SOLAT ZOHOR BERJEMAAH',
    subtitle: 'Solat berjemaah & tazkirah ringkas sebelum bersurai Hari Pertama',
    category: 'IBADAH',
    pic: 'AJK Disiplin & Guru Kumpulan',
  },

  // HARI KEDUA - 25 NOVEMBER 2026 (RABU)
  {
    id: 'sch-2-1',
    day: 2,
    dateLabel: 'Rabu, 25 November 2026',
    timeRange: '7.00 - 9.00',
    title: 'LDK 3 : AKTIVITI EXPLORACE (8 STESEN)',
    subtitle: 'Slot 7.00-7.30 (Taklimat LDK 3), 7.30-8.00, 8.00-8.30 & 8.30-9.00 — Cabaran 8 Stesen & Rakaman Dron',
    durationNote: '1 Jam 30 Minit+',
    category: 'PERTANDINGAN',
    pic: 'Ketua Stesen 1–8 & Unit Dokumentasi Dron',
  },
  {
    id: 'sch-2-2',
    day: 2,
    dateLabel: 'Rabu, 25 November 2026',
    timeRange: '9.00 - 11.30',
    title: 'LDK 4 : IKHTIAR HIDUP (MASAKAN RIMBA)',
    subtitle: 'Slot 9.00-9.30 (LDK 4), 9.30-10.00, 10.00-10.30, 10.30-11.00 & 11.00-11.30 — Penyediaan & masakan rimba 8 kumpulan',
    durationNote: '2 Jam 30 Minit',
    category: 'PERTANDINGAN',
    pic: 'Ustazah Dg Himi & Fasi Ikhtiar Hidup',
  },
  {
    id: 'sch-2-3',
    day: 2,
    dateLabel: 'Rabu, 25 November 2026',
    timeRange: '11.30 - 12.00',
    title: 'PENILAIAN DAN MAKAN TENGAHARI',
    subtitle: 'Penilaian masakan Ikhtiar Hidup (Kerjasama 30%, Penyediaan 30%, Rasa 40%) & Makan Tengahari',
    category: 'PERTANDINGAN',
    pic: 'AJK Penilaian: Pn Juhani Binti Norman',
  },
  {
    id: 'sch-2-4',
    day: 2,
    dateLabel: 'Rabu, 25 November 2026',
    timeRange: '12.00 - 12.30',
    title: 'SOLAT ZOHOR BERJEMAAH',
    subtitle: 'Solat Zohor berjemaah & persiapan Hari Ketiga',
    category: 'IBADAH',
    pic: 'AJK Disiplin & Guru Kumpulan',
  },

  // HARI KETIGA - 26 NOVEMBER 2026 (KHAMIS)
  {
    id: 'sch-3-1',
    day: 3,
    dateLabel: 'Khamis, 26 November 2026',
    timeRange: '7.00 - 7.30',
    title: 'TAKLIMAT KOMANDAN',
    subtitle: 'Perhimpunan pagi & pemeriksaan kekemasan unit beruniform',
    category: 'TAKLIMAT',
    pic: 'En Azman Bin Saidin & Cik Hawasato',
  },
  {
    id: 'sch-3-2',
    day: 3,
    dateLabel: 'Khamis, 26 November 2026',
    timeRange: '7.30 - 9.00',
    title: 'LDK 5 : PERTANDINGAN KAWAD KAKI',
    subtitle: 'Slot 7.30-8.00 (LDK 5), 8.00-8.30 & 8.30-9.00 — Pengakap, Pergerakan Puteri Islam Malaysia & Tunas Kadet Remaja Sekolah (TKRS)',
    durationNote: '1 Jam 30 Minit',
    category: 'PERTANDINGAN',
    pic: 'AJK Penilaian & Unit Gelandangan (Padang Kawad)',
  },
  {
    id: 'sch-3-3',
    day: 3,
    dateLabel: 'Khamis, 26 November 2026',
    timeRange: '9.00 - 9.30',
    title: 'REHAT',
    subtitle: 'Rehat & persiapan ke dewan majlis penutup',
    category: 'REHAT',
    pic: 'AJK Makanan: Hjh Noraidah, Pn Jaliah & AKP',
  },
  {
    id: 'sch-3-4',
    day: 3,
    dateLabel: 'Khamis, 26 November 2026',
    timeRange: '9.30 - 10.00',
    title: 'REFLEKSI DAN POSTMORTEM',
    subtitle: 'Rumusan kemahiran murid & pemilihan Kadet Terbaik',
    category: 'TAKLIMAT',
    pic: 'Alif Akram, En Azman & Pn Juhani',
  },
  {
    id: 'sch-3-5',
    day: 3,
    dateLabel: 'Khamis, 26 November 2026',
    timeRange: '10.00 - 11.30',
    title: 'MAJLIS PENUTUP DAN PENYAMPAIAN HADIAH',
    subtitle: 'Slot 10.00-10.30, 10.30-11.00 & 11.00-11.30 — Tayangan video penutup, penyampaian 11 Hamper, 6 Trofi & Sijil 81 Peserta',
    durationNote: '1 Jam 30 Minit',
    category: 'PENUTUP',
    pic: 'Pengacara: Siti Aisah | AJK Hadiah: Noor Izzatul & Hadijah',
  },
];

export const INITIAL_AJK_LIST: AJKMember[] = [
  // INDUK
  {
    id: 'ajk-1',
    category: 'INDUK',
    jawatan: 'PENAUNG',
    namaGuru: 'TN HJ SABLI BIN MD JANEH',
    catatan: 'GURU BESAR SK LUPAK',
  },
  {
    id: 'ajk-2',
    category: 'INDUK',
    jawatan: 'PENASIHAT',
    namaGuru: 'EN HARUN BIN HJ SUNTRAK',
    catatan: 'PK KOKURIKULUM (PK KOKUM)',
  },
  {
    id: 'ajk-3',
    category: 'INDUK',
    jawatan: 'PENYELARAS',
    namaGuru: 'ALIF AKRAM BIN NOR KASANI',
    catatan: 'Penyelaras Keseluruhan Program Perkhemahan',
  },
  {
    id: 'ajk-4',
    category: 'INDUK',
    jawatan: 'SETIAUSAHA',
    namaGuru: 'EN JAMALUDIN BIN JAPAR',
    catatan: 'Dokumentasi Rekod, Surat & Laporan OPR Sekolah',
  },
  {
    id: 'ajk-5',
    category: 'INDUK',
    jawatan: 'BENDAHARI',
    namaGuru: 'HAWASATO',
    catatan: 'Pengurusan Kewangan & Perbelanjaan Kem',
  },

  // PELAKSANA
  {
    id: 'ajk-6',
    category: 'PELAKSANA',
    jawatan: 'AJK PENDAFTARAN',
    namaGuru: 'U. RAUDAH & HAWASATO',
    catatan: 'Pendaftaran 81 Peserta & Pembahagian Kumpulan',
  },
  {
    id: 'ajk-7',
    category: 'PELAKSANA',
    jawatan: 'KOMANDAN',
    namaGuru: 'EN AZMAN BIN SAIDIN',
    catatan: 'Ketua Komandan Kem & Kawalan Perbarisan',
  },
  {
    id: 'ajk-8',
    category: 'PELAKSANA',
    jawatan: 'TIMB. KEM KOMANDAN',
    namaGuru: 'CIK HAWASATO',
    catatan: 'Membantu Kem Komandan sepanjang 3 hari program',
  },
  {
    id: 'ajk-9',
    category: 'PELAKSANA',
    jawatan: 'AJK DISIPLIN',
    namaGuru: 'MD SHAZA BIN SAMJAN',
    catatan: 'Pemantauan disiplin, ketepatan masa & sahsiah peserta',
  },
  {
    id: 'ajk-10',
    category: 'PELAKSANA',
    jawatan: 'AJK KESELAMATAN & KESIHATAN',
    namaGuru: 'JAMALUDIN JAPAR & SULAIMAN SARBANI',
    catatan: 'Peti pertolongan cemas & keselamatan kawasan aktiviti',
  },
  {
    id: 'ajk-11',
    category: 'PELAKSANA',
    jawatan: 'AJK PERSIAPAN IKHTIAR HIDUP',
    namaGuru: 'USTAZAH DG HIMI',
    catatan: 'Setting keperluan bahan penyediaan ikhtiar hidup',
  },
  {
    id: 'ajk-12',
    category: 'PELAKSANA',
    jawatan: 'AJK MAKANAN DAN MINUMAN',
    namaGuru: 'HJH NORAIDAH & PN JALIAH & AKP',
    catatan: 'SELASA TGH: Makanan Guru & Murid | RABU TGH: Makanan Guru | KHAMIS TGH: Makanan Guru',
  },
  {
    id: 'ajk-13',
    category: 'PELAKSANA',
    jawatan: 'AJK PERSIAPAN TEMPAT',
    namaGuru: 'SEMUA UNIT GELANDANGAN',
    catatan: 'Sediakan Kawasan: Explorace, Ikhtiar Hidup & Padang Kawad Kaki',
  },
  {
    id: 'ajk-14',
    category: 'PELAKSANA',
    jawatan: 'AJK TEKNIKAL PA SISTEM',
    namaGuru: 'MOHAMMAD HUSLIATHIR BIN HUSSIN',
    catatan: 'Pastikan PA Sistem disediakan sepanjang aktiviti LDK & Majlis Penutup',
  },
  {
    id: 'ajk-15',
    category: 'PELAKSANA',
    jawatan: 'AJK DOKUMENTASI PHOTO DAN VIDEO',
    namaGuru: 'MOHD FADZIL BIN MD NOH & MOHD SHAHRUL NIZAM BIN AYUB',
    catatan: 'Ambil gambar setiap moment LDK, terbangkan Dron semasa Explorace & PIC Video Penutup',
  },
  {
    id: 'ajk-16',
    category: 'PELAKSANA',
    jawatan: 'AJK HADIAH DAN SIJIL',
    namaGuru: 'NOOR IZZATUL SOLEHAH BIN MOHD SULONG & HADIJAH BINTI DAUD',
    catatan: '11 Hamper | 6 Trofi & Sijil 6 Kadet Terbaik | Sijil Penyertaan 81 Peserta',
  },
  {
    id: 'ajk-17',
    category: 'PELAKSANA',
    jawatan: 'PENGACARA MAJLIS',
    namaGuru: 'SITI AISAH BINTI MAT YASSIN',
    catatan: 'Program Bantuan Kecemasan / Ikatan Simpul / Majlis Penutup',
  },
  {
    id: 'ajk-18',
    category: 'PELAKSANA',
    jawatan: 'AJK PENILAIAN',
    namaGuru: 'PN JUHANI BINTI NORMAN',
    catatan: 'Penilaian Masakan Ikhtiar Hidup / Pemilihan Kadet Terbaik',
  },

  // GURU KUMPULAN
  {
    id: 'ajk-gk-1',
    category: 'GURU_KUMPULAN',
    jawatan: 'GURU KUMPULAN 1 — ALDEBARAN',
    namaGuru: 'EN FADZIL & USTAZAH RAUDAH',
    catatan: 'Bertanggungjawab sebagai Fasi Ikhtiar Hidup & Fasi Setiap LDK',
  },
  {
    id: 'ajk-gk-2',
    category: 'GURU_KUMPULAN',
    jawatan: 'GURU KUMPULAN 2 — ACRUX',
    namaGuru: 'CIK HAWA & USTAZAH AZZLINA',
    catatan: 'Bertanggungjawab sebagai Fasi Ikhtiar Hidup & Fasi Setiap LDK',
  },
  {
    id: 'ajk-gk-3',
    category: 'GURU_KUMPULAN',
    jawatan: 'GURU KUMPULAN 3 — ALTAIR',
    namaGuru: 'CIK IZATUL & PN HADIJAH',
    catatan: 'Bertanggungjawab sebagai Fasi Ikhtiar Hidup & Fasi Setiap LDK',
  },
  {
    id: 'ajk-gk-4',
    category: 'GURU_KUMPULAN',
    jawatan: 'GURU KUMPULAN 4 — CAPELLA',
    namaGuru: 'UST SHAHRUL & JAMAL',
    catatan: 'Bertanggungjawab sebagai Fasi Ikhtiar Hidup & Fasi Setiap LDK',
  },
  {
    id: 'ajk-gk-5',
    category: 'GURU_KUMPULAN',
    jawatan: 'GURU KUMPULAN 5 — ARCTURUS',
    namaGuru: 'HUSLI & SULAIMAN',
    catatan: 'Bertanggungjawab sebagai Fasi Ikhtiar Hidup & Fasi Setiap LDK',
  },
  {
    id: 'ajk-gk-6',
    category: 'GURU_KUMPULAN',
    jawatan: 'GURU KUMPULAN 6 — ALPHARD',
    namaGuru: 'PN JUHANI & AISAH',
    catatan: 'Bertanggungjawab sebagai Fasi Ikhtiar Hidup & Fasi Setiap LDK',
  },
  {
    id: 'ajk-gk-7',
    category: 'GURU_KUMPULAN',
    jawatan: 'GURU KUMPULAN 7 — POLLUX',
    namaGuru: 'UST HIMI & TC MIMI',
    catatan: 'Bertanggungjawab sebagai Fasi Ikhtiar Hidup & Fasi Setiap LDK',
  },
  {
    id: 'ajk-gk-8',
    category: 'GURU_KUMPULAN',
    jawatan: 'GURU KUMPULAN 8 — REGULUS',
    namaGuru: 'RAZI & ZUL',
    catatan: 'Bertanggungjawab sebagai Fasi Ikhtiar Hidup & Fasi Setiap LDK',
  },

  // EXPLORACE KETUA STESEN
  {
    id: 'ajk-ex-1',
    category: 'EXPLORACE',
    jawatan: 'KETUA STESEN 1',
    namaGuru: 'PN JUHANI & WAN JUZLIYA',
    catatan: 'Cipta Logo / Bendera Kumpulan (10 Markah, 10 Minit)',
  },
  {
    id: 'ajk-ex-2',
    category: 'EXPLORACE',
    jawatan: 'KETUA STESEN 2',
    namaGuru: 'USTAZAH RAUDAH DAN PN HADIJAH',
    catatan: 'Laluan Berhalangan (5 Markah, 5 Minit)',
  },
  {
    id: 'ajk-ex-3',
    category: 'EXPLORACE',
    jawatan: 'KETUA STESEN 3',
    namaGuru: 'SITI AISAH & UST AZZLINA',
    catatan: 'Misi Selamatkan Tanaman Anak Pokok (15 Markah, 7 Minit)',
  },
  {
    id: 'ajk-ex-4',
    category: 'EXPLORACE',
    jawatan: 'KETUA STESEN 4',
    namaGuru: 'UST SHAHRUL DAN SIR ZUL / HAWASATO',
    catatan: 'Pertolongan Cemas dan Balutan Asas (15 Markah, 5 Minit)',
  },
  {
    id: 'ajk-ex-5',
    category: 'EXPLORACE',
    jawatan: 'KETUA STESEN 5',
    namaGuru: 'HUSLI DAN RAZI',
    catatan: 'Cabaran Hasilkan Api (20 Markah, 20 Minit)',
  },
  {
    id: 'ajk-ex-6',
    category: 'EXPLORACE',
    jawatan: 'KETUA STESEN 6',
    namaGuru: 'SYAZA & IZZATUL',
    catatan: 'Bina Gajet / Radio Rosak (15 Markah, 15 Minit)',
  },
  {
    id: 'ajk-ex-7',
    category: 'EXPLORACE',
    jawatan: 'KETUA STESEN 7',
    namaGuru: 'UST HARUN & USTZAH HIMI',
    catatan: 'Radio Rosak / Bina Gajet (10 Markah, 5 Minit)',
  },
  {
    id: 'ajk-ex-8',
    category: 'EXPLORACE',
    jawatan: 'KETUA STESEN 8',
    namaGuru: 'SIR ZUL & SULAIMAN',
    catatan: 'Lontar Gelung (10 Markah, 5 Minit)',
  },
];

export const INITIAL_AWARDS: AwardItem[] = [
  // KATEGORI UMUM (1-8)
  {
    id: 'aw-umum-1',
    category: 'UMUM',
    order: 1,
    title: 'Kumpulan Terbaik Explorace',
    winner: 'ALDEBARAN',
    notes: 'Markah tertinggi keseluruhan 8 Stesen Explorace',
    autoKey: 'EXPLORACE_TOP',
  },
  {
    id: 'aw-umum-2',
    category: 'UMUM',
    order: 2,
    title: 'Kumpulan Terbaik Masakan Rimba',
    winner: 'ALTAIR',
    notes: 'Markah tertinggi penilaian Ikhtiar Hidup',
    autoKey: 'IKHTIAR_TOP',
  },
  {
    id: 'aw-umum-3',
    category: 'UMUM',
    order: 3,
    title: 'Kumpulan Terbaik Menepati Masa',
    winner: 'ALPHARD',
    notes: 'Disiplin masa terbaik sepanjang 5 LDK',
  },
  {
    id: 'aw-umum-4',
    category: 'UMUM',
    order: 4,
    title: 'Kumpulan Paling Berdisiplin',
    winner: 'ARCTURUS',
    notes: 'Kepatuhan arahan Kem Komandan & AJK Disiplin',
  },
  {
    id: 'aw-umum-5',
    category: 'UMUM',
    order: 5,
    title: 'Kumpulan Paling Kreatif',
    winner: 'ACRUX',
    notes: 'Kreativiti ciptaan bendera & binaan gajet',
  },
  {
    id: 'aw-umum-6',
    category: 'UMUM',
    order: 6,
    title: 'Kumpulan Paling Sporting',
    winner: 'REGULUS',
    notes: 'Semangat kesukanan & sorakan kumpulan paling aktif',
  },
  {
    id: 'aw-umum-7',
    category: 'UMUM',
    order: 7,
    title: 'Kumpulan Paling Bekerjasama',
    winner: 'CAPELLA',
    notes: 'Kerjasama berpasukan dalam semua LDK',
  },
  {
    id: 'aw-umum-8',
    category: 'UMUM',
    order: 8,
    title: 'Komandan Terbaik',
    winner: 'MUHAMMAD RAYYAN HARITH (TKRS)',
    notes: 'Arahan kawad jelas, tegas & berwibawa',
  },

  // KATEGORI KAWAD KAKI TERBAIK (1-3)
  {
    id: 'aw-kawad-1',
    category: 'KAWAD',
    order: 1,
    title: 'JOHAN KAWAD KAKI',
    winner: 'TUNAS KADET REMAJA SEKOLAH',
    notes: 'Tempat Pertama Pertandingan Kawad Asas Unit Beruniform',
    autoKey: 'KAWAD_1',
  },
  {
    id: 'aw-kawad-2',
    category: 'KAWAD',
    order: 2,
    title: 'NAIB JOHAN KAWAD KAKI',
    winner: 'PENGAKAP',
    notes: 'Tempat Kedua Pertandingan Kawad Asas Unit Beruniform',
    autoKey: 'KAWAD_2',
  },
  {
    id: 'aw-kawad-3',
    category: 'KAWAD',
    order: 3,
    title: 'TEMPAT KE-3 KAWAD KAKI',
    winner: 'PERGERAKAN PUTERI ISLAM MALAYSIA',
    notes: 'Tempat Ketiga Pertandingan Kawad Asas Unit Beruniform',
    autoKey: 'KAWAD_3',
  },

  // 6 TROFI & SIJIL KADET TERBAIK (Catatan AJK Hadiah)
  {
    id: 'aw-kadet-1',
    category: 'KADET',
    order: 1,
    title: 'Kadet Terbaik (TKRS - Putera)',
    winner: 'AHMAD DANISH HAKIM (Tahun 6)',
    notes: 'Trofi & Sijil Kadet Terbaik',
  },
  {
    id: 'aw-kadet-2',
    category: 'KADET',
    order: 2,
    title: 'Kadet Terbaik (TKRS - Puteri)',
    winner: 'NUR AINA BATRISYIA (Tahun 6)',
    notes: 'Trofi & Sijil Kadet Terbaik',
  },
  {
    id: 'aw-kadet-3',
    category: 'KADET',
    order: 3,
    title: 'Kadet Terbaik (Pengakap - Putera)',
    winner: 'MUHAMMAD FARIS IRFAN (Tahun 6)',
    notes: 'Trofi & Sijil Kadet Terbaik',
  },
  {
    id: 'aw-kadet-4',
    category: 'KADET',
    order: 4,
    title: 'Kadet Terbaik (Pengakap - Puteri)',
    winner: 'SITI NUR ZAHRA (Tahun 5)',
    notes: 'Trofi & Sijil Kadet Terbaik',
  },
  {
    id: 'aw-kadet-5',
    category: 'KADET',
    order: 5,
    title: 'Kadet Terbaik (Puteri Islam - Tahap 2)',
    winner: 'NURUL IMAN QAISARA (Tahun 6)',
    notes: 'Trofi & Sijil Kadet Terbaik',
  },
  {
    id: 'aw-kadet-6',
    category: 'KADET',
    order: 6,
    title: 'Peserta Terbaik Keseluruhan Kem 2026',
    winner: 'MUHAMMAD RAYYAN HARITH (Tahun 6)',
    notes: 'Trofi Khas Kem Komandan & Penilaian',
  },
];

function createSceneSvgDataUrl(title: string, subtitle: string, bgStart: string, bgEnd: string, accent: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgStart}"/>
        <stop offset="100%" stop-color="${bgEnd}"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#g)"/>
    <circle cx="680" cy="110" r="85" fill="${accent}" opacity="0.18"/>
    <circle cx="120" cy="400" r="140" fill="${accent}" opacity="0.12"/>
    <path d="M0 390 L220 260 L410 380 L580 230 L800 370 L800 500 L0 500 Z" fill="#06131f" opacity="0.55"/>
    <path d="M400 135 L290 325 L510 325 Z" fill="${accent}" opacity="0.85"/>
    <path d="M400 205 L355 325 L445 325 Z" fill="#06131f"/>
    <rect x="40" y="375" width="720" height="90" rx="14" fill="#06131f" opacity="0.82" stroke="${accent}" stroke-width="2"/>
    <text x="68" y="415" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="24">${title}</text>
    <text x="68" y="445" fill="#cbd5e1" font-family="sans-serif" font-size="17">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_OPR_DATA: OPRReportData = {
  namaProgram: 'PROGRAM PERKHEMAHAN KOKURIKULUM SK LUPAK TAHUN 2026',
  anjuran: 'Unit Kokurikulum SK Lupak (Pengakap, Pergerakan Puteri Islam Malaysia & Tunas Kadet Remaja Sekolah)',
  tarikh: '24 hingga 26 November 2026 (Selasa – Khamis)',
  masa: '7.00 Pagi – 12.30 Tengahari (3 Hari)',
  tempat: 'Tapak Perkhemahan & Kawasan Sekolah Kebangsaan Lupak',
  sasaran: 'Semua Murid Tahap 2 (81 Orang Peserta — 8 Kumpulan)',
  kehadiran: '81 / 81 Peserta (100% Kehadiran) & Semua Guru SK Lupak',
  objektif: [
    'Melahirkan murid Tahap 2 yang berdisiplin, berdikari dan mempunyai daya tahan fizikal serta mental melalui aktiviti kepengakapan dan badan beruniform.',
    'Mengaplikasikan kemahiran teori dan amali Ikatan & Simpulan, Bantuan Kecemasan, Ikhtiar Hidup (Masakan Rimba), serta Kawad Kaki Asas.',
    'Memupuk semangat kerjasama berpasukan merentas 8 kumpulan (Aldebaran, Acrux, Altair, Capella, Arcturus, Alphard, Pollux & Regulus) dalam cabaran Explorace 8 Stesen.',
  ],
  ringkasanList: [
    'Program berjalan lancar selama 3 hari melibatkan 5 Latihan Dalam Kumpulan (LDK): LDK 1 Ikatan & Simpulan, LDK 2 Bantuan Kecemasan, LDK 3 Explorace 8 Stesen (dengan rakaman dron), LDK 4 Ikhtiar Hidup Masakan Rimba, dan LDK 5 Pertandingan Kawad Kaki Asas.',
    'Penilaian dilaksanakan secara menyeluruh merangkumi kerjasama kumpulan, kemahiran amali stesen, kualiti masakan rimba serta keseragaman kawad kaki antara unit beruniform (TKRS, Pengakap & Pergerakan Puteri Islam Malaysia).',
    'Majlis Penutup disempurnakan dengan penyampaian 11 Hamper Kumpulan & Unit Beruniform, 6 Trofi Kadet Terbaik serta 81 Sijil Penyertaan kepada semua peserta.',
  ],
  ringkasanAktiviti:
    'Program berjalan lancar selama 3 hari melibatkan 5 Latihan Dalam Kumpulan (LDK): LDK 1 Ikatan & Simpulan, LDK 2 Bantuan Kecemasan, LDK 3 Explorace 8 Stesen (dengan rakaman dron), LDK 4 Ikhtiar Hidup Masakan Rimba, dan LDK 5 Pertandingan Kawad Kaki Asas.\nPenilaian dilaksanakan secara menyeluruh merangkumi kerjasama kumpulan, kemahiran amali stesen, kualiti masakan rimba serta keseragaman kawad kaki antara unit beruniform (TKRS, Pengakap & Pergerakan Puteri Islam Malaysia).\nMajlis Penutup disempurnakan dengan penyampaian 11 Hamper Kumpulan & Unit Beruniform, 6 Trofi Kadet Terbaik serta 81 Sijil Penyertaan kepada semua peserta.',
  kekuatanList: [
    'Komitmen tinggi daripada semua AJK Guru dan AKP sepanjang 3 hari pelaksanaan perkhemahan.',
    'Pengurusan masa dan kawalan perbarisan yang teratur oleh Kem Komandan serta penggunaan sistem pemarkahan digital masa nyata.',
    'Penglibatan aktif 100% peserta (81 orang murid Tahap 2) dalam semua 8 stesen Explorace dan aktiviti Ikhtiar Hidup.',
  ],
  kekuatan:
    'Komitmen tinggi daripada semua AJK Guru dan AKP sepanjang 3 hari pelaksanaan perkhemahan.\nPengurusan masa dan kawalan perbarisan yang teratur oleh Kem Komandan serta penggunaan sistem pemarkahan digital masa nyata.\nPenglibatan aktif 100% peserta (81 orang murid Tahap 2) dalam semua 8 stesen Explorace dan aktiviti Ikhtiar Hidup.',
  penambahbaikanList: [
    'Menambah bilangan peralatan memasak rimba bagi melancarkan sesi amali Ikhtiar Hidup untuk semua 8 kumpulan.',
    'Menyediakan kanopi teduhan tambahan di stesen terbuka Explorace sebagai persediaan sekiranya cuaca panas atau hujan.',
    'Memperuntukkan masa latihan kawad kaki tambahan kepada ketua platun sebelum sesi penilaian rasmi dijalankan.',
  ],
  penambahbaikan:
    'Menambah bilangan peralatan memasak rimba bagi melancarkan sesi amali Ikhtiar Hidup untuk semua 8 kumpulan.\nMenyediakan kanopi teduhan tambahan di stesen terbuka Explorace sebagai persediaan sekiranya cuaca panas atau hujan.\nMemperuntukkan masa latihan kawad kaki tambahan kepada ketua platun sebelum sesi penilaian rasmi dijalankan.',
  disediakanOleh: 'EN JAMALUDIN BIN JAPAR',
  jawatanPenyedia: 'Setiausaha Program Perkhemahan SK Lupak 2026',
  disemakOleh: 'EN HARUN BIN HJ SUNTRAK',
  jawatanPenyemak: 'Penolong Kanan Kokurikulum SK Lupak',
  disahkanOleh: 'TN HJ SABLI BIN MD JANEH',
  jawatanPengesah: 'Guru Besar SK Lupak',
  photos: [
    {
      id: 'ph-1',
      tag: 'HARI 1 • LDK 1 & LDK 2',
      caption: 'Amali Ikatan Simpulan & Bantuan Kecemasan oleh 8 kumpulan peserta.',
      dataUrl: createSceneSvgDataUrl(
        'LDK 1 & 2: Ikatan & Bantuan Kecemasan',
        '24 November 2026 • Teori dan Amali Balutan Asas',
        '#064e3b',
        '#0f172a',
        '#34d399'
      ),
    },
    {
      id: 'ph-2',
      tag: 'HARI 2 • LDK 3 EXPLORACE',
      caption: 'Cabaran Explorace 8 Stesen (Bendera, Halangan, Tanaman, Api & Gajet).',
      dataUrl: createSceneSvgDataUrl(
        'LDK 3: Aktiviti Explorace 8 Stesen',
        '25 November 2026 • Rakaman Dron & Penilaian Pantas Stesen',
        '#1e3a8a',
        '#090d16',
        '#38bdf8'
      ),
    },
    {
      id: 'ph-3',
      tag: 'HARI 2 • LDK 4 IKHTIAR HIDUP',
      caption: 'Sesi Masakan Rimba & penilaian kerjasama, penyediaan serta rasa masakan.',
      dataUrl: createSceneSvgDataUrl(
        'LDK 4: Ikhtiar Hidup & Masakan Rimba',
        '25 November 2026 • Penilaian oleh AJK Penilaian Pn Juhani',
        '#78350f',
        '#0f172a',
        '#fbbf24'
      ),
    },
    {
      id: 'ph-4',
      tag: 'HARI 3 • KAWAD & PENUTUP',
      caption: 'Pertandingan Kawad Kaki (TKRS, Pengakap, Pergerakan Puteri Islam Malaysia) & Penyampaian Hadiah.',
      dataUrl: createSceneSvgDataUrl(
        'LDK 5: Kawad Kaki & Majlis Penutup',
        '26 November 2026 • Penyampaian 11 Hamper & 6 Trofi Terbaik',
        '#311042',
        '#0f172a',
        '#c084fc'
      ),
    },
  ],
};

export const INITIAL_CAMP_STATE: CampAppState = {
  lastUpdated: new Date().toISOString(),
  stations: INITIAL_STATIONS,
  groups: INITIAL_GROUPS,
  uniformUnits: INITIAL_UNIFORM_UNITS,
  exploraceScores: INITIAL_EXPLORACE_SCORES,
  ikhtiarScores: INITIAL_IKHTIAR_SCORES,
  kawadScores: INITIAL_KAWAD_SCORES,
  schedule: INITIAL_SCHEDULE,
  ajkList: INITIAL_AJK_LIST,
  awards: INITIAL_AWARDS,
  oprData: INITIAL_OPR_DATA,
};

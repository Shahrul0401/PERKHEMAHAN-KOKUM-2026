export type UserRole = 'URUSETIA' | 'KOMANDAN' | 'PENILAIAN' | 'KETUA_STESEN' | 'PENTADBIR';

export interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  designation: string;
  pin: string;
  stationAccess?: string;
}

export interface ScheduleSlot {
  id: string;
  day: 1 | 2 | 3;
  dateLabel: string;
  timeRange: string;
  title: string;
  subtitle: string;
  durationNote?: string;
  category: 'TAKLIMAT' | 'LDK' | 'PERTANDINGAN' | 'REHAT' | 'IBADAH' | 'PENUTUP';
  pic: string;
}

export interface GroupInfo {
  id: string;
  number: number;
  name: string;
  guruKumpulan: string;
  colorHex: string;
  badgeText: string;
}

export interface UniformUnit {
  id: string;
  number: number;
  name: string;
  shortName: string;
}

export interface ExploraceStation {
  id: string;
  number: number;
  name: string;
  pic: string;
  maxMarks: number;
  location: string;
  task: string;
  durationMinutes: number;
}

// groupId -> stationId -> score
export type ExploraceScoresMap = Record<string, Record<string, number>>;

export interface IkhtiarHidupScore {
  kerjasama: number; // Max 30
  penyediaan: number; // Max 30
  rasa: number; // Max 40
}

export type IkhtiarHidupScoresMap = Record<string, IkhtiarHidupScore>;

export interface KawadKakiScore {
  arahan: number; // Max 40
  keseragaman: number; // Max 30
  nadaSuara: number; // Max 30
}

export type KawadKakiScoresMap = Record<string, KawadKakiScore>;

export interface AJKMember {
  id: string;
  category: 'INDUK' | 'PELAKSANA' | 'GURU_KUMPULAN' | 'EXPLORACE';
  jawatan: string;
  namaGuru: string;
  catatan: string;
}

export interface AwardItem {
  id: string;
  category: 'UMUM' | 'KAWAD' | 'KADET';
  order: number;
  title: string;
  winner: string;
  notes: string;
  autoKey?: 'EXPLORACE_TOP' | 'IKHTIAR_TOP' | 'KAWAD_1' | 'KAWAD_2' | 'KAWAD_3';
}

export interface OPRPhotoSlot {
  id: string;
  caption: string;
  dataUrl: string; // Base64 or SVG data URL
  tag: string;
}

export interface OPRReportData {
  namaProgram: string;
  anjuran: string;
  tarikh: string;
  masa: string;
  tempat: string;
  sasaran: string;
  kehadiran: string;
  objektif: string[];
  ringkasanAktiviti: string;
  kekuatan: string;
  penambahbaikan: string;
  disediakanOleh: string;
  jawatanPenyedia: string;
  disemakOleh: string;
  jawatanPenyemak: string;
  disahkanOleh: string;
  jawatanPengesah: string;
  photos: OPRPhotoSlot[];
}

export interface SyncQueueItem {
  id: string;
  timestamp: string;
  description: string;
  actor: string;
  synced: boolean;
}

export interface CampAppState {
  lastUpdated: string;
  stations: ExploraceStation[];
  groups: GroupInfo[];
  uniformUnits: UniformUnit[];
  exploraceScores: ExploraceScoresMap;
  ikhtiarScores: IkhtiarHidupScoresMap;
  kawadScores: KawadKakiScoresMap;
  schedule: ScheduleSlot[];
  ajkList: AJKMember[];
  awards: AwardItem[];
  oprData: OPRReportData;
}

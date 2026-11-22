import { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { CampAppState, OPRReportData, SyncQueueItem } from '../types/camp';

export const CAMP_DOC_ID = 'sk_lupak_2026';
export const CAMP_WORKSPACE_PATH = `campWorkspaces/${CAMP_DOC_ID}`;
export const CAMP_SYNC_LOGS_PATH = `campWorkspaces/${CAMP_DOC_ID}/syncLogs`;

const DEVICE_UID_KEY = 'sk_lupak_2026_device_actor_uid_v1';
const TEACHER_NAME_KEY = 'sk_lupak_2026_teacher_name_v1';

export function getSavedTeacherName(): string {
  try {
    return localStorage.getItem(TEACHER_NAME_KEY) || 'Guru SK Lupak';
  } catch {
    return 'Guru SK Lupak';
  }
}

export function setSavedTeacherName(name: string): void {
  try {
    localStorage.setItem(TEACHER_NAME_KEY, name.trim() || 'Guru SK Lupak');
  } catch {
    // ignore
  }
}

export function getOrCreateDeviceActorId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_UID_KEY);
    if (existing && /^guru_[a-zA-Z0-9_-]+$/.test(existing)) {
      return existing;
    }
    const generated = `guru_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`.replace(
      /[^a-zA-Z0-9_-]/g,
      ''
    );
    localStorage.setItem(DEVICE_UID_KEY, generated);
    return generated;
  } catch {
    return 'guru_sk_lupak_default';
  }
}

function sanitizeString(val: string | undefined, maxLen: number, fallback: string): string {
  const trimmed = (val || '').trim();
  const base = trimmed.length > 0 ? trimmed : fallback;
  return base.slice(0, maxLen);
}

function buildOprMeta(opr: OPRReportData): Record<string, unknown> {
  return {
    namaProgram: sanitizeString(opr.namaProgram, 200, 'PROGRAM PERKHEMAHAN KOKURIKULUM SK LUPAK 2026'),
    tarikh: sanitizeString(opr.tarikh, 100, '24 – 26 November 2026'),
    masa: sanitizeString(opr.masa, 100, 'Sepenuh Masa (3 Hari 2 Malam)'),
    tempat: sanitizeString(opr.tempat, 150, 'Tapak Perkhemahan SK Lupak'),
    sasaran: sanitizeString(opr.sasaran, 200, 'Semua Murid Tahap 2'),
    kehadiran: sanitizeString(opr.kehadiran, 150, '100%'),
    anjuran: sanitizeString(opr.anjuran, 150, 'Unit Kokurikulum SK Lupak'),
    objektif: (opr.objektif || []).slice(0, 15).map((o) => String(o).slice(0, 350)),
    ringkasanList: (opr.ringkasanList || []).slice(0, 15).map((r) => String(r).slice(0, 350)),
    ringkasanAktiviti: sanitizeString(opr.ringkasanAktiviti, 1800, '-'),
    kekuatanList: (opr.kekuatanList || []).slice(0, 15).map((k) => String(k).slice(0, 350)),
    kekuatan: sanitizeString(opr.kekuatan, 1500, '-'),
    penambahbaikanList: (opr.penambahbaikanList || []).slice(0, 15).map((p) => String(p).slice(0, 350)),
    penambahbaikan: sanitizeString(opr.penambahbaikan, 1500, '-'),
    disediakanOleh: sanitizeString(opr.disediakanOleh, 120, 'EN JAMALUDIN BIN JAPAR'),
    jawatanPenyedia: sanitizeString(opr.jawatanPenyedia, 120, 'Setiausaha Program Perkhemahan SK Lupak 2026'),
    disemakOleh: sanitizeString(opr.disemakOleh, 120, 'EN HARUN BIN HJ SUNTRAK'),
    jawatanPenyemak: sanitizeString(opr.jawatanPenyemak, 120, 'Penolong Kanan Kokurikulum SK Lupak'),
    disahkanOleh: sanitizeString(opr.disahkanOleh, 120, 'TN HJ SABLI BIN MD JANEH'),
    jawatanPengesah: sanitizeString(opr.jawatanPengesah, 120, 'Guru Besar SK Lupak'),
    photos: (opr.photos || []).slice(0, 4).map((p) => ({
      id: sanitizeString(p.id, 64, 'photo'),
      caption: sanitizeString(p.caption, 200, 'Aktiviti Perkhemahan'),
      tag: sanitizeString(p.tag, 80, 'Aktiviti'),
      dataUrl: p.dataUrl && p.dataUrl.length < 40000 ? p.dataUrl : '',
    })),
  };
}

export async function pushCampStateToFirestore(
  user: User | null,
  state: CampAppState,
  lastActionDesc: string,
  customTeacherName?: string
): Promise<void> {
  const docRef = doc(db, 'campWorkspaces', CAMP_DOC_ID);
  const actorUid = user ? user.uid : getOrCreateDeviceActorId();
  const updatedByName = sanitizeString(
    user?.displayName || user?.email || customTeacherName || getSavedTeacherName(),
    120,
    'Guru SK Lupak'
  );
  const lastAction = sanitizeString(
    lastActionDesc,
    300,
    'Penyegerakan data Perkhemahan Kokurikulum SK Lupak 2026'
  );

  let exists = false;
  try {
    const snap = await getDoc(docRef);
    exists = snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, CAMP_WORKSPACE_PATH);
  }

  const sharedFields = {
    updatedByUid: actorUid,
    updatedByName,
    lastAction,
    exploraceScores: state.exploraceScores || {},
    ikhtiarScores: state.ikhtiarScores || {},
    kawadScores: state.kawadScores || {},
    schedule: (state.schedule || []).slice(0, 60),
    stations: (state.stations || []).slice(0, 20),
    ajkList: (state.ajkList || []).slice(0, 60),
    awards: (state.awards || []).slice(0, 40),
    oprMeta: buildOprMeta(state.oprData),
    updatedAt: serverTimestamp(),
  };

  if (!exists) {
    try {
      await setDoc(docRef, {
        campId: CAMP_DOC_ID,
        ownerId: actorUid,
        ...sharedFields,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, CAMP_WORKSPACE_PATH);
    }
  } else {
    try {
      await updateDoc(docRef, sharedFields);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, CAMP_WORKSPACE_PATH);
    }
  }

  const cleanLogId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`.replace(
    /[^a-zA-Z0-9_-]/g,
    ''
  );
  const logDocRef = doc(db, 'campWorkspaces', CAMP_DOC_ID, 'syncLogs', cleanLogId);
  try {
    await setDoc(logDocRef, {
      logId: cleanLogId,
      campId: CAMP_DOC_ID,
      ownerId: actorUid,
      actor: updatedByName,
      description: lastAction,
      timestampLabel: sanitizeString(
        new Date().toLocaleTimeString('ms-MY', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        40,
        '00:00:00'
      ),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${CAMP_SYNC_LOGS_PATH}/${cleanLogId}`);
  }
}

export function subscribeToCampWorkspace(
  onData: (
    remoteData: Partial<CampAppState>,
    meta: { updatedByName: string; lastAction: string }
  ) => void,
  onEmptyInit?: () => void
): () => void {
  const docRef = doc(db, 'campWorkspaces', CAMP_DOC_ID);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        if (onEmptyInit) onEmptyInit();
        return;
      }
      const data = snapshot.data();
      const remoteOpr = (data.oprMeta || {}) as Partial<OPRReportData>;

      const partial: Partial<CampAppState> = {
        exploraceScores: data.exploraceScores,
        ikhtiarScores: data.ikhtiarScores,
        kawadScores: data.kawadScores,
        schedule: Array.isArray(data.schedule) ? data.schedule : undefined,
        stations: Array.isArray(data.stations) ? data.stations : undefined,
        ajkList: Array.isArray(data.ajkList) ? data.ajkList : undefined,
        awards: Array.isArray(data.awards) ? data.awards : undefined,
      };

      if (data.oprMeta) {
        partial.oprData = remoteOpr as OPRReportData;
      }

      onData(partial, {
        updatedByName: String(data.updatedByName || 'Guru SK Lupak'),
        lastAction: String(data.lastAction || 'Dikemas kini dari awan'),
      });
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, CAMP_WORKSPACE_PATH);
    }
  );
}

export function subscribeToSyncLogs(onLogs: (items: SyncQueueItem[]) => void): () => void {
  const q = query(
    collection(db, 'campWorkspaces', CAMP_DOC_ID, 'syncLogs'),
    where('campId', '==', CAMP_DOC_ID)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const logs: SyncQueueItem[] = snapshot.docs
        .map((d) => {
          const data = d.data();
          return {
            id: String(data.logId || d.id),
            timestamp: String(data.timestampLabel || ''),
            description: String(data.description || ''),
            actor: String(data.actor || 'Guru SK Lupak'),
            synced: true,
          };
        })
        .slice(0, 30);
      if (logs.length > 0) {
        onLogs(logs);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, CAMP_SYNC_LOGS_PATH);
    }
  );
}

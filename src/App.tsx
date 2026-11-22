import React, { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  Award,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Cloud,
  CloudOff,
  Compass,
  Home,
  LogIn,
  LogOut,
  Menu,
  PanelLeftClose,
  RefreshCw,
  RotateCcw,
  Users,
  Wifi,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AJKSection } from './components/AJKSection';
import { AwardsAndOPRSection } from './components/AwardsAndOPRSection';
import { ExploraceSection } from './components/ExploraceSection';
import { PWAInstallButton } from './components/PWAInstallButton';
import { ScheduleSection } from './components/ScheduleSection';
import { ScoringFormsSection } from './components/ScoringFormsSection';
import { WelcomeLoginView } from './components/WelcomeLoginView';
import { INITIAL_CAMP_STATE, TEACHER_ACCOUNTS } from './data/initialData';
import { auth, googleProvider } from './firebase';
import {
  pushCampStateToFirestore,
  subscribeToCampWorkspace,
  subscribeToSyncLogs,
} from './services/firebaseSyncService';
import {
  AJKMember,
  AwardItem,
  CampAppState,
  ExploraceStation,
  IkhtiarHidupScore,
  KawadKakiScore,
  OPRReportData,
  ScheduleSlot,
  SyncQueueItem,
  UserAccount,
} from './types/camp';

const STORAGE_STATE_KEY = 'sk_lupak_2026_camp_state_v1';
const STORAGE_QUEUE_KEY = 'sk_lupak_2026_sync_queue_v1';
const STORAGE_WELCOME_KEY = 'sk_lupak_2026_entered_v1';

type MainTab = 'JADUAL' | 'EXPLORACE' | 'PEMARKAHAN' | 'AJK' | 'ANUGERAH_OPR';

const MENU_ITEMS: {
  id: MainTab;
  label: string;
  shortMobileLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'JADUAL',
    label: 'Jadual/ Atur Cara',
    shortMobileLabel: 'Jadual',
    icon: Calendar,
  },
  {
    id: 'EXPLORACE',
    label: 'Aktiviti Explorace',
    shortMobileLabel: 'Explorace',
    icon: Compass,
  },
  {
    id: 'PEMARKAHAN',
    label: 'Pemarkahan',
    shortMobileLabel: 'Pemarkahan',
    icon: ClipboardCheck,
  },
  {
    id: 'AJK',
    label: 'Senarai AJK',
    shortMobileLabel: 'Senarai AJK',
    icon: Users,
  },
  {
    id: 'ANUGERAH_OPR',
    label: 'Anugerah & Pelaporan',
    shortMobileLabel: 'Anugerah',
    icon: Award,
  },
];

function normalizeUnitTerminology(text: string): string {
  if (!text) return '';
  return text
    // 1. Collapse any repeated 'TUNAS ' prefixes before 'KADET REMAJA SEKOLAH'
    .replace(/(?:TUNAS\s+)+KADET REMAJA SEKOLAH/gi, (match) =>
      match === match.toUpperCase()
        ? 'TUNAS KADET REMAJA SEKOLAH'
        : 'Tunas Kadet Remaja Sekolah'
    )
    // 2. Replace standalone 'KADET REMAJA SEKOLAH' only if not already preceded by 'TUNAS'
    .replace(/(?<!TUNAS\s)\bKADET REMAJA SEKOLAH\b/g, 'TUNAS KADET REMAJA SEKOLAH')
    .replace(/(?<!Tunas\s)(?<!TUNAS\s)\bKadet Remaja Sekolah\b/g, 'Tunas Kadet Remaja Sekolah')
    // 3. Collapse any repeated 'PERGERAKAN ' or 'MALAYSIA' in Puteri Islam
    .replace(/(?:PERGERAKAN\s+)*(?:PANDU\s+)?PUTERI ISLAM(?:\s+MALAYSIA)*/gi, (match) =>
      match === match.toUpperCase()
        ? 'PERGERAKAN PUTERI ISLAM MALAYSIA'
        : 'Pergerakan Puteri Islam Malaysia'
    )
    // 4. Collapse any repeated 'T' before 'KRS' and replace standalone 'KRS'
    .replace(/\bT+KRS\b/g, 'TKRS')
    .replace(/\bKRS\b/g, 'TKRS');
}

function normalizeCampState(raw: CampAppState): CampAppState {
  return {
    ...raw,
    uniformUnits: INITIAL_CAMP_STATE.uniformUnits,
    schedule: (raw.schedule || INITIAL_CAMP_STATE.schedule).map((s) => ({
      ...s,
      title: normalizeUnitTerminology(s.title),
      subtitle: normalizeUnitTerminology(s.subtitle),
    })),
    awards: (raw.awards || INITIAL_CAMP_STATE.awards).map((a) => ({
      ...a,
      title: normalizeUnitTerminology(a.title),
      winner: normalizeUnitTerminology(a.winner),
      notes: normalizeUnitTerminology(a.notes),
    })),
    oprData: raw.oprData
      ? {
          ...raw.oprData,
          anjuran: normalizeUnitTerminology(raw.oprData.anjuran),
          photos: (raw.oprData.photos || []).map((p) => ({
            ...p,
            caption: normalizeUnitTerminology(p.caption),
          })),
        }
      : INITIAL_CAMP_STATE.oprData,
  };
}

export default function App() {
  // Show Welcome page first unless already entered in current session
  const [hasEntered, setHasEntered] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_WELCOME_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [currentUser] = useState<UserAccount>(TEACHER_ACCOUNTS[0]);

  // Firebase Auth state
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);

  // Collapsible Sidebar state (can be hidden/toggled via hamburger button)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Main Camp Data State (Offline-first persisted in localStorage)
  const [campState, setCampState] = useState<CampAppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STATE_KEY);
      if (saved) {
        return normalizeCampState({ ...INITIAL_CAMP_STATE, ...JSON.parse(saved) });
      }
    } catch {
      // Fallback to initial state
    }
    return INITIAL_CAMP_STATE;
  });

  const campStateRef = useRef<CampAppState>(campState);
  useEffect(() => {
    campStateRef.current = campState;
  }, [campState]);

  // Offline & Sync Queue State
  const [browserOnline, setBrowserOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [simulateOffline, setSimulateOffline] = useState<boolean>(false);
  const isOnline = browserOnline && !simulateOffline;

  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_QUEUE_KEY);
      return saved ? (JSON.parse(saved) as SyncQueueItem[]) : [];
    } catch {
      return [];
    }
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('Tersimpan & Disegerak');
  const [showSyncDrawer, setShowSyncDrawer] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<MainTab>('EXPLORACE');

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Attach Firestore real-time listeners automatically for all users when online
  useEffect(() => {
    if (!isAuthReady || !isOnline) return;

    const unsubWorkspace = subscribeToCampWorkspace(
      (remotePartial, meta) => {
        setCampState((prev) => {
          const mergedOpr: OPRReportData = remotePartial.oprData
            ? {
                ...prev.oprData,
                ...remotePartial.oprData,
                photos: prev.oprData.photos.map((localPhoto, idx) => {
                  const remotePhoto = remotePartial.oprData?.photos?.[idx];
                  if (!remotePhoto) return localPhoto;
                  return {
                    ...localPhoto,
                    ...remotePhoto,
                    dataUrl: remotePhoto.dataUrl || localPhoto.dataUrl,
                  };
                }),
              }
            : prev.oprData;

          return normalizeCampState({
            ...prev,
            exploraceScores: remotePartial.exploraceScores || prev.exploraceScores,
            ikhtiarScores: remotePartial.ikhtiarScores || prev.ikhtiarScores,
            kawadScores: remotePartial.kawadScores || prev.kawadScores,
            schedule: remotePartial.schedule || prev.schedule,
            stations: remotePartial.stations || prev.stations,
            ajkList: remotePartial.ajkList || prev.ajkList,
            awards: remotePartial.awards || prev.awards,
            oprData: mergedOpr,
          });
        });
        setLastSyncedAt(`Auto-Segerak Firebase (${meta.updatedByName})`);
      },
      () => {
        // Seed initial workspace document in Firestore if it does not exist yet
        pushCampStateToFirestore(
          firebaseUser,
          campStateRef.current,
          'Inisialisasi awal pangkalan data awan SK Lupak 2026'
        ).catch(() => {
          // Handled by structured error logger
        });
      }
    );

    const unsubLogs = subscribeToSyncLogs((remoteLogs) => {
      setSyncQueue((prev) => {
        const unsyncedLocal = prev.filter((item) => !item.synced);
        return [...unsyncedLocal, ...remoteLogs].slice(0, 40);
      });
    });

    return () => {
      unsubWorkspace();
      unsubLogs();
    };
  }, [isAuthReady, firebaseUser, isOnline]);

  // Persist campState to localStorage immediately on any change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(campState));
    } catch {
      // Ignore quota errors
    }
  }, [campState]);

  // Persist syncQueue to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(syncQueue));
    } catch {
      // Ignore quota errors
    }
  }, [syncQueue]);

  // Listen to browser online/offline connectivity events
  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync pending queue items whenever connection recovers (isOnline becomes true)
  const pendingItems = syncQueue.filter((q) => !q.synced);

  useEffect(() => {
    if (isOnline && pendingItems.length > 0 && !isSyncing) {
      setIsSyncing(true);
      const timer = setTimeout(async () => {
        try {
          await pushCampStateToFirestore(
            firebaseUser,
            campStateRef.current,
            pendingItems[0]?.description || 'Penyegerakan semula luar talian'
          );
          setSyncQueue((prev) => prev.map((item) => ({ ...item, synced: true })));
          const nowStr = new Date().toLocaleTimeString('ms-MY', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          setLastSyncedAt(`Disegerak ke Firebase pada ${nowStr}`);
        } finally {
          setIsSyncing(false);
        }
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingItems.length, isSyncing, firebaseUser]);

  // Sign in with Google for Firebase Cloud Sync
  const handleGoogleSignIn = async () => {
    setAuthErrorMsg(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user && isOnline) {
        setIsSyncing(true);
        await pushCampStateToFirestore(
          cred.user,
          campStateRef.current,
          'Sambungan & penyegerakan ke Firebase Cloud'
        );
        setIsSyncing(false);
      }
    } catch (err) {
      setIsSyncing(false);
      setAuthErrorMsg(
        err instanceof Error ? err.message : 'Gagal log masuk Google.'
      );
    }
  };

  const handleGoogleSignOut = async () => {
    setAuthErrorMsg(null);
    await signOut(auth);
    setLastSyncedAt('Auto-Segerak Awan Aktif (Tanpa Akaun Google)');
  };

  const handleManualCloudSync = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    try {
      await pushCampStateToFirestore(
        firebaseUser,
        campStateRef.current,
        'Penyegerakan manual ke pangkalan data Firebase'
      );
      const nowStr = new Date().toLocaleTimeString('ms-MY', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastSyncedAt(`Disegerak ke Firebase (${nowStr})`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Record a mutation in offline-first queue & auto-sync to Firestore immediately when online
  const recordChange = (description: string, nextState: CampAppState) => {
    const actorName =
      firebaseUser?.displayName ||
      firebaseUser?.email ||
      currentUser?.name ||
      'GURU SK LUPAK';
    const newItem: SyncQueueItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('ms-MY', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      description,
      actor: actorName,
      synced: isOnline,
    };
    setSyncQueue((prev) => [newItem, ...prev.slice(0, 39)]);
    if (isOnline) {
      setIsSyncing(true);
      pushCampStateToFirestore(firebaseUser, nextState, description)
        .then(() => {
          setLastSyncedAt(`Auto-Segerak Firebase (${newItem.timestamp})`);
        })
        .finally(() => {
          setIsSyncing(false);
        });
    }
  };

  // Handlers for entering and returning to the Welcome Page
  const handleEnterApp = (initialTab: 'JADUAL' | 'EXPLORACE') => {
    setActiveTab(initialTab);
    setHasEntered(true);
    try {
      sessionStorage.setItem(STORAGE_WELCOME_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const handleReturnWelcome = () => {
    setHasEntered(false);
    try {
      sessionStorage.removeItem(STORAGE_WELCOME_KEY);
    } catch {
      // ignore
    }
  };

  const handleUpdateSchedule = (schedule: ScheduleSlot[], desc: string) => {
    const next: CampAppState = {
      ...campStateRef.current,
      lastUpdated: new Date().toISOString(),
      schedule,
    };
    setCampState(next);
    recordChange(desc, next);
  };

  const handleUpdateExploraceScore = (
    groupId: string,
    stationId: string,
    val: number,
    desc: string
  ) => {
    const prev = campStateRef.current;
    const next: CampAppState = {
      ...prev,
      lastUpdated: new Date().toISOString(),
      exploraceScores: {
        ...prev.exploraceScores,
        [groupId]: {
          ...(prev.exploraceScores[groupId] || {}),
          [stationId]: val,
        },
      },
    };
    setCampState(next);
    recordChange(desc, next);
  };

  const handleUpdateStations = (stations: ExploraceStation[], desc: string) => {
    const next: CampAppState = {
      ...campStateRef.current,
      lastUpdated: new Date().toISOString(),
      stations,
    };
    setCampState(next);
    recordChange(desc, next);
  };

  const handleUpdateIkhtiar = (
    groupId: string,
    updated: IkhtiarHidupScore,
    desc: string
  ) => {
    const prev = campStateRef.current;
    const next: CampAppState = {
      ...prev,
      lastUpdated: new Date().toISOString(),
      ikhtiarScores: {
        ...prev.ikhtiarScores,
        [groupId]: updated,
      },
    };
    setCampState(next);
    recordChange(desc, next);
  };

  const handleUpdateKawad = (
    unitId: string,
    updated: KawadKakiScore,
    desc: string
  ) => {
    const prev = campStateRef.current;
    const next: CampAppState = {
      ...prev,
      lastUpdated: new Date().toISOString(),
      kawadScores: {
        ...prev.kawadScores,
        [unitId]: updated,
      },
    };
    setCampState(next);
    recordChange(desc, next);
  };

  const handleUpdateAJK = (ajkList: AJKMember[], desc: string) => {
    const next: CampAppState = {
      ...campStateRef.current,
      lastUpdated: new Date().toISOString(),
      ajkList,
    };
    setCampState(next);
    recordChange(desc, next);
  };

  const handleUpdateAwards = (awards: AwardItem[], desc: string) => {
    const next: CampAppState = {
      ...campStateRef.current,
      lastUpdated: new Date().toISOString(),
      awards,
    };
    setCampState(next);
    recordChange(desc, next);
  };

  const handleUpdateOPR = (oprData: OPRReportData, desc: string) => {
    const next: CampAppState = {
      ...campStateRef.current,
      lastUpdated: new Date().toISOString(),
      oprData,
    };
    setCampState(next);
    recordChange(desc, next);
  };

  const handleResetAllData = () => {
    setCampState(INITIAL_CAMP_STATE);
    recordChange(
      'Tetapkan semula semua data ke nilai lalai rasmi SK Lupak 2026',
      INITIAL_CAMP_STATE
    );
    setShowSyncDrawer(false);
  };

  // Front Page: Simplified Welcome View
  if (!hasEntered) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="welcome-screen"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <WelcomeLoginView onEnterApp={handleEnterApp} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen camp-gradient-bg text-slate-100 flex flex-col pb-20 lg:pb-10 overflow-x-hidden">
      {/* Top Header: Desktop Hamburger Toggle, App Logo, Full Non-Truncated Title & Compact Utility Icon Buttons */}
      <header className="sticky top-0 z-30 bg-[#0b2246]/90 backdrop-blur-2xl border-b border-white/15">
        <div className="max-w-7xl mx-auto px-3 sm:px-8 min-h-[56px] sm:h-16 py-1.5 sm:py-0 flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Hamburger Menu Button (Desktop Only) + App Logo + Full 'Perkhemahan Kokurikulum SK Lupak 2026' */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((v) => !v)}
              className="hidden lg:flex w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 text-amber-400 items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
              title={isSidebarOpen ? 'Sembunyikan Menu Utama' : 'Buka Menu Utama'}
              aria-label="Togol Menu Utama"
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('JADUAL')}
              className="flex items-center gap-2 sm:gap-2.5 min-w-0 text-left group cursor-pointer"
            >
              <img
                src="/assets/aistudio/LOGO_SK_3D__1__62639ca8.png"
                alt="Logo Aplikasi Perkhemahan Kokurikulum SK Lupak 2026"
                referrerPolicy="no-referrer"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-md shrink-0 group-hover:scale-105 transition-transform duration-200"
              />
              <span className="font-display font-extrabold text-[12px] sm:text-base lg:text-lg leading-tight tracking-tight text-amber-400">
                Perkhemahan Kokurikulum SK Lupak 2026
              </span>
            </button>
          </div>

          {/* Right: Compact Icon-Only Utility Buttons (PWA Mobile App, Online/Offline, Sync Log, Welcome Page) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <PWAInstallButton />

            <button
              type="button"
              onClick={() => setSimulateOffline((v) => !v)}
              className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer ${
                isOnline
                  ? 'bg-[#277971]/50 border-emerald-300/35 text-emerald-300 hover:bg-[#277971]/70'
                  : 'bg-amber-500/25 border-amber-400/50 text-amber-300 hover:bg-amber-500/35'
              }`}
              title={
                isOnline
                  ? 'Status: Dalam Talian (Disegerak) — Klik untuk uji Mod Luar Talian'
                  : `Status: Mod Luar Talian (${pendingItems.length} Menunggu)`
              }
              aria-label="Status Sambungan Talian"
            >
              {isOnline ? (
                <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <CloudOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
              {!isOnline && pendingItems.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-0.5 rounded-full bg-amber-400 text-slate-950 font-mono font-bold text-[9px] flex items-center justify-center">
                  {pendingItems.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowSyncDrawer(true)}
              className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#3b669c]/45 hover:bg-[#3b669c]/65 border border-sky-300/30 text-sky-200 flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
              title={`Log Penyegerakan Data (${syncQueue.length} rekod)`}
              aria-label="Log Penyegerakan Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleReturnWelcome}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-r from-[#1992f4] to-[#2157e2] hover:brightness-110 border border-sky-300/35 text-white flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
              title="Kembali ke Halaman Utama (Welcome Page)"
              aria-label="Kembali ke Halaman Utama"
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Collapsible Sidebar Navigation Drawer (Desktop Only — Mobile uses Bottom Navigation) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden lg:block fixed inset-0 z-40 bg-black/55 backdrop-blur-xs"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`hidden lg:flex fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#0b2246]/95 backdrop-blur-2xl border-r border-white/15 shadow-2xl flex-col justify-between transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Header: 'Menu Utama' */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-white/15">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/aistudio/LOGO_SK_3D__1__62639ca8.png"
                alt="Logo SK Lupak"
                referrerPolicy="no-referrer"
                className="w-9 h-9 object-contain drop-shadow-md"
              />
              <span className="font-display font-extrabold text-sm tracking-wide text-amber-400">
                Menu Utama
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Tutup Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 5 Menu Items with Icons & Soft Hover/Active Transitions */}
          <nav className="p-4 space-y-2">
            {MENU_ITEMS.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full min-h-[48px] px-4 py-3 rounded-2xl font-display font-bold text-sm flex items-center gap-3.5 transition-all duration-200 cursor-pointer text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] text-slate-950 shadow-lg scale-[1.01]'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <IconComp
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                      isActive ? 'text-slate-950 scale-110' : 'text-amber-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Quick Return to Welcome Page */}
        <div className="p-4 border-t border-white/15">
          <button
            type="button"
            onClick={() => {
              setIsSidebarOpen(false);
              handleReturnWelcome();
            }}
            className="w-full min-h-[46px] px-4 py-2.5 rounded-2xl bg-[#112233]/90 hover:bg-white/10 border border-white/15 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4 text-sky-400" />
            <span>Halaman Utama (Welcome Page)</span>
          </button>
        </div>
      </aside>

      {/* Offline Banner Notice when Offline */}
      {!isOnline && (
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-8 pt-3 sm:pt-4">
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] sm:text-xs text-amber-100">
            <div className="flex items-start sm:items-center gap-2">
              <CloudOff className="w-4 h-4 text-amber-300 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>Mod Luar Talian Aktif:</strong> Semua kemasukan markah dan suntingan stesen disimpan secara tempatan pada peranti ini ({pendingItems.length} perubahan dalam giliran). Data akan disegerakkan secara automatik sebaik sahaja sambungan pulih.
              </span>
            </div>
            {simulateOffline && (
              <button
                type="button"
                onClick={() => setSimulateOffline(false)}
                className="min-h-[34px] px-3 py-1 rounded-lg bg-gradient-to-r from-[#f5c427] to-[#ea6c15] text-slate-950 font-bold text-[11px] sm:text-xs cursor-pointer self-start sm:self-auto"
              >
                Pulihkan Talian &amp; Segerak Sekarang
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Viewport with Soft Smooth Tab Transition */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-8 py-4 sm:py-6 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'JADUAL' && (
              <ScheduleSection
                schedule={campState.schedule}
                onUpdateSchedule={handleUpdateSchedule}
              />
            )}

            {activeTab === 'EXPLORACE' && (
              <ExploraceSection
                stations={campState.stations}
                groups={campState.groups}
                scores={campState.exploraceScores}
                onUpdateScore={handleUpdateExploraceScore}
                onUpdateStations={handleUpdateStations}
              />
            )}

            {activeTab === 'PEMARKAHAN' && (
              <ScoringFormsSection
                groups={campState.groups}
                uniformUnits={campState.uniformUnits}
                stations={campState.stations}
                exploraceScores={campState.exploraceScores}
                ikhtiarScores={campState.ikhtiarScores}
                kawadScores={campState.kawadScores}
                onUpdateIkhtiar={handleUpdateIkhtiar}
                onUpdateKawad={handleUpdateKawad}
              />
            )}

            {activeTab === 'AJK' && (
              <AJKSection
                ajkList={campState.ajkList}
                onUpdateAJK={handleUpdateAJK}
              />
            )}

            {activeTab === 'ANUGERAH_OPR' && (
              <AwardsAndOPRSection
                state={campState}
                onUpdateAwards={handleUpdateAwards}
                onUpdateOPR={handleUpdateOPR}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation Bar with Soft Animated Active Pill */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0b2246]/92 backdrop-blur-2xl border-t border-white/15 shadow-[0_-10px_30px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-5 items-center h-16 px-1.5">
          {MENU_ITEMS.map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className="relative min-h-[50px] flex flex-col items-center justify-center cursor-pointer group"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileBottomNavIndicator"
                    className="absolute inset-x-1.5 inset-y-1 rounded-2xl bg-gradient-to-b from-amber-400/20 to-amber-500/5 border border-amber-400/35"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <IconComp
                  className={`relative z-10 w-5 h-5 transition-all duration-200 ${
                    isActive
                      ? 'text-amber-400 -translate-y-0.5 scale-110'
                      : 'text-slate-300 group-hover:text-white'
                  }`}
                />
                <span
                  className={`relative z-10 text-[10px] tracking-tight mt-1 transition-colors duration-200 truncate max-w-full px-1 ${
                    isActive
                      ? 'font-bold text-amber-300'
                      : 'font-medium text-slate-300 group-hover:text-white'
                  }`}
                >
                  {item.shortMobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modal: Offline Sync Queue & Activity Log */}
      <AnimatePresence>
        {showSyncDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg rounded-3xl glass-panel-elevated p-6 border border-white/20 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    Status Penyegerakan Data &amp; Mod Luar Talian
                  </h3>
                  <p className="text-xs text-amber-400 mt-0.5">{lastSyncedAt}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSyncDrawer(false)}
                  className="min-h-[36px] min-w-[36px] rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {/* Firebase Cloud Sync Panel */}
                <div className="p-3.5 rounded-2xl bg-[#112233]/90 border border-emerald-400/25 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">
                          Auto-Segerak Awan Firebase (Multi-Pengguna)
                        </p>
                        <p className="text-[11px] text-slate-300">
                          {firebaseUser
                            ? `Aktif (${firebaseUser.displayName || firebaseUser.email}) — Semua perubahan disegerakkan secara langsung ke semua peranti guru.`
                            : 'Aktif secara automatik untuk semua guru & peranti. Setiap markah yang dimasukkan terus dikemas kini pada skrin pengguna lain secara masa nyata.'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                        isOnline
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      }`}
                    >
                      {isOnline ? 'Auto-Segerak' : 'Luar Talian'}
                    </span>
                  </div>

                  {authErrorMsg && (
                    <p className="text-[11px] text-rose-300 bg-rose-500/10 border border-rose-400/20 rounded-lg px-2.5 py-1.5">
                      {authErrorMsg}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleManualCloudSync}
                      disabled={isSyncing || !isOnline}
                      className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/35 text-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>Segerak ke Firebase Sekarang</span>
                    </button>

                    {!firebaseUser ? (
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={!isAuthReady}
                        className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1992f4] to-[#2157e2] hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Log Masuk Google (Pilihan)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGoogleSignOut}
                        className="min-h-[36px] px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Keluar Google</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#112233]/90 border border-white/10 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-white">
                      Simulasi Mod Luar Talian (Uji Tanpa Internet)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Aktifkan untuk melihat bagaimana perubahan disimpan dalam giliran luar talian.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSimulateOffline((v) => !v)}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer shrink-0 ${
                      simulateOffline
                        ? 'bg-gradient-to-r from-[#f5c427] to-[#ea6c15] text-slate-950'
                        : 'bg-white/10 text-slate-200 hover:bg-white/15'
                    }`}
                  >
                    {simulateOffline ? 'Offline Aktif (Matikan)' : 'Uji Mod Offline'}
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {syncQueue.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">
                      Semua data markah, stesen dan OPR berada dalam keadaan terkini.
                    </p>
                  ) : (
                    syncQueue.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-[#112233]/80 border border-white/10 flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-white">{item.description}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Oleh: {item.actor} · <span className="font-mono">{item.timestamp}</span>
                          </p>
                        </div>
                        <span
                          className={`font-semibold text-[11px] shrink-0 flex items-center gap-1 ${
                            item.synced ? 'text-emerald-300' : 'text-amber-300'
                          }`}
                        >
                          {item.synced ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Disegerak
                            </>
                          ) : (
                            <>
                              <CloudOff className="w-3.5 h-3.5" />
                              Menunggu
                            </>
                          )}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleResetAllData}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 text-xs font-semibold text-rose-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Data Asal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSyncDrawer(false)}
                    className="min-h-[40px] px-5 py-2 rounded-xl bg-gradient-to-r from-[#f5c427] via-[#f59e0b] to-[#ea6c15] text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getLiveSessions,
  unlockStudentSession,
  subscribeRealtime,
  broadcastEvent,
  initStorage,
  updateSessionState,
  getActiveSessionConfig,
  toggleBatchActive,
  setBatchModule,
  setBothBatchesStatus,
  applyMeetingSchedule
} from '../../services/realtimeService';
import { MEETING_SCHEDULE, PHYSICS_MODULES, OFFICIAL_PRAKTIKAN_ROSTER } from '../../services/mockData';
import SideNavBar from '../../components/asisten/SideNavBar';

export default function LiveMonitoringAsisten() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Initialize storage
  useEffect(() => {
    initStorage();
  }, []);

  // Assistant Info
  const assistantName = currentUser?.name || 'Ahmad Rozali, S.Si';
  const assistantInitials = assistantName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  // Sessions State
  const [sessions, setSessions] = useState(() => getLiveSessions());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState('all'); // 'all', 'active', 'locked', 'completed'
  const [groupFilter, setGroupFilter] = useState('Semua Kelompok');
  const [toastMessage, setToastMessage] = useState(null);

  // Modals State
  const [selectedStudentForPasskey, setSelectedStudentForPasskey] = useState(null);
  const [passkeyPolicy, setPasskeyPolicy] = useState('no_penalty'); // 'no_penalty' | 'penalty_reset'
  const [generatedPasskey, setGeneratedPasskey] = useState('FK-8924-LAB');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastInput, setBroadcastInput] = useState('');
  const [isQuizPaused, setIsQuizPaused] = useState(false);
  const [showMasterPasskeyModal, setShowMasterPasskeyModal] = useState(false);
  const [masterPasskey, setMasterPasskey] = useState('LAB-IPB-9921');
  const [inspectStudent, setInspectStudent] = useState(null);

  // Active Modules & Group Partitioning (C1-C8 vs C9-C16) State
  const [activeConfig, setActiveConfig] = useState(() => getActiveSessionConfig());
  const [showModuleSelectModal, setShowModuleSelectModal] = useState(false);
  const [targetBatchForChange, setTargetBatchForChange] = useState('batch1');

  // Subscribe to real-time events across windows & devices
  useEffect(() => {
    const unsubscribe = subscribeRealtime((event) => {
      if (
        event.type === 'SESSION_UPDATED' ||
        event.type === 'UNLOCK_STUDENT' ||
        event.type === 'SUBMISSION_ADDED'
      ) {
        setSessions(getLiveSessions());
      }
      if (event.type === 'ACTIVE_CONFIG_UPDATED') {
        setActiveConfig(getActiveSessionConfig());
      }
    });

    // 1.5s live polling heartbeat to guarantee instant sync
    const pollInterval = setInterval(() => {
      setSessions(getLiveSessions());
      setActiveConfig(getActiveSessionConfig());
    }, 1500);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleBatch = (batchId) => {
    const updated = toggleBatchActive(batchId);
    setActiveConfig({ ...updated });
    const isNowActive = updated[batchId]?.isActive;
    const label = batchId === 'batch1' ? 'Kelompok C1 - C8' : 'Kelompok C9 - C16';
    showToast(`Status kuis ${label}: ${isNowActive ? 'AKTIF (Praktikan dapat memulai)' : 'DITUTUP (Menunggu asisten)'}`);
  };

  const handleChangeMeeting = (meetingNum) => {
    const updated = applyMeetingSchedule(meetingNum);
    setActiveConfig({ ...updated });
    showToast(`Jadwal resmi Pertemuan ${meetingNum} berhasil diterapkan untuk C1-C8 & C9-C16!`);
  };

  const handleToggleAll = (status) => {
    const updated = setBothBatchesStatus(status);
    setActiveConfig({ ...updated });
    showToast(`Seluruh kuis laboratorium (C1-C16) berhasil ${status ? 'DIAKTIFKAN' : 'DINONAKTIFKAN'}!`);
  };

  const handleSelectModuleForBatch = (batchId, mod) => {
    const updated = setBatchModule(batchId, mod, true);
    setActiveConfig({ ...updated });
    setShowModuleSelectModal(false);
    const label = batchId === 'batch1' ? 'Kelompok C1 - C8' : 'Kelompok C9 - C16';
    showToast(`Modul ${mod.setCode || mod.code} (${mod.title}) aktif untuk ${label}!`);
  };

  // Ensure default workstation cards exist if empty
  const workstationStudents = useMemo(() => {
    const baseList = OFFICIAL_PRAKTIKAN_ROSTER.map((student) => ({
      id: `session-${student.nim}`,
      desk: `Kelompok C${student.groupNumber}`,
      groupNumber: student.groupNumber,
      name: student.name,
      nim: student.nim,
      status: 'idle',
      progressText: '0 / 15 Soal (0%)',
      progressPercent: 0,
      currentQuestion: 'Belum Mulai',
      score: null
    }));


    // Merge live sessions from storage / Supabase if they exist
    return baseList.map((item) => {
      const matching = sessions.filter(
        (s) =>
          s.nim === item.nim ||
          s.id === `session-${item.nim}` ||
          s.id === item.nim ||
          (s.id && s.id.startsWith(item.nim))
      );
      const live = matching.length > 0
        ? matching.reduce((latest, curr) => (curr.updatedAt || 0) >= (latest.updatedAt || 0) ? curr : latest)
        : null;
      if (live) {
        const isAct = live.status === 'in_progress';
        const isLck = live.status === 'locked';
        const isCmp = live.status === 'completed' || live.status === 'report_submitted';
        const answered = live.answeredCount || 0;
        const totalQ = live.totalQuestions || 15;
        const pct = isCmp ? 100 : (totalQ > 0 ? Math.round((answered / totalQ) * 100) : 0);

        let status = 'idle';
        if (isAct) status = 'active';
        else if (isLck) status = 'locked';
        else if (isCmp) status = 'completed';

        return {
          ...item,
          status,
          progressText: isCmp ? `${totalQ} / ${totalQ} Selesai (100%)` : `${answered} / ${totalQ} Soal (${pct}%)`,
          progressPercent: pct,
          currentQuestion: isCmp ? 'Selesai' : (live.currentQuestion ? `Soal No. ${live.currentQuestion}` : (isAct ? 'Mulai Kuis' : 'Belum Mulai')),
          lockReason: live.lockReason || null,
          lockDetail: live.lockDetail || (live.lockReason ? 'Ujian dihentikan otomatis oleh protokol pengawas integritas.' : null),
          passkey: live.passkey || null,
          score: live.score !== undefined ? live.score : null
        };
      }
      return item;
    });
  }, [sessions]);

  // Overall Counts
  const totalCount = workstationStudents.length;
  const activeCount = workstationStudents.filter((s) => s.status === 'active').length;
  const lockedCount = workstationStudents.filter((s) => s.status === 'locked').length;
  const completedCount = workstationStudents.filter((s) => s.status === 'completed').length;
  const idleCount = workstationStudents.filter((s) => s.status === 'idle').length;

  // Breakdown for Batch C1-C8 (Lab 1) vs Batch C9-C16 (Lab 2)
  const totalC1_C8 = workstationStudents.filter((s) => s.groupNumber <= 8).length; // 20 praktikan
  const totalC9_C16 = workstationStudents.filter((s) => s.groupNumber > 8).length; // 19 praktikan

  const activeC1_C8 = workstationStudents.filter((s) => s.groupNumber <= 8 && s.status === 'active').length;
  const activeC9_C16 = workstationStudents.filter((s) => s.groupNumber > 8 && s.status === 'active').length;

  const completedC1_C8 = workstationStudents.filter((s) => s.groupNumber <= 8 && s.status === 'completed').length;
  const completedC9_C16 = workstationStudents.filter((s) => s.groupNumber > 8 && s.status === 'completed').length;

  const lockedC1_C8 = workstationStudents.filter((s) => s.groupNumber <= 8 && s.status === 'locked').length;
  const lockedC9_C16 = workstationStudents.filter((s) => s.groupNumber > 8 && s.status === 'locked').length;

  // Average Scores
  const scoresC1_C8 = workstationStudents
    .filter((s) => s.groupNumber <= 8 && s.score !== null && s.score !== undefined)
    .map((s) => s.score);
  const avgScoreC1_C8 =
    scoresC1_C8.length > 0 ? (scoresC1_C8.reduce((a, b) => a + b, 0) / scoresC1_C8.length).toFixed(1) : '-';

  const scoresC9_C16 = workstationStudents
    .filter((s) => s.groupNumber > 8 && s.score !== null && s.score !== undefined)
    .map((s) => s.score);
  const avgScoreC9_C16 =
    scoresC9_C16.length > 0 ? (scoresC9_C16.reduce((a, b) => a + b, 0) / scoresC9_C16.length).toFixed(1) : '-';

  // Filtered
  const filteredStudents = useMemo(() => {
    return workstationStudents.filter((s) => {
      // Tab filter
      if (statusTab === 'active' && s.status !== 'active') return false;
      if (statusTab === 'locked' && s.status !== 'locked') return false;
      if (statusTab === 'completed' && s.status !== 'completed') return false;

      // Group filter (Supports Batch C1-C8, Batch C9-C16, and individual groups)
      if (groupFilter !== 'Semua Kelompok' && groupFilter !== 'Semua Kelompok (C1 – C16)') {
        if (groupFilter === 'Batch C1 – C8' || groupFilter === 'Batch C1 - C8') {
          if (s.groupNumber > 8) return false;
        } else if (groupFilter === 'Batch C9 – C16' || groupFilter === 'Batch C9 - C16') {
          if (s.groupNumber <= 8) return false;
        } else {
          const num = parseInt(groupFilter.replace(/\D/g, ''));
          if (s.groupNumber !== num) return false;
        }
      }

      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchNim = s.nim.toLowerCase().includes(q);
        const matchDesk = s.desk.toLowerCase().includes(q);
        if (!matchName && !matchNim && !matchDesk) return false;
      }

      return true;
    });
  }, [workstationStudents, statusTab, groupFilter, searchQuery]);

  // Handlers
  const handleOpenPasskeyModal = (student) => {
    setSelectedStudentForPasskey(student);
    setGeneratedPasskey(student.passkey || `FK-${Math.floor(1000 + Math.random() * 9000)}-LAB`);
    setPasskeyPolicy('no_penalty');
  };

  const handleRegenerateKey = () => {
    const newKey = `FK-${Math.floor(1000 + Math.random() * 9000)}-LAB`;
    setGeneratedPasskey(newKey);
    showToast(`Passkey baru digenerate: ${newKey}`);
  };

  const handleUnlockStudent = () => {
    if (!selectedStudentForPasskey) return;
    const student = selectedStudentForPasskey;

    unlockStudentSession(student.id);
    updateSessionState(student.id, {
      status: 'in_progress',
      isLocked: false,
      lockReason: null,
      passkey: generatedPasskey
    });

    setSessions(getLiveSessions());
    setSelectedStudentForPasskey(null);
    showToast(`Sesi ${student.name} (${student.desk}) berhasil dibuka kembali!`);
  };

  const handleDisqualify = () => {
    if (!selectedStudentForPasskey) return;
    const student = selectedStudentForPasskey;
    if (window.confirm(`Diskualifikasi mahasiswa ${student.name} (${student.desk}) karena pelanggaran berat?`)) {
      updateSessionState(student.id, {
        status: 'failed',
        score: 0
      });
      setSessions(getLiveSessions());
      setSelectedStudentForPasskey(null);
      showToast(`Mahasiswa ${student.name} telah didiskualifikasi.`);
    }
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastInput.trim()) return;
    broadcastEvent('ANNOUNCEMENT', { message: broadcastInput });
    showToast(`Pengumuman berhasil disiarkan ke seluruh layar praktikan!`);
    setShowBroadcastModal(false);
    setBroadcastInput('');
  };

  const handleTogglePause = () => {
    const nextState = !isQuizPaused;
    setIsQuizPaused(nextState);
    broadcastEvent('QUIZ_PAUSE_TOGGLE', { isPaused: nextState });
    showToast(nextState ? 'Kuis laboratorium dijeda sementara.' : 'Kuis laboratorium dilanjutkan.');
  };

  return (
    <div className="bg-background text-on-surface antialiased flex h-screen overflow-hidden selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-primary text-surface-container-lowest px-4 py-3 rounded-xl shadow-lg border border-outline-variant flex items-center gap-3 animate-fadeIn">
          <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">check_circle</span>
          <span className="font-label-md text-label-md font-medium">{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          SHARED COMPONENT: SideNavBar
         ========================================================================= */}
      <SideNavBar activeTab="beranda" onShowToast={showToast} />

      {/* =========================================================================
          MAIN WORKSPACE
         ========================================================================= */}
      <div className="flex-1 flex flex-col pl-64 h-screen overflow-hidden">
        {/* TopNavBar */}
        <header className="sticky top-0 w-full z-20 bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center h-16 px-space-lg shrink-0">
          <div className="flex items-center gap-6">
            <span className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">
              Fisika Dasar IPB
            </span>
            {/* Search bar */}
            <div className="relative w-72">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-body-md pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari praktikan, NIM, kelompok..."
                className="w-full h-9 pl-9 pr-3 text-body-sm font-body-sm bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:ring-0 focus:outline-none transition-colors"
              />
            </div>
            {/* Operational Status Badges */}
            <div className="hidden xl:flex items-center gap-3 border-l border-outline-variant pl-4">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low border border-outline-variant text-body-sm text-on-surface">
                <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse"></span>
                <span className="font-label-sm text-label-sm font-medium">Status Server: Operasional</span>
              </div>
              <span className="font-code-sm text-code-sm text-on-surface-variant">Sesi Ganjil 2024/2025</span>
            </div>
          </div>

          {/* Trailing Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => showToast('Kalibrasi sensor & alat ukur terverifikasi.')}
              className="h-9 px-3 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '18px' }}>
                tune
              </span>
              <span>Kalibrasi Alat</span>
            </button>
            <button
              type="button"
              onClick={() => showToast('Mengunduh log proctoring kuis live (.log)...')}
              className="h-9 px-3 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '18px' }}>
                download
              </span>
              <span>Unduh Log</span>
            </button>
            <div className="h-5 w-px bg-outline-variant mx-1"></div>
            <button
              type="button"
              onClick={() => showToast(`${lockedCount} praktikan membutuhkan passkey!`)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors relative cursor-pointer"
            >
              <span className="material-symbols-outlined">notifications</span>
              {lockedCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-ping"></span>}
            </button>
            <button
              type="button"
              onClick={() => showToast('Pusat Bantuan Proctoring Lab')}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">help_outline</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE CANVAS CONTENT (SCROLLABLE) */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Sesi Aktif Header Banner */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg shadow-sm">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-outline-variant">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-code-sm text-code-sm px-2 py-0.5 bg-primary-container text-on-primary rounded font-semibold uppercase">
                    Modul Lab Aktif
                  </span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">
                    ISO/IEC 17025 Verified Protocol
                  </span>
                </div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">
                  Monitoring Kuis Pra-Praktikum Live
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  Pantauan real-time integritas akademik &amp; progres pengerjaan kuis laboratorium
                </p>
              </div>

              {/* Header Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(true)}
                  className="h-10 px-4 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md rounded-lg flex items-center gap-2 active:scale-[0.99] transition-transform cursor-pointer"
                >
                  <span className="material-symbols-outlined text-outline" style={{ fontSize: '18px' }}>
                    campaign
                  </span>
                  <span>Broadcast Pesan ke Praktikan</span>
                </button>
                <button
                  type="button"
                  onClick={handleTogglePause}
                  className={`h-10 px-4 border rounded-lg font-label-md text-label-md flex items-center gap-2 active:scale-[0.99] transition-transform cursor-pointer ${
                    isQuizPaused
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-surface-container-lowest border-outline-variant hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-outline" style={{ fontSize: '18px' }}>
                    {isQuizPaused ? 'play_circle' : 'pause_circle'}
                  </span>
                  <span>{isQuizPaused ? 'Lanjutkan Kuis Lab' : 'Jeda Kuis Lab'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMasterPasskeyModal(true)}
                  className="h-10 px-4 bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md rounded-lg flex items-center gap-2 active:scale-[0.99] transition-transform shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-inverse-primary" style={{ fontSize: '18px' }}>
                    key
                  </span>
                  <span>Generate Master Passkey</span>
                </button>
              </div>
            </div>

            {/* Meta Strip & Metrics Grid: 4 Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {/* Stat 1: Peserta Mengerjakan (C1-C8 & C9-C16) */}
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/60 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold tracking-wider">
                    Peserta Mengerjakan
                  </span>
                  <span className="font-code-sm text-[11px] px-1.5 py-0.5 rounded bg-primary-container text-on-primary font-bold">
                    {activeCount} / {totalCount}
                  </span>
                </div>
                {/* 2 Kotak Kecil */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="p-2 bg-surface-container-lowest rounded-md border border-outline-variant/60 flex flex-col">
                    <span className="font-code-sm text-[11px] font-bold text-primary truncate">
                      C1 – C8
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="font-headline-sm text-xl font-bold text-primary">
                        {activeC1_C8}
                      </span>
                      <span className="font-code-sm text-xs text-on-surface-variant">
                        / {totalC1_C8}
                      </span>
                    </div>
                    <span className="font-code-sm text-[10px] text-on-surface-variant mt-0.5 truncate">
                      {activeConfig.batch1?.setCode || 'Set 1'}
                    </span>
                  </div>
                  <div className="p-2 bg-surface-container-lowest rounded-md border border-outline-variant/60 flex flex-col">
                    <span className="font-code-sm text-[11px] font-bold text-primary truncate">
                      C9 – C16
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="font-headline-sm text-xl font-bold text-primary">
                        {activeC9_C16}
                      </span>
                      <span className="font-code-sm text-xs text-on-surface-variant">
                        / {totalC9_C16}
                      </span>
                    </div>
                    <span className="font-code-sm text-[10px] text-on-surface-variant mt-0.5 truncate">
                      {activeConfig.batch2?.setCode || 'Set 2'}
                    </span>
                  </div>
                </div>
                <p className="font-code-sm text-[11px] text-on-surface-variant mt-2 pt-1 border-t border-outline-variant/50 truncate">
                  Jumlah praktikan aktif di live kuis
                </p>
              </div>

              {/* Stat 2: Sisa Waktu Kuis */}
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/60 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold tracking-wider">
                    Sisa Waktu Kuis
                  </span>
                  <span className="font-code-sm text-code-sm text-error font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
                    {isQuizPaused ? 'Dijeda' : 'Berjalan'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-code-md text-2xl font-bold text-primary tracking-tight">14:22</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">/ 30:00 WIB</span>
                </div>
                <p className="font-code-sm text-code-sm text-on-surface-variant mt-0.5">
                  Sesi Sore ST12.2 (15:30 - 17:30 WIB)
                </p>
              </div>

              {/* Stat 3: Praktikan Selesai (C1-C8 & C9-C16) */}
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/60 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold tracking-wider">
                    Kuis Selesai
                  </span>
                  <span className="font-code-sm text-[11px] px-1.5 py-0.5 rounded bg-on-tertiary-container/10 text-on-tertiary-container font-bold">
                    {completedCount} / {totalCount}
                  </span>
                </div>
                {/* 2 Kotak Kecil */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="p-2 bg-surface-container-lowest rounded-md border border-outline-variant/60 flex flex-col">
                    <span className="font-code-sm text-[11px] font-bold text-on-tertiary-container truncate">
                      C1 – C8
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="font-headline-sm text-xl font-bold text-on-tertiary-container">
                        {completedC1_C8}
                      </span>
                      <span className="font-code-sm text-xs text-on-surface-variant">
                        / {totalC1_C8}
                      </span>
                    </div>
                    <span className="font-code-sm text-[10px] text-on-surface-variant mt-0.5 truncate">
                      {lockedC1_C8 > 0 ? `${lockedC1_C8} Terkunci` : '0 Terkunci'}
                    </span>
                  </div>
                  <div className="p-2 bg-surface-container-lowest rounded-md border border-outline-variant/60 flex flex-col">
                    <span className="font-code-sm text-[11px] font-bold text-on-tertiary-container truncate">
                      C9 – C16
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="font-headline-sm text-xl font-bold text-on-tertiary-container">
                        {completedC9_C16}
                      </span>
                      <span className="font-code-sm text-xs text-on-surface-variant">
                        / {totalC9_C16}
                      </span>
                    </div>
                    <span className="font-code-sm text-[10px] text-on-surface-variant mt-0.5 truncate">
                      {lockedC9_C16 > 0 ? `${lockedC9_C16} Terkunci` : '0 Terkunci'}
                    </span>
                  </div>
                </div>
                <p className="font-code-sm text-[11px] text-on-surface-variant mt-2 pt-1 border-t border-outline-variant/50 truncate">
                  {lockedCount > 0 ? `${lockedCount} praktikan membutuhkan passkey` : 'Semua sesi aman terkendali'}
                </p>
              </div>

              {/* Stat 4: Rata-Rata Skor Sementara (C1-C8 & C9-C16) */}
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/60 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-label-sm text-label-sm uppercase text-on-surface-variant font-semibold tracking-wider">
                    Rata-Rata Skor
                  </span>
                  <span className="font-code-sm text-[11px] text-primary font-bold">
                    Target: 70.0
                  </span>
                </div>
                {/* 2 Kotak Kecil */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="p-2 bg-surface-container-lowest rounded-md border border-outline-variant/60 flex flex-col">
                    <span className="font-code-sm text-[11px] font-bold text-primary truncate">
                      C1 – C8
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="font-headline-sm text-xl font-bold text-primary">
                        {avgScoreC1_C8}
                      </span>
                      <span className="font-code-sm text-xs text-on-surface-variant">
                        / 100
                      </span>
                    </div>
                    <span className="font-code-sm text-[10px] text-on-surface-variant mt-0.5 truncate">
                      Ambang: 70.0
                    </span>
                  </div>
                  <div className="p-2 bg-surface-container-lowest rounded-md border border-outline-variant/60 flex flex-col">
                    <span className="font-code-sm text-[11px] font-bold text-primary truncate">
                      C9 – C16
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="font-headline-sm text-xl font-bold text-primary">
                        {avgScoreC9_C16}
                      </span>
                      <span className="font-code-sm text-xs text-on-surface-variant">
                        / 100
                      </span>
                    </div>
                    <span className="font-code-sm text-[10px] text-on-surface-variant mt-0.5 truncate">
                      Ambang: 70.0
                    </span>
                  </div>
                </div>
                <p className="font-code-sm text-[11px] text-on-surface-variant mt-2 pt-1 border-t border-outline-variant/50 truncate">
                  Evaluasi pemahaman konsep praktikum
                </p>
              </div>
            </div>

            {/* PANEL KONTROL AKTIVASI MODUL KELOMPOK C1-C8 & C9-C16 */}
            <div className="mt-6 pt-5 border-t border-outline-variant/60">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">hub</span>
                    <h3 className="font-headline-md text-headline-md font-bold text-primary">
                      Status Modul &amp; Aktivasi Kuis Praktikan
                    </h3>
                    <span className="px-2 py-0.5 rounded text-code-sm font-code-sm bg-secondary-fixed text-on-secondary-fixed font-semibold">
                      Rotasi 8 Kelompok
                    </span>
                  </div>
                </div>

                {/* Toolbar: Pilih Jadwal & Bulk Action */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-surface-container-low border border-outline-variant rounded-lg px-2.5 py-1">
                    <span className="material-symbols-outlined text-outline text-[16px]">calendar_month</span>
                    <span className="text-xs font-medium text-on-surface-variant">Jadwal:</span>
                    <select
                      value={activeConfig.meetingNumber || 5}
                      onChange={(e) => handleChangeMeeting(parseInt(e.target.value))}
                      className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
                    >
                      {MEETING_SCHEDULE.map((m) => (
                        <option key={m.meeting} value={m.meeting}>
                          Pertemuan {m.meeting} {m.meeting === 5 ? '(Hari Ini)' : ''}: {m.c1_c8.set} vs {m.c9_c16.set}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleAll(true)}
                    className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Aktifkan Semua Kuis</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleAll(false)}
                    className="h-8 px-3 bg-surface-container border border-outline-variant hover:bg-surface-container-high text-on-surface-variant rounded-lg text-xs font-semibold flex items-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">pause</span>
                    <span>Tutup Semua Kuis</span>
                  </button>
                </div>
              </div>

              {/* Two Column Grid for the Two 8-Group Batches */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* BATCH 1: Kelompok C1 - C8 */}
                <div
                  className={`rounded-xl p-4 border transition-all flex flex-col justify-between gap-3 shadow-sm ${
                    activeConfig.batch1?.isActive
                      ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200'
                      : 'bg-surface-container-low/60 border-outline-variant'
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-code-md text-code-md font-bold px-2.5 py-0.5 rounded bg-primary text-on-primary">
                          Kelompok C1 – C8
                        </span>
                        <span className="font-label-sm text-xs text-on-surface-variant font-medium">
                          (8 Kelompok Praktikum)
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-code-sm font-code-sm font-semibold border ${
                          activeConfig.batch1?.isActive
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            activeConfig.batch1?.isActive ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
                          }`}
                        ></span>
                        <span>
                          {activeConfig.batch1?.isActive ? 'STATUS: AKTIF (Bisa Dikerjakan)' : 'STATUS: DITUTUP / MENUNGGU'}
                        </span>
                      </span>
                    </div>

                    <div className="mt-1">
                      <div className="flex items-center gap-2">
                        <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-surface-container-high text-primary font-bold">
                          {activeConfig.batch1?.setCode} ({activeConfig.batch1?.expCode})
                        </span>
                        <span className="font-code-sm text-xs text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">meeting_room</span>
                          {activeConfig.batch1?.labRoom || 'Lab Fisika Dasar 1'}
                        </span>
                      </div>
                      <h4 className="font-headline-sm text-[16px] font-bold text-primary mt-1">
                        {activeConfig.batch1?.title}
                      </h4>
                      <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2 mt-0.5">
                        {activeConfig.batch1?.description || 'Modul praktikum terjadwal untuk batch 1.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-outline-variant/60 flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-code-sm text-[11px] text-on-surface-variant">
                      Terakhir diubah: <strong>{activeConfig.batch1?.activatedAt || 'Hari Ini'}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTargetBatchForChange('batch1');
                          setShowModuleSelectModal(true);
                        }}
                        className="h-8 px-2.5 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                        <span>Ganti Modul</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleBatch('batch1')}
                        className={`h-8 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-[0.98] ${
                          activeConfig.batch1?.isActive
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {activeConfig.batch1?.isActive ? 'lock' : 'play_arrow'}
                        </span>
                        <span>{activeConfig.batch1?.isActive ? 'Tutup Kuis C1-C8' : 'Aktifkan Kuis C1-C8'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* BATCH 2: Kelompok C9 - C16 */}
                <div
                  className={`rounded-xl p-4 border transition-all flex flex-col justify-between gap-3 shadow-sm ${
                    activeConfig.batch2?.isActive
                      ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-200'
                      : 'bg-surface-container-low/60 border-outline-variant'
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-code-md text-code-md font-bold px-2.5 py-0.5 rounded bg-primary text-on-primary">
                          Kelompok C9 – C16
                        </span>
                        <span className="font-label-sm text-xs text-on-surface-variant font-medium">
                          (8 Kelompok Praktikum)
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-code-sm font-code-sm font-semibold border ${
                          activeConfig.batch2?.isActive
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            activeConfig.batch2?.isActive ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
                          }`}
                        ></span>
                        <span>
                          {activeConfig.batch2?.isActive ? 'STATUS: AKTIF (Bisa Dikerjakan)' : 'STATUS: DITUTUP / MENUNGGU'}
                        </span>
                      </span>
                    </div>

                    <div className="mt-1">
                      <div className="flex items-center gap-2">
                        <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-surface-container-high text-primary font-bold">
                          {activeConfig.batch2?.setCode} ({activeConfig.batch2?.expCode})
                        </span>
                        <span className="font-code-sm text-xs text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">meeting_room</span>
                          {activeConfig.batch2?.labRoom || 'Lab Fisika Dasar 2'}
                        </span>
                      </div>
                      <h4 className="font-headline-sm text-[16px] font-bold text-primary mt-1">
                        {activeConfig.batch2?.title}
                      </h4>
                      <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2 mt-0.5">
                        {activeConfig.batch2?.description || 'Modul praktikum terjadwal untuk batch 2.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-outline-variant/60 flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-code-sm text-[11px] text-on-surface-variant">
                      Terakhir diubah: <strong>{activeConfig.batch2?.activatedAt || 'Hari Ini'}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTargetBatchForChange('batch2');
                          setShowModuleSelectModal(true);
                        }}
                        className="h-8 px-2.5 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                        <span>Ganti Modul</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleBatch('batch2')}
                        className={`h-8 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-[0.98] ${
                          activeConfig.batch2?.isActive
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {activeConfig.batch2?.isActive ? 'lock' : 'play_arrow'}
                        </span>
                        <span>{activeConfig.batch2?.isActive ? 'Tutup Kuis C9-C16' : 'Aktifkan Kuis C9-C16'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FILTER & REALTIME SOCKET CONTROLLER */}
          <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 p-1 bg-surface-container-lowest border border-outline-variant rounded-lg flex-wrap">
              <button
                type="button"
                onClick={() => setStatusTab('all')}
                className={`px-3 py-1.5 rounded-md font-label-md text-label-md font-semibold transition-colors cursor-pointer ${
                  statusTab === 'all'
                    ? 'bg-primary-container text-on-primary'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                }`}
              >
                Semua Peserta ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusTab('active')}
                className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-colors cursor-pointer ${
                  statusTab === 'active'
                    ? 'bg-primary-container text-on-primary font-semibold'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                }`}
              >
                Sedang Aktif ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusTab('locked')}
                className={`px-3 py-1.5 rounded-md font-label-md text-label-md text-error hover:bg-error-container/40 transition-colors flex items-center gap-1.5 cursor-pointer ${
                  statusTab === 'locked' ? 'bg-error-container/60 font-semibold' : ''
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                <span>Terkunci ({lockedCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusTab('completed')}
                className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-colors cursor-pointer ${
                  statusTab === 'completed'
                    ? 'bg-primary-container text-on-primary font-semibold'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                }`}
              >
                Selesai ({completedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusTab('idle')}
                className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-colors cursor-pointer ${
                  statusTab === 'idle'
                    ? 'bg-primary-container text-on-primary font-semibold'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                }`}
              >
                Belum Mulai ({idleCount})
              </button>
            </div>

            {/* Kelompok Filter & Live Socket Latency */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Filter Kelompok:</label>
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="h-9 px-3 text-body-sm font-body-sm bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary focus:ring-0 focus:outline-none cursor-pointer"
                >
                  <option value="Semua Kelompok">Semua Kelompok (C1 – C16)</option>
                  <option value="Batch C1 – C8">Batch C1 – C8 (Lab 1)</option>
                  <option value="Batch C9 – C16">Batch C9 – C16 (Lab 1)</option>
                  {Array.from({ length: 16 }, (_, i) => (
                    <option key={i + 1} value={`Kelompok C${i + 1}`}>
                      Kelompok C{i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Websocket Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg">
                <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse"></span>
                <span className="font-code-sm text-code-sm text-on-surface">
                  Live Proctoring Supabase/Websocket
                </span>
                <span className="font-code-sm text-code-sm text-outline-variant font-light">|</span>
                <span className="font-code-sm text-code-sm text-on-tertiary-container font-semibold">12ms</span>
              </div>
            </div>
          </section>

          {/* =====================================================================
              WORKSTATION CARDS BENTO / MULTI-COLUMN GRID
             ===================================================================== */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStudents.map((student) => {
              const isLocked = student.status === 'locked';
              const isCompleted = student.status === 'completed';
              const isActive = student.status === 'active';

              if (isLocked) {
                return (
                  <div
                    key={student.id}
                    className="bg-surface-container-lowest rounded-xl border-2 border-error p-4 relative flex flex-col justify-between shadow-sm animate-fadeIn"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-error rounded-t-xl"></div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-code-sm text-code-sm font-bold bg-error text-on-error px-2 py-0.5 rounded">
                            {student.desk}
                          </span>
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping" title="Koneksi Bermasalah / Terkunci"></span>
                      </div>
                      <h4 className="font-headline-sm text-headline-sm font-bold text-primary truncate">
                        {student.name}
                      </h4>
                      <p className="font-code-sm text-code-sm text-on-surface-variant font-mono">
                        {student.nim}
                      </p>

                      {/* Status Alert Box */}
                      <div className="mt-3 p-2 bg-error-container/40 border border-error/30 rounded-lg">
                        <div className="flex items-center gap-1.5 text-error font-label-sm text-label-sm font-semibold">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            lock_clock
                          </span>
                          <span>Terkunci: {student.lockReason || 'Tab Blur terdeteksi'}</span>
                        </div>
                        <p className="font-code-sm text-code-sm text-on-error-container mt-1">
                          {student.lockDetail || 'Ujian dihentikan otomatis oleh protokol pengawas integritas.'}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between font-code-sm text-code-sm mb-1">
                          <span className="text-on-surface-variant">Progress</span>
                          <span className="font-semibold text-error">{student.progressText}</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className="bg-error h-full transition-all"
                            style={{ width: `${student.progressPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-outline-variant flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPasskeyModal(student)}
                        className="flex-1 py-1.5 px-3 bg-secondary-container text-on-secondary-fixed hover:bg-secondary font-label-md text-label-md font-semibold rounded-lg flex items-center justify-center gap-1.5 active:scale-[0.99] transition-colors shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          key
                        </span>
                        <span>Berikan Passkey</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast(`Log rekaman tab ${student.name}: 2x tab blur terdeteksi.`)}
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg border border-outline-variant cursor-pointer"
                        title="Lihat Rekaman Tab"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          history
                        </span>
                      </button>
                    </div>
                  </div>
                );
              }

              if (isCompleted) {
                return (
                  <div
                    key={student.id}
                    className="bg-surface-container-lowest rounded-xl border border-outline-variant hover:border-outline p-4 flex flex-col justify-between transition-colors shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-code-sm text-code-sm font-bold bg-surface-container-high text-primary px-2 py-0.5 rounded">
                            {student.desk}
                          </span>
                        </div>
                        <span className="font-code-sm text-code-sm font-semibold text-on-tertiary-container flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            check_circle
                          </span>
                          Selesai
                        </span>
                      </div>
                      <h4 className="font-headline-sm text-headline-sm font-bold text-primary truncate">
                        {student.name}
                      </h4>
                      <p className="font-code-sm text-code-sm text-on-surface-variant font-mono">
                        {student.nim}
                      </p>

                      <div className="mt-3 p-2 bg-surface-container-low border border-outline-variant/60 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="font-code-sm text-code-sm text-on-surface-variant uppercase">
                            Nilai Kuis
                          </span>
                          <p className="font-headline-sm text-headline-sm font-bold text-primary">
                            {student.score !== null ? student.score : '-'}{' '}
                            <span className="font-body-sm text-body-sm text-on-surface-variant">/ 100</span>
                          </p>
                        </div>
                        <span className="font-label-sm text-label-sm bg-on-tertiary-container/10 text-on-tertiary-container border border-on-tertiary-container/30 px-2 py-1 rounded font-semibold">
                          Kuis Selesai
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between font-code-sm text-code-sm mb-1">
                          <span className="text-on-surface-variant">Progress</span>
                          <span className="font-semibold text-on-tertiary-container">
                            {student.progressText}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className="bg-on-tertiary-container h-full"
                            style={{ width: `${student.progressPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-outline-variant flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => showToast(`Melihat lembar hasil kuis ${student.name}...`)}
                        className="flex-1 py-1.5 px-3 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md font-medium rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          visibility
                        </span>
                        <span>Lihat Hasil Kuis</span>
                      </button>
                    </div>
                  </div>
                );
              }

              if (isActive) {
                return (
                  <div
                    key={student.id}
                    className="bg-surface-container-lowest rounded-xl border border-primary/40 hover:border-primary p-4 flex flex-col justify-between transition-colors shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-code-sm text-code-sm font-bold bg-primary text-on-primary px-2 py-0.5 rounded">
                            {student.desk}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse"></span>
                          <span className="font-code-sm text-code-sm text-on-tertiary-container font-medium">
                            Aktif
                          </span>
                        </span>
                      </div>

                      <h4 className="font-headline-sm text-headline-sm font-bold text-primary truncate">
                        {student.name}
                      </h4>
                      <p className="font-code-sm text-code-sm text-on-surface-variant font-mono">
                        {student.nim}
                      </p>

                      <div className="mt-3 flex items-center gap-1.5 font-label-sm text-label-sm text-primary bg-surface-container-low px-2.5 py-1.5 rounded-lg border border-outline-variant/60">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>
                          edit_note
                        </span>
                        <span>Sedang pengerjaan: {student.currentQuestion}</span>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between font-code-sm text-code-sm mb-1">
                          <span className="text-on-surface-variant">Progress</span>
                          <span className="font-semibold text-primary">{student.progressText}</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className="bg-primary-container h-full transition-all"
                            style={{ width: `${student.progressPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-outline-variant flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectStudent(student)}
                        className="flex-1 py-1.5 px-3 bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md font-medium rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          visibility
                        </span>
                        <span>Inspeksi Layar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast(`Log aktivitas ${student.name}: Pengerjaan normal tanpa pelanggaran.`)}
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg border border-outline-variant cursor-pointer"
                        title="Log Aktivitas"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          receipt_long
                        </span>
                      </button>
                    </div>
                  </div>
                );
              }

              // Idle / Standby (Belum Mulai)
              return (
                <div
                  key={student.id}
                  className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex flex-col justify-between transition-colors shadow-sm opacity-90 hover:opacity-100"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-code-sm text-code-sm font-bold bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded">
                          {student.desk}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 font-code-sm text-code-sm text-outline">
                        <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                        Belum Mulai
                      </span>
                    </div>

                    <h4 className="font-headline-sm text-headline-sm font-bold text-primary truncate">
                      {student.name}
                    </h4>
                    <p className="font-code-sm text-code-sm text-on-surface-variant font-mono">
                      {student.nim}
                    </p>

                    <div className="mt-3 flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-2.5 py-1.5 rounded-lg border border-outline-variant/60">
                      <span className="material-symbols-outlined text-outline" style={{ fontSize: '16px' }}>
                        hourglass_empty
                      </span>
                      <span>Menunggu praktikan membuka kuis</span>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between font-code-sm text-code-sm mb-1">
                        <span className="text-on-surface-variant">Progress</span>
                        <span className="font-semibold text-on-surface-variant">0 / 15 Soal (0%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="bg-outline-variant h-full" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-outline-variant flex items-center justify-between text-xs text-on-surface-variant">
                    <span className="italic">Standby di Beranda</span>
                    <span className="font-mono text-[11px] text-outline font-medium">ST12.2</span>
                  </div>
                </div>
              );
            })}
          </section>
        </main>
      </div>

      {/* =========================================================================
          MODAL DIALOG: PASSKEY OTORISASI ASISTEN (ACTIVE DISPLAYED ON SCREEN)
         ========================================================================= */}
      {selectedStudentForPasskey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xl overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-error-container text-error flex items-center justify-center">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    lock_open
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
                    Otorisasi Passkey Darurat Kuis
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Protokol Penanganan Pelanggaran Integritas ISO 17025
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentForPasskey(null)}
                className="text-on-surface-variant hover:text-primary p-1 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Deteksi Pelanggaran Box */}
              <div className="p-3.5 bg-surface-container-low border border-error/30 rounded-lg flex items-start gap-3">
                <span className="material-symbols-outlined text-error shrink-0 mt-0.5">warning</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md font-bold text-primary">
                      {selectedStudentForPasskey.name} (NIM: {selectedStudentForPasskey.nim})
                    </span>
                    <span className="font-code-sm text-code-sm bg-surface-container-high px-2 py-0.5 rounded font-semibold text-primary">
                      {selectedStudentForPasskey.desk} • {selectedStudentForPasskey.group}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    <strong className="text-error">Pelanggaran:</strong> Deteksi perpindahan tab browser (
                    <span className="font-code-sm font-medium">Tab Blur</span>) sebanyak 2 kali pada pukul{' '}
                    <strong>08:14:02 WIB</strong>. Sesi dikunci secara otomatis oleh sistem.
                  </p>
                </div>
              </div>

              {/* Generated Passkey Display */}
              <div>
                <label className="block font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant mb-1.5">
                  Kode Passkey Darurat (Sekali Pakai)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-surface-container-high border-2 border-primary/20 rounded-lg py-3 px-4 flex items-center justify-center">
                    <span className="font-code-md text-2xl font-bold tracking-widest text-primary font-mono select-all">
                      {generatedPasskey}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(generatedPasskey);
                      showToast('Passkey disalin ke papan klip!');
                    }}
                    className="h-12 px-3 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-primary font-label-md text-label-md rounded-lg flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                    title="Salin ke Clipboard"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      content_copy
                    </span>
                    <span className="font-code-sm text-[10px]">Salin</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerateKey}
                    className="h-12 px-3 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface-variant hover:text-primary font-label-md text-label-md rounded-lg flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                    title="Generate Ulang"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      refresh
                    </span>
                    <span className="font-code-sm text-[10px]">Regen</span>
                  </button>
                </div>
                <p className="font-code-sm text-code-sm text-on-surface-variant mt-1.5">
                  Passkey berlaku selama 3 menit pada workstation target.
                </p>
              </div>

              {/* Kebijakan Asisten (Radio Group) */}
              <div className="space-y-2">
                <label className="block font-label-sm text-label-sm uppercase font-semibold text-on-surface-variant">
                  Pilihan Kebijakan Pembukaan Kunci
                </label>
                <label
                  onClick={() => setPasskeyPolicy('no_penalty')}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
                    passkeyPolicy === 'no_penalty'
                      ? 'bg-surface-container-low border-primary'
                      : 'bg-surface-container-lowest border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  <input
                    type="radio"
                    name="passkey_policy"
                    checked={passkeyPolicy === 'no_penalty'}
                    onChange={() => setPasskeyPolicy('no_penalty')}
                    className="mt-1 text-primary focus:ring-0"
                  />
                  <div>
                    <span className="block font-label-md text-label-md font-semibold text-primary">
                      Lanjutkan Tanpa Penalti (Verifikasi Lisan Selesai)
                    </span>
                    <span className="block font-body-sm text-body-sm text-on-surface-variant">
                      Mahasiswa telah memberikan klarifikasi fisik yang valid kepada asisten jaga.
                    </span>
                  </div>
                </label>
                <label
                  onClick={() => setPasskeyPolicy('penalty_reset')}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
                    passkeyPolicy === 'penalty_reset'
                      ? 'bg-surface-container-low border-primary'
                      : 'bg-surface-container-lowest border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  <input
                    type="radio"
                    name="passkey_policy"
                    checked={passkeyPolicy === 'penalty_reset'}
                    onChange={() => setPasskeyPolicy('penalty_reset')}
                    className="mt-1 text-primary focus:ring-0"
                  />
                  <div>
                    <span className="block font-label-md text-label-md font-semibold text-primary">
                      Reset Percobaan Soal Saat Ini (-5 Poin Penalti)
                    </span>
                    <span className="block font-body-sm text-body-sm text-on-surface-variant">
                      Soal yang sedang dibuka akan diacak ulang dengan nilai maksimum terpotong.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
              <button
                type="button"
                onClick={handleDisqualify}
                className="px-4 py-2 border border-error/50 text-error hover:bg-error-container/30 font-label-md text-label-md rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  block
                </span>
                <span>Batalkan / Diskualifikasi</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUnlockStudent}
                  className="px-5 py-2 bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-semibold rounded-lg flex items-center gap-1.5 shadow-sm active:scale-[0.99] transition-transform cursor-pointer"
                >
                  <span className="material-symbols-outlined text-inverse-primary" style={{ fontSize: '18px' }}>
                    verified_user
                  </span>
                  <span>Buka Kunci Sesi Mahasiswa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <h3 className="font-headline-sm font-bold text-primary">Broadcast Pesan ke Seluruh Layar</h3>
              <button onClick={() => setShowBroadcastModal(false)} className="text-outline hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSendBroadcast} className="space-y-3 font-body-sm">
              <p className="text-on-surface-variant">
                Pesan ini akan langsung muncul sebagai notifikasi mendesak di layar HP seluruh praktikan.
              </p>
              <textarea
                required
                rows={3}
                value={broadcastInput}
                onChange={(e) => setBroadcastInput(e.target.value)}
                placeholder="Contoh: Sisa waktu kuis tinggal 5 menit lagi. Harap periksa kembali jawaban Anda!"
                className="w-full p-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface text-sm"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="flex-1 h-10 rounded-lg bg-surface-container text-on-surface font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-lg bg-primary text-on-primary font-semibold shadow-sm"
                >
                  Kirim Siaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Master Passkey Modal */}
      {showMasterPasskeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xl p-6 space-y-4 text-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">key</span>
            </div>
            <h3 className="font-headline-sm font-bold text-primary">Master Passkey Ruang Lab</h3>
            <p className="font-body-sm text-on-surface-variant">
              Dapat digunakan asisten untuk membuka kunci darurat seluruh workstation di Lab Fisika Dasar 1.
            </p>
            <div className="bg-surface-container-high py-3 px-4 rounded-xl border border-secondary-container font-code-md text-2xl font-bold text-primary tracking-widest select-all">
              {masterPasskey}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setMasterPasskey(`LAB-IPB-${Math.floor(1000 + Math.random() * 9000)}`);
                  showToast('Master passkey diperbarui');
                }}
                className="flex-1 h-10 rounded-lg bg-surface-container text-primary font-semibold"
              >
                Acak Ulang
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(masterPasskey);
                  showToast('Master passkey disalin!');
                  setShowMasterPasskeyModal(false);
                }}
                className="flex-1 h-10 rounded-lg bg-primary text-on-primary font-semibold shadow-sm"
              >
                Salin &amp; Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspeksi Layar Modal */}
      {inspectStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div>
                <h3 className="font-headline-sm font-bold text-primary">Inspeksi Kelompok Praktikan</h3>
                <p className="font-code-sm text-code-sm text-on-surface-variant">
                  {inspectStudent.desk} • {inspectStudent.name}
                </p>
              </div>
              <button onClick={() => setInspectStudent(null)} className="text-outline hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/60 space-y-1 text-body-sm">
              <p><strong>Praktikan:</strong> {inspectStudent.name} ({inspectStudent.nim})</p>
              <p><strong>Kelompok Praktikan:</strong> {inspectStudent.desk} ({inspectStudent.group})</p>
              <p><strong>Status Layar:</strong> <span className="text-emerald-700 font-semibold">Fokus Aktif (Tanpa Tab Switch)</span></p>
              <p><strong>Progres Terakhir:</strong> {inspectStudent.currentQuestion}</p>
            </div>
            <button
              type="button"
              onClick={() => setInspectStudent(null)}
              className="w-full h-10 bg-primary text-on-primary font-semibold rounded-lg shadow-sm"
            >
              Tutup Inspeksi
            </button>
          </div>
        </div>
      )}

      {/* Modal: Ganti & Aktifkan Modul untuk Batch Kelompok */}
      {showModuleSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-2xl bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">swap_horiz</span>
                <div>
                  <h3 className="font-headline-sm font-bold text-primary">
                    Pilih &amp; Aktifkan Modul Kuis
                  </h3>
                  <p className="font-code-sm text-xs text-on-surface-variant">
                    Target Penugasan: <strong className="text-primary">{targetBatchForChange === 'batch1' ? 'Kelompok C1 – C8 (Batch 1)' : 'Kelompok C9 – C16 (Batch 2)'}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModuleSelectModal(false)}
                className="text-on-surface-variant hover:text-primary p-1 rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1 custom-scrollbar">
              <p className="text-xs text-on-surface-variant mb-2">
                Pilih modul dari bank soal resmi laboratorium untuk diaktifkan pada batch kelompok ini:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PHYSICS_MODULES.map((mod) => {
                  const isCurrent =
                    targetBatchForChange === 'batch1'
                      ? activeConfig.batch1?.moduleId === mod.setId || activeConfig.batch1?.expCode === mod.expCode
                      : activeConfig.batch2?.moduleId === mod.setId || activeConfig.batch2?.expCode === mod.expCode;

                  return (
                    <div
                      key={mod.setId}
                      onClick={() => handleSelectModuleForBatch(targetBatchForChange, mod)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between gap-2 group ${
                        isCurrent
                          ? 'bg-primary-container/10 border-primary-container ring-1 ring-primary'
                          : 'bg-surface hover:bg-surface-container border-outline-variant'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-code-sm text-xs font-bold px-2 py-0.5 rounded bg-surface-container-high text-primary">
                            {mod.setCode} ({mod.expCode})
                          </span>
                          {isCurrent && (
                            <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">check</span>
                              Sedang Aktif
                            </span>
                          )}
                        </div>
                        <h4 className="font-headline-sm text-sm font-bold text-primary mt-1.5 group-hover:text-primary-container">
                          {mod.title}
                        </h4>
                        <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5">
                          {mod.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-outline-variant/50 flex items-center justify-between text-[11px]">
                        <span className="text-on-surface-variant">{mod.durationMinutes || 15} Menit • 15 Soal</span>
                        <span className="text-primary font-semibold flex items-center gap-0.5">
                          <span>Pilih Modul</span>
                          <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 border-t border-outline-variant bg-surface-container-low flex justify-end">
              <button
                type="button"
                onClick={() => setShowModuleSelectModal(false)}
                className="h-9 px-4 rounded-lg bg-surface-container border border-outline-variant text-on-surface text-xs font-semibold hover:bg-surface-container-high cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

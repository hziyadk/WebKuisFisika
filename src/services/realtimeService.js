import { DEFAULT_ASSISTANTS, PHYSICS_MODULES, CLASS_INFO, MEETING_SCHEDULE, getScheduleForGroup, OFFICIAL_PRAKTIKAN_ROSTER } from './mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// BroadcastChannel for instant local real-time sync across multiple tabs/windows
const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('ipb_physics_quiz_sync')
  : null;

// Supabase Realtime Broadcast Channel singleton
let supabaseChannel = null;
if (isSupabaseConfigured && supabase) {
  supabaseChannel = supabase.channel('ipb_quiz_realtime_channel');
  supabaseChannel.subscribe();
}

const STORAGE_KEYS = {
  USERS: 'ipb_physics_users',
  MODULES: 'ipb_physics_modules',
  CLASS_INFO: 'ipb_physics_class_info',
  SESSIONS: 'ipb_physics_live_sessions',
  SUBMISSIONS: 'ipb_physics_submissions',
  ACTIVE_CONFIG: 'ipb_physics_active_config'
};

export const DEFAULT_ACTIVE_CONFIG = {
  meetingNumber: 5,
  classCode: 'ST12.2',
  lastUpdated: new Date().toISOString(),
  batch1: {
    id: 'batch1',
    groupRange: 'C1 - C8',
    targetLabel: 'Kelompok C1 s.d. C8',
    groupMin: 1,
    groupMax: 8,
    moduleId: 'set-1',
    setCode: 'Set 1',
    expCode: 'P04',
    title: 'GLB dan GLBB',
    description: 'Gerak Lurus Beraturan, Gerak Lurus Berubah Beraturan, ticker timer, dan percepatan.',
    labRoom: 'Lab Fisika Dasar 1 (Ruang 204)',
    isActive: true,
    activatedAt: '15:20 WIB',
    activatedBy: 'Ahmad Rozali, S.Si'
  },
  batch2: {
    id: 'batch2',
    groupRange: 'C9 - C16',
    targetLabel: 'Kelompok C9 s.d. C16',
    groupMin: 9,
    groupMax: 16,
    moduleId: 'set-2',
    setCode: 'Set 2',
    expCode: 'P05',
    title: 'Hukum Newton: Sistem Dua Benda',
    description: 'Dinamika sistem dua massa terhubung katrol (pesawat Atwood), tegangan tali, dan hukum II Newton.',
    labRoom: 'Lab Fisika Dasar 1 (Ruang 208)',
    isActive: true,
    activatedAt: '15:20 WIB',
    activatedBy: 'Ahmad Rozali, S.Si'
  }
};

// Initialize default storage if empty and sync with Supabase if configured
export async function initStorage() {
  if (typeof window === 'undefined') return;

  // If Supabase is configured, pull initial live_sessions, submissions, and active_config
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: dbSessions } = await supabase.from('live_sessions').select('*');
      if (dbSessions && dbSessions.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(dbSessions));
      }
      const { data: dbSubmissions } = await supabase.from('submissions').select('*');
      if (dbSubmissions && dbSubmissions.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(dbSubmissions));
      }
      const { data: dbSettings } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', 'active_session_config')
        .single();
      if (dbSettings && dbSettings.value) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_CONFIG, JSON.stringify(dbSettings.value));
      }
    } catch (err) {
      console.warn('Sinkronisasi cloud Supabase:', err);
    }
  }

  if (!localStorage.getItem(STORAGE_KEYS.MODULES)) {
    localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(PHYSICS_MODULES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLASS_INFO)) {
    localStorage.setItem(STORAGE_KEYS.CLASS_INFO, JSON.stringify(CLASS_INFO));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_CONFIG)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CONFIG, JSON.stringify(DEFAULT_ACTIVE_CONFIG));
  }

  // Purge any old fake mock completed sessions so live monitoring reflects REAL student status
  const existingSessionsStr = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  if (existingSessionsStr) {
    try {
      const parsed = JSON.parse(existingSessionsStr);
      if (Array.isArray(parsed)) {
        // Keep ONLY real sessions with valid timestamp and without mock department markers
        const cleaned = parsed.filter(
          (s) => s && s.nim && s.updatedAt && !s.department && s.nim !== 'G64190001'
        );
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(cleaned));
      } else {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
      }
    } catch (e) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
    }
  } else {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
  }

  let shouldSeedSessions = false;
  if (shouldSeedSessions) {
    const defaultSessions = [
      {
        id: 'session-G4401261088',
        nim: 'G4401261088',
        name: 'Affan Kurniawan Widarjdo',
        department: 'Kimia (FMIPA IPB)',
        groupNumber: 1,
        groupLabel: 'Kelompok C1',
        moduleTitle: 'Set 1: P04 GLB dan GLBB',
        subTopic: 'Tabung Kundt & Garputala',
        status: 'completed',
        score: 95,
        passed: true,
        time: '08:14:22'
      },
      {
        id: 'session-D1401261039',
        nim: 'D1401261039',
        name: 'Ahmad Hafis Fadlan',
        department: 'Ilmu Nutrisi & Pakan (FAPET IPB)',
        groupNumber: 2,
        groupLabel: 'Kelompok C2',
        moduleTitle: 'Set 1: P04 GLB dan GLBB',
        subTopic: 'Tabung Kundt & Garputala',
        status: 'in_progress',
        progress: 'Progres: 8/15',
        time: '08:05:10'
      },
      {
        id: 'session-E2401261058',
        nim: 'E2401261058',
        name: 'Chesya Anandita Febriani',
        department: 'Teknik Mesin & Biosistem (FATETA IPB)',
        groupNumber: 3,
        groupLabel: 'Kelompok C3',
        moduleTitle: 'Set 1: P04 GLB dan GLBB',
        subTopic: 'Tabung Kundt & Garputala',
        status: 'locked',
        lockReason: 'Tab browser tidak aktif / perpindahan aplikasi',
        lockTimestamp: '08:12:04 WIB',
        time: '08:12:04',
        score: 65,
        progress: 'Terhenti Q7',
        passkey: '849201'
      },
      {
        id: 'session-D2401261046',
        nim: 'D2401261046',
        name: 'Dava Putra Perdana',
        department: 'Teknologi Produksi Ternak (FAPET IPB)',
        groupNumber: 4,
        groupLabel: 'Kelompok C4',
        moduleTitle: 'Set 1: P04 GLB dan GLBB',
        subTopic: 'Tabung Kundt & Garputala',
        status: 'completed',
        score: 88,
        passed: true,
        time: '08:05:10'
      },
      {
        id: 'session-D1401261037',
        nim: 'D1401261037',
        name: 'Winie Aulianie',
        department: 'Ilmu Nutrisi & Pakan (FAPET IPB)',
        groupNumber: 5,
        groupLabel: 'Kelompok C5',
        moduleTitle: 'Set 1: P04 GLB dan GLBB',
        subTopic: 'Metode Bola Jatuh Stokes',
        status: 'in_progress',
        progress: 'Progres: 11/15',
        time: '07:50:15'
      },
      {
        id: 'session-D1401261100',
        nim: 'D1401261100',
        name: 'Raisa Alifia Syuraina',
        department: 'Ilmu Nutrisi & Pakan (FAPET IPB)',
        groupNumber: 6,
        groupLabel: 'Kelompok C6',
        moduleTitle: 'Set 1: P04 GLB dan GLBB',
        subTopic: 'Metode Bola Jatuh Stokes',
        status: 'completed',
        score: 92,
        passed: true,
        time: '07:58:30'
      },
      {
        id: 'session-D2401261142',
        nim: 'D2401261142',
        name: 'Fitratul Illahi',
        department: 'Teknologi Produksi Ternak (FAPET IPB)',
        groupNumber: 7,
        groupLabel: 'Kelompok C7',
        moduleTitle: 'Set 1: P04 GLB dan GLBB',
        subTopic: 'Tabung Kundt & Garputala',
        status: 'completed',
        score: 85,
        passed: true,
        time: '08:02:11'
      },
      {
        id: 'session-D2401261059',
        nim: 'D2401261059',
        name: 'Jesicha Novrianti',
        department: 'Teknologi Produksi Ternak (FAPET IPB)',
        groupNumber: 8,
        groupLabel: 'Kelompok C8',
        moduleTitle: 'Set 1: P04 GLB dan GLBB',
        subTopic: 'Tabung Kundt & Garputala',
        status: 'in_progress',
        progress: 'Progres: 6/15',
        time: '08:14:02'
      },
      {
        id: 'session-D3401261057',
        nim: 'D3401261057',
        name: 'Ardita Zia Zhafira',
        department: 'Teknologi Hasil Ternak (FAPET IPB)',
        groupNumber: 9,
        groupLabel: 'Kelompok C9',
        moduleTitle: 'Set 2: P05 Hukum Newton',
        subTopic: 'Pesawat Atwood & Dua Benda',
        status: 'completed',
        score: 90,
        passed: true,
        time: '08:11:50'
      },
      {
        id: 'session-D3401261030',
        nim: 'D3401261030',
        name: 'Raden Adlina Fakhrana Abdi',
        department: 'Teknologi Hasil Ternak (FAPET IPB)',
        groupNumber: 10,
        groupLabel: 'Kelompok C10',
        moduleTitle: 'Set 2: P05 Hukum Newton',
        subTopic: 'Pesawat Atwood & Dua Benda',
        status: 'in_progress',
        progress: 'Progres: 12/15',
        time: '08:09:40'
      },
      {
        id: 'session-D1401261106',
        nim: 'D1401261106',
        name: 'Ghazali Raffi Cahyadi',
        department: 'Ilmu Nutrisi & Pakan (FAPET IPB)',
        groupNumber: 11,
        groupLabel: 'Kelompok C11',
        moduleTitle: 'Set 2: P05 Hukum Newton',
        subTopic: 'Pesawat Atwood & Dua Benda',
        status: 'completed',
        score: 82,
        passed: true,
        time: '08:13:00'
      },
      {
        id: 'session-D24012611135',
        nim: 'D24012611135',
        name: 'Panji Bramantio',
        department: 'Teknologi Produksi Ternak (FAPET IPB)',
        groupNumber: 12,
        groupLabel: 'Kelompok C12',
        moduleTitle: 'Set 2: P05 Hukum Newton',
        subTopic: 'Pesawat Atwood & Dua Benda',
        status: 'locked',
        lockReason: 'Meninggalkan mode layar penuh',
        lockTimestamp: '08:18:20 WIB',
        time: '08:18:20',
        score: 60,
        progress: 'Terhenti Q9',
        passkey: '771204'
      },
      {
        id: 'session-D3401261024',
        nim: 'D3401261024',
        name: 'Indra Maulana Aryaputra',
        department: 'Teknologi Hasil Ternak (FAPET IPB)',
        groupNumber: 13,
        groupLabel: 'Kelompok C13',
        moduleTitle: 'Set 2: P05 Hukum Newton',
        subTopic: 'Pesawat Atwood & Dua Benda',
        status: 'in_progress',
        progress: 'Progres: 9/15',
        time: '08:07:33'
      },
      {
        id: 'session-E4401261061',
        nim: 'E4401261061',
        name: 'Marasil Ali Sadhono',
        department: 'Teknologi Industri Pertanian (FATETA IPB)',
        groupNumber: 14,
        groupLabel: 'Kelompok C14',
        moduleTitle: 'Set 2: P05 Hukum Newton',
        subTopic: 'Pesawat Atwood & Dua Benda',
        status: 'locked',
        lockReason: 'Perpindahan jendela terdeteksi',
        lockTimestamp: '08:16:11 WIB',
        time: '08:16:11',
        score: 55,
        progress: 'Terhenti Q6',
        passkey: '349012'
      },
      {
        id: 'session-E4401261107',
        nim: 'E4401261107',
        name: 'Muhammad Fadhillah Syah Alam',
        department: 'Teknologi Industri Pertanian (FATETA IPB)',
        groupNumber: 15,
        groupLabel: 'Kelompok C15',
        moduleTitle: 'Set 2: P05 Hukum Newton',
        subTopic: 'Pesawat Atwood & Dua Benda',
        status: 'completed',
        score: 94,
        passed: true,
        time: '08:15:45'
      },
      {
        id: 'session-G4401261016',
        nim: 'G4401261016',
        name: 'Ahmad Faza Maulana',
        department: 'Kimia (FMIPA IPB)',
        groupNumber: 16,
        groupLabel: 'Kelompok C16',
        moduleTitle: 'Set 2: P05 Hukum Newton',
        subTopic: 'Pesawat Atwood & Dua Benda',
        status: 'in_progress',
        progress: 'Progres: 7/15',
        time: '08:06:50'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(defaultSessions));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));
  }

  // Pre-seed all 39 official practical students in users registry with default passwords (first word of name)
  const existingUsersStr = localStorage.getItem(STORAGE_KEYS.USERS);
  let shouldSeedUsers = !existingUsersStr;
  if (existingUsersStr) {
    try {
      const parsedUsers = JSON.parse(existingUsersStr);
      if (!Array.isArray(parsedUsers) || parsedUsers.some((u) => u.nim === 'G64190001' || !u.password)) {
        shouldSeedUsers = true;
      }
    } catch (e) {
      shouldSeedUsers = true;
    }
  }

  if (shouldSeedUsers) {
    const defaultUsers = OFFICIAL_PRAKTIKAN_ROSTER.map((s) => {
      const defaultPass = s.name.trim().split(/\s+/)[0];
      return {
        nim: s.nim,
        name: s.name,
        department: s.department,
        classCode: 'ST12.2',
        groupNumber: s.groupNumber,
        groupLabel: `Kelompok C${s.groupNumber}`,
        password: defaultPass,
        mustChangePassword: true
      };
    });
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }
}

// Subscribe to real-time events across windows & devices
export function subscribeRealtime(callback) {
  if (!callback) return () => {};

  // 1. BroadcastChannel (cross-tab)
  const handleBcMessage = (event) => {
    if (event.data) callback(event.data);
  };
  if (channel) {
    channel.addEventListener('message', handleBcMessage);
  }

  // 2. CustomEvent on window (same-window immediate dispatch)
  const handleCustomEvent = (event) => {
    if (event.detail) callback(event.detail);
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('ipb_realtime_sync', handleCustomEvent);
  }

  // 3. Native Storage Event (fallback across all tabs of this browser)
  const handleStorage = (event) => {
    if (event.key === STORAGE_KEYS.ACTIVE_CONFIG && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        callback({ type: 'ACTIVE_CONFIG_UPDATED', payload: parsed });
      } catch (e) {}
    } else if (event.key === STORAGE_KEYS.SESSIONS && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        callback({ type: 'SESSION_UPDATED', payload: parsed });
      } catch (e) {}
    } else if (event.key === STORAGE_KEYS.SUBMISSIONS && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        callback({ type: 'SUBMISSION_ADDED', payload: parsed });
      } catch (e) {}
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }

  // 4. Supabase Realtime Listener for cross-device updates (HP Praktikan <-> PC Asisten)
  let sbChannel = null;
  if (isSupabaseConfigured && supabase) {
    sbChannel = supabase
      .channel('ipb_quiz_sub_' + Math.random().toString(36).substring(7))
      .on('broadcast', { event: '*' }, (payload) => {
        callback({ type: payload.event, payload: payload.payload });
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_sessions' },
        (change) => {
          if (change.new) {
            const sessions = getLiveSessions();
            const idx = sessions.findIndex(
              (s) => s.id === change.new.id || (change.new.nim && s.nim === change.new.nim)
            );
            if (idx !== -1) {
              sessions[idx] = change.new;
            } else {
              sessions.unshift(change.new);
            }
            localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
            callback({ type: 'SESSION_UPDATED', payload: change.new });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings' },
        (change) => {
          if (change.new && change.new.key === 'active_session_config' && change.new.value) {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_CONFIG, JSON.stringify(change.new.value));
            callback({ type: 'ACTIVE_CONFIG_UPDATED', payload: change.new.value });
          }
        }
      )
      .subscribe();
  }

  return () => {
    if (channel) channel.removeEventListener('message', handleBcMessage);
    if (typeof window !== 'undefined') {
      window.removeEventListener('ipb_realtime_sync', handleCustomEvent);
      window.removeEventListener('storage', handleStorage);
    }
    if (sbChannel && supabase) supabase.removeChannel(sbChannel);
  };
}

// Broadcast an event across local tabs AND across physical devices via Supabase
export function broadcastEvent(type, payload) {
  // 1. Post to local BroadcastChannel
  if (channel) {
    try {
      channel.postMessage({ type, payload, timestamp: Date.now() });
    } catch (e) {}
  }

  // 2. Dispatch custom event on window for current-tab subscribers
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('ipb_realtime_sync', { detail: { type, payload, timestamp: Date.now() } })
      );
    } catch (e) {}
  }

  // 3. Supabase Realtime broadcast across physical devices
  if (isSupabaseConfigured && supabaseChannel) {
    supabaseChannel
      .send({
        type: 'broadcast',
        event: type,
        payload
      })
      .catch(() => {});
  }
}

// Live Sessions Management for Live Monitoring
export function getLiveSessions() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s) => s && s.nim && !s.department);
  } catch (e) {
    return [];
  }
}

export function updateSessionState(sessionId, updateData) {
  const sessions = getLiveSessions();
  const targetNim = updateData.nim || (sessionId && sessionId.startsWith('session-') ? sessionId.replace('session-', '') : null);

  // Match by id OR by student NIM so we never have duplicate conflicting entries
  const index = sessions.findIndex(
    (s) => s.id === sessionId || (targetNim && s.nim === targetNim) || (targetNim && s.id === `session-${targetNim}`)
  );

  const finalId = `session-${targetNim || sessionId}`;
  let updatedSession;

  if (index !== -1) {
    updatedSession = {
      ...sessions[index],
      ...updateData,
      id: finalId,
      updatedAt: Date.now()
    };
    sessions[index] = updatedSession;
  } else {
    updatedSession = {
      id: finalId,
      ...updateData,
      updatedAt: Date.now()
    };
    sessions.push(updatedSession);
  }

  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  broadcastEvent('SESSION_UPDATED', updatedSession);

  // Sync with Supabase cloud database if configured
  if (isSupabaseConfigured && supabase) {
    supabase
      .from('live_sessions')
      .upsert({
        id: updatedSession.id,
        nim: updatedSession.nim,
        name: updatedSession.name,
        group_number: updatedSession.groupNumber,
        group_label: updatedSession.groupLabel,
        module_title: updatedSession.moduleTitle,
        sub_topic: updatedSession.subTopic,
        status: updatedSession.status,
        lock_reason: updatedSession.lockReason,
        lock_timestamp: updatedSession.lockTimestamp,
        passkey: updatedSession.passkey,
        score: updatedSession.score,
        progress: updatedSession.progressText || updatedSession.progress,
        report_score: updatedSession.reportScore,
        assistance_requested: updatedSession.assistanceRequested || false,
        station: updatedSession.station,
        updated_at: new Date().toISOString()
      })
      .then(() => {})
      .catch((err) => console.warn('Supabase upsert error:', err));
  }

  return updatedSession;
}

export function unlockStudentSession(sessionId) {
  const updated = updateSessionState(sessionId, {
    status: 'in_progress',
    isLocked: false,
    lockReason: null
  });
  broadcastEvent('UNLOCK_STUDENT', { sessionId });

  if (isSupabaseConfigured && supabase) {
    supabase
      .from('live_sessions')
      .update({
        status: 'in_progress',
        lock_reason: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .then(() => {})
      .catch((err) => console.warn('Supabase unlock update error:', err));
  }

  return updated;
}

// Physics Modules Management
export function getModules() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MODULES);
    return data ? JSON.parse(data) : PHYSICS_MODULES;
  } catch (e) {
    return PHYSICS_MODULES;
  }
}

export function saveModules(modules) {
  localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(modules));
  broadcastEvent('MODULES_UPDATED', modules);

  if (isSupabaseConfigured && supabase) {
    // Optionally batch upsert modules
    modules.forEach((mod) => {
      supabase
        .from('modules')
        .upsert({
          set_id: mod.setId,
          set_code: mod.setCode,
          exp_code: mod.expCode,
          title: mod.title,
          description: mod.description,
          duration_minutes: mod.durationMinutes,
          total_questions: mod.totalQuestions,
          is_active: mod.isActive !== false,
          questions: mod.questions || [],
          updated_at: new Date().toISOString()
        })
        .then(() => {})
        .catch(() => {});
    });
  }
}

// Submissions
export function getSubmissions() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function addSubmission(submission) {
  const list = getSubmissions();
  list.unshift(submission);
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
  broadcastEvent('SUBMISSION_ADDED', submission);

  if (isSupabaseConfigured && supabase) {
    supabase
      .from('submissions')
      .insert({
        id: submission.id,
        nim: submission.nim,
        student_name: submission.name || submission.student_name,
        module_code: submission.moduleCode,
        module_title: submission.moduleTitle,
        score: submission.score,
        passed: submission.passed,
        date: submission.date
      })
      .then(() => {})
      .catch((err) => console.warn('Supabase submission insert error:', err));
  }
}

// =========================================================================
// ACTIVE QUIZ SESSION & GROUP BATCH (C1-C8 vs C9-C16) CONTROLS
// =========================================================================

export function getActiveSessionConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_CONFIG);
    if (!raw) return DEFAULT_ACTIVE_CONFIG;
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_ACTIVE_CONFIG;
  }
}

export function saveActiveSessionConfig(config) {
  const payload = {
    ...config,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.ACTIVE_CONFIG, JSON.stringify(payload));
  broadcastEvent('ACTIVE_CONFIG_UPDATED', payload);

  if (isSupabaseConfigured && supabase) {
    supabase
      .from('app_settings')
      .upsert({
        key: 'active_session_config',
        value: payload,
        updated_at: new Date().toISOString()
      })
      .then(() => {})
      .catch(() => {});
  }
  return payload;
}

export function toggleBatchActive(batchId) {
  const current = getActiveSessionConfig();
  if (current && current[batchId]) {
    current[batchId].isActive = !current[batchId].isActive;
    current[batchId].activatedAt = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    return saveActiveSessionConfig(current);
  }
  return current;
}

export function setBatchModule(batchId, moduleData, setActive = true) {
  const current = getActiveSessionConfig();
  if (current && current[batchId]) {
    current[batchId] = {
      ...current[batchId],
      moduleId: moduleData.setId || moduleData.id || current[batchId].moduleId,
      setCode: moduleData.setCode || moduleData.code || current[batchId].setCode,
      expCode: moduleData.expCode || current[batchId].expCode,
      title: moduleData.title || current[batchId].title,
      description: moduleData.description || moduleData.desc || current[batchId].description,
      isActive: setActive,
      activatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    };
    return saveActiveSessionConfig(current);
  }
  return current;
}

export function setBothBatchesStatus(isActive = true) {
  const current = getActiveSessionConfig();
  const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  if (current.batch1) {
    current.batch1.isActive = isActive;
    current.batch1.activatedAt = timeStr;
  }
  if (current.batch2) {
    current.batch2.isActive = isActive;
    current.batch2.activatedAt = timeStr;
  }
  return saveActiveSessionConfig(current);
}

export function applyMeetingSchedule(meetingNum) {
  const meetingData = MEETING_SCHEDULE.find((m) => m.meeting === meetingNum) || MEETING_SCHEDULE[4];
  const current = getActiveSessionConfig();

  const c1Module = PHYSICS_MODULES.find(
    (m) => m.setCode.toLowerCase() === meetingData.c1_c8.set.toLowerCase() || m.expCode === meetingData.c1_c8.expCode
  ) || {
    setId: 'set-1',
    setCode: meetingData.c1_c8.set,
    expCode: meetingData.c1_c8.expCode,
    title: meetingData.c1_c8.title,
    description: 'Modul praktikum terjadwal untuk kelompok C1 s.d. C8'
  };

  const c9Module = PHYSICS_MODULES.find(
    (m) => m.setCode.toLowerCase() === meetingData.c9_c16.set.toLowerCase() || m.expCode === meetingData.c9_c16.expCode
  ) || {
    setId: 'set-2',
    setCode: meetingData.c9_c16.set,
    expCode: meetingData.c9_c16.expCode,
    title: meetingData.c9_c16.title,
    description: 'Modul praktikum terjadwal untuk kelompok C9 s.d. C16'
  };

  const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

  const updated = {
    ...current,
    meetingNumber: meetingNum,
    batch1: {
      ...current.batch1,
      moduleId: c1Module.setId,
      setCode: meetingData.c1_c8.set,
      expCode: meetingData.c1_c8.expCode,
      title: meetingData.c1_c8.title,
      description: c1Module.description || 'Praktikum Kelompok C1 s.d. C8',
      labRoom: `Lab Fisika Dasar ${meetingData.c1_c8.lab || 1} (Ruang 204)`,
      isActive: true,
      activatedAt: timeStr
    },
    batch2: {
      ...current.batch2,
      moduleId: c9Module.setId,
      setCode: meetingData.c9_c16.set,
      expCode: meetingData.c9_c16.expCode,
      title: meetingData.c9_c16.title,
      description: c9Module.description || 'Praktikum Kelompok C9 s.d. C16',
      labRoom: `Lab Fisika Dasar ${meetingData.c9_c16.lab || 1} (Ruang 208)`,
      isActive: true,
      activatedAt: timeStr
    }
  };

  return saveActiveSessionConfig(updated);
}

export function getStudentActiveModule(groupNumber = 1) {
  const config = getActiveSessionConfig();
  const num = parseInt(groupNumber) || 1;
  const isBatch1 = num <= 8;
  const batch = isBatch1 ? config.batch1 : config.batch2;

  return {
    ...batch,
    groupNumber: num,
    groupLabel: `Kelompok C${num}`,
    isBatch1,
    meetingNumber: config.meetingNumber || 5
  };
}

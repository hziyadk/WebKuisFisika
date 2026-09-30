import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CLASS_INFO, getScheduleForGroup } from '../../services/mockData';
import { getSubmissions, getStudentActiveModule, subscribeRealtime } from '../../services/realtimeService';

export default function HomePraktikan() {
  const { currentUser, logout, changePraktikanPassword } = useAuth();
  const navigate = useNavigate();

  const groupNum = currentUser?.groupNumber || 3;
  const [activeModuleConfig, setActiveModuleConfig] = useState(() => getStudentActiveModule(groupNum));
  const nextWeekSchedule = getScheduleForGroup(groupNum, 6);

  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [totalSeconds, setTotalSeconds] = useState(37 * 60 + 12);

  // Change Password States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassText, setShowPassText] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!newPassword || newPassword.length < 4) {
      setPassError('Kata sandi baru minimal 4 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    const defaultWord = currentUser?.name ? currentUser.name.trim().split(/\s+/)[0] : '';
    if (defaultWord && newPassword.toLowerCase() === defaultWord.toLowerCase()) {
      setPassError('Kata sandi baru tidak boleh sama dengan kata sandi awal (nama depan).');
      return;
    }

    setPassLoading(true);
    try {
      await changePraktikanPassword(currentUser?.nim, newPassword);
      setPassLoading(false);
      setPassSuccess('Kata sandi berhasil diperbarui!');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPassSuccess('');
      }, 1000);
    } catch (err) {
      setPassLoading(false);
      setPassError(err.message || 'Gagal mengubah kata sandi.');
    }
  };

  useEffect(() => {
    const list = getSubmissions();
    setSubmissions(list);

    setActiveModuleConfig(getStudentActiveModule(groupNum));

    // Listen to real-time activation changes from assistant
    const unsubscribe = subscribeRealtime((event) => {
      if (
        event.type === 'ACTIVE_CONFIG_UPDATED' ||
        event.type === 'MODULES_UPDATED' ||
        event.type === 'SESSION_UPDATED'
      ) {
        setActiveModuleConfig(getStudentActiveModule(groupNum));
        setSubmissions(getSubmissions());
      }
    });

    // 1.5s live polling heartbeat to guarantee instant sync
    const pollInterval = setInterval(() => {
      setActiveModuleConfig(getStudentActiveModule(groupNum));
    }, 1500);

    const timer = setInterval(() => {
      setTotalSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
      unsubscribe();
    };
  }, [groupNum]);

  const formatCountdown = (secs) => {
    if (secs <= 0) return 'Waktu Habis';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'MF';

  const firstName = currentUser?.name?.split(' ')[0] || 'Fadhil';

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface flex flex-col min-h-screen antialiased">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-lg mx-auto h-16 px-gutter-mobile flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[20px]">science</span>
            </div>
            <div className="flex flex-col">
              <span className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">Laboratorium Fisika</span>
              <h1 className="text-headline-sm font-headline-sm text-on-surface leading-tight">Beranda</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPassError('');
                setPassSuccess('');
                setNewPassword('');
                setConfirmPassword('');
                setShowPasswordModal(true);
              }}
              title="Ganti Kata Sandi"
              className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">key</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-on-primary text-xs font-semibold">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Keluar"
              className="p-1 rounded text-on-surface-variant hover:text-error"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex flex-col relative w-full max-w-lg mx-auto pt-16 pb-28 bg-surface px-gutter-mobile min-h-screen">
        <div className="flex flex-col w-full pb-6 space-y-4">
          
          {/* Peringatan Ganti Kata Sandi jika masih menggunakan default */}
          {currentUser?.mustChangePassword && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">lock_reset</span>
              <div className="flex-1 text-xs text-amber-900 leading-relaxed">
                <p className="font-semibold text-amber-800">Kata Sandi Anda Masih Default</p>
                <p className="mt-0.5 text-amber-700">
                  Untuk keamanan akun praktikan, Anda dapat memperbarui kata sandi awal dengan kata sandi pribadi Anda.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPassError('');
                    setPassSuccess('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setShowPasswordModal(true);
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-xs shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[14px]">key</span>
                  Ganti Kata Sandi Sekarang
                </button>
              </div>
            </div>
          )}
          
          {/* 1. Header Sapaan Praktikan */}
          <section className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex flex-col min-w-0">
                <span className="text-label-sm font-label-sm text-on-surface-variant flex items-center gap-1">
                  Selasa, 22 September 2026 • Pekan 05
                </span>
                <h2 className="text-headline-md font-headline-md text-on-surface mt-0.5 truncate">
                  Selamat siang, {firstName}
                </h2>
                <div className="flex items-center gap-1.5 mt-1 text-code-sm font-code-sm text-on-surface-variant">
                  <span className="bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface font-semibold">
                    {currentUser?.nim || 'G64190001'}
                  </span>
                  <span>•</span>
                  <span className="truncate">Kelompok C{groupNum} (Fisika ST12.2)</span>
                </div>
              </div>
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-headline-sm text-headline-sm font-semibold">
                  {initials}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-secondary-container ring-2 ring-surface-container-lowest"></span>
              </div>
            </div>
          </section>

          {/* 2. Card Highlight "Kuis Hari Ini" */}
          <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col gap-space-md">
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${activeModuleConfig.isActive ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
            <div className="flex items-center justify-between gap-space-xs pt-1">
              <div className="flex items-center gap-1.5 text-secondary">
                <span className="material-symbols-outlined text-[18px]">radio_button_checked</span>
                <span className="text-label-sm font-label-sm tracking-wider uppercase text-secondary font-semibold">
                  PRE-LAB QUIZ HARI INI
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-code-sm font-code-sm font-semibold flex items-center gap-1.5 border ${
                  activeModuleConfig.isActive
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeModuleConfig.isActive ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
                  }`}
                ></span>
                <span>{activeModuleConfig.isActive ? 'Sedang Berlangsung' : 'Menunggu Aktivasi Asisten'}</span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-code-sm text-xs font-bold px-2 py-0.5 rounded bg-surface-container-high text-primary">
                  {activeModuleConfig.targetLabel || `Kelompok C${groupNum}`}
                </span>
                <span className="font-code-sm text-xs text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">meeting_room</span>
                  {activeModuleConfig.labRoom || 'Lab Fisika Dasar 1'}
                </span>
              </div>
              <h3 className="text-headline-sm font-headline-sm text-on-surface font-bold">
                {activeModuleConfig.setCode} ({activeModuleConfig.expCode}): {activeModuleConfig.title}
              </h3>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                {activeModuleConfig.description || `Kuis evaluasi pemahaman materi sebelum praktikum tatap muka (${CLASS_INFO.scheduleTime}).`}
              </p>
            </div>

            {/* Informative Callout if Module is NOT active yet */}
            {!activeModuleConfig.isActive && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-amber-700 text-[20px] shrink-0 mt-0.5">lock_clock</span>
                <div className="flex flex-col text-xs leading-relaxed">
                  <span className="font-bold text-amber-950">Kuis Belum Diaktifkan oleh Asisten Lab</span>
                  <span>
                    Modul kuis pra-praktikum untuk <strong>{activeModuleConfig.groupLabel} ({activeModuleConfig.targetLabel})</strong> saat ini belum dibuka oleh asisten laboratorium. Tombol kuis di bawah akan otomatis menyala begitu asisten mengaktifkan sesi di laboratorium.
                  </span>
                </div>
              </div>
            )}

            {/* Data Parameter Grid */}
            <div className="grid grid-cols-2 gap-space-xs bg-surface-container-low p-space-sm rounded-lg text-body-sm font-body-sm">
              <div className="flex flex-col">
                <span className="text-code-sm font-code-sm text-on-surface-variant">Jendela Akses</span>
                <span className="font-medium text-on-surface">15:00 - 15:30 WIB</span>
              </div>
              <div className="flex flex-col">
                <span className="text-code-sm font-code-sm text-on-surface-variant">Batas Durasi</span>
                <span className="font-medium text-on-surface">15 Menit (15 Soal)</span>
              </div>
              <div className="flex flex-col col-span-2 pt-1 border-t border-surface-container">
                <span className="text-code-sm font-code-sm text-on-surface-variant">Ambang Kelulusan</span>
                <span className="font-medium text-on-surface">Nilai Standar Minimum: 70.0</span>
              </div>
            </div>

            {/* Countdown & Trigger CTA */}
            <div className="flex flex-col gap-space-sm pt-1">
              <div className="flex items-center justify-between text-body-sm font-body-sm px-1">
                <span className="text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-secondary">timer</span>
                  Tersisa untuk memulai:
                </span>
                <span className="font-code-md text-code-md text-secondary font-semibold" id="quizTimer">
                  {formatCountdown(totalSeconds)}
                </span>
              </div>

              {activeModuleConfig.isActive ? (
                <Link
                  className="w-full bg-primary-container text-on-primary py-2.5 px-space-md rounded-lg flex items-center justify-center gap-2 font-label-md text-label-md hover:bg-primary transition-all active:scale-[0.99] shadow-sm font-semibold"
                  to={`/kuis/${activeModuleConfig.moduleId || activeModuleConfig.setCode.toLowerCase().replace(' ', '-')}`}
                >
                  <span>Mulai Kuis Sekarang</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full bg-surface-container-high text-on-surface-variant/70 py-2.5 px-space-md rounded-lg flex items-center justify-center gap-2 font-label-md text-label-md cursor-not-allowed font-semibold border border-outline-variant"
                >
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  <span>Menunggu Aktivasi Asisten Lab...</span>
                </button>
              )}
            </div>
          </section>

          {/* 3. Card "Jadwal Praktikum Mendatang" */}
          <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">event</span>
                <span className="text-label-sm font-label-sm uppercase tracking-wide font-semibold">Jadwal Praktikum</span>
              </div>
              <span className="bg-surface-container px-2 py-0.5 rounded text-code-sm font-code-sm text-on-surface-variant font-semibold">
                Pekan Depan
              </span>
            </div>
            <div>
              <h3 className="text-headline-sm font-headline-sm text-on-surface font-semibold">
                {nextWeekSchedule.set} ({nextWeekSchedule.expCode}): {nextWeekSchedule.title}
              </h3>
            </div>
            <div className="flex flex-col gap-2 bg-surface-container-low p-space-sm rounded-lg text-body-sm font-body-sm text-on-surface">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary-container text-[18px] shrink-0 mt-0.5">calendar_today</span>
                <div className="flex flex-col">
                  <span className="font-medium">Selasa, 29 September 2026</span>
                  <span className="text-code-sm font-code-sm text-on-surface-variant">15:30 - 17:30 WIB (Sesi Sore)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary-container text-[18px] shrink-0 mt-0.5">meeting_room</span>
                <div className="flex flex-col">
                  <span className="font-medium">Lab Fisika Lanjutan, Wing Fasilitator Lt. 2</span>
                  <span className="text-code-sm font-code-sm text-on-surface-variant">Kelompok Praktikum C-0{groupNum}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary-container text-[18px] shrink-0 mt-0.5">badge</span>
                <div className="flex flex-col">
                  <span className="font-medium">Kak Ahmad R. & Tim Asisten</span>
                  <span className="text-code-sm font-code-sm text-on-surface-variant">PJ Modul Fisika ST12.2</span>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Section "Riwayat Kuis Sebelumnya" */}
          <section className="flex flex-col gap-space-sm pt-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-headline-sm font-headline-sm text-on-surface font-semibold">
                Riwayat Kuis Pra-Praktikum
              </h3>
              <span className="text-label-sm font-label-sm text-primary-container font-medium hover:underline cursor-pointer">
                Lihat Semua
              </span>
            </div>
            <div className="bg-surface-container-lowest rounded-xl shadow-sm flex flex-col divide-y divide-surface-container">
              {submissions.map((sub, idx) => (
                <div key={sub.id || idx} className="p-space-md flex items-center justify-between gap-space-sm">
                  <div className="flex flex-col min-w-0">
                    <h4 className="text-body-md font-body-md font-medium text-on-surface truncate">
                      {sub.moduleCode}: {sub.moduleTitle}
                    </h4>
                    <span className="text-code-sm font-code-sm text-on-surface-variant mt-0.5">
                      Selesai • {sub.date}
                    </span>
                    <div className="mt-1">
                      <span className="inline-flex items-center gap-1 text-code-sm font-code-sm bg-tertiary-fixed text-on-tertiary-fixed px-1.5 py-0.5 rounded font-semibold">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        Lulus Kuis
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-headline-md font-headline-md text-primary-container font-semibold">{sub.score}</span>
                    <span className="text-code-sm font-code-sm text-on-surface-variant">/ 100</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Institutional Academic Footer */}
          <footer className="pt-4 pb-2 text-center text-code-sm font-code-sm text-on-surface-variant">
            <p>
              <span style={{ color: 'rgba(68, 71, 78, 0.8)', fontFamily: 'Inter', fontWeight: 600, letterSpacing: '0.55px', textTransform: 'uppercase' }}>
                Departemen Fisika • FMIPA IPB
              </span>
            </p>
            <p className="mt-0.5">
              <span style={{ color: 'rgba(68, 71, 78, 0.6)' }}>
                INSTITUT PERTANIAN BOGOR • BOGOR, INDONESIA
              </span>
            </p>
          </footer>
        </div>
      </main>

      {/* Fixed Bottom Navigation Dock */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_-1px_8px_rgba(0,0,0,0.04)] pb-safe">
        <div className="max-w-lg mx-auto flex items-center justify-around h-14">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 ${activeTab === 'home' ? 'text-primary-container font-medium' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            <span className="text-[11px] font-label-sm">Beranda</span>
          </button>
          <Link
            to={activeModuleConfig.isActive ? `/kuis/${activeModuleConfig.moduleId || activeModuleConfig.setCode.toLowerCase().replace(' ', '-')}` : '#'}
            onClick={(e) => {
              if (!activeModuleConfig.isActive) {
                e.preventDefault();
                alert(`Kuis untuk ${activeModuleConfig.groupLabel} (${activeModuleConfig.targetLabel}) belum diaktifkan oleh asisten laboratorium.`);
              }
            }}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 text-on-surface-variant hover:text-primary-container"
          >
            <span className="material-symbols-outlined text-[20px]">timer</span>
            <span className="text-[11px] font-label-sm">Kuis Aktif</span>
          </Link>
          <button
            type="button"
            onClick={() =>
              alert(
                `Jadwal Resmi Kelas ST12.2:\nSetiap Selasa 15.30 - 17.30 WIB di Lab Fisika Dasar\n${activeModuleConfig.groupLabel} (${activeModuleConfig.targetLabel}): Modul ${activeModuleConfig.setCode} - ${activeModuleConfig.title}\nStatus: ${
                  activeModuleConfig.isActive ? 'Aktif (Dapat Dikerjakan)' : 'Menunggu Aktivasi Asisten Lab'
                }`
              )
            }
            className="flex flex-col items-center justify-center gap-0.5 flex-1 text-on-surface-variant hover:text-primary-container"
          >
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            <span className="text-[11px] font-label-sm">Jadwal</span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 text-on-surface-variant hover:text-error"
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span className="text-[11px] font-label-sm">Keluar</span>
          </button>
        </div>
      </nav>

      {/* Modal Ubah Kata Sandi */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                </div>
                <h3 className="text-title-md font-title-md text-on-surface">Ubah Kata Sandi</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-body-sm text-on-surface-variant mb-4">
              Buat kata sandi baru untuk akun Anda ({currentUser?.nim}).
            </p>

            {passError && (
              <div className="mb-4 p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] shrink-0">check_circle</span>
                <span>{passSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showPassText ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full h-11 px-3 pr-10 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface text-sm focus:outline-none focus:border-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassText(!showPassText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassText ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type={showPassText ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 h-10 rounded-xl border border-outline-variant text-on-surface text-xs font-semibold hover:bg-surface-container"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={passLoading}
                  className="flex-1 h-10 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container disabled:opacity-50 flex items-center justify-center gap-1 shadow-sm"
                >
                  {passLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

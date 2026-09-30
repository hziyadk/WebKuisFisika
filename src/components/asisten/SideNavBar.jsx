import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SideNavBar({ activeTab = 'beranda', onShowToast }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const assistantName = currentUser?.name || 'Ahmad Rozali, S.Si';
  const assistantInitials = assistantName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const handleToast = (msg) => {
    if (onShowToast) {
      onShowToast(msg);
    }
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 flex flex-col justify-between bg-surface-container-lowest border-r border-outline-variant z-30 shrink-0 select-none">
      <div className="p-space-md flex flex-col flex-1 overflow-y-auto">
        {/* Header / Logo */}
        <div className="flex items-center gap-3 px-2 py-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-headline-sm text-headline-sm font-bold shadow-sm shrink-0">
            <span className="material-symbols-outlined text-inverse-primary" style={{ fontSize: '24px' }}>
              science
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight truncate">
              Lab Fisika IPB
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
              Portal Asisten Lab
            </p>
          </div>
        </div>

        {/* Quick Action CTA */}
        <button
          type="button"
          onClick={() => handleToast('Sesi praktikum ST12.2 telah dibuka untuk 16 kelompok.')}
          className="w-full bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md py-2.5 px-space-md rounded-lg flex items-center justify-center gap-2 mb-6 active:scale-[0.99] transition-transform duration-100 shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-inverse-primary" style={{ fontSize: '18px' }}>
            play_arrow
          </span>
          <span>Mulai Sesi Lab</span>
        </button>

        {/* Navigation Links */}
        <div className="space-y-1">
          {/* 1. Beranda */}
          <Link
            to="/asisten/dashboard"
            className={
              activeTab === 'beranda'
                ? 'bg-surface-container-high text-primary font-label-md text-label-md font-semibold rounded-lg px-space-md py-space-sm border-l-2 border-primary flex items-center justify-between transition-colors duration-150 active:scale-[0.99]'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary font-label-md text-label-md rounded-lg px-space-md py-space-sm flex items-center justify-between transition-colors duration-150 active:scale-[0.99]'
            }
          >
            <div className="flex items-center gap-space-sm">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: activeTab === 'beranda' ? "'FILL' 1" : "'FILL' 0" }}
              >
                sensors
              </span>
              <span>Beranda</span>
            </div>
            <span className="font-code-sm text-code-sm bg-error text-on-error px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-on-error animate-pulse"></span>
              Live
            </span>
          </Link>

          {/* 2. Bank Soal/Topik */}
          <Link
            to="/asisten/topik"
            className={
              activeTab === 'topik'
                ? 'bg-surface-container-high text-primary font-label-md text-label-md font-semibold rounded-lg px-space-md py-space-sm border-l-2 border-primary flex items-center gap-space-sm transition-colors duration-150 active:scale-[0.99]'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary font-label-md text-label-md rounded-lg px-space-md py-space-sm flex items-center gap-space-sm transition-colors duration-150 active:scale-[0.99]'
            }
          >
            <span
              className={activeTab === 'topik' ? 'material-symbols-outlined text-primary' : 'material-symbols-outlined'}
              style={{ fontVariationSettings: activeTab === 'topik' ? "'FILL' 1" : "'FILL' 0" }}
            >
              menu_book
            </span>
            <span>Bank Soal/Topik</span>
          </Link>

          {/* 3. Rekapitulasi Nilai */}
          <Link
            to="/asisten/rekap"
            className={
              activeTab === 'rekap'
                ? 'bg-surface-container-high text-primary font-label-md text-label-md font-semibold rounded-lg px-space-md py-space-sm border-l-2 border-primary flex items-center gap-space-sm transition-colors duration-150 active:scale-[0.99]'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary font-label-md text-label-md rounded-lg px-space-md py-space-sm flex items-center gap-space-sm transition-colors duration-150 active:scale-[0.99]'
            }
          >
            <span
              className={activeTab === 'rekap' ? 'material-symbols-outlined text-primary' : 'material-symbols-outlined'}
              style={{ fontVariationSettings: activeTab === 'rekap' ? "'FILL' 1" : "'FILL' 0" }}
            >
              analytics
            </span>
            <span>Rekapitulasi Nilai</span>
          </Link>

          {/* 4. Jadwal Praktikum */}
          <button
            type="button"
            onClick={() => handleToast('Jadwal ST12.2: Setiap Selasa 15.30 - 17.30 WIB')}
            className="text-on-surface-variant hover:bg-surface-container-low hover:text-primary font-label-md text-label-md rounded-lg px-space-md py-space-sm flex items-center gap-space-sm transition-colors duration-150 active:scale-[0.99] w-full text-left cursor-pointer"
          >
            <span className="material-symbols-outlined">calendar_today</span>
            <span>Jadwal Praktikum</span>
          </button>

          {/* 5. Pengaturan */}
          <button
            type="button"
            onClick={() => handleToast('Konfigurasi Monitoring Lab Fisika IPB')}
            className="text-on-surface-variant hover:bg-surface-container-low hover:text-primary font-label-md text-label-md rounded-lg px-space-md py-space-sm flex items-center gap-space-sm transition-colors duration-150 active:scale-[0.99] w-full text-left cursor-pointer"
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Pengaturan</span>
          </button>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-space-md border-t border-outline-variant bg-surface-container-lowest">
        <div className="space-y-1 mb-4">
          <button
            type="button"
            onClick={() => handleToast('Bantuan Proctoring ISO 17025')}
            className="text-on-surface-variant hover:bg-surface-container-low hover:text-primary font-label-md text-label-md rounded-lg px-space-md py-space-sm flex items-center gap-space-sm transition-colors duration-150 w-full text-left cursor-pointer"
          >
            <span className="material-symbols-outlined">help</span>
            <span>Bantuan &amp; Dokumentasi</span>
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/asisten/login');
            }}
            className="text-on-surface-variant hover:bg-surface-container-low hover:text-error font-label-md text-label-md rounded-lg px-space-md py-space-sm flex items-center gap-space-sm transition-colors duration-150 w-full text-left cursor-pointer"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Keluar</span>
          </button>
        </div>

        {/* Profile Assistant Badge */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-container-low border border-outline-variant">
          <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm shrink-0">
            {assistantInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-label-md text-label-md font-semibold text-primary truncate">
              {assistantName}
            </p>
            <p className="font-code-sm text-code-sm text-on-surface-variant truncate">
              {currentUser?.id || 'AST-01'} • Lab Fisika Dasar 1
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

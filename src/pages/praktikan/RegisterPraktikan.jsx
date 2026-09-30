import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPraktikan() {
  const { registerPraktikan } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [nim, setNim] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [groupNumber, setGroupNumber] = useState('1');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !nim.trim() || !email.trim()) {
      setErrorMessage('Mohon lengkapi Nama, NIM, dan Email Resmi IPB Anda.');
      return;
    }

    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setErrorMessage('Konfirmasi Email Resmi tidak cocok.');
      return;
    }

    if (!email.trim().toLowerCase().includes('@apps.ipb.ac.id')) {
      setErrorMessage('Email wajib menggunakan domain resmi @apps.ipb.ac.id.');
      return;
    }

    if (!agreed) {
      setErrorMessage('Anda wajib menyetujui Pakta Integritas & Tata Tertib Laboratorium.');
      return;
    }

    setLoading(true);

    try {
      await registerPraktikan({
        fullName,
        nim,
        email,
        groupNumber: parseInt(groupNumber)
      });
      setTimeout(() => {
        navigate('/');
      }, 700);
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message || 'Gagal mendaftar praktikan.');
    }
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface min-h-screen flex flex-col antialiased selection:bg-primary-fixed selection:text-on-primary-fixed pt-safe pb-safe">
      <main className="flex-1 flex flex-col relative w-full max-w-lg mx-auto bg-surface px-margin-mobile">
        <div className="flex flex-col w-full pb-8">
          {/* Minimalist Laboratory Header / Academic Header */}
          <div className="flex flex-col items-center text-center pt-4 pb-5">
            <div className="w-11 h-11 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-2.5 shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="2.5"></circle>
                <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(30 12 12)"></ellipse>
                <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(90 12 12)"></ellipse>
                <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(150 12 12)"></ellipse>
              </svg>
            </div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
              Laboratorium Fisika Dasar
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Departemen Fisika • IPB University
            </span>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-code-sm text-code-sm font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
              Kelas ST12.2 • T.A. Genap 2024/2025
            </div>
          </div>

          {/* Technical Harmonic Wave Accent (Editorial Precision) */}
          <div className="w-full h-5 mb-4 text-on-surface-variant/30 flex items-center justify-center overflow-hidden">
            <svg className="w-full h-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 360 16">
              <path d="M0,8 Q30,0 60,8 T120,8 T180,8 T240,8 T300,8 T360,8" opacity="0.6"></path>
              <path d="M0,8 Q45,15 90,8 T180,8 T270,8 T360,8" opacity="0.3"></path>
              <line opacity="0.4" strokeDasharray="2 3" x1="0" x2="360" y1="8" y2="8"></line>
            </svg>
          </div>

          {/* Main Card Container */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/40">
            {/* Form Title & Badge */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-primary font-bold tracking-wider">
                PORTAL AKADEMIK
              </span>
              <span className="font-code-sm text-code-sm text-on-surface-variant font-medium">
                DOC-REG/FD-02
              </span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold mt-1">
              Registrasi Praktikan Baru
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
              Daftarkan data diri dan alokasi sesi kelompok praktikum fisika Anda di kelas ST12.2.
            </p>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-3 p-3 rounded-lg bg-error-container text-on-error-container text-body-sm flex items-center gap-2 border border-error/20">
                <span className="material-symbols-outlined text-[18px] text-error">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Progress Indicator */}
            <div className="mt-4 pt-3 pb-2 bg-surface-container-low rounded-lg p-3 border border-outline-variant/40">
              <div className="flex items-center justify-between text-body-sm mb-2">
                <span className="font-label-md text-label-md font-semibold text-primary">Progres Registrasi</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">Langkah 1 dari 2</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* Step 1 */}
                <div className="flex items-center gap-2 p-1.5 rounded bg-surface-container-lowest shadow-sm border border-outline-variant/30">
                  <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center font-code-sm text-code-sm font-semibold">1</span>
                  <div className="min-w-0">
                    <p className="font-label-sm text-label-sm font-bold text-primary truncate">Identitas Diri</p>
                    <p className="font-code-sm text-code-sm text-secondary-container truncate font-medium">Sedang Diisi</p>
                  </div>
                </div>
                {/* Step 2 */}
                <div className="flex items-center gap-2 p-1.5 rounded bg-surface-container/60 opacity-80">
                  <span className="w-5 h-5 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-code-sm text-code-sm font-semibold">2</span>
                  <div className="min-w-0">
                    <p className="font-label-sm text-label-sm font-medium text-on-surface-variant truncate">Sesi & Konfirmasi</p>
                    <p className="font-code-sm text-code-sm text-on-surface-variant/70 truncate">Verifikasi</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <form className="mt-5 space-y-4" onSubmit={handleRegister}>
              {/* 1. Full Name */}
              <div>
                <label className="block font-label-md text-label-md font-medium text-on-surface mb-1" htmlFor="fullName">
                  Nama Lengkap Mahasiswa <span className="text-error">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-on-surface-variant pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="cth. Muhammad Fadhil"
                    className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-colors border border-outline-variant/60"
                    required
                  />
                </div>
              </div>

              {/* 2. NIM */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-label-md text-label-md font-medium text-on-surface" htmlFor="nim">
                    Nomor Induk Mahasiswa (NIM) <span className="text-error">*</span>
                  </label>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">9 Karakter</span>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-on-surface-variant pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <rect height="16" rx="2" width="18" x="3" y="4"></rect>
                      <line x1="7" x2="17" y1="8" y2="8"></line>
                      <line x1="7" x2="13" y1="12" y2="12"></line>
                    </svg>
                  </span>
                  <input
                    id="nim"
                    type="text"
                    maxLength={9}
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    placeholder="cth. G64190001"
                    className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low text-body-md font-code-md text-on-surface uppercase placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-colors border border-outline-variant/60"
                    required
                  />
                </div>
              </div>

              {/* 3. Official IPB Email */}
              <div>
                <label className="block font-label-md text-label-md font-medium text-on-surface mb-1" htmlFor="email">
                  Email Resmi IPB (@apps.ipb.ac.id) <span className="text-error">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-on-surface-variant pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <rect height="16" rx="2" width="20" x="2" y="4"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@apps.ipb.ac.id"
                    className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-colors border border-outline-variant/60"
                    required
                  />
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Wajib menggunakan domain resmi @apps.ipb.ac.id
                </p>
              </div>

              {/* 4. Email Confirmation */}
              <div>
                <label className="block font-label-md text-label-md font-medium text-on-surface mb-1" htmlFor="confirmEmail">
                  Konfirmasi Email Resmi <span className="text-error">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-on-surface-variant pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </span>
                  <input
                    id="confirmEmail"
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder="Ketik ulang email @apps.ipb.ac.id"
                    className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-colors border border-outline-variant/60"
                    required
                  />
                </div>
              </div>

              {/* 5. Group & Class Allocation (16 Groups of ST12.2) */}
              <div>
                <label className="block font-label-md text-label-md font-medium text-on-surface mb-1" htmlFor="classGroup">
                  Kelompok Praktikum (Kelas ST12.2 • Selasa 15.30 - 17.30) <span className="text-error">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-on-surface-variant pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
                      <path d="M6 6h10"></path>
                      <path d="M6 10h10"></path>
                    </svg>
                  </span>
                  <select
                    id="classGroup"
                    value={groupNumber}
                    onChange={(e) => setGroupNumber(e.target.value)}
                    className="w-full h-10 pl-9 pr-8 rounded-lg bg-surface-container-low text-body-md font-body-md text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none appearance-none transition-colors cursor-pointer border border-outline-variant/60"
                  >
                    {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => {
                      const isC1toC8 = num <= 8;
                      const setInfo = isC1toC8 ? 'Set 1 (P04: GLB/GLBB)' : 'Set 2 (P05: Hukum Newton)';
                      return (
                        <option key={num} value={num}>
                          Kelompok C{num} • Lab 1 • {setInfo}
                        </option>
                      );
                    })}
                  </select>
                  <span className="absolute right-3 text-on-surface-variant pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer accent-primary"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                    Saya menyetujui <span className="text-primary font-semibold underline underline-offset-2">Pakta Integritas</span> & Tata Tertib Keselamatan Laboratorium Fisika IPB.
                  </span>
                </label>
              </div>

              {/* Main Action Button */}
              <div className="pt-2">
                <button
                  id="btnSubmit"
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-2 active:scale-[0.99] transition-all shadow-sm cursor-pointer disabled:opacity-70 font-semibold"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      <span>Mendaftarkan Praktikan...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar sebagai Praktikan</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="5" x2="19" y1="12" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Return to Login Link */}
            <div className="mt-4 pt-3 text-center bg-surface-container-low/50 rounded-lg p-2.5 border border-outline-variant/30">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Sudah memiliki akun atau terdaftar?{' '}
                <Link to="/login" className="text-primary font-bold hover:underline ml-0.5">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>

          {/* Institutional Footer */}
          <footer className="mt-6 text-center">
            <p className="font-label-sm text-label-sm tracking-wider text-on-surface-variant/80 font-bold uppercase">
              Departemen Fisika • FMIPA IPB
            </p>
            <p className="font-code-sm text-code-sm text-on-surface-variant/60 mt-0.5">
              INSTITUT PERTANIAN BOGOR • BOGOR, INDONESIA
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

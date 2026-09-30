import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStudentByNim } from '../../services/mockData';

export default function LoginPraktikan() {
  const { loginPraktikan, changePraktikanPassword } = useAuth();
  const navigate = useNavigate();

  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showRegDialog, setShowRegDialog] = useState(false);

  // Change Password Modal States
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [pendingStudent, setPendingStudent] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changePassError, setChangePassError] = useState('');
  const [changePassLoading, setChangePassLoading] = useState(false);

  const detectedStudent = getStudentByNim(nim);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanNim = nim.trim().toUpperCase();
    const cleanPassword = password.trim();

    if (!cleanNim || !cleanPassword) {
      setErrorMessage('Mohon masukkan NIM dan kata sandi Anda.');
      return;
    }

    setLoading(true);

    try {
      const user = await loginPraktikan(cleanNim, cleanPassword);
      setLoading(false);

      if (user.mustChangePassword) {
        setPendingStudent(user);
        setShowChangeModal(true);
        setNewPassword('');
        setConfirmPassword('');
        setChangePassError('');
      } else {
        navigate('/');
      }
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message || 'Gagal masuk. Periksa kembali NIM dan kata sandi Anda.');
    }
  };

  const handleSaveNewPassword = async (e) => {
    e.preventDefault();
    setChangePassError('');

    if (!newPassword || newPassword.length < 4) {
      setChangePassError('Kata sandi baru minimal 4 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePassError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    const defaultWord = pendingStudent?.name ? pendingStudent.name.trim().split(/\s+/)[0] : '';
    if (defaultWord && newPassword.toLowerCase() === defaultWord.toLowerCase()) {
      setChangePassError('Kata sandi baru tidak boleh sama dengan kata sandi awal (nama depan).');
      return;
    }

    setChangePassLoading(true);

    try {
      await changePraktikanPassword(pendingStudent?.nim, newPassword);
      setChangePassLoading(false);
      setShowChangeModal(false);
      navigate('/');
    } catch (err) {
      setChangePassLoading(false);
      setChangePassError(err.message || 'Gagal memperbarui kata sandi.');
    }
  };

  const handleDemoFill = (demoNim, demoPass) => {
    setNim(demoNim);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface min-h-screen flex flex-col antialiased selection:bg-primary-fixed selection:text-on-primary-fixed pt-safe pb-safe">
      <main className="flex-1 flex flex-col relative w-full max-w-lg mx-auto bg-surface px-margin-mobile">
        <div className="flex flex-col w-full pb-8">
          
          {/* Header */}
          <div className="w-full relative overflow-hidden pt-4 pb-6 px-1">
            <div className="w-full flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24">
                    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(45 12 12)"></ellipse>
                    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-45 12 12)"></ellipse>
                    <circle cx="12" cy="12" fill="currentColor" r="1.5"></circle>
                  </svg>
                </div>
                <div>
                  <span className="font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant block">
                    Laboratorium Fisika ST
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary leading-tight font-semibold">
                    IPB University
                  </span>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded bg-surface-container text-on-surface-variant font-code-sm text-code-sm">
                Genap 2024/2025
              </div>
            </div>
          </div>

          {/* Form Card Container */}
          <div className="w-full bg-surface-container-lowest rounded-xl p-5 shadow-sm space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-headline-md text-headline-md text-primary font-semibold">
                  Masuk Sebagai Praktikan
                </h1>
                <span className="font-code-sm text-code-sm bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">
                  PORTAL
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Gunakan NIM sebagai username dan kata pertama nama Anda sebagai kata sandi awal.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-error-container text-on-error-container text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-error">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Quick Demo Fill Helper with Authentic Students */}
            <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col gap-1.5 text-code-sm text-on-surface-variant">
              <div className="flex items-center justify-between text-xs font-medium">
                <span>Demo Akun Praktikan:</span>
                <span className="text-[10px] text-outline font-normal">Klik untuk uji coba</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDemoFill('G4401261088', 'Affan')}
                  className="px-2 py-1.5 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary text-left text-[11px] font-medium transition-colors"
                >
                  <div className="text-primary font-bold">C1: Affan Kurniawan</div>
                  <div className="text-[10px] text-on-surface-variant font-mono">Pass: Affan</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('E2401261058', 'Chesya')}
                  className="px-2 py-1.5 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary text-left text-[11px] font-medium transition-colors"
                >
                  <div className="text-primary font-bold">C3: Chesya Anandita</div>
                  <div className="text-[10px] text-on-surface-variant font-mono">Pass: Chesya</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('D3401261057', 'Ardita')}
                  className="px-2 py-1.5 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary text-left text-[11px] font-medium transition-colors"
                >
                  <div className="text-primary font-bold">C9: Ardita Zia</div>
                  <div className="text-[10px] text-on-surface-variant font-mono">Pass: Ardita</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('G4401261016', 'Ahmad')}
                  className="px-2 py-1.5 rounded bg-surface-container-lowest border border-outline-variant hover:border-primary text-left text-[11px] font-medium transition-colors"
                >
                  <div className="text-primary font-bold">C16: Ahmad Faza</div>
                  <div className="text-[10px] text-on-surface-variant font-mono">Pass: Ahmad</div>
                </button>
              </div>
            </div>

            <form className="space-y-4" id="loginForm" onSubmit={handleSubmit}>
              {/* Field NIM */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="nimInput">
                    Nomor Induk Mahasiswa (NIM)
                  </label>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-on-surface-variant pointer-events-none flex items-center">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                  </span>
                  <input
                    id="nimInput"
                    type="text"
                    autoComplete="username"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    placeholder="Contoh: G4401261088"
                    className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none transition-colors"
                    required
                  />
                </div>

                {/* Live Detected Student Pill */}
                {detectedStudent && (
                  <div className="mt-1 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex flex-col gap-0.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-emerald-600 text-[16px]">verified</span>
                        <span className="font-semibold">{detectedStudent.name}</span>
                      </div>
                      <span className="font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[11px]">
                        Kelompok C{detectedStudent.groupNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-700 pl-5">
                      Kata sandi awal: <span className="font-mono font-bold bg-emerald-100 px-1 rounded">{detectedStudent.defaultPassword}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Field Kata Sandi */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md text-on-surface font-medium block" htmlFor="pwdInput">
                    Kata Sandi
                  </label>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-on-surface-variant pointer-events-none flex items-center">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                  </span>
                  <input
                    id="pwdInput"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kata sandi (Default: nama depan Anda)"
                    className="w-full h-10 pl-9 pr-10 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Tampilkan atau sembunyikan kata sandi"
                    className="absolute right-2.5 text-on-surface-variant hover:text-on-surface flex items-center justify-center p-1 rounded focus:outline-none"
                    id="togglePwd"
                  >
                    <span className="material-symbols-outlined text-[18px]" id="eyeIcon">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <p className="font-body-sm text-xs text-on-surface-variant flex items-center gap-1 pt-0.5">
                  <span className="material-symbols-outlined text-[14px] text-outline">key</span>
                  <span>
                    Login awal: gunakan kata pertama nama Anda (contoh:{' '}
                    <span className="font-mono font-semibold text-primary">
                      {detectedStudent ? detectedStudent.defaultPassword : 'Affan'}
                    </span>
                    ).
                  </span>
                </p>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-surface-container-low text-primary accent-primary cursor-pointer"
                  />
                  <span className="font-label-md text-label-md text-on-surface-variant">Ingat di perangkat ini</span>
                </label>
                <span className="font-code-sm text-code-sm text-outline">v2.4-lab</span>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  id="btnSubmit"
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-primary text-on-primary rounded-lg font-label-md text-label-md tracking-wide flex items-center justify-center gap-2 hover:bg-primary-container active:scale-[0.99] transition-transform duration-75 font-medium shadow-sm cursor-pointer disabled:opacity-75"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin inline-block"></span>
                      <span>Memverifikasi Praktikan...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Portal Kuis</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>

              {/* Registration Link */}
              <div className="text-center pt-2">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Belum terdaftar dalam kelompok? </span>
                <button
                  type="button"
                  onClick={() => setShowRegDialog(true)}
                  className="font-body-sm text-body-sm text-primary font-medium underline underline-offset-2 hover:text-primary-container focus:outline-none"
                >
                  Daftar di sini
                </button>
              </div>
            </form>
          </div>

          {/* Academic Safety Procedure Card */}
          <div className="mt-4 w-full bg-surface-container-low rounded-lg p-3.5 flex items-start gap-2.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5 shrink-0">timer</span>
            <div className="space-y-0.5">
              <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide font-semibold block">Prosedur Keamanan Akademik</span>
              <p className="font-body-sm text-body-sm leading-snug">
                Kuis pra-praktikum wajib diselesaikan maksimal 60 menit sebelum sesi laboratorium dijadwalkan dimulai. Nilai ambang batas kelulusan modul adalah 75.
              </p>
            </div>
          </div>

          {/* Assistant Portal Link */}
          <div className="mt-3 px-1 flex items-center justify-between text-body-sm">
            <span className="text-on-surface-variant">Asisten Laboratorium?</span>
            <Link to="/asisten/login" className="text-primary font-medium hover:underline flex items-center gap-1">
              Portal Asisten Lab →
            </Link>
          </div>

          {/* Institutional Academic Footer */}
          <div className="mt-4 pt-3 flex flex-col items-center text-center space-y-1">
            <div className="flex items-center gap-2 text-outline font-code-sm text-code-sm">
              <span>DEPARTEMEN FISIKA</span>
              <span>•</span>
              <span>FMIPA IPB</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              <span style={{ color: 'rgba(68, 71, 78, 0.6)', fontFamily: 'JetBrains Mono', fontSize: '11px', letterSpacing: 'normal' }}>
                INSTITUT PERTANIAN BOGOR • BOGOR, INDONESIA
              </span>
            </p>
          </div>

          {/* Registration Notice Dialog Modal */}
          <div
            id="regDialog"
            className={`fixed inset-x-4 bottom-6 max-w-sm mx-auto bg-inverse-surface text-inverse-on-surface p-4 rounded-xl shadow-lg z-50 transition-all duration-200 ${
              showRegDialog
                ? 'opacity-100 pointer-events-auto translate-y-0'
                : 'opacity-0 pointer-events-none translate-y-3'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-tertiary-fixed">
                  <span className="material-symbols-outlined text-[16px]">school</span>
                  <span className="font-label-sm text-label-sm uppercase font-semibold">Pendaftaran Praktikan</span>
                </div>
                <p className="font-body-sm text-body-sm text-inverse-on-surface opacity-90 leading-tight">
                  Sinkronisasi akun dilakukan otomatis dari SIMAK IPB. Hubungi Pranata Lab jika NIM kamu belum terindeks atau{' '}
                  <Link to="/register" className="text-tertiary-fixed font-semibold underline">
                    buka formulir pendaftaran manual
                  </Link>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRegDialog(false)}
                className="text-inverse-on-surface opacity-70 hover:opacity-100 p-1 focus:outline-none"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL GANTI KATA SANDI AWAL (FIRST LOGIN) */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-scaleUp">
            {/* Header Modal */}
            <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/60">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">lock_reset</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
                  Buat Kata Sandi Baru
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Ganti kata sandi awal Anda demi keamanan akun praktikum
                </p>
              </div>
            </div>

            {/* Student Info Card */}
            <div className="my-4 p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-on-surface">{pendingStudent?.name}</div>
                <div className="text-on-surface-variant font-mono">{pendingStudent?.nim} • Kelas ST12.2</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-bold text-[11px]">
                {pendingStudent?.groupLabel || `Kelompok C${pendingStudent?.groupNumber}`}
              </span>
            </div>

            {changePassError && (
              <div className="mb-3 p-2.5 rounded-lg bg-error-container text-on-error-container text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-error">error</span>
                <span>{changePassError}</span>
              </div>
            )}

            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface block">
                  Kata Sandi Baru
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-on-surface-variant pointer-events-none flex items-center">
                    <span className="material-symbols-outlined text-[18px]">key</span>
                  </span>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full h-10 pl-9 pr-10 rounded-lg bg-surface-container-low text-on-surface text-sm border border-outline-variant focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-colors"
                    required
                    minLength={4}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 text-on-surface-variant hover:text-on-surface p-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showNewPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface block">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-on-surface-variant pointer-events-none flex items-center">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  </span>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low text-on-surface text-sm border border-outline-variant focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-colors"
                    required
                    minLength={4}
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={changePassLoading}
                  className="w-full h-10 bg-primary text-on-primary rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary-container active:scale-[0.99] transition-all cursor-pointer shadow-sm disabled:opacity-75"
                >
                  {changePassLoading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></span>
                      <span>Menyimpan Kata Sandi...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>Simpan &amp; Lanjut ke Kuis</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

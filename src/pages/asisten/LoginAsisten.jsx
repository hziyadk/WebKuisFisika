import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_ASSISTANTS } from '../../services/mockData';

export default function LoginAsisten() {
  const { loginAsisten } = useAuth();
  const navigate = useNavigate();

  const [assistantId, setAssistantId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [serverTime, setServerTime] = useState('');

  // Live Server Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setServerTime(`${h}:${m}:${s} WIB`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!assistantId.trim() || !password) {
      setErrorMessage('Mohon lengkapi ID/Email Asisten dan Kata Sandi.');
      return;
    }

    setLoading(true);

    try {
      await loginAsisten(assistantId, password);
      setTimeout(() => {
        navigate('/asisten/dashboard');
      }, 700);
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message || 'Kredensial tidak valid. Hanya 2 Asisten yang diotorisasi.');
    }
  };

  const handleQuickFill = (ast) => {
    setAssistantId(ast.id);
    setPassword(ast.password);
    setErrorMessage('');
  };

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen">
      <main className="w-full min-h-screen flex flex-col justify-center">
        <div className="w-full min-h-screen flex flex-col lg:flex-row bg-surface-container-lowest overflow-hidden">
          
          {/* Panel Kiri: 45% Branding Panel Formal & Presisi Fisika (PC View) */}
          <section className="w-full lg:w-[45%] bg-primary text-on-primary flex flex-col justify-between p-8 lg:p-12 relative overflow-hidden shrink-0">
            {/* Minimalist Optical/Wave Vector Backdrop Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
              <svg className="w-full h-full text-surface" fill="none" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
                <circle cx="300" cy="300" r="260" stroke="currentColor" strokeDasharray="4 6" strokeWidth="0.75"></circle>
                <circle cx="300" cy="300" r="190" stroke="currentColor" strokeWidth="0.75"></circle>
                <circle cx="300" cy="300" r="120" stroke="currentColor" strokeDasharray="2 4" strokeWidth="0.5"></circle>
                <line stroke="currentColor" strokeWidth="0.75" x1="40" x2="560" y1="300" y2="300"></line>
                <line stroke="currentColor" strokeWidth="0.75" x1="300" x2="300" y1="40" y2="560"></line>
                <path d="M 40 300 Q 170 120, 300 300 T 560 300" fill="none" stroke="currentColor" strokeWidth="1.2"></path>
                <path d="M 40 300 Q 170 480, 300 300 T 560 300" fill="none" stroke="currentColor" strokeDasharray="3 3" strokeWidth="1.2"></path>
                <path d="M 40 300 Q 105 210, 170 300 T 300 300 T 430 300 T 560 300" fill="none" stroke="currentColor" strokeWidth="0.75"></path>
                <circle cx="170" cy="300" fill="currentColor" r="3"></circle>
                <circle cx="300" cy="300" fill="currentColor" r="3"></circle>
                <circle cx="430" cy="300" fill="currentColor" r="3"></circle>
              </svg>
            </div>

            {/* Top Header / Institutional Mark */}
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-primary-container flex items-center justify-center text-primary-fixed shadow-sm">
                  <span className="material-symbols-outlined text-body-lg">science</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-code-sm text-code-sm tracking-wider uppercase text-on-primary-container font-semibold">IPB University</span>
                  <span className="font-label-sm text-label-sm font-bold tracking-widest text-surface-bright uppercase">Departemen Fisika • FMIPA</span>
                </div>
              </div>
            </div>

            {/* Central Context & System Identity */}
            <div className="relative z-10 my-10 lg:my-0 flex flex-col gap-6">
              {/* Server Time Pill */}
              <div className="inline-flex items-center gap-2 self-start px-3.5 py-2 rounded-full bg-primary-container text-surface-bright border border-outline-variant/30 shadow-sm">
                <span className="material-symbols-outlined text-label-md text-tertiary-fixed">schedule</span>
                <span className="font-code-sm text-code-sm font-semibold tracking-wide">
                  Waktu Server: {serverTime} • ST12.2
                </span>
              </div>

              {/* Academic Spec Card */}
              <div className="p-4 rounded-xl bg-primary-container/80 border border-outline-variant/30 backdrop-blur-sm space-y-2">
                <div className="flex items-center justify-between text-code-sm text-on-primary-container font-semibold">
                  <span>OTORITAS AKSES KHUSUS</span>
                  <span className="text-secondary-fixed">2 ASISTEN TERDAFTAR</span>
                </div>
                <div className="text-body-sm text-surface-bright/90 space-y-1">
                  <p>• <strong>Asisten 1:</strong> Ahmad Rozali, S.Si (AST-01)</p>
                  <p>• <strong>Asisten 2:</strong> Siti Nurhaliza, S.Si (AST-02)</p>
                  <p className="text-xs text-on-primary-container pt-1">
                    Pengawasan: Kelompok C1 s.d. C16 • Pertemuan Ke-5
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Spacer */}
            <div className="relative z-10"></div>
          </section>

          {/* Panel Kanan: 55% Authentication Console Form */}
          <section className="w-full lg:w-[55%] bg-surface flex flex-col justify-center items-center p-6 sm:p-10 lg:p-14 overflow-y-auto">
            {/* Box / Kotak Area Fitur Login */}
            <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <div className="self-start">
                  <span className="font-code-sm text-code-sm uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-surface-container-high text-on-primary-fixed-variant">
                    Login Otorisasi Asisten
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
                  Login Asisten
                </h2>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-error-container text-on-error-container text-body-sm flex items-center gap-2 border border-error/20">
                  <span className="material-symbols-outlined text-[18px] text-error">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Quick Fill Demo Assist */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-col gap-2">
                <span className="text-code-sm font-semibold text-primary">Pilih Akun Asisten (Demo Cepat):</span>
                <div className="grid grid-cols-2 gap-2">
                  {DEFAULT_ASSISTANTS.map((ast) => (
                    <button
                      key={ast.id}
                      type="button"
                      onClick={() => handleQuickFill(ast)}
                      className="px-2.5 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant hover:border-primary text-left transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span className="w-6 h-6 rounded bg-primary-container text-on-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {ast.avatarInitials}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-primary truncate">{ast.name.split(',')[0]}</p>
                        <p className="text-[10px] text-outline font-code-sm">{ast.id}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Login Form */}
              <form className="flex flex-col gap-5" onSubmit={handleAuthSubmit}>
                {/* Field Identifier */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface flex items-center justify-between" htmlFor="assistant-id">
                    <span>Email Resmi atau ID Asisten <span className="text-error font-bold">*</span></span>
                    <span className="font-code-sm text-code-sm text-on-surface-variant font-normal">AST-01 / AST-02</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-on-surface-variant pointer-events-none flex items-center">
                      <span className="material-symbols-outlined text-headline-sm">badge</span>
                    </span>
                    <input
                      id="assistant-id"
                      type="text"
                      value={assistantId}
                      onChange={(e) => setAssistantId(e.target.value)}
                      placeholder="asisten1@apps.ipb.ac.id atau AST-01"
                      className="w-full h-11 pl-11 pr-4 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg shadow-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-150 border border-outline-variant/60"
                      required
                    />
                  </div>
                </div>

                {/* Field Password */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-label-md text-label-md text-on-surface font-medium" htmlFor="assistant-password">
                      Kata Sandi <span className="text-error font-bold">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Untuk pengaturan ulang kata sandi asisten, silakan melapor ke Penanggung Jawab IT Lab Fisika di Sekretariat Wing.')}
                      className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors focus:outline-none underline-offset-4 hover:underline cursor-pointer"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-on-surface-variant pointer-events-none flex items-center">
                      <span className="material-symbols-outlined text-headline-sm">key</span>
                    </span>
                    <input
                      id="assistant-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      className="w-full h-11 pl-11 pr-11 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg shadow-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-150 border border-outline-variant/60"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Tampilkan sandi"
                      className="absolute right-3.5 text-on-surface-variant hover:text-on-surface transition-colors flex items-center focus:outline-none cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-headline-sm">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer accent-primary"
                    />
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Ingat kredensial di stasiun kerja lab ini
                    </span>
                  </label>
                </div>

                {/* Submit CTA */}
                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 mt-2 px-5 bg-primary text-on-primary font-headline-sm text-headline-sm font-bold rounded-lg shadow-md hover:bg-primary-container active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined text-body-lg animate-spin">progress_activity</span>
                      <span>Memverifikasi Kredensial Asisten...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-body-lg text-primary-fixed">lock_open</span>
                      <span>Masuk sebagai Asisten</span>
                      <span className="material-symbols-outlined text-body-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

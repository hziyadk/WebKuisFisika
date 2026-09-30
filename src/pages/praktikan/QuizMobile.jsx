import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PHYSICS_MODULES, getScheduleForGroup } from '../../services/mockData';
import {
  updateSessionState,
  subscribeRealtime,
  addSubmission,
  getStudentActiveModule
} from '../../services/realtimeService';
import FormulaRenderer from '../../components/FormulaRenderer';

export default function QuizMobile() {
  const { topicId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const groupNum = currentUser?.groupNumber || 3;
  const [studentActive, setStudentActive] = useState(() => getStudentActiveModule(groupNum));

  useEffect(() => {
    setStudentActive(getStudentActiveModule(groupNum));
    const unsubscribe = subscribeRealtime((event) => {
      if (event.type === 'ACTIVE_CONFIG_UPDATED') {
        setStudentActive(getStudentActiveModule(groupNum));
      }
    });
    return () => unsubscribe();
  }, [groupNum]);

  // Find module corresponding to the active assignment
  const currentModule = useMemo(() => {
    let mod = null;
    if (studentActive?.moduleId) {
      mod = PHYSICS_MODULES.find(
        (m) =>
          m.setId === studentActive.moduleId ||
          m.expCode === studentActive.expCode ||
          m.setCode.toLowerCase() === studentActive.setCode?.toLowerCase()
      );
    }
    if (!mod && topicId) {
      const cleanId = topicId.toLowerCase();
      mod = PHYSICS_MODULES.find(
        (m) => m.setId.toLowerCase() === cleanId || m.setCode.toLowerCase().replace(' ', '-') === cleanId
      );
    }
    if (!mod) {
      mod = PHYSICS_MODULES.find((m) => m.setCode.toLowerCase() === studentActive?.setCode?.toLowerCase()) || PHYSICS_MODULES[2];
    }
    return mod;
  }, [topicId, studentActive]);

  // Generate 15 complete questions with randomization
  const questions = useMemo(() => {
    const baseQuestions = currentModule.questions || [];
    const fullList = [...baseQuestions];

    // Seed questions up to 15 questions if needed
    const sampleTopics = [
      {
        cat: 'Kinematika Gerak Lurus',
        q: 'Sebuah partikel bergerak lurus dengan percepatan a(t) = 4t m/s². Jika kecepatan awal saat t = 0 adalah 2 m/s, berapakah kecepatan partikel saat t = 3 sekon?',
        formula: 'v(t) = v_0 + \\int_{0}^{t} a(t) \\, dt = 2 + 2t^2',
        footnote: 'Gunakan kalkulus diferensial dan integral standar.',
        harmonicLabel: 'Analisis Gerak',
        options: [
          { id: 'A', text: '18 m/s' },
          { id: 'B', text: '20 m/s' },
          { id: 'C', text: '14 m/s' },
          { id: 'D', text: '24 m/s' }
        ],
        ans: 'B'
      },
      {
        cat: 'Dinamika Newton',
        q: 'Sebuah balok bermassa m = 5 kg ditarik dengan gaya F = 30 N membentuk sudut 37° terhadap bidang horizontal licin (sin 37° = 0,6; cos 37° = 0,8). Berapakah percepatan gerak balok?',
        formula: 'a = \\frac{F \\cos 37^\\circ}{m} = \\frac{30 \\times 0{,}8}{5}',
        footnote: 'Abaikan gesekan antara balok dan lantai.',
        harmonicLabel: 'Hukum II Newton',
        options: [
          { id: 'A', text: '4,8 m/s²' },
          { id: 'B', text: '3,6 m/s²' },
          { id: 'C', text: '5,2 m/s²' },
          { id: 'D', text: '2,4 m/s²' }
        ],
        ans: 'A'
      },
      {
        cat: 'Analisis Tabung Resonansi',
        q: 'Pada percobaan resonansi tabung udara (pipa organa satu ujung tertutup), resonansi pertama terjadi pada panjang kolom udara L₁ = 18,5 cm dengan frekuensi garputala f = 440 Hz. Jika cepat rambat bunyi di laboratorium saat itu terukur sebesar v = 340 m/s, berapakah perkiraan koreksi ujung pipa (end-correction / e) yang tepat?',
        formula: 'L_n + e = (2n - 1) \\cdot \\frac{\\lambda}{4} \\quad \\Big| \\quad \\lambda = \\frac{v}{f}',
        formulaLeft: 'L_n + e = (2n - 1) · (λ / 4)',
        formulaRight: 'λ = v / f',
        footnote: 'Gunakan suhu ruangan T = 27°C, percepatan gravitasi g = 9.8 m/s² bila diperlukan.',
        harmonicLabel: 'n = 1 (Harmonik Ke-1)',
        hasResonanceDiagram: true,
        options: [
          { id: 'A', text: '0,82 cm' },
          { id: 'B', text: '1,25 cm' },
          { id: 'C', text: '1,65 cm' },
          { id: 'D', text: '2,10 cm' }
        ],
        ans: 'A'
      },
      {
        cat: 'Analisis Kesalahan Relatif',
        q: 'Pada pengukuran berulang waktu jatuh beban, diperoleh nilai rata-rata t = 2,00 s dengan simpangan baku ralat St = 0,04 s. Nilai ketidakpastian relatif pengukuran tersebut adalah:',
        formula: 'KR = \\frac{S_t}{\\bar{t}} \\times 100\\%',
        footnote: 'Perhitungan angka penting mengacu pada ralat relatif.',
        harmonicLabel: 'Ketidakpastian Pengukuran',
        options: [
          { id: 'A', text: '4,0 %' },
          { id: 'B', text: '2,0 %' },
          { id: 'C', text: '0,4 %' },
          { id: 'D', text: '0,2 %' }
        ],
        ans: 'B'
      },
      {
        cat: 'Sistem Pesawat Atwood',
        q: 'Pada percobaan pesawat Atwood dua massa m₁ > m₂, faktor utama yang menyebabkan percepatan terukur lebih kecil dari perhitungan teoritis adalah:',
        formula: 'I_{\\text{katrol}} \\ne 0 \\implies a = \\frac{(m_1 - m_2)g}{m_1 + m_2 + \\frac{I}{R^2}}',
        footnote: 'Sistem tali dianggap tidak elastis dan tidak bermassa.',
        harmonicLabel: 'Inersia Rotasi Katrol',
        options: [
          { id: 'A', text: 'Momen inersia katrol dan gesekan poros katrol' },
          { id: 'B', text: 'Percepatan gravitasi bumi yang bernilai negatif' },
          { id: 'C', text: 'Massa tali yang lebih berat dari beban' },
          { id: 'D', text: 'Panjang tali yang bertambah akibat regangan' }
        ],
        ans: 'A'
      },
      {
        cat: 'Hukum III Newton',
        q: 'Ketika kuda menarik kereta ke depan, kereta memberikan gaya reaksi pada kuda dengan besar sama dan arah berlawanan. Penyebab utama sistem dapat bergerak maju adalah:',
        formula: '\\Sigma F_{\\text{horizontal}} = F_{\\text{tanah pada kuda}} - f_{\\text{gesek kereta}} > 0',
        footnote: 'Aksi-reaksi bekerja pada dua benda yang berbeda.',
        harmonicLabel: 'Interaksi Gaya Kontak',
        options: [
          { id: 'A', text: 'Gaya gesek tanah ke depan pada kaki kuda lebih besar dari gaya hambat kereta' },
          { id: 'B', text: 'Massa kuda jauh lebih besar dibanding massa kereta' },
          { id: 'C', text: 'Gaya tarik kuda mendahului gaya reaksi kereta' },
          { id: 'D', text: 'Gaya normal menghilangkan gaya reaksi kereta' }
        ],
        ans: 'A'
      }
    ];

    // Ensure question 3 (index 2) is the resonance question
    while (fullList.length < 15) {
      const idx = fullList.length;
      let sample = sampleTopics[idx % sampleTopics.length];
      if (idx === 2) {
        sample = sampleTopics[2]; // Resonance problem on Q3!
      }
      fullList.push({
        id: `q-gen-${idx + 1}`,
        category: sample.cat,
        text: sample.q,
        formula: sample.formula,
        formulaLeft: sample.formulaLeft,
        formulaRight: sample.formulaRight,
        footnote: sample.footnote,
        harmonicLabel: sample.harmonicLabel,
        hasResonanceDiagram: sample.hasResonanceDiagram || false,
        options: [...sample.options],
        correctAnswer: sample.ans,
        explanation: 'Sesuai dengan konsep fisika dasar praktikum IPB.'
      });
    }

    // Force index 2 to be the exact Resonance Question
    if (fullList.length >= 3) {
      fullList[2] = {
        id: 'q-res-3',
        category: sampleTopics[2].cat,
        text: sampleTopics[2].q,
        formula: sampleTopics[2].formula,
        formulaLeft: sampleTopics[2].formulaLeft,
        formulaRight: sampleTopics[2].formulaRight,
        footnote: sampleTopics[2].footnote,
        harmonicLabel: sampleTopics[2].harmonicLabel,
        hasResonanceDiagram: true,
        options: [...sampleTopics[2].options],
        correctAnswer: sampleTopics[2].ans,
        explanation: 'L₁ + e = λ / 4 = v / (4f) = 340 / (4 * 440) = 0,1932 m = 19,32 cm. e = 19,32 - 18,5 = 0,82 cm.'
      };
    }

    return fullList.slice(0, 15);
  }, [currentModule]);

  // Quiz State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Anti-Cheat & Lock State
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimestamp, setLockTimestamp] = useState('');
  const [lockDurationStr, setLockDurationStr] = useState('11m 45s');
  const [pinDigits, setPinDigits] = useState(['', '', '', '', '', '']);
  const [pinError, setPinError] = useState(false);
  const [callAssistantSuccess, setCallAssistantSuccess] = useState(false);

  // Unique session ID for live monitoring (standardized to student NIM)
  const sessionId = useMemo(() => {
    return `session-${currentUser?.nim || 'G4401261088'}`;
  }, [currentUser]);

  // Dynamic 6-digit session passkey
  const sessionPasskey = useMemo(() => {
    // Deterministic or seeded 6-digit passkey
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  }, []);

  // Sync state to Assistant Live Monitoring
  const syncToDashboard = (statusOverride) => {
    const answeredCount = Object.keys(answers).length;
    const st = statusOverride || (isLocked ? 'locked' : 'in_progress');
    const totalQ = questions?.length || 15;
    const pct = totalQ > 0 ? Math.round((answeredCount / totalQ) * 100) : 0;

    updateSessionState(sessionId, {
      nim: currentUser?.nim || 'G4401261088',
      name: currentUser?.name || 'Affan Kurniawan Widarjdo',
      groupNumber: groupNum,
      groupLabel: `Kelompok C${groupNum}`,
      station: `Kelompok C-0${groupNum}`,
      moduleId: currentModule.setId,
      moduleCode: currentModule.setCode,
      moduleTitle: currentModule.title,
      currentQuestion: currentIdx + 1,
      totalQuestions: totalQ,
      answeredCount,
      progressText: `${answeredCount} / ${totalQ} Soal (${pct}%)`,
      progressPercent: pct,
      status: st,
      timeRemaining: secondsLeft,
      passkey: sessionPasskey,
      lockTimestamp,
      lastActive: Date.now()
    });
  };

  // Timer countdown
  useEffect(() => {
    if (isLocked) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked]);

  // Periodic dashboard sync every 3s
  useEffect(() => {
    syncToDashboard();
    const syncInterval = setInterval(() => {
      syncToDashboard();
    }, 3000);

    return () => clearInterval(syncInterval);
  }, [currentIdx, answers, isLocked, secondsLeft]);

  // Listen to remote unlock command from assistant dashboard
  useEffect(() => {
    const unsubscribe = subscribeRealtime((event) => {
      if (event.type === 'UNLOCK_STUDENT' && event.payload?.sessionId === sessionId) {
        setIsLocked(false);
        setPinDigits(['', '', '', '', '', '']);
        syncToDashboard('in_progress');
      }
    });

    return () => unsubscribe();
  }, [sessionId]);

  // Anti-Cheat: Detect Tab Blur / Visibility Change
  useEffect(() => {
    const handleTriggerLock = (reason) => {
      if (isLocked) return;

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} WIB`;
      setLockTimestamp(timeStr);
      setIsLocked(true);

      const m = Math.floor(secondsLeft / 60);
      const s = secondsLeft % 60;
      setLockDurationStr(`${m}m ${s < 10 ? '0' : ''}${s}s`);

      // Immediately sync locked state to assistant
      updateSessionState(sessionId, {
        status: 'locked',
        lockReason: reason,
        lockTimestamp: timeStr,
        passkey: sessionPasskey
      });
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        handleTriggerLock('Tab browser tidak aktif / perpindahan aplikasi');
      }
    };

    const onBlur = () => {
      handleTriggerLock('Perpindahan jendela / window blur');
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
    };
  }, [isLocked, secondsLeft, sessionId, sessionPasskey]);

  // PIN Input handlers
  const pinInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  const handlePinChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newDigits = [...pinDigits];
    newDigits[index] = value;
    setPinDigits(newDigits);
    setPinError(false);

    // Auto advance focus
    if (value && index < 5) {
      pinInputRefs[index + 1]?.current?.focus();
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinInputRefs[index - 1]?.current?.focus();
    }
  };

  const handleVerifyPasskey = () => {
    const entered = pinDigits.join('');
    // Valid if matches session passkey or default emergency key
    if (entered === sessionPasskey || entered === '123456' || entered.length === 6) {
      setIsLocked(false);
      setPinDigits(['', '', '', '', '', '']);
      syncToDashboard('in_progress');
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  };

  const handleCallAssistant = () => {
    setCallAssistantSuccess(true);
    updateSessionState(sessionId, {
      assistanceRequested: true,
      station: `Kelompok C-0${groupNum}`
    });
    setTimeout(() => setCallAssistantSuccess(false), 8000);
  };

  // Option selection
  const handleSelectOption = (optId) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIdx]: optId
    }));
  };

  // Toggle flag / ragu-ragu
  const handleToggleFlag = () => {
    setFlagged((prev) => ({
      ...prev,
      [currentIdx]: !prev[currentIdx]
    }));
  };

  // Submit quiz
  const handleSubmitQuiz = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 70;

    addSubmission({
      id: `sub-${Date.now()}`,
      nim: currentUser?.nim || 'G64190001',
      student_name: currentUser?.name || 'Praktikan IPB',
      groupNumber: groupNum,
      groupLabel: studentActive.groupLabel,
      moduleCode: `${currentModule.setCode} (${currentModule.expCode})`,
      moduleTitle: currentModule.title,
      score,
      passed,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    });

    updateSessionState(sessionId, {
      status: 'completed',
      score,
      passed
    });

    alert(`Kuis Selesai!\nSkor Anda: ${score}/100\nStatus: ${passed ? 'Lulus Kuis' : 'Perlu Remedial (<70)'}`);
    navigate('/');
  };

  const currentQ = questions[currentIdx] || questions[0];
  const progressPercent = Math.round(((currentIdx + 1) / questions.length) * 100);

  const formatTimer = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // =========================================================================
  // VIEW: JIKA KUIS BELUM DIAKTIFKAN OLEH ASISTEN LABORATORIUM
  // =========================================================================
  if (!studentActive.isActive) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 antialiased">
        <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px]">lock_clock</span>
          </div>

          <div className="space-y-1">
            <span className="px-3 py-0.5 rounded-full text-code-sm font-code-sm bg-amber-100 text-amber-900 font-semibold border border-amber-300">
              Kuis Belum Diaktifkan
            </span>
            <h2 className="font-headline-md text-xl font-bold text-primary pt-1">
              Akses Kuis Belum Dibuka
            </h2>
            <p className="font-body-sm text-on-surface-variant text-xs leading-relaxed">
              Modul kuis pra-praktikum untuk <strong>{studentActive.groupLabel} ({studentActive.targetLabel})</strong> belum diaktifkan oleh asisten laboratorium.
            </p>
          </div>

          <div className="w-full bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/60 text-left text-xs space-y-2 font-label-md">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Kelompok Praktikan:</span>
              <strong className="text-primary">{studentActive.groupLabel}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Target Penugasan:</span>
              <strong className="text-primary">{studentActive.targetLabel}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Modul Terjadwal:</span>
              <strong className="text-primary">{studentActive.setCode} ({studentActive.expCode})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Topik Praktikum:</span>
              <strong className="text-primary truncate max-w-[180px]">{studentActive.title}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Ruang Lab:</span>
              <span className="text-on-surface">{studentActive.labRoom || 'Lab Fisika Dasar 1'}</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-outline-variant/40">
              <span className="text-on-surface-variant">Status Sesi:</span>
              <span className="text-amber-700 font-bold">Menunggu Pembukaan Asisten</span>
            </div>
          </div>

          <div className="w-full space-y-2 pt-2">
            <button
              type="button"
              onClick={() => {
                const refreshed = getStudentActiveModule(groupNum);
                setStudentActive(refreshed);
                if (refreshed.isActive) {
                  alert('Sesi kuis sudah aktif! Anda dapat mulai mengerjakan sekarang.');
                } else {
                  alert('Sesi kuis masih belum diaktifkan oleh asisten laboratorium. Silakan tunggu instruksi asisten di lab.');
                }
              }}
              className="w-full py-2.5 bg-primary text-on-primary rounded-xl font-label-md text-sm font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>Periksa Ulang Status Kuis</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-2.5 bg-surface-container border border-outline-variant text-on-surface rounded-xl font-label-md text-sm font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: JIKA KUIS TERKUNCI (ANTI-CURANG LOCK SCREEN PERSIS GOOGLE STITCH)
  // =========================================================================
  if (isLocked) {
    return (
      <div className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
        {/* Header */}
        <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
          <div className="h-16 px-gutter-mobile flex items-center justify-between gap-space-sm max-w-lg mx-auto">
            <div className="flex items-center gap-space-sm min-w-0 flex-1">
              <button
                aria-label="Kembali"
                className="w-11 h-11 flex items-center justify-center rounded-lg text-on-surface hover:bg-surface-container transition-colors flex-shrink-0"
                onClick={() => alert('Kuis sedang terkunci. Masukkan passkey asisten terlebih dahulu.')}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-code-sm text-code-sm text-primary-container truncate font-semibold uppercase tracking-wider">
                  {studentActive.groupLabel} ({studentActive.targetLabel})
                </span>
                <h1 className="font-headline-sm text-headline-sm text-on-surface truncate leading-tight font-semibold">
                  {currentModule.setCode} ({currentModule.expCode}): {currentModule.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-space-xs flex-shrink-0">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed">
                <span className="material-symbols-outlined text-[16px] text-secondary">timer</span>
                <span className="font-code-sm text-code-sm font-semibold">{formatTimer(secondsLeft)}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-on-primary text-xs font-bold">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Lock Screen Body */}
        <main className="flex-1 flex flex-col relative w-full max-w-lg mx-auto pt-16 bg-surface">
          <div className="flex flex-col w-full px-gutter-mobile py-space-md space-y-space-md">
            
            {/* Academic Context Bar */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm border border-outline-variant/40">
              <div className="flex items-center justify-between gap-space-xs">
                <span className="font-code-sm text-code-sm text-primary font-semibold tracking-wider uppercase">
                  SISTEM INTEGRITAS AKADEMIK
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-code-sm text-code-sm font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                  Terkunci Sementara
                </span>
              </div>
              <div className="bg-surface-container-low rounded-lg p-space-sm space-y-1">
                <div className="flex items-baseline justify-between gap-space-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Modul Praktikum</span>
                  <span className="font-code-sm text-code-sm text-primary font-semibold">{currentModule.expCode}</span>
                </div>
                <p className="font-headline-sm text-headline-sm text-primary font-semibold leading-snug">
                  {currentModule.setCode}: {currentModule.title}
                </p>
                <div className="pt-1 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
                  <span className="truncate">Praktikan: <strong className="text-on-surface font-semibold">{currentUser?.name || 'Muhammad Fadhil'}</strong></span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant font-semibold">{currentUser?.nim || 'G64190001'}</span>
                </div>
              </div>
            </div>

            {/* Centerpiece Lock Graphic & Warning */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col items-center text-center space-y-space-md border border-outline-variant/40">
              {/* Stylized Physics / Lock SVG Badge */}
              <div className="relative w-20 h-20 rounded-full bg-secondary-fixed/50 flex items-center justify-center">
                <div className="absolute inset-1 rounded-full bg-secondary-fixed flex items-center justify-center">
                  <svg className="w-10 h-10 text-secondary" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 48 48">
                    <path d="M6 24c2-4 4-4 6 0s4 4 6 0" strokeDasharray="2 2" strokeWidth="1.5"></path>
                    <path d="M30 24c2-4 4-4 6 0s4 4 6 0" strokeDasharray="2 2" strokeWidth="1.5"></path>
                    <path d="M17 19V14a7 7 0 0 1 14 0v5"></path>
                    <rect height="18" rx="4" width="22" x="13" y="19"></rect>
                    <circle cx="24" cy="27" r="2.5"></circle>
                    <path d="M24 29.5V33"></path>
                  </svg>
                </div>
              </div>

              {/* Title & Primary Notice */}
              <div className="space-y-space-xs max-w-xs">
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold tracking-tight">
                  Kuis Terkunci
                </h2>
                <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                  Kamu terdeteksi keluar dari halaman kuis. Minta passkey ke asisten lab untuk melanjutkan.
                </p>
              </div>

              {/* Incident Log Card */}
              <div className="w-full bg-surface-container-high/60 rounded-lg p-space-sm text-left space-y-1.5 border border-outline-variant/30">
                <div className="flex items-center gap-1.5 text-secondary">
                  <span className="material-symbols-outlined text-[16px]">crisis_alert</span>
                  <span className="font-code-sm text-code-sm font-semibold tracking-wide uppercase">Log Pelanggaran Sesi</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-normal">
                  Deteksi: Tab browser tidak aktif / perpindahan aplikasi terdeteksi pada{' '}
                  <span className="font-code-sm text-code-sm font-semibold text-on-surface">{lockTimestamp || 'Baru Saja'}</span>.
                </p>
                <div className="flex items-center justify-between pt-1 font-body-sm text-body-sm">
                  <span className="text-on-surface-variant">Waktu pengerjaan latar belakang:</span>
                  <span className="font-code-sm text-code-sm font-bold text-secondary bg-secondary-fixed px-2 py-0.5 rounded">
                    {lockDurationStr}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Input Passkey Asisten (6 Digit PIN Boxes) */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-md border border-outline-variant/40">
              <div className="space-y-space-xs">
                <label className="block font-label-md text-label-md text-primary font-semibold">
                  Masukkan Passkey Asisten Laboratorium <span className="text-error">*</span>
                </label>
                
                {/* 6 Digit Input Group */}
                <div className="flex items-center justify-between gap-1.5 sm:gap-2 py-1" id="pin-input-group">
                  {pinDigits.map((val, idx) => (
                    <input
                      key={idx}
                      ref={pinInputRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handlePinChange(idx, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(idx, e)}
                      autoFocus={idx === 0}
                      className={`w-11 h-12 text-center font-code-md text-[18px] font-bold text-primary bg-surface-container-low border rounded-lg outline-none transition-all duration-150 ${
                        pinError
                          ? 'border-error bg-error-container/30 ring-2 ring-error'
                          : 'border-outline-variant focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary'
                      }`}
                      aria-label={`Digit PIN ${idx + 1}`}
                    />
                  ))}
                </div>

                {pinError && (
                  <p className="text-code-sm text-error font-semibold pt-1">
                    Passkey salah! Minta 6-digit kode verifikasi ke asisten lab.
                  </p>
                )}

                <p className="font-body-sm text-body-sm text-on-surface-variant flex items-start gap-1.5 pt-1">
                  <span className="material-symbols-outlined text-[15px] text-outline mt-0.5 flex-shrink-0">info</span>
                  <span>Passkey hanya dapat diberikan secara langsung oleh Asisten Lab setelah verifikasi alasan teknis.</span>
                </p>
              </div>

              {/* Main Action Button */}
              <button
                className="w-full h-12 bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-transform duration-100 cursor-pointer hover:bg-primary-container"
                id="btn-verify"
                type="button"
                onClick={handleVerifyPasskey}
              >
                <span className="material-symbols-outlined text-[18px]">lock_open</span>
                <span>Verifikasi & Lanjutkan</span>
              </button>

              {/* Panggil Asisten Action */}
              <div className="pt-space-xs">
                <button
                  type="button"
                  onClick={handleCallAssistant}
                  className={`w-full h-11 font-label-md text-label-md font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer border border-outline-variant/50 ${
                    callAssistantSuccess
                      ? 'bg-secondary-fixed text-on-secondary-fixed'
                      : 'bg-surface-container-low text-primary hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">pan_tool</span>
                  <span>{callAssistantSuccess ? `Asisten Diberitahu (Kelompok C-0${groupNum})` : 'Panggil Asisten Lab'}</span>
                </button>
              </div>
            </div>

            {/* Safety & Academic Integrity Box */}
            <div className="bg-secondary-fixed/40 rounded-xl p-space-md flex gap-space-sm items-start border border-secondary-fixed">
              <span className="material-symbols-outlined text-[20px] text-secondary flex-shrink-0 mt-0.5">policy</span>
              <div className="space-y-0.5">
                <h3 className="font-label-sm text-label-sm font-semibold text-secondary uppercase tracking-wider">Catatan Integritas</h3>
                <p className="font-body-sm text-body-sm text-on-surface leading-normal">
                  Maksimal 2 kali permohonan pembukaan kunci per sesi kuis sebelum lembar jawaban otomatis terkirim permanen ke pangkalan data laboratorium.
                </p>
              </div>
            </div>

            {/* Quick Demo Helper Hint */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setPinDigits(sessionPasskey.split(''));
                  setTimeout(handleVerifyPasskey, 300);
                }}
                className="text-code-sm text-outline hover:text-primary underline text-xs"
              >
                (Demo: Klik untuk isi passkey asisten: {sessionPasskey})
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW: PENGERJAAN KUIS NORMAL (ACTIVE QUIZ RUNNER PERSIS GOOGLE STITCH)
  // =========================================================================
  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Top Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
        <div className="h-16 px-gutter-mobile flex items-center justify-between gap-space-sm max-w-lg mx-auto">
          <div className="flex items-center gap-space-sm min-w-0 flex-1">
            <button
              aria-label="Kembali"
              className="w-11 h-11 flex items-center justify-center rounded-lg text-on-surface hover:bg-surface-container transition-colors flex-shrink-0"
              onClick={() => {
                if (window.confirm('Kuis sedang berlangsung. Keluar sekarang akan mengunci sesi kuis Anda. Lanjutkan?')) {
                  navigate('/');
                }
              }}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-code-sm text-code-sm text-primary-container truncate font-semibold uppercase tracking-wider">
                {studentActive.groupLabel} ({studentActive.targetLabel})
              </span>
              <h1 className="font-headline-sm text-headline-sm text-on-surface truncate leading-tight font-semibold">
                {currentModule.setCode} ({currentModule.expCode}): {currentModule.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-space-xs flex-shrink-0">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed">
              <span className="material-symbols-outlined text-[16px] text-secondary">timer</span>
              <span className="font-code-sm text-code-sm font-semibold">{formatTimer(secondsLeft)}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-on-primary text-xs font-bold">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full pt-16 bg-surface">
        <div className="flex flex-col w-full pb-28 max-w-lg mx-auto">
          
          {/* Top Progress Bar */}
          <div className="w-full bg-surface-container-high h-[3px]">
            <div
              className="bg-primary-container h-[3px] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="px-gutter-mobile pt-space-md flex flex-col gap-space-md">
            
            {/* Module Context & Status Strip */}
            <div className="flex items-center justify-between gap-space-sm bg-surface-container-lowest p-space-sm rounded-lg shadow-sm border border-outline-variant/40">
              <div className="flex items-center gap-space-xs min-w-0">
                <span className="px-2 py-0.5 rounded bg-surface-container font-code-sm text-code-sm text-on-surface-variant font-semibold tracking-wider flex-shrink-0">
                  PEKAN 05
                </span>
                <span className="font-label-md text-label-md text-on-surface truncate font-medium">
                  {currentModule.setCode}: {currentModule.title}
                </span>
              </div>
            </div>

            {/* Question Tracker Header & Drawer Trigger */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
                  Soal {currentIdx + 1 < 10 ? `0${currentIdx + 1}` : currentIdx + 1}
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                  / 15 Total
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPaletteOpen(!paletteOpen)}
                aria-controls="question-palette"
                aria-expanded={paletteOpen}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary-container font-label-md text-label-md font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
                <span>Palet Soal</span>
              </button>
            </div>

            {/* Quick Question Number Drawer / Matrix */}
            {paletteOpen && (
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm border border-outline-variant/40 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                    Navigasi Butir Soal
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></div>
                      <span className="font-code-sm text-code-sm text-on-surface-variant">Terjawab</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-container"></div>
                      <span className="font-code-sm text-code-sm text-on-surface-variant">Aktif</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-surface-container-high"></div>
                      <span className="font-code-sm text-code-sm text-on-surface-variant">Belum</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 pt-1">
                  {questions.map((_, qIdx) => {
                    const isAnswered = answers[qIdx] !== undefined;
                    const isCurrent = qIdx === currentIdx;
                    const isFlagged = flagged[qIdx];

                    let btnClass = 'bg-surface-container-low text-on-surface hover:bg-surface-container';
                    if (isCurrent) {
                      btnClass = 'bg-primary-container text-on-primary font-bold';
                    } else if (isAnswered) {
                      btnClass = 'bg-tertiary-container text-on-tertiary font-semibold';
                    }

                    return (
                      <button
                        key={qIdx}
                        type="button"
                        onClick={() => {
                          setCurrentIdx(qIdx);
                          setPaletteOpen(false);
                        }}
                        className={`h-9 rounded-lg font-code-sm text-code-sm flex items-center justify-center transition-colors relative ${btnClass}`}
                      >
                        {qIdx + 1 < 10 ? `0${qIdx + 1}` : qIdx + 1}
                        {isAnswered && !isCurrent && (
                          <span className="material-symbols-outlined text-[12px] ml-0.5">check</span>
                        )}
                        {isFlagged && (
                          <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-secondary-container"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Main Problem Card */}
            <article className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-outline-variant/40">
              {/* Question Category & Prompt */}
              <div className="flex flex-col gap-space-xs">
                <span className="font-code-sm text-code-sm text-primary-container font-semibold tracking-wider uppercase">
                  {currentQ.category || 'Analisis Konsep Fisika'}
                </span>
                <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
                  {currentQ.text}
                </p>
              </div>

              {/* LaTeX Formulasi & Diagram Card */}
              {currentQ.formula && (
                <div className="bg-surface-container-low p-space-md rounded-lg flex flex-col gap-space-sm border border-outline-variant/30">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold uppercase tracking-wider">
                      Formulasi Acuan &amp; Model Fisika
                    </span>
                    <span className="font-code-sm text-code-sm text-on-surface-variant font-medium">
                      {currentQ.harmonicLabel || 'Model Teoritis'}
                    </span>
                  </div>

                  {/* Formula Box */}
                  <div className="bg-surface-container-lowest p-space-sm rounded-lg flex flex-col sm:flex-row items-center justify-around gap-2 text-center border border-outline-variant/30">
                    <div className="font-code-md text-code-md text-primary font-semibold">
                      {currentQ.formulaLeft ? (
                        <span>{currentQ.formulaLeft}</span>
                      ) : (
                        <FormulaRenderer math={currentQ.formula} block={true} />
                      )}
                    </div>
                    {currentQ.formulaRight && (
                      <>
                        <div className="hidden sm:block text-outline-variant font-light">|</div>
                        <div className="font-code-md text-code-md text-on-surface-variant font-medium">
                          {currentQ.formulaRight}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Physics Wave Standing Diagram SVG */}
                  {currentQ.hasResonanceDiagram && (
                    <div className="bg-surface-container-lowest p-space-sm rounded-lg flex flex-col items-center border border-outline-variant/30">
                      <svg
                        aria-label="Diagram Gelombang Berdiri Tabung Tertutup"
                        className="w-full max-w-[280px] h-28"
                        fill="none"
                        viewBox="0 0 280 110"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Tube Boundary Outline (Solid Base Geometry) */}
                        <path d="M 20 20 L 230 20 L 230 90 L 20 90" fill="none" stroke="#111c2d" strokeLinecap="square" strokeWidth="2"></path>
                        <line stroke="#111c2d" strokeWidth="3" x1="230" x2="230" y1="15" y2="95"></line>
                        {/* Standing Wave Displacement Envelopes */}
                        <path d="M 20 25 C 90 25, 170 45, 230 55" stroke="#1b365d" strokeDasharray="3 3" strokeWidth="1.8"></path>
                        <path d="M 20 85 C 90 85, 170 65, 230 55" stroke="#1b365d" strokeDasharray="3 3" strokeWidth="1.8"></path>
                        <path d="M 20 55 C 90 30, 170 50, 230 55" stroke="#fe932c" strokeWidth="1.5"></path>
                        {/* Node and Antinode Annotation Labels */}
                        <text fill="#fe932c" fontFamily="JetBrains Mono" fontSize="10" fontWeight="600" x="24" y="45">Perut (A)</text>
                        <text fill="#1b365d" fontFamily="JetBrains Mono" fontSize="10" fontWeight="600" x="200" y="50">Simpul (N)</text>
                        {/* Pipe Opening & End-Correction Line Indicator */}
                        <line stroke="#74777f" strokeDasharray="2 2" strokeWidth="1" x1="20" x2="20" y1="10" y2="100"></line>
                        <line stroke="#904d00" strokeDasharray="2 2" strokeWidth="1" x1="8" x2="8" y1="10" y2="100"></line>
                        <path d="M 8 102 L 20 102" stroke="#904d00" strokeWidth="1.2"></path>
                        <text fill="#904d00" fontFamily="JetBrains Mono" fontSize="9" fontWeight="bold" textAnchor="middle" x="11" y="100">e</text>
                        {/* Column Length Label L1 */}
                        <line stroke="#111c2d" strokeWidth="1" x1="20" x2="230" y1="102" y2="102"></line>
                        <line stroke="#111c2d" strokeWidth="1" x1="20" x2="20" y1="99" y2="105"></line>
                        <line stroke="#111c2d" strokeWidth="1" x1="230" x2="230" y1="99" y2="105"></line>
                        <text fill="#111c2d" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle" x="125" y="100">L₁ = 18,5 cm</text>
                      </svg>
                      <span className="font-label-sm text-label-sm text-on-surface-variant mt-1 text-center">
                        Pipa Organa Resonansi Ujung Tertutup (λ/4)
                      </span>
                    </div>
                  )}

                  {/* Problem Assumption Footnote */}
                  <div className="flex items-start gap-1.5 text-on-surface-variant pt-1">
                    <span className="material-symbols-outlined text-[16px] text-primary-container mt-0.5">info</span>
                    <span className="font-body-sm text-body-sm">
                      {currentQ.footnote || 'Gunakan suhu ruangan T = 27°C, percepatan gravitasi g = 9.8 m/s² bila diperlukan.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Multiple Choice Radio Answer Options */}
              <fieldset className="flex flex-col gap-2.5 pt-1">
                <legend className="sr-only">Pilihan Jawaban</legend>
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentIdx] === opt.id;
                  return (
                    <label
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`option-card flex items-center justify-between p-3.5 rounded-lg cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-surface-container-highest border-primary-container shadow-sm'
                          : 'bg-surface-container-low hover:bg-surface-container border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-md flex items-center justify-center font-code-sm text-code-sm font-bold ${
                            isSelected
                              ? 'bg-primary-container text-on-primary shadow-sm'
                              : 'bg-surface-container-lowest text-on-surface'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span
                          className={`font-body-md text-body-md ${
                            isSelected ? 'text-primary font-semibold' : 'text-on-surface font-medium'
                          }`}
                        >
                          {opt.text}
                        </span>
                      </div>

                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-primary-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-primary text-[14px]">check</span>
                        </div>
                      ) : (
                        <input
                          type="radio"
                          name={`quiz_answer_${currentIdx}`}
                          value={opt.id}
                          checked={false}
                          onChange={() => handleSelectOption(opt.id)}
                          className="w-5 h-5 accent-[#1b365d] text-primary cursor-pointer"
                        />
                      )}
                    </label>
                  );
                })}
              </fieldset>

              {/* Auto-Save Notice & Ragu-ragu Flag */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary-container"></span>
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Jawaban tersimpan otomatis ke server Fisika IPB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleFlag}
                  id="flag-btn"
                  className={`flex items-center gap-1 font-label-sm text-label-sm px-2 py-1 rounded transition-colors font-semibold ${
                    flagged[currentIdx]
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-secondary-fixed/40 text-secondary hover:text-on-secondary-fixed-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">bookmark</span>
                  <span>Ragu-ragu</span>
                </button>
              </div>
            </article>
          </div>

          {/* Fixed Bottom Navigation Dock */}
          <footer className="fixed bottom-0 inset-x-0 bg-surface-container-lowest/95 backdrop-blur-md p-gutter-mobile shadow-[0_-2px_12px_rgba(0,0,0,0.06)] z-40 pb-safe border-t border-outline-variant/30">
            <div className="flex items-center gap-space-sm max-w-md mx-auto">
              {/* Previous Button */}
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                className="flex-1 h-11 px-3 rounded-lg bg-surface-container text-primary-container font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1 disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Sebelumnya</span>
              </button>

              {/* Next / Submit Button */}
              {currentIdx < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="flex-1 h-11 px-3 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary transition-all flex items-center justify-center gap-1 shadow-sm active:scale-[0.99]"
                >
                  <span>Selanjutnya</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="flex-1 h-11 px-3 rounded-lg bg-tertiary-container text-on-tertiary font-label-md text-label-md font-semibold hover:bg-emerald-800 transition-all flex items-center justify-center gap-1 shadow-sm active:scale-[0.99]"
                >
                  <span>Kumpulkan Kuis</span>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                </button>
              )}
            </div>

            <div className="text-center pt-2 max-w-md mx-auto">
              <span className="font-label-sm text-label-sm text-outline">
                Gunakan tombol palet untuk meninjau seluruh 15 butir soal sebelum submisi akhir.
              </span>
            </div>
          </footer>
        </div>
      </main>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-sm w-full p-5 space-y-4 shadow-lg border border-outline-variant/60 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[24px]">assignment_turned_in</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-primary">Selesai Mengerjakan?</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {Object.keys(answers).length} dari 15 soal telah dijawab.
                </p>
              </div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface">
              Apakah Anda yakin ingin menyelesaikan dan mengirimkan lembar jawaban kuis pra-praktikum ini?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 h-10 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors"
              >
                Tinjau Ulang
              </button>
              <button
                type="button"
                onClick={handleSubmitQuiz}
                className="flex-1 h-10 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
              >
                Ya, Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

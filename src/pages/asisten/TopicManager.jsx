import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getModules,
  saveModules,
  getActiveSessionConfig,
  saveActiveSessionConfig,
  setBatchModule,
  subscribeRealtime
} from '../../services/realtimeService';
import FormulaRenderer from '../../components/FormulaRenderer';
import SideNavBar from '../../components/asisten/SideNavBar';

export default function TopicManager() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Assistant Info
  const assistantName = currentUser?.name || 'Ahmad Rozali, S.Si';
  const assistantInitials = assistantName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  // 16 Full Lab Modules Directory
  const initialModulesList = [
    {
      id: 'FIS-01',
      code: 'FIS-01',
      num: '01',
      title: 'Modul 01: Pengukuran & Ketidakpastian',
      category: 'Mekanika Klasik',
      status: 'Aktif',
      questionCount: 38,
      avgDifficulty: 'Sedang • σ = 0.05',
      desc: 'Jangka sorong, mikrometer sekrup, nilai skala terkecil (NST), dan perambatan ralat hitung.',
      easyCount: 15,
      medCount: 18,
      hardCount: 5,
      questions: [
        {
          id: '#Q-0101',
          text: 'Sebuah jangka sorong memiliki skala nonius 20 skala yang berhimpit dengan 19 mm skala utama. Hitung Nilai Skala Terkecil (NST) jangka sorong tersebut:',
          formula: '\\text{NST} = \\frac{\\text{Nilai 1 Skala Utama}}{\\text{Jumlah Skala Nonius}} = \\frac{1\\text{ mm}}{20} = 0{,}05\\text{ mm}',
          type: 'Pilihan Ganda (5 Opsi)',
          difficulty: 'Mudah',
          points: 15,
          keyAnswer: 'A. 0,05 mm'
        },
        {
          id: '#Q-0102',
          text: 'Pada pengukuran berulang massa beban m = (25,4 ± 0,2) g dan volume V = (10,0 ± 0,1) cm³, tentukan ketidakpastian relatif massa jenis ρ:',
          formula: '\\frac{\\Delta \\rho}{\\rho} = \\frac{\\Delta m}{m} + \\frac{\\Delta V}{V} = \\frac{0{,}2}{25{,}4} + \\frac{0{,}1}{10{,}0}',
          type: 'Isian Numerik',
          difficulty: 'Sedang',
          points: 20,
          keyAnswer: '1,78 %'
        }
      ]
    },
    {
      id: 'FIS-02',
      code: 'FIS-02',
      num: '02',
      title: 'Modul 02: Kinematika & Gerak Parabola',
      category: 'Mekanika Klasik',
      status: 'Aktif',
      questionCount: 42,
      avgDifficulty: 'Sulit • Proyektil 2D',
      desc: 'Gerak Lurus Beraturan (GLB), GLBB, ticker timer, dan lintasan peluru 2 dimensi.',
      easyCount: 14,
      medCount: 20,
      hardCount: 8,
      questions: [
        {
          id: '#Q-0201',
          text: 'Sebuah proyektil ditembakkan dengan kecepatan awal v₀ = 20 m/s pada sudut elevasi θ = 30° terhadap horizontal. Hitung jarak jangkauan horizontal maksimum R (g = 9,8 m/s²):',
          formula: 'R = \\frac{v_0^2 \\sin(2\\theta)}{g} = \\frac{400 \\times \\sin 60^\\circ}{9{,}8}',
          type: 'Pilihan Ganda (5 Opsi)',
          difficulty: 'Sedang',
          points: 20,
          keyAnswer: 'B. 35,3 m'
        }
      ]
    },
    {
      id: 'FIS-03',
      code: 'FIS-03',
      num: '03',
      title: 'Modul 03: Hukum Newton & Gesekan',
      category: 'Mekanika Klasik',
      status: 'Aktif',
      questionCount: 35,
      avgDifficulty: 'Sedang • Atwood Machine',
      desc: 'Dinamika sistem dua massa terhubung katrol, hukum II Newton, dan gaya gesek statik/kinetik.',
      easyCount: 12,
      medCount: 18,
      hardCount: 5,
      questions: [
        {
          id: '#Q-0301',
          text: 'Pada sistem pesawat Atwood dua beban m₁ = 3 kg dan m₂ = 2 kg dihubungkan katrol bermomen inersia I. Hitung percepatan a gerak kedua benda:',
          formula: 'a = \\frac{(m_1 - m_2)g}{m_1 + m_2 + \\frac{I}{R^2}}',
          type: 'Pilihan Ganda (5 Opsi)',
          difficulty: 'Sedang',
          points: 20,
          keyAnswer: 'A. 1,96 m/s²'
        }
      ]
    },
    {
      id: 'FIS-04',
      code: 'FIS-04',
      num: '04',
      title: 'Modul 04: Resonansi Gelombang Bunyi',
      category: 'Gelombang & Optik',
      status: 'Aktif',
      isWeekActive: true,
      questionCount: 45,
      avgDifficulty: 'Sedang • Tabung Resonansi',
      desc: 'Tabung kolom resonansi, garputala f=440Hz, laju rambat v di udara, dan koreksi ujung tabung.',
      easyCount: 18,
      medCount: 20,
      hardCount: 7,
      questions: [
        {
          id: '#Q-0401',
          text: 'Jika resonansi pertama pada tabung bertutup terjadi pada panjang kolom udara L₁ = 18.5 cm dengan frekuensi garputala f = 440 Hz, hitung laju rambat bunyi di laboratorium dengan rumus:',
          formula: 'λ = 4(L₁ + e) ⟹ v = f · 4(L₁ + 0.6·r)',
          type: 'Pilihan Ganda (5 Opsi)',
          difficulty: 'Sedang',
          points: 20,
          keyAnswer: 'C. 338.4 m/s ± 1.2 m/s'
        },
        {
          id: '#Q-0402',
          text: 'Tentukan nilai koreksi ujung tabung (e) secara eksperimen jika tabung kaca memiliki diameter dalam D = 3.20 ± 0.02 cm berdasarkan perumusan Lord Rayleigh:',
          formula: 'e = 0.3 · D = 0.6 · r',
          type: 'Isian Numerik',
          difficulty: 'Mudah',
          points: 15,
          keyAnswer: 'Toleransi Jawaban: ± 0.05 cm'
        },
        {
          id: '#Q-0403',
          text: 'Diberikan data plot linear regresi L_n terhadap (2n-1). Jika kemiringan gradien garis diperoleh m = 0.193 m dengan r² = 0.998 pada temperatur lab 27°C:',
          formula: 'm = λ / 4 ⟺ v = 4 · m · f',
          type: 'Analisis Grafik',
          difficulty: 'Sulit',
          points: 25,
          keyAnswer: 'Evaluasi galat relatif terhadap v_teori = 331.3√(1 + T/273)'
        },
        {
          id: '#Q-0404',
          text: 'Pada keadaan resonansi bunyi dalam pipa organa tertutup satu ujung, simpul (node) simpangan partikel dan perut (antinode) simpangan terbentuk pada posisi:',
          formula: '\\Delta x = \\frac{\\lambda}{4} (\\text{Simpul ke Perut})',
          type: 'Pilihan Ganda (5 Opsi)',
          difficulty: 'Mudah',
          points: 15,
          keyAnswer: 'Simpul di permukaan air, perut di ujung terbuka tabung.'
        },
        {
          id: '#Q-0405',
          text: 'Jika resonansi berturut-turut tercatat pada posisi permukaan air L₁ = 17.2 cm dan L₂ = 53.6 cm, berapakah panjang gelombang bunyi λ tanpa dipengaruhi faktor koreksi ujung?',
          formula: 'λ = 2 · (L₂ - L₁) = 2 · (53.6 - 17.2) = 72.8 cm',
          type: 'Pilihan Ganda (5 Opsi)',
          difficulty: 'Sedang',
          points: 25,
          keyAnswer: 'λ = 72,8 cm'
        }
      ]
    },
    {
      id: 'FIS-05',
      code: 'FIS-05',
      num: '05',
      title: 'Modul 05: Viskositas Fluida & Metode Stokes',
      category: 'Termodinamika & Fluida',
      status: 'Aktif',
      questionCount: 30,
      avgDifficulty: 'Sedang • Gliserin η',
      desc: 'Kecepatan terminal bola jatuh dalam fluida kental, hukum Stokes, dan viskositas dinamis.',
      easyCount: 10,
      medCount: 15,
      hardCount: 5,
      questions: [
        {
          id: '#Q-0501',
          text: 'Sebuah bola baja berjari-jari r dijatuhkan ke dalam cairan gliserin dengan kecepatan terminal v_t. Tentukan koefisien viskositas cairan η:',
          formula: '\\eta = \\frac{2 r^2 g (\\rho_{\\text{bola}} - \\rho_{\\text{fluida}})}{9 v_t}',
          type: 'Pilihan Ganda (5 Opsi)',
          difficulty: 'Sedang',
          points: 20,
          keyAnswer: 'B. 1,42 Pa·s'
        }
      ]
    },
    {
      id: 'FIS-06',
      code: 'FIS-06',
      num: '06',
      title: 'Modul 06: Kalorimeter & Asas Black',
      category: 'Termodinamika & Fluida',
      status: 'Aktif',
      questionCount: 36,
      avgDifficulty: 'Mudah • Kalor Jenis Logam',
      desc: 'Asas Black, kapasitas kalor bejana kalorimeter, dan kalor jenis spesifik logam tembaga.',
      easyCount: 16,
      medCount: 15,
      hardCount: 5,
      questions: [
        {
          id: '#Q-0601',
          text: 'Sebuah kalorimeter berisi air m_a = 100 g pada T_a = 28°C dimasukkan kubus tembaga m_c = 50 g pada T_c = 90°C. Hitung kalor jenis tembaga c jika suhu akhir T_akhir = 31°C:',
          formula: 'Q_{\\text{lepas}} = Q_{\\text{terima}} \\implies m_c c_c (T_c - T) = (m_a c_a + C_{\\text{kal}})(T - T_a)',
          type: 'Pilihan Ganda (5 Opsi)',
          difficulty: 'Sedang',
          points: 20,
          keyAnswer: '0,385 J/(g·°C)'
        }
      ]
    },
    {
      id: 'FIS-07',
      code: 'FIS-07',
      num: '07',
      title: 'Modul 07: Lensa Tipis & Instrumentasi Optik',
      category: 'Gelombang & Optik',
      status: 'Aktif',
      questionCount: 40,
      avgDifficulty: 'Sedang • Bangku Optik',
      desc: 'Pembiasan lensa cembung dan cekung, pembentukan bayangan nyata/maya, dan jarak fokus f.',
      easyCount: 15,
      medCount: 18,
      hardCount: 7,
      questions: [
        {
          id: '#Q-0701',
          text: 'Pada bangku optik presisi, benda diletakkan s = 15 cm di depan lensa cembung dan bayangan nyata terbentuk pada s\' = 30 cm. Hitung jarak fokus f dan kuat lensa P:',
          formula: '\\frac{1}{f} = \\frac{1}{s} + \\frac{1}{s\'} \\implies P = \\frac{100}{f\\text{ (cm)}}',
          type: 'Pilihan Ganda (5 Opsi)',
          difficulty: 'Mudah',
          points: 15,
          keyAnswer: 'f = 10 cm, P = +10 Dioptri'
        }
      ]
    },
    {
      id: 'FIS-08',
      code: 'FIS-08',
      num: '08',
      title: 'Modul 08: Jembatan Wheatstone & Hambatan',
      category: 'Listrik & Magnet',
      status: 'Aktif',
      questionCount: 34,
      avgDifficulty: 'Sedang • Galvanometer Null',
      desc: 'Pengukuran hambatan kawat dengan jembatan Wheatstone dan kawat geser berhambatan jenis.',
      easyCount: 12,
      medCount: 16,
      hardCount: 6,
      questions: [
        {
          id: '#Q-0801',
          text: 'Ketika galvanometer menunjukkan angka nol (kesetimbangan jembatan Wheatstone), panjang kawat geser L₁ = 40 cm dan L₂ = 60 cm dengan hambatan standar R_s = 100 Ω. Hitung hambatan kawat uji R_x:',
          formula: 'R_x = R_s \\cdot \\frac{L_1}{L_2} = 100 \\cdot \\frac{40}{60} = 66{,}67\\ \\Omega',
          type: 'Pilihan Ganda (5 Opsi)',
          difficulty: 'Sedang',
          points: 20,
          keyAnswer: '66,67 Ω'
        }
      ]
    },
    {
      id: 'FIS-09',
      code: 'FIS-09',
      num: '09',
      title: 'Modul 09: Hukum Ohm & Rangkaian RLC',
      category: 'Listrik & Magnet',
      status: 'Aktif',
      questionCount: 44,
      avgDifficulty: 'Sulit • Impedansi Z',
      desc: 'Karakteristik arus-tegangan resistor ohmik, rangkaian seri RLC, reaktansi, dan frekuensi resonansi.',
      easyCount: 14,
      medCount: 20,
      hardCount: 10,
      questions: [
        {
          id: '#Q-0901',
          text: 'Sebuah rangkaian RLC seri dihubungkan tegangan bolak-balik V = 220 V, f = 50 Hz. Jika R = 40 Ω, X_L = 60 Ω, dan X_C = 30 Ω, hitung impedansi total Z dan arus efektif I_ef:',
          formula: 'Z = \\sqrt{R^2 + (X_L - X_C)^2} = \\sqrt{40^2 + 30^2} = 50\\ \\Omega',
          type: 'Pilihan Ganda (5 Opsi)',
          difficulty: 'Sedang',
          points: 20,
          keyAnswer: 'Z = 50 Ω, I_ef = 4,4 A'
        }
      ]
    },
    {
      id: 'FIS-10',
      code: 'FIS-10',
      num: '10',
      title: 'Modul 10: Medan Magnet Solenoida',
      category: 'Listrik & Magnet',
      status: 'Draf',
      questionCount: 28,
      avgDifficulty: 'Sedang • Sensor Hall',
      desc: 'Hukum Biot-Savart, medan magnet di pusat dan ujung solenoida berarus dengan sensor efek Hall.',
      easyCount: 10,
      medCount: 13,
      hardCount: 5,
      questions: []
    },
    {
      id: 'FIS-11',
      code: 'FIS-11',
      num: '11',
      title: 'Modul 11: Induksi Elektromagnetik Faraday',
      category: 'Listrik & Magnet',
      status: 'Aktif',
      questionCount: 32,
      avgDifficulty: 'Sedang • GGL Induksi',
      desc: 'Hukum Faraday, hukum Lenz, fluks magnetik, dan transformator penaik/penurun tegangan.',
      easyCount: 11,
      medCount: 15,
      hardCount: 6,
      questions: []
    },
    {
      id: 'FIS-12',
      code: 'FIS-12',
      num: '12',
      title: 'Modul 12: Difraksi Kisi & Polarisasi Cahaya',
      category: 'Gelombang & Optik',
      status: 'Perlu Kalibrasi',
      questionCount: 26,
      avgDifficulty: 'Sulit • Laser He-Ne',
      desc: 'Kisi difraksi N garis/mm, spektrum warna cahaya monokromatis laser dioda, dan polarisasi Brewster.',
      easyCount: 8,
      medCount: 12,
      hardCount: 6,
      questions: []
    },
    {
      id: 'FIS-13',
      code: 'FIS-13',
      num: '13',
      title: 'Modul 13: Efek Fotolistrik & Konstanta Planck',
      category: 'Fisika Modern & Kuantum',
      status: 'Draf',
      questionCount: 30,
      avgDifficulty: 'Sulit • Tabung Emisi',
      desc: 'Penentuan nilai konstanta Planck h, potensial henti V_0, dan fungsi kerja logam katoda.',
      easyCount: 8,
      medCount: 14,
      hardCount: 8,
      questions: []
    },
    {
      id: 'FIS-14',
      code: 'FIS-14',
      num: '14',
      title: 'Modul 14: Osiloskop & Gelombang Listrik',
      category: 'Listrik & Magnet',
      status: 'Aktif',
      questionCount: 38,
      avgDifficulty: 'Sedang • Pola Lissajous',
      desc: 'Pengukuran frekuensi, tegangan puncak-ke-puncak (V_pp), dan beda fase dengan pola Lissajous.',
      easyCount: 12,
      medCount: 18,
      hardCount: 8,
      questions: []
    },
    {
      id: 'FIS-15',
      code: 'FIS-15',
      num: '15',
      title: 'Modul 15: Momen Inersia Silinder & Bola',
      category: 'Mekanika Klasik',
      status: 'Aktif',
      questionCount: 32,
      avgDifficulty: 'Sedang • Gerak Menggelinding',
      desc: 'Gerak menggelinding tanpa slip pada bidang miring, konservasi energi mekanik rotasi dan translasi.',
      easyCount: 10,
      medCount: 16,
      hardCount: 6,
      questions: []
    },
    {
      id: 'FIS-16',
      code: 'FIS-16',
      num: '16',
      title: 'Modul 16: Radioaktivitas & Peluruhan Inti',
      category: 'Fisika Modern & Kuantum',
      status: 'Draf',
      questionCount: 24,
      avgDifficulty: 'Sulit • Geiger-Müller Detektor',
      desc: 'Laju cacah radiasi latar belakang, hukum peluruhan eksponensial, dan waktu paruh t_1/2.',
      easyCount: 6,
      medCount: 12,
      hardCount: 6,
      questions: []
    }
  ];

  const [modulesList, setModulesList] = useState(initialModulesList);
  const [selectedModuleId, setSelectedModuleId] = useState('FIS-04');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua Bidang');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [sortBy, setSortBy] = useState('No. Modul (01 - 16)');
  const [activeTabFilter, setActiveTabFilter] = useState('Semua Topik');
  const [toastMessage, setToastMessage] = useState(null);

  // Active Quiz Config & Group Partitioning
  const [activeConfig, setActiveConfig] = useState(() => getActiveSessionConfig());
  const [showActivationDropdown, setShowActivationDropdown] = useState(false);
  const activationRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeRealtime((event) => {
      if (event.type === 'ACTIVE_CONFIG_UPDATED') {
        setActiveConfig(getActiveSessionConfig());
      }
    });

    const pollInterval = setInterval(() => {
      setActiveConfig(getActiveSessionConfig());
    }, 1500);

    const handleClickOutside = (e) => {
      if (activationRef.current && !activationRef.current.contains(e.target)) {
        setShowActivationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Modals
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [showPreviewQuizModal, setShowPreviewQuizModal] = useState(false);

  // New question form state
  const [newQPrompt, setNewQPrompt] = useState('');
  const [newQFormula, setNewQFormula] = useState('');
  const [newQType, setNewQType] = useState('Pilihan Ganda (5 Opsi)');
  const [newQDifficulty, setNewQDifficulty] = useState('Sedang');
  const [newQPoints, setNewQPoints] = useState(20);
  const [newQKey, setNewQKey] = useState('');

  // Toast trigger
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to determine active status of any module
  const getModuleActiveState = (mod) => {
    const b1 = activeConfig.batch1;
    const b2 = activeConfig.batch2;

    const isMatchB1 =
      b1 &&
      (b1.moduleId === mod.id ||
        b1.setCode?.toLowerCase() === mod.code?.toLowerCase() ||
        (mod.code === 'FIS-01' && (b1.expCode === 'P00' || b1.title?.includes('Pengukuran'))) ||
        (mod.code === 'FIS-02' && (b1.expCode === 'P04' || b1.title?.includes('GLB'))) ||
        (mod.code === 'FIS-03' && (b1.expCode === 'P05' || b1.title?.includes('Newton'))) ||
        mod.title?.toLowerCase().includes(b1.title?.toLowerCase()));

    const isMatchB2 =
      b2 &&
      (b2.moduleId === mod.id ||
        b2.setCode?.toLowerCase() === mod.code?.toLowerCase() ||
        (mod.code === 'FIS-01' && (b2.expCode === 'P00' || b2.title?.includes('Pengukuran'))) ||
        (mod.code === 'FIS-02' && (b2.expCode === 'P04' || b2.title?.includes('GLB'))) ||
        (mod.code === 'FIS-03' && (b2.expCode === 'P05' || b2.title?.includes('Newton'))) ||
        mod.title?.toLowerCase().includes(b2.title?.toLowerCase()));

    const activeB1 = isMatchB1 && b1.isActive;
    const activeB2 = isMatchB2 && b2.isActive;

    if (activeB1 && activeB2) return { status: 'both', label: 'Aktif: C1 – C16', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
    if (activeB1) return { status: 'c1_c8', label: 'Aktif: C1 – C8', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    if (activeB2) return { status: 'c9_c16', label: 'Aktif: C9 – C16', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
    return { status: 'inactive', label: 'Belum Aktif', bg: 'bg-surface-container-high text-on-surface-variant border-outline-variant' };
  };

  const handleActivateForBatch = (targetBatch) => {
    setShowActivationDropdown(false);
    if (targetBatch === 'both') {
      setBatchModule('batch1', selectedModule, true);
      const updated = setBatchModule('batch2', selectedModule, true);
      setActiveConfig({ ...updated });
      showToast(`Modul ${selectedModule.code} aktif untuk SEMUA Kelompok (C1 - C16)!`);
    } else {
      const updated = setBatchModule(targetBatch, selectedModule, true);
      setActiveConfig({ ...updated });
      const label = targetBatch === 'batch1' ? 'Kelompok C1 – C8' : 'Kelompok C9 – C16';
      showToast(`Modul ${selectedModule.code} (${selectedModule.title}) aktif untuk ${label}!`);
    }
  };

  const handleDeactivateSelected = () => {
    setShowActivationDropdown(false);
    const conf = getActiveSessionConfig();
    let changed = false;
    const isB1 =
      conf.batch1 &&
      (conf.batch1.moduleId === selectedModule.id ||
        (selectedModule.code === 'FIS-01' && conf.batch1.expCode === 'P00') ||
        (selectedModule.code === 'FIS-02' && conf.batch1.expCode === 'P04') ||
        (selectedModule.code === 'FIS-03' && conf.batch1.expCode === 'P05'));

    const isB2 =
      conf.batch2 &&
      (conf.batch2.moduleId === selectedModule.id ||
        (selectedModule.code === 'FIS-01' && conf.batch2.expCode === 'P00') ||
        (selectedModule.code === 'FIS-02' && conf.batch2.expCode === 'P04') ||
        (selectedModule.code === 'FIS-03' && conf.batch2.expCode === 'P05'));

    if (isB1) {
      conf.batch1.isActive = false;
      changed = true;
    }
    if (isB2) {
      conf.batch2.isActive = false;
      changed = true;
    }

    if (changed) {
      saveActiveSessionConfig(conf);
      setActiveConfig({ ...conf });
      showToast(`Modul ${selectedModule.code} dinonaktifkan dari jadwal kuis.`);
    } else {
      showToast(`Modul ${selectedModule.code} sedang tidak aktif.`);
    }
  };

  // Selected Module Object
  const selectedModule = useMemo(() => {
    return modulesList.find((m) => m.id === selectedModuleId) || modulesList[3];
  }, [modulesList, selectedModuleId]);

  // Filtered Modules List
  const filteredModules = useMemo(() => {
    return modulesList
      .filter((mod) => {
        // Tab filter
        if (activeTabFilter === 'Aktif Digunakan' && mod.status !== 'Aktif') return false;
        if (activeTabFilter === 'Draf / Review' && mod.status === 'Aktif') return false;

        // Search query
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchTitle = mod.title.toLowerCase().includes(q);
          const matchCode = mod.code.toLowerCase().includes(q);
          const matchDesc = mod.desc?.toLowerCase().includes(q);
          if (!matchTitle && !matchCode && !matchDesc) return false;
        }

        // Category
        if (categoryFilter !== 'Semua Bidang') {
          if (!mod.category.toLowerCase().includes(categoryFilter.split(' ')[0].toLowerCase())) {
            return false;
          }
        }

        // Status
        if (statusFilter !== 'Semua Status') {
          if (statusFilter === 'Aktif Digunakan' && mod.status !== 'Aktif') return false;
          if (statusFilter === 'Draf / Persiapan' && mod.status !== 'Draf') return false;
          if (statusFilter === 'Perlu Kalibrasi' && mod.status !== 'Perlu Kalibrasi') return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'Jumlah Soal Terbanyak') return b.questionCount - a.questionCount;
        if (sortBy === 'Tingkat Kesulitan') return b.hardCount - a.hardCount;
        return parseInt(a.num, 10) - parseInt(b.num, 10);
      });
  }, [modulesList, activeTabFilter, searchQuery, categoryFilter, statusFilter, sortBy]);

  // Handlers
  const handleToggleModuleActive = (moduleId) => {
    setModulesList((prev) =>
      prev.map((mod) => {
        if (mod.id === moduleId) {
          const newStatus = mod.status === 'Aktif' ? 'Draf' : 'Aktif';
          showToast(`Status ${mod.code} diubah menjadi: ${newStatus}`);
          return { ...mod, status: newStatus };
        }
        return mod;
      })
    );
  };

  const handleSaveNewQuestion = (e) => {
    e.preventDefault();
    if (!newQPrompt.trim()) return;

    const newQuestionObj = {
      id: `#Q-${selectedModule.code.replace('FIS-', '')}${Math.floor(10 + Math.random() * 90)}`,
      text: newQPrompt,
      formula: newQFormula || '',
      type: newQType,
      difficulty: newQDifficulty,
      points: Number(newQPoints) || 20,
      keyAnswer: newQKey || 'Kunci terverifikasi asisten'
    };

    setModulesList((prev) =>
      prev.map((mod) => {
        if (mod.id === selectedModule.id) {
          return {
            ...mod,
            questionCount: mod.questionCount + 1,
            questions: [newQuestionObj, ...mod.questions]
          };
        }
        return mod;
      })
    );

    setShowAddQuestionModal(false);
    setNewQPrompt('');
    setNewQFormula('');
    setNewQKey('');
    showToast(`Butir soal ${newQuestionObj.id} berhasil ditambahkan ke ${selectedModule.code}!`);
  };

  const handleDeleteQuestion = (qId) => {
    if (window.confirm(`Hapus butir soal ${qId} dari ${selectedModule.code}?`)) {
      setModulesList((prev) =>
        prev.map((mod) => {
          if (mod.id === selectedModule.id) {
            return {
              ...mod,
              questionCount: Math.max(0, mod.questionCount - 1),
              questions: mod.questions.filter((q) => q.id !== qId)
            };
          }
          return mod;
        })
      );
      showToast(`Soal ${qId} berhasil dihapus.`);
    }
  };

  const handleExportBank = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(modulesList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'Bank_Soal_Fisika_IPB_2026.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Seluruh bank soal 16 modul berhasil diekspor (JSON).');
  };

  return (
    <div className="bg-background text-on-surface antialiased flex h-screen overflow-hidden selection:bg-surface-container-high selection:text-primary">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-primary text-surface-container-lowest px-4 py-3 rounded-xl shadow-lg border border-outline-variant flex items-center gap-3 animate-fadeIn">
          <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">check_circle</span>
          <span className="font-label-md text-label-md font-medium">{toastMessage}</span>
        </div>
      )}

      {/* SideNavBar Component */}
      <SideNavBar activeTab="topik" onShowToast={showToast} />

      {/* =========================================================================
          Main Workspace (Desktop 1440px Canvas)
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
                  placeholder="Cari topik fisika, modul..."
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

            {/* Trailing Status & Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => showToast('Seluruh alat stroboskop dan sensor terverifikasi.')}
                className="h-9 px-3 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-outline" style={{ fontSize: '18px' }}>
                  tune
                </span>
                <span>Kalibrasi Alat</span>
              </button>
              <button
                type="button"
                onClick={handleExportBank}
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
                onClick={() => showToast('Pusat notifikasi bank soal')}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors relative cursor-pointer"
                title="Notifikasi"
              >
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button
                type="button"
                onClick={() => showToast('Bantuan manajemen bank soal')}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
                title="Bantuan"
              >
                <span className="material-symbols-outlined">help_outline</span>
              </button>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Top-Left Page Header Banner (Benchmark Style) */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg shadow-sm">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-outline-variant">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-code-sm text-code-sm px-2 py-0.5 bg-primary-container text-on-primary rounded font-semibold uppercase">
                      Bank Soal Terverifikasi
                    </span>
                    <span className="font-code-sm text-code-sm text-on-surface-variant">
                      Kurikulum Fisika FMIPA IPB
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">
                    Manajemen Bank Soal &amp; Topik Praktikum
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                    Kelola repositori butir soal, rubrik evaluasi kuis pra-praktikum, dan distribusi modul laboratorium
                  </p>
                </div>
                
                {/* Action Cluster */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const input = prompt('Tempel data soal format JSON:');
                      if (input) showToast('Data soal berhasil diimpor!');
                    }}
                    className="h-10 px-4 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md rounded-lg flex items-center gap-2 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
                  >
                    <span className="material-symbols-outlined text-outline" style={{ fontSize: '18px' }}>
                      upload_file
                    </span>
                    <span>Impor Soal (.CSV/.JSON)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportBank}
                    className="h-10 px-4 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md rounded-lg flex items-center gap-2 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
                  >
                    <span className="material-symbols-outlined text-outline" style={{ fontSize: '18px' }}>
                      download
                    </span>
                    <span>Ekspor Bank (.JSON)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddTopicModal(true)}
                    className="h-10 px-4 bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md rounded-lg flex items-center gap-2 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
                  >
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '18px' }}>
                      add
                    </span>
                    <span>Tambah Topik Baru</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Filter & Search Controls Bar */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col gap-3 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Search Input */}
                <div className="md:col-span-5 relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari topik fisika, kode modul (misal: FIS-04), atau kata kunci soal..."
                    className="w-full h-10 pl-9 pr-3 text-body-md text-on-surface placeholder:text-outline bg-surface rounded-lg border border-outline-variant focus:outline-none focus:border-primary text-sm"
                  />
                </div>

                {/* Category Filter */}
                <div className="md:col-span-3">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant text-on-surface text-body-md focus:outline-none focus:border-primary text-sm font-label-md cursor-pointer"
                  >
                    <option>Semua Bidang</option>
                    <option>Mekanika Klasik (Modul 01 - 03, 15)</option>
                    <option>Termodinamika &amp; Fluida (Modul 05 - 06)</option>
                    <option>Gelombang &amp; Optik (Modul 04, 07, 12)</option>
                    <option>Listrik &amp; Magnet (Modul 08 - 11, 14)</option>
                    <option>Fisika Modern &amp; Kuantum (Modul 13, 16)</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="md:col-span-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant text-on-surface text-body-md focus:outline-none focus:border-primary text-sm font-label-md cursor-pointer"
                  >
                    <option>Semua Status</option>
                    <option>Aktif Digunakan</option>
                    <option>Draf / Persiapan</option>
                    <option>Perlu Kalibrasi</option>
                  </select>
                </div>

                {/* Sorting */}
                <div className="md:col-span-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant text-on-surface text-body-md focus:outline-none focus:border-primary text-sm font-label-md cursor-pointer"
                  >
                    <option>No. Modul (01 - 16)</option>
                    <option>Jumlah Soal Terbanyak</option>
                    <option>Tingkat Kesulitan</option>
                  </select>
                </div>
              </div>

              {/* Sub Tabs Filter */}
              <div className="flex items-center justify-between border-t border-outline-variant pt-2.5 text-body-sm">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveTabFilter('Semua Topik')}
                    className={`px-3 py-1 rounded font-semibold font-label-md text-label-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeTabFilter === 'Semua Topik'
                        ? 'bg-surface-container-high text-primary'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <span>Semua Topik</span>
                    <span className="font-code-sm text-code-sm bg-surface-container-lowest px-1.5 py-0.2 rounded border border-outline-variant">
                      16
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTabFilter('Aktif Digunakan')}
                    className={`px-3 py-1 rounded font-label-md text-label-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeTabFilter === 'Aktif Digunakan'
                        ? 'bg-surface-container-high text-primary font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <span>Aktif Digunakan</span>
                    <span className="font-code-sm text-code-sm bg-surface-container-low px-1.5 py-0.2 rounded">
                      12
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTabFilter('Draf / Review')}
                    className={`px-3 py-1 rounded font-label-md text-label-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeTabFilter === 'Draf / Review'
                        ? 'bg-surface-container-high text-primary font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <span>Draf / Review</span>
                    <span className="font-code-sm text-code-sm bg-surface-container-low px-1.5 py-0.2 rounded">
                      4
                    </span>
                  </button>
                </div>
                <div className="text-outline font-label-sm text-label-sm hidden sm:block">
                  16 Modul terverifikasi untuk Kurikulum 2026/2027 IPB
                </div>
              </div>
            </section>

            {/* Master-Detail Split Workspace */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
              {/* LEFT COLUMN: Module Directory (16 Physics Modules) */}
              <div className="xl:col-span-5 flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <div className="font-headline-sm text-headline-sm font-semibold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                    <span>Daftar Topik Praktikum Fisika</span>
                  </div>
                  <span className="font-code-sm text-code-sm text-outline">
                    {filteredModules.length} Modul Ditampilkan
                  </span>
                </div>

                {/* Scrollable List Container */}
                <div className="flex flex-col gap-2.5 max-h-[820px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {filteredModules.map((mod) => {
                    const isSelected = mod.id === selectedModuleId;
                    const activeState = getModuleActiveState(mod);

                    return (
                      <div
                        key={mod.id}
                        onClick={() => setSelectedModuleId(mod.id)}
                        className={`border rounded-xl p-3.5 flex flex-col gap-2 transition-all cursor-pointer group relative ${
                          isSelected
                            ? 'bg-surface-container-lowest border-2 border-primary-container shadow-sm'
                            : 'bg-surface-container-lowest hover:border-outline border-outline-variant'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute -left-1 top-4 bottom-4 w-1.5 bg-primary rounded-r"></div>
                        )}

                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-code-sm text-code-sm px-2 py-0.5 rounded font-bold ${
                                isSelected
                                  ? 'bg-primary-container text-on-primary'
                                  : 'bg-surface-container-high text-primary'
                              }`}
                            >
                              {mod.code}
                            </span>
                            <span
                              className={`font-label-sm text-[10px] px-2 py-0.5 rounded font-bold border ${activeState.bg}`}
                            >
                              {activeState.label}
                            </span>
                          </div>
                          <span
                            className={`font-code-sm text-code-sm ${
                              isSelected ? 'text-primary font-bold' : 'text-outline'
                            }`}
                          >
                            {mod.questionCount} Soal
                          </span>
                        </div>

                        <div>
                          <h4
                            className={`font-headline-sm text-[15px] font-semibold flex items-center justify-between transition-colors ${
                              isSelected ? 'text-primary font-bold' : 'text-on-surface group-hover:text-primary'
                            }`}
                          >
                            <span>{mod.title}</span>
                            {isSelected && (
                              <span className="material-symbols-outlined text-primary text-[18px]">
                                radio_button_checked
                              </span>
                            )}
                          </h4>
                          {mod.desc && (
                            <p className="font-body-sm text-outline text-[12px] mt-0.5 line-clamp-1">
                              {mod.desc}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-body-sm text-outline pt-1 border-t border-outline-variant/60">
                          <span className="font-code-sm text-[11px] truncate">
                            {isSelected ? 'Sedang Terpilih di Panel Kanan' : mod.avgDifficulty}
                          </span>
                          <button
                            type="button"
                            className="font-label-sm text-primary font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                          >
                            <span>Kelola Soal</span>
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT COLUMN: Detail Topic Panel */}
              <div className="xl:col-span-7 flex flex-col gap-space-md">
                {/* Detail Header Card */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col gap-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-code-sm text-code-sm px-2.5 py-0.5 rounded bg-primary-container text-on-primary font-bold">
                          {selectedModule.code}
                        </span>
                        <span className="font-label-sm text-[11px] text-primary font-semibold">
                          {selectedModule.category}
                        </span>
                      </div>
                      <h2 className="font-headline-md text-headline-md font-bold text-primary mt-0.5">
                        Detail Soal: {selectedModule.title}
                      </h2>
                      {(() => {
                        const activeInfo = getModuleActiveState(selectedModule);
                        return (
                          <div className="font-code-sm text-code-sm text-outline flex items-center gap-2 flex-wrap">
                            <span>Total {selectedModule.questionCount} Butir Soal Terdaftar</span>
                            <span>•</span>
                            <span className="text-on-surface">
                              Ambang Kelulusan: <strong className="text-primary font-semibold">75/100</strong>
                            </span>
                            <span>•</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold border ${activeInfo.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${activeInfo.status !== 'inactive' ? 'bg-emerald-600 animate-pulse' : 'bg-outline'}`}></span>
                              {activeInfo.label}
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Action Button Cluster */}
                    <div className="flex items-center gap-2 self-start flex-wrap">
                      {/* Tombol & Dropdown Aktivasi Kuis Praktikan */}
                      <div className="relative" ref={activationRef}>
                        <button
                          type="button"
                          onClick={() => setShowActivationDropdown((prev) => !prev)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm active:scale-[0.99] transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                          <span>Aktivasi Kuis</span>
                          <span className="material-symbols-outlined text-[16px]">expand_more</span>
                        </button>

                        {showActivationDropdown && (
                          <div className="absolute right-0 mt-1.5 w-64 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-30 p-1.5 space-y-1 animate-fadeIn text-xs">
                            <div className="px-2.5 py-1.5 font-bold text-on-surface border-b border-outline-variant/60 flex items-center justify-between">
                              <span>Pilih Kelompok Praktikan:</span>
                              <span className="text-[10px] text-outline">ST12.2</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleActivateForBatch('batch1')}
                              className="w-full text-left px-2.5 py-2 hover:bg-emerald-50 rounded-lg text-emerald-950 font-medium flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold">Aktifkan untuk C1 – C8</span>
                                <span className="text-[10px] text-on-surface-variant truncate">Batch 1 (8 Kelompok Praktikum)</span>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleActivateForBatch('batch2')}
                              className="w-full text-left px-2.5 py-2 hover:bg-blue-50 rounded-lg text-blue-950 font-medium flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold">Aktifkan untuk C9 – C16</span>
                                <span className="text-[10px] text-on-surface-variant truncate">Batch 2 (8 Kelompok Praktikum)</span>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleActivateForBatch('both')}
                              className="w-full text-left px-2.5 py-2 hover:bg-purple-50 rounded-lg text-purple-950 font-medium flex items-center gap-2 cursor-pointer transition-colors border-t border-outline-variant/40"
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0"></span>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold">Aktifkan untuk Semua (C1 – C16)</span>
                                <span className="text-[10px] text-on-surface-variant">Serempak 16 Kelompok</span>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={handleDeactivateSelected}
                              className="w-full text-left px-2.5 py-2 hover:bg-red-50 rounded-lg text-error font-medium flex items-center gap-2 cursor-pointer transition-colors border-t border-outline-variant/40"
                            >
                              <span className="material-symbols-outlined text-[16px] text-error">block</span>
                              <span>Nonaktifkan Modul Ini</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowPreviewQuizModal(true)}
                        className="px-3 py-1.5 border border-outline-variant hover:bg-surface-container-low text-on-surface rounded-lg font-label-md text-label-md flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>Pratinjau Kuis</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddQuestionModal(true)}
                        className="px-3.5 py-1.5 bg-primary-container hover:bg-primary text-on-primary rounded-lg font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm active:scale-[0.99] transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        <span>+ Tambah Soal</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Module Metric Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-outline-variant font-label-md text-label-md">
                    <div className="p-2.5 bg-surface rounded-lg border border-outline-variant flex flex-col">
                      <span className="text-outline font-label-sm text-[11px]">Distribusi Mudah</span>
                      <span className="font-headline-sm text-headline-sm font-bold text-primary mt-0.5">
                        {selectedModule.easyCount || 15} Soal ({Math.round(((selectedModule.easyCount || 15) / selectedModule.questionCount) * 100)}%)
                      </span>
                    </div>
                    <div className="p-2.5 bg-surface rounded-lg border border-outline-variant flex flex-col">
                      <span className="text-outline font-label-sm text-[11px]">Distribusi Sedang</span>
                      <span className="font-headline-sm text-headline-sm font-bold text-primary mt-0.5">
                        {selectedModule.medCount || 20} Soal ({Math.round(((selectedModule.medCount || 20) / selectedModule.questionCount) * 100)}%)
                      </span>
                    </div>
                    <div className="p-2.5 bg-surface rounded-lg border border-outline-variant flex flex-col">
                      <span className="text-outline font-label-sm text-[11px]">Distribusi Sulit</span>
                      <span className="font-headline-sm text-headline-sm font-bold text-primary mt-0.5">
                        {selectedModule.hardCount || 7} Soal ({Math.round(((selectedModule.hardCount || 7) / selectedModule.questionCount) * 100)}%)
                      </span>
                    </div>
                    <div className="p-2.5 bg-surface rounded-lg border border-outline-variant flex flex-col justify-between">
                      <span className="text-outline font-label-sm text-[11px]">Algoritma Acak</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-code-sm text-code-sm font-bold text-emerald-700">Randomizer ON</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question Bank Table Container */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
                  {/* Sub Header Control */}
                  <div className="p-space-md border-b border-outline-variant flex items-center justify-between bg-surface/50">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-headline-sm font-semibold text-primary">
                        Repositori Butir Soal Terverifikasi
                      </span>
                      <span className="font-code-sm text-code-sm bg-surface-container-high px-2 py-0.5 rounded text-primary font-medium">
                        {selectedModule.questions?.length || 0} Soal Siap Uji
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleModuleActive(selectedModule.id)}
                        className={`h-8 px-2.5 border rounded flex items-center gap-1 font-label-sm text-label-sm transition-colors cursor-pointer ${
                          selectedModule.status === 'Aktif'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-surface-container text-on-surface-variant border-outline-variant'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {selectedModule.status === 'Aktif' ? 'toggle_on' : 'toggle_off'}
                        </span>
                        <span>{selectedModule.status === 'Aktif' ? 'Modul Aktif' : 'Modul Draf'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Data Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-outline-variant bg-surface text-outline font-label-sm text-[11px] uppercase tracking-wider">
                          <th className="py-2.5 px-3 w-16 text-center">ID Soal</th>
                          <th className="py-2.5 px-3 min-w-[260px]">Butir Pertanyaan &amp; Formula Fisika</th>
                          <th className="py-2.5 px-3 w-32">Jenis Soal</th>
                          <th className="py-2.5 px-3 w-28 text-center">Tingkat</th>
                          <th className="py-2.5 px-3 w-20 text-center">Bobot</th>
                          <th className="py-2.5 px-3 w-24 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant font-body-sm text-[13px]">
                        {selectedModule.questions && selectedModule.questions.length > 0 ? (
                          selectedModule.questions.map((q) => (
                            <tr key={q.id} className="hover:bg-surface/80 transition-colors">
                              <td className="py-3 px-3 text-center font-code-sm text-code-sm text-outline">
                                {q.id}
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-medium text-on-surface leading-snug">
                                  {q.text}
                                </div>
                                {q.formula && (
                                  <div className="mt-1.5 p-1.5 bg-surface-container-low rounded border border-outline-variant/60 font-code-sm text-code-sm text-primary inline-block">
                                    {q.formula}
                                  </div>
                                )}
                                {q.keyAnswer && (
                                  <div className="mt-1 text-outline font-label-sm text-[11px]">
                                    Kunci: {q.keyAnswer}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-label-sm text-[11px] bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-medium">
                                  {q.type || 'Pilihan Ganda (5 Opsi)'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span
                                  className={`font-label-sm text-[11px] px-2 py-0.5 rounded font-semibold border ${
                                    q.difficulty === 'Sulit'
                                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                                      : q.difficulty === 'Mudah'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-blue-50 text-blue-800 border-blue-200'
                                  }`}
                                >
                                  {q.difficulty || 'Sedang'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center font-code-sm text-code-sm font-semibold text-primary">
                                {q.points || 20} Pts
                              </td>
                              <td className="py-3 px-3 text-center">
                                <div className="flex items-center justify-center gap-1 text-outline">
                                  <button
                                    type="button"
                                    onClick={() => showToast(`Edit soal ${q.id}`)}
                                    className="p-1 hover:text-primary hover:bg-surface-container rounded cursor-pointer"
                                    title="Edit Soal"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      showToast(`Soal ${q.id} berhasil diduplikasi.`);
                                    }}
                                    className="p-1 hover:text-primary hover:bg-surface-container rounded cursor-pointer"
                                    title="Duplikat"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="p-1 hover:text-error hover:bg-error-container rounded cursor-pointer"
                                    title="Hapus"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-outline">
                              Belum ada butir soal spesifik untuk topik ini. Klik '+ Tambah Soal' untuk menambahkan.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="p-3 border-t border-outline-variant flex items-center justify-between bg-surface font-label-md text-label-md">
                    <div className="font-code-sm text-code-sm text-outline">
                      Menampilkan 1-{selectedModule.questions?.length || 0} dari {selectedModule.questionCount} butir soal
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled
                        className="px-2.5 py-1 border border-outline-variant rounded bg-surface-container-lowest text-outline hover:text-on-surface hover:bg-surface-container-low disabled:opacity-50 text-xs flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">chevron_left</span>
                        <span>Sebelumnya</span>
                      </button>
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded bg-primary-container text-on-primary font-bold text-xs"
                      >
                        1
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast('Halaman 2')}
                        className="px-2.5 py-1 rounded hover:bg-surface-container text-on-surface text-xs"
                      >
                        2
                      </button>
                      <button
                        type="button"
                        className="px-2.5 py-1 border border-outline-variant rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container-low text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <span>Berikutnya</span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Apparatus & Calibration Notes */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col gap-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                    <div className="flex items-center gap-2 font-headline-sm text-headline-sm font-semibold text-primary">
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      <span>Verifikasi Alat Praktikum &amp; Parameter Soal</span>
                    </div>
                    <span className="font-code-sm text-code-sm text-outline">
                      Diperbarui: Sesi Ganjil 2026/2027 • Kalibrasi Presisi
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-body-sm text-[12px]">
                    <div className="p-2.5 rounded-lg bg-surface border border-outline-variant">
                      <div className="font-label-sm font-semibold text-primary">Garputala Standar</div>
                      <div className="font-code-sm text-outline mt-0.5">f₀ = 440 Hz (Nada A) &amp; f₁ = 512 Hz</div>
                      <div className="mt-2 text-emerald-700 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        <span>Terkalibrasi Stroboskop</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface border border-outline-variant">
                      <div className="font-label-sm font-semibold text-primary">Tabung Resonansi Kaca</div>
                      <div className="font-code-sm text-outline mt-0.5">L_max = 100.0 cm, D = 3.20 cm</div>
                      <div className="mt-2 text-emerald-700 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        <span>Skala Milimeter Jelas</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface border border-outline-variant">
                      <div className="font-label-sm font-semibold text-primary">Termohigrometer Ruang</div>
                      <div className="font-code-sm text-outline mt-0.5">T = 27.4 °C • RH = 68%</div>
                      <div className="mt-2 text-primary font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">info</span>
                        <span>Koreksi Laju v = 347.8 m/s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Persistent Minimal Footer */}
          <footer className="mt-auto px-space-lg py-3 border-t border-outline-variant bg-surface-container-lowest text-outline font-label-sm text-[12px] flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>Laboratorium Fisika Dasar FMIPA • Institut Pertanian Bogor (IPB University)</div>
            <div className="font-code-sm text-code-sm text-outline">
              Sistem Bank Soal v2.4.0 • Standar ISO/IEC 17025 Laboratorium Pengujian
            </div>
          </footer>
        </div>

      {/* =========================================================================
          MODALS
         ========================================================================= */}

      {/* 1. Modal Tambah Soal */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-outline-variant animate-fadeIn">
            <div className="flex items-start justify-between border-b border-outline-variant/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
                    Tambah Butir Soal Baru
                  </h3>
                  <p className="font-code-sm text-code-sm text-on-surface-variant">
                    {selectedModule.code} - {selectedModule.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddQuestionModal(false)}
                className="text-outline hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveNewQuestion} className="space-y-3 font-body-sm text-body-sm">
              <div>
                <label className="block font-label-md font-semibold text-primary mb-1">
                  Butir Pertanyaan Fisika <span className="text-error">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newQPrompt}
                  onChange={(e) => setNewQPrompt(e.target.value)}
                  placeholder="Tuliskan butir soal pra-praktikum di sini..."
                  className="w-full p-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary text-sm"
                />
              </div>

              <div>
                <label className="block font-label-md font-semibold text-primary mb-1">
                  Formula Acuan / LaTeX (Opsional)
                </label>
                <input
                  type="text"
                  value={newQFormula}
                  onChange={(e) => setNewQFormula(e.target.value)}
                  placeholder="Contoh: v = f \cdot \lambda \quad \Big| \quad L + e = \lambda / 4"
                  className="w-full h-10 px-3 bg-surface border border-outline-variant rounded-lg font-code-sm text-on-surface focus:outline-none focus:border-primary text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-label-sm font-semibold text-primary mb-1">
                    Jenis Soal
                  </label>
                  <select
                    value={newQType}
                    onChange={(e) => setNewQType(e.target.value)}
                    className="w-full h-9 px-2 bg-surface border border-outline-variant rounded-lg text-xs"
                  >
                    <option>Pilihan Ganda (5 Opsi)</option>
                    <option>Isian Numerik</option>
                    <option>Analisis Grafik</option>
                  </select>
                </div>

                <div>
                  <label className="block font-label-sm font-semibold text-primary mb-1">
                    Tingkat Kesulitan
                  </label>
                  <select
                    value={newQDifficulty}
                    onChange={(e) => setNewQDifficulty(e.target.value)}
                    className="w-full h-9 px-2 bg-surface border border-outline-variant rounded-lg text-xs"
                  >
                    <option>Mudah</option>
                    <option>Sedang</option>
                    <option>Sulit</option>
                  </select>
                </div>

                <div>
                  <label className="block font-label-sm font-semibold text-primary mb-1">
                    Bobot Poin
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={newQPoints}
                    onChange={(e) => setNewQPoints(e.target.value)}
                    className="w-full h-9 px-2 bg-surface border border-outline-variant rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-sm font-semibold text-primary mb-1">
                  Kunci Jawaban &amp; Pembahasan
                </label>
                <input
                  type="text"
                  value={newQKey}
                  onChange={(e) => setNewQKey(e.target.value)}
                  placeholder="Contoh: C. 338.4 m/s (Gunakan e = 0,82 cm)"
                  className="w-full h-9 px-3 bg-surface border border-outline-variant rounded-lg text-xs font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-outline-variant/60">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="flex-1 h-10 rounded-lg bg-surface-container text-on-surface font-label-md font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
                >
                  Simpan Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Tambah Topik Baru */}
      {showAddTopicModal && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-outline-variant animate-fadeIn">
            <div className="flex items-start justify-between border-b border-outline-variant/60 pb-3">
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
                  Tambah Topik Praktikum Baru
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Kurikulum Laboratorium Fisika IPB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTopicModal(false)}
                className="text-outline hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('Topik praktikum baru berhasil ditambahkan.');
                setShowAddTopicModal(false);
              }}
              className="space-y-3 font-body-sm"
            >
              <div>
                <label className="block font-label-sm font-semibold text-primary mb-1">
                  Kode Topik (misal: FIS-17)
                </label>
                <input
                  required
                  placeholder="FIS-17"
                  className="w-full h-10 px-3 bg-surface border border-outline-variant rounded-lg text-sm font-code-sm"
                />
              </div>

              <div>
                <label className="block font-label-sm font-semibold text-primary mb-1">
                  Judul Modul Praktikum
                </label>
                <input
                  required
                  placeholder="Contoh: Modul 17: Spektroskopi Kisi Prisma"
                  className="w-full h-10 px-3 bg-surface border border-outline-variant rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-label-sm font-semibold text-primary mb-1">
                  Bidang Kajian
                </label>
                <select className="w-full h-10 px-3 bg-surface border border-outline-variant rounded-lg text-sm">
                  <option>Mekanika Klasik</option>
                  <option>Termodinamika &amp; Fluida</option>
                  <option>Gelombang &amp; Optik</option>
                  <option>Listrik &amp; Magnet</option>
                  <option>Fisika Modern &amp; Kuantum</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2 border-t border-outline-variant/60">
                <button
                  type="button"
                  onClick={() => setShowAddTopicModal(false)}
                  className="flex-1 h-10 rounded-lg bg-surface-container text-on-surface font-label-md font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-lg bg-primary text-on-primary font-label-md font-semibold shadow-sm"
                >
                  Simpan Topik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Pratinjau Kuis */}
      {showPreviewQuizModal && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-outline-variant max-h-[85vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-start justify-between border-b border-outline-variant/60 pb-3">
              <div>
                <span className="font-code-sm text-code-sm font-bold text-primary-container uppercase">
                  Pratinjau Kuis Praktikan • {selectedModule.code}
                </span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-primary">
                  {selectedModule.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewQuizModal(false)}
                className="text-outline hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-3 bg-secondary-fixed/40 rounded-lg border border-secondary-container/40 flex items-center justify-between text-body-sm">
              <span>Waktu Kuis Standar: <strong>15 Menit</strong> (15 Butir Soal Acak)</span>
              <span className="text-secondary font-bold font-code-sm">Passkey Terproteksi</span>
            </div>

            <div className="space-y-3 font-body-sm">
              {selectedModule.questions?.map((q, idx) => (
                <div key={q.id} className="p-3.5 bg-surface-container-low rounded-lg border border-outline-variant/40 space-y-2">
                  <div className="flex items-center justify-between font-code-sm text-[12px] text-primary font-bold">
                    <span>Soal {idx + 1 < 10 ? `0${idx + 1}` : idx + 1} ({q.id})</span>
                    <span className="text-on-surface-variant font-normal">{q.difficulty} • {q.points} Pts</span>
                  </div>
                  <p className="font-medium text-on-surface">{q.text}</p>
                  {q.formula && (
                    <div className="p-2 bg-surface-container-lowest rounded border border-outline-variant/40 font-code-sm text-primary">
                      {q.formula}
                    </div>
                  )}
                  {q.keyAnswer && (
                    <div className="text-emerald-800 text-[12px] font-semibold">
                      Kunci: {q.keyAnswer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowPreviewQuizModal(false)}
              className="w-full h-10 bg-primary text-on-primary font-label-md font-semibold rounded-lg hover:bg-primary-container transition-colors shadow-sm"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SideNavBar from '../../components/asisten/SideNavBar';
import { OFFICIAL_PRAKTIKAN_ROSTER } from '../../services/mockData';

// 14 Mandatory Physics Quiz Modules per IPB Curriculum
const MODULES_LIST = [
  { code: 'P00', shortTitle: 'Alat & K3', fullTitle: 'Pengenalan Alat & K3' },
  { code: 'P01', shortTitle: 'Pengukuran', fullTitle: 'Pengukuran Dasar' },
  { code: 'P02', shortTitle: 'Kinematika', fullTitle: 'Kinematika & Parabola' },
  { code: 'P03', shortTitle: 'Newton', fullTitle: 'Hukum Newton & Gesekan' },
  { code: 'P04', shortTitle: 'Resonansi', fullTitle: 'Resonansi Bunyi' },
  { code: 'P05', shortTitle: 'Viskositas', fullTitle: 'Viskositas Fluida' },
  { code: 'P06', shortTitle: 'Kalorimeter', fullTitle: 'Kalorimeter & Asas Black' },
  { code: 'P08', shortTitle: 'Optika', fullTitle: 'Optika Geometri & Lensa' },
  { code: 'P13', shortTitle: 'Wheatstone', fullTitle: 'Jembatan Wheatstone' },
  { code: 'P15', shortTitle: 'Induksi EM', fullTitle: 'Induksi Elektromagnetik' },
  { code: 'P16', shortTitle: 'Difraksi', fullTitle: 'Difraksi & Interferensi Cahaya' },
  { code: 'P17', shortTitle: 'Fotolistrik', fullTitle: 'Efek Fotolistrik' },
  { code: 'P18', shortTitle: 'Radioaktivitas', fullTitle: 'Radioaktivitas & Peluruhan' },
  { code: 'P19', shortTitle: 'Inersia', fullTitle: 'Momen Inersia' }
];

// Presets for realistic academic grades across the 39 official practical students
const SCORE_TEMPLATES = [
  { P00: 94, P01: 90, P02: 92, P03: 95, P04: 88, P05: 90, P06: 96, P08: 92, P13: 90, P15: 86, P16: 92, P17: null, P18: null, P19: null },
  { P00: 88, P01: 85, P02: 82, P03: 86, P04: 80, P05: 84, P06: 88, P08: 82, P13: 84, P15: 78, P16: 82, P17: null, P18: null, P19: null },
  { P00: 82, P01: 78, P02: 74, P03: 80, P04: 76, P05: 64, P06: 78, P08: 72, P13: 75, P15: 70, P16: 76, P17: null, P18: null, P19: null }, // remedial P05
  { P00: 96, P01: 94, P02: 90, P03: 98, P04: 92, P05: 94, P06: 95, P08: 90, P13: 92, P15: 88, P16: 90, P17: null, P18: null, P19: null },
  { P00: 75, P01: 70, P02: 68, P03: 72, P04: 74, P05: 58, P06: 70, P08: 68, P13: 70, P15: 65, P16: 72, P17: null, P18: null, P19: null }, // remedial P02, P05
  { P00: 90, P01: 88, P02: 85, P03: 92, P04: 84, P05: 86, P06: 90, P08: 84, P13: 86, P15: 82, P16: 88, P17: null, P18: null, P19: null },
  { P00: 85, P01: 82, P02: 80, P03: 88, P04: 78, P05: 82, P06: 85, P08: 80, P13: 82, P15: 76, P16: 80, P17: null, P18: null, P19: null },
  { P00: 78, P01: 75, P02: 62, P03: 76, P04: 70, P05: 66, P06: 72, P08: 70, P13: 74, P15: 68, P16: 74, P17: null, P18: null, P19: null }  // remedial P02, P05
];

// Initial Authentic Student Roster populated with all 39 practical students (Kelompok C1 s.d C16)
const INITIAL_STUDENTS = OFFICIAL_PRAKTIKAN_ROSTER.map((student, idx) => {
  const template = SCORE_TEMPLATES[idx % SCORE_TEMPLATES.length];
  return {
    id: `std-${idx + 1}`,
    no: String(idx + 1).padStart(2, '0'),
    name: student.name,
    nim: student.nim,
    group: `C-${String(student.groupNumber).padStart(2, '0')}`,
    groupNumber: student.groupNumber,
    paralel: student.department,
    scores: { ...template }
  };
});

export default function RekapNilaiAsisten() {
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

  // State
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('Semua Kelompok');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [toastMessage, setToastMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Modals State
  const [remedialStudent, setRemedialStudent] = useState(null);
  const [remedialScores, setRemedialScores] = useState({});
  const [detailStudent, setDetailStudent] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to compute student average & status
  const enrichedStudents = useMemo(() => {
    return students.map((std) => {
      const validScores = Object.values(std.scores).filter((val) => typeof val === 'number');
      const sum = validScores.reduce((acc, curr) => acc + curr, 0);
      const avg = validScores.length > 0 ? (sum / validScores.length).toFixed(1) : '0.0';
      const numAvg = parseFloat(avg);

      // Check if any completed score < 70
      const hasAnyRemedialScore = validScores.some((val) => val < 70);
      const isRemedial = numAvg < 70 || hasAnyRemedialScore;

      return {
        ...std,
        calculatedAverage: avg,
        numericAverage: numAvg,
        status: isRemedial ? 'REMEDIAL' : 'LULUS',
        hasAnyRemedialScore
      };
    });
  }, [students]);

  // Summary Metrics
  const totalStudents = enrichedStudents.length;
  const overallAverage = useMemo(() => {
    if (enrichedStudents.length === 0) return '0.0';
    const total = enrichedStudents.reduce((acc, curr) => acc + curr.numericAverage, 0);
    return (total / enrichedStudents.length).toFixed(1);
  }, [enrichedStudents]);

  const passedCount = enrichedStudents.filter((s) => s.status === 'LULUS').length;
  const passingRate = totalStudents > 0 ? ((passedCount / totalStudents) * 100).toFixed(1) : '0.0';
  const remedialCount = enrichedStudents.filter((s) => s.status === 'REMEDIAL').length;

  // Filtered List
  const filteredStudents = useMemo(() => {
    return enrichedStudents.filter((s) => {
      // Kelompok / Batch Filter
      if (groupFilter !== 'Semua Kelompok') {
        if (groupFilter === 'Batch C1 - C8') {
          if (s.groupNumber > 8) return false;
        } else if (groupFilter === 'Batch C9 - C16') {
          if (s.groupNumber <= 8) return false;
        } else {
          const num = parseInt(groupFilter.replace(/\D/g, ''));
          if (s.groupNumber !== num) return false;
        }
      }

      // Status Filter
      if (statusFilter === 'Lulus Sempurna (≥ 70)' && s.status !== 'LULUS') return false;
      if (statusFilter === 'Wajib Remedial (< 70)' && s.status !== 'REMEDIAL') return false;
      if (statusFilter === 'Belum Lengkap' && s.numericAverage >= 70 && !s.hasAnyRemedialScore) return false;

      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchNim = s.nim.toLowerCase().includes(q);
        const matchGroup = s.group.toLowerCase().includes(q);
        const matchParalel = s.paralel.toLowerCase().includes(q);
        if (!matchName && !matchNim && !matchGroup && !matchParalel) return false;
      }

      return true;
    });
  }, [enrichedStudents, groupFilter, statusFilter, searchQuery]);

  // Paginated List
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setGroupFilter('Semua Kelompok');
    setStatusFilter('Semua Status');
    setCurrentPage(1);
    showToast('Filter telah direset ke data default.');
  };

  // Open Remedial Modal
  const handleOpenRemedialModal = (student) => {
    setRemedialStudent(student);
    // Preset current scores for failing modules
    const failingScores = {};
    MODULES_LIST.forEach((m) => {
      const val = student.scores[m.code];
      if (typeof val === 'number' && val < 70) {
        failingScores[m.code] = 75; // Recommended passing default
      }
    });
    setRemedialScores(failingScores);
  };

  // Save Remedial Score
  const handleSaveRemedial = (e) => {
    e.preventDefault();
    if (!remedialStudent) return;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === remedialStudent.id) {
          const newScores = { ...s.scores };
          Object.keys(remedialScores).forEach((code) => {
            const entered = parseInt(remedialScores[code], 10);
            if (!isNaN(entered) && entered >= 0 && entered <= 100) {
              newScores[code] = entered;
            }
          });
          return { ...s, scores: newScores };
        }
        return s;
      })
    );

    showToast(`Nilai remedial ${remedialStudent.name} berhasil disimpan!`);
    setRemedialStudent(null);
  };

  // Export to CSV / Spreadsheet
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Nama Praktikan',
      'NIM',
      'Kelompok',
      'Paralel',
      ...MODULES_LIST.map((m) => m.code),
      'Rata-rata',
      'Status'
    ];

    const rows = filteredStudents.map((s) => [
      s.no,
      `"${s.name}"`,
      s.nim,
      s.group,
      `"${s.paralel}"`,
      ...MODULES_LIST.map((m) => (s.scores[m.code] !== null ? s.scores[m.code] : '-')),
      s.calculatedAverage,
      s.status
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Nilai_Kuis_Fisika_Dasar_IPB_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Rekapitulasi spreadsheet (.csv) berhasil diunduh!');
  };

  // Print / PDF
  const handlePrint = () => {
    window.print();
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

      {/* =========================================================================
          SHARED COMPONENT: SideNavBar
         ========================================================================= */}
      <SideNavBar activeTab="rekap" onShowToast={showToast} />

      {/* =========================================================================
          MAIN CANVAS (Offset by Sidebar 256px / w-64)
         ========================================================================= */}
      <div className="flex-1 flex flex-col pl-64 h-screen overflow-hidden">
        {/* TOP NAVBAR */}
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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari mahasiswa, NIM, kelompok..."
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
              onClick={() => showToast('Kalibrasi bobot penilaian terverifikasi.')}
              className="h-9 px-3 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '18px' }}>
                tune
              </span>
              <span>Kalibrasi Alat</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
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
              onClick={() => showToast(`${remedialCount} mahasiswa dalam daftar tunggu remedial.`)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors relative cursor-pointer"
              title="Notifikasi"
            >
              <span className="material-symbols-outlined">notifications</span>
              {remedialCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-ping"></span>}
            </button>
            <button
              type="button"
              onClick={() => showToast('Panduan Rekapitulasi Nilai Lab Fisika IPB')}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
              title="Bantuan"
            >
              <span className="material-symbols-outlined">help_outline</span>
            </button>
          </div>
        </header>

        {/* CONTENT BODY (Scrollable Container) */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top-Left Page Header Banner (Benchmark Style) */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg shadow-sm">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-outline-variant">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-code-sm text-code-sm px-2 py-0.5 bg-primary-container text-on-primary rounded font-semibold uppercase">
                    Rekapitulasi Akademik
                  </span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">
                    Kurikulum Fisika FMIPA IPB
                  </span>
                </div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">
                  Rekapitulasi Nilai Kuis Praktikan
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  Evaluasi komprehensif nilai kuis pra-praktikum 14 modul fisika dasar laboratorium
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="h-10 px-4 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md rounded-lg flex items-center gap-2 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-outline" style={{ fontSize: '18px' }}>
                    table_view
                  </span>
                  <span>Ekspor Spreadsheet (.csv)</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="h-10 px-4 bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md rounded-lg flex items-center gap-2 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '18px' }}>
                    picture_as_pdf
                  </span>
                  <span>Unduh Rekap PDF</span>
                </button>
              </div>
            </div>
          </section>
          {/* ===================================================================
              BENTO / STATS SUMMARY TILES
             =================================================================== */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
            {/* Tile 1: Total Praktikan */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                  Total Praktikan Terdaftar
                </span>
                <span className="material-symbols-outlined text-primary text-[22px]" data-icon="groups">
                  groups
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-space-sm">
                <span className="font-headline-lg text-headline-lg font-bold text-primary font-code-md">
                  {totalStudents}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Mahasiswa</span>
              </div>
              <div className="mt-1 text-on-surface-variant font-code-sm text-code-sm">
                Tersebar di 4 paralel praktikum
              </div>
            </div>

            {/* Tile 2: Rata-rata Nilai */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                  Rata-rata Nilai Keseluruhan
                </span>
                <span className="material-symbols-outlined text-primary text-[22px]" data-icon="analytics">
                  analytics
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-space-sm">
                <span className="font-headline-lg text-headline-lg font-bold text-primary font-code-md">
                  {overallAverage}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">/ 100</span>
              </div>
              <div className="mt-1 text-on-surface-variant font-code-sm text-code-sm flex items-center gap-1 text-tertiary-container">
                <span className="material-symbols-outlined text-[16px]" data-icon="trending_up">
                  trending_up
                </span>
                <span>+2.3 poin dibanding Sesi Genap</span>
              </div>
            </div>

            {/* Tile 3: Tingkat Kelulusan */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                  Tingkat Kelulusan Kuis
                </span>
                <span className="material-symbols-outlined text-tertiary-container text-[22px]" data-icon="verified">
                  verified
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-space-sm">
                <span className="font-headline-lg text-headline-lg font-bold text-primary font-code-md">
                  {passingRate}%
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {passedCount} Mahasiswa
                </span>
              </div>
              <div className="mt-1 text-on-surface-variant font-code-sm text-code-sm">
                Batas kelulusan minimum: ≥ 70.0
              </div>
            </div>

            {/* Tile 4: Remedial Tertunda */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-error font-semibold">
                  Remedial Tertunda
                </span>
                <span className="material-symbols-outlined text-error text-[22px]" data-icon="warning">
                  warning
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-space-sm">
                <span className="font-headline-lg text-headline-lg font-bold text-error font-code-md">
                  {remedialCount}
                </span>
                <span className="font-body-sm text-body-sm text-error">Praktikan</span>
              </div>
              <div className="mt-1 text-on-surface-variant font-code-sm text-code-sm">
                Perlu verifikasi jadwal ulang kuis
              </div>
            </div>
          </section>

          {/* ===================================================================
              FILTER & SEARCH CONTROL BAR
             =================================================================== */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md shadow-sm">
            {/* Left: Search Box */}
            <div className="flex items-center gap-space-md flex-1 max-w-xl">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline" data-icon="search">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-0 transition-colors"
                  placeholder="Cari nama mahasiswa atau NIM (misal: G64012110...)"
                />
              </div>
            </div>

            {/* Right: Select Filters */}
            <div className="flex flex-wrap items-center gap-space-sm">
              <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant">
                <span className="material-symbols-outlined text-outline" data-icon="filter_alt">
                  filter_alt
                </span>
                <span>Filter:</span>
              </div>

              {/* Filter Kelompok & Batch */}
              <select
                value={groupFilter}
                onChange={(e) => {
                  setGroupFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-surface-container-lowest border border-outline-variant rounded-lg py-1.5 px-3 font-label-md text-label-md text-on-surface focus:border-primary focus:ring-0 cursor-pointer"
              >
                <option value="Semua Kelompok">Semua Kelompok (C1–C16)</option>
                <option value="Batch C1 - C8">Batch C1 – C8 (Lab 1)</option>
                <option value="Batch C9 - C16">Batch C9 – C16 (Lab 1)</option>
                {Array.from({ length: 16 }, (_, i) => (
                  <option key={i + 1} value={`Kelompok C${i + 1}`}>
                    Kelompok C{i + 1}
                  </option>
                ))}
              </select>

              {/* Filter Status Nilai */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-surface-container-lowest border border-outline-variant rounded-lg py-1.5 px-3 font-label-md text-label-md text-on-surface focus:border-primary focus:ring-0 cursor-pointer"
              >
                <option>Semua Status</option>
                <option>Lulus Sempurna (≥ 70)</option>
                <option>Wajib Remedial (&lt; 70)</option>
                <option>Belum Lengkap</option>
              </select>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low text-on-surface-variant cursor-pointer transition-colors"
                title="Segarkan Data"
              >
                <span className="material-symbols-outlined" data-icon="refresh">
                  refresh
                </span>
              </button>
            </div>
          </section>

          {/* ===================================================================
              HIGH-DENSITY ACADEMIC GRADEBOOK TABLE
             =================================================================== */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-none flex flex-col">
            {/* Table Scroll Container */}
            <div className="overflow-x-auto max-h-[560px] relative custom-scrollbar">
              <table className="w-full text-left border-collapse border-spacing-0">
                {/* Table Header */}
                <thead className="bg-surface-container-low border-b border-outline-variant sticky top-0 z-30 font-label-sm text-label-sm text-on-surface select-none">
                  <tr>
                    {/* Col 1: No (Freeze) */}
                    <th className="py-3 px-3 text-center border-r border-outline-variant font-semibold w-12 freeze-col-0 bg-surface-container-low">
                      No
                    </th>
                    {/* Col 2: Nama Praktikan (Freeze) */}
                    <th className="py-3 px-3 border-r border-outline-variant font-semibold min-w-[190px] freeze-col-1 bg-surface-container-low">
                      Nama Praktikan
                    </th>
                    {/* Col 3: NIM (Freeze) */}
                    <th className="py-3 px-3 border-r border-outline-variant font-semibold min-w-[130px] freeze-col-2 bg-surface-container-low">
                      NIM
                    </th>
                    {/* Col 4: Kelompok (Freeze) */}
                    <th className="py-3 px-3 border-r border-outline-variant font-semibold min-w-[80px] text-center freeze-col-3 bg-surface-container-low">
                      Kel.
                    </th>

                    {/* 14 Mandatory Physics Quiz Columns */}
                    {MODULES_LIST.map((m) => (
                      <th
                        key={m.code}
                        className="py-2.5 px-2 border-r border-outline-variant text-center font-medium min-w-[88px]"
                        title={m.fullTitle}
                      >
                        <div className="font-code-sm font-semibold">{m.code}</div>
                        <div className="text-[10px] text-on-surface-variant font-normal leading-tight">
                          {m.shortTitle}
                        </div>
                      </th>
                    ))}

                    {/* Evaluative Summary Columns */}
                    <th className="py-3 px-3 border-r border-outline-variant text-center font-semibold min-w-[90px] bg-surface-container">
                      Rata-rata
                    </th>
                    <th className="py-3 px-3 border-r border-outline-variant text-center font-semibold min-w-[110px]">
                      Status
                    </th>
                    <th className="py-3 px-3 text-center font-semibold min-w-[95px]">
                      Aksi
                    </th>
                  </tr>
                </thead>

                {/* Table Rows with Authentic Scientific Student Roster */}
                <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm text-on-surface">
                  {paginatedStudents.map((student) => {
                    const isRemedial = student.status === 'REMEDIAL';

                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-surface-container-low transition-colors duration-100"
                      >
                        {/* Col 1: No */}
                        <td className="py-2 px-3 text-center border-r border-outline-variant font-code-sm text-outline freeze-col-0 bg-surface-container-lowest">
                          {student.no}
                        </td>

                        {/* Col 2: Nama */}
                        <td className="py-2 px-3 border-r border-outline-variant font-medium text-on-surface freeze-col-1 bg-surface-container-lowest">
                          {student.name}
                        </td>

                        {/* Col 3: NIM */}
                        <td className="py-2 px-3 border-r border-outline-variant font-code-sm text-code-sm text-on-surface-variant freeze-col-2 bg-surface-container-lowest">
                          {student.nim}
                        </td>

                        {/* Col 4: Kelompok */}
                        <td className="py-2 px-3 border-r border-outline-variant text-center font-code-sm freeze-col-3 bg-surface-container-lowest">
                          {student.group}
                        </td>

                        {/* 14 Modul Scores */}
                        {MODULES_LIST.map((m) => {
                          const val = student.scores[m.code];
                          const isFailing = typeof val === 'number' && val < 70;

                          if (val === null || val === undefined) {
                            return (
                              <td
                                key={m.code}
                                className="py-2 px-2 border-r border-outline-variant text-center font-code-sm text-outline"
                              >
                                -
                              </td>
                            );
                          }

                          return (
                            <td
                              key={m.code}
                              className={`py-2 px-2 border-r border-outline-variant text-center font-code-sm ${
                                isFailing
                                  ? 'text-error font-semibold bg-error-container/20'
                                  : 'text-on-surface'
                              }`}
                            >
                              {val}
                            </td>
                          );
                        })}

                        {/* Rata-rata */}
                        <td
                          className={`py-2 px-3 border-r border-outline-variant text-center font-code-sm font-semibold bg-surface-container-low ${
                            isRemedial ? 'text-error' : 'text-primary'
                          }`}
                        >
                          {student.calculatedAverage}
                        </td>

                        {/* Status Badge */}
                        <td className="py-2 px-3 border-r border-outline-variant text-center">
                          {isRemedial ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-code-sm font-semibold bg-error-container text-on-error-container border border-error/20">
                              REMEDIAL
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-code-sm font-semibold bg-surface-container text-tertiary-container border border-outline-variant">
                              LULUS
                            </span>
                          )}
                        </td>

                        {/* Aksi Button */}
                        <td className="py-2 px-3 text-center">
                          {isRemedial ? (
                            <button
                              type="button"
                              onClick={() => handleOpenRemedialModal(student)}
                              className="p-1 text-error hover:bg-error-container/30 rounded cursor-pointer transition-colors"
                              title="Input Nilai Remedial"
                            >
                              <span
                                className="material-symbols-outlined text-[16px]"
                                data-icon="edit_calendar"
                              >
                                edit_calendar
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDetailStudent(student)}
                              className="p-1 text-on-surface-variant hover:text-primary rounded hover:bg-surface-container cursor-pointer transition-colors"
                              title="Detail Log"
                            >
                              <span
                                className="material-symbols-outlined text-[16px]"
                                data-icon="edit_note"
                              >
                                edit_note
                              </span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* TABLE PAGINATION FOOTER */}
            <div className="px-space-md py-3 border-t border-outline-variant bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="font-body-sm text-body-sm text-on-surface-variant">
                Menampilkan{' '}
                <span className="font-semibold text-on-surface font-code-sm">
                  {filteredStudents.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, filteredStudents.length)}
                </span>{' '}
                dari{' '}
                <span className="font-semibold text-on-surface font-code-sm">
                  {filteredStudents.length}
                </span>{' '}
                Praktikan
              </div>

              {/* Pagination Button Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 text-on-surface-variant hover:bg-surface-container rounded border border-outline-variant font-label-md text-label-md flex items-center gap-1 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]" data-icon="chevron_left">
                    chevron_left
                  </span>
                  <span>Sebelumnya</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCurrentPage(num)}
                    className={`w-8 h-8 rounded font-code-sm text-code-sm font-semibold flex items-center justify-center cursor-pointer transition-colors ${
                      currentPage === num
                        ? 'bg-primary text-on-primary'
                        : 'hover:bg-surface-container text-on-surface border border-transparent hover:border-outline-variant'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 text-on-surface-variant hover:bg-surface-container rounded border border-outline-variant font-label-md text-label-md flex items-center gap-1 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Selanjutnya</span>
                  <span className="material-symbols-outlined text-[16px]" data-icon="chevron_right">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* AUDIT LOG & REVISION FOOTNOTE (Academic Precision) */}
          <footer className="pt-2 pb-6 flex flex-col sm:flex-row items-center justify-between text-outline font-code-sm text-code-sm gap-2">
            <div className="flex items-center gap-space-md">
              <span>Sistem Sinkronisasi Kuis Otomatis Terhubung (WebSocket Port 8443)</span>
              <span>•</span>
              <span>Log Terakhir: Hari ini, 15:42 WIB oleh AST-02</span>
            </div>
            <div>
              <span>FMIPA IPB University • Lab Fisika Dasar 2024/2025</span>
            </div>
          </footer>
        </main>
      </div>

      {/* =========================================================================
          MODAL: INPUT NILAI REMEDIAL PRAKTIKAN
         ========================================================================= */}
      {remedialStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xl overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="px-6 py-4 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-error-container text-error flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]" data-icon="edit_calendar">
                    edit_calendar
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-sm font-bold text-primary">Input Nilai Remedial Kuis</h3>
                  <p className="font-body-sm text-on-surface-variant">
                    Pembaruan Nilai Standar Kompetensi Minimum (SKM ≥ 70)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRemedialStudent(null)}
                className="text-on-surface-variant hover:text-primary p-1 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveRemedial} className="p-6 space-y-4 font-body-sm">
              <div className="p-3 bg-surface-container-low border border-outline-variant rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-headline-sm font-semibold text-primary">{remedialStudent.name}</div>
                  <div className="font-code-sm text-on-surface-variant">
                    NIM: {remedialStudent.nim} • {remedialStudent.group} ({remedialStudent.paralel})
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-code-sm font-semibold text-xs">
                  Rata-rata: {remedialStudent.calculatedAverage}
                </span>
              </div>

              <div className="space-y-3">
                <label className="block font-label-sm uppercase font-semibold text-on-surface-variant">
                  Modul yang Membutuhkan Remedial (&lt; 70)
                </label>

                {Object.keys(remedialScores).length === 0 ? (
                  <p className="text-on-surface-variant italic">
                    Semua modul telah memenuhi ambang batas minimum.
                  </p>
                ) : (
                  Object.keys(remedialScores).map((code) => {
                    const modInfo = MODULES_LIST.find((m) => m.code === code);
                    const originalScore = remedialStudent.scores[code];

                    return (
                      <div
                        key={code}
                        className="flex items-center justify-between p-3 rounded-lg border border-outline-variant bg-surface"
                      >
                        <div>
                          <div className="font-semibold text-primary">
                            {code} - {modInfo?.fullTitle || code}
                          </div>
                          <div className="text-xs text-on-surface-variant">
                            Nilai Asli Sebelumnya:{' '}
                            <span className="text-error font-bold font-code-sm">{originalScore}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-on-surface-variant">Nilai Baru:</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            required
                            value={remedialScores[code] || ''}
                            onChange={(e) =>
                              setRemedialScores({
                                ...remedialScores,
                                [code]: e.target.value
                              })
                            }
                            className="w-16 h-9 px-2 text-center font-code-md font-bold text-primary border border-outline-variant rounded-lg focus:border-primary focus:ring-0"
                          />
                        </div>
                      </div>
                    );
                  })
                )}

                <div className="p-2.5 rounded-lg bg-surface-container text-xs text-on-surface-variant flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-outline mt-0.5">info</span>
                  <span>
                    Berdasarkan peraturan akademik IPB, nilai hasil remedial kuis mandiri diakui maksimal
                    sebesar <strong>75.0 (B)</strong>.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setRemedialStudent(null)}
                  className="px-4 py-2 bg-surface-container-low text-on-surface hover:bg-surface-container rounded-lg font-label-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-on-primary hover:bg-primary-container rounded-lg font-label-md font-semibold shadow-sm cursor-pointer"
                >
                  Simpan &amp; Perbarui Rekapitulasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DETAIL LOG PRAKTIKAN
         ========================================================================= */}
      {detailStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div>
                <h3 className="font-headline-sm font-bold text-primary">Detail Rekam Akademik Kuis</h3>
                <p className="font-code-sm text-code-sm text-on-surface-variant">
                  {detailStudent.nim} • {detailStudent.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailStudent(null)}
                className="text-outline hover:text-primary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-body-sm">
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/60">
                <span className="text-xs text-on-surface-variant">Rata-rata Nilai:</span>
                <div className="text-xl font-bold font-code-md text-primary">
                  {detailStudent.calculatedAverage} / 100
                </div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/60">
                <span className="text-xs text-on-surface-variant">Status Kuis:</span>
                <div className="text-sm font-bold text-tertiary-container mt-1">
                  LULUS VERIFIKASI ASISTEN
                </div>
              </div>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <span className="font-label-sm uppercase font-semibold text-on-surface-variant">
                Riwayat Perolehan Kuis Sesi Ini
              </span>
              {MODULES_LIST.map((m) => {
                const s = detailStudent.scores[m.code];
                return (
                  <div
                    key={m.code}
                    className="flex justify-between items-center py-1 border-b border-outline-variant/40 text-xs"
                  >
                    <span>{m.code} - {m.fullTitle}</span>
                    <span className="font-code-sm font-bold">
                      {s !== null ? s : <span className="text-outline">Belum ada nilai</span>}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setDetailStudent(null)}
              className="w-full h-10 bg-primary text-on-primary font-semibold rounded-lg shadow-sm cursor-pointer"
            >
              Tutup Rincian
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

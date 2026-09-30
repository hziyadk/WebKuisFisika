// Data Master: Lab Fisika Dasar IPB
// Kelas: ST12.2 (Sesi P/11) • Hari: Setiap Selasa, 15.30 - 17.30 WIB
// Status: Tepat hari ini adalah PERTEMUAN KE-5

export const CLASS_INFO = {
  classCode: 'ST12.2',
  sessionCode: 'P / 11',
  scheduleDay: 'Selasa',
  scheduleTime: '15.30 - 17.30 WIB',
  totalGroups: 16, // C1 s.d. C16
  currentMeeting: 5, // Hari ini pertemuan 5
  academicYear: 'Genap 2024/2025'
};

// 2 Akun Asisten Laboratorium Pengampu Kelas ST12.2
export const DEFAULT_ASSISTANTS = [
  {
    id: 'AST-01',
    username: 'asisten1@apps.ipb.ac.id',
    name: 'Ahmad Rozali, S.Si',
    role: 'Asisten Lab Fisika Dasar 1',
    password: 'password123',
    station: 'Lab Fisika Dasar 1',
    avatarInitials: 'AR'
  },
  {
    id: 'AST-02',
    username: 'asisten2@apps.ipb.ac.id',
    name: 'Siti Nurhaliza, S.Si',
    role: 'Asisten Lab Fisika Dasar 2',
    password: 'password123',
    station: 'Lab Fisika Dasar 2',
    avatarInitials: 'SN'
  }
];

// Daftar 14 Modul / Materi Fisika Sesuai Silabus IPB
export const PHYSICS_MODULES = [
  {
    setId: 'set-0a',
    setCode: 'Set 0A',
    expCode: 'P00',
    title: 'Pengukuran dan Ketidakpastian',
    description: 'Jangka sorong, mikrometer sekrup, nilai skala terkecil (NST), dan perambatan ralat hitung.',
    durationMinutes: 15,
    totalQuestions: 15,
    questions: [
      {
        id: 'q-0a-1',
        category: 'Analisis Pengukuran Dasar',
        text: 'Sebuah jangka sorong memiliki skala nonius 20 skala yang berhimpit dengan 19 mm skala utama. Berapakah Nilai Skala Terkecil (NST) jangka sorong tersebut?',
        formula: 'NST = \\frac{\\text{Nilai } 1 \\text{ Skala Utama}}{\\text{Jumlah Skala Nonius}}',
        options: [
          { id: 'A', text: '0,05 mm' },
          { id: 'B', text: '0,01 mm' },
          { id: 'C', text: '0,02 mm' },
          { id: 'D', text: '0,10 mm' }
        ],
        correctAnswer: 'A',
        explanation: 'NST = 1 mm / 20 = 0,05 mm.'
      },
      {
        id: 'q-0a-2',
        category: 'Mikrometer Sekrup',
        text: 'Pada pengukuran tebal pelat logam menggunakan mikrometer sekrup dengan NST 0,01 mm, skala utama terbaca 4,5 mm dan skala putar nonius menunjuk angka 38. Tebal pelat terukur adalah:',
        formula: 'd = \\text{Skala Utama} + (\\text{Skala Nonius} \\times \\text{NST})',
        options: [
          { id: 'A', text: '4,88 mm' },
          { id: 'B', text: '4,38 mm' },
          { id: 'C', text: '4,538 mm' },
          { id: 'D', text: '4,78 mm' }
        ],
        correctAnswer: 'A',
        explanation: 'd = 4,5 mm + (38 × 0,01 mm) = 4,5 mm + 0,38 mm = 4,88 mm.'
      },
      {
        id: 'q-0a-3',
        category: 'Perambatan Ralat Pengukuran',
        text: 'Pada pengukuran massa beban m = (25,4 ± 0,2) g dan volume V = (10,0 ± 0,1) cm³, ketidakpastian relatif (KR) dari massa jenis ρ benda adalah:',
        formula: '\\frac{\\Delta \\rho}{\\rho} = \\frac{\\Delta m}{m} + \\frac{\\Delta V}{V}',
        options: [
          { id: 'A', text: '1,79 %' },
          { id: 'B', text: '0,89 %' },
          { id: 'C', text: '2,50 %' },
          { id: 'D', text: '3,14 %' }
        ],
        correctAnswer: 'A',
        explanation: 'Δρ/ρ = (0,2/25,4) + (0,1/10,0) = 0,00787 + 0,01000 = 0,01787 ≈ 1,79%.'
      }
    ]
  },
  {
    setId: 'set-0b',
    setCode: 'Set 0B',
    expCode: 'P01',
    title: 'Pemakaian Alat-Alat Ukur Dasar Panjang dan Massa',
    description: 'Penggunaan jangka sorong, mikrometer, neraca Ohaus, dan ketelitian alat ukur.',
    durationMinutes: 15,
    totalQuestions: 15,
    questions: []
  },
  {
    setId: 'set-1',
    setCode: 'Set 1',
    expCode: 'P04',
    title: 'GLB dan GLBB',
    description: 'Gerak Lurus Beraturan, Gerak Lurus Berubah Beraturan, ticker timer, dan percepatan gravitasi.',
    durationMinutes: 15,
    totalQuestions: 15,
    questions: [
      {
        id: 'q-1-1',
        category: 'Kinematika Gerak Lurus',
        text: 'Sebuah kereta dinamika bergerak pada lintasan lurus mendatar dengan percepatan konstan a = 2,5 m/s². Jika kecepatan awal v₀ = 1,0 m/s, berapakah jarak tempuh kereta setelah t = 4 detik?',
        formula: 's = v_0 t + \\frac{1}{2} a t^2',
        options: [
          { id: 'A', text: '18 meter' },
          { id: 'B', text: '24 meter' },
          { id: 'C', text: '20 meter' },
          { id: 'D', text: '28 meter' }
        ],
        correctAnswer: 'B',
        explanation: 's = (1.0)(4) + 0.5(2.5)(16) = 4 + 20 = 24 meter.'
      },
      {
        id: 'q-1-2',
        category: 'Analisis Pita Ticker Timer',
        text: 'Pada pita rekaman ticker timer bermagnetik frekuensi 50 Hz, jika jarak antara titik-titik ketukan berturut-turut semakin merapat ke arah gerak, maka benda mengalami:',
        formula: 'a < 0 \\implies v(t) \\text{ menurun}',
        options: [
          { id: 'A', text: 'Gerak Lurus Beraturan (Kecepatan Konstan)' },
          { id: 'B', text: 'Gerak Lurus Diperlambat Beraturan' },
          { id: 'C', text: 'Gerak Lurus Dipercepat Beraturan' },
          { id: 'D', text: 'Gerak Melingkar Beraturan' }
        ],
        correctAnswer: 'B',
        explanation: 'Jarak ketukan merapat pada selang waktu yang sama (Δt = 1/50 s) menandakan kecepatan berkurang (perlambatan).'
      },
      {
        id: 'q-1-3',
        category: 'Grafik Kecepatan-Waktu',
        text: 'Luas daerah di bawah kurva grafik hubungan kecepatan terhadap waktu (grafik v-t) pada GLBB merepresentasikan besaran fisika:',
        formula: '\\Delta s = \\int_{t_1}^{t_2} v(t) \\, dt',
        options: [
          { id: 'A', text: 'Percepatan rata-rata gerak' },
          { id: 'B', text: 'Perpindahan / jarak tempuh total' },
          { id: 'C', text: 'Gaya impulsif yang bekerja' },
          { id: 'D', text: 'Energi kinetik sesaat' }
        ],
        correctAnswer: 'B',
        explanation: 'Integral luas di bawah grafik v-t adalah perpindahan (jarak tempuh) benda.'
      }
    ]
  },
  {
    setId: 'set-2',
    setCode: 'Set 2',
    expCode: 'P05',
    title: 'Hukum Newton: Sistem Dua Benda',
    description: 'Dinamika sistem dua massa terhubung katrol (pesawat Atwood), gaya tegangan tali, dan hukum II Newton.',
    durationMinutes: 15,
    totalQuestions: 15,
    questions: [
      {
        id: 'q-2-1',
        category: 'Dinamika Sistem Atwood',
        text: 'Dua buah beban m₁ = 3,0 kg dan m₂ = 2,0 kg dihubungkan melalui katrol licin tak bermassa. Dengan mengabaikan gesekan dan mengambil g = 9,8 m/s², percepatan gerak kedua beban adalah:',
        formula: 'a = \\frac{(m_1 - m_2) g}{m_1 + m_2}',
        options: [
          { id: 'A', text: '1,96 m/s²' },
          { id: 'B', text: '2,45 m/s²' },
          { id: 'C', text: '0,98 m/s²' },
          { id: 'D', text: '3,92 m/s²' }
        ],
        correctAnswer: 'A',
        explanation: 'a = (3.0 - 2.0)(9.8) / (3.0 + 2.0) = 9.8 / 5 = 1.96 m/s².'
      },
      {
        id: 'q-2-2',
        category: 'Tegangan Tali Sistem Dinamika',
        text: 'Pada sistem katrol dua benda m₁ dan m₂ di atas, besar gaya tegangan tali T yang menghubungkan kedua benda adalah:',
        formula: 'T = \\frac{2 m_1 m_2 g}{m_1 + m_2}',
        options: [
          { id: 'A', text: '19,6 N' },
          { id: 'B', text: '23,5 N' },
          { id: 'C', text: '29,4 N' },
          { id: 'D', text: '14,7 N' }
        ],
        correctAnswer: 'B',
        explanation: 'T = 2(3)(2)(9.8) / 5 = 117.6 / 5 = 23.52 N.'
      }
    ]
  },
  {
    setId: 'set-3',
    setCode: 'Set 3',
    expCode: 'P06',
    title: 'Hukum Archimedes',
    description: 'Gaya angkat ke atas, massa jenis zat cair, dan prinsip keterapungan fluida statis.',
    durationMinutes: 15,
    totalQuestions: 15,
    questions: []
  },
  {
    setId: 'set-4',
    setCode: 'Set 4',
    expCode: 'P13',
    title: 'Medan Magnet dan Induksi Magnetik',
    description: 'Hukum Biot-Savart, medan magnet solenoida berarus, dan sensor efek Hall.',
    durationMinutes: 15,
    totalQuestions: 15,
    questions: []
  },
  {
    setId: 'set-5',
    setCode: 'Set 5',
    expCode: 'P02',
    title: 'Vektor',
    description: 'Penjumlahan dan penguraian vektor gaya menggunakan meja gaya (force table).',
    durationMinutes: 15,
    totalQuestions: 15,
    questions: []
  },
  {
    setId: 'set-6',
    setCode: 'Set 6',
    expCode: 'P03',
    title: 'Gesekan Statik',
    description: 'Koefisien gesekan statik dan kinetik pada balok dan bidang miring variabel.',
    durationMinutes: 15,
    totalQuestions: 15,
    questions: []
  },
  {
    setId: 'set-7',
    setCode: 'Set 7',
    expCode: 'P16',
    title: 'Kalorimeter',
    description: 'Asas Black, kapasitas kalor kalorimeter, dan kalor jenis spesifik logam tembaga/kuningan.',
    durationMinutes: 15,
    totalQuestions: 15,
    questions: []
  },
  {
    setId: 'set-8',
    setCode: 'Set 8',
    expCode: 'P15',
    title: 'Gelombang Berdiri pada Tali',
    description: 'Percobaan Melde, laju rambat gelombang transversal, dan tegangan tali.',
    durationMinutes: 15,
    totalQuestions: 15,
    questions: []
  },
  {
    setId: 'set-9',
    setCode: 'Set 9',
    expCode: 'P18',
    title: 'Optik Fisis Difraksi',
    description: 'Difraksi celah tunggal, kisi difraksi, dan penentuan panjang gelombang laser dioda.',
    durationMinutes: 15,
    totalQuestions: 15,
    questions: []
  },
  {
    setId: 'set-10',
    setCode: 'Set 10',
    expCode: 'P19',
    title: 'Optik Geometrik',
    description: 'Pembiasan lensa cembung dan cekung, pembentukan bayangan nyata/maya, dan jarak fokus.',
    durationMinutes: 15,
    totalQuestions: 15,
    questions: []
  },
  {
    setId: 'set-11',
    setCode: 'Set 11',
    expCode: 'P08',
    title: 'Getaran dan Bandul Matematis',
    description: 'Penentuan nilai percepatan gravitasi bumi lokal (g) melalui osilasi bandul sederhana.',
    durationMinutes: 15,
    totalQuestions: 15,
    questions: []
  },
  {
    setId: 'set-12',
    setCode: 'Set 12',
    expCode: 'P17',
    title: 'Hukum Ohm',
    description: 'Karakteristik hubungan arus dan tegangan (V-I), galvanometer, dan hambatan jenis kawat.',
    durationMinutes: 15,
    totalQuestions: 15,
    questions: []
  }
];

// Matriks Jadwal Lengkap Kelas ST12.2 (Pertemuan 1 s.d. 14)
// Berdasarkan tabel foto resmi laboratorium
export const MEETING_SCHEDULE = [
  {
    meeting: 1,
    c1_c8: { lab: 3, set: 'Set 0A', expCode: 'P00', title: 'Pengukuran dan Ketidakpastian' },
    c9_c16: { lab: 3, set: 'Set 0A', expCode: 'P00', title: 'Pengukuran dan Ketidakpastian' }
  },
  {
    meeting: 2,
    c1_c8: { lab: 3, set: 'Set 0B', expCode: 'P01', title: 'Pemakaian Alat Ukur Dasar' },
    c9_c16: { lab: 3, set: 'Set 0B', expCode: 'P01', title: 'Pemakaian Alat Ukur Dasar' }
  },
  {
    meeting: 3,
    c1_c8: { lab: 3, set: 'Set 5', expCode: 'P02', title: 'Vektor' },
    c9_c16: { lab: 3, set: 'Set 6', expCode: 'P03', title: 'Gesekan Statik' }
  },
  {
    meeting: 4,
    c1_c8: { lab: 3, set: 'Set 6', expCode: 'P03', title: 'Gesekan Statik' },
    c9_c16: { lab: 3, set: 'Set 5', expCode: 'P02', title: 'Vektor' }
  },
  {
    meeting: 5, // <-- HARI INI
    c1_c8: { lab: 1, set: 'Set 1', expCode: 'P04', title: 'GLB dan GLBB' },
    c9_c16: { lab: 1, set: 'Set 2', expCode: 'P05', title: 'Hukum Newton: Sistem Dua Benda' }
  },
  {
    meeting: 6, // <-- MINGGU DEPAN
    c1_c8: { lab: 1, set: 'Set 2', expCode: 'P05', title: 'Hukum Newton: Sistem Dua Benda' },
    c9_c16: { lab: 1, set: 'Set 1', expCode: 'P04', title: 'GLB dan GLBB' }
  },
  {
    meeting: 7,
    c1_c8: { lab: 2, set: 'Set 3', expCode: 'P06', title: 'Hukum Archimedes' },
    c9_c16: { lab: 2, set: 'Set 4', expCode: 'P13', title: 'Medan Magnet dan Induksi' }
  },
  {
    meeting: 8,
    c1_c8: { lab: 2, set: 'Set 4', expCode: 'P13', title: 'Medan Magnet dan Induksi' },
    c9_c16: { lab: 2, set: 'Set 3', expCode: 'P06', title: 'Hukum Archimedes' }
  },
  {
    meeting: 9,
    c1_c8: { lab: 3, set: 'Set 11', expCode: 'P08', title: 'Getaran dan Bandul Matematis' },
    c9_c16: { lab: 3, set: 'Set 12', expCode: 'P17', title: 'Hukum Ohm' }
  },
  {
    meeting: 10,
    c1_c8: { lab: 3, set: 'Set 12', expCode: 'P17', title: 'Hukum Ohm' },
    c9_c16: { lab: 3, set: 'Set 11', expCode: 'P08', title: 'Getaran dan Bandul Matematis' }
  },
  {
    meeting: 11,
    c1_c8: { lab: 1, set: 'Set 7', expCode: 'P16', title: 'Kalorimeter' },
    c9_c16: { lab: 1, set: 'Set 8', expCode: 'P15', title: 'Gelombang Berdiri pada Tali' }
  },
  {
    meeting: 12,
    c1_c8: { lab: 1, set: 'Set 8', expCode: 'P15', title: 'Gelombang Berdiri pada Tali' },
    c9_c16: { lab: 1, set: 'Set 7', expCode: 'P16', title: 'Kalorimeter' }
  },
  {
    meeting: 13,
    c1_c8: { lab: 2, set: 'Set 9', expCode: 'P18', title: 'Optik Fisis Difraksi' },
    c9_c16: { lab: 2, set: 'Set 10', expCode: 'P19', title: 'Optik Geometrik' }
  },
  {
    meeting: 14,
    c1_c8: { lab: 2, set: 'Set 10', expCode: 'P19', title: 'Optik Geometrik' },
    c9_c16: { lab: 2, set: 'Set 9', expCode: 'P18', title: 'Optik Fisis Difraksi' }
  }
];

// Helper: Ambil data modul untuk kelompok praktikan tertentu pada pertemuan saat ini atau minggu depan
export function getScheduleForGroup(groupNumber, meetingNumber = 5) {
  const meetingData = MEETING_SCHEDULE.find(m => m.meeting === meetingNumber) || MEETING_SCHEDULE[4];
  const isC1toC8 = groupNumber <= 8;
  return isC1toC8 ? meetingData.c1_c8 : meetingData.c9_c16;
}

// =========================================================================
// DATA RESMI 39 MAHASISWA PRAKTIKAN FISIKA KELAS ST12.2 (16 KELOMPOK C1 - C16)
// =========================================================================
export const OFFICIAL_PRAKTIKAN_ROSTER = [
  { name: 'Affan Kurniawan Widarjdo', nim: 'G4401261088', groupNumber: 1, department: 'Kimia (FMIPA IPB)' },
  { name: 'Kenneth Moses Lisias', nim: 'G8401261083', groupNumber: 1, department: 'Biokimia (FMIPA IPB)' },
  { name: 'Niatus Sholikhah', nim: 'G8401261090', groupNumber: 1, department: 'Biokimia (FMIPA IPB)' },
  { name: 'Ahmad Hafis Fadlan', nim: 'D1401261039', groupNumber: 2, department: 'Ilmu Nutrisi & Pakan (FAPET IPB)' },
  { name: 'Hilma Ainul Widad', nim: 'D2401261092', groupNumber: 2, department: 'Teknologi Produksi Ternak (FAPET IPB)' },
  { name: 'Muhamad Rafha Ramadhan', nim: 'E2401261065', groupNumber: 2, department: 'Teknik Mesin & Biosistem (FATETA IPB)' },
  { name: 'Chesya Anandita Febriani', nim: 'E2401261058', groupNumber: 3, department: 'Teknik Mesin & Biosistem (FATETA IPB)' },
  { name: 'Raffi Kurnia Sandy', nim: 'G2401261029', groupNumber: 3, department: 'Geofisika & Meteorologi (FMIPA IPB)' },
  { name: 'Salwa Azzahra', nim: 'G440126112', groupNumber: 3, department: 'Kimia (FMIPA IPB)' },
  { name: 'Dava Putra Perdana', nim: 'D2401261046', groupNumber: 4, department: 'Teknologi Produksi Ternak (FAPET IPB)' },
  { name: 'Kayyisah Sasikirana Witjaksono', nim: 'D3401261001', groupNumber: 4, department: 'Teknologi Hasil Ternak (FAPET IPB)' },
  { name: 'Kanigara Javier Chisbiyyah', nim: 'E2401261018', groupNumber: 4, department: 'Teknik Mesin & Biosistem (FATETA IPB)' },
  { name: 'Winie Aulianie', nim: 'D1401261037', groupNumber: 5, department: 'Ilmu Nutrisi & Pakan (FAPET IPB)' },
  { name: 'Desiana Putri Hartati', nim: 'D2401261026', groupNumber: 5, department: 'Teknologi Produksi Ternak (FAPET IPB)' },
  { name: 'Tristananda Kaysan Rafif', nim: 'E2401261007', groupNumber: 5, department: 'Teknik Mesin & Biosistem (FATETA IPB)' },
  { name: 'Raisa Alifia Syuraina', nim: 'D1401261100', groupNumber: 6, department: 'Ilmu Nutrisi & Pakan (FAPET IPB)' },
  { name: 'Pirna Asifa', nim: 'G2401261004', groupNumber: 6, department: 'Geofisika & Meteorologi (FMIPA IPB)' },
  { name: 'Syahrian Nasywa Revandra Nugroho', nim: 'G2401261086', groupNumber: 6, department: 'Geofisika & Meteorologi (FMIPA IPB)' },
  { name: 'Fitratul Illahi', nim: 'D2401261142', groupNumber: 7, department: 'Teknologi Produksi Ternak (FAPET IPB)' },
  { name: 'Naiva Apriza Hanif', nim: 'G0401261022', groupNumber: 7, department: 'Sains Komputasi (FMIPA IPB)' },
  { name: 'Humam Miqdad Rahadiansyah', nim: 'G8401261033', groupNumber: 7, department: 'Biokimia (FMIPA IPB)' },
  { name: 'Jesicha Novrianti', nim: 'D2401261059', groupNumber: 8, department: 'Teknologi Produksi Ternak (FAPET IPB)' },
  { name: 'Miftahul Jannah', nim: 'G4401261015', groupNumber: 8, department: 'Kimia (FMIPA IPB)' },
  { name: 'Ardita Zia Zhafira', nim: 'D3401261057', groupNumber: 9, department: 'Teknologi Hasil Ternak (FAPET IPB)' },
  { name: 'Azzahra Ayuka Niesha Faustina', nim: 'G8401261056', groupNumber: 9, department: 'Biokimia (FMIPA IPB)' },
  { name: 'Raden Adlina Fakhrana Abdi', nim: 'D3401261030', groupNumber: 10, department: 'Teknologi Hasil Ternak (FAPET IPB)' },
  { name: 'Rahmah Fadila', nim: 'G8401261023', groupNumber: 10, department: 'Biokimia (FMIPA IPB)' },
  { name: 'Ghazali Raffi Cahyadi', nim: 'D1401261106', groupNumber: 11, department: 'Ilmu Nutrisi & Pakan (FAPET IPB)' },
  { name: 'Nafisha Aurelia Putri', nim: 'E4401261103', groupNumber: 11, department: 'Teknologi Industri Pertanian (FATETA IPB)' },
  { name: 'Panji Bramantio', nim: 'D24012611135', groupNumber: 12, department: 'Teknologi Produksi Ternak (FAPET IPB)' },
  { name: 'Thalita Sakhi Yusuf', nim: 'E4401261006', groupNumber: 12, department: 'Teknologi Industri Pertanian (FATETA IPB)' },
  { name: 'Indra Maulana Aryaputra', nim: 'D3401261024', groupNumber: 13, department: 'Teknologi Hasil Ternak (FAPET IPB)' },
  { name: 'Ervina Zaskhiya Fariyandi', nim: 'E4401261040', groupNumber: 13, department: 'Teknologi Industri Pertanian (FATETA IPB)' },
  { name: 'Marasil Ali Sadhono', nim: 'E4401261061', groupNumber: 14, department: 'Teknologi Industri Pertanian (FATETA IPB)' },
  { name: 'Areej Ibrahim Nasry Hamdan', nim: 'G4401261089', groupNumber: 14, department: 'Kimia (FMIPA IPB)' },
  { name: 'Muhammad Fadhillah Syah Alam', nim: 'E4401261107', groupNumber: 15, department: 'Teknologi Industri Pertanian (FATETA IPB)' },
  { name: 'Hazna Hanadian Driadama', nim: 'G2401261043', groupNumber: 15, department: 'Geofisika & Meteorologi (FMIPA IPB)' },
  { name: 'Ahmad Faza Maulana', nim: 'G4401261016', groupNumber: 16, department: 'Kimia (FMIPA IPB)' },
  { name: 'Khansa Ziyagi Naila Azmi', nim: 'G4401261049', groupNumber: 16, department: 'Kimia (FMIPA IPB)' }
];

export function getStudentDefaultPassword(studentOrName) {
  if (!studentOrName) return '';
  const name = typeof studentOrName === 'string' ? studentOrName : (studentOrName.name || '');
  return name.trim().split(/\s+/)[0] || '';
}

export function getStudentByNim(nim) {
  if (!nim) return null;
  const clean = nim.trim().toUpperCase();
  const student = OFFICIAL_PRAKTIKAN_ROSTER.find(s => s.nim.toUpperCase() === clean);
  if (!student) return null;
  return {
    ...student,
    defaultPassword: getStudentDefaultPassword(student.name)
  };
}

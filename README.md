# Web Kuis Fisika Pra-Praktikum

Sistem aplikasi web kuis interaktif pra-praktikum Laboratorium Fisika Dasar IPB University berbasis React, Vite, dan Supabase dengan dukungan pengawasan *real-time* dan sistem proteksi *anti-cheat*.

---

## 🚀 Fitur Utama

1. **Autentikasi Praktikan & Asisten Lab**
   - **Praktikan**: Username menggunakan **NIM** dan Password menggunakan **Email IPB resmi** (@apps.ipb.ac.id).
   - **Asisten**: Akses khusus untuk memonitoring dan mengelola kuis.

2. **Dual-View Experience (Mobile vs PC Desktop)**
   - **Web Mobile View**: Tampilan kuis yang dirancang khusus dan terfokus untuk kenyamanan mahasiswa saat ujian menggunakan smartphone.
   - **PC Desktop Dashboard**: Tampilan widescreen multi-kolom untuk asisten memonitoring live di laboratorium.

3. **Sistem Anti-Cheat & Penguncian Otomatis (Lockout)**
   - Pendeteksian aksi keluar tab browser, meminimalisir layar, atau berpindah aplikasi lain secara instan.
   - Kuis mahasiswa otomatis **terkunci** jika terdeteksi berpindah layar.
   - Pembukaan kunci memerlukan **Passkey** dari asisten atau *1-click unlock* dari dashboard asisten.

4. **Live Monitoring Real-time**
   - Pemantauan langsung status pengerjaan seluruh mahasiswa (Aktif Mengerjakan, Terkunci, Selesai).
   - Menampilkan nomor soal terkini, sisa waktu, frekuensi pelanggaran, dan kode passkey.

5. **Manajemen 16 Topik Fisika & Bank Soal**
   - Mendukung 16 topik praktikum fisika dasar lengkap.
   - Asisten dapat memilih modul topik yang aktif diujikan minggu ini.
   - Bank soal pilihan ganda lengkap dengan kunci jawaban dan pembahasan.

6. **Pengacakan Soal (Randomization Engine)**
   - Soal dipilih secara acak dari bank soal topik yang bersangkutan.
   - Urutan pertanyaan dan opsi pilihan ganda (A, B, C, D, E) diacak unik untuk tiap mahasiswa guna mencegah kecurangan.

7. **Jadwal Praktikum & Pengingat Laporan**
   - Pengumuman jadwal praktikum minggu depan (ruang lab, asisten jaga, perlengkapan wajib).
   - Pengingat batas waktu (*deadline*) pengumpulan laporan praktikum.

---

## 🛠️ Tech Stack

- **Frontend**: [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL & Realtime Channels)
- **Deployment**: [Vercel](https://vercel.com/) Ready (ercel.json included)

---

## 💻 Cara Menjalankan Secara Lokal

1. **Clone repositori**:
   `ash
   git clone https://github.com/hziyadk/WebKuisFisika.git
   cd WebKuisFisika
   `

2. **Install dependensi**:
   `ash
   npm install
   `

3. **Konfigurasi Environment**:
   Salin .env.example menjadi .env dan masukkan kredensial Supabase Anda:
   `env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   `

4. **Jalankan development server**:
   `ash
   npm run dev
   `
   Aplikasi akan berjalan di http://localhost:5173/ (atau http://localhost:3000/).

5. **Setup Database**:
   Jalankan query SQL yang terdapat pada file supabase_schema.sql di SQL Editor Supabase Anda untuk membuat seluruh tabel dan *policies* yang dibutuhkan.

---

## 🌐 Deploy ke Vercel

1. Hubungkan repositori GitHub ini ke dashboard Vercel Anda.
2. Tambahkan Environment Variable di Vercel:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
3. Klik **Deploy**!

-- =========================================================================
-- SKPT-IPB: SKEMA DATABASE SUPABASE (PORTAL KUIS FISIKA SAINS & TEKNOLOGI)
-- FMIPA IPB University - Laboratorium Fisika Dasar
-- =========================================================================

-- SCRIPT ALTER (JIKA TABEL SUDAH DIBUAT SEBELUMNYA DI SUPABASE):
ALTER TABLE IF EXISTS public.users DROP COLUMN IF EXISTS email;
ALTER TABLE IF EXISTS public.users DROP COLUMN IF EXISTS department;
ALTER TABLE IF EXISTS public.live_sessions DROP COLUMN IF EXISTS department;

-- 1. TABEL LIVE SESSIONS (Monitoring Sesi Kuis & Anti-Curang Terkunci)
CREATE TABLE IF NOT EXISTS public.live_sessions (
    id TEXT PRIMARY KEY,
    nim TEXT NOT NULL,
    name TEXT NOT NULL,
    group_number INT,
    group_label TEXT,
    module_title TEXT,
    sub_topic TEXT,
    status TEXT DEFAULT 'in_progress', -- 'in_progress', 'locked', 'completed', 'report_submitted', 'failed'
    lock_reason TEXT,
    lock_timestamp TEXT,
    passkey TEXT,
    score INT,
    progress TEXT,
    report_score TEXT,
    assistance_requested BOOLEAN DEFAULT FALSE,
    station TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL SUBMISSIONS (Riwayat Pengumpulan & Nilai Kuis)
CREATE TABLE IF NOT EXISTS public.submissions (
    id TEXT PRIMARY KEY,
    nim TEXT NOT NULL,
    student_name TEXT,
    module_code TEXT NOT NULL,
    module_title TEXT NOT NULL,
    score INT NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL MODULES (Bank Soal & Pengaturan Modul Praktikum)
CREATE TABLE IF NOT EXISTS public.modules (
    set_id TEXT PRIMARY KEY,
    set_code TEXT NOT NULL,
    exp_code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INT DEFAULT 15,
    total_questions INT DEFAULT 15,
    is_active BOOLEAN DEFAULT TRUE,
    questions JSONB DEFAULT '[]'::JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL USERS / PROFILES (Praktikan ST12.2 & Asisten Lab)
CREATE TABLE IF NOT EXISTS public.users (
    nim TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    password TEXT,
    must_change_password BOOLEAN DEFAULT TRUE,
    class_code TEXT DEFAULT 'ST12.2',
    group_number INT,
    group_label TEXT,
    role TEXT DEFAULT 'praktikan', -- 'praktikan' | 'asisten'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL APP_SETTINGS (Konfigurasi Global & Sesi Modul Terpadu Realtime)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- AKTIFKAN FITUR SUPABASE REALTIME MULTI-DEVICE (HP PRAKTIKAN <-> LAPTOP ASISTEN)
-- =========================================================================
ALTER TABLE public.live_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.submissions REPLICA IDENTITY FULL;
ALTER TABLE public.modules REPLICA IDENTITY FULL;
ALTER TABLE public.app_settings REPLICA IDENTITY FULL;

-- Daftarkan ke publikasi realtime Supabase
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'live_sessions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.live_sessions;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'submissions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'modules'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.modules;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'app_settings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;
    END IF;
END $$;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) & PERMISSIONS - Akses Anon untuk Kemudahan Lab
-- =========================================================================
-- Berikan hak akses tabel ke role anon dan authenticated (Wajib untuk Supabase Client API)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

GRANT ALL ON TABLE public.live_sessions TO anon, authenticated;
GRANT ALL ON TABLE public.submissions TO anon, authenticated;
GRANT ALL ON TABLE public.modules TO anon, authenticated;
GRANT ALL ON TABLE public.users TO anon, authenticated;
GRANT ALL ON TABLE public.app_settings TO anon, authenticated;

ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policy Publik Bebas Baca/Tulis untuk Anon Client
DROP POLICY IF EXISTS "Allow public read/write live_sessions" ON public.live_sessions;
DROP POLICY IF EXISTS "Allow public read/write submissions" ON public.submissions;
DROP POLICY IF EXISTS "Allow public read/write modules" ON public.modules;
DROP POLICY IF EXISTS "Allow public read/write users" ON public.users;
DROP POLICY IF EXISTS "Allow public read/write app_settings" ON public.app_settings;

CREATE POLICY "Allow public read/write live_sessions" ON public.live_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write submissions" ON public.submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write modules" ON public.modules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- DATA RESMI ASISTEN & 39 MAHASISWA PRAKTIKAN FISIKA KELAS ST12.2
-- Format Login: NIM sebagai Username, Kata pertama nama sebagai Password Awal
-- =========================================================================
INSERT INTO public.users (nim, name, password, must_change_password, class_code, group_number, group_label, role)
VALUES
  -- 2 Asisten Laboratorium Pengampu Kelas ST12.2
  ('AST-01', 'Ahmad Rozali, S.Si', 'asisten123', FALSE, 'ST12.2', 0, 'Asisten Lab Fisika Dasar 1', 'asisten'),
  ('AST-02', 'Siti Nurhaliza, S.Si', 'asisten123', FALSE, 'ST12.2', 0, 'Asisten Lab Fisika Dasar 2', 'asisten'),

  -- Kelompok 1 (Password awal: kata pertama nama)
  ('G4401261088', 'Affan Kurniawan Widarjdo', 'Affan', TRUE, 'ST12.2', 1, 'Kelompok C1', 'praktikan'),
  ('G8401261083', 'Kenneth Moses Lisias', 'Kenneth', TRUE, 'ST12.2', 1, 'Kelompok C1', 'praktikan'),
  ('G8401261090', 'Niatus Sholikhah', 'Niatus', TRUE, 'ST12.2', 1, 'Kelompok C1', 'praktikan'),

  -- Kelompok 2
  ('D1401261039', 'Ahmad Hafis Fadlan', 'Ahmad', TRUE, 'ST12.2', 2, 'Kelompok C2', 'praktikan'),
  ('D2401261092', 'Hilma Ainul Widad', 'Hilma', TRUE, 'ST12.2', 2, 'Kelompok C2', 'praktikan'),
  ('E2401261065', 'Muhamad Rafha Ramadhan', 'Muhamad', TRUE, 'ST12.2', 2, 'Kelompok C2', 'praktikan'),

  -- Kelompok 3
  ('E2401261058', 'Chesya Anandita Febriani', 'Chesya', TRUE, 'ST12.2', 3, 'Kelompok C3', 'praktikan'),
  ('G2401261029', 'Raffi Kurnia Sandy', 'Raffi', TRUE, 'ST12.2', 3, 'Kelompok C3', 'praktikan'),
  ('G440126112', 'Salwa Azzahra', 'Salwa', TRUE, 'ST12.2', 3, 'Kelompok C3', 'praktikan'),

  -- Kelompok 4
  ('D2401261046', 'Dava Putra Perdana', 'Dava', TRUE, 'ST12.2', 4, 'Kelompok C4', 'praktikan'),
  ('D3401261001', 'Kayyisah Sasikirana Witjaksono', 'Kayyisah', TRUE, 'ST12.2', 4, 'Kelompok C4', 'praktikan'),
  ('E2401261018', 'Kanigara Javier Chisbiyyah', 'Kanigara', TRUE, 'ST12.2', 4, 'Kelompok C4', 'praktikan'),

  -- Kelompok 5
  ('D1401261037', 'Winie Aulianie', 'Winie', TRUE, 'ST12.2', 5, 'Kelompok C5', 'praktikan'),
  ('D2401261026', 'Desiana Putri Hartati', 'Desiana', TRUE, 'ST12.2', 5, 'Kelompok C5', 'praktikan'),
  ('E2401261007', 'Tristananda Kaysan Rafif', 'Tristananda', TRUE, 'ST12.2', 5, 'Kelompok C5', 'praktikan'),

  -- Kelompok 6
  ('D1401261100', 'Raisa Alifia Syuraina', 'Raisa', TRUE, 'ST12.2', 6, 'Kelompok C6', 'praktikan'),
  ('G2401261004', 'Pirna Asifa', 'Pirna', TRUE, 'ST12.2', 6, 'Kelompok C6', 'praktikan'),
  ('G2401261086', 'Syahrian Nasywa Revandra Nugroho', 'Syahrian', TRUE, 'ST12.2', 6, 'Kelompok C6', 'praktikan'),

  -- Kelompok 7
  ('D2401261142', 'Fitratul Illahi', 'Fitratul', TRUE, 'ST12.2', 7, 'Kelompok C7', 'praktikan'),
  ('G0401261022', 'Naiva Apriza Hanif', 'Naiva', TRUE, 'ST12.2', 7, 'Kelompok C7', 'praktikan'),
  ('G8401261033', 'Humam Miqdad Rahadiansyah', 'Humam', TRUE, 'ST12.2', 7, 'Kelompok C7', 'praktikan'),

  -- Kelompok 8
  ('D2401261059', 'Jesicha Novrianti', 'Jesicha', TRUE, 'ST12.2', 8, 'Kelompok C8', 'praktikan'),
  ('G4401261015', 'Miftahul Jannah', 'Miftahul', TRUE, 'ST12.2', 8, 'Kelompok C8', 'praktikan'),

  -- Kelompok 9
  ('D3401261057', 'Ardita Zia Zhafira', 'Ardita', TRUE, 'ST12.2', 9, 'Kelompok C9', 'praktikan'),
  ('G8401261056', 'Azzahra Ayuka Niesha Faustina', 'Azzahra', TRUE, 'ST12.2', 9, 'Kelompok C9', 'praktikan'),

  -- Kelompok 10
  ('D3401261030', 'Raden Adlina Fakhrana Abdi', 'Raden', TRUE, 'ST12.2', 10, 'Kelompok C10', 'praktikan'),
  ('G8401261023', 'Rahmah Fadila', 'Rahmah', TRUE, 'ST12.2', 10, 'Kelompok C10', 'praktikan'),

  -- Kelompok 11
  ('D1401261106', 'Ghazali Raffi Cahyadi', 'Ghazali', TRUE, 'ST12.2', 11, 'Kelompok C11', 'praktikan'),
  ('E4401261103', 'Nafisha Aurelia Putri', 'Nafisha', TRUE, 'ST12.2', 11, 'Kelompok C11', 'praktikan'),

  -- Kelompok 12
  ('D24012611135', 'Panji Bramantio', 'Panji', TRUE, 'ST12.2', 12, 'Kelompok C12', 'praktikan'),
  ('E4401261006', 'Thalita Sakhi Yusuf', 'Thalita', TRUE, 'ST12.2', 12, 'Kelompok C12', 'praktikan'),

  -- Kelompok 13
  ('D3401261024', 'Indra Maulana Aryaputra', 'Indra', TRUE, 'ST12.2', 13, 'Kelompok C13', 'praktikan'),
  ('E4401261040', 'Ervina Zaskhiya Fariyandi', 'Ervina', TRUE, 'ST12.2', 13, 'Kelompok C13', 'praktikan'),

  -- Kelompok 14
  ('E4401261061', 'Marasil Ali Sadhono', 'Marasil', TRUE, 'ST12.2', 14, 'Kelompok C14', 'praktikan'),
  ('G4401261089', 'Areej Ibrahim Nasry Hamdan', 'Areej', TRUE, 'ST12.2', 14, 'Kelompok C14', 'praktikan'),

  -- Kelompok 15
  ('E4401261107', 'Muhammad Fadhillah Syah Alam', 'Muhammad', TRUE, 'ST12.2', 15, 'Kelompok C15', 'praktikan'),
  ('G2401261043', 'Hazna Hanadian Driadama', 'Hazna', TRUE, 'ST12.2', 15, 'Kelompok C15', 'praktikan'),

  -- Kelompok 16
  ('G4401261016', 'Ahmad Faza Maulana', 'Ahmad', TRUE, 'ST12.2', 16, 'Kelompok C16', 'praktikan'),
  ('G4401261049', 'Khansa Ziyagi Naila Azmi', 'Khansa', TRUE, 'ST12.2', 16, 'Kelompok C16', 'praktikan')
ON CONFLICT (nim) DO UPDATE SET
  name = EXCLUDED.name,
  group_number = EXCLUDED.group_number,
  group_label = EXCLUDED.group_label,
  password = COALESCE(users.password, EXCLUDED.password),
  must_change_password = COALESCE(users.must_change_password, EXCLUDED.must_change_password);


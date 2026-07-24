-- SQL Schema untuk SIPRO-BELAJAR (Supabase / PostgreSQL)

-- 1. Create ENUM Types (Opsional tapi direkomendasikan untuk integritas data)
CREATE TYPE user_role AS ENUM ('admin', 'pengawas', 'kepsek', 'guru');

CREATE TYPE supervision_category AS ENUM (
  'Persiapan Pembelajaran',
  'Pelaksanaan Pembelajaran',
  'Penilaian Pembelajaran',
  'Tindak Lanjut'
);

CREATE TYPE supervision_status AS ENUM (
  'Belum Dimulai',
  'Sedang Berjalan',
  'Selesai'
);

-- 2. Table: users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  nip TEXT,
  school_name TEXT,
  class_name TEXT,
  subject TEXT,
  photo_url TEXT,
  drive_url TEXT,
  supervision_schedule TEXT,
  module_topic TEXT,
  module_time_allocation TEXT,
  module_target_phase TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table: supervisions
CREATE TABLE supervisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category supervision_category NOT NULL,
  status supervision_status NOT NULL DEFAULT 'Belum Dimulai',
  score NUMERIC(5, 2), -- 0.00 hingga 100.00
  notes TEXT,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table: app_settings (Hanya 1 baris untuk pengaturan global aplikasi)
CREATE TABLE app_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  app_name TEXT NOT NULL DEFAULT 'SIPRO-BELAJAR',
  school_name TEXT NOT NULL DEFAULT 'SMP Negeri 1 Telaga',
  theme_color TEXT NOT NULL DEFAULT 'emerald',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Insert Data Awal (Seeding)
-- Pengaturan Default
INSERT INTO app_settings (id, app_name, school_name, theme_color)
VALUES (1, 'SIPRO-BELAJAR', 'SMP Negeri 1 Telaga', 'emerald')
ON CONFLICT (id) DO NOTHING;

-- Akun Default Pejabat & Admin
INSERT INTO users (id, username, name, role, nip, school_name)
VALUES 
  ('admin', 'admin', 'System Administrator', 'admin', NULL, 'SMP Negeri 1 Telaga'),
  ('pengawas', 'pengawas', 'Imran Tululi, S.Pd, M.Pd', 'pengawas', '197101241992021001', 'SMP Negeri 1 Telaga'),
  ('kepsek', 'kepsek', 'Dra. Hj. Rosmin Katili, M.Pd', 'kepsek', '196805141994032002', 'SMP Negeri 1 Telaga')
ON CONFLICT (id) DO NOTHING;

-- Trigger untuk update updated_at (Opsional)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_supervisions_updated_at BEFORE UPDATE ON supervisions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

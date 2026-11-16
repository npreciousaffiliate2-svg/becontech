-- ─── CampusOne Supabase Migration 20261114143500 ───
-- Complete Missing Tables, RLS Policies, Notifications & Avatars Storage

-- 1. PROFILES POLICIES & UPSERT PERMISSIONS
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_select_all' AND tablename = 'profiles') THEN
        CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_update_all' AND tablename = 'profiles') THEN
        CREATE POLICY "profiles_update_all" ON profiles FOR UPDATE USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_insert_all' AND tablename = 'profiles') THEN
        CREATE POLICY "profiles_insert_all" ON profiles FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Ensure Super Admin profile exists
INSERT INTO profiles (id, college_id, email, full_name, role, title)
VALUES ('usr-sadmin-01', 'bethsaida', 'admin@bethsaida.edu.ng', 'Engr. Dapo Williams', 'SADMIN', 'Chief Systems Administrator & ICT Director')
ON CONFLICT (id) DO UPDATE SET role = 'SADMIN';

-- 2. NOTIFICATIONS SYSTEM TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL DEFAULT 'bethsaida',
    user_id TEXT,
    role TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'notifications_all' AND tablename = 'notifications') THEN
        CREATE POLICY "notifications_all" ON notifications FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 3. COURSES CURRICULUM TABLE
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL DEFAULT 'bethsaida',
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    units INT NOT NULL DEFAULT 3,
    level TEXT NOT NULL,
    semester TEXT NOT NULL,
    department_code TEXT NOT NULL,
    lecturer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'courses_all' AND tablename = 'courses') THEN
        CREATE POLICY "courses_all" ON courses FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 4. ADMISSIONS CANDIDATES TABLE
CREATE TABLE IF NOT EXISTS candidates (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL DEFAULT 'bethsaida',
    application_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    gender TEXT DEFAULT 'Female',
    state_of_origin TEXT,
    lga TEXT,
    programme_code TEXT,
    programme TEXT,
    department TEXT,
    regulatory_body TEXT,
    cbt_score INT DEFAULT 0,
    utme_score INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'APPLIED',
    admission_list_batch TEXT,
    matric_number TEXT,
    acceptance_fee_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'candidates_all' AND tablename = 'candidates') THEN
        CREATE POLICY "candidates_all" ON candidates FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 5. COURSE MATERIALS (E-LEARNING) TABLE
CREATE TABLE IF NOT EXISTS course_materials (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL DEFAULT 'bethsaida',
    course_code TEXT NOT NULL,
    course_title TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    material_type TEXT NOT NULL DEFAULT 'PDF',
    file_url TEXT,
    file_size_bytes BIGINT DEFAULT 0,
    uploaded_by TEXT NOT NULL,
    department_code TEXT,
    downloads_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'course_materials_all' AND tablename = 'course_materials') THEN
        CREATE POLICY "course_materials_all" ON course_materials FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 6. CBT QUESTIONS BANK TABLE
CREATE TABLE IF NOT EXISTS cbt_questions (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL DEFAULT 'bethsaida',
    course_code TEXT NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL,
    points INT DEFAULT 1,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cbt_questions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'cbt_questions_all' AND tablename = 'cbt_questions') THEN
        CREATE POLICY "cbt_questions_all" ON cbt_questions FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 7. STORAGE BUCKET AVATARS VERIFICATION & PERMISSIONS
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'avatars_public_select' AND tablename = 'objects') THEN
        CREATE POLICY "avatars_public_select" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'avatars_public_insert' AND tablename = 'objects') THEN
        CREATE POLICY "avatars_public_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'avatars_public_update' AND tablename = 'objects') THEN
        CREATE POLICY "avatars_public_update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');
    END IF;
END $$;

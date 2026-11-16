-- ─── 1. EXTEND TENANT SETTINGS FOR DYNAMIC SCHOOL CONFIGURATION ───
ALTER TABLE tenant_settings 
ADD COLUMN IF NOT EXISTS regulatory_councils TEXT[] DEFAULT ARRAY[
    'Federal Ministry of Health (FMOH)',
    'National Board for Technical Education (NBTE)',
    'Community Health Practitioners Registration Board of Nigeria (CHPRBN)',
    'Medical Laboratory Science Council of Nigeria (MLSCN)',
    'Pharmacy Council of Nigeria (PCN)',
    'Health Records Officers Registration Board of Nigeria (HRORBN)',
    'Environmental Health Officers Registration Council of Nigeria (EHORECON)'
],
ADD COLUMN IF NOT EXISTS academic_levels TEXT[] DEFAULT ARRAY[
    '100 Level',
    '200 Level',
    '300 Level',
    '400 Level',
    '500 Level',
    'ND I',
    'ND II',
    'HND I',
    'HND II',
    'Certificate Year 1',
    'Certificate Year 2'
],
ADD COLUMN IF NOT EXISTS academic_semesters TEXT[] DEFAULT ARRAY[
    'Harmattan Semester',
    'Rain Semester',
    'First Semester',
    'Second Semester'
],
ADD COLUMN IF NOT EXISTS academic_sessions TEXT[] DEFAULT ARRAY[
    '2024/2025',
    '2025/2026',
    '2026/2027',
    '2027/2028'
],
ADD COLUMN IF NOT EXISTS admissions_open BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS admission_batch TEXT DEFAULT 'Merit List (Batch 1)',
ADD COLUMN IF NOT EXISTS application_fee_kobo BIGINT DEFAULT 1000000, -- 10,000 NGN
ADD COLUMN IF NOT EXISTS acceptance_fee_kobo BIGINT DEFAULT 3500000, -- 35,000 NGN
ADD COLUMN IF NOT EXISTS minimum_cutoff_score INT DEFAULT 50;

-- ─── 2. DYNAMIC DEPARTMENTS & PROGRAMMES TABLE ───
CREATE TABLE IF NOT EXISTS college_departments (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    hod_name TEXT NOT NULL,
    hod_title TEXT NOT NULL DEFAULT 'Head of Department',
    hod_email TEXT,
    hod_phone TEXT,
    office_location TEXT,
    approved_quota INT NOT NULL DEFAULT 100,
    regulatory_body TEXT NOT NULL,
    accreditation_status TEXT NOT NULL DEFAULT 'FULL',
    accreditation_valid_until TEXT DEFAULT 'November 2029',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE college_departments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "college_departments_select_all" ON college_departments;
    CREATE POLICY "college_departments_select_all" ON college_departments FOR SELECT USING (true);

    DROP POLICY IF EXISTS "college_departments_upsert_all" ON college_departments;
    CREATE POLICY "college_departments_upsert_all" ON college_departments FOR ALL USING (true);
END $$;

-- ─── 3. DYNAMIC COURSES CURRICULUM TABLE ───
CREATE TABLE IF NOT EXISTS college_courses (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    department_code TEXT NOT NULL,
    department_name TEXT NOT NULL,
    level TEXT NOT NULL,
    semester TEXT NOT NULL,
    credit_units INT NOT NULL DEFAULT 3,
    theory_hours INT NOT NULL DEFAULT 2,
    practical_hours INT NOT NULL DEFAULT 3,
    lecturer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE college_courses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "college_courses_select_all" ON college_courses;
    CREATE POLICY "college_courses_select_all" ON college_courses FOR SELECT USING (true);

    DROP POLICY IF EXISTS "college_courses_upsert_all" ON college_courses;
    CREATE POLICY "college_courses_upsert_all" ON college_courses FOR ALL USING (true);
END $$;

-- ─── 4. DYNAMIC ADMISSION CANDIDATES TABLE ───
CREATE TABLE IF NOT EXISTS admission_candidates (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    application_number TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    gender TEXT NOT NULL,
    state_of_origin TEXT,
    lga TEXT,
    programme_code TEXT NOT NULL,
    programme TEXT NOT NULL,
    department TEXT NOT NULL,
    regulatory_body TEXT,
    cbt_score INT NOT NULL DEFAULT 0,
    cbt_date TEXT,
    olevel_exam_body TEXT DEFAULT 'WAEC',
    olevel_exam_year TEXT DEFAULT '2025',
    olevel_status TEXT DEFAULT 'VERIFIED',
    status TEXT NOT NULL DEFAULT 'APPLIED', -- APPLIED, SCREENED, ADMITTED, ENROLLED
    admission_list_batch TEXT,
    matric_number TEXT,
    acceptance_fee_paid BOOLEAN DEFAULT FALSE,
    acceptance_fee_ref TEXT,
    admitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admission_candidates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "admission_candidates_select_all" ON admission_candidates;
    CREATE POLICY "admission_candidates_select_all" ON admission_candidates FOR SELECT USING (true);

    DROP POLICY IF EXISTS "admission_candidates_upsert_all" ON admission_candidates;
    CREATE POLICY "admission_candidates_upsert_all" ON admission_candidates FOR ALL USING (true);
END $$;

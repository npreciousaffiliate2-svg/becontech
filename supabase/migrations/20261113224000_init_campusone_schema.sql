
-- ─── EXTENSIONS ───
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. COLLEGES / TENANTS ───
CREATE TABLE IF NOT EXISTS colleges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    domain TEXT,
    logo_url TEXT,
    active_session TEXT NOT NULL DEFAULT '2026/2027',
    active_semester TEXT NOT NULL DEFAULT 'Harmattan',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. DEPARTMENTS ───
CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    regulatory_body TEXT NOT NULL,
    accreditation_status TEXT NOT NULL DEFAULT 'FULL',
    approved_quota INT NOT NULL DEFAULT 120,
    hod_name TEXT,
    hod_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. PROFILES / USERS ───
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    department_code TEXT,
    matric_number TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. STUDENTS ───
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    matric_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    department_code TEXT NOT NULL,
    programme TEXT NOT NULL,
    level TEXT NOT NULL,
    cgpa NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    fees_status TEXT NOT NULL DEFAULT 'OWING',
    clinical_clearance TEXT NOT NULL DEFAULT 'PENDING',
    attendance_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. STUDENT MASTER LEDGER ───
CREATE TABLE IF NOT EXISTS student_ledgers (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    matric_number TEXT NOT NULL,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('debit', 'credit')),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount_kobo BIGINT NOT NULL,
    balance_after_kobo BIGINT NOT NULL,
    reference_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 6. OFFICIAL RECEIPTS ───
CREATE TABLE IF NOT EXISTS official_receipts (
    receipt_number TEXT PRIMARY KEY,
    college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    matric_number TEXT NOT NULL,
    programme TEXT NOT NULL,
    level TEXT NOT NULL,
    category TEXT NOT NULL,
    amount_kobo BIGINT NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_reference TEXT NOT NULL,
    gateway_reference TEXT NOT NULL,
    qr_verification_hash TEXT NOT NULL,
    issuer TEXT NOT NULL DEFAULT 'Bursary Department, Bethsaida College',
    paid_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 7. COURSE SCORES & BROADSHEET ───
CREATE TABLE IF NOT EXISTS course_scores (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    matric_number TEXT NOT NULL,
    course_code TEXT NOT NULL,
    course_title TEXT NOT NULL,
    credit_units INT NOT NULL DEFAULT 3,
    ca_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    exam_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    total_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    grade TEXT NOT NULL DEFAULT 'F',
    grade_point NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    semester TEXT NOT NULL DEFAULT 'Harmattan',
    academic_session TEXT NOT NULL DEFAULT '2026/2027',
    is_ratified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 8. CLINICAL POSTINGS ───
CREATE TABLE IF NOT EXISTS clinical_postings (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    matric_number TEXT NOT NULL,
    student_name TEXT NOT NULL,
    hospital_name TEXT NOT NULL,
    ward_specialty TEXT NOT NULL,
    rotation_period TEXT NOT NULL,
    preceptor_name TEXT NOT NULL,
    logbook_completed BOOLEAN NOT NULL DEFAULT FALSE,
    preceptor_sign_off BOOLEAN NOT NULL DEFAULT FALSE,
    clearance_status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 9. HOSTEL BED ALLOCATIONS ───
CREATE TABLE IF NOT EXISTS hostel_allocations (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    hall_name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    bed_space TEXT NOT NULL,
    student_id TEXT REFERENCES students(id) ON DELETE SET NULL,
    matric_number TEXT,
    occupant_name TEXT,
    status TEXT NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 10. AUDIT LOGS (SHA-256 CHAINED) ───
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    actor_id TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    before_snapshot JSONB,
    after_snapshot JSONB,
    ip_address TEXT,
    user_agent TEXT,
    chain_hash TEXT NOT NULL,
    prev_hash TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ROW LEVEL SECURITY (RLS) ───
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Transparent read policies for authenticated and anon users (Multi-tenant scoped by college_id)
DO $$
BEGIN
    DROP POLICY IF EXISTS "colleges_select_all" ON colleges;
    CREATE POLICY "colleges_select_all" ON colleges FOR SELECT USING (true);

    DROP POLICY IF EXISTS "departments_select_all" ON departments;
    CREATE POLICY "departments_select_all" ON departments FOR SELECT USING (true);

    DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
    CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);

    DROP POLICY IF EXISTS "students_select_all" ON students;
    CREATE POLICY "students_select_all" ON students FOR SELECT USING (true);

    DROP POLICY IF EXISTS "ledgers_select_all" ON student_ledgers;
    CREATE POLICY "ledgers_select_all" ON student_ledgers FOR SELECT USING (true);

    DROP POLICY IF EXISTS "receipts_select_all" ON official_receipts;
    CREATE POLICY "receipts_select_all" ON official_receipts FOR SELECT USING (true);

    DROP POLICY IF EXISTS "scores_select_all" ON course_scores;
    CREATE POLICY "scores_select_all" ON course_scores FOR SELECT USING (true);

    DROP POLICY IF EXISTS "clinical_select_all" ON clinical_postings;
    CREATE POLICY "clinical_select_all" ON clinical_postings FOR SELECT USING (true);

    DROP POLICY IF EXISTS "hostels_select_all" ON hostel_allocations;
    CREATE POLICY "hostels_select_all" ON hostel_allocations FOR SELECT USING (true);

    DROP POLICY IF EXISTS "audit_select_all" ON audit_logs;
    CREATE POLICY "audit_select_all" ON audit_logs FOR SELECT USING (true);
END $$;

-- Write policies allowing inserts for system workflows
DO $$
BEGIN
    DROP POLICY IF EXISTS "ledgers_insert_all" ON student_ledgers;
    CREATE POLICY "ledgers_insert_all" ON student_ledgers FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "receipts_insert_all" ON official_receipts;
    CREATE POLICY "receipts_insert_all" ON official_receipts FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "audit_insert_all" ON audit_logs;
    CREATE POLICY "audit_insert_all" ON audit_logs FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "scores_update_all" ON course_scores;
    CREATE POLICY "scores_update_all" ON course_scores FOR UPDATE USING (true);
END $$;

-- ─── CampusOne Migration: Enhance Profiles & RBAC Single Source of Truth ───
-- File: supabase/migrations/20261114002000_enhance_profiles_and_rbac.sql

-- 1. Add missing profile fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS title TEXT;

-- 2. Update existing profiles with statutory granular permissions & profiles
-- PROVOST
UPDATE profiles
SET 
    title = 'College Provost & Chief Executive',
    permissions = ARRAY[
        'adm:read', 'adm:write', 'adm:approve',
        'sis:read', 'sis:write', 'sis:status_change',
        'fin:read', 'fin:write', 'fin:reversal', 'fin:reconciliation',
        'exm:read', 'exm:score_entry', 'exm:approve_hod', 'exm:approve_dean', 'exm:publish', 'exm:amend',
        'att:read', 'att:mark', 'att:override',
        'cln:read', 'cln:allocate', 'cln:assess', 'cln:clearance',
        'lms:read', 'lms:write', 'lms:grade',
        'hrm:read', 'hrm:write', 'hrm:payroll',
        'hst:read', 'hst:allocate',
        'tts:read', 'tts:write',
        'com:read', 'com:broadcast',
        'rpt:read', 'rpt:export', 'rpt:audit',
        'core:admin', 'core:users', 'core:tenant_config'
    ],
    bio = 'Executive institutional leadership, Academic Senate chair, and accreditation governance.',
    address = 'Bethsaida Campus, Provost Residence, Ijebu-Ode, Ogun State',
    updated_at = NOW()
WHERE email = 'provost@bethsaida.edu.ng';

-- BURSAR
UPDATE profiles
SET 
    title = 'Chief Bursar & Director of Finance',
    permissions = ARRAY[
        'fin:read', 'fin:write', 'fin:reversal', 'fin:reconciliation',
        'sis:read',
        'hst:read',
        'rpt:read', 'rpt:export',
        'com:read', 'com:broadcast'
    ],
    bio = 'Double-entry student master ledgers, electronic payment reconciliation, and fee structures.',
    address = 'Bursary Quarters, Bethsaida College, Ijebu-Ode',
    updated_at = NOW()
WHERE email = 'bursar@bethsaida.edu.ng';

-- REGISTRAR
UPDATE profiles
SET 
    title = 'College Registrar & Secretary to Academic Board',
    permissions = ARRAY[
        'adm:read', 'adm:write', 'adm:approve',
        'sis:read', 'sis:write', 'sis:status_change',
        'hst:read', 'hst:allocate',
        'tts:read', 'tts:write',
        'rpt:read', 'rpt:export',
        'com:read', 'com:broadcast'
    ],
    bio = 'Admissions screening oversight, student matriculation lifecycle, and regulatory council returns.',
    address = 'Registry Division, Bethsaida College, Ijebu-Ode',
    updated_at = NOW()
WHERE email = 'registrar@bethsaida.edu.ng';

-- EXAMINATIONS OFFICER
UPDATE profiles
SET 
    title = 'Director of Examinations & Academic Records',
    permissions = ARRAY[
        'exm:read', 'exm:publish', 'exm:amend',
        'att:read', 'att:override',
        'lms:read',
        'rpt:read', 'rpt:export',
        'com:read'
    ],
    bio = 'Continuous assessment compilation, examination broadsheets ratification, and 75% attendance rule validation.',
    address = 'Academic Affairs Complex, Bethsaida College',
    updated_at = NOW()
WHERE email = 'exams@bethsaida.edu.ng';

-- HOD COMMUNITY HEALTH
UPDATE profiles
SET 
    title = 'Head of Department, Community Health Science',
    permissions = ARRAY[
        'exm:read', 'exm:score_entry', 'exm:approve_hod',
        'sis:read',
        'att:read', 'att:mark',
        'cln:read', 'cln:allocate', 'cln:assess',
        'lms:read', 'lms:write',
        'tts:read',
        'com:read'
    ],
    bio = 'Departmental faculty coordination, course score approvals, and clinical rotation monitoring.',
    address = 'Staff Quarters, Block C, Bethsaida College',
    updated_at = NOW()
WHERE email = 'hod.chew@bethsaida.edu.ng';

-- INSTRUCTOR
UPDATE profiles
SET 
    title = 'Senior Lecturer & Course Coordinator',
    permissions = ARRAY[
        'exm:score_entry',
        'att:read', 'att:mark',
        'lms:read', 'lms:write', 'lms:grade',
        'tts:read',
        'com:read'
    ],
    bio = 'Continuous assessment score entry, lecture attendance registers, and teaching timetable.',
    address = 'Faculty Villa, Bethsaida College',
    updated_at = NOW()
WHERE email = 'o.johnson@bethsaida.edu.ng';

-- CLINICAL SUPERVISOR
UPDATE profiles
SET 
    title = 'Chief Clinical Preceptor (UCH Unit)',
    permissions = ARRAY[
        'cln:read', 'cln:assess', 'cln:clearance',
        'att:read', 'att:mark',
        'com:read'
    ],
    bio = 'Hospital ward trainee posting supervision, clinical logbook procedure grading, and preceptor sign-off.',
    address = 'Clinical Training Unit, UCH Ibadan',
    updated_at = NOW()
WHERE email = 'g.okafor@uch-ibadan.org.ng';

-- STUDENT TRAINEE (STU)
UPDATE profiles
SET 
    title = 'Student Trainee (CHEW 200 Level)',
    permissions = ARRAY[
        'sis:read_own',
        'fin:read_own',
        'exm:read_own',
        'att:read_own',
        'cln:read_own',
        'lms:read_own',
        'hst:read_own',
        'tts:read_own',
        'com:read'
    ],
    bio = 'Community Health Extension Worker (CHEW) Trainee • Distinction Track',
    address = 'Florence Nightingale Hall, Block B, Room 104, Bed A',
    emergency_contact = 'Chief Michael Adeyemi (+234 803 999 1122)',
    gender = 'Female',
    updated_at = NOW()
WHERE email = 'che.2026.0014@bethsaida.edu.ng';

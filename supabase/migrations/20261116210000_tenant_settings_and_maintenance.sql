-- Ensure all SchoolProfile and Maintenance Mode columns exist on public.tenant_settings
-- and reload PostgREST schema cache so updates never fail with 400.

ALTER TABLE public.tenant_settings
  ADD COLUMN IF NOT EXISTS institution_name TEXT DEFAULT 'Bethsaida College of Health Technology',
  ADD COLUMN IF NOT EXISTS institution_acronym TEXT DEFAULT 'BCHT',
  ADD COLUMN IF NOT EXISTS institution_code TEXT DEFAULT 'NG-OYO-BCHT-2026',
  ADD COLUMN IF NOT EXISTS institution_type TEXT DEFAULT 'HEALTH_TECHNOLOGY',
  ADD COLUMN IF NOT EXISTS institutional_sector TEXT DEFAULT 'College of Health Technology',
  ADD COLUMN IF NOT EXISTS campus_address TEXT DEFAULT 'Ikolaba Aladan layout, off Ayegun Yemetu Road, along CAC grammar school, Ogbomoso, Oyo State, Nigeria',
  ADD COLUMN IF NOT EXISTS official_email TEXT DEFAULT 'info@becohtech.edu.ng',
  ADD COLUMN IF NOT EXISTS official_phone TEXT DEFAULT '+234 907 578 9045',
  ADD COLUMN IF NOT EXISTS website_url TEXT DEFAULT 'https://becohtech.edu.ng',
  ADD COLUMN IF NOT EXISTS accreditation_reg_no TEXT DEFAULT 'NBTE/CHT/2026/089',
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS regulatory_councils TEXT[] DEFAULT ARRAY[
    'CHPRBN',
    'EHORECON',
    'HRORBN',
    'DTRBN',
    'PCN',
    'FMOH',
    'NBTE'
  ],
  ADD COLUMN IF NOT EXISTS academic_levels TEXT[] DEFAULT ARRAY[
    '100 Level',
    '200 Level',
    '300 Level',
    'ND I',
    'ND II',
    'HND I',
    'HND II'
  ],
  ADD COLUMN IF NOT EXISTS academic_semesters TEXT[] DEFAULT ARRAY[
    'Harmattan Semester',
    'Rain Semester'
  ],
  ADD COLUMN IF NOT EXISTS academic_sessions TEXT[] DEFAULT ARRAY[
    '2025/2026',
    '2026/2027',
    '2027/2028'
  ],
  ADD COLUMN IF NOT EXISTS active_session TEXT DEFAULT '2026/2027',
  ADD COLUMN IF NOT EXISTS active_semester TEXT DEFAULT 'Harmattan Semester',
  ADD COLUMN IF NOT EXISTS attendance_cutoff_pct INT DEFAULT 75,
  ADD COLUMN IF NOT EXISTS ca_weight_pct INT DEFAULT 40,
  ADD COLUMN IF NOT EXISTS exam_weight_pct INT DEFAULT 60,
  ADD COLUMN IF NOT EXISTS two_factor_enforced BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS session_timeout_mins INT DEFAULT 30,
  ADD COLUMN IF NOT EXISTS admissions_open BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS admission_batch TEXT DEFAULT 'Merit List (Batch 1)',
  ADD COLUMN IF NOT EXISTS application_fee_kobo BIGINT DEFAULT 1000000,
  ADD COLUMN IF NOT EXISTS acceptance_fee_kobo BIGINT DEFAULT 3500000,
  ADD COLUMN IF NOT EXISTS minimum_cutoff_score INT DEFAULT 50,
  ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS maintenance_title TEXT DEFAULT 'Scheduled System Maintenance',
  ADD COLUMN IF NOT EXISTS maintenance_message TEXT DEFAULT 'The college portal is currently undergoing scheduled maintenance and system upgrades. Normal access will resume shortly.',
  ADD COLUMN IF NOT EXISTS maintenance_eta TEXT DEFAULT 'Within 2 hours',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Replace any legacy Moniya/Ibadan placeholder address with the official Ogbomoso campus address
UPDATE public.tenant_settings
SET
  campus_address = 'Ikolaba Aladan layout, off Ayegun Yemetu Road, along CAC grammar school, Ogbomoso, Oyo State, Nigeria',
  official_email = COALESCE(NULLIF(official_email, ''), 'info@becohtech.edu.ng'),
  official_phone = COALESCE(NULLIF(official_phone, ''), '+234 907 578 9045'),
  website_url = COALESCE(NULLIF(website_url, ''), 'https://becohtech.edu.ng')
WHERE college_id = 'bethsaida'
  AND (campus_address ILIKE '%Moniya%' OR campus_address IS NULL);

-- Update public branding RPC to also expose maintenance status pre-login
DROP FUNCTION IF EXISTS public.get_public_branding();
CREATE OR REPLACE FUNCTION public.get_public_branding()
RETURNS TABLE (
  institution_name text,
  institution_acronym text,
  logo_url text,
  campus_address text,
  official_email text,
  official_phone text,
  maintenance_mode boolean,
  maintenance_title text,
  maintenance_message text,
  maintenance_eta text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    t.institution_name,
    t.institution_acronym,
    t.logo_url,
    t.campus_address,
    t.official_email,
    t.official_phone,
    COALESCE(t.maintenance_mode, false),
    COALESCE(t.maintenance_title, 'Scheduled System Maintenance'),
    COALESCE(t.maintenance_message, 'The college portal is currently undergoing scheduled maintenance and system upgrades. Normal access will resume shortly.'),
    COALESCE(t.maintenance_eta, 'Within 2 hours')
  FROM public.tenant_settings t
  WHERE t.college_id = 'bethsaida'
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.get_public_branding() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_branding() TO anon, authenticated;

-- Reload PostgREST schema cache immediately
NOTIFY pgrst, 'reload schema';

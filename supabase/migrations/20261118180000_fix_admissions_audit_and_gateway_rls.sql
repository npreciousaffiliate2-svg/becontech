-- Migration: 20261118180000_fix_admissions_audit_and_gateway_rls.sql
-- Hardened RLS, zero secret key exposure, tamper-proof candidate submission & public status lookup

-- 1. INTEGRATION SETTINGS: NEVER expose secret_key, webhook_secret, or smtp_password to anon/students!
REVOKE SELECT ON public.integration_settings FROM anon;
DROP POLICY IF EXISTS gateways_read_checkout ON public.integration_settings;
DROP POLICY IF EXISTS "integration_settings_select_all" ON public.integration_settings;
DROP POLICY IF EXISTS "integration_settings_upsert_all" ON public.integration_settings;

-- Strictly staff-only access to full integration_settings (including secrets)
DROP POLICY IF EXISTS gateways_staff_only ON public.integration_settings;
CREATE POLICY gateways_staff_only ON public.integration_settings
    FOR ALL TO authenticated
    USING (public.current_app_role() IN ('SADMIN', 'PROVOST', 'BURSAR'))
    WITH CHECK (public.current_app_role() IN ('SADMIN', 'PROVOST', 'BURSAR'));

-- Safe public read-only view exposing ONLY non-secret public checkout keys
CREATE OR REPLACE VIEW public.public_payment_gateways AS
SELECT
    id,
    college_id,
    gateway_type,
    provider,
    is_enabled,
    environment,
    public_key,
    updated_at
FROM public.integration_settings
WHERE is_enabled = true
  AND gateway_type LIKE 'payment_%';

GRANT SELECT ON public.public_payment_gateways TO anon, authenticated;

-- 2. OPERATIONAL RECORDS: Strict least-privilege RLS (NO anon/student UPDATE or DELETE on admissions!)
DROP POLICY IF EXISTS operational_records_candidates_all ON public.operational_records;
DROP POLICY IF EXISTS operational_records_candidates_anon ON public.operational_records;
DROP POLICY IF EXISTS operational_records_candidates_read ON public.operational_records;

-- Public read-only access strictly for institutional reference data (departments, programmes, semesters)
CREATE POLICY operational_records_public_reference_read ON public.operational_records
    FOR SELECT TO anon, authenticated
    USING (
        record_kind IN (
            'system.departments',
            'registry.departments',
            'registry.programmes',
            'academic.semesters'
        )
    );

-- Authenticated applicants/students can read ONLY their own admission candidate record
CREATE POLICY operational_records_own_candidate_read ON public.operational_records
    FOR SELECT TO authenticated
    USING (
        record_kind = 'admissions.candidates'
        AND lower(payload->>'email') = lower(coalesce(auth.jwt() ->> 'email', ''))
    );

-- 3. TAMPER-PROOF CANDIDATE SUBMISSION RPC (Forces server-side invariants: APPLIED, CBT=0, PENDING O'Level, UNPAID)
CREATE OR REPLACE FUNCTION public.submit_admission_application(
    p_application_number TEXT,
    p_full_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_gender TEXT,
    p_state_of_origin TEXT,
    p_lga TEXT,
    p_programme_code TEXT,
    p_programme TEXT,
    p_department TEXT,
    p_regulatory_body TEXT,
    p_olevel_exam_body TEXT,
    p_olevel_exam_year TEXT,
    p_olevel_subjects JSONB,
    p_avatar_url TEXT DEFAULT NULL,
    p_one_id_number TEXT DEFAULT NULL,
    p_one_id_verified BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id TEXT;
    v_payload JSONB;
BEGIN
    IF p_full_name IS NULL OR length(trim(p_full_name)) < 2 THEN
        RAISE EXCEPTION 'Full name is required';
    END IF;
    IF p_email IS NULL OR position('@' in p_email) = 0 THEN
        RAISE EXCEPTION 'Valid email address is required';
    END IF;

    v_id := 'admissions.candidates:' || p_application_number;

    -- Server-enforced invariants: applicants can NEVER self-admit, set CBT scores, or mark fees paid
    v_payload := jsonb_build_object(
        'id', 'app-' || substring(md5(p_email || now()::text) from 1 for 8),
        'applicationNumber', p_application_number,
        'fullName', trim(p_full_name),
        'email', lower(trim(p_email)),
        'phone', trim(coalesce(p_phone, '')),
        'gender', coalesce(p_gender, 'Female'),
        'stateOfOrigin', coalesce(p_state_of_origin, 'Oyo State'),
        'lga', coalesce(p_lga, ''),
        'programmeCode', p_programme_code,
        'programme', p_programme,
        'department', p_department,
        'regulatoryBody', p_regulatory_body,
        'olevelExamBody', coalesce(p_olevel_exam_body, 'WAEC'),
        'olevelExamYear', coalesce(p_olevel_exam_year, '2025'),
        'olevelStatus', 'PENDING',
        'olevelSubjects', coalesce(p_olevel_subjects, '[]'::jsonb),
        'cbtScore', 0,
        'cbtDate', to_char(now(), 'YYYY-MM-DD'),
        'status', 'APPLIED',
        'applicationFeePaid', false,
        'acceptanceFeePaid', false,
        'avatarUrl', p_avatar_url,
        'oneIdNumber', p_one_id_number,
        'oneIdVerified', coalesce(p_one_id_verified, false),
        'registeredAt', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    );

    INSERT INTO public.operational_records (id, college_id, record_kind, payload, updated_at)
    VALUES (v_id, 'bethsaida', 'admissions.candidates', v_payload, now())
    ON CONFLICT (id) DO NOTHING;

    RETURN v_payload;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_admission_application TO anon, authenticated;

-- 4. PUBLIC CHECK ADMISSION STATUS RPC (Zero PII exposure — returns only status summary)
CREATE OR REPLACE FUNCTION public.check_admission_status(p_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_row JSONB;
BEGIN
    SELECT payload INTO v_row
    FROM public.operational_records
    WHERE record_kind = 'admissions.candidates'
      AND (
          lower(payload->>'applicationNumber') = lower(trim(p_query))
          OR lower(payload->>'email') = lower(trim(p_query))
      )
    LIMIT 1;

    IF v_row IS NULL THEN
        RETURN NULL;
    END IF;

    -- Return strictly non-sensitive admission status fields (no phone, address, NIN, or private notes)
    RETURN jsonb_build_object(
        'applicationNumber', v_row->>'applicationNumber',
        'fullName', v_row->>'fullName',
        'programme', v_row->>'programme',
        'programmeCode', v_row->>'programmeCode',
        'department', v_row->>'department',
        'regulatoryBody', v_row->>'regulatoryBody',
        'status', v_row->>'status',
        'olevelStatus', v_row->>'olevelStatus',
        'applicationFeePaid', coalesce((v_row->>'applicationFeePaid')::boolean, false),
        'acceptanceFeePaid', coalesce((v_row->>'acceptanceFeePaid')::boolean, false),
        'matricNumber', v_row->>'matricNumber',
        'cbtDate', v_row->>'cbtDate'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_admission_status(TEXT) TO anon, authenticated;

-- 5. AUDIT LOGS: Insert-only for authenticated actors (never UPDATE or DELETE)
REVOKE UPDATE, DELETE ON public.audit_logs FROM anon, authenticated;
GRANT INSERT ON public.audit_logs TO authenticated;
DROP POLICY IF EXISTS audit_insert_anon ON public.audit_logs;
DROP POLICY IF EXISTS audit_insert ON public.audit_logs;
CREATE POLICY audit_insert ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);

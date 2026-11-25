-- Migration: 20261125131000_prevent_duplicate_accounts.sql
-- Enforces one-account-per-person across email, phone, and UseOneID identity

-- 1. Zero-PII duplicate account check RPC (used by UseOneID auto-fill and /apply form)
CREATE OR REPLACE FUNCTION public.check_existing_account(
    p_email TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_one_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_email TEXT := lower(trim(coalesce(p_email, '')));
    v_phone TEXT := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
    v_phone_tail TEXT := CASE WHEN length(v_phone) >= 10 THEN right(v_phone, 10) ELSE '' END;
    v_one_id TEXT := lower(trim(coalesce(p_one_id, '')));
    v_cand JSONB;
    v_profile_email TEXT;
BEGIN
    IF v_email = '' AND v_phone_tail = '' AND v_one_id = '' THEN
        RETURN jsonb_build_object('exists', false);
    END IF;

    -- Check existing admission candidates
    SELECT payload INTO v_cand
    FROM public.operational_records
    WHERE record_kind = 'admissions.candidates'
      AND (
          (v_email <> '' AND lower(trim(coalesce(payload->>'email', ''))) = v_email)
          OR (v_one_id <> '' AND lower(trim(coalesce(payload->>'oneIdNumber', ''))) = v_one_id)
          OR (
              v_phone_tail <> ''
              AND length(regexp_replace(coalesce(payload->>'phone', ''), '[^0-9]', '', 'g')) >= 10
              AND right(regexp_replace(coalesce(payload->>'phone', ''), '[^0-9]', '', 'g'), 10) = v_phone_tail
          )
      )
    LIMIT 1;

    IF v_cand IS NOT NULL THEN
        RETURN jsonb_build_object(
            'exists', true,
            'source', 'candidate',
            'applicationNumber', v_cand->>'applicationNumber',
            'status', v_cand->>'status'
        );
    END IF;

    -- Check existing profiles / enrolled students
    SELECT email INTO v_profile_email
    FROM public.profiles
    WHERE (v_email <> '' AND lower(trim(coalesce(email, ''))) = v_email)
       OR (
           v_phone_tail <> ''
           AND length(regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g')) >= 10
           AND right(regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g'), 10) = v_phone_tail
       )
    LIMIT 1;

    IF v_profile_email IS NOT NULL THEN
        RETURN jsonb_build_object(
            'exists', true,
            'source', 'profile',
            'status', 'EXISTING_ACCOUNT'
        );
    END IF;

    RETURN jsonb_build_object('exists', false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_existing_account(TEXT, TEXT, TEXT) TO anon, authenticated;

-- 2. Enforce strict server-side duplicate check inside submit_admission_application
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
    p_one_id_verified BOOLEAN DEFAULT FALSE,
    p_olevel_document_url TEXT DEFAULT NULL,
    p_olevel_document_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_dup JSONB;
    v_app_number TEXT;
    v_id TEXT;
    v_payload JSONB;
BEGIN
    IF p_full_name IS NULL OR length(trim(p_full_name)) < 2 THEN
        RAISE EXCEPTION 'Full name is required';
    END IF;
    IF p_email IS NULL OR position('@' in p_email) = 0 THEN
        RAISE EXCEPTION 'Valid email address is required';
    END IF;

    -- Reject duplicate accounts by email, phone, or UseOneID
    v_dup := public.check_existing_account(p_email, p_phone, p_one_id_number);
    IF coalesce((v_dup->>'exists')::boolean, false) THEN
        RAISE EXCEPTION 'DUPLICATE_ACCOUNT: An account or admission application already exists for this identity. Please sign in to your existing account.';
    END IF;

    v_app_number := coalesce(nullif(trim(p_application_number), ''), 'APP/' || to_char(now(), 'YYYY') || '/' || upper(substring(md5(p_email || now()::text) from 1 for 5)));
    v_id := 'admissions.candidates:' || v_app_number;

    IF EXISTS (SELECT 1 FROM public.operational_records WHERE id = v_id) THEN
        v_app_number := v_app_number || '-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 3));
        v_id := 'admissions.candidates:' || v_app_number;
    END IF;

    v_payload := jsonb_build_object(
        'id', 'app-' || substring(md5(p_email || clock_timestamp()::text) from 1 for 8),
        'applicationNumber', v_app_number,
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
        'olevelExamBody', coalesce(p_olevel_exam_body, 'WAEC (SSCE)'),
        'olevelExamYear', coalesce(p_olevel_exam_year, to_char(now(), 'YYYY')),
        'olevelStatus', 'PENDING',
        'olevelSubjects', coalesce(p_olevel_subjects, '[]'::jsonb),
        'olevelDocumentUrl', p_olevel_document_url,
        'olevelDocumentName', p_olevel_document_name,
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
    VALUES (v_id, 'bethsaida', 'admissions.candidates', v_payload, now());

    RETURN v_payload;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_admission_application(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, BOOLEAN, TEXT, TEXT) TO anon, authenticated;
NOTIFY pgrst, 'reload schema';

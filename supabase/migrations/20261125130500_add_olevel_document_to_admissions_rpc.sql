-- Migration: 20261125130500_add_olevel_document_to_admissions_rpc.sql
-- Adds optional O'Level result slip PDF/image attachment fields to submit_admission_application RPC

DROP FUNCTION IF EXISTS public.submit_admission_application(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, BOOLEAN);

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

    v_app_number := coalesce(nullif(trim(p_application_number), ''), 'APP/2026/' || upper(substring(md5(p_email || now()::text) from 1 for 5)));
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
        'olevelExamYear', coalesce(p_olevel_exam_year, '2025'),
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

GRANT EXECUTE ON FUNCTION public.submit_admission_application TO anon, authenticated;
NOTIFY pgrst, 'reload schema';

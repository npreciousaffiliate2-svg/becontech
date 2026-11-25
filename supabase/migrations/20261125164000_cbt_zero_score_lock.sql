-- Migration: 20261125164000_cbt_zero_score_lock.sql
-- Ensures applicants who time out with 0% cannot retake the single-attempt Online Entrance CBT

CREATE OR REPLACE FUNCTION public.submit_online_cbt_score(
    p_application_number TEXT,
    p_email TEXT,
    p_score INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id TEXT;
    v_payload JSONB;
    v_existing_score INT;
    v_already_taken BOOLEAN;
    v_online_enabled BOOLEAN;
    v_cutoff INT;
BEGIN
    SELECT coalesce(online_cbt_enabled, true), coalesce(minimum_cutoff_score, 50)
    INTO v_online_enabled, v_cutoff
    FROM public.tenant_settings
    WHERE college_id = 'bethsaida'
    LIMIT 1;

    IF NOT coalesce(v_online_enabled, true) THEN
        RAISE EXCEPTION 'ONLINE_CBT_DISABLED: Online entrance CBT is currently disabled by the institution.';
    END IF;

    IF p_score < 0 OR p_score > 100 THEN
        RAISE EXCEPTION 'INVALID_SCORE: CBT score must be between 0 and 100.';
    END IF;

    SELECT id, payload INTO v_id, v_payload
    FROM public.operational_records
    WHERE record_kind = 'admissions.candidates'
      AND lower(payload->>'applicationNumber') = lower(trim(p_application_number))
      AND lower(payload->>'email') = lower(trim(p_email))
    LIMIT 1;

    IF v_id IS NULL THEN
        RAISE EXCEPTION 'CANDIDATE_NOT_FOUND: No matching admission application found.';
    END IF;

    v_existing_score := coalesce((v_payload->>'cbtScore')::int, 0);
    v_already_taken :=
        v_existing_score > 0
        OR coalesce((v_payload->>'cbtTaken')::boolean, false)
        OR coalesce(v_payload->>'cbtMode', '') = 'ONLINE';

    IF v_already_taken THEN
        RAISE EXCEPTION 'CBT_ALREADY_TAKEN: Entrance CBT attempt has already been recorded.';
    END IF;

    v_payload := v_payload || jsonb_build_object(
        'cbtScore', p_score,
        'cbtTaken', true,
        'cbtDate', to_char(now(), 'YYYY-MM-DD'),
        'cbtMode', 'ONLINE',
        'status', CASE
            WHEN coalesce(v_payload->>'status', 'APPLIED') = 'APPLIED' AND p_score >= coalesce(v_cutoff, 50) THEN 'SCREENED'
            ELSE coalesce(v_payload->>'status', 'APPLIED')
        END
    );

    UPDATE public.operational_records
    SET payload = v_payload,
        updated_at = now()
    WHERE id = v_id;

    RETURN v_payload;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_online_cbt_score(TEXT, TEXT, INT) TO anon, authenticated;
NOTIFY pgrst, 'reload schema';

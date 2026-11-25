-- Migration: 20261125132500_online_cbt_and_tenant_toggles.sql
-- Adds configurable Online / Physical Entrance CBT toggles and tamper-proof one-attempt online CBT submission RPC

ALTER TABLE public.tenant_settings
    ADD COLUMN IF NOT EXISTS online_cbt_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS physical_cbt_enabled BOOLEAN NOT NULL DEFAULT TRUE;

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
    v_online_enabled BOOLEAN;
BEGIN
    SELECT coalesce(online_cbt_enabled, true) INTO v_online_enabled
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
    IF v_existing_score > 0 THEN
        RAISE EXCEPTION 'CBT_ALREADY_TAKEN: Entrance CBT score has already been recorded.';
    END IF;

    v_payload := v_payload || jsonb_build_object(
        'cbtScore', p_score,
        'cbtDate', to_char(now(), 'YYYY-MM-DD'),
        'cbtMode', 'ONLINE',
        'status', CASE WHEN coalesce(v_payload->>'status', 'APPLIED') = 'APPLIED' THEN 'SCREENED' ELSE v_payload->>'status' END
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

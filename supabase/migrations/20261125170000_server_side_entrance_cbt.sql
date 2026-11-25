-- Migration: 20261125170000_server_side_entrance_cbt.sql
-- Server-authoritative Online Entrance CBT:
--   * the exam start time and deadline live in the database (cannot be reset by switching browser/device)
--   * the answer key never leaves the database; grading happens on the server
--   * warnings (tab/window leaves) and the submit reason are stored with the candidate record
--   * the old client-trusted score RPC is disabled

CREATE TABLE IF NOT EXISTS public.cbt_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id TEXT NOT NULL DEFAULT 'bethsaida',
    application_number TEXT NOT NULL,
    email TEXT NOT NULL,
    suite_id TEXT,
    suite_title TEXT,
    session TEXT,
    instructions TEXT,
    duration_seconds INT NOT NULL,
    cutoff_score INT NOT NULL DEFAULT 50,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    plan JSONB NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    violations JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'SUBMITTED')),
    submit_reason TEXT,
    score INT,
    correct_count INT,
    total_questions INT,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS cbt_attempts_one_per_application
    ON public.cbt_attempts (college_id, lower(application_number));
CREATE INDEX IF NOT EXISTS cbt_attempts_email_idx ON public.cbt_attempts (lower(email));

ALTER TABLE public.cbt_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cbt_attempts_staff_read ON public.cbt_attempts;
CREATE POLICY cbt_attempts_staff_read ON public.cbt_attempts
    FOR SELECT TO authenticated USING (public.is_staff());

-- Applicants never touch this table directly; they only use the RPCs below.

-- ---------------------------------------------------------------------------
-- Internal: what the applicant is allowed to see (no answer key)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._cbt_attempt_view(p_attempt_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    a public.cbt_attempts%ROWTYPE;
BEGIN
    SELECT * INTO a FROM public.cbt_attempts WHERE id = p_attempt_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'ATTEMPT_NOT_FOUND: Exam attempt not found.';
    END IF;

    RETURN jsonb_build_object(
        'attemptId', a.id,
        'examTitle', a.suite_title,
        'session', a.session,
        'instructions', a.instructions,
        'durationSeconds', a.duration_seconds,
        'remainingSeconds', greatest(0, floor(extract(epoch FROM (a.expires_at - now())))::int),
        'cutoffScore', a.cutoff_score,
        'answers', a.answers,
        'violations', a.violations,
        'questions', coalesce((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', pq.e->>'id',
                    'subject', pq.e->>'subject',
                    'question', pq.e->>'question',
                    'options', (
                        SELECT jsonb_agg(pq.e->'options'->(o.oo::int) ORDER BY o.ord)
                        FROM jsonb_array_elements_text(pq.e->'optionOrder') WITH ORDINALITY AS o(oo, ord)
                    )
                )
                ORDER BY pq.pord
            )
            FROM jsonb_array_elements(a.plan) WITH ORDINALITY AS pq(e, pord)
        ), '[]'::jsonb)
    );
END;
$$;

-- ---------------------------------------------------------------------------
-- Internal: grade on the server and write the result to the candidate record
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._finalize_cbt_attempt(
    p_attempt_id UUID,
    p_reason TEXT,
    p_answers JSONB,
    p_violations JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    a public.cbt_attempts%ROWTYPE;
    v_answers JSONB;
    v_violations JSONB;
    v_reason TEXT;
    v_total INT;
    v_correct INT := 0;
    v_score INT;
    v_strikes INT;
    v_sel TEXT;
    e RECORD;
    v_cand_id TEXT;
    v_cand JSONB;
BEGIN
    SELECT * INTO a FROM public.cbt_attempts WHERE id = p_attempt_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'ATTEMPT_NOT_FOUND: Exam attempt not found.';
    END IF;
    IF a.status = 'SUBMITTED' THEN
        RAISE EXCEPTION 'CBT_ALREADY_TAKEN: Entrance CBT attempt has already been recorded.';
    END IF;

    v_reason := upper(coalesce(p_reason, 'MANUAL'));
    IF v_reason NOT IN ('MANUAL', 'TIME_UP', 'PROCTOR_LIMIT') THEN
        v_reason := 'MANUAL';
    END IF;

    v_violations := coalesce(p_violations, a.violations);
    IF jsonb_typeof(v_violations) <> 'array'
       OR jsonb_array_length(v_violations) < jsonb_array_length(a.violations) THEN
        v_violations := a.violations;
    END IF;

    v_answers := coalesce(p_answers, a.answers);
    IF jsonb_typeof(v_answers) <> 'object' THEN
        v_answers := a.answers;
    END IF;

    -- Late submission: only answers saved before the deadline count
    IF now() > a.expires_at + interval '20 seconds' THEN
        v_reason := 'TIME_UP';
        v_answers := a.answers;
    END IF;

    v_strikes := jsonb_array_length(v_violations);
    IF v_strikes >= 3 AND v_reason = 'MANUAL' THEN
        v_reason := 'PROCTOR_LIMIT';
    END IF;

    v_total := jsonb_array_length(a.plan);
    FOR e IN SELECT value FROM jsonb_array_elements(a.plan) LOOP
        v_sel := v_answers->>(e.value->>'id');
        IF v_sel ~ '^[0-9]+$' THEN
            IF (v_sel::int) < jsonb_array_length(e.value->'optionOrder')
               AND (e.value->'optionOrder'->>(v_sel::int))::int = (e.value->>'correctIndex')::int THEN
                v_correct := v_correct + 1;
            END IF;
        END IF;
    END LOOP;

    v_score := CASE WHEN v_total = 0 THEN 0 ELSE round(v_correct * 100.0 / v_total)::int END;

    UPDATE public.cbt_attempts
    SET status = 'SUBMITTED',
        answers = v_answers,
        violations = v_violations,
        submit_reason = v_reason,
        score = v_score,
        correct_count = v_correct,
        total_questions = v_total,
        submitted_at = now(),
        updated_at = now()
    WHERE id = a.id;

    SELECT id, payload INTO v_cand_id, v_cand
    FROM public.operational_records
    WHERE record_kind = 'admissions.candidates'
      AND lower(payload->>'applicationNumber') = lower(a.application_number)
      AND lower(payload->>'email') = lower(a.email)
    LIMIT 1;

    IF v_cand_id IS NOT NULL THEN
        v_cand := v_cand || jsonb_build_object(
            'cbtScore', v_score,
            'cbtTaken', true,
            'cbtDate', to_char(now(), 'YYYY-MM-DD'),
            'cbtMode', 'ONLINE',
            'cbtSubmitReason', v_reason,
            'cbtStrikes', v_strikes,
            'cbtAttemptId', a.id::text,
            'status', CASE
                WHEN coalesce(v_cand->>'status', 'APPLIED') = 'APPLIED' AND v_score >= a.cutoff_score THEN 'SCREENED'
                ELSE coalesce(v_cand->>'status', 'APPLIED')
            END
        );
        UPDATE public.operational_records
        SET payload = v_cand, updated_at = now()
        WHERE id = v_cand_id;
    END IF;

    RETURN jsonb_build_object(
        'score', v_score,
        'correct', v_correct,
        'total', v_total,
        'cutoffScore', a.cutoff_score,
        'passed', v_score >= a.cutoff_score,
        'reason', v_reason,
        'strikes', v_strikes
    );
END;
$$;

-- ---------------------------------------------------------------------------
-- Public RPC 1: start (or resume) the single official attempt
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.start_online_cbt(
    p_application_number TEXT,
    p_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_enabled BOOLEAN;
    v_session TEXT;
    v_tenant_cutoff INT;
    v_cand_id TEXT;
    v_cand JSONB;
    a public.cbt_attempts%ROWTYPE;
    v_suite JSONB;
    v_plan JSONB;
    v_rand BOOLEAN;
    v_dept TEXT;
    v_prog TEXT;
    v_dur INT;
    v_cutoff INT;
    v_new_id UUID;
    v_result JSONB;
BEGIN
    SELECT coalesce(online_cbt_enabled, true),
           trim(regexp_replace(coalesce(active_session, ''), '\s*Academic Session\s*', '', 'i')),
           coalesce(minimum_cutoff_score, 50)
    INTO v_enabled, v_session, v_tenant_cutoff
    FROM public.tenant_settings
    WHERE college_id = 'bethsaida'
    LIMIT 1;

    IF NOT coalesce(v_enabled, true) THEN
        RAISE EXCEPTION 'ONLINE_CBT_DISABLED: Online entrance CBT is currently disabled by the institution.';
    END IF;

    SELECT id, payload INTO v_cand_id, v_cand
    FROM public.operational_records
    WHERE record_kind = 'admissions.candidates'
      AND lower(payload->>'applicationNumber') = lower(trim(p_application_number))
      AND lower(payload->>'email') = lower(trim(p_email))
    LIMIT 1;

    IF v_cand_id IS NULL THEN
        RAISE EXCEPTION 'CANDIDATE_NOT_FOUND: No matching admission application found.';
    END IF;

    IF coalesce((v_cand->>'cbtScore')::int, 0) > 0
       OR coalesce((v_cand->>'cbtTaken')::boolean, false)
       OR coalesce(v_cand->>'cbtMode', '') = 'ONLINE' THEN
        RAISE EXCEPTION 'CBT_ALREADY_TAKEN: Entrance CBT attempt has already been recorded.';
    END IF;

    SELECT * INTO a
    FROM public.cbt_attempts
    WHERE college_id = 'bethsaida'
      AND lower(application_number) = lower(trim(p_application_number));

    IF FOUND THEN
        IF a.status = 'SUBMITTED' THEN
            RAISE EXCEPTION 'CBT_ALREADY_TAKEN: Entrance CBT attempt has already been recorded.';
        END IF;
        IF lower(a.email) <> lower(trim(p_email)) THEN
            RAISE EXCEPTION 'CANDIDATE_NOT_FOUND: No matching admission application found.';
        END IF;
        IF now() > a.expires_at THEN
            v_result := public._finalize_cbt_attempt(a.id, 'TIME_UP', NULL, NULL);
            RETURN jsonb_build_object('expired', true, 'result', v_result);
        END IF;
        RETURN public._cbt_attempt_view(a.id);
    END IF;

    v_dept := upper(coalesce(v_cand->>'department', ''));
    v_prog := upper(coalesce(v_cand->>'programmeCode', ''));

    WITH s AS (
        SELECT r.payload AS p,
               trim(regexp_replace(coalesce(r.payload->>'session', ''), '\s*Academic Session\s*', '', 'i')) AS ses,
               upper(coalesce(r.payload->>'departmentCode', 'ALL')) AS dc
        FROM public.operational_records r
        WHERE r.record_kind = 'admissions.cbt_suites'
          AND upper(coalesce(r.payload->>'status', 'ACTIVE')) = 'ACTIVE'
          AND jsonb_typeof(r.payload->'questions') = 'array'
          AND jsonb_array_length(r.payload->'questions') > 0
    )
    SELECT p INTO v_suite
    FROM s
    ORDER BY CASE
        WHEN ses = v_session AND dc <> 'ALL' AND (dc = v_prog OR dc = v_dept OR (dc <> '' AND position(dc IN v_dept) > 0)) THEN 1
        WHEN ses = v_session AND dc = 'ALL' THEN 2
        WHEN dc <> 'ALL' AND (dc = v_prog OR dc = v_dept OR (dc <> '' AND position(dc IN v_dept) > 0)) THEN 3
        WHEN dc = 'ALL' THEN 4
        ELSE 5
    END
    LIMIT 1;

    IF v_suite IS NULL THEN
        RAISE EXCEPTION 'NO_EXAM_AVAILABLE: No active entrance exam is available for your session and department yet.';
    END IF;

    v_rand := coalesce((v_suite->>'randomizeQuestions')::boolean, true);

    SELECT jsonb_agg(t.item ORDER BY CASE WHEN v_rand THEN random() ELSE t.ord::float8 END)
    INTO v_plan
    FROM (
        SELECT q.ord,
               jsonb_build_object(
                   'id', q.val->>'id',
                   'subject', coalesce(q.val->>'subject', 'General Knowledge'),
                   'question', q.val->>'question',
                   'options', q.val->'options',
                   'correctIndex', coalesce((q.val->>'correctIndex')::int, 0),
                   'optionOrder', (
                       SELECT jsonb_agg(i ORDER BY CASE WHEN v_rand THEN random() ELSE i::float8 END)
                       FROM generate_series(0, jsonb_array_length(q.val->'options') - 1) AS i
                   )
               ) AS item
        FROM jsonb_array_elements(v_suite->'questions') WITH ORDINALITY AS q(val, ord)
        WHERE jsonb_typeof(q.val->'options') = 'array'
          AND jsonb_array_length(q.val->'options') > 0
          AND coalesce(q.val->>'question', '') <> ''
          AND coalesce(q.val->>'id', '') <> ''
    ) t;

    IF v_plan IS NULL OR jsonb_array_length(v_plan) = 0 THEN
        RAISE EXCEPTION 'NO_EXAM_AVAILABLE: The active entrance exam has no valid questions yet.';
    END IF;

    v_dur := greatest(60, coalesce((v_suite->>'durationMinutes')::int, 20) * 60);
    v_cutoff := coalesce((v_suite->>'cutoffScore')::int, v_tenant_cutoff);

    INSERT INTO public.cbt_attempts (
        application_number, email, suite_id, suite_title, session, instructions,
        duration_seconds, cutoff_score, expires_at, plan
    ) VALUES (
        trim(p_application_number), lower(trim(p_email)),
        v_suite->>'id', v_suite->>'examTitle', v_suite->>'session', v_suite->>'instructions',
        v_dur, v_cutoff, now() + make_interval(secs => v_dur), v_plan
    )
    RETURNING id INTO v_new_id;

    RETURN public._cbt_attempt_view(v_new_id);
END;
$$;

-- ---------------------------------------------------------------------------
-- Public RPC 2: save answers and warnings while the exam is running
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.save_cbt_progress(
    p_attempt_id UUID,
    p_email TEXT,
    p_answers JSONB,
    p_violations JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    a public.cbt_attempts%ROWTYPE;
BEGIN
    SELECT * INTO a
    FROM public.cbt_attempts
    WHERE id = p_attempt_id AND lower(email) = lower(trim(p_email))
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'ATTEMPT_NOT_FOUND: Exam attempt not found.';
    END IF;
    IF a.status <> 'IN_PROGRESS' THEN
        RAISE EXCEPTION 'CBT_ALREADY_TAKEN: Entrance CBT attempt has already been recorded.';
    END IF;

    IF now() <= a.expires_at + interval '20 seconds' THEN
        UPDATE public.cbt_attempts
        SET answers = CASE WHEN jsonb_typeof(p_answers) = 'object' THEN p_answers ELSE answers END,
            violations = CASE
                WHEN jsonb_typeof(p_violations) = 'array'
                     AND jsonb_array_length(p_violations) >= jsonb_array_length(violations)
                THEN p_violations ELSE violations END,
            updated_at = now()
        WHERE id = a.id
        RETURNING * INTO a;
    END IF;

    RETURN jsonb_build_object(
        'remainingSeconds', greatest(0, floor(extract(epoch FROM (a.expires_at - now())))::int),
        'strikes', jsonb_array_length(a.violations)
    );
END;
$$;

-- ---------------------------------------------------------------------------
-- Public RPC 3: submit (manual, time up, or warning limit)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_online_cbt_attempt(
    p_attempt_id UUID,
    p_email TEXT,
    p_answers JSONB,
    p_violations JSONB,
    p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM 1 FROM public.cbt_attempts
    WHERE id = p_attempt_id AND lower(email) = lower(trim(p_email));
    IF NOT FOUND THEN
        RAISE EXCEPTION 'ATTEMPT_NOT_FOUND: Exam attempt not found.';
    END IF;

    RETURN public._finalize_cbt_attempt(p_attempt_id, p_reason, p_answers, p_violations);
END;
$$;

-- ---------------------------------------------------------------------------
-- Permissions
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public._cbt_attempt_view(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._finalize_cbt_attempt(UUID, TEXT, JSONB, JSONB) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.start_online_cbt(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_cbt_progress(UUID, TEXT, JSONB, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_online_cbt_attempt(UUID, TEXT, JSONB, JSONB, TEXT) TO anon, authenticated;

-- The old RPC trusted a score sent by the browser. Disable it for applicants.
REVOKE ALL ON FUNCTION public.submit_online_cbt_score(TEXT, TEXT, INT) FROM PUBLIC, anon, authenticated;

NOTIFY pgrst, 'reload schema';

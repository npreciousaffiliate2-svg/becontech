-- Shared college registers. The web app reads and writes these rows
-- so a change on one signed-in computer is the same record everywhere.

CREATE TABLE IF NOT EXISTS public.operational_records (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL DEFAULT 'bethsaida',
    record_kind TEXT NOT NULL,
    payload JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS operational_records_kind_idx
    ON public.operational_records (record_kind, updated_at);

ALTER TABLE public.students
    ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.operational_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS operational_records_staff ON public.operational_records;
CREATE POLICY operational_records_staff ON public.operational_records
    FOR ALL TO authenticated
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS operational_records_student_read ON public.operational_records;
CREATE POLICY operational_records_student_read ON public.operational_records
    FOR SELECT TO authenticated
    USING (
        record_kind IN (
            'timetable.schedules',
            'timetable.practicals',
            'timetable.venues',
            'comms.notices',
            'learning.attempts',
            'learning.tests',
            'academics.courses',
            'registry.departments',
            'registry.courses',
            'registry.programmes'
        )
        OR (
            record_kind = 'sis.students'
            AND (
                payload->>'matricNumber' = public.current_matric()
                OR lower(payload->>'email') = lower(coalesce(auth.jwt() ->> 'email', ''))
            )
        )
        OR (
            record_kind = 'learning.attempts'
            AND lower(payload->>'studentEmail') = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
    );

DROP POLICY IF EXISTS operational_records_attempt_insert ON public.operational_records;
CREATE POLICY operational_records_attempt_insert ON public.operational_records
    FOR INSERT TO authenticated
    WITH CHECK (
        record_kind = 'learning.attempts'
        AND lower(payload->>'studentEmail') = lower(coalesce(auth.jwt() ->> 'email', ''))
    );

DROP POLICY IF EXISTS operational_records_attempt_update ON public.operational_records;
CREATE POLICY operational_records_attempt_update ON public.operational_records
    FOR UPDATE TO authenticated
    USING (
        record_kind = 'learning.attempts'
        AND lower(payload->>'studentEmail') = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
    WITH CHECK (
        record_kind = 'learning.attempts'
        AND lower(payload->>'studentEmail') = lower(coalesce(auth.jwt() ->> 'email', ''))
    );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.operational_records TO authenticated;

DELETE FROM public.notifications
WHERE id IN ('notif-01', 'notif-02', 'notif-03', 'notif-04');

-- Placeholder gateway secrets were sample strings, not live credentials.
UPDATE public.integration_settings
SET is_enabled = false,
    secret_key = '',
    public_key = COALESCE(public_key, '')
WHERE secret_key ILIKE '%bcht%'
   OR public_key ILIKE '%bcht%'
   OR secret_key ILIKE 're_live_bcht%'
   OR secret_key ILIKE 'termii_key_bcht%'
   OR secret_key ILIKE 'sk_test_bcht%'
   OR public_key ILIKE 'pk_test_bcht%';

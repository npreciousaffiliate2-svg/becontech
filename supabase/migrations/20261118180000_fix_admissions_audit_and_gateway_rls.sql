-- Migration: 20261118180000_fix_admissions_audit_and_gateway_rls.sql
-- Enables candidate registration, audit logging, and public payment checkout reading

-- 1. AUDIT LOGS: Allow anonymous and authenticated actors to insert audit events
GRANT INSERT ON public.audit_logs TO anon, authenticated;

DROP POLICY IF EXISTS audit_insert_anon ON public.audit_logs;
CREATE POLICY audit_insert_anon ON public.audit_logs
    FOR INSERT TO anon
    WITH CHECK (true);

-- 2. OPERATIONAL RECORDS: Allow candidates registration and queries
GRANT SELECT, INSERT, UPDATE, DELETE ON public.operational_records TO anon, authenticated;

DROP POLICY IF EXISTS operational_records_candidates_all ON public.operational_records;
CREATE POLICY operational_records_candidates_all ON public.operational_records
    FOR ALL TO anon, authenticated
    USING (
        record_kind IN (
            'admissions.candidates',
            'system.departments',
            'registry.departments',
            'registry.programmes',
            'academic.semesters'
        )
    )
    WITH CHECK (
        record_kind IN (
            'admissions.candidates',
            'system.departments',
            'registry.departments',
            'registry.programmes',
            'academic.semesters'
        )
    );

-- 3. INTEGRATION SETTINGS: Allow reading enabled gateways for student/applicant checkout
GRANT SELECT ON public.integration_settings TO anon, authenticated;

DROP POLICY IF EXISTS gateways_read_checkout ON public.integration_settings;
CREATE POLICY gateways_read_checkout ON public.integration_settings
    FOR SELECT TO anon, authenticated
    USING (is_enabled = true);

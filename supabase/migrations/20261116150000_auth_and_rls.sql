-- Bind profiles to Supabase Auth and replace open policies with role checks.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE;

UPDATE public.profiles SET email = 'provost@becohtech.edu.ng' WHERE role = 'PROVOST';
UPDATE public.profiles SET email = 'bursar@becohtech.edu.ng' WHERE role = 'BURSAR';
UPDATE public.profiles SET email = 'registrar@becohtech.edu.ng' WHERE role = 'REG';
UPDATE public.profiles SET email = 'exams@becohtech.edu.ng' WHERE role = 'EXAM';
UPDATE public.profiles SET email = 'hod.chd@becohtech.edu.ng' WHERE role = 'HOD';
UPDATE public.profiles SET email = 'o.johnson@becohtech.edu.ng' WHERE role = 'INSTR';
UPDATE public.profiles SET email = 'che.2026.0014@becohtech.edu.ng' WHERE role = 'STU';
UPDATE public.profiles SET email = 'it.admin@becohtech.edu.ng' WHERE role = 'SADMIN';

INSERT INTO public.profiles (id, college_id, email, full_name, role, matric_number, phone)
SELECT 'usr-spon-01', p.college_id, 'm.adeyemi@gmail.com', 'Chief Michael Adeyemi', 'SPON', 'CHE/2026/0014', '+234 803 999 1122'
FROM public.profiles p
WHERE p.role = 'PROVOST'
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email, role = EXCLUDED.role, matric_number = EXCLUDED.matric_number;

UPDATE public.profiles
SET matric_number = 'CHE/2026/0014'
WHERE role = 'STU';

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.current_matric()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT matric_number FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_app_role() IN (
    'SADMIN', 'PROVOST', 'BURSAR', 'REG', 'EXAM', 'HOD', 'INSTR', 'CLINSUP'
  ), false)
$$;

REVOKE ALL ON FUNCTION public.current_app_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_matric() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_app_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_matric() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Reference data: any signed-in college user can read.
CREATE POLICY colleges_read ON public.colleges FOR SELECT TO authenticated USING (true);
CREATE POLICY departments_read ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY departments_write ON public.departments FOR ALL TO authenticated
  USING (public.current_app_role() IN ('SADMIN', 'PROVOST', 'REG'))
  WITH CHECK (public.current_app_role() IN ('SADMIN', 'PROVOST', 'REG'));
CREATE POLICY courses_read ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY courses_write ON public.courses FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY materials_read ON public.course_materials FOR SELECT TO authenticated USING (true);
CREATE POLICY materials_write ON public.course_materials FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY questions_read ON public.cbt_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY questions_write ON public.cbt_questions FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY tenant_read ON public.tenant_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY tenant_write ON public.tenant_settings FOR ALL TO authenticated
  USING (public.current_app_role() IN ('SADMIN', 'PROVOST'))
  WITH CHECK (public.current_app_role() IN ('SADMIN', 'PROVOST'));
CREATE POLICY gateways_read ON public.integration_settings FOR SELECT TO authenticated
  USING (public.current_app_role() IN ('SADMIN', 'PROVOST', 'BURSAR'));
CREATE POLICY gateways_write ON public.integration_settings FOR ALL TO authenticated
  USING (public.current_app_role() = 'SADMIN')
  WITH CHECK (public.current_app_role() = 'SADMIN');

CREATE POLICY profiles_read ON public.profiles FOR SELECT TO authenticated
  USING (public.is_staff() OR auth_user_id = auth.uid());
CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid() OR public.current_app_role() IN ('SADMIN', 'PROVOST'))
  WITH CHECK (auth_user_id = auth.uid() OR public.current_app_role() IN ('SADMIN', 'PROVOST'));
CREATE POLICY profiles_insert_student ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth_user_id = auth.uid() AND role = 'STU');

CREATE POLICY students_read ON public.students FOR SELECT TO authenticated
  USING (public.is_staff() OR matric_number = public.current_matric());
CREATE POLICY students_write ON public.students FOR ALL TO authenticated
  USING (public.current_app_role() IN ('SADMIN', 'PROVOST', 'REG', 'HOD'))
  WITH CHECK (public.current_app_role() IN ('SADMIN', 'PROVOST', 'REG', 'HOD'));

CREATE POLICY ledgers_read ON public.student_ledgers FOR SELECT TO authenticated
  USING (public.is_staff() OR matric_number = public.current_matric());
CREATE POLICY ledgers_insert ON public.student_ledgers FOR INSERT TO authenticated
  WITH CHECK (
    public.current_app_role() IN ('SADMIN', 'PROVOST', 'BURSAR')
    OR (public.current_app_role() = 'STU' AND matric_number = public.current_matric())
  );

CREATE POLICY receipts_read ON public.official_receipts FOR SELECT TO authenticated
  USING (public.is_staff() OR matric_number = public.current_matric());
CREATE POLICY receipts_insert ON public.official_receipts FOR INSERT TO authenticated
  WITH CHECK (
    public.current_app_role() IN ('SADMIN', 'PROVOST', 'BURSAR')
    OR (public.current_app_role() = 'STU' AND matric_number = public.current_matric())
  );

CREATE POLICY scores_read ON public.course_scores FOR SELECT TO authenticated
  USING (public.is_staff() OR matric_number = public.current_matric());
CREATE POLICY scores_write ON public.course_scores FOR ALL TO authenticated
  USING (public.current_app_role() IN ('SADMIN', 'PROVOST', 'EXAM', 'HOD', 'INSTR'))
  WITH CHECK (public.current_app_role() IN ('SADMIN', 'PROVOST', 'EXAM', 'HOD', 'INSTR'));

CREATE POLICY clinical_read ON public.clinical_postings FOR SELECT TO authenticated
  USING (public.is_staff() OR matric_number = public.current_matric());
CREATE POLICY clinical_write ON public.clinical_postings FOR ALL TO authenticated
  USING (public.current_app_role() IN ('SADMIN', 'PROVOST', 'HOD', 'CLINSUP'))
  WITH CHECK (public.current_app_role() IN ('SADMIN', 'PROVOST', 'HOD', 'CLINSUP'));

CREATE POLICY hostels_read ON public.hostel_allocations FOR SELECT TO authenticated
  USING (public.is_staff() OR matric_number = public.current_matric());
CREATE POLICY hostels_write ON public.hostel_allocations FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY candidates_read ON public.candidates FOR SELECT TO authenticated
  USING (
    public.is_staff()
    OR email = (SELECT email FROM public.profiles WHERE auth_user_id = auth.uid())
  );
CREATE POLICY candidates_write ON public.candidates FOR ALL TO authenticated
  USING (public.current_app_role() IN ('SADMIN', 'PROVOST', 'REG'))
  WITH CHECK (public.current_app_role() IN ('SADMIN', 'PROVOST', 'REG'));

CREATE POLICY notices_read ON public.notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY notices_write ON public.notifications FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY tickets_read ON public.support_tickets FOR SELECT TO authenticated
  USING (public.is_staff() OR user_email = (SELECT email FROM public.profiles WHERE auth_user_id = auth.uid()));
CREATE POLICY tickets_insert ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY tickets_update ON public.support_tickets FOR UPDATE TO authenticated
  USING (public.is_staff() OR user_email = (SELECT email FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY audit_read ON public.audit_logs FOR SELECT TO authenticated
  USING (public.current_app_role() IN ('SADMIN', 'PROVOST'));
CREATE POLICY audit_insert ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

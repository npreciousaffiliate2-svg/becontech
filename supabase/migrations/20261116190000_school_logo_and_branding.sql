-- School logo persistence: column, public branding RPC (login page), and storage bucket.

ALTER TABLE public.tenant_settings
  ADD COLUMN IF NOT EXISTS logo_url text;

-- Public (pre-login) branding only: name, acronym, logo. No other settings are exposed.
CREATE OR REPLACE FUNCTION public.get_public_branding()
RETURNS TABLE (institution_name text, institution_acronym text, logo_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.institution_name, t.institution_acronym, t.logo_url
  FROM public.tenant_settings t
  WHERE t.college_id = 'bethsaida'
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.get_public_branding() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_branding() TO anon, authenticated;

-- Branding bucket: public read, write limited to SADMIN / PROVOST.
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS branding_public_read ON storage.objects;
CREATE POLICY branding_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'branding');

DROP POLICY IF EXISTS branding_admin_insert ON storage.objects;
CREATE POLICY branding_admin_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'branding' AND public.current_app_role() IN ('SADMIN', 'PROVOST'));

DROP POLICY IF EXISTS branding_admin_update ON storage.objects;
CREATE POLICY branding_admin_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'branding' AND public.current_app_role() IN ('SADMIN', 'PROVOST'))
  WITH CHECK (bucket_id = 'branding' AND public.current_app_role() IN ('SADMIN', 'PROVOST'));

DROP POLICY IF EXISTS branding_admin_delete ON storage.objects;
CREATE POLICY branding_admin_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'branding' AND public.current_app_role() IN ('SADMIN', 'PROVOST'));

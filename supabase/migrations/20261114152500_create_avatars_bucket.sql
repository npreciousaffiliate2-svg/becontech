-- Ensure storage bucket 'avatars' exists and is publicly readable
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'avatars_public_select' AND tablename = 'objects') THEN
        CREATE POLICY "avatars_public_select" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'avatars_anon_insert' AND tablename = 'objects') THEN
        CREATE POLICY "avatars_anon_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'avatars_anon_update' AND tablename = 'objects') THEN
        CREATE POLICY "avatars_anon_update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');
    END IF;
END $$;

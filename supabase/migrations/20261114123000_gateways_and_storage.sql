-- ─── 1. INTEGRATION SETTINGS (PAYMENT GATEWAYS, EMAIL, SMS) ───
CREATE TABLE IF NOT EXISTS integration_settings (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    gateway_type TEXT NOT NULL, -- 'payment_paystack', 'payment_remita', 'payment_flutterwave', 'email_resend', 'email_smtp', 'sms_termii'
    provider TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    environment TEXT NOT NULL DEFAULT 'TEST', -- 'TEST', 'LIVE'
    public_key TEXT,
    secret_key TEXT,
    webhook_secret TEXT,
    sender_email TEXT,
    sender_name TEXT,
    smtp_host TEXT,
    smtp_port INT,
    smtp_user TEXT,
    smtp_password TEXT,
    extra_config JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "integration_settings_select_all" ON integration_settings;
    CREATE POLICY "integration_settings_select_all" ON integration_settings FOR SELECT USING (true);

    DROP POLICY IF EXISTS "integration_settings_upsert_all" ON integration_settings;
    CREATE POLICY "integration_settings_upsert_all" ON integration_settings FOR ALL USING (true);
END $$;

-- ─── 2. TENANT / SCHOOL SETTINGS TABLE ───
CREATE TABLE IF NOT EXISTS tenant_settings (
    id TEXT PRIMARY KEY,
    college_id TEXT NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    institution_name TEXT NOT NULL,
    institution_acronym TEXT NOT NULL DEFAULT 'BCHT',
    institution_code TEXT NOT NULL DEFAULT 'BCHT-OYO',
    campus_address TEXT NOT NULL,
    official_email TEXT NOT NULL,
    official_phone TEXT NOT NULL,
    website_url TEXT,
    accreditation_reg_no TEXT,
    active_session TEXT NOT NULL DEFAULT '2026/2027',
    active_semester TEXT NOT NULL DEFAULT 'Harmattan',
    attendance_cutoff_pct INT NOT NULL DEFAULT 75,
    ca_weight_pct INT NOT NULL DEFAULT 30,
    exam_weight_pct INT NOT NULL DEFAULT 70,
    two_factor_enforced BOOLEAN NOT NULL DEFAULT TRUE,
    session_timeout_mins INT NOT NULL DEFAULT 15,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "tenant_settings_select_all" ON tenant_settings;
    CREATE POLICY "tenant_settings_select_all" ON tenant_settings FOR SELECT USING (true);

    DROP POLICY IF EXISTS "tenant_settings_upsert_all" ON tenant_settings;
    CREATE POLICY "tenant_settings_upsert_all" ON tenant_settings FOR ALL USING (true);
END $$;

-- ─── 3. SEED DEFAULT GATEWAYS & TENANT SETTINGS ───
INSERT INTO integration_settings (id, college_id, gateway_type, provider, is_enabled, environment, public_key, secret_key, webhook_secret, extra_config)
VALUES 
(
    'gw_paystack_bethsaida',
    'bethsaida',
    'payment_paystack',
    'Paystack Payments',
    true,
    'TEST',
    'pk_test_bcht_paystack_829104812398',
    'sk_test_bcht_paystack_981234918234',
    'wh_sec_bcht_81923812',
    '{"currency": "NGN", "channels": ["card", "bank", "ussd", "bank_transfer"]}'::jsonb
),
(
    'gw_remita_bethsaida',
    'bethsaida',
    'payment_remita',
    'Remita Gateway',
    true,
    'TEST',
    'remita_pub_key_bcht_29104',
    'remita_sec_key_bcht_91823',
    'remita_wh_918239',
    '{"merchantId": "25412398", "serviceTypeId": "4430731"}'::jsonb
),
(
    'gw_flutterwave_bethsaida',
    'bethsaida',
    'payment_flutterwave',
    'Flutterwave Gateway',
    false,
    'TEST',
    'FLWPUBK_TEST-91823719283-X',
    'FLWSECK_TEST-91823719283-X',
    'flw_wh_sec_19283',
    '{"currency": "NGN"}'::jsonb
),
(
    'gw_email_resend_bethsaida',
    'bethsaida',
    'email_resend',
    'Resend Transactional Email',
    true,
    'LIVE',
    NULL,
    're_live_bcht_918237198231',
    NULL,
    '{"senderEmail": "admissions@bethsaida.edu.ng", "senderName": "Bethsaida College Admissions Office"}'::jsonb
),
(
    'gw_sms_termii_bethsaida',
    'bethsaida',
    'sms_termii',
    'Termii Bulk SMS',
    true,
    'LIVE',
    NULL,
    'termii_key_bcht_91823719',
    NULL,
    '{"senderId": "BETHSAIDA", "dndTier": "Tier-1 Direct Bypass"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    provider = EXCLUDED.provider,
    is_enabled = EXCLUDED.is_enabled,
    environment = EXCLUDED.environment,
    public_key = EXCLUDED.public_key,
    secret_key = EXCLUDED.secret_key,
    updated_at = NOW();

INSERT INTO tenant_settings (id, college_id, institution_name, institution_acronym, institution_code, campus_address, official_email, official_phone, website_url, accreditation_reg_no, active_session, active_semester, attendance_cutoff_pct, ca_weight_pct, exam_weight_pct)
VALUES (
    'tenant_bethsaida',
    'bethsaida',
    'Bethsaida College of Health Technology Ltd',
    'BCHT',
    'BCHT-OYO',
    'Health Sciences Complex, Moniya, Ibadan, Oyo State, Nigeria',
    'info@bethsaida.edu.ng',
    '+234 803 124 5590',
    'https://bethsaida.edu.ng',
    'FMOH/NBTE/CHPRBN/2022/048',
    '2026/2027',
    'Harmattan',
    75,
    30,
    70
)
ON CONFLICT (id) DO UPDATE SET
    institution_name = EXCLUDED.institution_name,
    campus_address = EXCLUDED.campus_address,
    official_email = EXCLUDED.official_email,
    official_phone = EXCLUDED.official_phone,
    updated_at = NOW();

-- ─── 4. STORAGE BUCKETS (AVATARS & DOCUMENTS) ───
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
    DROP POLICY IF EXISTS "avatars_public_select" ON storage.objects;
    CREATE POLICY "avatars_public_select" ON storage.objects
        FOR SELECT USING (bucket_id = 'avatars');

    DROP POLICY IF EXISTS "avatars_public_insert" ON storage.objects;
    CREATE POLICY "avatars_public_insert" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'avatars');

    DROP POLICY IF EXISTS "avatars_public_update" ON storage.objects;
    CREATE POLICY "avatars_public_update" ON storage.objects
        FOR UPDATE USING (bucket_id = 'avatars');

    DROP POLICY IF EXISTS "documents_public_select" ON storage.objects;
    CREATE POLICY "documents_public_select" ON storage.objects
        FOR SELECT USING (bucket_id = 'documents');

    DROP POLICY IF EXISTS "documents_public_insert" ON storage.objects;
    CREATE POLICY "documents_public_insert" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'documents');
END $$;

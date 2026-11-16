-- ─── CampusOne Supabase Migration 20261114145000 ───
-- Support & Help Desk Tickets System

CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY,
    ticket_number TEXT UNIQUE NOT NULL,
    college_id TEXT NOT NULL DEFAULT 'bethsaida',
    user_id TEXT,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    user_email TEXT NOT NULL,
    department TEXT,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'NORMAL',
    status TEXT NOT NULL DEFAULT 'OPEN',
    assigned_to TEXT,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'support_tickets_all' AND tablename = 'support_tickets') THEN
        CREATE POLICY "support_tickets_all" ON support_tickets FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

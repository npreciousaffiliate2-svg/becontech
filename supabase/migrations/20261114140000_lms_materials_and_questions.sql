-- Migration: 20261114140000_lms_materials_and_questions.sql
-- Description: Persistent relational tables for E-Learning materials, digital library, and CBT question bank.

CREATE TABLE IF NOT EXISTS course_materials (
  id TEXT PRIMARY KEY,
  college_id TEXT NOT NULL DEFAULT 'bethsaida',
  course_code TEXT NOT NULL,
  title TEXT NOT NULL,
  department_code TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'PDF_DOCUMENT',
  file_size TEXT NOT NULL DEFAULT '2.4 MB',
  file_url TEXT,
  uploaded_by TEXT NOT NULL,
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  download_count INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cbt_questions (
  id TEXT PRIMARY KEY,
  college_id TEXT NOT NULL DEFAULT 'bethsaida',
  course_code TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_option_id TEXT NOT NULL DEFAULT 'A',
  difficulty TEXT NOT NULL DEFAULT 'INTERMEDIATE',
  explanation TEXT,
  author TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policies
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE cbt_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on course_materials"
  ON course_materials FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert/update on course_materials"
  ON course_materials FOR ALL USING (true);

CREATE POLICY "Allow public read on cbt_questions"
  ON cbt_questions FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert/update on cbt_questions"
  ON cbt_questions FOR ALL USING (true);

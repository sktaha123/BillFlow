-- ============================================================
-- B.K. BIRLA COLLEGE — BILLING METHODS MIGRATION
-- Safe to run on existing live database.
-- Uses ALTER TABLE / CREATE TABLE IF NOT EXISTS only.
-- Does NOT drop any existing tables, columns, or data.
-- ============================================================

-- ─── 1. NEW ENUM TYPE FOR BILLING METHOD ───
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_method') THEN
    CREATE TYPE billing_method AS ENUM (
      'PAPER_SETTING',
      'ANSWER_BOOK_ASSESSMENT',
      'PRACTICAL_ASSESSMENT',
      'ONLINE_EXAMINATION_NEP'
    );
  END IF;
END $$;

-- ─── 2. ADD NEW COLUMNS TO bills TABLE ───
-- billing_method: identifies which billing type this bill is
ALTER TABLE bills
  ADD COLUMN IF NOT EXISTS billing_method billing_method NOT NULL DEFAULT 'PAPER_SETTING';

-- month_year: e.g. "October 2026" — used on the official bill header
ALTER TABLE bills
  ADD COLUMN IF NOT EXISTS month_year TEXT;

-- hod_name: name of HOD at time of bill creation — stored for official doc
ALTER TABLE bills
  ADD COLUMN IF NOT EXISTS hod_name TEXT;

-- Make class_id nullable — for multi-class billing types, class is per-row
ALTER TABLE bills ALTER COLUMN class_id DROP NOT NULL;

-- ─── 3. ADD NEW RATE COLUMNS TO system_settings ───
ALTER TABLE system_settings
  ADD COLUMN IF NOT EXISTS answer_book_ug_rate      NUMERIC(10,2) NOT NULL DEFAULT 8.00,
  ADD COLUMN IF NOT EXISTS answer_book_pg_rate      NUMERIC(10,2) NOT NULL DEFAULT 10.00,
  ADD COLUMN IF NOT EXISTS answer_book_msc_rate     NUMERIC(10,2) NOT NULL DEFAULT 15.00,
  ADD COLUMN IF NOT EXISTS internal_assessment_rate NUMERIC(10,2) NOT NULL DEFAULT 4.00,
  ADD COLUMN IF NOT EXISTS practical_ug_assessment_rate NUMERIC(10,2) NOT NULL DEFAULT 25.00,
  ADD COLUMN IF NOT EXISTS practical_pg_assessment_rate NUMERIC(10,2) NOT NULL DEFAULT 30.00,
  ADD COLUMN IF NOT EXISTS online_nep_see_rate      NUMERIC(10,2) NOT NULL DEFAULT 7.00,
  ADD COLUMN IF NOT EXISTS online_nep_answer_key_rate NUMERIC(10,2) NOT NULL DEFAULT 2.00,
  ADD COLUMN IF NOT EXISTS online_nep_cia_rate      NUMERIC(10,2) NOT NULL DEFAULT 4.00,
  ADD COLUMN IF NOT EXISTS online_nep_upload_rate   NUMERIC(10,2) NOT NULL DEFAULT 150.00;

-- ─── 4. ANSWER BOOK ASSESSMENT ITEMS TABLE ───
CREATE TABLE IF NOT EXISTS answer_book_assessment_items (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id              UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  class_id             UUID REFERENCES classes(id),
  subject_id           UUID REFERENCES subjects(id),
  subject_name         TEXT,
  class_name           TEXT,
  level                TEXT NOT NULL DEFAULT 'UG',  -- 'UG' | 'PG' | 'MSC'
  semester_end_books   INT  NOT NULL DEFAULT 0 CHECK (semester_end_books >= 0),
  atkt_books           INT  NOT NULL DEFAULT 0 CHECK (atkt_books >= 0),
  internal_books       INT  NOT NULL DEFAULT 0 CHECK (internal_books >= 0),
  semester_end_rate    NUMERIC(10,2) NOT NULL DEFAULT 8.00,
  atkt_rate            NUMERIC(10,2) NOT NULL DEFAULT 8.00,
  internal_rate        NUMERIC(10,2) NOT NULL DEFAULT 4.00,
  semester_end_amount  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  atkt_amount          NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  internal_amount      NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  subtotal             NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. PRACTICAL ASSESSMENT ITEMS TABLE ───
CREATE TABLE IF NOT EXISTS practical_assessment_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id          UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  subject_id       UUID REFERENCES subjects(id),
  subject_name     TEXT,
  level            TEXT NOT NULL DEFAULT 'UG',  -- 'UG' | 'PG'
  practical_books  INT  NOT NULL DEFAULT 0 CHECK (practical_books >= 0),
  practical_rate   NUMERIC(10,2) NOT NULL DEFAULT 25.00,
  practical_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  subtotal         NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 6. ONLINE EXAMINATION (NEP) ITEMS TABLE ───
CREATE TABLE IF NOT EXISTS online_examination_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id           UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  class_id          UUID REFERENCES classes(id),
  subject_id        UUID REFERENCES subjects(id),
  subject_name      TEXT,
  class_name        TEXT,
  mcq_count         INT  NOT NULL DEFAULT 0 CHECK (mcq_count >= 0),
  student_count     INT  NOT NULL DEFAULT 0 CHECK (student_count >= 0),
  see_rate          NUMERIC(10,2) NOT NULL DEFAULT 7.00,
  answer_key_rate   NUMERIC(10,2) NOT NULL DEFAULT 2.00,
  cia_rate          NUMERIC(10,2) NOT NULL DEFAULT 4.00,
  upload_rate       NUMERIC(10,2) NOT NULL DEFAULT 150.00,
  see_amount        NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  answer_key_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  cia_amount        NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  upload_amount     NUMERIC(10,2) NOT NULL DEFAULT 150.00,
  subtotal          NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 7. ROW LEVEL SECURITY FOR NEW TABLES ───
ALTER TABLE answer_book_assessment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE practical_assessment_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_examination_items     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all answer_book_assessment_items" ON answer_book_assessment_items;
CREATE POLICY "Allow public all answer_book_assessment_items"
  ON answer_book_assessment_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all practical_assessment_items" ON practical_assessment_items;
CREATE POLICY "Allow public all practical_assessment_items"
  ON practical_assessment_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all online_examination_items" ON online_examination_items;
CREATE POLICY "Allow public all online_examination_items"
  ON online_examination_items FOR ALL USING (true) WITH CHECK (true);

-- ─── 8. PERFORMANCE INDEXES ───
CREATE INDEX IF NOT EXISTS idx_answer_book_items_bill_id ON answer_book_assessment_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_practical_items_bill_id   ON practical_assessment_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_online_items_bill_id      ON online_examination_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_bills_billing_method      ON bills(billing_method);

-- ─── 9. GRANT PERMISSIONS ───
GRANT ALL ON answer_book_assessment_items TO anon, authenticated, service_role;
GRANT ALL ON practical_assessment_items   TO anon, authenticated, service_role;
GRANT ALL ON online_examination_items     TO anon, authenticated, service_role;

-- ─── 10. VERIFICATION ───
SELECT 'Migration complete. New tables and columns added.' AS status;
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'bills' AND column_name IN ('billing_method','month_year','hod_name');

-- ============================================================
-- B.K. BIRLA COLLEGE OF ARTS, SCIENCE & COMMERCE (AUTONOMOUS), KALYAN
-- DEPARTMENT OF COMPUTER SCIENCE
-- EXAMINATION PAPER SETTING & REMUNERATION BILLING APPLICATION
-- BULLETPROOF SUPABASE DATABASE SCHEMA (Direct & Fast)
-- ============================================================

-- ─── 0. CLEAN SLATE ───
DROP TABLE IF EXISTS bill_approvals CASCADE;
DROP TABLE IF EXISTS bill_items CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS semesters CASCADE;
DROP TABLE IF EXISTS academic_years CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS paper_type CASCADE;
DROP TYPE IF EXISTS bill_status CASCADE;
DROP TYPE IF EXISTS approval_action CASCADE;

-- ─── 1. EXTENSIONS ───
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 2. CUSTOM ENUMS ───
CREATE TYPE user_role AS ENUM ('FACULTY', 'HOD', 'HEAD');
CREATE TYPE paper_type AS ENUM ('THEORY', 'PRACTICAL');
CREATE TYPE bill_status AS ENUM (
    'DRAFT',
    'PENDING_HOD',
    'REJECTED_BY_HOD',
    'PENDING_HEAD',
    'REJECTED_BY_HEAD',
    'FINALIZED'
);
CREATE TYPE approval_action AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED', 'FINALIZED');

-- ─── 3. ACADEMIC REFERENCE TABLES ───

CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year_label TEXT NOT NULL UNIQUE,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    semester_number INT NOT NULL CHECK (semester_number BETWEEN 1 AND 6),
    roman_label TEXT NOT NULL UNIQUE,
    session_type TEXT DEFAULT 'UG / PG - Semester End Examinations',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL DEFAULT 'Computer Science',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_class_subject UNIQUE (class_id, name)
);

CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_setting_rate NUMERIC(10,2) NOT NULL DEFAULT 400.00,
    translation_rate NUMERIC(10,2) NOT NULL DEFAULT 250.00,
    proof_checking_rate NUMERIC(10,2) NOT NULL DEFAULT 100.00,
    practical_ug_rate NUMERIC(10,2) NOT NULL DEFAULT 400.00,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. PROFILES (Users with direct username & password in Supabase) ───
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    employee_id TEXT,
    role user_role NOT NULL DEFAULT 'FACULTY',
    department TEXT NOT NULL DEFAULT 'Computer Science',
    signature_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. BILLS & WORKFLOW TABLES ───
CREATE SEQUENCE IF NOT EXISTS bill_ref_seq START 1;

CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_reference_id TEXT NOT NULL UNIQUE,
    faculty_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE RESTRICT,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    status bill_status NOT NULL DEFAULT 'PENDING_HOD',
    grand_total NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    amount_in_words TEXT,
    submission_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bill_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
    paper_type paper_type NOT NULL DEFAULT 'THEORY',
    paper_sets INT NOT NULL DEFAULT 0 CHECK (paper_sets >= 0),
    setting_rate NUMERIC(10,2) NOT NULL DEFAULT 400.00,
    setting_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    translation_sets INT NOT NULL DEFAULT 0 CHECK (translation_sets >= 0),
    translation_rate NUMERIC(10,2) NOT NULL DEFAULT 250.00,
    translation_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    proof_papers INT NOT NULL DEFAULT 0 CHECK (proof_papers >= 0),
    proof_rate NUMERIC(10,2) NOT NULL DEFAULT 100.00,
    proof_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    student_count TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bill_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    role user_role NOT NULL,
    action approval_action NOT NULL,
    comment TEXT,
    signature_snapshot_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 6. PERFORMANCE INDEXES ───
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_bills_faculty ON bills(faculty_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_semester ON bills(semester_id);
CREATE INDEX idx_bills_academic_year ON bills(academic_year_id);
CREATE INDEX idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX idx_bill_approvals_bill_id ON bill_approvals(bill_id);

-- ─── 7. TRIGGERS & FUNCTIONS ───

CREATE OR REPLACE FUNCTION generate_bill_reference()
RETURNS TRIGGER AS $$
DECLARE
    current_yr TEXT;
    seq_val INT;
BEGIN
    IF NEW.bill_reference_id IS NULL OR NEW.bill_reference_id = '' THEN
        current_yr := TO_CHAR(NOW(), 'YYYY');
        seq_val := NEXTVAL('bill_ref_seq');
        NEW.bill_reference_id := 'CS-' || current_yr || '-' || LPAD(seq_val::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_bill_reference
BEFORE INSERT ON bills
FOR EACH ROW
EXECUTE FUNCTION generate_bill_reference();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_bills_updated_at
BEFORE UPDATE ON bills
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ─── 8. STORAGE BUCKET FOR SIGNATURES ───
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public signatures read access" ON storage.objects;
CREATE POLICY "Public signatures read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'signatures');

DROP POLICY IF EXISTS "Public upload signatures" ON storage.objects;
CREATE POLICY "Public upload signatures"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'signatures');

DROP POLICY IF EXISTS "Public update signatures" ON storage.objects;
CREATE POLICY "Public update signatures"
ON storage.objects FOR UPDATE
USING (bucket_id = 'signatures');

-- ─── 9. PERMISSIONS & RLS ───
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all academic_years" ON academic_years FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all semesters" ON semesters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all classes" ON classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all subjects" ON subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all system_settings" ON system_settings FOR ALL USING (true);
CREATE POLICY "Allow public all profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all bills" ON bills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all bill_items" ON bill_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all bill_approvals" ON bill_approvals FOR ALL USING (true) WITH CHECK (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- ─── 10. SEED ACADEMIC REFERENCE DATA ───
INSERT INTO academic_years (year_label, is_current) VALUES
('2026–27', true),
('2025–26', false);

INSERT INTO semesters (semester_number, roman_label, session_type) VALUES
(1, 'I',   'UG / PG - Semester End Examinations (Winter Session)'),
(2, 'II',  'UG / PG - Semester End Examinations (Summer Session)'),
(3, 'III', 'UG / PG - Semester End Examinations (Winter Session)'),
(4, 'IV',  'UG / PG - Semester End Examinations (Summer Session)'),
(5, 'V',   'UG / PG - Semester End Examinations (Winter Session)'),
(6, 'VI',  'UG / PG - Semester End Examinations (Summer Session)');

INSERT INTO classes (name, department, active) VALUES
('TYCS', 'Computer Science', true);

DO $$
DECLARE
    tycs_id UUID;
BEGIN
    SELECT id INTO tycs_id FROM classes WHERE name = 'TYCS' LIMIT 1;
    IF tycs_id IS NOT NULL THEN
        INSERT INTO subjects (class_id, name, active) VALUES
        (tycs_id, 'Introduction to AI', true),
        (tycs_id, 'DAA', true),
        (tycs_id, 'Fuzzy Logic', true),
        (tycs_id, 'Blockchain Technology', true);
    END IF;
END $$;

INSERT INTO system_settings (
    paper_setting_rate,
    translation_rate,
    proof_checking_rate,
    practical_ug_rate
) VALUES (400.00, 250.00, 100.00, 400.00);

-- ─── 11. INSERT OFFICIAL USERS DIRECTLY INTO PROFILES ───
INSERT INTO profiles (username, password, name, employee_id, role, department) VALUES
('hema@2026', 'hema@2026', 'Prof. Hemangi Adhiraj', 'EMP-CS-104', 'FACULTY', 'Computer Science'),
('vin@2026',  'vin@2026',  'Prof. Vinod Rajput',   'EMP-CS-002', 'HOD',     'Computer Science'),
('esmi@2026', 'esmi@2026', 'Prof. Esmita Gupta',   'EMP-ADM-001', 'HEAD',   'Computer Science');

-- ─── 12. VERIFICATION QUERY ───
SELECT username, name, role, department FROM profiles;

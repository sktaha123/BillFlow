-- ============================================================
-- SUPABASE AUTH SETUP — BillFlow Users
-- B.K. Birla College (Autonomous), Kalyan — CS Department
-- Run this AFTER creating the Auth users in Supabase Dashboard
-- ============================================================

-- ─── STEP 1: Add username column (if not already present) ───
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- ─── STEP 2: Create the 3 auth users in Supabase Dashboard ───
-- Go to: Supabase Dashboard → Authentication → Users → Add User
-- Create these EXACT 3 users with Email + Password:
--
--   Email: hemangi@bkbirlacollege.edu.in  | Password: hema2026
--   Email: hod.cs@bkbirlacollege.edu.in   | Password: vin2026
--   Email: principal@bkbirlacollege.edu.in | Password: esmi2026
--
-- NOTE: After creating, copy each user's UUID from the Auth table.

-- ─── STEP 3: Insert / update profiles linked to auth users ───
-- Replace the UUIDs below with the actual UUIDs from Supabase Auth.

-- FACULTY — Prof. Hemangi Patil
INSERT INTO profiles (
    user_id, name, email, username, employee_id, role, department,
    bank_name, account_no, ifsc_code, pan_no
) VALUES (
    'REPLACE_WITH_HEMANGI_AUTH_UUID',   -- <-- paste from Dashboard
    'Prof. Hemangi Patil',
    'hemangi@bkbirlacollege.edu.in',
    'hema2026',
    'EMP-CS-104',
    'FACULTY',
    'Computer Science',
    'State Bank of India',
    '30987654321',
    'SBIN0000300',
    'ABCDE1234F'
)
ON CONFLICT (email) DO UPDATE SET
    user_id    = EXCLUDED.user_id,
    username   = EXCLUDED.username;

-- HOD — Dr. Swapna Debnath (Vinayaka)
INSERT INTO profiles (
    user_id, name, email, username, employee_id, role, department,
    bank_name, account_no, ifsc_code, pan_no
) VALUES (
    'REPLACE_WITH_HOD_AUTH_UUID',       -- <-- paste from Dashboard
    'Dr. Swapna Debnath',
    'hod.cs@bkbirlacollege.edu.in',
    'vin2026',
    'EMP-CS-002',
    'HOD',
    'Computer Science',
    'HDFC Bank',
    '50100234567890',
    'HDFC0000123',
    'WXYZP5678Q'
)
ON CONFLICT (email) DO UPDATE SET
    user_id    = EXCLUDED.user_id,
    username   = EXCLUDED.username;

-- HEAD / PRINCIPAL — Dr. Avinash Patil (ESMI)
INSERT INTO profiles (
    user_id, name, email, username, employee_id, role, department,
    bank_name, account_no, ifsc_code, pan_no
) VALUES (
    'REPLACE_WITH_PRINCIPAL_AUTH_UUID', -- <-- paste from Dashboard
    'Dr. Avinash Patil',
    'principal@bkbirlacollege.edu.in',
    'esmi2026',
    'EMP-ADM-001',
    'HEAD',
    'Computer Science',
    'Bank of Maharashtra',
    '60012345678',
    'MAHB0000456',
    'KLMNO9876R'
)
ON CONFLICT (email) DO UPDATE SET
    user_id    = EXCLUDED.user_id,
    username   = EXCLUDED.username;

-- ─── STEP 4: Verify ───
SELECT id, user_id, username, email, role FROM profiles;

-- ─── STEP 5: Add .env file to your project ───
-- Create: BillFlow/.env
--   VITE_SUPABASE_URL=https://your-project.supabase.co
--   VITE_SUPABASE_ANON_KEY=your_anon_key_here
-- Then restart: npm run dev

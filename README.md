# BillFlow — B.K. Birla College (Autonomous)
## Examination Paper Setting & Remuneration Billing Application
### Department of Computer Science, Kalyan

---

## Overview

BillFlow digitizes the official paper-setting and remuneration billing process for the Computer Science Department at B.K. Birla College (Autonomous), Kalyan.

The workflow follows the official hierarchy:

```
FACULTY (creates bill)
    ↓
HOD (verifies & approves)
    ↓
HEAD / PRINCIPAL (finalizes & sanctions)
```

Each step captures an immutable digital signature snapshot, which permanently anchors signatures to their specific workflow action — changing a signature later never alters historical bills.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, JavaScript (JSX) |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| Icons | Lucide React |
| Animation | Framer Motion |

---

## Installation

```bash
# 1. Clone or extract the project
cd BillFlow

# 2. Install dependencies
npm install

# 3. Copy and configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Run development server
npm run dev
```

---

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

If these variables are **not** provided, the application falls back to a fully functional **localStorage-based storage** for immediate local use and testing — no Supabase setup required.

---

## Supabase Setup (1 Single Step)

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** in your Supabase project dashboard (click "New Query")
3. Copy the entire contents of [`supabase/schema.sql`](file:///c:/Users/maria/OneDrive/Desktop/Development/Projects/BillFlow/supabase/schema.sql)
4. Paste and click **Run**

The single script will automatically:
- Enable `uuid-ossp` and `pgcrypto` extensions
- Create all custom ENUM types (`user_role`, `paper_type`, `bill_status`, `approval_action`)
- Create all tables (`academic_years`, `semesters`, `classes`, `subjects`, `system_settings`, `profiles`, `bills`, `bill_items`, `bill_approvals`)
- Set up indexes, auto-increment bill reference triggers (`CS-2026-0001`), and timestamp triggers
- Create the public `signatures` storage bucket with security policies
- Configure Row Level Security (RLS) policies
- Seed academic reference data (`TYCS`, 4 subjects, 6 semesters, `2026–27` academic year)
- Seed default billing rates (₹400 paper setting, ₹250 translation, ₹100 proof check)
- **Pre-create all 3 login accounts directly** in Supabase Auth & Profiles:

| Role | Username | Email | Password |
|---|---|---|---|
| Faculty | `hema2026` | `hemangi@bkbirlacollege.edu.in` | `hema2026` |
| HOD | `vin2026` | `hod.cs@bkbirlacollege.edu.in` | `vin2026` |
| Head / Principal | `esmi2026` | `principal@bkbirlacollege.edu.in` | `esmi2026` |

5. Copy your **Project URL** and **Anon Key** from Supabase Dashboard (**Project Settings → API**) into your `.env` file:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
6. Run `npm run dev` and sign in!

Use the **Quick Role Sign-In** buttons on the login page to instantly switch.

---

## Application Workflow

### Faculty Workflow
```
Login → Faculty Home
      → Signature Setup (Draw or Upload)
      → Create Bill (5-step wizard):
          Step 1: Select Academic Year & Semester (I–VI)
          Step 2: Add Paper (Class, Subject, Theory/Practical)
          Step 3: Cost Calculation (Sets × ₹400, Translation, Proof)
          Step 4: Bill Items Review & Add More
          Step 5: Review Bill Summary
      → Official Bill Preview (B.K. Birla format)
      → Submit (signature snapshot attached)
      → Status: PENDING_HOD
```

### HOD Workflow
```
Login → HOD Home → Pending Bills
      → Review Bill (faculty signature visible)
      → Approve (HOD signature snapshot attached)
      → Status: PENDING_HEAD
      OR
      → Reject (reason recorded)
      → Status: REJECTED_BY_HOD
```

### Head / Principal Workflow
```
Login → Head Home → Pending Sanctions
      → Final Bill Review (faculty + HOD signatures visible)
      → Finalize & Sanction (Head signature snapshot attached)
      → Status: FINALIZED
      OR
      → Reject (reason recorded)
      → Status: REJECTED_BY_HEAD
```

---

## Signature System

### Per-User Signature Setup
- Go to **Signature Setup** (top navbar link)
- **Draw** your signature on canvas (touch/stylus/mouse supported)
- **OR Upload** a PNG/JPG image of your signature

### Immutable Snapshot Architecture
When you take a workflow action, the **current signature is snapshotted** and permanently attached to the `bill_approvals` record. Historical bills always display the exact signature used at the time — changing your signature later has zero effect on past bills.

### Audit Trail
Every workflow action records:
- Who (user + role)
- What (action type)
- When (timestamp)
- Signature snapshot used
- Comment or reason

---

## System Rates (Configurable)

All remuneration rates are stored in `system_settings` and never hardcoded:

| Category | Default Rate |
|---|---|
| Paper Setting (Theory/Practical) | ₹400 per set |
| Translation | ₹250 per set |
| Proof Checking | ₹100 per paper |

---

## Academic Data (Initial Seed)

| Data | Value |
|---|---|
| Class | TYCS (Computer Science) |
| Subjects | Introduction to AI, DAA, Fuzzy Logic, Blockchain Technology |
| Semesters | I, II, III, IV, V, VI |
| Academic Year | 2026–27 (current) |

---

## Official Bill Document

The official `OfficialBillDocument` component reproduces the exact **B.K. Birla College (Autonomous)** institutional "Bill for Paper Setting" format, including:

- Institutional header
- UG/PG Semester End Examinations notation
- Semester selector (I/II/III/IV/V/VI)
- Official 10-column paper setting table
- Category totals (Setting, Translation, Proof)
- Grand Total
- Amount in Words (dynamic Indian currency conversion)
- Certification statement
- Three-column signature section (Faculty → HOD → Principal)

### Printing

Click **Print Official Document** to invoke `window.print()`. The `@media print` CSS automatically:
- Hides navbar, buttons, application chrome
- Displays only the official document in A4 format

---

## Bill Status Flow

```
DRAFT → PENDING_HOD → PENDING_HEAD → FINALIZED
              ↓                ↓
       REJECTED_BY_HOD   REJECTED_BY_HEAD
```

---

## Running Locally

```bash
npm run dev
# Opens at http://localhost:5173
```

## Production Build

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── components/
│   ├── layout/        # Navbar, Layout (no sidebar)
│   ├── ui/            # Button, Input, Select, Modal, StatusBadge, etc.
│   ├── signature/     # SignaturePad, SignatureUpload, SignaturePreview, SignatureModal
│   └── official-bill/ # OfficialBillDocument (B.K. Birla format)
├── context/
│   └── AuthContext.jsx  # Role-based auth & signature state
├── lib/
│   ├── supabase.js      # Supabase client + localStorage fallback DataService
│   ├── calculations.js  # Centralized cost functions
│   └── numberToWords.js # Indian currency amount-in-words converter
└── pages/
    ├── auth/            # LoginPage
    ├── signature/       # SignatureSetupPage
    ├── faculty/         # FacultyHome, BillWizard (5 steps), MyBillsPage
    ├── hod/             # HodHome, HodPendingBills, HodBillReview, HodApprovalSuccess
    ├── head/            # HeadHome, HeadPendingBills, HeadBillReview, HeadApprovalSuccess
    └── common/          # BillsListPage, BillDetailsPage, OfficialBillViewPage
```

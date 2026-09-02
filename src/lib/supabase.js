import { createClient } from '@supabase/supabase-js';
import { DEFAULT_RATES, calculateBillCategoryTotals } from './calculations';

// Initialize Supabase Client if env variables are available (supports Vite & Vercel Supabase integration)
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  '';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ============================================================
// INITIAL SEED REFERENCE DATA
// ============================================================

export const SEED_PROFILES = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    username: 'hema@2026',
    name: 'Prof. Hemangi Adhiraj',
    email: 'hema@bkbirlacollege.edu.in',
    employee_id: 'EMP-CS-104',
    role: 'FACULTY',
    department: 'Computer Science',
    signature_path: null,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    username: 'vin@2026',
    name: 'Prof. Vinod Rajput',
    email: 'vin@bkbirlacollege.edu.in',
    employee_id: 'EMP-CS-002',
    role: 'HOD',
    department: 'Computer Science',
    signature_path: null,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    username: 'esmi@2026',
    name: 'Prof. Esmita Gupta',
    email: 'esmi@bkbirlacollege.edu.in',
    employee_id: 'EMP-ADM-001',
    role: 'HEAD',
    department: 'Computer Science',
    signature_path: null,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z'
  }
];

export const SEED_ACADEMIC_YEARS = [
  { id: 'ay-2026-27', year_label: '2026–27', is_current: true },
  { id: 'ay-2025-26', year_label: '2025–26', is_current: false },
  { id: 'ay-2024-25', year_label: '2024–25', is_current: false },
  { id: 'ay-2023-24', year_label: '2023–24', is_current: false },
  { id: 'ay-2022-23', year_label: '2022–23', is_current: false },
  { id: 'ay-2021-22', year_label: '2021–22', is_current: false }
];

export const SEED_SEMESTERS = [
  { id: 'sem-1', semester_number: 1, roman_label: 'I', session_type: 'Winter Session' },
  { id: 'sem-2', semester_number: 2, roman_label: 'II', session_type: 'Summer Session' },
  { id: 'sem-3', semester_number: 3, roman_label: 'III', session_type: 'Winter Session' },
  { id: 'sem-4', semester_number: 4, roman_label: 'IV', session_type: 'Summer Session' },
  { id: 'sem-5', semester_number: 5, roman_label: 'V', session_type: 'Winter Session' },
  { id: 'sem-6', semester_number: 6, roman_label: 'VI', session_type: 'Summer Session' }
];

export const SEED_CLASSES = [
  { id: 'cls-tycs', name: 'TYCS', department: 'Computer Science', active: true }
];

export const SEED_SUBJECTS = [
  { id: 'sub-ai', class_id: 'cls-tycs', name: 'Introduction to AI', active: true },
  { id: 'sub-daa', class_id: 'cls-tycs', name: 'DAA', active: true },
  { id: 'sub-fuzzy', class_id: 'cls-tycs', name: 'Fuzzy Logic', active: true },
  { id: 'sub-blockchain', class_id: 'cls-tycs', name: 'Blockchain Technology', active: true }
];

const STORAGE_KEYS = {
  PROFILES: 'bk_profiles',
  BILLS: 'bk_bills',
  SETTINGS: 'bk_settings',
  SIGNATURES: 'bk_signatures_store',
  BILL_COUNTER: 'bk_bill_counter'
};

class DataService {
  getStore(key, defaultVal) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  setStore(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error', e);
    }
  }

  constructor() {
    if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
      this.setStore(STORAGE_KEYS.PROFILES, SEED_PROFILES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.setStore(STORAGE_KEYS.SETTINGS, DEFAULT_RATES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BILLS)) {
      this.setStore(STORAGE_KEYS.BILLS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BILL_COUNTER)) {
      this.setStore(STORAGE_KEYS.BILL_COUNTER, 1);
    }
  }

  // ── Profiles ──
  async getProfiles() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data && data.length > 0) return data;
    }
    return this.getStore(STORAGE_KEYS.PROFILES, SEED_PROFILES);
  }

  async getProfileById(id) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) return data;
    }
    const profiles = await this.getProfiles();
    return profiles.find(p => p.id === id) || null;
  }

  async updateProfileSignature(profileId, signatureDataUrl) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ signature_path: signatureDataUrl, updated_at: new Date().toISOString() })
        .eq('id', profileId)
        .select()
        .single();
      if (!error && data) return data;
      if (error) console.error('[BillFlow Signature Save Error]:', error);
    }
    const profiles = this.getStore(STORAGE_KEYS.PROFILES, SEED_PROFILES);
    const index = profiles.findIndex(p => p.id === profileId);
    if (index !== -1) {
      profiles[index].signature_path = signatureDataUrl;
      profiles[index].updated_at = new Date().toISOString();
      this.setStore(STORAGE_KEYS.PROFILES, profiles);
      return profiles[index];
    }
    throw new Error('Profile not found');
  }

  // ── System Settings ──
  async getSettings() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('system_settings').select('*').limit(1).single();
      if (!error && data) return data;
    }
    return this.getStore(STORAGE_KEYS.SETTINGS, DEFAULT_RATES);
  }

  // ── Academic Reference ──
  async getAcademicYears() {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('academic_years').select('*').order('year_label', { ascending: false });
      if (data && data.length > 0) return data;
    }
    return SEED_ACADEMIC_YEARS;
  }

  async getSemesters() {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('semesters').select('*').order('semester_number');
      if (data && data.length > 0) return data;
    }
    return SEED_SEMESTERS;
  }

  async getClasses() {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('classes').select('*').eq('active', true);
      if (data && data.length > 0) return data;
    }
    return SEED_CLASSES;
  }

  async getSubjects(classId) {
    if (isSupabaseConfigured && supabase) {
      let q = supabase.from('subjects').select('*').eq('active', true);
      if (classId) q = q.eq('class_id', classId);
      const { data } = await q;
      if (data && data.length > 0) return data;
    }
    return classId ? SEED_SUBJECTS.filter(s => s.class_id === classId) : SEED_SUBJECTS;
  }

  // ── Bills ──
  async getBills() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          faculty:profiles(*),
          class:classes(*),
          semester:semesters(*),
          academic_year:academic_years(*),
          items:bill_items(*, subject:subjects(*)),
          approvals:bill_approvals(*, user:profiles(*))
        `)
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return this.getStore(STORAGE_KEYS.BILLS, []);
  }

  async getBillById(id) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          faculty:profiles(*),
          class:classes(*),
          semester:semesters(*),
          academic_year:academic_years(*),
          items:bill_items(*, subject:subjects(*)),
          approvals:bill_approvals(*, user:profiles(*))
        `)
        .or(`id.eq.${id},bill_reference_id.eq.${id}`)
        .single();
      if (!error && data) return data;
    }
    const bills = await this.getBills();
    return bills.find(b => b.id === id || b.bill_reference_id === id) || null;
  }

  generateBillRef() {
    const counter = this.getStore(STORAGE_KEYS.BILL_COUNTER, 1);
    this.setStore(STORAGE_KEYS.BILL_COUNTER, counter + 1);
    const year = new Date().getFullYear();
    const padNum = String(counter).padStart(4, '0');
    return `CS-${year}-${padNum}`;
  }

  async createAndSubmitBill(faculty, classId, semesterId, academicYearId, items) {
    if (!faculty.signature_path) {
      throw new Error('Faculty signature is required before submitting the bill.');
    }

    const { grandTotal, amountInWords } = calculateBillCategoryTotals(items);
    const now = new Date().toISOString();

    // ── SUPABASE DIRECT INSERTION ──
    if (isSupabaseConfigured && supabase) {
      // 1. Insert into bills table
      const { data: billRecord, error: billErr } = await supabase
        .from('bills')
        .insert({
          faculty_id: faculty.id,
          class_id: classId,
          semester_id: semesterId,
          academic_year_id: academicYearId,
          status: 'PENDING_HOD',
          grand_total: grandTotal,
          amount_in_words: amountInWords,
          submission_date: now.split('T')[0],
        })
        .select()
        .single();

      if (billErr || !billRecord) {
        console.error('Supabase bill insert error:', billErr);
        throw new Error(billErr?.message || 'Failed to create bill in database.');
      }

      // 2. Insert line items
      const itemsToInsert = items.map((it) => ({
        bill_id: billRecord.id,
        subject_id: it.subject_id,
        paper_type: it.paper_type || 'THEORY',
        paper_sets: it.paper_sets || 0,
        setting_rate: it.setting_rate || 400,
        setting_amount: it.setting_amount || 0,
        translation_sets: it.translation_sets || 0,
        translation_rate: it.translation_rate || 250,
        translation_amount: it.translation_amount || 0,
        proof_papers: it.proof_papers || 0,
        proof_rate: it.proof_rate || 100,
        proof_amount: it.proof_amount || 0,
        subtotal: it.subtotal || 0,
        student_count: it.student_count || '',
      }));

      const { error: itemsErr } = await supabase.from('bill_items').insert(itemsToInsert);
      if (itemsErr) {
        console.error('Supabase bill items insert error:', itemsErr);
      }

      // 3. Insert submission approval record with immutable signature snapshot
      const { error: appErr } = await supabase.from('bill_approvals').insert({
        bill_id: billRecord.id,
        user_id: faculty.id,
        role: 'FACULTY',
        action: 'SUBMITTED',
        comment: 'Bill created and submitted for HOD verification',
        signature_snapshot_path: faculty.signature_path,
      });
      if (appErr) {
        console.error('Supabase approval insert error:', appErr);
      }

      // Fetch the full joined bill from Supabase
      return await this.getBillById(billRecord.id);
    }

    // ── LocalStorage Fallback (only if no Supabase) ──
    const billId = 'bill-' + Date.now();
    const billRef = this.generateBillRef();
    const academicYears = await this.getAcademicYears();
    const semesters = await this.getSemesters();
    const classes = await this.getClasses();
    const subjects = await this.getSubjects();

    const academicYear = academicYears.find(ay => ay.id === academicYearId) || academicYears[0];
    const semester = semesters.find(s => s.id === semesterId) || semesters[0];
    const cls = classes.find(c => c.id === classId) || classes[0];

    const mappedItems = items.map((it, idx) => ({
      ...it,
      id: `item-${Date.now()}-${idx}`,
      bill_id: billId,
      subject: subjects.find(s => s.id === it.subject_id),
      subject_name: subjects.find(s => s.id === it.subject_id)?.name || 'Subject'
    }));

    const submissionApproval = {
      id: 'app-' + Date.now(),
      bill_id: billId,
      user_id: faculty.id,
      user: faculty,
      user_name: faculty.name,
      role: 'FACULTY',
      action: 'SUBMITTED',
      comment: 'Bill created and submitted for HOD verification',
      signature_snapshot_path: faculty.signature_path,
      created_at: now
    };

    const newBill = {
      id: billId,
      bill_reference_id: billRef,
      faculty_id: faculty.id,
      faculty: faculty,
      class_id: classId,
      class: cls,
      semester_id: semesterId,
      semester: semester,
      academic_year_id: academicYearId,
      academic_year: academicYear,
      status: 'PENDING_HOD',
      grand_total: grandTotal,
      amount_in_words: amountInWords,
      submission_date: now.split('T')[0],
      created_at: now,
      updated_at: now,
      items: mappedItems,
      approvals: [submissionApproval]
    };

    const bills = this.getStore(STORAGE_KEYS.BILLS, []);
    bills.unshift(newBill);
    this.setStore(STORAGE_KEYS.BILLS, bills);

    return newBill;
  }

  async processHODAction(billId, hod, action, comment) {
    if (action === 'APPROVE' && !hod.signature_path) {
      throw new Error('HOD signature is required before approval.');
    }

    const now = new Date().toISOString();
    const approvalAction = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const newStatus = action === 'APPROVE' ? 'PENDING_HEAD' : 'REJECTED_BY_HOD';

    // ── SUPABASE DIRECT UPDATE ──
    if (isSupabaseConfigured && supabase) {
      // 1. Update bill status
      await supabase
        .from('bills')
        .update({ status: newStatus, updated_at: now })
        .eq('id', billId);

      // 2. Insert approval record with signature snapshot
      await supabase.from('bill_approvals').insert({
        bill_id: billId,
        user_id: hod.id,
        role: 'HOD',
        action: approvalAction,
        comment: comment || (action === 'APPROVE' ? 'Verified and recommended to Head' : 'Rejected by HOD'),
        signature_snapshot_path: action === 'APPROVE' ? hod.signature_path : null,
      });

      return await this.getBillById(billId);
    }

    // ── LocalStorage Fallback ──
    const bills = this.getStore(STORAGE_KEYS.BILLS, []);
    const index = bills.findIndex(b => b.id === billId);
    if (index === -1) throw new Error('Bill not found');

    const bill = bills[index];
    const approvalRecord = {
      id: 'app-' + Date.now(),
      bill_id: billId,
      user_id: hod.id,
      user: hod,
      user_name: hod.name,
      role: 'HOD',
      action: approvalAction,
      comment: comment || (action === 'APPROVE' ? 'Verified and recommended to Head' : 'Rejected by HOD'),
      signature_snapshot_path: action === 'APPROVE' ? hod.signature_path : null,
      created_at: now
    };

    bill.status = newStatus;
    bill.updated_at = now;
    bill.approvals = bill.approvals || [];
    bill.approvals.push(approvalRecord);

    bills[index] = bill;
    this.setStore(STORAGE_KEYS.BILLS, bills);
    return bill;
  }

  async processHeadAction(billId, head, action, comment) {
    if (action === 'FINALIZE' && !head.signature_path) {
      throw new Error('Head signature is required before finalization.');
    }

    const now = new Date().toISOString();
    const approvalAction = action === 'FINALIZE' ? 'FINALIZED' : 'REJECTED';
    const newStatus = action === 'FINALIZE' ? 'FINALIZED' : 'REJECTED_BY_HEAD';

    // ── SUPABASE DIRECT UPDATE ──
    if (isSupabaseConfigured && supabase) {
      // 1. Update bill status
      await supabase
        .from('bills')
        .update({ status: newStatus, updated_at: now })
        .eq('id', billId);

      // 2. Insert approval record with signature snapshot
      await supabase.from('bill_approvals').insert({
        bill_id: billId,
        user_id: head.id,
        role: 'HEAD',
        action: approvalAction,
        comment: comment || (action === 'FINALIZE' ? 'Approved & sanctioned for disbursement' : 'Rejected by Head'),
        signature_snapshot_path: action === 'FINALIZE' ? head.signature_path : null,
      });

      return await this.getBillById(billId);
    }

    // ── LocalStorage Fallback ──
    const bills = this.getStore(STORAGE_KEYS.BILLS, []);
    const index = bills.findIndex(b => b.id === billId);
    if (index === -1) throw new Error('Bill not found');

    const bill = bills[index];
    const approvalRecord = {
      id: 'app-' + Date.now(),
      bill_id: billId,
      user_id: head.id,
      user: head,
      user_name: head.name,
      role: 'HEAD',
      action: approvalAction,
      comment: comment || (action === 'FINALIZE' ? 'Approved & sanctioned for disbursement' : 'Rejected by Head'),
      signature_snapshot_path: action === 'FINALIZE' ? head.signature_path : null,
      created_at: now
    };

    bill.status = newStatus;
    bill.updated_at = now;
    bill.approvals = bill.approvals || [];
    bill.approvals.push(approvalRecord);

    bills[index] = bill;
    this.setStore(STORAGE_KEYS.BILLS, bills);
    return bill;
  }
}

export const dataService = new DataService();

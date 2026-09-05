import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/lib/supabase';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { Step0BillingMethod } from './Step0BillingMethod';
import { Step1Semester } from './Step1Semester';
import { Step2AddPaper } from './Step2AddPaper';
import { Step3PaperDetails } from './Step3PaperDetails';
import { Step4BillItems } from './Step4BillItems';
import { Step5ReviewBill } from './Step5ReviewBill';
import { OfficialBillPreview } from './OfficialBillPreview';
import { SubmissionSuccess } from './SubmissionSuccess';
import {
  calculateItemSubtotal,
  calculateAnswerBookItemSubtotal,
  calculatePracticalItemSubtotal,
  calculateOnlineNepItemSubtotal,
  calculateBillCategoryTotals,
  calculateGenericGrandTotal,
  getAnswerBookSemEndRate,
  getPracticalRate,
} from '@/lib/calculations';

export const BillWizard = () => {
  const { user, updateSignature } = useAuth();
  const navigate = useNavigate();

  // Steps:
  // 0 = Billing Method selection
  // 1 = Session & Semester Meta
  // 2 = Select Subject / Course
  // 3 = Subject Details & Quantities
  // 4 = Items List Breakdown & Summary Table
  // 5 = Review & Digital Signature
  // 'preview' = Official Bill Printable Canvas Preview
  // 'success' = Submission Success
  const [currentStep, setCurrentStep]     = useState(0);
  const [billingMethod, setBillingMethod] = useState('PAPER_SETTING');
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [submittedBill, setSubmittedBill] = useState(null);

  // Reference data
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters]         = useState([]);
  const [classes, setClasses]             = useState([]);
  const [subjects, setSubjects]           = useState([]);
  const [settings, setSettings]           = useState(null);

  const getCurrentMonthYear = () => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Draft Bill State
  const [draft, setDraft] = useState({
    billing_method:      'PAPER_SETTING',
    academic_year_id:    '',
    academic_year_label: '2026–27',
    semester_id:         '',
    semester_label:      'VI',
    session_type:        'Summer Session',
    class_id:            '',
    class_name:          'SYCS',
    month_year:          getCurrentMonthYear(),
    hod_name:            'Vinod Rajput',
    items:               [],
    grand_total:         0,
    amount_in_words:     '',
  });

  // Current Working Item State for Step 2 & 3
  const [currentItem, setCurrentItem] = useState({
    class_id:            '',
    class_name:          'SYCS',
    subject_id:          '',
    subject_name:        '',
    paper_type:          'THEORY',
    paper_sets:          4,
    setting_rate:        400,
    translation_sets:    0,
    proof_papers:        0,
    academic_level:      'UG',
    semester_end_books:  81,
    atkt_books:          0,
    internal_books:      81,
    practical_books:     81,
    exam_date:           new Date().toISOString().split('T')[0],
    mcq_count:           30,
    student_count:       84,
    subtotal:            0,
  });

  useEffect(() => {
    const loadData = async () => {
      const [ay, sem, cls, subs, st] = await Promise.all([
        dataService.getAcademicYears(),
        dataService.getSemesters(),
        dataService.getClasses(),
        dataService.getSubjects(),
        dataService.getSettings(),
      ]);
      setAcademicYears(ay);
      setSemesters(sem);
      setClasses(cls);
      setSubjects(subs);
      setSettings(st);

      const currYear   = ay.find((y) => y.is_current) || ay[0];
      const semVI      = sem.find((s) => s.roman_label === 'VI') || sem[0];
      const defaultCls = cls[0];

      setDraft((prev) => ({
        ...prev,
        academic_year_id:    currYear?.id    || '',
        academic_year_label: currYear?.year_label || '2026–27',
        semester_id:         semVI?.id       || '',
        semester_label:      semVI?.roman_label || 'VI',
        session_type:        semVI?.session_type || 'Summer Session',
        class_id:            defaultCls?.id  || '',
        class_name:          defaultCls?.name || 'SYCS',
      }));
      setCurrentItem((prev) => ({ ...prev, class_id: defaultCls?.id || '', class_name: defaultCls?.name || 'SYCS' }));
    };
    loadData();
  }, []);

  // Index being edited in Step 3
  const [editingIndex, setEditingIndex] = useState(null);

  // Commit current item to draft list
  const commitCurrentItem = () => {
    let newItem = {
      ...currentItem,
      subject:      subjects.find((s) => s.id === currentItem.subject_id),
      subject_name: subjects.find((s) => s.id === currentItem.subject_id)?.name || currentItem.subject_name || 'Subject',
      class_id:     draft.class_id || currentItem.class_id || '',
      class_name:   draft.class_name || currentItem.class_name || 'SYCS',
    };

    if (billingMethod === 'ANSWER_BOOK_ASSESSMENT') {
      const level = newItem.academic_level || 'UG';
      const semRate = getAnswerBookSemEndRate(level, settings);
      const calc = calculateAnswerBookItemSubtotal(
        newItem.semester_end_books, newItem.atkt_books, newItem.internal_books,
        semRate, semRate, 4
      );
      newItem = { ...newItem, ...calc, semester_end_rate: semRate, atkt_rate: semRate, internal_rate: 4 };
    } else if (billingMethod === 'PRACTICAL_ASSESSMENT') {
      const level = newItem.academic_level || 'UG';
      const pRate = getPracticalRate(level, settings);
      const calc = calculatePracticalItemSubtotal(newItem.practical_books, pRate);
      newItem = { ...newItem, ...calc, practical_rate: pRate };
    } else if (billingMethod === 'ONLINE_EXAMINATION_NEP') {
      const calc = calculateOnlineNepItemSubtotal(newItem.mcq_count, newItem.student_count, 7, 2, 4, 150);
      newItem = { ...newItem, ...calc, see_rate: 7, answer_key_rate: 2, cia_rate: 4, upload_rate: 150 };
    } else {
      // PAPER SETTING
      const calc = calculateItemSubtotal(
        newItem.paper_sets, settings?.paper_setting_rate || 400,
        newItem.translation_sets, settings?.translation_rate || 250,
        newItem.proof_papers, settings?.proof_checking_rate || 100
      );
      newItem = { ...newItem, ...calc };
    }

    let updatedItems;
    if (editingIndex !== null && editingIndex >= 0 && editingIndex < draft.items.length) {
      updatedItems = draft.items.map((item, idx) => (idx === editingIndex ? newItem : item));
    } else {
      updatedItems = [...draft.items, newItem];
    }

    let totals;
    if (billingMethod === 'PAPER_SETTING') {
      totals = calculateBillCategoryTotals(updatedItems);
    } else {
      totals = calculateGenericGrandTotal(updatedItems);
    }

    setDraft((prev) => ({
      ...prev,
      billing_method: billingMethod,
      items: updatedItems,
      grand_total: totals.grandTotal,
      amount_in_words: totals.amountInWords,
    }));
  };

  const resetCurrentItem = () => {
    setCurrentItem({
      class_id:           draft.class_id,
      class_name:         draft.class_name || 'SYCS',
      subject_id:         '',
      subject_name:       '',
      paper_type:         'THEORY',
      paper_sets:         4,
      setting_rate:       settings?.paper_setting_rate || 400,
      translation_sets:   0,
      proof_papers:       0,
      academic_level:     'UG',
      semester_end_books: 81,
      atkt_books:         0,
      internal_books:     81,
      practical_books:    81,
      exam_date:          new Date().toISOString().split('T')[0],
      mcq_count:          30,
      student_count:      84,
      subtotal:           0,
    });
  };

  const handleAddMorePaper = () => {
    commitCurrentItem();
    setEditingIndex(null);
    resetCurrentItem();
    setCurrentStep(2);
  };

  const handleContinueToItems = () => {
    commitCurrentItem();
    setEditingIndex(null);
    setCurrentStep(4);
  };

  const handleRemoveItem = (index) => {
    const updated = draft.items.filter((_, i) => i !== index);
    let totals;
    if (billingMethod === 'PAPER_SETTING') {
      totals = calculateBillCategoryTotals(updated);
    } else {
      totals = calculateGenericGrandTotal(updated);
    }
    setDraft((prev) => ({
      ...prev,
      items: updated,
      grand_total: totals.grandTotal,
      amount_in_words: totals.amountInWords,
    }));
  };

  const handleEditItem = (index) => {
    const itemToEdit = draft.items[index];
    if (itemToEdit) {
      setEditingIndex(index);
      setCurrentItem({ ...itemToEdit });
      setCurrentStep(3);
    }
  };

  // Submit bill function
  const handleBillSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      let created;
      if (billingMethod === 'PAPER_SETTING') {
        created = await dataService.createAndSubmitBill(
          user, draft.class_id, draft.semester_id, draft.academic_year_id, draft.items, draft.month_year
        );
      } else {
        created = await dataService.createAndSubmitNewMethodBill(
          user,
          billingMethod,
          {
            academic_year_id: draft.academic_year_id,
            semester_id:      draft.semester_id,
            class_id:         draft.class_id || null,
            month_year:       draft.month_year || getCurrentMonthYear(),
            hod_name:         draft.hod_name  || 'Vinod Rajput',
          },
          draft.items
        );
      }
      setSubmittedBill(created);
      setCurrentStep('success');
    } catch (err) {
      alert(err.message || 'Failed to submit bill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMethodNext = () => {
    setDraft(prev => ({
      ...prev,
      billing_method: billingMethod,
      items: [],
      grand_total: 0,
      amount_in_words: '',
    }));
    setCurrentStep(1);
  };

  return (
    <div className="space-y-4">
      {/* 5-Step Progress Bar for ALL Billing Methods */}
      {typeof currentStep === 'number' && currentStep >= 1 && (
        <div className="no-print">
          <StepIndicator currentStep={currentStep} />
        </div>
      )}

      {/* STEP 0 — Billing Method Selection */}
      {currentStep === 0 && (
        <Step0BillingMethod
          selectedMethod={billingMethod}
          onSelect={(m) => {
            setBillingMethod(m);
            setDraft((prev) => ({ ...prev, billing_method: m }));
          }}
          onNext={handleMethodNext}
          onCancel={() => navigate('/faculty')}
        />
      )}

      {/* STEP 1 — Session & Semester Metadata */}
      {currentStep === 1 && (
        <Step1Semester
          draft={draft}
          setDraft={setDraft}
          academicYears={academicYears}
          semesters={semesters}
          classes={classes}
          onNext={() => setCurrentStep(2)}
          onCancel={() => setCurrentStep(0)}
        />
      )}

      {/* STEP 2 — Select Subject / Course */}
      {currentStep === 2 && (
        <Step2AddPaper
          currentItem={currentItem}
          setCurrentItem={setCurrentItem}
          subjects={subjects}
          billingMethod={billingMethod}
          hasExistingItems={draft.items.length > 0}
          onCancelToAddMore={() => setCurrentStep(4)}
          onNext={() => setCurrentStep(3)}
          onBack={() => {
            if (draft.items.length > 0) { setCurrentStep(4); } else { setCurrentStep(1); }
          }}
        />
      )}

      {/* STEP 3 — Quantity Details per Subject */}
      {currentStep === 3 && (
        <Step3PaperDetails
          currentItem={currentItem}
          setCurrentItem={setCurrentItem}
          settings={settings}
          billingMethod={billingMethod}
          onAddMore={handleAddMorePaper}
          onContinue={handleContinueToItems}
          onBack={() => setCurrentStep(2)}
        />
      )}

      {/* STEP 4 — Items List Summary Table */}
      {currentStep === 4 && (
        <Step4BillItems
          draft={draft}
          billingMethod={billingMethod}
          onRemoveItem={handleRemoveItem}
          onEditItem={handleEditItem}
          onAddAnotherPaper={() => {
            setEditingIndex(null);
            resetCurrentItem();
            setCurrentStep(2);
          }}
          onNext={() => setCurrentStep(5)}
          onBack={() => {
            if (draft.items.length > 0) {
              const lastIdx = draft.items.length - 1;
              setEditingIndex(lastIdx);
              setCurrentItem({ ...draft.items[lastIdx] });
              setCurrentStep(3);
            } else {
              setCurrentStep(2);
            }
          }}
        />
      )}

      {/* STEP 5 — Review & Digital Signature */}
      {currentStep === 5 && (
        <Step5ReviewBill
          draft={draft}
          faculty={user}
          onEditBill={() => setCurrentStep(4)}
          onContinueToPreview={() => setCurrentStep('preview')}
          onSaveSignature={updateSignature}
          onBack={() => setCurrentStep(4)}
        />
      )}

      {/* OFFICIAL BILL PREVIEW — Delegates to printable template matching images */}
      {currentStep === 'preview' && (
        <OfficialBillPreview
          draft={draft}
          faculty={user}
          billingMethod={billingMethod}
          onSubmit={handleBillSubmit}
          onBack={() => setCurrentStep(5)}
          onSaveSignature={updateSignature}
          isSubmitting={isSubmitting}
        />
      )}

      {/* SUBMISSION SUCCESS */}
      {currentStep === 'success' && (
        <SubmissionSuccess
          submittedBill={submittedBill}
          onViewBill={(id) => navigate(`/bill/${id}`)}
          onReturnHome={() => navigate('/faculty')}
        />
      )}
    </div>
  );
};

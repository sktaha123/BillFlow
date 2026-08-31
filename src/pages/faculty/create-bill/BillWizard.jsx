import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/lib/supabase';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { Step1Semester } from './Step1Semester';
import { Step2AddPaper } from './Step2AddPaper';
import { Step3PaperDetails } from './Step3PaperDetails';
import { Step4BillItems } from './Step4BillItems';
import { Step5ReviewBill } from './Step5ReviewBill';
import { OfficialBillPreview } from './OfficialBillPreview';
import { SubmissionSuccess } from './SubmissionSuccess';
import { calculateItemSubtotal, calculateBillCategoryTotals } from '@/lib/calculations';

export const BillWizard = () => {
  const { user, updateSignature } = useAuth();
  const navigate = useNavigate();

  // Wizard state: 1 to 5, or 'preview', or 'success'
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBill, setSubmittedBill] = useState(null);

  // Reference data
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [settings, setSettings] = useState(null);

  // Working draft bill
  const [draft, setDraft] = useState({
    academic_year_id: '',
    academic_year_label: '2026–27',
    semester_id: '',
    semester_label: 'VI',
    session_type: 'Summer Session',
    class_id: '',
    class_name: 'TYCS',
    items: [],
    grand_total: 0,
    amount_in_words: '',
  });

  // Current item being configured in steps 2 & 3
  const [currentItem, setCurrentItem] = useState({
    class_id: '',
    subject_id: '',
    subject_name: '',
    paper_type: 'THEORY',
    paper_sets: 4,
    setting_rate: 400,
    setting_amount: 1600,
    translation_sets: 0,
    translation_rate: 250,
    translation_amount: 0,
    proof_papers: 0,
    proof_rate: 100,
    proof_amount: 0,
    subtotal: 1600,
    student_count: '',
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

      // Default selections
      const currYear = ay.find((y) => y.is_current) || ay[0];
      const semVI = sem.find((s) => s.roman_label === 'VI') || sem[0];
      const defaultCls = cls[0];

      setDraft((prev) => ({
        ...prev,
        academic_year_id: currYear?.id || '',
        academic_year_label: currYear?.year_label || '2026–27',
        semester_id: semVI?.id || '',
        semester_label: semVI?.roman_label || 'VI',
        session_type: semVI?.session_type || 'Summer Session',
        class_id: defaultCls?.id || '',
        class_name: defaultCls?.name || 'TYCS',
      }));

      setCurrentItem((prev) => ({
        ...prev,
        class_id: defaultCls?.id || '',
      }));
    };

    loadData();
  }, []);

  // Step 3 Actions: Add More / Continue
  const commitCurrentItem = () => {
    const calculated = calculateItemSubtotal(
      currentItem.paper_sets,
      settings?.paper_setting_rate || 400,
      currentItem.translation_sets,
      settings?.translation_rate || 250,
      currentItem.proof_papers,
      settings?.proof_checking_rate || 100
    );

    const newItem = {
      ...currentItem,
      ...calculated,
      subject: subjects.find((s) => s.id === currentItem.subject_id),
      subject_name:
        subjects.find((s) => s.id === currentItem.subject_id)?.name || currentItem.subject_name,
    };

    const updatedItems = [...draft.items, newItem];
    const { grandTotal, amountInWords } = calculateBillCategoryTotals(updatedItems);

    setDraft((prev) => ({
      ...prev,
      items: updatedItems,
      grand_total: grandTotal,
      amount_in_words: amountInWords,
    }));
  };

  const handleAddMorePaper = () => {
    commitCurrentItem();
    // Reset current item for next subject
    setCurrentItem({
      class_id: draft.class_id,
      subject_id: '',
      subject_name: '',
      paper_type: 'THEORY',
      paper_sets: 4,
      setting_rate: settings?.paper_setting_rate || 400,
      setting_amount: 1600,
      translation_sets: 0,
      translation_rate: settings?.translation_rate || 250,
      translation_amount: 0,
      proof_papers: 0,
      proof_rate: settings?.proof_checking_rate || 100,
      proof_amount: 0,
      subtotal: 1600,
      student_count: '',
    });
    // Go to Step 2 to pick next subject
    setCurrentStep(2);
  };

  const handleContinueToItems = () => {
    commitCurrentItem();
    setCurrentStep(4);
  };

  const handleRemoveItem = (index) => {
    const updated = draft.items.filter((_, i) => i !== index);
    const { grandTotal, amountInWords } = calculateBillCategoryTotals(updated);
    setDraft((prev) => ({
      ...prev,
      items: updated,
      grand_total: grandTotal,
      amount_in_words: amountInWords,
    }));
  };

  const handleEditItem = (index) => {
    const itemToEdit = draft.items[index];
    if (itemToEdit) {
      setCurrentItem({ ...itemToEdit });
      const updated = draft.items.filter((_, i) => i !== index);
      const { grandTotal, amountInWords } = calculateBillCategoryTotals(updated);
      setDraft((prev) => ({
        ...prev,
        items: updated,
        grand_total: grandTotal,
        amount_in_words: amountInWords,
      }));
      setCurrentStep(3);
    }
  };

  const handleFinalSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const created = await dataService.createAndSubmitBill(
        user,
        draft.class_id,
        draft.semester_id,
        draft.academic_year_id,
        draft.items
      );
      setSubmittedBill(created);
      setCurrentStep('success');
    } catch (err) {
      alert(err.message || 'Failed to submit bill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 5-Step Progress Header (hidden in success screen and print) */}
      {typeof currentStep === 'number' && (
        <div className="no-print">
          <StepIndicator currentStep={currentStep} />
        </div>
      )}

      {/* STEP 1: Semester Selection */}
      {currentStep === 1 && (
        <Step1Semester
          draft={draft}
          setDraft={setDraft}
          academicYears={academicYears}
          semesters={semesters}
          onNext={() => setCurrentStep(2)}
          onCancel={() => navigate('/faculty')}
        />
      )}

      {/* STEP 2: Add Paper Details */}
      {currentStep === 2 && (
        <Step2AddPaper
          currentItem={currentItem}
          setCurrentItem={setCurrentItem}
          classes={classes}
          subjects={subjects}
          onNext={() => setCurrentStep(3)}
          onBack={() => setCurrentStep(1)}
        />
      )}

      {/* STEP 3: Paper Cost Details */}
      {currentStep === 3 && (
        <Step3PaperDetails
          currentItem={currentItem}
          setCurrentItem={setCurrentItem}
          settings={settings}
          onAddMore={handleAddMorePaper}
          onContinue={handleContinueToItems}
          onBack={() => setCurrentStep(2)}
        />
      )}

      {/* STEP 4: Bill Items List */}
      {currentStep === 4 && (
        <Step4BillItems
          draft={draft}
          onRemoveItem={handleRemoveItem}
          onEditItem={handleEditItem}
          onAddAnotherPaper={() => {
            setCurrentItem({
              class_id: draft.class_id,
              subject_id: '',
              subject_name: '',
              paper_type: 'THEORY',
              paper_sets: 4,
              setting_rate: settings?.paper_setting_rate || 400,
              setting_amount: 1600,
              translation_sets: 0,
              translation_rate: settings?.translation_rate || 250,
              translation_amount: 0,
              proof_papers: 0,
              proof_rate: settings?.proof_checking_rate || 100,
              proof_amount: 0,
              subtotal: 1600,
              student_count: '',
            });
            setCurrentStep(2);
          }}
          onNext={() => setCurrentStep(5)}
          onBack={() => setCurrentStep(3)}
        />
      )}

      {/* STEP 5: Review Bill */}
      {currentStep === 5 && (
        <Step5ReviewBill
          draft={draft}
          faculty={user}
          onEditBill={() => setCurrentStep(4)}
          onContinueToPreview={() => setCurrentStep('preview')}
          onBack={() => setCurrentStep(4)}
        />
      )}

      {/* STEP 6: Official Bill Preview */}
      {currentStep === 'preview' && (
        <OfficialBillPreview
          draft={draft}
          faculty={user}
          onSubmit={handleFinalSubmit}
          onBack={() => setCurrentStep(5)}
          onSaveSignature={updateSignature}
          isSubmitting={isSubmitting}
        />
      )}

      {/* STEP 7: Submission Success */}
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

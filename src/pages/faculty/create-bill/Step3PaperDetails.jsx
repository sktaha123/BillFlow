import React, { useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { ArrowRight, ChevronLeft, Plus, Calculator } from 'lucide-react';
import { calculateItemSubtotal, formatCurrency } from '@/lib/calculations';

export const Step3PaperDetails = ({
  currentItem,
  setCurrentItem,
  settings,
  onAddMore,
  onContinue,
  onBack,
}) => {
  const isTheory = currentItem.paper_type === 'THEORY';

  const settingRate = settings?.paper_setting_rate || 400;
  const translationRate = settings?.translation_rate || 250;
  const proofRate = settings?.proof_checking_rate || 100;

  // Auto-recalculate amounts whenever numbers change
  useEffect(() => {
    const { settingAmount, translationAmount, proofAmount, subtotal } = calculateItemSubtotal(
      currentItem.paper_sets,
      settingRate,
      currentItem.translation_sets,
      translationRate,
      currentItem.proof_papers,
      proofRate
    );

    setCurrentItem((prev) => ({
      ...prev,
      setting_rate: settingRate,
      setting_amount: settingAmount,
      translation_rate: translationRate,
      translation_amount: translationAmount,
      proof_rate: proofRate,
      proof_amount: proofAmount,
      subtotal: subtotal,
    }));
  }, [
    currentItem.paper_sets,
    currentItem.translation_sets,
    currentItem.proof_papers,
    settingRate,
    translationRate,
    proofRate,
  ]);

  const isValid = Number(currentItem.paper_sets) > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Step Heading */}
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          Paper Sets &amp; Remuneration
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Enter question paper sets created, translations, and proof checkings for <strong className="text-slate-700">{currentItem.subject_name}</strong>.
        </p>
      </div>

      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 sm:p-7 space-y-5 shadow-2xs">
        
        {/* Number of Paper Sets (Required) */}
        <div className="space-y-1.5">
          <Input
            label={`Number of ${isTheory ? 'Paper' : 'Practical'} Sets (Required)`}
            type="number"
            min={1}
            value={currentItem.paper_sets || ''}
            onChange={(e) =>
              setCurrentItem((prev) => ({
                ...prev,
                paper_sets: Math.max(0, parseInt(e.target.value) || 0),
              }))
            }
            helperText={`Official college rate: ${formatCurrency(settingRate)} per set`}
          />
        </div>

        {/* Translation Sets (Optional) */}
        <div className="space-y-1.5">
          <Input
            label="Translation Sets (Optional)"
            type="number"
            min={0}
            placeholder="0"
            value={currentItem.translation_sets || ''}
            onChange={(e) =>
              setCurrentItem((prev) => ({
                ...prev,
                translation_sets: Math.max(0, parseInt(e.target.value) || 0),
              }))
            }
            helperText={`Official rate: ${formatCurrency(translationRate)} per translated set`}
          />
        </div>

        {/* Proof Checking Papers (Optional) */}
        <div className="space-y-1.5">
          <Input
            label="Proof Checking Papers (Optional)"
            type="number"
            min={0}
            placeholder="0"
            value={currentItem.proof_papers || ''}
            onChange={(e) =>
              setCurrentItem((prev) => ({
                ...prev,
                proof_papers: Math.max(0, parseInt(e.target.value) || 0),
              }))
            }
            helperText={`Official rate: ${formatCurrency(proofRate)} per paper`}
          />
        </div>

        {/* COST SUMMARY BREAKDOWN BOX */}
        <div className="border border-slate-200/90 rounded-xl p-4 sm:p-5 bg-slate-50/70 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-slate-900" />
              Calculated Breakdown
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Auto Calculated</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>
                Paper Setting ({currentItem.paper_sets || 0} × {formatCurrency(settingRate)})
              </span>
              <span className="font-mono font-medium text-slate-900">{formatCurrency(currentItem.setting_amount || 0)}</span>
            </div>

            {Number(currentItem.translation_sets) > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>
                  Translation ({currentItem.translation_sets} × {formatCurrency(translationRate)})
                </span>
                <span className="font-mono font-medium text-slate-900">{formatCurrency(currentItem.translation_amount || 0)}</span>
              </div>
            )}

            {Number(currentItem.proof_papers) > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>
                  Proof Checking ({currentItem.proof_papers} × {formatCurrency(proofRate)})
                </span>
                <span className="font-mono font-medium text-slate-900">{formatCurrency(currentItem.proof_amount || 0)}</span>
              </div>
            )}

            <div className="flex justify-between pt-2.5 border-t border-slate-200 text-sm font-semibold text-slate-900">
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(currentItem.subtotal || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2.5">
          <button
            disabled={!isValid}
            onClick={onAddMore}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            Add Another Paper
          </button>

          <button
            disabled={!isValid}
            onClick={onContinue}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            Review Items List
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

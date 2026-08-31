import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SignaturePad } from '@/components/signature/SignaturePad';
import { SignaturePreview } from '@/components/signature/SignaturePreview';
import { CheckCircle2, Shield } from 'lucide-react';

export const SignatureSetupPage = () => {
  const { user, role, updateSignature } = useAuth();
  const [isReplacing, setIsReplacing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const hasSignature = Boolean(user?.signature_path);

  const handleSaveSignature = async (dataUrl) => {
    try {
      await updateSignature(dataUrl);
      setIsReplacing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (e) {
      console.error(e);
      alert('Failed to save signature');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Header - Simple clean title without top badge */}
      <div className="space-y-1.5">
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
          Digital Signature Setup
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Your saved digital signature is automatically attached as an immutable snapshot whenever you submit, endorse, or sanction an official examination bill.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-center gap-2.5 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Digital signature saved successfully and linked to your profile.</span>
        </div>
      )}

      {/* If signature exists and user is not currently replacing */}
      {hasSignature && !isReplacing ? (
        <div className="space-y-4">
          <SignaturePreview
            signatureUrl={user.signature_path}
            onReplace={() => setIsReplacing(true)}
            userName={user.name}
            role={role}
          />
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)]">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">Draw Your Signature</h2>
            <p className="text-xs text-slate-500">Sign using your finger, stylus, or mouse on the canvas below.</p>
          </div>

          <div>
            <SignaturePad onSave={handleSaveSignature} />
          </div>

          {hasSignature && isReplacing && (
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsReplacing(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Security Guarantee Card */}
      <div className="p-4.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-3.5 shadow-2xs">
        <Shield className="w-4 h-4 text-slate-800 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900">Audit Snapshot Guarantee</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Historical bills retain the exact signature snapshot that existed when the action took place. Changing your signature later will never alter past finalized bills.
          </p>
        </div>
      </div>

    </div>
  );
};

import React from 'react';
import { Button } from '@/components/ui/Button';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

export const SignaturePreview = ({ signatureUrl, onReplace, userName, role }) => {
  return (
    <div className="w-full space-y-4">
      <div className="border border-neutral-200 rounded-lg p-6 bg-white flex flex-col items-center justify-center min-h-48 sm:min-h-56 relative shadow-xs">
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[11px] text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full font-medium">
          <CheckCircle2 className="w-3 h-3 text-black" />
          Active Signature
        </div>

        <img
          src={signatureUrl}
          alt="Saved Signature"
          className="max-h-28 max-w-full object-contain filter contrast-125 my-4"
        />

        <div className="text-center border-t border-neutral-100 w-full pt-3 mt-2">
          <p className="text-xs font-semibold text-black">{userName}</p>
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{role}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReplace}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Replace Signature
        </Button>
      </div>
    </div>
  );
};

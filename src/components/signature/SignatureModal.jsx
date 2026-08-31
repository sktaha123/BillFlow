import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { SignaturePad } from './SignaturePad';

export const SignatureModal = ({
  isOpen,
  onClose,
  onSave,
  title = 'Signature Required',
  description = 'You must draw your official digital signature before proceeding with this action.',
}) => {
  const handleSaveSignature = async (signatureDataUrl) => {
    await onSave(signatureDataUrl);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-lg">
      <div className="space-y-4">
        {description && (
          <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
        )}

        {/* Draw signature pad directly */}
        <div className="pt-1">
          <SignaturePad onSave={handleSaveSignature} />
        </div>
      </div>
    </Modal>
  );
};

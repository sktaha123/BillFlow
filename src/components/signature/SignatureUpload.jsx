import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { UploadCloud, Check, RefreshCw } from 'lucide-react';

export const SignatureUpload = ({ onSave }) => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        alert('Please upload a valid PNG or JPG image file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (preview) {
      onSave(preview);
    }
  };

  const handleReset = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-4">
      {!preview ? (
        <label
          htmlFor="signature-upload-input"
          className="flex flex-col items-center justify-center w-full h-48 sm:h-56 border-2 border-dashed border-neutral-300 hover:border-black rounded-lg cursor-pointer bg-neutral-50 hover:bg-neutral-100/60 transition-colors p-6 text-center"
        >
          <UploadCloud className="w-8 h-8 text-neutral-400 mb-2" />
          <p className="text-xs font-semibold text-black mb-1">Click or drag signature image to upload</p>
          <p className="text-[11px] text-neutral-500">Supports transparent PNG, JPG (Max 5MB)</p>
          <input
            id="signature-upload-input"
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="relative border border-neutral-300 rounded-lg p-6 bg-white text-center flex flex-col items-center justify-center h-48 sm:h-56">
          <img
            src={preview}
            alt="Signature Upload Preview"
            className="max-h-32 max-w-full object-contain filter contrast-125"
          />
        </div>
      )}

      {preview && (
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Change Image
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            leftIcon={<Check className="w-3.5 h-3.5" />}
          >
            Save Signature
          </Button>
        </div>
      )}
    </div>
  );
};

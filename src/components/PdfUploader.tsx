import React from 'react';

export function PdfUploader({
  onFileSelect,
  isProcessing,
}: {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        type="file"
        accept="application/pdf"
        disabled={isProcessing}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileSelect(f);
        }}
      />
      <small style={{ opacity: 0.7 }}>Solo PDF.</small>
    </div>
  );
}

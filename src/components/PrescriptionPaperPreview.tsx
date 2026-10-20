import React from 'react';
import { SamplePrescription } from '../data/drugDatabase.ts';
import { VerifiedMedicineItem } from '../utils/drugMatcher.ts';

interface PrescriptionPaperPreviewProps {
  sample: SamplePrescription;
  uploadedImageUrl: string | null;
  verifiedItems: VerifiedMedicineItem[];
  showOcrBoxes: boolean;
  onToggleOcrBoxes: () => void;
  onSelectLineForEdit: (med: VerifiedMedicineItem) => void;
}

export const PrescriptionPaperPreview: React.FC<PrescriptionPaperPreviewProps> = ({
  sample,
  uploadedImageUrl,
  verifiedItems,
  showOcrBoxes,
  onToggleOcrBoxes,
  onSelectLineForEdit
}) => {
  return (
    <div className="bg-white border border-zinc-200/90 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-zinc-100">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">
            {uploadedImageUrl ? 'Uploaded Prescription Image' : 'Source Prescription Pad'}
          </h3>
          <p className="text-xs text-zinc-500">
            {sample.clinicName} · {sample.date}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleOcrBoxes}
          className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200/80 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {showOcrBoxes ? 'Hide OCR Detection Boxes' : 'Show OCR Detection Boxes'}
        </button>
      </div>

      {uploadedImageUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50">
          <img
            src={uploadedImageUrl}
            alt="Uploaded medical prescription"
            referrerPolicy="no-referrer"
            className="w-full max-h-[380px] object-contain mx-auto"
          />
        </div>
      ) : (
        /* Realistic Clinical Prescription Pad Simulation */
        <div className="relative rounded-lg bg-[#FDFBF7] border border-[#E6E0D4] p-5 text-zinc-800 shadow-xs">
          {/* Pad Header */}
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#E5DEC9]">
            <div>
              <p className="font-display text-sm font-bold text-zinc-900 tracking-tight">
                {sample.clinicName}
              </p>
              <p className="text-xs text-zinc-600 mt-0.5">{sample.doctorName}</p>
            </div>
            <div className="text-right text-xs text-zinc-600 font-mono tabular-nums">
              <p>Date: {sample.date}</p>
              <p className="mt-0.5">
                Pt: {sample.patientName} ({sample.patientAge}y)
              </p>
            </div>
          </div>

          {/* Rx Symbol & Handwritten Lines */}
          <div className="mt-4 space-y-3">
            <div className="font-serif italic text-2xl font-bold text-[#D96B27] select-none tracking-tight">
              Rx
            </div>

            {sample.handwritingLines.map((line, idx) => {
              const matchedItem = verifiedItems[idx];
              const isFlagged = matchedItem?.needsUserReview && !matchedItem?.userVerified;
              const confidence = matchedItem?.confidenceScore ?? 90;

              return (
                <div
                  key={idx}
                  onClick={() => matchedItem && onSelectLineForEdit(matchedItem)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (matchedItem) onSelectLineForEdit(matchedItem);
                    }
                  }}
                  aria-label={`Inspect OCR line ${idx + 1}: ${line.lineText}`}
                  className={`group relative rounded-md p-2.5 transition-colors cursor-pointer ${
                    showOcrBoxes
                      ? isFlagged
                        ? 'border border-dashed border-amber-600 bg-amber-50/50'
                        : 'border border-dashed border-emerald-600/70 bg-emerald-50/30'
                      : 'hover:bg-zinc-100/70'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p
                      className={`font-serif text-base tracking-wide text-zinc-800 ${
                        line.messiness === 'sloppy'
                          ? 'italic -rotate-1 opacity-85'
                          : line.messiness === 'medium'
                          ? 'italic opacity-95'
                          : ''
                      }`}
                    >
                      {idx + 1}. {line.lineText}
                    </p>
                    {showOcrBoxes && matchedItem && (
                      <span className="font-mono text-[11px] tabular-nums text-zinc-600 shrink-0">
                        OCR {confidence}% · {isFlagged ? 'Needs Review' : 'Verified'}
                      </span>
                    )}
                  </div>
                  <p className="font-serif text-xs italic text-zinc-600 pl-4 mt-0.5">
                    Sig: {line.subText}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Doctor Signature Footer */}
          <div className="mt-5 pt-3 border-t border-[#E5DEC9] flex items-center justify-between text-[11px] text-zinc-500">
            <span>Click any prescription line above to inspect or edit OCR fields</span>
            <span className="font-serif italic text-zinc-700">
              Signed: {sample.doctorName.split(',')[0]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

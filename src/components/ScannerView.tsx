import React, { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  ArrowRight,
  Plus,
  RefreshCw,
  FileText
} from 'lucide-react';
import {
  DRUG_DATABASE,
  SAMPLE_PRESCRIPTIONS,
  SamplePrescription
} from '../data/drugDatabase.ts';
import {
  VerifiedMedicineItem,
  TimeSlot,
  matchMedicineToDatabase
} from '../utils/drugMatcher.ts';
import { PrescriptionPaperPreview } from './PrescriptionPaperPreview.tsx';

interface ScannerViewProps {
  activeSample: SamplePrescription;
  onSelectSample: (sample: SamplePrescription) => void;
  verifiedItems: VerifiedMedicineItem[];
  onUpdateMedicine: (updated: VerifiedMedicineItem) => void;
  onAddRawLine: (rawLine: string) => void;
  onDeleteMedicine: (id: string) => void;
  onUploadImageFile: (file: File) => Promise<void>;
  uploadedImageUrl: string | null;
  isAnalyzingImage: boolean;
  analysisError: string | null;
  processingTimeMs: number;
  onProceedToPlan: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  activeSample,
  onSelectSample,
  verifiedItems,
  onUpdateMedicine,
  onAddRawLine,
  onDeleteMedicine,
  onUploadImageFile,
  uploadedImageUrl,
  isAnalyzingImage,
  analysisError,
  processingTimeMs,
  onProceedToPlan,
  fileInputRef
}) => {
  const [showOcrBoxes, setShowOcrBoxes] = useState(true);
  const [editingItem, setEditingItem] = useState<VerifiedMedicineItem | null>(null);
  const [customLineInput, setCustomLineInput] = useState('');

  // Form state for editing a medicine
  const [editName, setEditName] = useState('');
  const [editDosage, setEditDosage] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editFood, setEditFood] = useState('');
  const [editSlots, setEditSlots] = useState<TimeSlot[]>(['Morning']);

  const openEditor = (item: VerifiedMedicineItem) => {
    setEditingItem(item);
    setEditName(item.verifiedName.split('(')[0].trim());
    setEditDosage(item.dosage);
    setEditDuration(item.duration);
    setEditFood(item.foodInstruction);
    setEditSlots(item.timeSlots.length ? item.timeSlots : ['Morning']);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editName.trim()) return;

    const reMatch = matchMedicineToDatabase(editName);
    const drug = reMatch.drug;
    const slots: TimeSlot[] = editSlots.length ? editSlots : ['Morning'];
    const m = slots.includes('Morning') ? '1' : '0';
    const a = slots.includes('Afternoon') ? '1' : '0';
    const n = slots.includes('Night') ? '1' : '0';

    const updated: VerifiedMedicineItem = {
      ...editingItem,
      verifiedName: drug ? drug.genericName : editName.trim(),
      matchedDrugId: drug ? drug.id : editingItem.matchedDrugId,
      brandExample: drug ? drug.brandNames.slice(0, 2).join(' / ') : editingItem.brandExample,
      category: drug ? drug.category : editingItem.category,
      dosage: editDosage.trim() || editingItem.dosage,
      duration: editDuration.trim() || editingItem.duration,
      foodInstruction: editFood,
      timeSlots: slots,
      frequencyCode: `${m}-${a}-${n}`,
      frequencyPlain: `${slots.join(', ')} daily`,
      plainPurpose: drug ? drug.plainPurpose : editingItem.plainPurpose,
      howToTake: drug ? drug.howToTake : editingItem.howToTake,
      cautions: drug ? drug.cautions : editingItem.cautions,
      confidenceScore: 100,
      needsUserReview: false,
      userVerified: true,
      matchMethod: 'Manual Override',
      ocrCorrectionNote: `Reviewed & confirmed by user → ${
        drug ? drug.genericName : editName.trim()
      }`
    };

    onUpdateMedicine(updated);
    setEditingItem(null);
  };

  const toggleSlotInEditor = (slot: TimeSlot) => {
    setEditSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleAddCustomLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLineInput.trim()) return;
    onAddRawLine(customLineInput.trim());
    setCustomLineInput('');
  };

  const unreviewedItems = verifiedItems.filter((m) => m.needsUserReview && !m.userVerified);
  const avgConfidence = verifiedItems.length
    ? Math.round(
        verifiedItems.reduce((sum, item) => sum + item.confidenceScore, 0) / verifiedItems.length
      )
    : 0;

  return (
    <div className="space-y-8">
      {/* Hero Workspace Banner */}
      <section className="bg-white border border-zinc-200/90 rounded-xl p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs font-medium text-zinc-500">
              <span>Prescription Reader & Verification Studio</span>
              <span aria-hidden="true"> · </span>
              <span>Read, Verify, Explain</span>
              <span aria-hidden="true"> · </span>
              <span className="font-mono tabular-nums">
                Pipeline latency {(processingTimeMs / 1000).toFixed(1)}s
              </span>
            </div>

            <h1
              className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-950 tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Turn any prescription photo into a clear, plain-language medicine plan.
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 max-w-2xl leading-relaxed">
              Handwritten prescriptions and medical shorthand (<span className="font-mono">1-0-1</span>,{' '}
              <span className="font-mono">BD</span>, <span className="font-mono">SOS</span>) are hard to
              decipher. RxLens extracts every line, corrects OCR spelling mistakes against a verified
              drug database, flags low-confidence fields for review, and builds a daily caregiver schedule.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                aria-label="Upload prescription photo file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadImageFile(file);
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzingImage}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#D96B27] hover:bg-[#C05A1C] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
              >
                <Camera className="w-4 h-4" />
                {isAnalyzingImage ? 'Analyzing Prescription Photo...' : 'Upload or Capture Photo'}
              </button>

              <button
                type="button"
                onClick={onProceedToPlan}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>View Plain-Language Guide</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {analysisError && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900"
              >
                <strong>Note:</strong> {analysisError}
              </div>
            )}
          </div>

          {/* Right Column: Target Metrics Summary */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-2.5 sm:gap-3 bg-[#FAF8F5] border border-zinc-200/80 rounded-xl p-3 sm:p-4">
            <div className="p-2.5 sm:p-3 bg-white rounded-lg border border-zinc-200/60">
              <p className="font-mono text-xl sm:text-2xl font-bold text-[#D96B27] tabular-nums">
                {avgConfidence}%
              </p>
              <p className="text-[11px] sm:text-xs font-semibold text-zinc-900 mt-1">
                Name Accuracy
              </p>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5">
                Target 85%+ read
              </p>
            </div>
            <div className="p-2.5 sm:p-3 bg-white rounded-lg border border-zinc-200/60">
              <p className="font-mono text-xl sm:text-2xl font-bold text-zinc-900 tabular-nums">
                {verifiedItems.length}
              </p>
              <p className="text-[11px] sm:text-xs font-semibold text-zinc-900 mt-1">
                Plain Language
              </p>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5">
                Simple EN guide
              </p>
            </div>
            <div className="p-2.5 sm:p-3 bg-white rounded-lg border border-zinc-200/60">
              <p className="font-mono text-xl sm:text-2xl font-bold text-emerald-700 tabular-nums">
                {(processingTimeMs / 1000).toFixed(1)}s
              </p>
              <p className="text-[11px] sm:text-xs font-semibold text-zinc-900 mt-1">
                End-to-End Speed
              </p>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5">
                Target &lt;15s plan
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Sample Selector Strip */}
        <div className="mt-6 pt-5 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-semibold text-zinc-700">
            Test with Benchmark Prescriptions:
          </span>
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-100 rounded-lg">
            {SAMPLE_PRESCRIPTIONS.map((sample, i) => {
              const isSelected = activeSample.id === sample.id && !uploadedImageUrl;
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => onSelectSample(sample)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-zinc-950 shadow-xs font-semibold'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Sample {i + 1}: {sample.patientName} ({sample.patientAge}y)
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architecture / Workflow Pipeline Status Bar (Slide 7) */}
      <section aria-label="Verification Architecture Pipeline" className="bg-white border border-zinc-200/90 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-zinc-800">
            01. Verification Pipeline Workflow (OCR → Fuzzy Drug-DB Check → User Review → Schedule)
          </h2>
          <span className="text-xs text-zinc-500 font-mono tabular-nums">
            {unreviewedItems.length > 0
              ? `Action Required: ${unreviewedItems.length} item(s) < 82% confidence`
              : 'All medicines verified ≥ 82% confidence'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80">
            <p className="font-semibold text-zinc-900">1. Prescription Photo</p>
            <p className="text-zinc-500 mt-0.5">
              {uploadedImageUrl ? 'Custom image loaded' : activeSample.clinicName}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80">
            <p className="font-semibold text-zinc-900">2. Pre-process + OCR</p>
            <p className="text-zinc-500 mt-0.5 font-mono tabular-nums">
              {verifiedItems.length} raw text lines extracted
            </p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80">
            <p className="font-semibold text-zinc-900">3. Drug-DB Fuzzy Match</p>
            <p className="text-zinc-500 mt-0.5 font-mono tabular-nums">
              Checked vs {DRUG_DATABASE.length} reference drugs
            </p>
          </div>
          <div
            className={`p-3 rounded-lg border ${
              unreviewedItems.length > 0
                ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
            }`}
          >
            <p className="font-semibold">
              4. Match OK? {unreviewedItems.length > 0 ? '→ Review Needed' : '→ Yes (Verified)'}
            </p>
            <p className="mt-0.5 text-[11px]">
              {unreviewedItems.length > 0
                ? `Review ${unreviewedItems.length} flagged line(s) below`
                : 'All OCR fields verified'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80">
            <p className="font-semibold text-zinc-900">5. Guide + Reminders</p>
            <p className="text-zinc-500 mt-0.5">Plain-language plan & caregiver alerts ready</p>
          </div>
        </div>
      </section>

      {/* Main 2-Column Split: Source Prescription Pad + Verified Extraction Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Cols: Source Prescription Pad + Raw OCR Comparison */}
        <div className="lg:col-span-5 space-y-6">
          <PrescriptionPaperPreview
            sample={activeSample}
            uploadedImageUrl={uploadedImageUrl}
            verifiedItems={verifiedItems}
            showOcrBoxes={showOcrBoxes}
            onToggleOcrBoxes={() => setShowOcrBoxes((prev) => !prev)}
            onSelectLineForEdit={openEditor}
          />

          {/* Slide 5: Generic OCR vs RxLens Comparison */}
          <div className="bg-white border border-zinc-200/90 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900">
              Raw Generic OCR Output vs. RxLens Verification
            </h3>
            <p className="text-xs text-zinc-500">
              Generic OCR apps return unverified raw text with spelling errors and cryptic numbers.
              RxLens cross-checks every line against the drug dataset.
            </p>
            <div className="rounded-lg bg-zinc-900 text-zinc-200 p-3.5 font-mono text-xs space-y-1.5">
              <p className="text-[11px] text-zinc-400">RAW UNVERIFIED OCR STREAM:</p>
              {verifiedItems.map((item, i) => (
                <p key={item.id} className="truncate">
                  {i + 1}. {item.rawOcrLine}
                </p>
              ))}
            </div>

            {/* Add Custom OCR Line Form */}
            <form onSubmit={handleAddCustomLine} className="pt-2 space-y-2">
              <label
                htmlFor="custom-ocr-line-input"
                className="block text-xs font-medium text-zinc-700"
              >
                Test Custom OCR Prescription Line (include typos or shorthand):
              </label>
              <div className="flex gap-2">
                <input
                  id="custom-ocr-line-input"
                  type="text"
                  value={customLineInput}
                  onChange={(e) => setCustomLineInput(e.target.value)}
                  placeholder="e.g. Tab Paracetmol 650mg 1-0-1 x 3 days after food"
                  className="flex-1 px-3 py-2 text-xs bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:border-[#D96B27]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Line
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right 7 Cols: RxLens Verified Medicine Extraction & Review Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-zinc-200/90 rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-zinc-100">
              <div>
                <h2 className="text-base font-bold text-zinc-900">
                  RxLens Drug-DB Verification & Confidence Check
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Medicines below 82% OCR confidence or with SOS/unclear shorthand are flagged for quick confirmation.
                </p>
              </div>
              <button
                type="button"
                onClick={onProceedToPlan}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#D96B27] hover:bg-[#C05A1C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Generate Medicine Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inline Editor Drawer when user clicks Review / Edit */}
            {editingItem && (
              <form
                onSubmit={handleSaveEdit}
                aria-label="Review and Edit Medicine Fields"
                className="mb-5 p-4 rounded-xl bg-[#FAF8F5] border border-[#D96B27]/50 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">
                      Review & Edit Extracted Medicine Fields
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono">
                      Source OCR: &ldquo;{editingItem.rawOcrLine}&rdquo;
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="text-xs text-zinc-500 hover:text-zinc-800 px-2 py-1"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label
                      htmlFor="edit-med-name"
                      className="block text-xs font-medium text-zinc-700 mb-1"
                    >
                      Verified Medicine Name
                    </label>
                    <input
                      id="edit-med-name"
                      type="text"
                      list="drug-db-suggestions"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-[#D96B27]"
                    />
                    <datalist id="drug-db-suggestions">
                      {DRUG_DATABASE.map((d) => (
                        <option key={d.id} value={d.genericName.split('(')[0].trim()} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label
                      htmlFor="edit-med-dosage"
                      className="block text-xs font-medium text-zinc-700 mb-1"
                    >
                      Dosage Strength
                    </label>
                    <input
                      id="edit-med-dosage"
                      type="text"
                      value={editDosage}
                      onChange={(e) => setEditDosage(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-[#D96B27]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="edit-med-duration"
                      className="block text-xs font-medium text-zinc-700 mb-1"
                    >
                      Course Duration
                    </label>
                    <input
                      id="edit-med-duration"
                      type="text"
                      value={editDuration}
                      onChange={(e) => setEditDuration(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-[#D96B27]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="block text-xs font-medium text-zinc-700 mb-1">
                      Daily Schedule Timing
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(['Morning', 'Afternoon', 'Evening', 'Night'] as TimeSlot[]).map((slot) => {
                        const active = editSlots.includes(slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => toggleSlotInEditor(slot)}
                            className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                              active
                                ? 'bg-zinc-900 text-white border-zinc-900'
                                : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="edit-med-food"
                      className="block text-xs font-medium text-zinc-700 mb-1"
                    >
                      Meal Instruction
                    </label>
                    <select
                      id="edit-med-food"
                      value={editFood}
                      onChange={(e) => setEditFood(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-[#D96B27]"
                    >
                      <option value="After food">After food</option>
                      <option value="Before food">Before food</option>
                      <option value="Empty stomach (30 mins before breakfast)">
                        Empty stomach (30 mins before breakfast)
                      </option>
                      <option value="With or without food">With or without food</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-3.5 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#D96B27] hover:bg-[#C05A1C] rounded-lg cursor-pointer"
                  >
                    Save & Verify Field
                  </button>
                </div>
              </form>
            )}

            {/* Extracted Medicine Cards */}
            <div className="space-y-3">
              {verifiedItems.map((item) => {
                const isLowConfidence = item.needsUserReview && !item.userVerified;
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-colors ${
                      isLowConfidence
                        ? 'bg-amber-50/40 border-amber-300'
                        : 'bg-[#FAF8F5]/60 border-zinc-200/90'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        {/* Unboxed metadata kicker */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                          <span className="font-medium text-zinc-700">{item.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>Brands: {item.brandExample}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            Confidence: {item.confidenceScore}%
                          </span>
                        </div>

                        <h3 className="font-display text-base font-bold text-zinc-950 flex items-center gap-2">
                          <span>
                            {item.verifiedName} — {item.dosage}
                          </span>
                          {isLowConfidence ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              Review If Unclear
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Verified
                            </span>
                          )}
                        </h3>

                        <p className="text-xs text-zinc-600 font-mono">
                          {item.ocrCorrectionNote}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isLowConfidence && (
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateMedicine({
                                ...item,
                                confidenceScore: 100,
                                needsUserReview: false,
                                userVerified: true,
                                ocrCorrectionNote: `Confirmed by user (${item.verifiedName})`
                              })
                            }
                            className="px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-200/80 hover:bg-amber-300/80 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Confirm Match
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditor(item)}
                          aria-label={`Review or edit ${item.verifiedName}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Fields</span>
                        </button>
                        {verifiedItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onDeleteMedicine(item.id)}
                            aria-label={`Remove ${item.verifiedName}`}
                            className="px-2.5 py-1.5 text-xs text-zinc-500 hover:text-red-700 transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Plain-Language Summary Row */}
                    <div className="mt-3 pt-3 border-t border-zinc-200/70 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-zinc-500 block">Dose & Timing:</span>
                        <span className="font-semibold text-zinc-900">
                          {item.frequencyPlain} ({item.frequencyCode})
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Meal Instruction & Course:</span>
                        <span className="font-semibold text-zinc-900">
                          {item.foodInstruction} · {item.duration}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Why You Take It:</span>
                        <span className="text-zinc-800">{item.plainPurpose}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

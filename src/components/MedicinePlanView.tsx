import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Printer
} from 'lucide-react';
import { VerifiedMedicineItem, SafetyAlert } from '../utils/drugMatcher.ts';

interface MedicinePlanViewProps {
  patientName: string;
  patientAge: number;
  doctorName: string;
  clinicName: string;
  date: string;
  medicines: VerifiedMedicineItem[];
  safetyAlerts: SafetyAlert[];
  onGoToSchedule: () => void;
  onGoToScanner: () => void;
}

const LOCAL_TRANSLATION_HINTS: Record<string, { hi: string; kn: string }> = {
  'After food': {
    hi: 'Khane ke baad (खाने के बाद)',
    kn: 'Oota aadamele (ಊಟ ಆದಮೇಲೆ)'
  },
  'Before food': {
    hi: 'Khane se pehle (खाने से पहले)',
    kn: 'Ootakke munche (ಊಟಕ್ಕೆ ಮುಂಚೆ)'
  },
  'Empty stomach (30 mins before breakfast)': {
    hi: 'Subah khali pet, nashte se 30 min pehle (सुबह खाली पेट)',
    kn: 'Beligge khaali hotteyalli (ಬೆಳಿಗ್ಗೆ ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ)'
  },
  'With or without food': {
    hi: 'Khane ke saath ya bina (खाने के साथ या बिना)',
    kn: 'Ootada jothe athava illade (ಊಟದ ಜೊತೆ ಅಥವಾ ಇಲ್ಲದೆ)'
  }
};

export const MedicinePlanView: React.FC<MedicinePlanViewProps> = ({
  patientName,
  patientAge,
  doctorName,
  clinicName,
  date,
  medicines,
  safetyAlerts,
  onGoToSchedule,
  onGoToScanner
}) => {
  const [largePrintMode, setLargePrintMode] = useState(false);
  const [showRegionalHelper, setShowRegionalHelper] = useState(false);
  const [speakingMedId, setSpeakingMedId] = useState<string | null>(null);

  const handleSpeakMedicine = (med: VerifiedMedicineItem) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingMedId === med.id) {
      window.speechSynthesis.cancel();
      setSpeakingMedId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `${med.verifiedName}, ${med.dosage}. Purpose: ${med.plainPurpose} How to take: ${med.frequencyPlain}, ${med.foodInstruction}, for ${med.duration}. ${med.howToTake} Important caution: ${med.cautions[0] || ''}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.92;
    utterance.onend = () => setSpeakingMedId(null);
    utterance.onerror = () => setSpeakingMedId(null);
    setSpeakingMedId(med.id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      {/* Header & Accessibility Controls Bar */}
      <section className="bg-white border border-zinc-200/90 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span>Patient: {patientName} ({patientAge} yrs)</span>
              <span aria-hidden="true">·</span>
              <span>Prescribed by {doctorName}</span>
              <span aria-hidden="true">·</span>
              <span>{clinicName}</span>
              <span aria-hidden="true">·</span>
              <span>{date}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
              Plain-Language Medicine Guide
            </h1>
            <p className="text-sm text-zinc-600">
              Clear, verified instructions explaining what each medicine is for, when to take it, and key cautions.
            </p>
          </div>

          {/* Interactive Accessibility & Helper Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setLargePrintMode((prev) => !prev)}
              aria-pressed={largePrintMode}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                largePrintMode
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              {largePrintMode ? 'Elder Large-Print: ON' : 'Elder Large-Print Mode'}
            </button>

            <button
              type="button"
              onClick={() => setShowRegionalHelper((prev) => !prev)}
              aria-pressed={showRegionalHelper}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                showRegionalHelper
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              {showRegionalHelper ? 'Hindi / Kannada Guide: ON' : 'Show Hindi / Kannada Guide'}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Guide</span>
            </button>

            <button
              type="button"
              onClick={onGoToSchedule}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#D96B27] hover:bg-[#C05A1C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Open Daily Reminders</span>
            </button>
          </div>
        </div>
      </section>

      {/* Safety Alerts (Allergy, Drug-Interaction, or Unverified OCR) */}
      {safetyAlerts.length > 0 && (
        <section aria-label="Safety and Interaction Warnings" className="space-y-3">
          {safetyAlerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            return (
              <div
                key={alert.id}
                role="alert"
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  isCritical
                    ? 'bg-red-50/80 border-red-300 text-red-950'
                    : 'bg-amber-50/80 border-amber-300 text-amber-950'
                }`}
              >
                {isCritical ? (
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-bold">{alert.title}</h2>
                    {alert.type === 'low-confidence' && (
                      <button
                        type="button"
                        onClick={onGoToScanner}
                        className="text-xs font-semibold underline hover:no-underline cursor-pointer"
                      >
                        Review & Edit in Scanner →
                      </button>
                    )}
                  </div>
                  <p className={largePrintMode ? 'text-base' : 'text-xs opacity-90'}>
                    {alert.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Medicine Plain-Language Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {medicines.map((med, idx) => {
          const translation = LOCAL_TRANSLATION_HINTS[med.foodInstruction];
          const isSpeaking = speakingMedId === med.id;

          return (
            <article
              key={med.id}
              className="bg-white border border-zinc-200/90 rounded-xl p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Unboxed metadata header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-zinc-500 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono font-semibold text-zinc-700">
                      0{idx + 1}.
                    </span>
                    <span>{med.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{med.confidenceScore}% match</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSpeakMedicine(med)}
                    aria-label={
                      isSpeaking
                        ? `Stop reading ${med.verifiedName}`
                        : `Listen to instructions for ${med.verifiedName}`
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isSpeaking
                        ? 'bg-[#D96B27] text-white border-[#D96B27]'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Stop Audio</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Read Aloud</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Title & Brand Info */}
                <div>
                  <h2
                    className={`font-display font-bold text-zinc-950 ${
                      largePrintMode ? 'text-2xl' : 'text-xl'
                    }`}
                  >
                    {med.verifiedName} ({med.dosage})
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Common pharmacy names: {med.brandExample} · Prescribed for {med.duration}
                  </p>
                </div>

                {/* Plain-Language Purpose */}
                <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-zinc-200/70 space-y-1">
                  <p className="text-xs font-semibold text-zinc-700">
                    What this medicine does (Purpose):
                  </p>
                  <p
                    className={`text-zinc-900 leading-relaxed ${
                      largePrintMode ? 'text-lg font-medium' : 'text-sm'
                    }`}
                  >
                    {med.plainPurpose}
                  </p>
                </div>

                {/* When & How to Take */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/70">
                      <span className="text-zinc-500 block">When to take:</span>
                      <span
                        className={`font-semibold text-zinc-950 block mt-0.5 ${
                          largePrintMode ? 'text-base' : 'text-sm'
                        }`}
                      >
                        {med.frequencyPlain}
                      </span>
                      <span className="font-mono text-[11px] text-zinc-500">
                        Code: {med.frequencyCode}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/70">
                      <span className="text-zinc-500 block">Meal instruction:</span>
                      <span
                        className={`font-semibold text-[#D96B27] block mt-0.5 ${
                          largePrintMode ? 'text-base' : 'text-sm'
                        }`}
                      >
                        {med.foodInstruction}
                      </span>
                      <span className="text-[11px] text-zinc-500">Course: {med.duration}</span>
                    </div>
                  </div>

                  {showRegionalHelper && translation && (
                    <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 text-xs space-y-1">
                      <p className="font-semibold text-zinc-900">
                        Local Caregiver Phrase ({med.foodInstruction}):
                      </p>
                      <p className="text-zinc-700">Hindi: {translation.hi}</p>
                      <p className="text-zinc-700">Kannada: {translation.kn}</p>
                    </div>
                  )}

                  <p
                    className={`text-zinc-700 leading-relaxed pt-1 ${
                      largePrintMode ? 'text-base' : 'text-xs'
                    }`}
                  >
                    <strong>How to take:</strong> {med.howToTake}
                  </p>
                </div>
              </div>

              {/* Cautions List */}
              <div className="pt-3 border-t border-zinc-100 space-y-1.5">
                <p className="text-xs font-semibold text-zinc-800">Important Cautions:</p>
                <ul className="space-y-1">
                  {med.cautions.map((caution, cIdx) => (
                    <li
                      key={cIdx}
                      className={`text-zinc-600 flex items-start gap-2 ${
                        largePrintMode ? 'text-sm' : 'text-xs'
                      }`}
                    >
                      <span className="text-[#D96B27] font-bold">•</span>
                      <span>{caution}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Allergy group: {med.allergyGroup}</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Drug-DB Checked
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Informational Medical Disclaimer (Slide 8) */}
      <p className="text-xs text-zinc-500 text-center py-2">
        Informational companion only, not a substitute for professional medical advice. Always consult your prescribing doctor or pharmacist before altering doses.
      </p>
    </div>
  );
};

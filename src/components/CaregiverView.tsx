import React, { useState } from 'react';
import {
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  Share2,
  ShieldAlert,
  Clock
} from 'lucide-react';
import {
  ScheduledDoseItem,
  SafetyAlert,
  VerifiedMedicineItem,
  calculateAdherenceSummary
} from '../utils/drugMatcher.ts';

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  relation: string;
  caregiverName: string;
  caregiverPhone: string;
  allergies: string[];
  linkedSampleId: string;
}

interface CaregiverViewProps {
  profiles: PatientProfile[];
  activeProfile: PatientProfile;
  onSelectProfile: (profile: PatientProfile) => void;
  onAddProfile: (newProfile: Omit<PatientProfile, 'id'>) => void;
  onUpdateAllergies: (allergies: string[]) => void;
  medicines: VerifiedMedicineItem[];
  schedule: ScheduledDoseItem[];
  safetyAlerts: SafetyAlert[];
}

export const CaregiverView: React.FC<CaregiverViewProps> = ({
  profiles,
  activeProfile,
  onSelectProfile,
  onAddProfile,
  onUpdateAllergies,
  medicines,
  schedule,
  safetyAlerts
}) => {
  const [showNewProfileForm, setShowNewProfileForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('65');
  const [newRelation, setNewRelation] = useState('Parent');
  const [newCaregiver, setNewCaregiver] = useState('Ayansh Srivastava');
  const [newAllergyInput, setNewAllergyInput] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);

  const adherence = calculateAdherenceSummary(schedule);
  const skippedDoses = schedule.filter((s) => s.status === 'skipped');

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddProfile({
      name: newName.trim(),
      age: Number(newAge) || 65,
      relation: newRelation.trim() || 'Family Member',
      caregiverName: newCaregiver.trim() || 'Primary Caregiver',
      caregiverPhone: '+91 98450 11223',
      allergies: newAllergyInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      linkedSampleId: 'rx-cardio-metabolic'
    });
    setNewName('');
    setNewAllergyInput('');
    setShowNewProfileForm(false);
  };

  const handleToggleCommonAllergy = (allergyName: string) => {
    const exists = activeProfile.allergies.some(
      (a) => a.toLowerCase() === allergyName.toLowerCase()
    );
    if (exists) {
      onUpdateAllergies(
        activeProfile.allergies.filter((a) => a.toLowerCase() !== allergyName.toLowerCase())
      );
    } else {
      onUpdateAllergies([...activeProfile.allergies, allergyName]);
    }
  };

  const handleCopyCaregiverSummary = () => {
    const summaryLines = [
      `RxLens Caregiver Medicine Plan — ${activeProfile.name} (${activeProfile.age}y)`,
      `Adherence Today: ${adherence.taken}/${adherence.total} doses taken (${adherence.percentage}%)`,
      ...medicines.map(
        (m, idx) =>
          `${idx + 1}. ${m.verifiedName} (${m.dosage}) — ${m.frequencyPlain} · ${m.foodInstruction} (${m.plainPurpose})`
      )
    ].join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryLines).catch(() => {});
    }
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Caregiver Hub Header */}
      <section className="bg-white border border-zinc-200/90 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-zinc-500">
              <span>Caregiver Monitoring Hub</span>
              <span aria-hidden="true"> · </span>
              <span>Active Caregiver: {activeProfile.caregiverName}</span>
              <span aria-hidden="true"> · </span>
              <span className="font-mono tabular-nums">{profiles.length} Patient Profiles</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
              Caregiver View & Family Adherence Alerts
            </h1>
            <p className="text-sm text-zinc-600">
              Manage elderly or dependent family members, configure known drug allergies, and track missed-dose alerts remotely.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyCaregiverSummary}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200/80 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedSummary ? 'Copied Plan Summary!' : 'Copy WhatsApp Care Summary'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowNewProfileForm((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#D96B27] hover:bg-[#C05A1C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Patient Profile</span>
            </button>
          </div>
        </div>

        {/* Patient Profile Switcher */}
        <div className="mt-5 pt-5 border-t border-zinc-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-700 mr-2">Select Patient:</span>
          {profiles.map((p) => {
            const isSelected = p.id === activeProfile.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectProfile(p)}
                className={`px-3.5 py-2 text-xs rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 text-white border-zinc-900 font-semibold'
                    : 'bg-[#FAF8F5] text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {p.name} ({p.age}y · {p.relation})
              </button>
            );
          })}
        </div>

        {/* New Patient Profile Form */}
        {showNewProfileForm && (
          <form
            onSubmit={handleCreateProfile}
            aria-label="Add New Patient Profile"
            className="mt-4 p-4 rounded-xl bg-[#FAF8F5] border border-zinc-300 space-y-3"
          >
            <h2 className="text-sm font-bold text-zinc-900">Create Dependent Patient Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label htmlFor="new-pt-name" className="block text-xs font-medium text-zinc-700 mb-1">
                  Patient Full Name
                </label>
                <input
                  id="new-pt-name"
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Subramanya Rao"
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="new-pt-age" className="block text-xs font-medium text-zinc-700 mb-1">
                  Age (Years)
                </label>
                <input
                  id="new-pt-age"
                  type="number"
                  required
                  min={1}
                  max={120}
                  value={newAge}
                  onChange={(e) => setNewAge(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label htmlFor="new-pt-rel" className="block text-xs font-medium text-zinc-700 mb-1">
                  Relationship
                </label>
                <input
                  id="new-pt-rel"
                  type="text"
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  placeholder="e.g. Grandfather"
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="new-pt-allergies" className="block text-xs font-medium text-zinc-700 mb-1">
                  Known Allergies (comma separated)
                </label>
                <input
                  id="new-pt-allergies"
                  type="text"
                  value={newAllergyInput}
                  onChange={(e) => setNewAllergyInput(e.target.value)}
                  placeholder="e.g. Penicillin, Aspirin"
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewProfileForm(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#D96B27] hover:bg-[#C05A1C] rounded-lg cursor-pointer"
              >
                Save Patient Profile
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 2-Column Caregiver Dashboard: Allergy & Safety Rules + Live Adherence Alert Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Cols: Patient Safety Profile & Allergy Guardrails */}
        <section className="lg:col-span-5 bg-white border border-zinc-200/90 rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-zinc-950">
              Patient Allergy & Contraindication Guardrails
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Toggle known drug allergies for {activeProfile.name}. RxLens automatically scans every prescription against these groups.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['Penicillin', 'Sulfa', 'NSAID / Aspirin', 'Macrolides', 'Statins'].map((group) => {
              const isActive = activeProfile.allergies.some(
                (a) => a.toLowerCase() === group.toLowerCase()
              );
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => handleToggleCommonAllergy(group)}
                  aria-pressed={isActive}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-red-700 text-white border-red-700 font-semibold'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  {isActive ? `Allergic: ${group}` : `+ Flag ${group} Allergy`}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-zinc-100 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">Patient Name & Age:</span>
              <span className="font-semibold text-zinc-900">
                {activeProfile.name} ({activeProfile.age} yrs)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Designated Caregiver:</span>
              <span className="font-semibold text-zinc-900">{activeProfile.caregiverName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Active Allergies Monitored:</span>
              <span className="font-semibold text-zinc-900">
                {activeProfile.allergies.length > 0
                  ? activeProfile.allergies.join(', ')
                  : 'None recorded'}
              </span>
            </div>
          </div>
        </section>

        {/* Right 7 Cols: Caregiver Alert Feed (Missed Doses + Safety Warnings) */}
        <section className="lg:col-span-7 bg-white border border-zinc-200/90 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-zinc-950">
                Caregiver Alert Feed & Adherence Status
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Real-time notifications for skipped doses, drug interactions, and low-confidence OCR fields.
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-zinc-700 tabular-nums">
              Adherence: {adherence.percentage}%
            </span>
          </div>

          {/* Missed Doses Alert */}
          {skippedDoses.length > 0 && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Clock className="w-4 h-4 text-red-600" />
                <span>Missed / Skipped Dose Alert ({skippedDoses.length})</span>
              </div>
              <ul className="text-xs space-y-1 pl-5 list-disc">
                {skippedDoses.map((d) => (
                  <li key={d.id}>
                    <strong>{d.medicineName} ({d.dosage})</strong> scheduled for {d.slot} ({d.clockTime}) was marked skipped.
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Safety & Interaction Alerts */}
          {safetyAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                alert.severity === 'critical'
                  ? 'bg-red-50/90 border-red-300 text-red-950'
                  : 'bg-amber-50/80 border-amber-300 text-amber-950'
              }`}
            >
              {alert.severity === 'critical' ? (
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 text-xs">
                <p className="font-bold text-sm">{alert.title}</p>
                <p>{alert.explanation}</p>
              </div>
            </div>
          ))}

          {skippedDoses.length === 0 && safetyAlerts.length === 0 && (
            <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-sm">All Clear for {activeProfile.name}</p>
                <p>
                  No missed doses, allergy conflicts, or unverified OCR lines are currently active.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

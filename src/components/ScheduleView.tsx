import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Bell,
  Users
} from 'lucide-react';
import {
  ScheduledDoseItem,
  TimeSlot,
  calculateAdherenceSummary
} from '../utils/drugMatcher.ts';

interface ScheduleViewProps {
  patientName: string;
  schedule: ScheduledDoseItem[];
  onUpdateDoseStatus: (doseId: string, status: 'pending' | 'taken' | 'skipped') => void;
  onResetAllDoses: () => void;
  onMarkAllMorningTaken: () => void;
  onGoToCaregiver: () => void;
}

const SLOT_DESCRIPTIONS: Record<TimeSlot, { window: string; advice: string }> = {
  Morning: {
    window: '07:30 AM – 09:00 AM',
    advice: 'Includes empty-stomach stomach protectors (07:30 AM) and post-breakfast tablets (08:00 AM).'
  },
  Afternoon: {
    window: '01:00 PM – 02:30 PM',
    advice: 'Mid-day doses to be taken with or after lunch.'
  },
  Evening: {
    window: '05:30 PM – 06:30 PM',
    advice: 'Early evening doses with light snack or tea.'
  },
  Night: {
    window: '08:30 PM – 10:00 PM',
    advice: 'Post-dinner and bedtime medications (such as cholesterol or allergy tablets).'
  }
};

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  patientName,
  schedule,
  onUpdateDoseStatus,
  onResetAllDoses,
  onMarkAllMorningTaken,
  onGoToCaregiver
}) => {
  const [selectedSlotFilter, setSelectedSlotFilter] = useState<'All' | TimeSlot>('All');
  const [reminderBannerMessage, setReminderBannerMessage] = useState<string | null>(null);

  const summary = calculateAdherenceSummary(schedule);
  const slots: TimeSlot[] = ['Morning', 'Afternoon', 'Evening', 'Night'];

  const handleTriggerTestReminder = () => {
    const nextPending = schedule.find((s) => s.status === 'pending');
    if (nextPending) {
      setReminderBannerMessage(
        `Reminder for ${patientName}: Time to take ${nextPending.medicineName} (${nextPending.dosage}) at ${nextPending.clockTime} — ${nextPending.foodInstruction}.`
      );
    } else {
      setReminderBannerMessage(
        `All ${summary.total} scheduled doses for ${patientName} have been logged for today!`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Adherence & Reminder Header */}
      <section className="bg-white border border-zinc-200/90 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-xs text-zinc-500">
              <span>Smart Daily Schedule</span>
              <span aria-hidden="true"> · </span>
              <span>Patient: {patientName}</span>
              <span aria-hidden="true"> · </span>
              <span className="font-mono tabular-nums">
                {summary.taken}/{summary.total} Doses Taken ({summary.percentage}% Adherence)
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
              Daily Medicine Schedule & Smart Reminders
            </h1>
            <p className="text-sm text-zinc-600">
              Check off each dose as it is taken. Missed or skipped doses automatically notify the Caregiver View.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleTriggerTestReminder}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-[#D96B27]" />
              <span>Simulate Next Dose Alert</span>
            </button>

            <button
              type="button"
              onClick={onMarkAllMorningTaken}
              className="px-3.5 py-2 text-xs font-semibold text-emerald-900 bg-emerald-100/80 hover:bg-emerald-200/80 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Mark Morning Doses Taken
            </button>

            <button
              type="button"
              onClick={onResetAllDoses}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Day</span>
            </button>

            <button
              type="button"
              onClick={onGoToCaregiver}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#D96B27] hover:bg-[#C05A1C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Caregiver View</span>
            </button>
          </div>
        </div>

        {/* Adherence Progress Strip */}
        <div className="mt-5 pt-5 border-t border-zinc-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-zinc-200/70">
            <span className="text-xs text-zinc-500 block">Daily Adherence</span>
            <span className="font-mono text-2xl font-bold text-[#D96B27] tabular-nums">
              {summary.percentage}%
            </span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-zinc-200/70">
            <span className="text-xs text-zinc-500 block">Doses Taken</span>
            <span className="font-mono text-2xl font-bold text-emerald-700 tabular-nums">
              {summary.taken}
            </span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-zinc-200/70">
            <span className="text-xs text-zinc-500 block">Pending Today</span>
            <span className="font-mono text-2xl font-bold text-zinc-900 tabular-nums">
              {summary.pending}
            </span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-zinc-200/70">
            <span className="text-xs text-zinc-500 block">Skipped / Missed</span>
            <span className="font-mono text-2xl font-bold text-red-700 tabular-nums">
              {summary.skipped}
            </span>
          </div>
        </div>

        {/* Simulated In-App Notification Banner */}
        {reminderBannerMessage && (
          <div
            role="status"
            className="mt-4 p-4 rounded-xl bg-zinc-900 text-white flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <Bell className="w-4 h-4 text-[#D96B27] shrink-0" />
              <span>{reminderBannerMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setReminderBannerMessage(null)}
              className="text-xs text-zinc-300 hover:text-white shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </section>

      {/* Interactive Time-of-Day Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-zinc-200/70 rounded-lg">
          {(['All', 'Morning', 'Afternoon', 'Evening', 'Night'] as const).map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setSelectedSlotFilter(slot)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedSlotFilter === slot
                  ? 'bg-white text-zinc-950 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* Time-of-Day Schedule Groups */}
      <div className="space-y-5">
        {slots
          .filter((slot) => selectedSlotFilter === 'All' || selectedSlotFilter === slot)
          .map((slot) => {
            const slotItems = schedule.filter((s) => s.slot === slot);
            const meta = SLOT_DESCRIPTIONS[slot];

            return (
              <section
                key={slot}
                aria-label={`${slot} Medication Schedule`}
                className="bg-white border border-zinc-200/90 rounded-xl p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 mb-4 border-b border-zinc-100">
                  <div>
                    <h2 className="font-display text-lg font-bold text-zinc-950">
                      {slot} Doses
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">{meta.advice}</p>
                  </div>
                  <span className="font-mono text-xs text-zinc-600 tabular-nums">
                    Window: {meta.window} · {slotItems.length} medicine(s)
                  </span>
                </div>

                {slotItems.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-3">
                    No medicines scheduled for the {slot.toLowerCase()} slot.
                  </p>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {slotItems.map((dose) => {
                      const isTaken = dose.status === 'taken';
                      const isSkipped = dose.status === 'skipped';

                      return (
                        <div
                          key={dose.id}
                          className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                              <span className="font-mono font-semibold text-zinc-800 tabular-nums">
                                {dose.clockTime}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-medium text-[#D96B27]">
                                {dose.foodInstruction}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>
                                Status:{' '}
                                <strong
                                  className={
                                    isTaken
                                      ? 'text-emerald-700'
                                      : isSkipped
                                      ? 'text-red-700'
                                      : 'text-zinc-700'
                                  }
                                >
                                  {isTaken
                                    ? `Taken (${dose.takenAt || 'Logged'})`
                                    : isSkipped
                                    ? 'Skipped / Missed'
                                    : 'Scheduled'}
                                </strong>
                              </span>
                            </div>

                            <h3
                              className={`font-display text-base font-bold ${
                                isTaken ? 'line-through text-zinc-400' : 'text-zinc-950'
                              }`}
                            >
                              {dose.medicineName} — {dose.dosage}
                            </h3>
                            <p className="text-xs text-zinc-600">{dose.plainPurpose}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateDoseStatus(
                                  dose.id,
                                  isTaken ? 'pending' : 'taken'
                                )
                              }
                              aria-label={`Mark ${dose.medicineName} ${dose.slot} dose as taken`}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                isTaken
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isTaken ? 'Taken' : 'Mark Taken'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                onUpdateDoseStatus(
                                  dose.id,
                                  isSkipped ? 'pending' : 'skipped'
                                )
                              }
                              aria-label={`Mark ${dose.medicineName} ${dose.slot} dose as skipped`}
                              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                isSkipped
                                  ? 'bg-red-50 text-red-800 border-red-300 font-semibold'
                                  : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>{isSkipped ? 'Skipped' : 'Skip'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
      </div>
    </div>
  );
};

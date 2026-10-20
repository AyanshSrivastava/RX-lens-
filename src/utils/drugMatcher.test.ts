import test from 'node:test';
import assert from 'node:assert/strict';
import {
  levenshteinDistance,
  calculateStringSimilarity,
  matchMedicineToDatabase,
  parseFrequencyShorthand,
  parseRawPrescriptionLine,
  checkInteractionsAndAllergies,
  buildDailySchedule,
  calculateAdherenceSummary
} from './drugMatcher.ts';

test('levenshteinDistance and similarity compute expected OCR typo scores', () => {
  assert.equal(levenshteinDistance('Amoxicillin', 'Amoxcillin'), 1);
  assert.equal(calculateStringSimilarity('Paracetamol', 'Paracetamol'), 100);
  const sim = calculateStringSimilarity('Metfromin', 'Metformin');
  assert.ok(sim >= 75, `Expected similarity >= 75, got ${sim}`);
});

test('matchMedicineToDatabase corrects noisy OCR medicine names using fuzzy matching', () => {
  const m1 = matchMedicineToDatabase('Cap Amoxcillin 500mg');
  assert.ok(m1.drug);
  assert.equal(m1.drug.genericName, 'Amoxicillin');
  assert.ok(m1.confidenceScore >= 85);

  const m2 = matchMedicineToDatabase('Tab Metfromin 500mg');
  assert.ok(m2.drug);
  assert.equal(m2.drug.genericName, 'Metformin');

  const m3 = matchMedicineToDatabase('Tab Brufn 400mg');
  assert.ok(m3.drug);
  assert.equal(m3.drug.genericName, 'Ibuprofen');
  assert.equal(m3.needsReview, true, 'Truncated sloppy OCR brand "Brufn" should flag needsReview');
});

test('parseFrequencyShorthand translates 1-0-1, 1-1-1, and 0-0-1 into plain language and time slots', () => {
  const f1 = parseFrequencyShorthand('Tab Metformin 500mg 1-0-1 x 30 days');
  assert.equal(f1.frequencyCode, '1-0-1');
  assert.deepEqual(f1.timeSlots, ['Morning', 'Night']);
  assert.match(f1.frequencyPlain, /Twice a day/i);

  const f2 = parseFrequencyShorthand('Cap Amoxicillin 500mg 1-1-1 x 5 days');
  assert.deepEqual(f2.timeSlots, ['Morning', 'Afternoon', 'Night']);

  const f3 = parseFrequencyShorthand('Tab Atorvastatin 10mg 0-0-1 night');
  assert.deepEqual(f3.timeSlots, ['Night']);
});

test('parseRawPrescriptionLine extracts dose, food instruction, and flags SOS/low-confidence lines', () => {
  const item1 = parseRawPrescriptionLine('Tab Pan40 40mg 1-0-0 x 5 days empty stomach', 0);
  assert.equal(item1.verifiedName, 'Pantoprazole');
  assert.equal(item1.dosage, '40mg');
  assert.equal(item1.foodInstruction, 'Empty stomach (30 mins before breakfast)');
  assert.equal(item1.needsUserReview, false);

  const item2 = parseRawPrescriptionLine('Tab Brufn 400mg SOS pain after food', 1);
  assert.equal(item2.verifiedName, 'Ibuprofen');
  assert.equal(item2.needsUserReview, true);
});

test('checkInteractionsAndAllergies detects drug-drug interactions and allergy conflicts', () => {
  const medTelma = parseRawPrescriptionLine('Tab Telma40 40mg 1-0-0 x 30 days', 0);
  const medBrufen = parseRawPrescriptionLine('Tab Brufn 400mg 1-0-1 x 5 days', 1);
  const medAmox = parseRawPrescriptionLine('Cap Amoxcillin 500mg 1-1-1 x 5 days', 2);

  const alerts = checkInteractionsAndAllergies([medTelma, medBrufen, medAmox], ['Penicillin']);
  assert.ok(alerts.some((a) => a.type === 'allergy' && a.involvedMedicines.includes('Amoxicillin')));
  assert.ok(
    alerts.some(
      (a) =>
        a.type === 'interaction' &&
        a.involvedMedicines.includes('Telmisartan') &&
        a.involvedMedicines.includes('Ibuprofen')
    )
  );
});

test('buildDailySchedule and calculateAdherenceSummary create time-sorted slots and compute adherence', () => {
  const med1 = parseRawPrescriptionLine('Tab Metfromin 500mg 1-0-1 x 30 days', 0);
  const med2 = parseRawPrescriptionLine('Tab Pan40 40mg 1-0-0 x 5 days empty stomach', 1);

  const schedule = buildDailySchedule([med1, med2], {
    [`${med1.id}-Morning`]: { status: 'taken', takenAt: '08:05 AM' }
  });

  // med1 has Morning + Night (2 slots), med2 has Morning (1 slot) = 3 total slots
  assert.equal(schedule.length, 3);
  const summary = calculateAdherenceSummary(schedule);
  assert.equal(summary.total, 3);
  assert.equal(summary.taken, 1);
  assert.equal(summary.percentage, 33);
});

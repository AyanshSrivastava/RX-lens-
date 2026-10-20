import { DRUG_DATABASE, type DrugRecord } from '../data/drugDatabase.ts';

export type TimeSlot = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

export interface VerifiedMedicineItem {
  id: string;
  rawOcrLine: string;
  extractedName: string;
  matchedDrugId: string | null;
  verifiedName: string;
  brandExample: string;
  category: string;
  dosage: string;
  frequencyCode: string;
  frequencyPlain: string;
  timeSlots: TimeSlot[];
  duration: string;
  foodInstruction: string;
  plainPurpose: string;
  howToTake: string;
  cautions: string[];
  confidenceScore: number; // 0 to 100
  needsUserReview: boolean;
  userVerified: boolean;
  matchMethod: 'Exact Generic/Brand' | 'Fuzzy OCR Correction' | 'Manual Override' | 'Unmatched OCR';
  ocrCorrectionNote: string;
  allergyGroup: string;
  interactsWithGenerics: string[];
  interactionNote?: string;
}

export interface SafetyAlert {
  id: string;
  severity: 'critical' | 'warning';
  type: 'allergy' | 'interaction' | 'low-confidence';
  title: string;
  explanation: string;
  involvedMedicines: string[];
}

export interface ScheduledDoseItem {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  slot: TimeSlot;
  clockTime: string;
  foodInstruction: string;
  plainPurpose: string;
  status: 'pending' | 'taken' | 'skipped';
  takenAt?: string;
}

/**
 * Computes standard Levenshtein edit distance between two strings (case-insensitive)
 */
export function levenshteinDistance(a: string, b: string): number {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (s1 === s2) return 0;
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[s2.length][s1.length];
}

/**
 * Returns similarity percentage (0-100) between two strings
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  const clean1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const clean2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!clean1 || !clean2) return 0;
  if (clean1 === clean2) return 100;

  const maxLen = Math.max(clean1.length, clean2.length);
  const dist = levenshteinDistance(clean1, clean2);
  return Math.max(0, Math.round(((maxLen - dist) / maxLen) * 100));
}

export interface DrugMatchResult {
  drug: DrugRecord | null;
  confidenceScore: number;
  needsReview: boolean;
  matchMethod: VerifiedMedicineItem['matchMethod'];
  correctionNote: string;
}

/**
 * Matches a noisy OCR medicine name against the public drug database.
 * Fixes OCR spelling errors and flags low-confidence (<82%) matches for user review.
 */
export function matchMedicineToDatabase(rawOcrName: string): DrugMatchResult {
  const cleanedInput = rawOcrName
    .replace(/^(tab\.?|cap\.?|syp\.?|inj\.?|tablet|capsule|syrup)\s+/i, '')
    .replace(/\b\d+\s*(mg|mcg|g|ml|iu|k)\b/gi, '')
    .trim();

  if (!cleanedInput) {
    return {
      drug: null,
      confidenceScore: 0,
      needsReview: true,
      matchMethod: 'Unmatched OCR',
      correctionNote: 'No readable medicine name detected.'
    };
  }

  let bestDrug: DrugRecord | null = null;
  let bestScore = 0;
  let matchedTerm = '';
  let exactMatch = false;

  const strippedDoseNumber = cleanedInput.replace(/[-–]?\d+$/, '').trim();

  for (const record of DRUG_DATABASE) {
    const primaryGeneric = record.genericName.split('(')[0].trim();
    const candidates = [
      { term: primaryGeneric, boost: 4 },
      { term: record.genericName, boost: 4 },
      ...record.brandNames.map((b) => ({ term: b, boost: 3 })),
      ...record.commonOcrMisspellings.map((m) => ({ term: m, boost: 0 }))
    ];

    for (const candidate of candidates) {
      const rawSim = calculateStringSimilarity(cleanedInput, candidate.term);
      const baseBrandSim = strippedDoseNumber
        ? calculateStringSimilarity(strippedDoseNumber, candidate.term)
        : 0;
      const fullSim = calculateStringSimilarity(
        rawOcrName.replace(/^(tab\.?|cap\.?)\s+/i, '').trim(),
        candidate.term
      );
      const sim = Math.max(rawSim, baseBrandSim, fullSim);

      if (sim === 100 && candidate.boost > 0) {
        return {
          drug: record,
          confidenceScore: rawSim === 100 ? 98 : 94,
          needsReview: false,
          matchMethod: 'Exact Generic/Brand',
          correctionNote: `Verified match for "${candidate.term}" → ${record.genericName}`
        };
      }

      // If it matches a known OCR misspelling or fuzzy match, compute clinical confidence
      let effectiveScore = sim;
      if (sim === 100 && candidate.boost === 0) {
        const editSimToGeneric = calculateStringSimilarity(cleanedInput, primaryGeneric);
        const editSimToBrand = Math.max(
          ...record.brandNames.map((b) =>
            Math.max(
              calculateStringSimilarity(cleanedInput, b),
              strippedDoseNumber ? calculateStringSimilarity(strippedDoseNumber, b) : 0
            )
          )
        );
        const trueSim = Math.max(editSimToGeneric, editSimToBrand);
        // Short abbreviated noisy brand names (<= 6 chars like "Brufn" or "Emset") get 76% so user reviews them
        effectiveScore =
          cleanedInput.length <= 6 && trueSim < 95
            ? Math.min(76, trueSim)
            : trueSim >= 85
            ? 91
            : Math.max(84, trueSim);
      } else if (sim < 100 && cleanedInput.length <= 6) {
        effectiveScore = Math.min(76, sim);
      }

      if (effectiveScore > bestScore) {
        bestScore = effectiveScore;
        bestDrug = record;
        matchedTerm = candidate.term;
        exactMatch = sim === 100 && candidate.boost > 0;
      }
    }
  }

  if (!bestDrug || bestScore < 55) {
    return {
      drug: null,
      confidenceScore: Math.min(48, bestScore),
      needsReview: true,
      matchMethod: 'Unmatched OCR',
      correctionNote: `Could not verify "${cleanedInput}" in drug dataset. Please review and edit.`
    };
  }

  const needsReview = bestScore < 82;
  const primaryGeneric = bestDrug.genericName.split('(')[0].trim();

  return {
    drug: bestDrug,
    confidenceScore: bestScore,
    needsReview,
    matchMethod: exactMatch ? 'Exact Generic/Brand' : 'Fuzzy OCR Correction',
    correctionNote:
      cleanedInput.toLowerCase() === primaryGeneric.toLowerCase()
        ? `Verified against ${bestDrug.genericName}`
        : `Corrected OCR "${cleanedInput}" → ${bestDrug.genericName} (via ${matchedTerm}, ${bestScore}% confidence)`
  };
}

/**
 * Parses medical frequency shorthand (e.g. "1-0-1", "1-1-1", "0-0-1", "BD", "OD", "TDS", "SOS")
 * into human-friendly plain English and daily time slots.
 */
export function parseFrequencyShorthand(rawLine: string): {
  frequencyCode: string;
  frequencyPlain: string;
  timeSlots: TimeSlot[];
} {
  const line = rawLine.trim();

  // Check 1-0-1 style patterns
  const tripletMatch = line.match(/\b([01])\s*[-–/]\s*([01])\s*[-–/]\s*([01])\b/);
  if (tripletMatch) {
    const m = tripletMatch[1] === '1';
    const a = tripletMatch[2] === '1';
    const n = tripletMatch[3] === '1';
    const code = `${tripletMatch[1]}-${tripletMatch[2]}-${tripletMatch[3]}`;
    const slots: TimeSlot[] = [];
    if (m) slots.push('Morning');
    if (a) slots.push('Afternoon');
    if (n) slots.push('Night');

    if (slots.length === 3) {
      return {
        frequencyCode: code,
        frequencyPlain: 'Three times a day (Morning, Afternoon, Night)',
        timeSlots: slots
      };
    }
    if (m && n && !a) {
      return {
        frequencyCode: code,
        frequencyPlain: 'Twice a day (Morning and Night)',
        timeSlots: slots
      };
    }
    if (m && !a && !n) {
      return {
        frequencyCode: code,
        frequencyPlain: 'Once every morning',
        timeSlots: ['Morning']
      };
    }
    if (!m && !a && n) {
      return {
        frequencyCode: code,
        frequencyPlain: 'Once every night at bedtime',
        timeSlots: ['Night']
      };
    }
    if (!m && a && !n) {
      return {
        frequencyCode: code,
        frequencyPlain: 'Once every afternoon',
        timeSlots: ['Afternoon']
      };
    }
    return {
      frequencyCode: code,
      frequencyPlain: `${slots.join(' and ')} daily`,
      timeSlots: slots.length ? slots : ['Morning']
    };
  }

  if (/\b(tds|tid|thrice)\b/i.test(line)) {
    return {
      frequencyCode: '1-1-1 (TDS)',
      frequencyPlain: 'Three times a day (Morning, Afternoon, Night)',
      timeSlots: ['Morning', 'Afternoon', 'Night']
    };
  }

  if (/\b(bd|bid|twice)\b/i.test(line)) {
    return {
      frequencyCode: '1-0-1 (BD)',
      frequencyPlain: 'Twice a day (Morning and Night)',
      timeSlots: ['Morning', 'Night']
    };
  }

  if (/\b(sos|as needed|if pain)\b/i.test(line)) {
    return {
      frequencyCode: 'SOS (As needed)',
      frequencyPlain: 'Only when needed for symptoms (Morning / Night check)',
      timeSlots: ['Morning', 'Night']
    };
  }

  if (/\b(weekly|once a week)\b/i.test(line)) {
    return {
      frequencyCode: 'Once Weekly',
      frequencyPlain: 'Once a week on the same day',
      timeSlots: ['Morning']
    };
  }

  if (/\b(night|bedtime|hs)\b/i.test(line)) {
    return {
      frequencyCode: '0-0-1 (HS)',
      frequencyPlain: 'Once every night at bedtime',
      timeSlots: ['Night']
    };
  }

  return {
    frequencyCode: '1-0-0 (OD)',
    frequencyPlain: 'Once daily in the morning',
    timeSlots: ['Morning']
  };
}

/**
 * Parses a full raw OCR prescription line into a VerifiedMedicineItem
 */
export function parseRawPrescriptionLine(rawLine: string, index = 0): VerifiedMedicineItem {
  const cleanLine = rawLine.trim();

  // Extract dosage (e.g. 500mg, 650 mg, 40mg, 60,000 IU)
  const doseMatch = cleanLine.match(/\b(\d[\d,]*\s*(?:mg|mcg|g|ml|iu|k))\b/i);
  const extractedDosage = doseMatch ? doseMatch[1].replace(/\s+/g, ' ').trim() : '';

  // Extract duration (e.g. x 5 days, for 30 days, x 4 weeks)
  const durationMatch = cleanLine.match(/(?:x|×|for)\s*(\d+\s*(?:days?|weeks?|months?))/i);
  const extractedDuration = durationMatch ? durationMatch[1] : '5 days';

  // Extract medicine name token (before dosage or frequency)
  const nameSegment = cleanLine
    .replace(/^(tab\.?|cap\.?|syp\.?|inj\.?|tablet|capsule|syrup)\s+/i, '')
    .split(/\b(?:\d[\d,]*\s*(?:mg|mcg|ml|iu)|[01]-[01]-[01]|x\s*\d+|after|before|empty|morning|night|sos)\b/i)[0]
    .trim();

  const candidateForMatching = nameSegment || cleanLine;
  const matchResult = matchMedicineToDatabase(
    extractedDosage ? `${candidateForMatching} ${extractedDosage}` : candidateForMatching
  );

  const freq = parseFrequencyShorthand(cleanLine);
  const drug = matchResult.drug;

  let foodInstruction: string = drug?.foodInstruction || 'After food';
  if (/empty stomach|before breakfast/i.test(cleanLine)) {
    foodInstruction = 'Empty stomach (30 mins before breakfast)';
  } else if (/before food|before meal/i.test(cleanLine)) {
    foodInstruction = 'Before food';
  } else if (/after food|after meal/i.test(cleanLine)) {
    foodInstruction = 'After food';
  }

  const finalDosage = extractedDosage || (drug ? drug.standardDosages[0] : '1 Tablet');
  const isSosOrUnclear = /\bsos\b|\?/i.test(cleanLine);
  const finalConfidence = isSosOrUnclear
    ? Math.min(matchResult.confidenceScore, 76)
    : matchResult.confidenceScore;
  const needsUserReview = matchResult.needsReview || isSosOrUnclear;

  return {
    id: `med-${index}-${Date.now()}`,
    rawOcrLine: cleanLine,
    extractedName: candidateForMatching || cleanLine,
    matchedDrugId: drug ? drug.id : null,
    verifiedName: drug ? drug.genericName : candidateForMatching || 'Unverified Medicine',
    brandExample: drug ? drug.brandNames.slice(0, 2).join(' / ') : 'Unknown Brand',
    category: drug ? drug.category : 'Requires Pharmacist Verification',
    dosage: finalDosage,
    frequencyCode: freq.frequencyCode,
    frequencyPlain: freq.frequencyPlain,
    timeSlots: freq.timeSlots,
    duration: extractedDuration,
    foodInstruction,
    plainPurpose: drug
      ? drug.plainPurpose
      : 'This medicine name was unclear in the photo. Please verify the spelling against your physical prescription strip.',
    howToTake: drug
      ? drug.howToTake
      : 'Confirm the exact dose and timing with your doctor or pharmacist before taking.',
    cautions: drug
      ? drug.cautions
      : ['Low OCR confidence—do not take until verified by a healthcare professional or caregiver.'],
    confidenceScore: finalConfidence,
    needsUserReview,
    userVerified: false,
    matchMethod: matchResult.matchMethod,
    ocrCorrectionNote: isSosOrUnclear
      ? `${matchResult.correctionNote} · Flagged because timing/SOS or spelling needs confirmation`
      : matchResult.correctionNote,
    allergyGroup: drug ? drug.allergyGroup : 'Unknown',
    interactsWithGenerics: drug ? drug.interactsWithGenerics : [],
    interactionNote: drug?.interactionNote
  };
}

/**
 * Evaluates a list of verified medicines against patient allergies and cross-drug interactions
 */
export function checkInteractionsAndAllergies(
  medicines: VerifiedMedicineItem[],
  patientAllergies: string[]
): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];
  const normalizedAllergies = patientAllergies.map((a) => a.toLowerCase().trim());

  // 1. Check Low-Confidence unreviewed items
  for (const med of medicines) {
    if (med.needsUserReview && !med.userVerified) {
      alerts.push({
        id: `alert-conf-${med.id}`,
        severity: 'warning',
        type: 'low-confidence',
        title: `Review Recommended: ${med.verifiedName} (${med.confidenceScore}% OCR Confidence)`,
        explanation: `Handwriting or dose shorthand ("${med.rawOcrLine}") had lower clarity. Please confirm the name and timing before starting reminders.`,
        involvedMedicines: [med.verifiedName]
      });
    }
  }

  // 2. Check Patient Allergies
  for (const med of medicines) {
    if (!med.allergyGroup || med.allergyGroup === 'None' || med.allergyGroup === 'Unknown') continue;
    const medAllergyLower = med.allergyGroup.toLowerCase();
    const medNameLower = med.verifiedName.toLowerCase();

    const matchedAllergy = normalizedAllergies.find(
      (allergy) =>
        allergy &&
        (medAllergyLower.includes(allergy) ||
          allergy.includes(medAllergyLower) ||
          medNameLower.includes(allergy))
    );

    if (matchedAllergy) {
      alerts.push({
        id: `alert-allergy-${med.id}`,
        severity: 'critical',
        type: 'allergy',
        title: `Allergy Warning: ${med.verifiedName} matches "${matchedAllergy}"`,
        explanation: `This patient's profile lists an allergy to ${matchedAllergy} (${med.allergyGroup} group). Contact the prescribing doctor before giving this medicine.`,
        involvedMedicines: [med.verifiedName]
      });
    }
  }

  // 3. Check Drug-Drug Interactions
  const seenPairs = new Set<string>();
  for (let i = 0; i < medicines.length; i++) {
    for (let j = i + 1; j < medicines.length; j++) {
      const medA = medicines[i];
      const medB = medicines[j];
      const primaryA = medA.verifiedName.split('(')[0].trim().toLowerCase();
      const primaryB = medB.verifiedName.split('(')[0].trim().toLowerCase();

      const aInteractsWithB = medA.interactsWithGenerics.some((g) =>
        primaryB.includes(g.toLowerCase())
      );
      const bInteractsWithA = medB.interactsWithGenerics.some((g) =>
        primaryA.includes(g.toLowerCase())
      );

      if (aInteractsWithB || bInteractsWithA) {
        const pairKey = [primaryA, primaryB].sort().join('::');
        if (!seenPairs.has(pairKey)) {
          seenPairs.add(pairKey);
          alerts.push({
            id: `alert-inter-${pairKey}`,
            severity: 'warning',
            type: 'interaction',
            title: `Combination Note: ${medA.verifiedName.split('(')[0].trim()} + ${medB.verifiedName.split('(')[0].trim()}`,
            explanation:
              medA.interactionNote ||
              medB.interactionNote ||
              `These two medicines can interact. Follow meal timing instructions carefully and watch for side effects.`,
            involvedMedicines: [medA.verifiedName, medB.verifiedName]
          });
        }
      }
    }
  }

  return alerts;
}

const SLOT_CLOCK_DEFAULTS: Record<TimeSlot, string> = {
  Morning: '08:00 AM',
  Afternoon: '01:30 PM',
  Evening: '06:00 PM',
  Night: '09:00 PM'
};

/**
 * Builds a structured daily schedule across Morning, Afternoon, Evening, and Night
 */
export function buildDailySchedule(
  medicines: VerifiedMedicineItem[],
  existingStatuses: Record<string, { status: 'pending' | 'taken' | 'skipped'; takenAt?: string }> = {}
): ScheduledDoseItem[] {
  const schedule: ScheduledDoseItem[] = [];
  const slotOrder: TimeSlot[] = ['Morning', 'Afternoon', 'Evening', 'Night'];

  for (const slot of slotOrder) {
    for (const med of medicines) {
      if (med.timeSlots.includes(slot)) {
        const scheduleId = `${med.id}-${slot}`;
        const saved = existingStatuses[scheduleId];
        let clockTime = SLOT_CLOCK_DEFAULTS[slot];
        if (slot === 'Morning' && med.foodInstruction.includes('Empty stomach')) {
          clockTime = '07:30 AM';
        }
        schedule.push({
          id: scheduleId,
          medicineId: med.id,
          medicineName: med.verifiedName,
          dosage: med.dosage,
          slot,
          clockTime,
          foodInstruction: med.foodInstruction,
          plainPurpose: med.plainPurpose,
          status: saved?.status || 'pending',
          takenAt: saved?.takenAt
        });
      }
    }
  }

  return schedule;
}

export function calculateAdherenceSummary(schedule: ScheduledDoseItem[]): {
  total: number;
  taken: number;
  skipped: number;
  pending: number;
  percentage: number;
} {
  const total = schedule.length;
  if (total === 0) {
    return { total: 0, taken: 0, skipped: 0, pending: 0, percentage: 100 };
  }
  const taken = schedule.filter((s) => s.status === 'taken').length;
  const skipped = schedule.filter((s) => s.status === 'skipped').length;
  const pending = total - taken - skipped;
  const percentage = Math.round((taken / total) * 100);
  return { total, taken, skipped, pending, percentage };
}

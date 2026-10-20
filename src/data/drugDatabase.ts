export interface DrugRecord {
  id: string;
  genericName: string;
  brandNames: string[];
  commonOcrMisspellings: string[];
  category: string;
  standardDosages: string[];
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Inhaler' | 'Injection' | 'Drops';
  plainPurpose: string;
  howToTake: string;
  foodInstruction: 'Before food' | 'After food' | 'With or without food' | 'Empty stomach (30 mins before breakfast)';
  cautions: string[];
  allergyGroup: string;
  interactsWithGenerics: string[];
  interactionNote?: string;
}

export const DRUG_DATABASE: DrugRecord[] = [
  {
    id: 'drug-amoxicillin',
    genericName: 'Amoxicillin',
    brandNames: ['Mox', 'Novamox', 'Amoxil', 'Cipmox', 'Almox'],
    commonOcrMisspellings: ['Amoxcillin', 'Amoxicilin', 'Amoxilin', 'Novamx', 'Mox 500', 'Amoxyclav'],
    category: 'Antibiotic (Penicillin)',
    standardDosages: ['250 mg', '500 mg'],
    form: 'Capsule',
    plainPurpose: 'Treats bacterial infections in the throat, ears, lungs, or urinary tract.',
    howToTake: 'Swallow whole with a full glass of water at evenly spaced times during the day. Finish the full course even if you feel better.',
    foodInstruction: 'After food',
    cautions: [
      'Do not stop early even if symptoms clear up, or the infection may return.',
      'Avoid if you have ever had a rash or swelling from penicillin antibiotics.',
      'May cause mild stomach upset or loose stools.'
    ],
    allergyGroup: 'Penicillin',
    interactsWithGenerics: ['Methotrexate', 'Warfarin', 'Allopurinol'],
    interactionNote: 'Can increase bleeding risk when taken alongside blood thinners like Warfarin.'
  },
  {
    id: 'drug-paracetamol',
    genericName: 'Paracetamol (Acetaminophen)',
    brandNames: ['Dolo 650', 'Crocin', 'Calpol', 'Pacimol', 'Pyrigesic', 'Tylenol'],
    commonOcrMisspellings: ['Paracetmol', 'Parcetamol', 'Dolo650', 'Dlo 650', 'Crocn', 'Calpl', 'Acetaminofen'],
    category: 'Pain Reliever & Fever Reducer',
    standardDosages: ['500 mg', '650 mg'],
    form: 'Tablet',
    plainPurpose: 'Lowers fever and relieves mild-to-moderate body ache, headache, or toothache.',
    howToTake: 'Take with water after a light meal. Wait at least 4 to 6 hours between two doses.',
    foodInstruction: 'After food',
    cautions: [
      'Never take more than 4 tablets (or 4,000 mg total) in 24 hours to protect your liver.',
      'Check other cold or flu medicines to make sure they do not also contain Paracetamol.',
      'Avoid alcohol while taking this medicine.'
    ],
    allergyGroup: 'Acetaminophen',
    interactsWithGenerics: ['Warfarin', 'Isoniazid', 'Carbamazepine'],
    interactionNote: 'High daily doses over several days can increase the effect of Warfarin.'
  },
  {
    id: 'drug-pantoprazole',
    genericName: 'Pantoprazole',
    brandNames: ['Pan 40', 'Pantocid', 'Pantodac', 'Pan-D', 'Protonix'],
    commonOcrMisspellings: ['Pantoprazol', 'Pantaprazole', 'Pan40', 'Pantcid', 'Panto 40', 'Pn 40'],
    category: 'Stomach Acid Reducer (PPI)',
    standardDosages: ['20 mg', '40 mg'],
    form: 'Tablet',
    plainPurpose: 'Reduces stomach acid to treat heartburn, acid reflux, and protect the stomach from ulcers.',
    howToTake: 'Swallow the tablet whole 30 minutes before your morning meal. Do not crush or chew it.',
    foodInstruction: 'Empty stomach (30 mins before breakfast)',
    cautions: [
      'Best taken first thing in the morning before eating.',
      'Tell your doctor if you experience persistent diarrhea or severe stomach pain.'
    ],
    allergyGroup: 'Proton Pump Inhibitor',
    interactsWithGenerics: ['Clopidogrel', 'Iron Supplements', 'Ketoconazole'],
    interactionNote: 'May slightly reduce how well stomach-acid-dependent medicines or iron supplements absorb.'
  },
  {
    id: 'drug-metformin',
    genericName: 'Metformin',
    brandNames: ['Glycomet', 'Glucophage', 'Cetapin', 'Okamet', 'Metsmall'],
    commonOcrMisspellings: ['Metfromin', 'Metfomin', 'Glycmet', 'Glycomet GP', 'Glucofage', 'Metformn'],
    category: 'Blood Sugar Lowering (Antidiabetic)',
    standardDosages: ['500 mg', '850 mg', '1000 mg'],
    form: 'Tablet',
    plainPurpose: 'Controls high blood sugar in Type 2 diabetes by helping your body respond better to insulin.',
    howToTake: 'Take during or immediately after a meal to reduce stomach upset.',
    foodInstruction: 'After food',
    cautions: [
      'Always take with food to avoid nausea or stomach cramps.',
      'Do not skip meals while taking diabetes medication.',
      'Avoid heavy alcohol consumption, which increases the risk of lactic acidosis.'
    ],
    allergyGroup: 'Biguanides',
    interactsWithGenerics: ['Glimepiride', 'Furosemide', 'Cimetidine'],
    interactionNote: 'When combined with Glimepiride, monitor closely for signs of low blood sugar (dizziness, sweating).'
  },
  {
    id: 'drug-amlodipine',
    genericName: 'Amlodipine',
    brandNames: ['Amlong', 'Stamlo', 'Amlopres', 'Amlokind', 'Norvasc'],
    commonOcrMisspellings: ['Amlodpine', 'Amlodipin', 'Stmlo', 'Amlng', 'Amloprs'],
    category: 'Blood Pressure Lowering (Calcium Channel Blocker)',
    standardDosages: ['2.5 mg', '5 mg', '10 mg'],
    form: 'Tablet',
    plainPurpose: 'Relaxes blood vessels to lower high blood pressure and reduce strain on the heart.',
    howToTake: 'Take once daily at the same time each day, with or without food.',
    foodInstruction: 'With or without food',
    cautions: [
      'Stand up slowly from sitting or lying down to avoid feeling lightheaded.',
      'Notify your doctor if you notice swelling around your ankles or feet.',
      'Do not stop taking blood pressure tablets suddenly without consulting your doctor.'
    ],
    allergyGroup: 'Dihydropyridines',
    interactsWithGenerics: ['Simvastatin', 'Atorvastatin', 'Telmisartan'],
    interactionNote: 'Combining with Telmisartan provides stronger blood pressure control; stand up slowly to prevent dizziness.'
  },
  {
    id: 'drug-atorvastatin',
    genericName: 'Atorvastatin',
    brandNames: ['Atorva', 'Lipitor', 'Storvas', 'Tonact', 'Atocor'],
    commonOcrMisspellings: ['Atorvastin', 'Atorvastatn', 'Atorv 10', 'Storvs', 'Lipitr'],
    category: 'Cholesterol Lowering (Statin)',
    standardDosages: ['10 mg', '20 mg', '40 mg'],
    form: 'Tablet',
    plainPurpose: 'Lowers bad cholesterol (LDL) and triglycerides in the blood to help prevent heart disease and stroke.',
    howToTake: 'Usually taken once a day in the evening or at bedtime with water.',
    foodInstruction: 'With or without food',
    cautions: [
      'Report any unexplained muscle pain, tenderness, or weakness to your doctor.',
      'Avoid large amounts of grapefruit juice while on this medication.',
      'Do not take during pregnancy or breastfeeding.'
    ],
    allergyGroup: 'Statins',
    interactsWithGenerics: ['Clarithromycin', 'Azithromycin', 'Amlodipine', 'Warfarin'],
    interactionNote: 'Certain antibiotics can raise statin levels in the blood and increase muscle ache risk.'
  },
  {
    id: 'drug-azithromycin',
    genericName: 'Azithromycin',
    brandNames: ['Azee 500', 'Azithral', 'Zithromax', 'Azicip', 'Azax'],
    commonOcrMisspellings: ['Azithromicin', 'Azithromycn', 'Azee500', 'Azithrl', 'Azicip 500', 'Azthro'],
    category: 'Antibiotic (Macrolide)',
    standardDosages: ['250 mg', '500 mg'],
    form: 'Tablet',
    plainPurpose: 'Treats chest, nose, throat, and skin bacterial infections.',
    howToTake: 'Take once daily at the same time each day for the prescribed 3 or 5 days.',
    foodInstruction: 'With or without food',
    cautions: [
      'Complete the full 3-day or 5-day course even if fever subsides early.',
      'Do not take aluminum or magnesium antacids within 2 hours of this tablet.',
      'Seek care if you notice fast or irregular heartbeat.'
    ],
    allergyGroup: 'Macrolides',
    interactsWithGenerics: ['Atorvastatin', 'Ondansetron', 'Warfarin', 'Cetirizine'],
    interactionNote: 'May interact with Atorvastatin or Ondansetron; monitor for muscle soreness or dizziness.'
  },
  {
    id: 'drug-cetirizine',
    genericName: 'Cetirizine',
    brandNames: ['Cetzine', 'Okacet', 'Alerid', 'Zyrtec', 'Cetrizet'],
    commonOcrMisspellings: ['Cetrizine', 'Ceterizine', 'Okact', 'Alrid', 'Cetzne'],
    category: 'Anti-Allergy (Antihistamine)',
    standardDosages: ['5 mg', '10 mg'],
    form: 'Tablet',
    plainPurpose: 'Relieves runny nose, sneezing, watery eyes, itching, and skin allergies.',
    howToTake: 'Best taken in the evening or at bedtime because it can make you feel sleepy.',
    foodInstruction: 'With or without food',
    cautions: [
      'May cause drowsiness; avoid driving or operating machinery after taking it.',
      'Avoid alcohol, as it increases drowsiness.'
    ],
    allergyGroup: 'Antihistamines',
    interactsWithGenerics: ['Montelukast', 'Alprazolam'],
    interactionNote: 'Often prescribed intentionally with Montelukast for night-time allergy and breathing relief.'
  },
  {
    id: 'drug-ibuprofen',
    genericName: 'Ibuprofen',
    brandNames: ['Brufen', 'Ibugesic', 'Advil', 'Combiflam'],
    commonOcrMisspellings: ['Ibuprofn', 'Brufn', 'Ibugesc', 'Ibupofen'],
    category: 'Anti-Inflammatory Painkiller (NSAID)',
    standardDosages: ['200 mg', '400 mg'],
    form: 'Tablet',
    plainPurpose: 'Reduces joint pain, muscle swelling, dental pain, and fever.',
    howToTake: 'Always take right after food or with milk to protect your stomach lining.',
    foodInstruction: 'After food',
    cautions: [
      'Never take on an empty stomach—it can cause acidity or stomach ulcers.',
      'Avoid if you have kidney trouble, stomach ulcers, or aspirin-sensitive asthma.',
      'Do not combine with other NSAID painkillers like Diclofenac or Aspirin.'
    ],
    allergyGroup: 'NSAID / Aspirin',
    interactsWithGenerics: ['Aspirin', 'Telmisartan', 'Warfarin', 'Diclofenac'],
    interactionNote: 'Taking Ibuprofen with Aspirin or blood pressure drugs (Telmisartan) can irritate the stomach and reduce kidney protection.'
  },
  {
    id: 'drug-telmisartan',
    genericName: 'Telmisartan',
    brandNames: ['Telma', 'Telmikind', 'Tazloc', 'Cresar', 'Micardis'],
    commonOcrMisspellings: ['Telmisartn', 'Telma 40', 'Telma40', 'Tazlc', 'Telmiknd'],
    category: 'Blood Pressure Lowering (ARB)',
    standardDosages: ['20 mg', '40 mg', '80 mg'],
    form: 'Tablet',
    plainPurpose: 'Keeps blood pressure steady and protects the heart and kidneys.',
    howToTake: 'Take once daily at the same time every day with water.',
    foodInstruction: 'With or without food',
    cautions: [
      'May cause mild dizziness when standing up quickly during the first few days.',
      'Avoid potassium supplements or salt substitutes unless advised by your doctor.',
      'Must not be taken during pregnancy.'
    ],
    allergyGroup: 'ARBs',
    interactsWithGenerics: ['Ibuprofen', 'Amlodipine', 'Spironolactone'],
    interactionNote: 'Painkillers like Ibuprofen can weaken the blood-pressure-lowering effect of Telmisartan.'
  },
  {
    id: 'drug-glimepiride',
    genericName: 'Glimepiride',
    brandNames: ['Amaryl', 'Glimestar', 'Glimy', 'Zoryl', 'Azulix'],
    commonOcrMisspellings: ['Glimepride', 'Glimpiride', 'Amryl', 'Glimstar', 'Glimest'],
    category: 'Blood Sugar Lowering (Sulfonylurea)',
    standardDosages: ['1 mg', '2 mg'],
    form: 'Tablet',
    plainPurpose: 'Lowers blood sugar by helping your pancreas release natural insulin during meals.',
    howToTake: 'Take immediately before or with your first main meal of the day (breakfast).',
    foodInstruction: 'Before food',
    cautions: [
      'Eat your meal right after taking this tablet so your blood sugar does not drop too low.',
      'Keep a sweet candy or glucose packet handy in case you feel shaky, sweaty, or dizzy.',
      'Avoid if you have a known sulfa drug allergy.'
    ],
    allergyGroup: 'Sulfonamides (Sulfa)',
    interactsWithGenerics: ['Metformin', 'Aspirin', 'Fluconazole'],
    interactionNote: 'Taking alongside Metformin requires regular meals to prevent low blood sugar episodes.'
  },
  {
    id: 'drug-montelukast',
    genericName: 'Montelukast',
    brandNames: ['Montair', 'Montek', 'Singulair', 'Telekast', 'Romilast'],
    commonOcrMisspellings: ['Montelukst', 'Montair LC', 'Montk', 'Singulr', 'Telekst'],
    category: 'Asthma & Allergy Controller',
    standardDosages: ['5 mg', '10 mg'],
    form: 'Tablet',
    plainPurpose: 'Prevents wheezing, night-time cough, and seasonal nasal allergies by blocking airway swelling.',
    howToTake: 'Take once daily in the evening, with or without food.',
    foodInstruction: 'With or without food',
    cautions: [
      'This tablet prevents asthma symptoms over time; do not use it for sudden breathing attacks.',
      'Let your doctor know if you notice unusual mood changes or vivid dreams.'
    ],
    allergyGroup: 'Leukotriene Modifiers',
    interactsWithGenerics: ['Cetirizine', 'Phenobarbital'],
    interactionNote: 'Frequently paired with Cetirizine for comprehensive evening allergy relief.'
  },
  {
    id: 'drug-aspirin',
    genericName: 'Aspirin (Low-Dose)',
    brandNames: ['Ecosprin 75', 'Ecosprin 150', 'Disprin', 'Loprin'],
    commonOcrMisspellings: ['Ecosprn', 'Ecospirin', 'Ecosprin75', 'Asprin', 'Lopin'],
    category: 'Blood Thinner & Heart Protector (Antiplatelet)',
    standardDosages: ['75 mg', '150 mg'],
    form: 'Tablet',
    plainPurpose: 'Prevents blood clots from forming in arteries to reduce the risk of heart attack or stroke.',
    howToTake: 'Swallow whole with water after lunch or dinner to avoid stomach irritation.',
    foodInstruction: 'After food',
    cautions: [
      'Always take after food to protect your stomach.',
      'Watch for unusual bruising, bleeding gums, or dark stools.',
      'Inform your dentist or surgeon before any procedure.'
    ],
    allergyGroup: 'NSAID / Aspirin',
    interactsWithGenerics: ['Ibuprofen', 'Warfarin', 'Clopidogrel'],
    interactionNote: 'Combining Aspirin with Ibuprofen increases stomach bleeding risk and blocks Aspirin’s heart protection.'
  },
  {
    id: 'drug-ondansetron',
    genericName: 'Ondansetron',
    brandNames: ['Emeset', 'Ondem', 'Vomikind', 'Zofran', 'Zofer'],
    commonOcrMisspellings: ['Ondansetrn', 'Emset', 'Ondm 4', 'Vomiknd', 'Zofrn'],
    category: 'Anti-Nausea & Vomiting',
    standardDosages: ['4 mg', '8 mg'],
    form: 'Tablet',
    plainPurpose: 'Stops nausea and vomiting caused by stomach infections, motion sickness, or strong medicines.',
    howToTake: 'Take 30 minutes before meals or as needed when feeling nauseous.',
    foodInstruction: 'Before food',
    cautions: [
      'May cause mild headache or constipation.',
      'Dissolvable tablets can be placed on top of the tongue without water.'
    ],
    allergyGroup: '5-HT3 Antagonists',
    interactsWithGenerics: ['Azithromycin', 'Tramadol'],
    interactionNote: 'Use with caution alongside Azithromycin if you have a history of irregular heart rhythm.'
  },
  {
    id: 'drug-levothyroxine',
    genericName: 'Levothyroxine',
    brandNames: ['Thyronorm', 'Eltroxin', 'Thyrox', 'Synthroid'],
    commonOcrMisspellings: ['Levothyroxin', 'Thyronrm', 'Eltroxn', 'Thyrx 50'],
    category: 'Thyroid Hormone Replacement',
    standardDosages: ['25 mcg', '50 mcg', '75 mcg', '100 mcg'],
    form: 'Tablet',
    plainPurpose: 'Replaces natural thyroid hormone when your thyroid gland does not produce enough (hypothyroidism).',
    howToTake: 'Take first thing in the morning on an empty stomach, at least 30 to 60 minutes before breakfast or tea/coffee.',
    foodInstruction: 'Empty stomach (30 mins before breakfast)',
    cautions: [
      'Do not take calcium, iron, or antacids within 4 hours of this tablet, as they block absorption.',
      'Take consistently at the same time every morning.'
    ],
    allergyGroup: 'Thyroid Hormones',
    interactsWithGenerics: ['Calcium Carbonate', 'Iron Supplements', 'Pantoprazole'],
    interactionNote: 'Wait at least 4 hours before taking Calcium or Iron supplements so Levothyroxine absorbs properly.'
  },
  {
    id: 'drug-cholecalciferol',
    genericName: 'Vitamin D3 (Cholecalciferol)',
    brandNames: ['Uprise-D3', 'Calcirol', 'Arachitol', 'Tayo 60K', 'Depura'],
    commonOcrMisspellings: ['Uprise D3', 'Cholecalcferol', 'Calcirol 60k', 'Vit D3', 'Upris D3'],
    category: 'Vitamin & Bone Supplement',
    standardDosages: ['1000 IU', '60,000 IU'],
    form: 'Capsule',
    plainPurpose: 'Helps your body absorb calcium to keep bones, teeth, and muscles strong.',
    howToTake: 'Take with a main meal or a glass of milk so your body absorbs the fat-soluble vitamin effectively.',
    foodInstruction: 'After food',
    cautions: [
      '60,000 IU capsules are usually taken ONCE A WEEK, not every day—check your schedule carefully.',
      'Stay well hydrated.'
    ],
    allergyGroup: 'None',
    interactsWithGenerics: [],
  }
];

export interface SamplePrescription {
  id: string;
  title: string;
  clinicName: string;
  doctorName: string;
  patientName: string;
  patientAge: number;
  date: string;
  difficultyLabel: string;
  description: string;
  rawOcrLines: string[];
  handwritingLines: {
    rxSymbol?: boolean;
    lineText: string;
    subText: string;
    messiness: 'clean' | 'medium' | 'sloppy';
  }[];
}

export const SAMPLE_PRESCRIPTIONS: SamplePrescription[] = [
  {
    id: 'rx-cardio-metabolic',
    title: 'Sample 1: Elderly Diabetes & BP Follow-Up (Messy Handwriting + OCR Typos)',
    clinicName: 'Cauvery Community Health Clinic, Mysuru',
    doctorName: 'Dr. S. Narasimha Murthy, MD (Gen. Med)',
    patientName: 'Kamala Devi',
    patientAge: 68,
    date: '19 Oct 2026',
    difficultyLabel: 'Includes Low-Confidence OCR Flag + Interaction Check',
    description: 'Handwritten geriatric prescription with abbreviated timings (1-0-1, 0-0-1) and OCR spelling errors ("Metfromin", "Telma40", "Ecosprn", "Brufn") that trigger RxLens fuzzy correction and review.',
    rawOcrLines: [
      'Tab Metfromin 500mg 1-0-1 x 30 days after food',
      'Tab Telma40 40mg 1-0-0 x 30 days morning',
      'Tab Atorvastin 10mg 0-0-1 x 30 days night',
      'Tab Brufn 400mg SOS pain after food'
    ],
    handwritingLines: [
      { rxSymbol: true, lineText: 'Tab. Metfromin 500 mg', subText: '1 — 0 — 1  × 30 days (After food)', messiness: 'medium' },
      { lineText: 'Tab. Telma-40 (40mg)', subText: '1 — 0 — 0  × 30 days (Morning)', messiness: 'clean' },
      { lineText: 'Tab. Atorvastin 10mg', subText: '0 — 0 — 1  × 30 days (At bedtime)', messiness: 'sloppy' },
      { lineText: 'Tab. Brufn 400 mg', subText: '1 — 0 — 1  × 5 days (If joint pain, after meals)', messiness: 'sloppy' }
    ]
  },
  {
    id: 'rx-acute-infection',
    title: 'Sample 2: Acute Throat & Sinus Infection (Standard 5-Day Course)',
    clinicName: 'JSS Hospital Outpatient Department, Mysuru',
    doctorName: 'Dr. Ananya Rao, MBBS, DLO',
    patientName: 'Rajesh Kumar',
    patientAge: 42,
    date: '19 Oct 2026',
    difficultyLabel: 'Antibiotic + Fever + Acid Reflux Protection',
    description: 'Classic acute infection prescription demonstrating empty-stomach vs. after-food scheduling and penicillin allergy checking.',
    rawOcrLines: [
      'Cap Amoxcillin 500mg 1-1-1 x 5 days after food',
      'Tab Dolo650 650mg 1-0-1 x 3 days after food',
      'Tab Pan40 40mg 1-0-0 x 5 days empty stomach',
      'Tab Cetzne 10mg 0-0-1 x 5 days night'
    ],
    handwritingLines: [
      { rxSymbol: true, lineText: 'Cap. Amoxcillin 500mg', subText: '1 — 1 — 1  × 5 days (After meals)', messiness: 'medium' },
      { lineText: 'Tab. Dolo 650 mg', subText: '1 — 0 — 1  × 3 days (After food for fever)', messiness: 'clean' },
      { lineText: 'Tab. Pan-40 mg', subText: '1 — 0 — 0  × 5 days (30m before breakfast)', messiness: 'medium' },
      { lineText: 'Tab. Cetzne 10mg', subText: '0 — 0 — 1  × 5 days (Night)', messiness: 'clean' }
    ]
  },
  {
    id: 'rx-respiratory-gastric',
    title: 'Sample 3: Seasonal Asthma & Nausea Care (Multi-Timing Schedule)',
    clinicName: 'Saraswathipuram Family Care Center',
    doctorName: 'Dr. Vikram Hegde, MD (Pulmonology)',
    patientName: 'Lakshmiamma N.',
    patientAge: 74,
    date: '18 Oct 2026',
    difficultyLabel: 'Includes Azithromycin + Ondansetron Caution Check',
    description: 'Tests multi-drug interaction advisory between Azithromycin and Ondansetron alongside evening allergy controllers.',
    rawOcrLines: [
      'Tab Azee500 500mg 1-0-0 x 3 days after food',
      'Tab Montelukst 10mg 0-0-1 x 14 days night',
      'Tab Emset 4mg 1-0-1 x 3 days before food',
      'Cap Uprise D3 60,000 IU 1-0-0 x 4 weeks after food'
    ],
    handwritingLines: [
      { rxSymbol: true, lineText: 'Tab. Azee 500 mg', subText: '1 — 0 — 0  × 3 days (After lunch)', messiness: 'clean' },
      { lineText: 'Tab. Montelukst 10mg', subText: '0 — 0 — 1  × 14 days (Bedtime)', messiness: 'medium' },
      { lineText: 'Tab. Emset 4 mg', subText: '1 — 0 — 1  × 3 days (30m before food)', messiness: 'sloppy' },
      { lineText: 'Cap. Uprise-D3 60K', subText: 'Once weekly w/ milk × 4 weeks', messiness: 'medium' }
    ]
  }
];

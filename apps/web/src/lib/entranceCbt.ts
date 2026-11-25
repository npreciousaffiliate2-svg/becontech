export interface EntranceCbtQuestion {
  id: string;
  subject: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
}

export interface EntranceExamSuite {
  id: string;
  session: string;
  departmentCode: string; // 'ALL' for all departments, or specific code like 'CHE', 'MLT', 'PHT', 'HIM', 'EHT'
  examTitle: string;
  durationMinutes: number;
  cutoffScore: number;
  instructions: string;
  randomizeQuestions: boolean;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  questions: EntranceCbtQuestion[];
  createdAt: string;
}

export const ENTRANCE_CBT_SUBJECTS = [
  'Biology',
  'Health Science',
  'Chemistry',
  'Physics',
  'English Language',
  'Mathematics',
  'General Knowledge',
] as const;

export const DEFAULT_ENTRANCE_CBT_QUESTIONS: EntranceCbtQuestion[] = [
  {
    id: 'ent-q-01',
    subject: 'Biology',
    question: 'Which blood cells are primarily responsible for defending the body against infectious pathogens?',
    options: ['Erythrocytes', 'Leukocytes', 'Thrombocytes', 'Plasma cells only'],
    correctIndex: 1,
  },
  {
    id: 'ent-q-02',
    subject: 'Biology',
    question: 'The functional structural unit of the human kidney responsible for filtering blood is the:',
    options: ['Neuron', 'Alveolus', 'Nephron', 'Villus'],
    correctIndex: 2,
  },
  {
    id: 'ent-q-03',
    subject: 'Biology',
    question: 'Which blood vessel carries oxygenated blood from the lungs directly to the left atrium of the heart?',
    options: ['Pulmonary Artery', 'Pulmonary Vein', 'Superior Vena Cava', 'Aorta'],
    correctIndex: 1,
  },
  {
    id: 'ent-q-04',
    subject: 'Health Science',
    question: 'Which vector is responsible for transmitting the Plasmodium parasite that causes malaria?',
    options: ['Aedes aegypti mosquito', 'Female Anopheles mosquito', 'Tsetse fly', 'Housefly'],
    correctIndex: 1,
  },
  {
    id: 'ent-q-05',
    subject: 'Health Science',
    question: 'Oral Rehydration Solution (ORS) is primarily administered in community healthcare to treat:',
    options: ['Hypertension', 'Dehydration from acute diarrhoea', 'Fractures', 'Tuberculosis'],
    correctIndex: 1,
  },
  {
    id: 'ent-q-06',
    subject: 'Health Science',
    question: 'Under the Nigerian National Programme on Immunization (NPI), the BCG vaccine protects infants against:',
    options: ['Poliomyelitis', 'Tuberculosis', 'Yellow Fever', 'Measles'],
    correctIndex: 1,
  },
  {
    id: 'ent-q-07',
    subject: 'Chemistry',
    question: 'What is the approximate normal pH range of human arterial blood?',
    options: ['5.0 – 5.5', '6.0 – 6.5', '7.35 – 7.45', '8.2 – 8.8'],
    correctIndex: 2,
  },
  {
    id: 'ent-q-08',
    subject: 'Chemistry',
    question: 'Which chemical element has the symbol "Na" and is essential for nerve impulse transmission?',
    options: ['Nitrogen', 'Sodium', 'Neon', 'Nickel'],
    correctIndex: 1,
  },
  {
    id: 'ent-q-09',
    subject: 'Chemistry',
    question: 'Which gas is produced when dilute hydrochloric acid reacts with calcium carbonate?',
    options: ['Oxygen', 'Hydrogen', 'Carbon (IV) oxide', 'Chlorine'],
    correctIndex: 2,
  },
  {
    id: 'ent-q-10',
    subject: 'Physics',
    question: 'Which instrument is clinically used to measure a patient’s arterial blood pressure?',
    options: ['Thermometer', 'Sphygmomanometer', 'Spirometer', 'Hygrometer'],
    correctIndex: 1,
  },
  {
    id: 'ent-q-11',
    subject: 'Physics',
    question: 'What is the SI unit of electrical resistance?',
    options: ['Volt', 'Ampere', 'Ohm', 'Watt'],
    correctIndex: 2,
  },
  {
    id: 'ent-q-12',
    subject: 'English Language',
    question: 'Choose the word most nearly opposite in meaning to "CONCISE" in a clinical report:',
    options: ['Brief', 'Verbose', 'Accurate', 'Clear'],
    correctIndex: 1,
  },
  {
    id: 'ent-q-13',
    subject: 'English Language',
    question: 'Identify the correctly punctuated institutional sentence:',
    options: [
      'The patients vitals were recorded, promptly.',
      "The patient's vitals were recorded promptly.",
      'The patients’ vital was recorded promptly.',
      'The patient vitals were record promptly.',
    ],
    correctIndex: 1,
  },
  {
    id: 'ent-q-14',
    subject: 'Mathematics',
    question: 'A clinic prescribes 250 mg of a suspension twice daily for 5 days. What is the total dosage administered?',
    options: ['1,250 mg', '2,000 mg', '2,500 mg', '5,000 mg'],
    correctIndex: 2,
  },
  {
    id: 'ent-q-15',
    subject: 'Mathematics',
    question: 'If 18 out of 24 trainees passed a practical immunization assessment, what percentage passed?',
    options: ['65%', '70%', '75%', '80%'],
    correctIndex: 2,
  },
];

export const DEFAULT_ENTRANCE_EXAM_SUITES: EntranceExamSuite[] = [
  {
    id: 'suite-2026-2027-all',
    session: '2026/2027',
    departmentCode: 'ALL',
    examTitle: '2026/2027 General Health Technology Entrance CBT',
    durationMinutes: 20,
    cutoffScore: 50,
    instructions:
      'Answer all questions carefully within the allotted time. You have a single official screening attempt; once submitted, your score is immediately forwarded to the Admissions Office.',
    randomizeQuestions: true,
    status: 'ACTIVE',
    questions: DEFAULT_ENTRANCE_CBT_QUESTIONS,
    createdAt: '2026-09-01',
  },
];

export function normalizeSessionLabel(raw?: string): string {
  return String(raw || '2026/2027')
    .replace(/\s*Academic Session\s*/i, '')
    .trim();
}

export function resolveApplicantEntranceExam(
  suites: EntranceExamSuite[],
  activeSession?: string,
  candidateDepartment?: string,
  candidateProgrammeCode?: string
): EntranceExamSuite {
  const cleanSession = normalizeSessionLabel(activeSession);
  const deptUpper = String(candidateDepartment || '').trim().toUpperCase();
  const progUpper = String(candidateProgrammeCode || '').trim().toUpperCase();

  const matchesDept = (suite: EntranceExamSuite) => {
    const code = String(suite.departmentCode || '').trim().toUpperCase();
    if (!code || code === 'ALL') return false;
    return code === progUpper || code === deptUpper || deptUpper.includes(code);
  };

  const activeSuites = suites.filter((s) => s.status === 'ACTIVE' && (s.questions || []).length > 0);
  const pool = activeSuites.length > 0 ? activeSuites : suites.filter((s) => (s.questions || []).length > 0);

  // 1. Active suite for this exact admission session + specific department
  const exactSessionDept = pool.find(
    (s) => normalizeSessionLabel(s.session) === cleanSession && matchesDept(s)
  );
  if (exactSessionDept) return exactSessionDept;

  // 2. Active suite for this exact admission session + ALL departments
  const exactSessionAll = pool.find(
    (s) => normalizeSessionLabel(s.session) === cleanSession && String(s.departmentCode || 'ALL').toUpperCase() === 'ALL'
  );
  if (exactSessionAll) return exactSessionAll;

  // 3. Any active suite matching department
  const anyDept = pool.find((s) => matchesDept(s));
  if (anyDept) return anyDept;

  // 4. Any active ALL-departments suite
  const anyAll = pool.find((s) => String(s.departmentCode || 'ALL').toUpperCase() === 'ALL');
  if (anyAll) return anyAll;

  // 5. First available suite or default seed
  return pool[0] || DEFAULT_ENTRANCE_EXAM_SUITES[0];
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

export function parseImportedEntranceQuestions(raw: string): EntranceCbtQuestion[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  // JSON format support
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const arr = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.questions) ? parsed.questions : [];
      return arr
        .map((item: any, idx: number): EntranceCbtQuestion | null => {
          const question = String(item?.question || item?.questionText || '').trim();
          const options = Array.isArray(item?.options)
            ? item.options.map((o: any) => (typeof o === 'string' ? o.trim() : String(o?.text || '').trim()))
            : [item?.optionA, item?.optionB, item?.optionC, item?.optionD].map((o) => String(o || '').trim());
          if (!question || options.length < 4 || options.some((o: string) => !o)) return null;
          let correctIndex = 0;
          if (typeof item?.correctIndex === 'number') {
            correctIndex = Math.min(3, Math.max(0, item.correctIndex));
          } else {
            const letter = String(item?.correct || item?.correctOption || item?.answer || 'A').trim().toUpperCase();
            const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, '0': 0, '1': 1, '2': 2, '3': 3 };
            correctIndex = map[letter] ?? 0;
          }
          return {
            id: `imp-q-${Date.now()}-${idx}`,
            subject: String(item?.subject || 'General Knowledge').trim() || 'General Knowledge',
            question,
            options: [options[0], options[1], options[2], options[3]],
            correctIndex,
          };
        })
        .filter((x: EntranceCbtQuestion | null): x is EntranceCbtQuestion => x !== null);
    } catch {
      return [];
    }
  }

  // CSV format: Subject,Question,Option A,Option B,Option C,Option D,Correct (A-D)
  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const results: EntranceCbtQuestion[] = [];
  lines.forEach((line, idx) => {
    const cols = parseCsvLine(line);
    if (cols.length < 7) return;
    // Skip header row
    if (idx === 0 && cols[0].toLowerCase().includes('subject') && cols[1].toLowerCase().includes('question')) {
      return;
    }
    const [subject, question, optA, optB, optC, optD, correctRaw] = cols;
    if (!question || !optA || !optB || !optC || !optD) return;
    const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, '1': 0, '2': 1, '3': 2, '4': 3 };
    const correctIndex = map[String(correctRaw || 'A').trim().toUpperCase()] ?? 0;
    results.push({
      id: `imp-csv-${Date.now()}-${idx}`,
      subject: subject || 'General Knowledge',
      question,
      options: [optA, optB, optC, optD],
      correctIndex,
    });
  });

  return results;
}

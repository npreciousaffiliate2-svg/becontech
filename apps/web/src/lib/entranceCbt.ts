export interface EntranceCbtQuestion {
  id: string;
  subject: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
}

export interface EntranceCbtConfig {
  id: string;
  examTitle: string;
  durationMinutes: number;
  instructions: string;
  randomizeQuestions: boolean;
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

export const DEFAULT_ENTRANCE_CBT_CONFIG: EntranceCbtConfig = {
  id: 'default',
  examTitle: 'Online Entrance CBT Screening',
  durationMinutes: 15,
  instructions:
    'Answer all questions carefully within the allotted time. You have a single official screening attempt; once submitted, your score is immediately forwarded to the Admissions Office.',
  randomizeQuestions: true,
};

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
    subject: 'Health Science',
    question: 'Which vector is responsible for transmitting the Plasmodium parasite that causes malaria?',
    options: ['Aedes aegypti mosquito', 'Female Anopheles mosquito', 'Tsetse fly', 'Housefly'],
    correctIndex: 1,
  },
  {
    id: 'ent-q-04',
    subject: 'Health Science',
    question: 'Oral Rehydration Solution (ORS) is primarily administered in community healthcare to treat:',
    options: ['Hypertension', 'Dehydration from acute diarrhoea', 'Fractures', 'Tuberculosis'],
    correctIndex: 1,
  },
  {
    id: 'ent-q-05',
    subject: 'Chemistry',
    question: 'What is the approximate normal pH range of human arterial blood?',
    options: ['5.0 – 5.5', '6.0 – 6.5', '7.35 – 7.45', '8.2 – 8.8'],
    correctIndex: 2,
  },
  {
    id: 'ent-q-06',
    subject: 'Chemistry',
    question: 'Which chemical element has the symbol "Na" and is essential for nerve impulse transmission?',
    options: ['Nitrogen', 'Sodium', 'Neon', 'Nickel'],
    correctIndex: 1,
  },
  {
    id: 'ent-q-07',
    subject: 'English Language',
    question: 'Choose the word most nearly opposite in meaning to "CONCISE" in a clinical report:',
    options: ['Brief', 'Verbose', 'Accurate', 'Clear'],
    correctIndex: 1,
  },
  {
    id: 'ent-q-08',
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
    id: 'ent-q-09',
    subject: 'Mathematics',
    question: 'A clinic prescribes 250 mg of a suspension twice daily for 5 days. What is the total dosage administered?',
    options: ['1,250 mg', '2,000 mg', '2,500 mg', '5,000 mg'],
    correctIndex: 2,
  },
  {
    id: 'ent-q-10',
    subject: 'Mathematics',
    question: 'If 18 out of 24 trainees passed a practical immunization assessment, what percentage passed?',
    options: ['65%', '70%', '75%', '80%'],
    correctIndex: 2,
  },
];

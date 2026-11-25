import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { useSharedRecords } from '../lib/sharedRecords.ts';
import {
  Card,
  Button,
  Table,
  Badge,
  useToast,
  Tabs,
  Input,
  Select,
  Modal,
} from '@campusone/ui';
import {
  BookOpen,
  GraduationCap,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Play,
  RotateCcw,
  Check,
  X,
  HelpCircle,
  Award,
  Video,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  Flag,
  Printer,
  ShieldCheck,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { escapeHtml, exportToCsv, printInstitutionalDocument } from '../utils/documentExport.ts';
import { PersonAvatar, PhotoUploadControl, pluralize } from '../components/common/PersonAvatar.tsx';

/* ─── TYPES ─── */
type MaterialType = 'PDF_DOCUMENT' | 'LAB_MANUAL' | 'CLINICAL_VIDEO' | 'SLIDE_DECK';
type DifficultyLevel = 'FOUNDATION' | 'INTERMEDIATE' | 'ADVANCED';
type TestStatus = 'ACTIVE' | 'UPCOMING' | 'CONCLUDED';

interface CourseMaterial {
  id: string;
  courseCode: string;
  title: string;
  departmentCode: string;
  type: MaterialType;
  fileSize: string;
  uploadedBy: string;
  uploadDate: string;
  downloadCount: number;
  description: string;
}

interface PracticeTest {
  id: string;
  title: string;
  courseCode: string;
  departmentCode: string;
  totalQuestions: number;
  durationMinutes: number;
  passMarkPercentage: number;
  totalAttempts: number;
  avgScore: number;
  status: TestStatus;
  targetBoard: string;
}

interface QuestionItem {
  id: string;
  courseCode: string;
  questionText: string;
  imageUrl?: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  difficulty: DifficultyLevel;
  explanation: string;
  author: string;
}

interface StudentAttempt {
  id: string;
  matricNumber: string;
  studentName: string;
  studentEmail?: string;
  testId: string;
  testTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentMinutes: number;
  timeSpentSeconds?: number;
  proctorWarnings?: number;
  dateAttempted: string;
  passed: boolean;
}

export const LearningView: React.FC = () => {
  const { session, recordAudit, isDense, persona, schoolProfile, departments, courses } = useApp();
  const isStaff = session.activeRole !== 'STU' && session.activeRole !== 'SPON';
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tab: routeTab } = useParams<{ tab: string }>();

  /* ─── TAB SYNCHRONIZATION (ROLE SCOPED) ─── */
  const validTabs = isStaff
    ? ['materials', 'cbt', 'questions', 'results']
    : ['materials', 'cbt', 'results'];

  const resolveTab = (tabStr?: string | null): 'materials' | 'cbt' | 'questions' | 'results' => {
    if (!tabStr || !validTabs.includes(tabStr)) return 'materials';
    return tabStr as 'materials' | 'cbt' | 'questions' | 'results';
  };

  const [activeTab, setActiveTab] = useState<'materials' | 'cbt' | 'questions' | 'results'>(
    resolveTab(routeTab || searchParams.get('tab'))
  );

  useEffect(() => {
    const nextTab = resolveTab(routeTab || searchParams.get('tab'));
    setActiveTab(nextTab);
  }, [routeTab, searchParams]);

  const handleTabChange = (id: 'materials' | 'cbt' | 'questions' | 'results') => {
    setActiveTab(id);
    navigate(`/learning/${id}`);
  };

  /* ─── FILTERS ─── */
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cbtSearchQuery, setCbtSearchQuery] = useState('');
  const [cbtDeptFilter, setCbtDeptFilter] = useState('ALL');
  const [questionSearchQuery, setQuestionSearchQuery] = useState('');
  const [questionCourseFilter, setQuestionCourseFilter] = useState('ALL');
  const [resultSearchQuery, setResultSearchQuery] = useState('');

  /* ─── MODAL STATES ─── */
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterial | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [isCreateExamModalOpen, setIsCreateExamModalOpen] = useState(false);
  const [selectedQuestionForModal, setSelectedQuestionForModal] = useState<QuestionItem | null>(null);
  const [selectedAttemptForModal, setSelectedAttemptForModal] = useState<StudentAttempt | null>(null);

  /* ─── NEW CBT EXAM SUITE FORM STATE ─── */
  const [newExamForm, setNewExamForm] = useState({
    title: '',
    courseCode: 'CHE 201',
    targetBoard: 'CHPRBN Licensing Board',
    durationMinutes: '45',
    passMarkPercentage: '50',
    totalQuestions: '10',
  });

  /* ─── INTERACTIVE LIVE CBT SIMULATOR STATE ─── */
  const [isCbtModalOpen, setIsCbtModalOpen] = useState(false);
  const [isCbtFullscreen, setIsCbtFullscreen] = useState(false);
  const [activeTest, setActiveTest] = useState<PracticeTest | null>(null);
  const [activeExamQuestions, setActiveExamQuestions] = useState<QuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(45 * 60);
  const [proctorWarnings, setProctorWarnings] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [exitPrompt, setExitPrompt] = useState(false);
  const examStartedAtRef = useRef<number>(Date.now());
  const finishingRef = useRef(false);
  const finishExamRef = useRef<() => void>(() => {});
  const [cbtResult, setCbtResult] = useState<{
    score: number;
    percentage: number;
    passed: boolean;
    timeSpentSeconds: number;
    timeSpentMinutes: number;
  } | null>(null);

  /* ─── LIVE SUPABASE LMS DATABASE HYDRATION ─── */
  useEffect(() => {
    async function loadLiveLmsData() {
      try {
        const { data: dbMaterials } = await supabase
          .from('course_materials')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbMaterials && dbMaterials.length > 0) {
          const mappedMaterials: CourseMaterial[] = dbMaterials.map((m: any) => ({
            id: m.id,
            courseCode: m.course_code,
            title: m.title,
            departmentCode: m.department_code,
            type: m.type as MaterialType,
            fileSize: m.file_size,
            uploadedBy: m.uploaded_by,
            uploadDate: m.upload_date,
            downloadCount: m.download_count,
            description: m.description,
          }));
          setMaterials(mappedMaterials);
        }

        const { data: dbQuestions } = await supabase
          .from('cbt_questions')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbQuestions && dbQuestions.length > 0) {
          const mappedQuestions: QuestionItem[] = dbQuestions.map((q: any) => ({
            id: q.id,
            courseCode: q.course_code,
            questionText: q.question_text,
            options: q.options,
            correctOptionId: q.correct_option_id,
            difficulty: q.difficulty,
            explanation: q.explanation,
            author: q.author,
          }));
          setCbtQuestions(mappedQuestions);
        }
      } catch (err) {
        console.warn('[CampusOne] LMS live database load note:', err);
      }
    }

    loadLiveLmsData();
  }, []);

  /* ─── NEW MATERIAL FORM STATE ─── */
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatCourse, setNewMatCourse] = useState('CHE 201');
  const [newMatType, setNewMatType] = useState<MaterialType>('PDF_DOCUMENT');
  const [newMatDesc, setNewMatDesc] = useState('');

  /* ─── NEW QUESTION FORM STATE ─── */
  const [newQCourse, setNewQCourse] = useState('CHE 201');
  const [newQText, setNewQText] = useState('');
  const [newQImageUrl, setNewQImageUrl] = useState('');
  const [newQDifficulty, setNewQDifficulty] = useState<DifficultyLevel>('INTERMEDIATE');
  const [newOptA, setNewOptA] = useState('');
  const [newOptB, setNewOptB] = useState('');
  const [newOptC, setNewOptC] = useState('');
  const [newOptD, setNewOptD] = useState('');
  const [newCorrectOpt, setNewCorrectOpt] = useState('A');
  const [newQExplanation, setNewQExplanation] = useState('');

  /* ─── DATA: COURSE MATERIALS ─── */
  const [materials, setMaterials] = useState<CourseMaterial[]>([
    {
      id: 'mat-01',
      courseCode: 'CHE 201',
      title: 'Maternal and Child Health in Rural Primary Care Settings',
      departmentCode: 'CHE',
      type: 'PDF_DOCUMENT',
      fileSize: '3.4 MB',
      uploadedBy: 'Dr. K. Bello (HOD)',
      uploadDate: '2026-11-02',
      downloadCount: 148,
      description: 'Comprehensive guidelines on rural antenatal triage, obstetric danger signs, and community referral networks.',
    },
    {
      id: 'mat-02',
      courseCode: 'CHE 201',
      title: 'Vaccine Cold Chain Management & Preservation Manual',
      departmentCode: 'CHE',
      type: 'LAB_MANUAL',
      fileSize: '5.2 MB',
      uploadedBy: 'Dr. K. Bello (HOD)',
      uploadDate: '2026-11-04',
      downloadCount: 162,
      description: 'Standard operating procedures for solar-powered refrigerators, ice packs conditioning, and vaccine potency monitoring.',
    },
    {
      id: 'mat-03',
      courseCode: 'MLT 201',
      title: 'Clinical Hematology & Blood Film Staining Protocols',
      departmentCode: 'MLT',
      type: 'PDF_DOCUMENT',
      fileSize: '4.8 MB',
      uploadedBy: 'Mr. O. Adebisi (HOD)',
      uploadDate: '2026-11-01',
      downloadCount: 112,
      description: 'Field procedures for Leishman and Giemsa stains, thin vs thick blood film examination for malaria parasites.',
    },
    {
      id: 'mat-04',
      courseCode: 'MLT 201',
      title: 'Laboratory Diagnostic Safety & Chemical Hazards Guide',
      departmentCode: 'MLT',
      type: 'LAB_MANUAL',
      fileSize: '6.1 MB',
      uploadedBy: 'Mr. O. Adebisi (HOD)',
      uploadDate: '2026-11-03',
      downloadCount: 94,
      description: 'Safety guidelines for autoclaves, sharp waste disposal, spill management, and personal protective equipment standards.',
    },
    {
      id: 'mat-05',
      courseCode: 'PHT 201',
      title: 'Essential Pharmacology & Pediatric Dosage Calculation',
      departmentCode: 'PHT',
      type: 'SLIDE_DECK',
      fileSize: '8.4 MB',
      uploadedBy: 'Pharm. F. Oladipo',
      uploadDate: '2026-11-05',
      downloadCount: 130,
      description: 'Step-by-step mathematical calculations for body-weight based drug formulations and antibiotic suspensions.',
    },
    {
      id: 'mat-06',
      courseCode: 'HIM 201',
      title: 'ICD-11 Diagnostic Classification & Electronic Indexing',
      departmentCode: 'HIM',
      type: 'PDF_DOCUMENT',
      fileSize: '4.2 MB',
      uploadedBy: 'Mrs. T. Adeleke',
      uploadDate: '2026-11-06',
      downloadCount: 88,
      description: 'International statistical classification of diseases and health related problems coding structure.',
    },
  ]);

  /* ─── DATA: PRACTICE TESTS ─── */
  const [practiceTests, setPracticeTests] = useSharedRecords<PracticeTest>('learning.tests', [
    {
      id: 'cbt-01',
      title: 'Community Health National Board Practice Mock Exam (CHPRBN)',
      courseCode: 'CHE 201',
      departmentCode: 'CHE',
      totalQuestions: 10,
      durationMinutes: 45,
      passMarkPercentage: 50,
      totalAttempts: 342,
      avgScore: 76.4,
      status: 'ACTIVE',
      targetBoard: 'CHPRBN Licensing Board',
    },
    {
      id: 'cbt-02',
      title: 'Medical Laboratory Technician Licensing Simulation (MLSCN)',
      courseCode: 'MLT 201',
      departmentCode: 'MLT',
      totalQuestions: 10,
      durationMinutes: 45,
      passMarkPercentage: 50,
      totalAttempts: 228,
      avgScore: 78.2,
      status: 'ACTIVE',
      targetBoard: 'MLSCN Regulatory Council',
    },
    {
      id: 'cbt-03',
      title: 'Pharmacy Technician Dispensing & Ethics Mock (PCN)',
      courseCode: 'PHT 201',
      departmentCode: 'PHT',
      totalQuestions: 10,
      durationMinutes: 45,
      passMarkPercentage: 50,
      totalAttempts: 184,
      avgScore: 71.8,
      status: 'ACTIVE',
      targetBoard: 'Pharmacists Council of Nigeria',
    },
    {
      id: 'cbt-04',
      title: 'Health Information Management Biostatistics Test (HRORBN)',
      courseCode: 'HIM 201',
      departmentCode: 'HIM',
      totalQuestions: 10,
      durationMinutes: 45,
      passMarkPercentage: 50,
      totalAttempts: 92,
      avgScore: 82.5,
      status: 'ACTIVE',
      targetBoard: 'HRORBN Statutory Board',
    },
  ]);

  /* ─── CBT QUESTIONS DATASET (10 AUTHENTIC HEALTH TECH QUESTIONS) ─── */
  const [cbtQuestions, setCbtQuestions] = useState<QuestionItem[]>([

    {
      id: 'q-01',
      courseCode: 'CHE 201',
      questionText: 'What is the recommended statutory temperature storage range for the preservation of oral polio vaccines (OPV) and measles vaccines at the primary health center level?',
      options: [
        { id: 'A', text: '+2 degrees Celsius to +8 degrees Celsius' },
        { id: 'B', text: '-15 degrees Celsius to -25 degrees Celsius' },
        { id: 'C', text: '+10 degrees Celsius to +15 degrees Celsius' },
        { id: 'D', text: 'Room temperature below 25 degrees Celsius' },
      ],
      correctOptionId: 'A',
      difficulty: 'FOUNDATION',
      explanation: 'At the service delivery primary health care level, oral polio vaccine and measles vaccines must be maintained strictly between +2°C and +8°C in standard cold chain equipment.',
      author: 'Dr. K. Bello',
    },
    {
      id: 'q-02',
      courseCode: 'CHE 201',
      questionText: 'According to primary health care guidelines, which of the following is considered the gold standard first-line oral rehydration therapy for childhood diarrhea with mild dehydration?',
      options: [
        { id: 'A', text: 'Low-osmolarity Oral Rehydration Salts (ORS) combined with Zinc supplementation' },
        { id: 'B', text: 'Intravenous normal saline infusion immediately' },
        { id: 'C', text: 'Oral antibiotic suspension with broad spectrum coverage' },
        { id: 'D', text: 'Concentrated glucose water with multivitamin drops' },
      ],
      correctOptionId: 'A',
      difficulty: 'FOUNDATION',
      explanation: 'WHO/UNICEF and Nigerian PHC protocols mandate low-osmolarity ORS combined with 20mg zinc daily for 10-14 days as the primary standard of care.',
      author: 'Dr. K. Bello',
    },
    {
      id: 'q-03',
      courseCode: 'MLT 201',
      questionText: 'In diagnostic hematology, which anticoagulant is the agent of choice for routine full blood count (FBC) and erythrocyte sedimentation rate (ESR) determination?',
      options: [
        { id: 'A', text: 'Dipotassium Ethylene Diamine Tetra-acetic Acid (K2-EDTA)' },
        { id: 'B', text: 'Sodium fluoride and potassium oxalate' },
        { id: 'C', text: 'Lithium heparin' },
        { id: 'D', text: 'Buffered trisodium citrate in 1:9 ratio' },
      ],
      correctOptionId: 'A',
      difficulty: 'INTERMEDIATE',
      explanation: 'K2-EDTA preserves cellular morphology, prevents platelet aggregation, and does not alter red blood cell size during routine hematological counting.',
      author: 'Mr. O. Adebisi',
    },
    {
      id: 'q-04',
      courseCode: 'MLT 201',
      questionText: 'When examining a thin blood film stained with Giemsa stain, the presence of delicate ring forms with double chromatin dots inside normocytic red blood cells is most characteristic of:',
      options: [
        { id: 'A', text: 'Plasmodium falciparum' },
        { id: 'B', text: 'Plasmodium vivax' },
        { id: 'C', text: 'Plasmodium malariae' },
        { id: 'D', text: 'Plasmodium ovale' },
      ],
      correctOptionId: 'A',
      difficulty: 'INTERMEDIATE',
      explanation: 'Plasmodium falciparum typically presents with small, delicate ring forms, multiple rings per red cell, and prominent double chromatin dots.',
      author: 'Mr. O. Adebisi',
    },
    {
      id: 'q-05',
      courseCode: 'PHT 201',
      questionText: 'A pediatric patient weighing 12 kg is prescribed Amoxicillin suspension at 40 mg per kg per day divided into two equal doses. The suspension is formulated as 125 mg per 5 mL. How many milliliters should be administered per dose?',
      options: [
        { id: 'A', text: '9.6 mL per dose' },
        { id: 'B', text: '4.8 mL per dose' },
        { id: 'C', text: '12.0 mL per dose' },
        { id: 'D', text: '6.4 mL per dose' },
      ],
      correctOptionId: 'A',
      difficulty: 'ADVANCED',
      explanation: 'Total daily dose = 12 kg * 40 mg/kg = 480 mg/day. Per dose = 240 mg. Volume = (240 mg / 125 mg) * 5 mL = 9.6 mL per dose.',
      author: 'Pharm. F. Oladipo',
    },
    {
      id: 'q-06',
      courseCode: 'PHT 201',
      questionText: 'Which class of antimicrobial agents is strictly contraindicated in children under 8 years of age due to the risk of irreversible dental enamel hypoplasia and bone growth impairment?',
      options: [
        { id: 'A', text: 'Tetracyclines' },
        { id: 'B', text: 'Macrolides' },
        { id: 'C', text: 'Penicillins' },
        { id: 'D', text: 'Cephalosporins' },
      ],
      correctOptionId: 'A',
      difficulty: 'FOUNDATION',
      explanation: 'Tetracyclines bind to calcium in growing teeth and bones, leading to permanent discoloration and enamel hypoplasia in young children.',
      author: 'Pharm. F. Oladipo',
    },
    {
      id: 'q-07',
      courseCode: 'HIM 201',
      questionText: 'In health records management, what is the statutory minimum retention period for adult clinical hospital records in Nigeria after the patient’s last documented contact?',
      options: [
        { id: 'A', text: '10 years' },
        { id: 'B', text: '3 years' },
        { id: 'C', text: '5 years' },
        { id: 'D', text: '25 years' },
      ],
      correctOptionId: 'A',
      difficulty: 'INTERMEDIATE',
      explanation: 'Under the Health Records Officers Registration Board regulations, general adult medical records must be retained for at least 10 years following discharge.',
      author: 'Mrs. T. Adeleke',
    },
    {
      id: 'q-08',
      courseCode: 'CHE 201',
      questionText: 'During a community health maternal survey in a rural district, which maternal sign is an absolute indication for emergency referral to a Comprehensive Emergency Obstetric Care facility?',
      options: [
        { id: 'A', text: 'Vaginal bleeding accompanied by severe abdominal pain' },
        { id: 'B', text: 'Mild morning sickness during the first trimester' },
        { id: 'C', text: 'Slight bilateral ankle swelling at 34 weeks gestation' },
        { id: 'D', text: 'Occasional Braxton-Hicks painless contractions' },
      ],
      correctOptionId: 'A',
      difficulty: 'FOUNDATION',
      explanation: 'Antepartum hemorrhage and severe pain are cardinal indicators of placental abruption or uterine rupture requiring immediate surgical intervention.',
      author: 'Dr. K. Bello',
    },
    {
      id: 'q-09',
      courseCode: 'MLT 201',
      questionText: 'Which of the following bacterial species is a lactose-fermenting, Gram-negative bacillus that produces pink colonies with a metallic sheen on Eosin Methylene Blue (EMB) agar?',
      options: [
        { id: 'A', text: 'Escherichia coli' },
        { id: 'B', text: 'Salmonella typhi' },
        { id: 'C', text: 'Pseudomonas aeruginosa' },
        { id: 'D', text: 'Proteus mirabilis' },
      ],
      correctOptionId: 'A',
      difficulty: 'INTERMEDIATE',
      explanation: 'Escherichia coli ferments lactose rapidly, creating an acidic environment that precipitates dye to yield the characteristic greenish-black metallic sheen on EMB agar.',
      author: 'Mr. O. Adebisi',
    },
    {
      id: 'q-10',
      courseCode: 'CHE 201',
      questionText: 'The Bamako Initiative adopted by African Health Ministers in 1987 primarily aimed to achieve which institutional objective in primary health care?',
      options: [
        { id: 'A', text: 'Community financing and sustainable revolving drug funds' },
        { id: 'B', text: 'Complete privatization of tertiary specialized hospitals' },
        { id: 'C', text: 'Abolition of all training programs for community health workers' },
        { id: 'D', text: 'Centralized government procurement without community participation' },
      ],
      correctOptionId: 'A',
      difficulty: 'FOUNDATION',
      explanation: 'The Bamako Initiative established community participation and self-sustaining revolving drug funds to ensure accessible essential medicines in rural centers.',
      author: 'Dr. K. Bello',
    },
  ]);

  /* ─── DATA: STUDENT RESULTS ─── */
  const [studentAttempts, setStudentAttempts] = useSharedRecords<StudentAttempt>('learning.attempts', [
    {
      id: 'att-01',
      matricNumber: 'CHE/2026/0014',
      studentName: 'Blessing Adeyemi',
      testId: 'cbt-01',
      testTitle: 'Community Health National Board Practice Mock',
      score: 9,
      totalQuestions: 10,
      percentage: 90,
      timeSpentMinutes: 32,
      dateAttempted: '2026-11-12',
      passed: true,
    },
    {
      id: 'att-02',
      matricNumber: 'CHE/2026/0015',
      studentName: 'Oluwaseun Bakare',
      testId: 'cbt-01',
      testTitle: 'Community Health National Board Practice Mock',
      score: 8,
      totalQuestions: 10,
      percentage: 80,
      timeSpentMinutes: 38,
      dateAttempted: '2026-11-12',
      passed: true,
    },
    {
      id: 'att-03',
      matricNumber: 'MLT/2026/0029',
      studentName: 'Emmanuel Chukwuma',
      testId: 'cbt-02',
      testTitle: 'Medical Laboratory Technician Licensing Simulation',
      score: 8,
      totalQuestions: 10,
      percentage: 80,
      timeSpentMinutes: 40,
      dateAttempted: '2026-11-11',
      passed: true,
    },
    {
      id: 'att-04',
      matricNumber: 'PHT/2026/0009',
      studentName: 'Khadijat Sani',
      testId: 'cbt-03',
      testTitle: 'Pharmacy Technician Dispensing & Ethics Mock',
      score: 7,
      totalQuestions: 10,
      percentage: 70,
      timeSpentMinutes: 42,
      dateAttempted: '2026-11-10',
      passed: true,
    },
    {
      id: 'att-05',
      matricNumber: 'CHE/2026/0017',
      studentName: 'Chinedu Eze',
      testId: 'cbt-01',
      testTitle: 'Community Health National Board Practice Mock',
      score: 4,
      totalQuestions: 10,
      percentage: 40,
      timeSpentMinutes: 45,
      dateAttempted: '2026-11-09',
      passed: false,
    },
  ]);

  /* ─── FULLSCREEN & BODY LOCK EFFECT FOR CBT WORKSPACE ─── */
  useEffect(() => {
    if (!isCbtModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onFsChange = () => setIsCbtFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('fullscreenchange', onFsChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [isCbtModalOpen]);

  const toggleCbtBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  /* ─── TIMER & ANTI-CHEAT PROCTORING EFFECT FOR CBT SIMULATOR ─── */
  useEffect(() => {
    if (!isCbtModalOpen || isSubmitted) return;
    const interval = window.setInterval(() => {
      setSecondsRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isCbtModalOpen, isSubmitted]);

  useEffect(() => {
    if (!isCbtModalOpen || isSubmitted) return;
    const handleVisibilityOrBlur = () => {
      if (document.hidden && !finishingRef.current) {
        setProctorWarnings((prev) => {
          const next = prev + 1;
          if (next >= 3 && !finishingRef.current) {
            finishingRef.current = true;
            finishExamRef.current();
          }
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityOrBlur);
    return () => document.removeEventListener('visibilitychange', handleVisibilityOrBlur);
  }, [isCbtModalOpen, isSubmitted]);

  useEffect(() => {
    if (!isCbtModalOpen || isSubmitted || secondsRemaining !== 0 || finishingRef.current) return;
    finishingRef.current = true;
    finishExamRef.current();
  }, [isCbtModalOpen, isSubmitted, secondsRemaining]);

  /* ─── CBT ACTIONS ─── */
  const startCbtExam = (test: PracticeTest) => {
    const courseMatching = cbtQuestions.filter(
      (q) => q.courseCode.toLowerCase() === test.courseCode.toLowerCase()
    );
    const pool = courseMatching.length >= 3 ? courseMatching : cbtQuestions;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setActiveExamQuestions(shuffled);
    setActiveTest(test);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setFlaggedQuestions({});
    setProctorWarnings(0);
    setSecondsRemaining(test.durationMinutes * 60);
    examStartedAtRef.current = Date.now();
    setIsSubmitted(false);
    setExitPrompt(false);
    finishingRef.current = false;
    setCbtResult(null);
    setIsCbtModalOpen(true);
  };

  const handleSelectAnswer = (optionId: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionId,
    }));
  };

  const toggleFlagQuestion = () => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQuestionIndex]: !prev[currentQuestionIndex],
    }));
  };

  const handleSubmitCbt = () => {
    calculateAndFinishCbt();
  };

  const formatElapsedDuration = (mins: number, secs?: number) => {
    if (secs !== undefined && secs > 0) {
      if (secs < 60) return `${secs} secs`;
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return s > 0 ? `${m}m ${s}s` : `${pluralize(m, 'min')}`;
    }
    return `${pluralize(Math.max(1, mins), 'min')}`;
  };

  const calculateAndFinishCbt = () => {
    const examPool = activeExamQuestions.length > 0 ? activeExamQuestions : cbtQuestions;
    let correctCount = 0;
    examPool.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctOptionId) {
        correctCount += 1;
      }
    });

    const total = examPool.length;
    const percentage = total === 0 ? 0 : Math.round((correctCount / total) * 100);
    const passed = percentage >= (activeTest?.passMarkPercentage || 50);

    const maxAllowedSec = (activeTest?.durationMinutes || 45) * 60;
    const timerElapsed = Math.max(0, maxAllowedSec - secondsRemaining);
    const wallElapsed = Math.max(1, Math.round((Date.now() - examStartedAtRef.current) / 1000));
    const timeSpentSeconds = Math.min(maxAllowedSec, Math.max(timerElapsed, wallElapsed));
    const timeSpentMinutes = Math.max(1, Math.ceil(timeSpentSeconds / 60));

    setCbtResult({
      score: correctCount,
      percentage,
      passed,
      timeSpentSeconds,
      timeSpentMinutes,
    });
    setIsSubmitted(true);
    setStudentAttempts((prev) => [
      {
        id: `att-${Date.now()}`,
        matricNumber: persona?.matricNumber || session.email,
        studentName: persona?.fullName || session.fullName,
        studentEmail: session.email,
        testId: activeTest?.id || activeTest?.courseCode || 'cbt',
        testTitle: activeTest?.title || activeTest?.courseCode || 'Practice test',
        score: correctCount,
        totalQuestions: total,
        percentage,
        timeSpentMinutes,
        timeSpentSeconds,
        proctorWarnings,
        dateAttempted: new Date().toISOString().slice(0, 10),
        passed,
      },
      ...prev,
    ]);

    recordAudit('CBT_PRACTICE_EXAM_SUBMITTED', 'ONLINE_LEARNING', activeTest?.courseCode || 'CHE 201');
  };
  finishExamRef.current = calculateAndFinishCbt;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  /* ─── MATERIAL ACTIONS ─── */
  const handleDownloadMaterial = (m: CourseMaterial) => {
    setMaterials((prev) =>
      prev.map((item) => (item.id === m.id ? { ...item, downloadCount: item.downloadCount + 1 } : item))
    );
    printInstitutionalDocument({
      title: `${m.courseCode} — ${m.title}`,
      badgeText: `OFFICIAL COURSE LECTURE MATERIAL • ${m.courseCode}`,
      referenceNo: `BCHT/LMS/${m.courseCode.replace(/\s+/g, '')}/${m.id.toUpperCase()}`,
      issuedDate: m.uploadDate,
      schoolProfile,
      officeSubtitle: `Department of ${m.departmentCode} • E-Learning & Digital Library`,
      metaItems: [
        { label: 'Course Code', value: m.courseCode, highlight: true },
        { label: 'Resource Type', value: m.type.replace('_', ' ') },
        { label: 'Uploaded By', value: m.uploadedBy, highlight: true },
        { label: 'Publication Date', value: m.uploadDate },
      ],
      bodyHtml: `
        <div style="margin-bottom:10px;">
          <div style="font-size:14px; font-weight:800; color:#093322;">${escapeHtml(m.title)}</div>
        </div>
        <div class="callout-box" style="line-height:1.7; font-size:11.5px;">
          <p><strong>Module Synopsis &amp; Learning Objectives:</strong></p>
          <p>${escapeHtml(m.description)}</p>
        </div>
      `,
      signatures: [
        { title: m.uploadedBy, subtitle: 'Course Lecturer / Author' },
        { title: 'Director of E-Learning & Academic Planning', subtitle: schoolProfile?.institutionName || 'Bethsaida College of Health Tech' },
      ],
    });
  };

  const handlePreviewMaterial = (m: CourseMaterial) => {
    setSelectedMaterial(m);
    setIsPreviewModalOpen(true);
  };

  const handleUploadMaterial = () => {
    if (!newMatTitle.trim()) {
      showToast({ type: 'warning', title: 'Validation Error', message: 'Module title is required.' });
      return;
    }
    const newMaterial: CourseMaterial = {
      id: `mat-0${materials.length + 1}`,
      courseCode: newMatCourse,
      title: newMatTitle.trim(),
      departmentCode: newMatCourse.substring(0, 3),
      type: newMatType,
      fileSize: 'File pending',
      uploadedBy: 'Dr. Timothy Balogun (Provost)',
      uploadDate: new Date().toISOString().split('T')[0],
      downloadCount: 0,
      description: newMatDesc.trim() || 'Official curriculum learning material.',
    };
    setMaterials((prev) => [newMaterial, ...prev]);
    recordAudit('COURSE_MATERIAL_UPLOADED', 'ONLINE_LEARNING', newMatCourse);
    
    // Save directly to Supabase course_materials database
    supabase
      .from('course_materials')
      .upsert({
        id: newMaterial.id,
        college_id: 'bethsaida',
        course_code: newMaterial.courseCode,
        title: newMaterial.title,
        department_code: newMaterial.departmentCode,
        type: newMaterial.type,
        file_size: newMaterial.fileSize,
        uploaded_by: newMaterial.uploadedBy,
        upload_date: newMaterial.uploadDate,
        download_count: newMaterial.downloadCount,
        description: newMaterial.description,
      })
      .then(({ error }) => {
        if (error) console.warn('[CampusOne] Material db save note:', error);
      });

    showToast({
      type: 'success',
      title: 'Material Published Successfully',
      message: `"${newMatTitle}" has been saved and published to the student digital library.`,
    });
    setIsUploadModalOpen(false);
    setNewMatTitle('');
    setNewMatDesc('');
  };

  /* ─── DERIVED FILTERED MATERIALS ─── */
  const filteredMaterials = materials.filter((m) => {
    if (selectedDeptFilter !== 'ALL' && m.departmentCode !== selectedDeptFilter) return false;
    if (selectedTypeFilter !== 'ALL' && m.type !== selectedTypeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchCourse = m.courseCode.toLowerCase().includes(q);
      if (!matchTitle && !matchCourse) return false;
    }
    return true;
  });

  /* ─── TABLE COLUMNS: STUDENT RESULTS ─── */
  const resultColumns = [
    {
      key: 'matricNumber',
      header: 'Matriculation No.',
      nowrap: true,
      render: (r: StudentAttempt) => (
        <span className="font-semibold text-slate-900">{r.matricNumber}</span>
      ),
    },
    {
      key: 'studentName',
      header: 'Student Name',
      render: (r: StudentAttempt) => (
        <div className="flex items-center gap-2.5">
          <PersonAvatar name={r.studentName} code={r.matricNumber} size="sm" />
          <span className="font-semibold text-slate-800">{r.studentName}</span>
        </div>
      ),
    },
    {
      key: 'testTitle',
      header: 'Practice Test Exam',
      render: (r: StudentAttempt) => (
        <span className="text-xs text-slate-700">{r.testTitle}</span>
      ),
    },
    {
      key: 'score',
      header: 'Score / Percentage',
      nowrap: true,
      render: (r: StudentAttempt) => (
        <div className="flex items-center gap-1.5 font-bold text-slate-900">
          <span>{r.score} of {r.totalQuestions}</span>
          <span className="text-xs font-semibold text-slate-500">({r.percentage}%)</span>
        </div>
      ),
    },
    {
      key: 'timeSpent',
      header: 'Time Taken',
      nowrap: true,
      render: (r: StudentAttempt) => (
        <span className="text-xs font-semibold text-slate-700">
          {formatElapsedDuration(r.timeSpentMinutes, r.timeSpentSeconds)}
        </span>
      ),
    },
    {
      key: 'dateAttempted',
      header: 'Date Attempted',
      nowrap: true,
      render: (r: StudentAttempt) => (
        <span className="text-xs text-slate-500">{r.dateAttempted}</span>
      ),
    },
    {
      key: 'status',
      header: 'Test Standing',
      nowrap: true,
      render: (r: StudentAttempt) => (
        <Badge variant={r.passed ? 'success' : 'danger'}>
          {r.passed ? 'PASSED (50% or higher)' : 'FAILED'}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Result Slip',
      align: 'right' as const,
      nowrap: true,
      render: (r: StudentAttempt) => (
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<Eye className="w-3.5 h-3.5" />}
          onClick={() => setSelectedAttemptForModal(r)}
        >
          View Slip
        </Button>
      ),
    },
  ];

  /* ─── ADD NEW QUESTION HANDLER ─── */
  const handleAddNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim() || !newOptA.trim() || !newOptB.trim()) {
      showToast({
        type: 'danger',
        title: 'Incomplete Question',
        message: 'Please provide question text and at least options A and B.',
      });
      return;
    }

    const createdQ: QuestionItem = {
      id: `q-${Date.now().toString().slice(-4)}`,
      courseCode: newQCourse,
      questionText: newQText.trim(),
      imageUrl: newQImageUrl || undefined,
      options: [
        { id: 'A', text: newOptA.trim() },
        { id: 'B', text: newOptB.trim() },
        { id: 'C', text: newOptC.trim() || 'None of the above' },
        { id: 'D', text: newOptD.trim() || 'All of the above' },
      ],
      correctOptionId: newCorrectOpt as any,
      difficulty: newQDifficulty,
      explanation: newQExplanation.trim() || 'Official curriculum clinical rationale.',
      author: persona?.fullName || 'Academic Staff',
    };

    setCbtQuestions((prev) => [createdQ, ...prev]);

    // Save directly to Supabase cbt_questions database
    supabase
      .from('cbt_questions')
      .upsert({
        id: createdQ.id,
        college_id: 'bethsaida',
        course_code: createdQ.courseCode,
        question_text: createdQ.questionText,
        options: createdQ.options,
        correct_option_id: createdQ.correctOptionId,
        difficulty: createdQ.difficulty,
        explanation: createdQ.explanation,
        author: createdQ.author,
      })
      .then(({ error }) => {
        if (error) console.warn('[CampusOne] CBT Question db save note:', error);
      });

    setIsAddQuestionModalOpen(false);
    setNewQText('');
    setNewQImageUrl('');
    setNewOptA('');
    setNewOptB('');
    setNewOptC('');
    setNewOptD('');
    setNewQExplanation('');

    showToast({
      type: 'success',
      title: 'Question Saved Successfully',
      message: `Question added and saved to ${createdQ.courseCode} question bank.`,
    });
  };

  /* ─── TABLE COLUMNS: QUESTION BANK ─── */
  const questionColumns = [
    {
      key: 'courseCode',
      header: 'Course',
      nowrap: true,
      render: (q: QuestionItem) => (
        <span className="font-bold text-slate-900">{q.courseCode}</span>
      ),
    },
    {
      key: 'questionText',
      header: 'Question Stem',
      render: (q: QuestionItem) => (
        <div className="flex items-center gap-2 max-w-md">
          {q.imageUrl && (
            <img
              src={q.imageUrl}
              alt="Question figure"
              className="w-8 h-8 rounded-[3px] object-cover border border-slate-200 shrink-0"
            />
          )}
          <p className="text-xs text-slate-800 line-clamp-2" title={q.questionText}>
            {q.questionText}
          </p>
        </div>
      ),
    },
    {
      key: 'difficulty',
      header: 'Cognitive Level',
      nowrap: true,
      render: (q: QuestionItem) => {
        const badgeMap = {
          FOUNDATION: { variant: 'neutral' as const, label: 'Foundation' },
          INTERMEDIATE: { variant: 'warning' as const, label: 'Intermediate' },
          ADVANCED: { variant: 'primary' as const, label: 'Advanced' },
        };
        return <Badge variant={badgeMap[q.difficulty].variant} size="sm">{badgeMap[q.difficulty].label}</Badge>;
      },
    },
    {
      key: 'author',
      header: 'Faculty Author',
      nowrap: true,
      render: (q: QuestionItem) => (
        <div className="flex items-center gap-2">
          <PersonAvatar name={q.author} size="xs" />
          <span className="text-xs text-slate-600">{q.author}</span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right' as const,
      nowrap: true,
      render: (q: QuestionItem) => (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Eye className="w-3.5 h-3.5" />}
          onClick={() => setSelectedQuestionForModal(q)}
          className="whitespace-nowrap"
        >
          View Key &amp; Rationale
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Online Learning & Practice Tests</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Curated lecture notes, laboratory manuals, question banks, and timed national licensing computer-based test practice.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'materials' && isStaff && (
            <Button
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="whitespace-nowrap"
            >
              Upload Material
            </Button>
          )}
          {activeTab === 'cbt' && (
            <>
              {isStaff && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsCreateExamModalOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="whitespace-nowrap"
                >
                  Create CBT Exam
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => startCbtExam(practiceTests[0])}
                leftIcon={<Play className="w-3.5 h-3.5" />}
                className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
              >
                Launch CBT Simulator
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ─── Academic Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Learning Modules
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">42</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">+8 this semester</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Accredited notes & lab guides</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Practice Mock Tests
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">16</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-600 font-semibold">Active suites</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Exam format</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              {isStaff ? 'Student Submissions' : 'Completed Mocks'}
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#13A348] flex items-center justify-center shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {isStaff ? '2,480' : '4'}
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">{isStaff ? '78.4% pass rate' : '100% Passed'}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Logged attempts</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              {isStaff ? 'Average Mock Score' : 'My Average Score'}
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {isStaff ? '74.8%' : '88.5%'}
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">Licensing ready</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Exam preparation</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <Tabs
        tabs={[
          { id: 'materials', label: 'Course Materials & Notes' },
          { id: 'cbt', label: 'Computer-Based Practice Tests' },
          ...(isStaff ? [{ id: 'questions', label: 'Question Bank' }] : []),
          { id: 'results', label: isStaff ? 'Student Results' : 'My Practice Results' },
        ]}
        activeTab={activeTab}
        onChange={(id: any) => handleTabChange(id)}
      />

      {/* ─── TAB 1: COURSE MATERIALS ─── */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-40">
                <Select
                  value={selectedDeptFilter}
                  onChange={(val) => setSelectedDeptFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Programmes' },
                    { value: 'CHE', label: 'Community Health' },
                    { value: 'MLT', label: 'Medical Laboratory' },
                    { value: 'PHT', label: 'Pharmacy Tech' },
                    { value: 'HIM', label: 'Health Information' },
                  ]}
                />
              </div>
              <div className="w-44">
                <Select
                  value={selectedTypeFilter}
                  onChange={(val) => setSelectedTypeFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Resource Types' },
                    { value: 'PDF_DOCUMENT', label: 'PDF Lecture Notes' },
                    { value: 'LAB_MANUAL', label: 'Laboratory Manuals' },
                    { value: 'SLIDE_DECK', label: 'Slide Presentations' },
                  ]}
                />
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search module title or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              />
            </div>
          </div>

          {/* Materials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMaterials.map((m) => (
              <Card key={m.id} className="p-4 bg-white border border-slate-200 rounded-[4px] flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-[#0F7640] text-xs uppercase tracking-wide">
                      {m.courseCode}
                    </span>
                    <Badge variant="neutral" size="sm">{m.fileSize}</Badge>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {m.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{m.uploadedBy} • {m.uploadDate}</span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePreviewMaterial(m)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      className="whitespace-nowrap"
                    >
                      Preview
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownloadMaterial(m)}
                      leftIcon={<Download className="w-3.5 h-3.5" />}
                      className="whitespace-nowrap text-[#0F7640] border-emerald-200"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 2: CBT PRACTICE TESTS ─── */}
      {activeTab === 'cbt' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-900 text-sm block">
                Official National Professional Licensing Mock Simulations
              </span>
              <p className="text-slate-500 mt-0.5">
                Practice exams timed strictly to official council standards. Passing score is 50% or higher.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-40">
                <Select
                  value={cbtDeptFilter}
                  onChange={(val) => setCbtDeptFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Programmes' },
                    { value: 'CHE', label: 'Community Health' },
                    { value: 'MLT', label: 'Medical Laboratory' },
                    { value: 'PHT', label: 'Pharmacy Tech' },
                    { value: 'HIM', label: 'Health Information' },
                  ]}
                />
              </div>
              <div className="w-56">
                <Input
                  placeholder="Search practice exam or course..."
                  value={cbtSearchQuery}
                  onChange={(e) => setCbtSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {practiceTests
              .filter((t) => {
                if (cbtDeptFilter !== 'ALL' && t.departmentCode !== cbtDeptFilter) return false;
                if (cbtSearchQuery.trim()) {
                  const q = cbtSearchQuery.toLowerCase();
                  return (
                    t.title.toLowerCase().includes(q) ||
                    t.courseCode.toLowerCase().includes(q) ||
                    t.targetBoard.toLowerCase().includes(q)
                  );
                }
                return true;
              })
              .map((t) => (
              <Card key={t.id} className="p-4 bg-white border border-slate-200 rounded-[4px] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#0F7640] text-xs">
                    {t.courseCode} • {t.targetBoard}
                  </span>
                  <Badge variant="success" size="sm">{t.status}</Badge>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {pluralize(t.totalQuestions, 'Question')} • {pluralize(t.durationMinutes, 'Minute')} • Pass Mark: {t.passMarkPercentage}%
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-[4px] border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>{pluralize(t.totalAttempts, 'Trainee')} Completed</span>
                  <span className="font-bold text-slate-800">Average: {t.avgScore}%</span>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <Button
                    size="sm"
                    onClick={() => startCbtExam(t)}
                    leftIcon={<Play className="w-3.5 h-3.5" />}
                    className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
                  >
                    Start Practice Exam
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: QUESTION BANK (FACULTY & LECTURERS ONLY) ─── */}
      {isStaff && activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Departmental pool of vetted multiple choice examination items with clinical rationales.
            </p>
            <div className="flex items-center gap-2">
              {isStaff && (
                <Button
                  size="sm"
                  onClick={() => setIsAddQuestionModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
              >
                Add Question
              </Button>
            )}
              <Button
                size="sm"
                onClick={() => {
                  exportToCsv({
                    filename: `BCHT_CBT_Question_Pool_${new Date().toISOString().slice(0, 10)}.csv`,
                    columns: [
                      { key: 'id', header: 'Question ID' },
                      { key: 'courseCode', header: 'Course Code' },
                      { key: 'difficulty', header: 'Difficulty Level' },
                      { key: 'questionText', header: 'Question Stem' },
                      {
                        key: 'optionsText',
                        header: 'Options',
                        format: (_, q) => (q.options || []).map((o: any) => `${o.id}: ${o.text}`).join(' | '),
                      },
                      { key: 'correctOptionId', header: 'Correct Option' },
                      { key: 'explanation', header: 'Clinical Rationale / Explanation' },
                      { key: 'author', header: 'Examiner / Author' },
                    ],
                    data: cbtQuestions,
                  });
                  showToast({
                    type: 'success',
                    title: 'Question Bank Exported',
                    message: `Exported ${cbtQuestions.length} examination questions to CSV.`,
                  });
                }}
                leftIcon={<Download className="w-3.5 h-3.5" />}
                variant="secondary"
                className="whitespace-nowrap"
              >
                Export Question Pool
              </Button>
            </div>
          </div>

          <Card>
            <Table
              columns={questionColumns}
              data={cbtQuestions.filter((q) => {
                if (questionCourseFilter !== 'ALL' && q.courseCode !== questionCourseFilter) return false;
                if (questionSearchQuery.trim()) {
                  const s = questionSearchQuery.toLowerCase();
                  return (
                    q.questionText.toLowerCase().includes(s) ||
                    q.courseCode.toLowerCase().includes(s) ||
                    q.author.toLowerCase().includes(s)
                  );
                }
                return true;
              })}
              keyExtractor={(q) => q.id}
              isDense={isDense}
              searchValue={questionSearchQuery}
              onSearchChange={setQuestionSearchQuery}
              searchPlaceholder="Search question stem, course code, or author..."
              toolbarFilters={
                <div className="w-48">
                  <Select
                    value={questionCourseFilter}
                    onChange={(val) => setQuestionCourseFilter(val)}
                    options={[
                      { value: 'ALL', label: 'All Courses' },
                      ...Array.from(new Set(cbtQuestions.map((q) => q.courseCode))).map((code) => ({
                        value: code,
                        label: code,
                      })),
                    ]}
                  />
                </div>
              }
            />
          </Card>
        </div>
      )}

      {/* ─── TAB 4: STUDENT RESULTS ─── */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            {isStaff
              ? 'Real-time transcript of student practice test submissions, timing diagnostics, and pass status.'
              : 'Your personal transcript of completed computer-based practice exams and licensing readiness scores.'}
          </p>
          <Card>
            <Table
              columns={resultColumns}
              data={
                (isStaff
                  ? studentAttempts
                  : studentAttempts.filter(
                      (r) =>
                        r.matricNumber === 'BCHT/2026/0142' ||
                        r.studentName.toLowerCase().includes('blessing')
                    )
                ).filter((r) => {
                  if (resultSearchQuery.trim()) {
                    const s = resultSearchQuery.toLowerCase();
                    return (
                      r.studentName.toLowerCase().includes(s) ||
                      r.matricNumber.toLowerCase().includes(s) ||
                      r.testTitle.toLowerCase().includes(s)
                    );
                  }
                  return true;
                })
              }
              keyExtractor={(r) => r.id}
              isDense={isDense}
              searchValue={resultSearchQuery}
              onSearchChange={setResultSearchQuery}
              searchPlaceholder="Search student name, matric no, or test..."
            />
          </Card>
        </div>
      )}

      {/* ─── MODAL 1: IN-BROWSER MATERIAL PREVIEW ─── */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Curriculum Learning Resource Preview"
        size="lg"
      >
        {selectedMaterial && (
          <div className="space-y-4 text-xs text-slate-800">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#0F7640] text-xs">{selectedMaterial.courseCode}</span>
                <span className="text-slate-500">{selectedMaterial.fileSize}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{selectedMaterial.title}</h3>
              <p className="text-slate-500 text-[11px]">{selectedMaterial.description}</p>
            </div>

            {/* Document Reader Frame Placeholder */}
            <div className="border border-slate-200 rounded-[4px] p-6 bg-white space-y-4 text-slate-700 leading-relaxed text-[13px] max-h-80 overflow-y-auto">
              <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Chapter 1: Standard Protocols & Statutory Guidelines
              </h4>
              <p>
                This official college manual is approved by the Academic Board of {schoolProfile?.institutionName || "Bethsaida College of Health Technology"} for training in accordance with the regulatory curricula of the Federal Ministry of Health.
              </p>
              <p>
                All students must review the diagnostic and clinical procedures contained herein prior to posting in accredited teaching hospitals and rural health centers. Trainees are responsible for understanding sterile techniques, infection control procedures, and ethical patient engagement protocols.
              </p>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[4px] text-xs text-[#0F7640] font-semibold">
                Note: In-browser preview active. Download the full PDF for offline study on tablet or mobile.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setIsPreviewModalOpen(false)}>
                Close Preview
              </Button>
              <Button
                onClick={() => handleDownloadMaterial(selectedMaterial)}
                leftIcon={<Download className="w-3.5 h-3.5" />}
                className="whitespace-nowrap"
              >
                Download Document
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL 2: UPLOAD COURSE MATERIAL ─── */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Curriculum Learning Material"
        size="md"
      >
        <div className="space-y-4 text-xs text-slate-800">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Module Title:</label>
            <input
              type="text"
              placeholder="e.g. Clinical Hematology Standard Operating Manual"
              value={newMatTitle}
              onChange={(e) => setNewMatTitle(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Course Code:</label>
              <Select
                value={newMatCourse}
                onChange={(val) => setNewMatCourse(val)}
                options={[
                  { value: 'CHE 201', label: 'CHE 201 (Community Health)' },
                  { value: 'MLT 201', label: 'MLT 201 (Med Laboratory)' },
                  { value: 'PHT 201', label: 'PHT 201 (Pharmacy Tech)' },
                  { value: 'HIM 201', label: 'HIM 201 (Health Info)' },
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Resource Format:</label>
              <Select
                value={newMatType}
                onChange={(val) => setNewMatType(val as MaterialType)}
                options={[
                  { value: 'PDF_DOCUMENT', label: 'PDF Lecture Notes' },
                  { value: 'LAB_MANUAL', label: 'Laboratory Manual' },
                  { value: 'SLIDE_DECK', label: 'Slide Deck' },
                ]}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Curriculum Summary / Description:</label>
            <textarea
              rows={3}
              value={newMatDesc}
              onChange={(e) => setNewMatDesc(e.target.value)}
              placeholder="Outline the core topics covered in this resource..."
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadMaterial} className="bg-[#0F7640] hover:bg-[#093322]">
              Upload to Digital Library
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL: ADD CBT QUESTION TO BANK ─── */}
      <Modal
        isOpen={isCreateExamModalOpen}
        onClose={() => setIsCreateExamModalOpen(false)}
        title="Create & Schedule CBT Exam Suite"
        description="Configure a timed computer-based test for a course or licensing board simulation."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button size="sm" variant="secondary" onClick={() => setIsCreateExamModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (!newExamForm.title.trim()) {
                  showToast({
                    type: 'danger',
                    title: 'Missing Exam Title',
                    message: 'Please enter a title for the CBT examination suite.',
                  });
                  return;
                }
                const deptPrefix = newExamForm.courseCode.trim().split(/\s+/)[0] || 'CHE';
                const createdExam: PracticeTest = {
                  id: `cbt-${Date.now().toString().slice(-4)}`,
                  title: newExamForm.title.trim(),
                  courseCode: newExamForm.courseCode,
                  departmentCode: deptPrefix.slice(0, 3).toUpperCase(),
                  totalQuestions: Math.max(1, parseInt(newExamForm.totalQuestions, 10) || 10),
                  durationMinutes: Math.max(5, parseInt(newExamForm.durationMinutes, 10) || 45),
                  passMarkPercentage: Math.min(100, Math.max(10, parseInt(newExamForm.passMarkPercentage, 10) || 50)),
                  totalAttempts: 0,
                  avgScore: 0,
                  status: 'ACTIVE',
                  targetBoard: newExamForm.targetBoard,
                };
                setPracticeTests((prev) => [createdExam, ...prev]);
                recordAudit('CBT_EXAM_SUITE_CREATED', 'ONLINE_LEARNING', createdExam.courseCode, { title: createdExam.title });
                setIsCreateExamModalOpen(false);
                setNewExamForm({
                  title: '',
                  courseCode: 'CHE 201',
                  targetBoard: 'CHPRBN Licensing Board',
                  durationMinutes: '45',
                  passMarkPercentage: '50',
                  totalQuestions: '10',
                });
                showToast({
                  type: 'success',
                  title: 'CBT Exam Published',
                  message: `${createdExam.title} is now active for students in ${createdExam.courseCode}.`,
                });
              }}
            >
              Publish CBT Exam
            </Button>
          </div>
        }
      >
        <div className="space-y-3.5 text-xs text-slate-800 font-sans">
          <Input
            label="Examination Title"
            placeholder="e.g. CHE 201 Mid-Semester Continuous Assessment CBT"
            value={newExamForm.title}
            onChange={(e) => setNewExamForm({ ...newExamForm, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Target Course"
              options={
                courses && courses.length > 0
                  ? courses.map((c) => ({ value: c.code, label: `${c.code} — ${c.title}` }))
                  : [
                      { value: 'CHE 201', label: 'CHE 201 — Maternal & Child Health' },
                      { value: 'MLT 201', label: 'MLT 201 — Haematology' },
                      { value: 'PHT 201', label: 'PHT 201 — Pharmacology' },
                      { value: 'HIM 201', label: 'HIM 201 — Health Records' },
                    ]
              }
              value={newExamForm.courseCode}
              onChange={(val) => setNewExamForm({ ...newExamForm, courseCode: val })}
            />
            <Select
              label="Regulatory / Exam Standard"
              options={(schoolProfile?.regulatoryCouncils || ['CHPRBN', 'MLSCN', 'PCN', 'HRORBN', 'NBTE']).map((b) => ({
                value: b,
                label: b,
              }))}
              value={newExamForm.targetBoard}
              onChange={(val) => setNewExamForm({ ...newExamForm, targetBoard: val })}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Duration (Minutes)"
              type="number"
              value={newExamForm.durationMinutes}
              onChange={(e) => setNewExamForm({ ...newExamForm, durationMinutes: e.target.value })}
            />
            <Input
              label="Pass Mark (%)"
              type="number"
              value={newExamForm.passMarkPercentage}
              onChange={(e) => setNewExamForm({ ...newExamForm, passMarkPercentage: e.target.value })}
            />
            <Input
              label="Total Questions"
              type="number"
              value={newExamForm.totalQuestions}
              onChange={(e) => setNewExamForm({ ...newExamForm, totalQuestions: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAddQuestionModalOpen}
        onClose={() => setIsAddQuestionModalOpen(false)}
        title="Add Question to CBT Bank"
        description="Create a standardized clinical or theory multiple choice item with optional specimen diagram and answer rationale."
        size="lg"
      >
        <form onSubmit={handleAddNewQuestion} className="space-y-4 text-xs text-slate-800 font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Associated Course"
              options={
                courses && courses.length > 0
                  ? courses.map((c) => ({ value: c.code, label: `${c.code} - ${c.title}` }))
                  : [
                      { value: 'CHE 201', label: 'CHE 201 - Maternal & Child Health' },
                      { value: 'MLT 201', label: 'MLT 201 - Haematology & Blood Transfusion' },
                      { value: 'PHT 201', label: 'PHT 201 - Pharmacology & Dispensing' },
                      { value: 'HIM 201', label: 'HIM 201 - Health Records Management' },
                      { value: 'EHT 201', label: 'EHT 201 - Environmental Epidemiology' },
                    ]
              }
              value={newQCourse}
              onChange={(val) => setNewQCourse(val)}
            />
            <Select
              label="Cognitive Level"
              options={[
                { value: 'FOUNDATION', label: 'Foundation' },
                { value: 'INTERMEDIATE', label: 'Intermediate' },
                { value: 'ADVANCED', label: 'Advanced' },
              ]}
              value={newQDifficulty}
              onChange={(val) => setNewQDifficulty(val as DifficultyLevel)}
            />
            <Select
              label="Correct Answer Key"
              options={[
                { value: 'A', label: 'Option A' },
                { value: 'B', label: 'Option B' },
                { value: 'C', label: 'Option C' },
                { value: 'D', label: 'Option D' },
              ]}
              value={newCorrectOpt}
              onChange={(val) => setNewCorrectOpt(val)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Question Stem / Prompt:</label>
            <textarea
              rows={3}
              required
              value={newQText}
              onChange={(e) => setNewQText(e.target.value)}
              placeholder="Enter clear clinical scenario, microscopy finding, or theoretical prompt..."
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
            />
          </div>

          <PhotoUploadControl
            label="Clinical Diagram / Specimen Slide / X-Ray Image (Optional)"
            name={newQCourse}
            value={newQImageUrl}
            onChange={(url) => setNewQImageUrl(url)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Option A (Required)"
              value={newOptA}
              onChange={(e) => setNewOptA(e.target.value)}
              required
              placeholder="First choice..."
            />
            <Input
              label="Option B (Required)"
              value={newOptB}
              onChange={(e) => setNewOptB(e.target.value)}
              required
              placeholder="Second choice..."
            />
            <Input
              label="Option C"
              value={newOptC}
              onChange={(e) => setNewOptC(e.target.value)}
              placeholder="Third choice..."
            />
            <Input
              label="Option D"
              value={newOptD}
              onChange={(e) => setNewOptD(e.target.value)}
              placeholder="Fourth choice..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Clinical & Academic Rationale / Explanation:</label>
            <textarea
              rows={2}
              value={newQExplanation}
              onChange={(e) => setNewQExplanation(e.target.value)}
              placeholder="Provide why the correct option is clinically valid..."
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={() => setIsAddQuestionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
              Save Question to Bank
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL: QUESTION & CLINICAL RATIONALE INSPECTION (REPLACES TOAST) ─── */}
      <Modal
        isOpen={Boolean(selectedQuestionForModal)}
        onClose={() => setSelectedQuestionForModal(null)}
        title={selectedQuestionForModal ? `Question Key & Rationale — ${selectedQuestionForModal.courseCode}` : 'Question Details'}
        description="Official examination item, options, verified answer key, and clinical rationale."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button size="sm" variant="secondary" onClick={() => setSelectedQuestionForModal(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedQuestionForModal && (
          <div className="space-y-4 text-xs text-slate-800 font-sans">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#0F7640]">{selectedQuestionForModal.courseCode}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">Author: <strong>{selectedQuestionForModal.author}</strong></span>
              </div>
              <Badge variant="primary" size="sm">{selectedQuestionForModal.difficulty}</Badge>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Question Stem
              </span>
              <p className="font-bold text-slate-900 text-sm leading-relaxed">
                {selectedQuestionForModal.questionText}
              </p>
              {selectedQuestionForModal.imageUrl && (
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-[4px]">
                  <img
                    src={selectedQuestionForModal.imageUrl}
                    alt="Clinical Specimen / Diagram"
                    className="max-h-56 w-auto mx-auto rounded-[4px] object-contain"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Options &amp; Verified Key
              </span>
              <div className="space-y-1.5">
                {selectedQuestionForModal.options.map((opt) => {
                  const isCorrect = opt.id === selectedQuestionForModal.correctOptionId;
                  return (
                    <div
                      key={opt.id}
                      className={`p-2.5 rounded-[4px] border flex items-center justify-between gap-2 ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-[4px] flex items-center justify-center text-xs font-extrabold shrink-0 ${
                            isCorrect ? 'bg-[#0F7640] text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                      {isCorrect && <Badge variant="success" size="sm">CORRECT KEY</Badge>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[4px] space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0F7640] block">
                Official Clinical &amp; Academic Rationale
              </span>
              <p className="text-slate-800 leading-relaxed">{selectedQuestionForModal.explanation}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL: OFFICIAL CBT EXAMINATION RESULT SLIP ─── */}
      <Modal
        isOpen={Boolean(selectedAttemptForModal)}
        onClose={() => setSelectedAttemptForModal(null)}
        title="Official CBT Examination Result Slip"
        description="Verified computer-based assessment diagnostic transcript."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              onClick={() => {
                if (!selectedAttemptForModal) return;
                printInstitutionalDocument({
                  title: `CBT Examination Result Slip — ${selectedAttemptForModal.studentName}`,
                  badgeText: `OFFICIAL CBT ASSESSMENT RESULT SLIP`,
                  referenceNo: `BCHT/CBT/${selectedAttemptForModal.id.toUpperCase()}`,
                  issuedDate: selectedAttemptForModal.dateAttempted,
                  schoolProfile,
                  officeSubtitle: 'Directorate of Computer-Based Testing & Academic Examinations',
                  metaItems: [
                    { label: 'Candidate / Student Name', value: selectedAttemptForModal.studentName, highlight: true },
                    { label: 'Matriculation Number', value: selectedAttemptForModal.matricNumber, highlight: true },
                    { label: 'Examination Suite', value: selectedAttemptForModal.testTitle },
                    { label: 'Date Attempted', value: selectedAttemptForModal.dateAttempted },
                    {
                      label: 'Time Taken',
                      value: formatElapsedDuration(
                        selectedAttemptForModal.timeSpentMinutes,
                        selectedAttemptForModal.timeSpentSeconds
                      ),
                    },
                    {
                      label: 'Proctoring Integrity',
                      value:
                        (selectedAttemptForModal.proctorWarnings || 0) === 0
                          ? 'Verified Clean (0 Violations)'
                          : `${selectedAttemptForModal.proctorWarnings} Window Warning(s)`,
                    },
                  ],
                  bodyHtml: `
                    <div class="callout-green" style="display:flex; justify-content:space-between; align-items:center;">
                      <div>
                        <div style="font-size:12px; font-weight:800; text-transform:uppercase;">Final Examination Score</div>
                        <div style="font-size:10.5px;">Statutory Pass Benchmark: 50%</div>
                      </div>
                      <div style="text-align:right;">
                        <div style="font-size:16px; font-weight:800; color:#0F7640;">
                          ${selectedAttemptForModal.score} / ${selectedAttemptForModal.totalQuestions} (${selectedAttemptForModal.percentage}%)
                        </div>
                        <div style="font-size:10px; font-weight:800;">
                          ${selectedAttemptForModal.passed ? 'PASSED & QUALIFIED' : 'BELOW PASS MARK'}
                        </div>
                      </div>
                    </div>
                  `,
                  stampText: selectedAttemptForModal.passed ? 'CBT PASSED' : 'CBT RECORDED',
                });
              }}
            >
              Print Result Slip
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setSelectedAttemptForModal(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedAttemptForModal && (
          <div className="space-y-4 text-xs text-slate-800 font-sans">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <PersonAvatar
                  name={selectedAttemptForModal.studentName}
                  matricNumber={selectedAttemptForModal.matricNumber}
                  size="md"
                />
                <div>
                  <p className="font-bold text-slate-900 text-sm">{selectedAttemptForModal.studentName}</p>
                  <p className="font-bold text-[#0F7640] text-xs">{selectedAttemptForModal.matricNumber}</p>
                </div>
              </div>
              <Badge variant={selectedAttemptForModal.passed ? 'success' : 'danger'}>
                {selectedAttemptForModal.passed ? 'PASSED' : 'FAILED'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-[4px]">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Examination</span>
                <span className="font-bold text-slate-900">{selectedAttemptForModal.testTitle}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Date Completed</span>
                <span className="font-semibold text-slate-800">{selectedAttemptForModal.dateAttempted}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Raw Score &amp; Percentage</span>
                <span className="font-extrabold text-sm text-[#0F7640]">
                  {selectedAttemptForModal.score} of {selectedAttemptForModal.totalQuestions} ({selectedAttemptForModal.percentage}%)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Actual Time Taken</span>
                <span className="font-bold text-slate-900">
                  {formatElapsedDuration(
                    selectedAttemptForModal.timeSpentMinutes,
                    selectedAttemptForModal.timeSpentSeconds
                  )}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[4px] flex items-center justify-between text-[11px] text-emerald-900">
              <span className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0F7640]" />
                Proctoring &amp; Integrity Status:
              </span>
              <span className="font-bold">
                {(selectedAttemptForModal.proctorWarnings || 0) === 0
                  ? 'Clean Session (0 Tab Violations)'
                  : `${selectedAttemptForModal.proctorWarnings} Tab Switch Warning(s)`}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── FULL-SCREEN INTERACTIVE LIVE CBT & EXAMINATION WORKSPACE ─── */}
      {isCbtModalOpen && (() => {
        const examPool = activeExamQuestions.length > 0 ? activeExamQuestions : cbtQuestions;
        const currentQuestion = examPool[currentQuestionIndex];
        const answeredCount = Object.keys(userAnswers).length;
        const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
        const progressPct = examPool.length > 0 ? Math.round((answeredCount / examPool.length) * 100) : 0;

        return (
          <div
            className="fixed inset-0 z-[100] bg-slate-50 flex flex-col overflow-hidden font-sans select-none"
            onContextMenu={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            role="region"
            aria-label={activeTest ? `${activeTest.title} Full-Screen Examination` : 'Full-Screen CBT Examination'}
          >
            {/* ─── TOP INSTITUTIONAL EXAMINATION BAR ─── */}
            <header className="bg-[#093322] text-white px-4 sm:px-6 lg:px-8 py-3 border-b border-emerald-950/60 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-bold text-xs bg-[#0F7640] border border-emerald-400/30 px-2.5 py-1 rounded-[4px] shrink-0">
                  {activeTest?.courseCode || 'CBT'}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm sm:text-base font-bold tracking-tight truncate">
                      {activeTest ? activeTest.title : 'Computer-Based Examination'}
                    </h1>
                    <span className="hidden md:inline-block text-[10px] bg-white/10 text-emerald-200 px-2 py-0.5 rounded-[4px] font-semibold uppercase tracking-wider shrink-0">
                      Proctored &bull; Randomized
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80 truncate">
                    {persona?.fullName || session.fullName} {!isSubmitted && `\u2022 Question ${currentQuestionIndex + 1} of ${examPool.length}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {!isSubmitted && (
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border text-xs sm:text-sm font-bold ${
                      secondsRemaining < 120
                        ? 'bg-red-950/80 border-red-400/50 text-red-200'
                        : 'bg-[#052015] border-emerald-700/60 text-amber-300'
                    }`}
                  >
                    <Clock className={`w-4 h-4 shrink-0 ${secondsRemaining < 120 ? 'animate-pulse text-red-300' : 'text-amber-400'}`} />
                    <span className="tracking-wider">{formatTimer(secondsRemaining)}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={toggleCbtBrowserFullscreen}
                  title={isCbtFullscreen ? 'Exit browser fullscreen' : 'Enter browser fullscreen'}
                  aria-label={isCbtFullscreen ? 'Exit browser fullscreen' : 'Enter browser fullscreen'}
                  className="px-2.5 py-1.5 rounded-[4px] bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {isCbtFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isCbtFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isSubmitted) {
                      setExitPrompt(true);
                      return;
                    }
                    setExitPrompt(false);
                    setIsCbtModalOpen(false);
                  }}
                  aria-label="Leave examination"
                  className="px-2.5 py-1.5 rounded-[4px] bg-white/10 hover:bg-red-600/80 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">{isSubmitted ? 'Close' : 'Exit'}</span>
                </button>
              </div>
            </header>

            {/* ─── EXIT / PROCTORING ALERTS STRIP ─── */}
            {((exitPrompt && !isSubmitted) || (proctorWarnings > 0 && !isSubmitted)) && (
              <div className="px-4 sm:px-8 pt-3 space-y-2 shrink-0 bg-slate-50">
                {exitPrompt && !isSubmitted && (
                  <div className="max-w-5xl mx-auto border border-amber-200 bg-amber-50 p-3 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <p className="text-slate-800 font-medium">
                      Leave this examination? Unsubmitted answers will be closed and discarded.
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="secondary" size="sm" onClick={() => setExitPrompt(false)}>
                        Stay in Exam
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setExitPrompt(false);
                          setIsCbtModalOpen(false);
                        }}
                      >
                        Leave Examination
                      </Button>
                    </div>
                  </div>
                )}

                {proctorWarnings > 0 && !isSubmitted && (
                  <div className="max-w-5xl mx-auto p-3 bg-red-50 border border-red-200 rounded-[4px] flex flex-wrap items-center justify-between gap-2 text-red-800 text-xs font-semibold">
                    <span>
                      Proctoring Alert (Strike {proctorWarnings} of 3): Switching tabs or leaving the examination window is strictly prohibited.
                    </span>
                    <Badge variant="danger" size="sm">Auto-Submit at 3/3</Badge>
                  </div>
                )}
              </div>
            )}

            {/* ─── MAIN WORKSPACE ─── */}
            {!isSubmitted ? (
              <>
                <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
                  {/* LEFT / CENTER: QUESTION CANVAS */}
                  <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">
                    <div className="max-w-3xl mx-auto">
                      <div className="p-5 sm:p-8 bg-white border border-slate-200 rounded-[4px] shadow-sm space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              Question {currentQuestionIndex + 1} of {examPool.length}
                            </span>
                            {currentQuestion?.difficulty && (
                              <Badge variant="neutral" size="sm">{currentQuestion.difficulty}</Badge>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={toggleFlagQuestion}
                            className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                              flaggedQuestions[currentQuestionIndex]
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <Flag className="w-3.5 h-3.5" />
                            <span>{flaggedQuestions[currentQuestionIndex] ? 'Flagged for Review' : 'Flag Question'}</span>
                          </button>
                        </div>

                        <div className="space-y-4">
                          <p className="font-bold text-slate-900 text-base sm:text-lg leading-relaxed">
                            {currentQuestion?.questionText}
                          </p>
                          {currentQuestion?.imageUrl && (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px]">
                              <img
                                src={currentQuestion.imageUrl}
                                alt="Clinical Examination Figure"
                                className="max-h-72 w-auto mx-auto rounded-[4px] object-contain"
                              />
                            </div>
                          )}
                        </div>

                        {/* Options List */}
                        <div className="space-y-3 pt-1">
                          {currentQuestion?.options.map((opt) => {
                            const isSelected = userAnswers[currentQuestionIndex] === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleSelectAnswer(opt.id)}
                                className={`w-full min-h-[52px] text-left px-4 py-3.5 rounded-[4px] border flex items-center gap-3.5 transition-colors ${
                                  isSelected
                                    ? 'bg-emerald-50 border-[#0F7640] text-slate-900 ring-1 ring-[#0F7640] font-semibold'
                                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700'
                                }`}
                              >
                                <span
                                  className={`w-7 h-7 rounded-[4px] border flex items-center justify-center text-xs font-bold shrink-0 ${
                                    isSelected
                                      ? 'bg-[#0F7640] text-white border-[#0F7640]'
                                      : 'border-slate-300 text-slate-600 bg-slate-50'
                                  }`}
                                >
                                  {opt.id}
                                </span>
                                <span className="text-sm leading-snug">{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </main>

                  {/* RIGHT SIDEBAR: QUESTION NAVIGATOR */}
                  <aside className="w-full lg:w-80 xl:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col shrink-0 max-h-[34vh] lg:max-h-none">
                    <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 uppercase tracking-wider">Question Palette</span>
                        <span className="font-semibold text-[#0F7640]">
                          {answeredCount}/{examPool.length} Answered
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-[4px] overflow-hidden">
                        <div
                          className="h-full bg-[#0F7640] transition-all duration-200"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-[4px] bg-[#0F7640] inline-block" /> Current
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-[4px] bg-emerald-100 border border-emerald-300 inline-block" /> Answered
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-[4px] bg-amber-500 inline-block" /> Flagged ({flaggedCount})
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                      <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-5 gap-2">
                        {examPool.map((_, idx) => {
                          const isAnswered = userAnswers[idx] !== undefined;
                          const isCurrent = idx === currentQuestionIndex;
                          const isFlagged = flaggedQuestions[idx];

                          let btnClass = 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100';
                          if (isCurrent) {
                            btnClass = 'bg-[#0F7640] text-white border-[#0F7640] ring-2 ring-emerald-300';
                          } else if (isFlagged) {
                            btnClass = 'bg-amber-500 text-white border-amber-500';
                          } else if (isAnswered) {
                            btnClass = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
                          }

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setCurrentQuestionIndex(idx)}
                              className={`h-10 rounded-[4px] border text-xs font-semibold flex items-center justify-center transition-all ${btnClass}`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="hidden lg:block p-5 border-t border-slate-200 bg-slate-50/70">
                      <Button
                        variant="primary"
                        onClick={handleSubmitCbt}
                        leftIcon={<Check className="w-4 h-4" />}
                        className="w-full whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
                      >
                        Submit Exam ({answeredCount}/{examPool.length})
                      </Button>
                    </div>
                  </aside>
                </div>

                {/* ─── STICKY BOTTOM CONTROLS ─── */}
                <footer className="bg-white border-t border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between gap-3 shrink-0">
                  <Button
                    variant="secondary"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                    className="whitespace-nowrap"
                  >
                    Previous
                  </Button>

                  <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                    Question {currentQuestionIndex + 1} of {examPool.length}
                  </span>

                  <div className="flex items-center gap-2">
                    {currentQuestionIndex < examPool.length - 1 ? (
                      <Button
                        variant="primary"
                        onClick={() => setCurrentQuestionIndex((prev) => Math.min(examPool.length - 1, prev + 1))}
                        rightIcon={<ChevronRight className="w-4 h-4" />}
                        className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
                      >
                        Next Question
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={handleSubmitCbt}
                        leftIcon={<Check className="w-4 h-4" />}
                        className="whitespace-nowrap bg-emerald-700 hover:bg-emerald-800"
                      >
                        Submit Exam
                      </Button>
                    )}
                  </div>
                </footer>
              </>
            ) : (
              /* ─── FULL-SCREEN CBT SCORE REPORT & DIAGNOSTICS ─── */
              <main className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-xl bg-white border border-slate-200 rounded-[4px] shadow-sm p-6 sm:p-10 space-y-6 text-center">
                  <div className="w-16 h-16 mx-auto rounded-[4px] bg-emerald-50 border border-emerald-200 text-[#0F7640] flex items-center justify-center">
                    <Award className="w-8 h-8" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Computer-Based Test Completed
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Official diagnostic assessment report for {activeTest?.title}
                    </p>
                  </div>

                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-[4px] grid grid-cols-3 gap-4 text-left">
                    <div>
                      <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold block">Your Score</span>
                      <span className="text-2xl font-bold text-slate-900">
                        {cbtResult?.score} / {examPool.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold block">Percentage</span>
                      <span className={`text-2xl font-bold ${cbtResult?.passed ? 'text-[#13A348]' : 'text-[#F83A20]'}`}>
                        {cbtResult?.percentage}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold block">Time Taken</span>
                      <span className="text-lg font-bold text-slate-900 block mt-0.5">
                        {formatElapsedDuration(cbtResult?.timeSpentMinutes || 1, cbtResult?.timeSpentSeconds)}
                      </span>
                    </div>
                  </div>

                  <div className="inline-block">
                    <Badge variant={cbtResult?.passed ? 'success' : 'danger'} size="md">
                      {cbtResult?.passed ? 'QUALIFIED (50% or higher)' : 'BELOW PASS MARK'}
                    </Badge>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {cbtResult?.passed
                      ? 'Congratulations! You have satisfied the statutory 50% pass mark for this licensing simulation. Your score and time taken have been logged in Student Results.'
                      : 'You scored below the 50% pass mark. It is recommended to review the course materials and re-attempt this practice exam.'}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-200">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsSubmitted(false);
                        startCbtExam(activeTest || practiceTests[0]);
                      }}
                      leftIcon={<RotateCcw className="w-4 h-4" />}
                      className="whitespace-nowrap"
                    >
                      Retake Practice Exam
                    </Button>
                    <Button
                      onClick={() => {
                        setIsCbtModalOpen(false);
                        handleTabChange('results');
                      }}
                      className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
                    >
                      View in Student Results
                    </Button>
                  </div>
                </div>
              </main>
            )}
          </div>
        );
      })()}
    </div>
  );
};

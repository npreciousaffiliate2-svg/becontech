import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import { supabase } from '../lib/supabase.ts';
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
} from 'lucide-react';

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
  testId: string;
  testTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentMinutes: number;
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

  /* ─── MODAL STATES ─── */
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterial | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);

  /* ─── INTERACTIVE LIVE CBT SIMULATOR STATE ─── */
  const [isCbtModalOpen, setIsCbtModalOpen] = useState(false);
  const [activeTest, setActiveTest] = useState<PracticeTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(45 * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [exitPrompt, setExitPrompt] = useState(false);
  const finishingRef = useRef(false);
  const finishExamRef = useRef<() => void>(() => {});
  const [cbtResult, setCbtResult] = useState<{ score: number; percentage: number; passed: boolean } | null>(null);

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
  const [practiceTests] = useState<PracticeTest[]>([
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
  const [studentAttempts] = useState<StudentAttempt[]>([
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

  /* ─── TIMER EFFECT FOR CBT SIMULATOR ─── */
  useEffect(() => {
    if (!isCbtModalOpen || isSubmitted) return;
    const interval = window.setInterval(() => {
      setSecondsRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isCbtModalOpen, isSubmitted]);

  useEffect(() => {
    if (!isCbtModalOpen || isSubmitted || secondsRemaining !== 0 || finishingRef.current) return;
    finishingRef.current = true;
    finishExamRef.current();
  }, [isCbtModalOpen, isSubmitted, secondsRemaining]);

  /* ─── CBT ACTIONS ─── */
  const startCbtExam = (test: PracticeTest) => {
    setActiveTest(test);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setFlaggedQuestions({});
    setSecondsRemaining(test.durationMinutes * 60);
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

  const calculateAndFinishCbt = () => {
    let correctCount = 0;
    cbtQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctOptionId) {
        correctCount += 1;
      }
    });

    const total = cbtQuestions.length;
    const percentage = total === 0 ? 0 : Math.round((correctCount / total) * 100);
    const passed = percentage >= (activeTest?.passMarkPercentage || 50);

    setCbtResult({
      score: correctCount,
      percentage,
      passed,
    });
    setIsSubmitted(true);

    recordAudit('CBT_PRACTICE_EXAM_SUBMITTED', 'ONLINE_LEARNING', activeTest?.courseCode || 'CHE 201');
    showToast({
      type: passed ? 'success' : 'warning',
      title: 'Practice Test Completed',
      message: `Score: ${correctCount} of ${total} (${percentage}%). ${passed ? 'Congratulations, you passed!' : 'Review recommended.'}`,
    });
  };
  finishExamRef.current = calculateAndFinishCbt;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  /* ─── MATERIAL ACTIONS ─── */
  const handleDownloadMaterial = (m: CourseMaterial) => {
    showToast({
      type: 'warning',
      title: 'File Not Attached',
      message: `"${m.title}" is listed in the library, but no document file is stored for download.`,
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
        <span className="font-semibold text-slate-800">{r.studentName}</span>
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
        <span className="text-xs text-slate-600">{r.timeSpentMinutes} mins</span>
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
      options: [
        { id: 'A', text: newOptA.trim() },
        { id: 'B', text: newOptB.trim() },
        { id: 'C', text: newOptC.trim() || 'None of the above' },
        { id: 'D', text: newOptD.trim() || 'All of the above' },
      ],
      correctOptionId: newCorrectOpt as any,
      difficulty: 'INTERMEDIATE',
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
        <p className="text-xs text-slate-800 line-clamp-2 max-w-md" title={q.questionText}>
          {q.questionText}
        </p>
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
        <span className="text-xs text-slate-600">{q.author}</span>
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
          onClick={() => {
            showToast({
              type: 'info',
              title: 'Correct Key & Rationale',
              message: `Option ${q.correctOptionId}: ${q.explanation}`,
            });
          }}
          className="whitespace-nowrap"
        >
          View Answer
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
            <Button
              size="sm"
              onClick={() => startCbtExam(practiceTests[0])}
              leftIcon={<Play className="w-3.5 h-3.5" />}
              className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
            >
              Launch CBT Simulator
            </Button>
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
            <Badge variant="primary">Computer-Based Testing Engine</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {practiceTests.map((t) => (
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
                    {t.totalQuestions} Questions • {t.durationMinutes} Minutes • Pass Mark: {t.passMarkPercentage}%
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-[4px] border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>{t.totalAttempts} Trainees Completed</span>
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
                  showToast({
                    type: 'info',
                    title: 'Question Bank Export',
                    message: 'Exporting encrypted question catalog for Senate examination moderation.',
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
              data={cbtQuestions}
              keyExtractor={(q) => q.id}
              isDense={isDense}
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
                isStaff
                  ? studentAttempts
                  : studentAttempts.filter(
                      (r) =>
                        r.matricNumber === 'BCHT/2026/0142' ||
                        r.studentName.toLowerCase().includes('blessing')
                    )
              }
              keyExtractor={(r) => r.id}
              isDense={isDense}
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
        isOpen={isAddQuestionModalOpen}
        onClose={() => setIsAddQuestionModalOpen(false)}
        title="Add Question to CBT Bank"
        description="Create a standardized clinical or theory multiple choice item with answer rationale."
        size="lg"
      >
        <form onSubmit={handleAddNewQuestion} className="space-y-4 text-xs text-slate-800 font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              placeholder="Enter clear clinical scenario or theoretical prompt..."
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
            />
          </div>

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

      {/* ─── MODAL 3: FULL-SCREEN INTERACTIVE LIVE CBT PRACTICE SIMULATOR ─── */}
      <Modal
        isOpen={isCbtModalOpen}
        onClose={() => {
          if (!isSubmitted) {
            setExitPrompt(true);
            return;
          }
          setExitPrompt(false);
          setIsCbtModalOpen(false);
        }}
        title={activeTest ? `${activeTest.title}` : 'CBT Practice Simulator'}
        size="lg"
      >
        <div className="space-y-5 text-xs text-slate-800">
          {exitPrompt && !isSubmitted && (
            <div className="border border-amber-200 bg-amber-50 p-3 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-slate-800">Leave this examination? Unsubmitted answers will be closed.</p>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="secondary" size="sm" onClick={() => setExitPrompt(false)}>
                  Stay
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setExitPrompt(false);
                    setIsCbtModalOpen(false);
                  }}
                >
                  Leave examination
                </Button>
              </div>
            </div>
          )}
          {!isSubmitted ? (
            <>
              {/* CBT Top Bar: Timer, Course Badge, Flag Button */}
              <div className="p-3 bg-slate-900 text-white rounded-[4px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs bg-[#0F7640] px-2 py-0.5 rounded-[4px]">
                    {activeTest?.courseCode}
                  </span>
                  <span className="text-slate-300 text-xs hidden sm:inline">
                    Question {currentQuestionIndex + 1} of {cbtQuestions.length}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-[4px] border border-slate-700">
                    <Clock className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                    <span className="font-bold text-sm tracking-wider text-amber-300">
                      {formatTimer(secondsRemaining)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={toggleFlagQuestion}
                    className={`px-2.5 py-1 rounded-[4px] text-xs font-semibold flex items-center gap-1 transition-colors ${
                      flaggedQuestions[currentQuestionIndex]
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Flag className="w-3 h-3" />
                    <span className="hidden sm:inline">Flag</span>
                  </button>
                </div>
              </div>

              {/* Question Navigation Palette */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-[4px] flex flex-wrap items-center gap-1.5">
                {cbtQuestions.map((_, idx) => {
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
                      className={`w-7 h-7 rounded-[4px] border text-xs font-semibold flex items-center justify-center transition-all ${btnClass}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Question Body */}
              <div className="p-5 bg-white border border-slate-200 rounded-[4px] space-y-4">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] font-semibold uppercase">
                    Question {currentQuestionIndex + 1}
                  </span>
                  <p className="font-bold text-slate-900 text-sm leading-relaxed">
                    {cbtQuestions[currentQuestionIndex]?.questionText}
                  </p>
                </div>

                {/* Options List */}
                <div className="space-y-2 pt-2">
                  {cbtQuestions[currentQuestionIndex]?.options.map((opt) => {
                    const isSelected = userAnswers[currentQuestionIndex] === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectAnswer(opt.id)}
                        className={`p-3 rounded-[4px] border cursor-pointer flex items-center gap-3 transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 border-[#0F7640] text-slate-900 ring-1 ring-[#0F7640]'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-[4px] border flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSelected
                              ? 'bg-[#0F7640] text-white border-[#0F7640]'
                              : 'border-slate-300 text-slate-600'
                          }`}
                        >
                          {opt.id}
                        </div>
                        <span className="text-xs font-medium leading-relaxed">{opt.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CBT Footer Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <Button
                  variant="secondary"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                  className="whitespace-nowrap"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {currentQuestionIndex < cbtQuestions.length - 1 ? (
                    <Button
                      variant="primary"
                      onClick={() => setCurrentQuestionIndex((prev) => Math.min(cbtQuestions.length - 1, prev + 1))}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                      className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleSubmitCbt}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                      className="whitespace-nowrap bg-emerald-700 hover:bg-emerald-800"
                    >
                      Submit Exam
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* ─── CBT SCORE REPORT & DIAGNOSTICS ─── */
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shadow-sm">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Computer-Based Test Completed
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Official diagnostic assessment report for {activeTest?.title}
                </p>
              </div>

              <div className="max-w-sm mx-auto p-4 bg-slate-50 border border-slate-200 rounded-[4px] grid grid-cols-2 gap-3 text-left">
                <div>
                  <span className="text-slate-400 text-[11px] block">Your Score</span>
                  <span className="text-2xl font-bold text-slate-900">
                    {cbtResult?.score} of {cbtQuestions.length}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Percentage</span>
                  <span className={`text-2xl font-bold ${cbtResult?.passed ? 'text-[#13A348]' : 'text-[#F83A20]'}`}>
                    {cbtResult?.percentage}%
                  </span>
                </div>
              </div>

              <div className="inline-block">
                <Badge variant={cbtResult?.passed ? 'success' : 'danger'}>
                  {cbtResult?.passed ? 'QUALIFIED (50% or higher)' : 'BELOW PASS MARK'}
                </Badge>
              </div>

              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {cbtResult?.passed
                  ? 'Congratulations! You have satisfied the statutory 50% pass mark for this licensing simulation.'
                  : 'You scored below the 50% pass mark. It is recommended to review the course materials and re-attempt this practice exam.'}
              </p>

              <div className="flex items-center justify-center gap-2 pt-4 border-t border-slate-200">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsSubmitted(false);
                    startCbtExam(activeTest || practiceTests[0]);
                  }}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  className="whitespace-nowrap"
                >
                  Retake Practice Exam
                </Button>
                <Button
                  onClick={() => setIsCbtModalOpen(false)}
                  className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
                >
                  Return to Learning Portal
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

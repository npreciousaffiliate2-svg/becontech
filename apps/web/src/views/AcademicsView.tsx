import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import {
  Card,
  Button,
  Table,
  Badge,
  Modal,
  Input,
  Select,
  useToast,
  Tabs,
} from '@campusone/ui';
import {
  CheckCircle2,
  Lock,
  Printer,
  Download,
  Search,
  Plus,
  FileText,
  Award,
  GraduationCap,
  Calendar,
  Layers,
  BookOpen,
} from 'lucide-react';
import {
  computeSemesterGpa,
  computeCourseResult,
  DEFAULT_GRADING_SCALE,
} from '@campusone/contracts';

interface StudentScoreRecord {
  matricNumber: string;
  studentName: string;
  caScore: number;
  examScore: number;
}

interface BroadsheetRow {
  matricNumber: string;
  studentName: string;
  courseScores: Record<string, { total: number; grade: string; points: number }>;
  totalUnits: number;
  totalPoints: number;
  gpa: number;
  cgpa: number;
  standing: 'PASS' | 'DEAN_LIST' | 'PROBATION';
}

interface CurriculumCourse {
  code: string;
  title: string;
  departmentCode: string;
  departmentName: string;
  level: string;
  semester: string;
  creditUnits: number;
  theoryHours: number;
  practicalHours: number;
  lecturer: string;
}

export const AcademicsView: React.FC = () => {
  const { session, persona, recordAudit, isDense, courses, addCourse, updateCourse, deleteCourse, departments, schoolProfile } = useApp();
  const { showToast } = useToast();
  const { tab: routeTab } = useParams();
  const navigate = useNavigate();

  // Role Scope Enforcer: Students & Sponsors view personal broadsheet & transcripts only
  const isStudent = session.activeRole === 'STU' || session.activeRole === 'SPON';

  // Industry-standard page routing with role defaults
  const activeTab = isStudent
    ? routeTab === 'transcript'
      ? 'transcript'
      : 'broadsheet'
    : routeTab || 'scores';

  const handleTabChange = (id: string) => {
    if (id === 'scores') {
      navigate('/academics');
    } else {
      navigate(`/academics/${id}`);
    }
  };

  // Score Entry Grid State
  const [selectedCourse, setSelectedCourse] = useState('CHE 101');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('CHE');
  const [workflowStatus, setWorkflowStatus] = useState<'DRAFT' | 'HOD_APPROVED' | 'DEAN_APPROVED' | 'PUBLISHED'>('DRAFT');

  // Interactive Scores State for CHE 101
  const [scores, setScores] = useState<StudentScoreRecord[]>([
    { matricNumber: 'CHE/2026/0014', studentName: 'Blessing Adeyemi', caScore: 26, examScore: 54 },
    { matricNumber: 'CHE/2026/0015', studentName: 'Oluwaseun Bakare', caScore: 22, examScore: 46 },
    { matricNumber: 'CHE/2026/0016', studentName: 'Fatima Ibrahim', caScore: 28, examScore: 60 },
    { matricNumber: 'CHE/2026/0017', studentName: 'Chinedu Eze', caScore: 14, examScore: 24 },
    { matricNumber: 'CHE/2026/0018', studentName: 'Amina Yusuf', caScore: 25, examScore: 52 },
    { matricNumber: 'CHE/2026/0019', studentName: 'David Adeleke', caScore: 27, examScore: 58 },
  ]);

  // Broadsheet State
  const [broadsheetDept, setBroadsheetDept] = useState('CHE');
  const [broadsheetLevel, setBroadsheetLevel] = useState('100 Level');
  const [broadsheetSemester, setBroadsheetSemester] = useState('Harmattan');
  const [isBroadsheetRatified, setIsBroadsheetRatified] = useState(true);

  // Broadsheet Data
  const broadsheetData: BroadsheetRow[] = [
    {
      matricNumber: 'CHE/2026/0014',
      studentName: 'Blessing Adeyemi',
      courseScores: {
        'CHE 101': { total: 80, grade: 'A', points: 15 },
        'CHE 102': { total: 68, grade: 'B', points: 12 },
        'CHE 103': { total: 72, grade: 'A', points: 20 },
      },
      totalUnits: 10,
      totalPoints: 47,
      gpa: 4.70,
      cgpa: 4.25,
      standing: 'DEAN_LIST',
    },
    {
      matricNumber: 'CHE/2026/0015',
      studentName: 'Oluwaseun Bakare',
      courseScores: {
        'CHE 101': { total: 68, grade: 'B', points: 12 },
        'CHE 102': { total: 62, grade: 'B', points: 12 },
        'CHE 103': { total: 55, grade: 'C', points: 12 },
      },
      totalUnits: 10,
      totalPoints: 36,
      gpa: 3.60,
      cgpa: 3.52,
      standing: 'PASS',
    },
    {
      matricNumber: 'CHE/2026/0016',
      studentName: 'Fatima Ibrahim',
      courseScores: {
        'CHE 101': { total: 88, grade: 'A', points: 15 },
        'CHE 102': { total: 84, grade: 'A', points: 15 },
        'CHE 103': { total: 78, grade: 'A', points: 20 },
      },
      totalUnits: 10,
      totalPoints: 50,
      gpa: 5.00,
      cgpa: 4.68,
      standing: 'DEAN_LIST',
    },
    {
      matricNumber: 'CHE/2026/0017',
      studentName: 'Chinedu Eze',
      courseScores: {
        'CHE 101': { total: 38, grade: 'F', points: 0 },
        'CHE 102': { total: 42, grade: 'F', points: 0 },
        'CHE 103': { total: 46, grade: 'D', points: 8 },
      },
      totalUnits: 10,
      totalPoints: 8,
      gpa: 0.80,
      cgpa: 1.45,
      standing: 'PROBATION',
    },
  ];

  // Transcript State
  const [transcriptMatric, setTranscriptMatric] = useState('CHE/2026/0014');
  const [selectedTranscript, setSelectedTranscript] = useState<boolean>(false);

  // Curriculum State
  const [curriculumCourses, setCurriculumCourses] = useState<CurriculumCourse[]>([
    { code: 'CHE 101', title: 'Introduction to Primary Healthcare', departmentCode: 'CHE', departmentName: 'Community Health', level: '100 Level', semester: 'Harmattan', creditUnits: 3, theoryHours: 2, practicalHours: 3, lecturer: 'Dr. K. Bello' },
    { code: 'CHE 102', title: 'Community Diagnosis & Field Survey', departmentCode: 'CHE', departmentName: 'Community Health', level: '100 Level', semester: 'Harmattan', creditUnits: 3, theoryHours: 2, practicalHours: 3, lecturer: 'Mrs. R. Ajayi' },
    { code: 'CHE 201', title: 'Maternal & Child Health Clinicals', departmentCode: 'CHE', departmentName: 'Community Health', level: '200 Level', semester: 'Harmattan', creditUnits: 4, theoryHours: 2, practicalHours: 6, lecturer: 'Mr. D. Alabi' },
    { code: 'CHE 301', title: 'Rural Healthcare Administration', departmentCode: 'CHE', departmentName: 'Community Health', level: '300 Level', semester: 'Harmattan', creditUnits: 3, theoryHours: 3, practicalHours: 0, lecturer: 'Nurse E. Okon' },
    { code: 'MLT 101', title: 'Basic Clinical Chemistry & Laboratory Safety', departmentCode: 'MLT', departmentName: 'Medical Laboratory', level: '100 Level', semester: 'Harmattan', creditUnits: 3, theoryHours: 2, practicalHours: 3, lecturer: 'Mr. O. Adebisi' },
    { code: 'MLT 102', title: 'Medical Microbiology & Parasitology', departmentCode: 'MLT', departmentName: 'Medical Laboratory', level: '100 Level', semester: 'Harmattan', creditUnits: 4, theoryHours: 2, practicalHours: 6, lecturer: 'Dr. S. Nnamdi' },
    { code: 'MLT 201', title: 'Haematology & Blood Transfusion Science', departmentCode: 'MLT', departmentName: 'Medical Laboratory', level: '200 Level', semester: 'Harmattan', creditUnits: 4, theoryHours: 2, practicalHours: 6, lecturer: 'Miss B. Eze' },
    { code: 'PHT 101', title: 'Dispensing Principles & Pharmaceutical Calculations', departmentCode: 'PHT', departmentName: 'Pharmacy Technician', level: '100 Level', semester: 'Harmattan', creditUnits: 3, theoryHours: 2, practicalHours: 3, lecturer: 'Pharm. F. Oladipo' },
    { code: 'PHT 102', title: 'Pharmacology for Pharmacy Technicians', departmentCode: 'PHT', departmentName: 'Pharmacy Technician', level: '100 Level', semester: 'Harmattan', creditUnits: 4, theoryHours: 3, practicalHours: 3, lecturer: 'Pharm. T. Adele' },
    { code: 'HIM 101', title: 'Medical Terminology & Anatomy for Health Records', departmentCode: 'HIM', departmentName: 'Health Information', level: '100 Level', semester: 'Harmattan', creditUnits: 3, theoryHours: 3, practicalHours: 0, lecturer: 'Mrs. T. Adeleke' },
    { code: 'EHT 101', title: 'Principles of Environmental Sanitation & Hygiene', departmentCode: 'EHT', departmentName: 'Environmental Health', level: '100 Level', semester: 'Harmattan', creditUnits: 3, theoryHours: 2, practicalHours: 3, lecturer: 'Sanitarian B. Ibrahim' },
  ]);

  // Modal State for New Course
  const [isNewCourseOpen, setIsNewCourseOpen] = useState(false);
  const [newCourseForm, setNewCourseForm] = useState({
    code: '',
    title: '',
    departmentCode: 'CHE',
    level: '100 Level',
    semester: 'Harmattan',
    creditUnits: '3',
    theoryHours: '2',
    practicalHours: '3',
    lecturer: 'Dr. K. Bello',
  });

  // Edit & Delete Course States
  const [editingCourse, setEditingCourse] = useState<CurriculumCourse | null>(null);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<CurriculumCourse | null>(null);
  const [isDeleteCourseOpen, setIsDeleteCourseOpen] = useState(false);

  const handleSaveEditCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    setCurriculumCourses((prev) =>
      prev.map((c) => (c.code === editingCourse.code ? editingCourse : c))
    );

    if (updateCourse) {
      updateCourse(editingCourse.code, {
        title: editingCourse.title,
        creditUnits: editingCourse.creditUnits,
        level: editingCourse.level,
        semester: editingCourse.semester,
        lecturer: editingCourse.lecturer,
        theoryHours: editingCourse.theoryHours,
        practicalHours: editingCourse.practicalHours,
      });
    }

    recordAudit('COURSE_UPDATED', 'CURRICULUM_COURSE', editingCourse.code, {
      title: editingCourse.title,
      level: editingCourse.level,
    });

    setIsEditCourseOpen(false);
    setEditingCourse(null);
    showToast({
      type: 'success',
      title: 'Course Updated',
      message: `${editingCourse.code} curriculum details updated successfully.`,
    });
  };

  const handleConfirmDeleteCourse = () => {
    if (!deletingCourse) return;

    setCurriculumCourses((prev) => prev.filter((c) => c.code !== deletingCourse.code));

    if (deleteCourse) {
      deleteCourse(deletingCourse.code);
    }

    recordAudit('COURSE_DELETED', 'CURRICULUM_COURSE', deletingCourse.code, {
      title: deletingCourse.title,
    });

    setIsDeleteCourseOpen(false);
    setDeletingCourse(null);
    showToast({
      type: 'success',
      title: 'Course Removed',
      message: `${deletingCourse.code} removed from the active curriculum.`,
    });
  };

  // Handle Score Input
  const handleScoreChange = (index: number, field: 'caScore' | 'examScore', val: string) => {
    if (workflowStatus === 'PUBLISHED' && session.activeRole !== 'EXAM') {
      showToast({
        type: 'danger',
        title: 'Score Locked',
        message: 'Published grades require Exams Officer role and Senate approval to amend.',
      });
      return;
    }
    const num = Math.min(field === 'caScore' ? 30 : 70, Math.max(0, parseFloat(val) || 0));
    setScores((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: num };
      return copy;
    });
  };

  // Handle Advance Approval Workflow
  const handleAdvanceApproval = () => {
    if (workflowStatus === 'DRAFT') {
      setWorkflowStatus('HOD_APPROVED');
      recordAudit('COURSE_SCORES_HOD_APPROVED', 'EXM_SCORES', selectedCourse);
      showToast({
        type: 'success',
        title: 'HOD Approval Completed',
        message: `${selectedCourse} scores verified and passed to Dean for sign-off.`,
      });
    } else if (workflowStatus === 'HOD_APPROVED') {
      setWorkflowStatus('DEAN_APPROVED');
      recordAudit('COURSE_SCORES_DEAN_APPROVED', 'EXM_SCORES', selectedCourse);
      showToast({
        type: 'success',
        title: 'Dean Sign-Off Completed',
        message: `${selectedCourse} scores confirmed. Transferred to Exams Office for broadsheet publication.`,
      });
    } else if (workflowStatus === 'DEAN_APPROVED') {
      setWorkflowStatus('PUBLISHED');
      recordAudit('RESULT_PUBLISHED', 'EXM_SCORES', selectedCourse);
      showToast({
        type: 'success',
        title: 'Scores Published',
        message: `${selectedCourse} scores released to student portal and broadsheets.`,
      });
    }
  };

  // Handle Add Course Submit
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseForm.code || !newCourseForm.title) {
      showToast({
        type: 'danger',
        title: 'Missing Fields',
        message: 'Please provide course code and course title.',
      });
      return;
    }

    const matchedDept = (departments || []).find((d) => d.code === newCourseForm.departmentCode);
    const deptName = matchedDept ? matchedDept.name : 'Health Sciences';

    const createdCourse: CurriculumCourse = {
      code: newCourseForm.code.toUpperCase(),
      title: newCourseForm.title,
      departmentCode: newCourseForm.departmentCode,
      departmentName: deptName,
      level: newCourseForm.level,
      semester: newCourseForm.semester,
      creditUnits: parseInt(newCourseForm.creditUnits) || 3,
      theoryHours: parseInt(newCourseForm.theoryHours) || 2,
      practicalHours: parseInt(newCourseForm.practicalHours) || 3,
      lecturer: newCourseForm.lecturer,
    };

    addCourse(createdCourse);
    setCurriculumCourses((prev) => [...prev, createdCourse]);
    setIsNewCourseOpen(false);
    showToast({
      type: 'success',
      title: 'Course Registered',
      message: `${createdCourse.code}: ${createdCourse.title} added to curriculum.`,
    });
  };

  // Score Entry Columns
  const scoreColumns = [
    {
      key: 'matricNumber',
      header: 'Matric No.',
      render: (s: StudentScoreRecord) => (
        <span className="font-extrabold text-[#0F7640] text-sm tracking-wide font-sans">
          {s.matricNumber}
        </span>
      ),
    },
    {
      key: 'studentName',
      header: 'Student Full Name',
      render: (s: StudentScoreRecord) => (
        <span className="font-bold text-slate-900 font-sans">{s.studentName}</span>
      ),
    },
    {
      key: 'caScore',
      header: 'CA Score (Max 30)',
      align: 'right' as const,
      render: (s: StudentScoreRecord, idx: number) => (
        <input
          type="number"
          min="0"
          max="30"
          disabled={workflowStatus === 'PUBLISHED'}
          value={s.caScore}
          onChange={(e) => handleScoreChange(idx, 'caScore', e.target.value)}
          className="w-16 h-8 text-right px-2.5 border border-slate-300 rounded-[4px] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0F7640] disabled:bg-slate-50 font-sans"
        />
      ),
    },
    {
      key: 'examScore',
      header: 'Exam Score (Max 70)',
      align: 'right' as const,
      render: (s: StudentScoreRecord, idx: number) => (
        <input
          type="number"
          min="0"
          max="70"
          disabled={workflowStatus === 'PUBLISHED'}
          value={s.examScore}
          onChange={(e) => handleScoreChange(idx, 'examScore', e.target.value)}
          className="w-16 h-8 text-right px-2.5 border border-slate-300 rounded-[4px] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0F7640] disabled:bg-slate-50 font-sans"
        />
      ),
    },
    {
      key: 'totalScore',
      header: 'Total (100%)',
      align: 'right' as const,
      render: (s: StudentScoreRecord) => {
        const total = s.caScore + s.examScore;
        return <span className="font-extrabold text-slate-900 text-sm font-sans">{total}%</span>;
      },
    },
    {
      key: 'grade',
      header: 'Grade & Points',
      align: 'center' as const,
      render: (s: StudentScoreRecord) => {
        const computed = computeCourseResult({
          courseCode: selectedCourse,
          courseTitle: 'Course Offering',
          creditUnits: 3,
          caScore: s.caScore,
          examScore: s.examScore,
        });
        return (
          <Badge variant={computed.grade === 'F' ? 'danger' : 'success'}>
            Grade {computed.grade} ({computed.gradePoint.toFixed(1)} GP)
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academics & Examination</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Continuous assessments, examination broadsheets, Senate ratifications, and official transcripts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {workflowStatus !== 'PUBLISHED' ? (
            <Button
              size="sm"
              onClick={handleAdvanceApproval}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              {workflowStatus === 'DRAFT'
                ? 'Submit to HOD'
                : workflowStatus === 'HOD_APPROVED'
                ? 'Approve as Dean'
                : 'Publish to Portals'}
            </Button>
          ) : (
            <Badge variant="success" size="md">
              <Lock className="w-3 h-3 inline mr-1" /> Results Published
            </Badge>
          )}
        </div>
      </div>

      {/* 4 Academic KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Accredited Courses
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">{curriculumCourses.length}</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-600 font-semibold">Curriculum modules</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Harmattan & Rain</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average Pass Rate
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#0F7640] font-sans tracking-tight">88.4%</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">+3.2% vs 2025</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">College-wide exam diets</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Dean’s Honor List
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#0F7640] font-sans tracking-tight">142</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#0F7640] font-semibold">Trainees CGPA &ge; 4.00</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Distinction standing</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Broadsheets Status
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#13A348] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-700 font-sans tracking-tight">100%</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">Senate Ratified</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Harmattan semester diet</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Nav Tabs (Scoped by Role) */}
      <Tabs
        tabs={
          isStudent
            ? [
                { id: 'broadsheet', label: 'My Semester Results' },
                { id: 'transcript', label: 'My Official Transcript' },
              ]
            : [
                { id: 'scores', label: 'Score Entry' },
                { id: 'broadsheet', label: 'Examination Broadsheets' },
                { id: 'transcript', label: 'Student Transcripts' },
                { id: 'curriculum', label: 'Curriculum & Courses' },
              ]
        }
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {/* ─── TAB 1: Score Entry Grid ─── */}
      {activeTab === 'scores' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-[4px] border border-slate-200 shadow-sm">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
              <div className="w-64">
                <Select
                  options={[
                    { value: 'CHE 101', label: 'CHE 101: Primary Healthcare (3U)' },
                    { value: 'CHE 102', label: 'CHE 102: Community Diagnosis (3U)' },
                    { value: 'CHE 201', label: 'CHE 201: Maternal & Child Health (4U)' },
                    { value: 'MLT 101', label: 'MLT 101: Clinical Chemistry (3U)' },
                    { value: 'MLT 201', label: 'MLT 201: Haematology (4U)' },
                    { value: 'PHT 101', label: 'PHT 101: Dispensing Calculations (3U)' },
                  ]}
                  value={selectedCourse}
                  onChange={(val) => setSelectedCourse(val)}
                />
              </div>
              <div className="w-48">
                <Select
                  options={[
                    { value: 'CHE', label: 'Community Health' },
                    { value: 'MLT', label: 'Medical Laboratory' },
                    { value: 'PHT', label: 'Pharmacy Technician' },
                    { value: 'HIM', label: 'Health Information' },
                    { value: 'EHT', label: 'Environmental Health' },
                  ]}
                  value={selectedDeptFilter}
                  onChange={(val) => setSelectedDeptFilter(val)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-500 font-medium">Approval Stage:</span>
              <Badge
                variant={
                  workflowStatus === 'PUBLISHED'
                    ? 'success'
                    : workflowStatus === 'DRAFT'
                    ? 'neutral'
                    : 'warning'
                }
              >
                {workflowStatus.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          <Card
            header={
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                <div>
                  <span className="font-bold text-slate-900 text-sm">{selectedCourse} Score Sheet</span>
                  <span className="text-xs text-slate-500 font-medium block">
                    Continuous Assessment (30%) + Examination (70%) = Total (100%)
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium shrink-0">
                  {scores.length} enrolled candidates
                </span>
              </div>
            }
          >
            <Table
              columns={scoreColumns}
              data={scores}
              keyExtractor={(s) => s.matricNumber}
              isDense={isDense}
            />
          </Card>
        </div>
      )}

      {/* ─── TAB 2: Examination Broadsheets ─── */}
      {activeTab === 'broadsheet' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-[4px] border border-slate-200 shadow-sm">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
              <div className="w-52">
                <Select
                  options={[
                    { value: 'CHE', label: 'Department of Community Health' },
                    { value: 'MLT', label: 'Department of Medical Lab Tech' },
                    { value: 'PHT', label: 'Department of Pharmacy Tech' },
                    { value: 'HIM', label: 'Department of Health Info Mgmt' },
                    { value: 'EHT', label: 'Department of Environmental Health' },
                  ]}
                  value={broadsheetDept}
                  onChange={(val) => setBroadsheetDept(val)}
                />
              </div>
              <div className="w-36">
                <Select
                  options={[
                    { value: '100 Level', label: '100 Level' },
                    { value: '200 Level', label: '200 Level' },
                    { value: '300 Level', label: '300 Level' },
                  ]}
                  value={broadsheetLevel}
                  onChange={(val) => setBroadsheetLevel(val)}
                />
              </div>
              <div className="w-36">
                <Select
                  options={[
                    { value: 'Harmattan', label: 'Harmattan Semester' },
                    { value: 'Rain', label: 'Rain Semester' },
                  ]}
                  value={broadsheetSemester}
                  onChange={(val) => setBroadsheetSemester(val)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                onClick={() => window.print()}
              >
                Print Broadsheet
              </Button>
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={() =>
                  showToast({
                    type: 'info',
                    title: 'Broadsheet Exported',
                    message: `${broadsheetDept} ${broadsheetLevel} broadsheet exported to signed spreadsheet.`,
                  })
                }
              >
                Export CSV
              </Button>
            </div>
          </div>

          <Card
            header={
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                <div>
                  <span className="font-bold text-slate-900">
                    Official Departmental Examination Broadsheet — {broadsheetDept} {broadsheetLevel}
                  </span>
                  <span className="text-xs text-slate-500 font-medium block">
                    {broadsheetSemester} Semester 2026/2027 • Approved by Senate Examination Board
                  </span>
                </div>
                <Badge variant={isBroadsheetRatified ? 'success' : 'warning'}>
                  {isBroadsheetRatified ? 'Senate Ratified' : 'Pending Ratification'}
                </Badge>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse font-sans">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="p-3">Matric No.</th>
                    <th className="p-3">Candidate Full Name</th>
                    <th className="p-3 text-center">CHE 101 (3U)</th>
                    <th className="p-3 text-center">CHE 102 (3U)</th>
                    <th className="p-3 text-center">CHE 103 (4U)</th>
                    <th className="p-3 text-right">Units</th>
                    <th className="p-3 text-right">TQP</th>
                    <th className="p-3 text-right font-bold">GPA</th>
                    <th className="p-3 text-right font-bold">CGPA</th>
                    <th className="p-3 text-center">Academic Standing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(isStudent
                    ? broadsheetData.filter(
                        (b) => b.matricNumber === (persona?.matricNumber || 'CHE/2026/0014')
                      )
                    : broadsheetData
                  ).map((row) => (
                    <tr key={row.matricNumber} className="hover:bg-slate-50/50">
                      <td className="p-3 font-extrabold text-[#0F7640] whitespace-nowrap">{row.matricNumber}</td>
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{row.studentName}</td>
                      <td className="p-3 text-center font-medium text-slate-800">
                        {row.courseScores['CHE 101'].total}% ({row.courseScores['CHE 101'].grade})
                      </td>
                      <td className="p-3 text-center font-medium text-slate-800">
                        {row.courseScores['CHE 102'].total}% ({row.courseScores['CHE 102'].grade})
                      </td>
                      <td className="p-3 text-center font-medium text-slate-800">
                        {row.courseScores['CHE 103'].total}% ({row.courseScores['CHE 103'].grade})
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-700">{row.totalUnits}</td>
                      <td className="p-3 text-right font-semibold text-slate-700">{row.totalPoints.toFixed(1)}</td>
                      <td className="p-3 text-right font-bold text-slate-900">{row.gpa.toFixed(2)}</td>
                      <td className="p-3 text-right font-extrabold text-[#0F7640]">{row.cgpa.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <Badge
                          size="sm"
                          variant={
                            row.standing === 'DEAN_LIST'
                              ? 'primary'
                              : row.standing === 'PASS'
                              ? 'success'
                              : 'danger'
                          }
                        >
                          {row.standing.replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ─── TAB 3: Student Transcripts ─── */}
      {activeTab === 'transcript' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-[4px] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium shrink-0">Trainee Record:</span>
              <div className="w-72">
                {isStudent ? (
                  <div className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center text-xs font-bold text-slate-800">
                    Blessing Adeyemi (CHE/2026/0014)
                  </div>
                ) : (
                  <Select
                    options={[
                      { value: 'CHE/2026/0014', label: 'Blessing Adeyemi (CHE/2026/0014)' },
                      { value: 'CHE/2026/0015', label: 'Oluwaseun Bakare (CHE/2026/0015)' },
                      { value: 'CHE/2026/0016', label: 'Fatima Ibrahim (CHE/2026/0016)' },
                      { value: 'CHE/2026/0017', label: 'Chinedu Eze (CHE/2026/0017)' },
                    ]}
                    value={transcriptMatric}
                    onChange={(val) => setTranscriptMatric(val)}
                  />
                )}
              </div>
            </div>

            <Button
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              onClick={() => setSelectedTranscript(true)}
            >
              Print Official Transcript
            </Button>
          </div>

          {/* Transcript Document View */}
          <div className="bg-white p-6 sm:p-8 rounded-[4px] border border-slate-200 shadow-sm space-y-6 font-sans">
            {/* Official Letterhead */}
            <div className="border-b-2 border-[#0F7640] pb-4 flex flex-col items-center text-center">
              <img
                src={schoolProfile?.logoUrl || '/BeonTech-Logo.png'}
                alt="College Crest"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/BeonTech-Logo.png';
                }}
                className="w-14 h-14 mx-auto mb-2 rounded-[4px] object-contain shadow-xs"
              />
              <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
                Bethsaida College of Health Technology
              </h2>
              <p className="text-[11px] text-slate-600">
                {schoolProfile?.campusAddress || 'Ikolaba Aladan layout, off Ayegun Yemetu Road, along CAC grammar school, Ogbomoso, Oyo State'}
              </p>
              <p className="text-[10px] text-slate-500">
                Official Statement of Academic Record & Transcript
              </p>
            </div>

            {/* Candidate Metadata Block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-[4px] border border-slate-200 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Trainee Name</span>
                <span className="font-bold text-slate-900">Blessing Adeyemi</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Matriculation</span>
                <span className="font-extrabold text-[#0F7640]">{transcriptMatric}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Programme</span>
                <span className="font-semibold text-slate-800">Community Health (CHEW)</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Cumulative GPA</span>
                <span className="font-extrabold text-slate-900 text-sm">4.25 / 5.00</span>
              </div>
            </div>

            {/* Semester Course Table */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                {broadsheetSemester} Semester {schoolProfile?.activeSession || "2026/2027"} Results
              </span>
              <div className="border border-slate-200 rounded-[4px] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-3 py-2">Course Code</th>
                      <th className="px-3 py-2">Course Title</th>
                      <th className="px-3 py-2 text-center">Credit Units</th>
                      <th className="px-3 py-2 text-center">Score</th>
                      <th className="px-3 py-2 text-center">Grade</th>
                      <th className="px-3 py-2 text-right">Quality Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-3 py-2.5 font-bold text-[#0F7640]">CHE 101</td>
                      <td className="px-3 py-2.5 text-slate-800">Introduction to Primary Healthcare</td>
                      <td className="px-3 py-2.5 text-center font-semibold">3</td>
                      <td className="px-3 py-2.5 text-center font-bold">80%</td>
                      <td className="px-3 py-2.5 text-center font-extrabold text-[#0F7640]">A</td>
                      <td className="px-3 py-2.5 text-right font-bold">15.0</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5 font-bold text-[#0F7640]">CHE 102</td>
                      <td className="px-3 py-2.5 text-slate-800">Community Diagnosis & Field Survey</td>
                      <td className="px-3 py-2.5 text-center font-semibold">3</td>
                      <td className="px-3 py-2.5 text-center font-bold">68%</td>
                      <td className="px-3 py-2.5 text-center font-extrabold text-[#093322]">B</td>
                      <td className="px-3 py-2.5 text-right font-bold">12.0</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5 font-bold text-[#0F7640]">CHE 103</td>
                      <td className="px-3 py-2.5 text-slate-800">Environmental Sanitation & Epidemiology</td>
                      <td className="px-3 py-2.5 text-center font-semibold">4</td>
                      <td className="px-3 py-2.5 text-center font-bold">72%</td>
                      <td className="px-3 py-2.5 text-center font-extrabold text-[#0F7640]">A</td>
                      <td className="px-3 py-2.5 text-right font-bold">20.0</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                    <tr>
                      <td colSpan={2} className="px-3 py-2 text-right">Semester Totals:</td>
                      <td className="px-3 py-2 text-center">10 Units</td>
                      <td colSpan={2} className="px-3 py-2 text-right">SGPA:</td>
                      <td className="px-3 py-2 text-right text-[#0F7640]">4.70</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Official Certification Footer */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
              <div>
                <div className="w-32 border-b border-slate-400 mb-1" />
                <p className="font-bold text-slate-900">Mrs. A. Adeleke</p>
                <p className="text-[11px] text-slate-500">Academic Registrar</p>
                <p className="text-[10px] text-slate-400">Date Issued: 13 November 2026</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 border-2 border-dashed border-[#0F7640] rounded-[4px] font-bold text-[#0F7640] text-[10px] uppercase">
                  OFFICIAL {schoolProfile?.institutionAcronym || "COLLEGE"} SEAL
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: Curriculum & Courses ─── */}
      {activeTab === 'curriculum' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-[4px] border border-slate-200 shadow-sm">
            <span className="font-bold text-slate-900 text-sm">
              College Health Technology Curriculum ({curriculumCourses.length} Accredited Courses)
            </span>
            <Button
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsNewCourseOpen(true)}
            >
              Add Course
            </Button>
          </div>

          <Card>
            <Table
              columns={[
                {
                  key: 'code',
                  header: 'Course Code',
                  render: (c: CurriculumCourse) => (
                    <span className="font-extrabold text-[#0F7640] text-sm tracking-wide font-sans">
                      {c.code}
                    </span>
                  ),
                },
                {
                  key: 'title',
                  header: 'Course Title',
                  render: (c: CurriculumCourse) => (
                    <div className="whitespace-nowrap">
                      <p className="font-bold text-slate-900">{c.title}</p>
                      <span className="text-[11px] text-slate-500">{c.departmentName}</span>
                    </div>
                  ),
                },
                {
                  key: 'level',
                  header: 'Level / Semester',
                  render: (c: CurriculumCourse) => (
                    <span className="text-xs text-slate-700 font-medium">
                      {c.level} • {c.semester}
                    </span>
                  ),
                },
                {
                  key: 'creditUnits',
                  header: 'Units',
                  align: 'center' as const,
                  render: (c: CurriculumCourse) => (
                    <span className="font-bold text-slate-800">{c.creditUnits} Units</span>
                  ),
                },
                {
                  key: 'hours',
                  header: 'Theory / Lab',
                  align: 'center' as const,
                  render: (c: CurriculumCourse) => (
                    <span className="text-xs text-slate-600 font-semibold">
                      {c.theoryHours}h / {c.practicalHours}h
                    </span>
                  ),
                },
                {
                  key: 'lecturer',
                  header: 'Assigned Lecturer',
                  render: (c: CurriculumCourse) => (
                    <span className="font-medium text-slate-800 whitespace-nowrap">{c.lecturer}</span>
                  ),
                },
                ...(!isStudent ? [{
                  key: 'actions',
                  header: 'Actions',
                  align: 'right' as const,
                  render: (c: CurriculumCourse) => (
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingCourse({ ...c });
                          setIsEditCourseOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          setDeletingCourse(c);
                          setIsDeleteCourseOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  ),
                }] : []),
              ]}
              data={curriculumCourses}
              keyExtractor={(c) => c.code}
              isDense={isDense}
            />
          </Card>
        </div>
      )}

      {/* ─── MODAL 1: Print Official Transcript ─── */}
      <Modal
        isOpen={selectedTranscript}
        onClose={() => setSelectedTranscript(false)}
        title="Official Academic Transcript"
        description="Sealed official college statement of academic performance for statutory council certification."
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-500 font-medium">
              Matriculation: {transcriptMatric} • Full Accreditation
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                onClick={() => window.print()}
              >
                Print Transcript
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedTranscript(false)}>
                Close
              </Button>
            </div>
          </div>
        }
      >
        <div className="bg-white p-6 border border-slate-200 rounded-[4px] space-y-5 text-xs text-slate-800 font-sans shadow-sm">
          <div className="border-b-2 border-[#0F7640] pb-3 text-center">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase">Bethsaida College of Health Technology</h3>
            <p className="text-[11px] text-slate-500">Official Academic Transcript & Statement of Result</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Student Name:</span>
              <span className="font-bold text-slate-900">Blessing Adeyemi</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Matriculation Number:</span>
              <span className="font-bold text-[#0F7640]">{transcriptMatric}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Programme:</span>
              <span className="font-semibold text-slate-800">Community Health Extension Worker (CHEW)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Graduating Status:</span>
              <Badge variant="success" size="sm">Passed in Good Standing</Badge>
            </div>
          </div>

          <div className="border border-slate-200 rounded-[4px] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-2">Code</th>
                  <th className="p-2">Course Title</th>
                  <th className="p-2 text-center">Units</th>
                  <th className="p-2 text-center">Score</th>
                  <th className="p-2 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2 font-bold text-[#0F7640]">CHE 101</td>
                  <td className="p-2">Introduction to Primary Healthcare</td>
                  <td className="p-2 text-center">3</td>
                  <td className="p-2 text-center">80%</td>
                  <td className="p-2 text-center font-bold text-[#0F7640]">A</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-[#0F7640]">CHE 102</td>
                  <td className="p-2">Community Diagnosis & Field Survey</td>
                  <td className="p-2 text-center">3</td>
                  <td className="p-2 text-center">68%</td>
                  <td className="p-2 text-center font-bold text-[#093322]">B</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold text-[#0F7640]">CHE 103</td>
                  <td className="p-2">Environmental Sanitation & Epidemiology</td>
                  <td className="p-2 text-center">4</td>
                  <td className="p-2 text-center">72%</td>
                  <td className="p-2 text-center font-bold text-[#0F7640]">A</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL 2: Add New Course to Curriculum ─── */}
      <Modal
        isOpen={isNewCourseOpen}
        onClose={() => setIsNewCourseOpen(false)}
        title="Add Course to Curriculum"
        description="Register a new academic course offering into the accredited college curriculum."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" size="sm" onClick={() => setIsNewCourseOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddCourse}>
              Add Course
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddCourse} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Course Code"
              placeholder="e.g. CHE 204"
              value={newCourseForm.code}
              onChange={(e) => setNewCourseForm({ ...newCourseForm, code: e.target.value.toUpperCase() })}
              required
            />
            <Select
              label="Department"
              options={[
                { value: 'CHE', label: 'Community Health' },
                { value: 'MLT', label: 'Medical Laboratory' },
                { value: 'PHT', label: 'Pharmacy Technician' },
                { value: 'HIM', label: 'Health Information' },
                { value: 'EHT', label: 'Environmental Health' },
              ]}
              value={newCourseForm.departmentCode}
              onChange={(val) => setNewCourseForm({ ...newCourseForm, departmentCode: val })}
            />
          </div>

          <Input
            label="Course Title"
            placeholder="e.g. Clinical Pharmacology & Therapeutics"
            value={newCourseForm.title}
            onChange={(e) => setNewCourseForm({ ...newCourseForm, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Level"
              options={[
                { value: '100 Level', label: '100 Level' },
                { value: '200 Level', label: '200 Level' },
                { value: '300 Level', label: '300 Level' },
              ]}
              value={newCourseForm.level}
              onChange={(val) => setNewCourseForm({ ...newCourseForm, level: val })}
            />
            <Select
              label="Semester"
              options={[
                { value: 'Harmattan', label: 'Harmattan' },
                { value: 'Rain', label: 'Rain' },
              ]}
              value={newCourseForm.semester}
              onChange={(val) => setNewCourseForm({ ...newCourseForm, semester: val })}
            />
            <Input
              label="Credit Units"
              type="number"
              value={newCourseForm.creditUnits}
              onChange={(e) => setNewCourseForm({ ...newCourseForm, creditUnits: e.target.value })}
            />
          </div>

          <Input
            label="Assigned Lecturer"
            placeholder="e.g. Dr. K. Bello"
            value={newCourseForm.lecturer}
            onChange={(e) => setNewCourseForm({ ...newCourseForm, lecturer: e.target.value })}
            required
          />
        </form>
      </Modal>

      {/* ─── MODAL 3: Edit Course ─── */}
      {editingCourse && (
        <Modal
          isOpen={isEditCourseOpen}
          onClose={() => {
            setIsEditCourseOpen(false);
            setEditingCourse(null);
          }}
          title={`Edit Course: ${editingCourse.code}`}
          description="Update course specification, assigned lecturer, and credit weighting."
          size="md"
        >
          <form onSubmit={handleSaveEditCourse} className="space-y-3.5 text-xs font-sans">
            <Input
              label="Course Title"
              value={editingCourse.title}
              onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Academic Level"
                options={(schoolProfile?.academicLevels || ['100 Level', '200 Level', '300 Level']).map((lvl) => ({
                  value: lvl,
                  label: lvl,
                }))}
                value={editingCourse.level}
                onChange={(val) => setEditingCourse({ ...editingCourse, level: val })}
              />

              <Select
                label="Semester"
                options={(schoolProfile?.academicSemesters || ['Harmattan', 'Rain']).map((sem) => ({
                  value: sem,
                  label: sem,
                }))}
                value={editingCourse.semester}
                onChange={(val) => setEditingCourse({ ...editingCourse, semester: val })}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Credit Units"
                type="number"
                min="1"
                max="6"
                value={String(editingCourse.creditUnits)}
                onChange={(e) =>
                  setEditingCourse({ ...editingCourse, creditUnits: parseInt(e.target.value) || 1 })
                }
                required
              />
              <Input
                label="Theory Hours"
                type="number"
                value={String(editingCourse.theoryHours)}
                onChange={(e) =>
                  setEditingCourse({ ...editingCourse, theoryHours: parseInt(e.target.value) || 0 })
                }
              />
              <Input
                label="Practical Hours"
                type="number"
                value={String(editingCourse.practicalHours)}
                onChange={(e) =>
                  setEditingCourse({ ...editingCourse, practicalHours: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <Input
              label="Assigned Lecturer"
              value={editingCourse.lecturer}
              onChange={(e) => setEditingCourse({ ...editingCourse, lecturer: e.target.value })}
              required
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsEditCourseOpen(false);
                  setEditingCourse(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL 4: Delete Course Confirmation ─── */}
      {deletingCourse && (
        <Modal
          isOpen={isDeleteCourseOpen}
          onClose={() => {
            setIsDeleteCourseOpen(false);
            setDeletingCourse(null);
          }}
          title="Remove Course from Curriculum"
          size="sm"
        >
          <div className="space-y-3 text-xs text-slate-700">
            <p>
              Are you sure you want to remove <strong>{deletingCourse.code} — {deletingCourse.title}</strong> from the college curriculum?
            </p>
            <p className="text-[11px] text-slate-500">
              This action will take effect across broadsheets and timetable offerings.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsDeleteCourseOpen(false);
                  setDeletingCourse(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                type="button"
                onClick={handleConfirmDeleteCourse}
              >
                Confirm Removal
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

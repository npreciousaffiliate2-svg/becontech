import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import {
  Card,
  Button,
  Table,
  Badge,
  Modal,
  Input,
  useToast,
  Tabs,
} from '@campusone/ui';
import {
  CheckCircle2,
  Lock,
  Printer,
  Eye,
} from 'lucide-react';
import {
  computeSemesterGpa,
  computeCourseResult,
  CourseScoreInput,
  DEFAULT_GRADING_SCALE,
} from '@campusone/contracts';

interface StudentScoreRecord {
  matricNumber: string;
  studentName: string;
  caScore: number;
  examScore: number;
}

export const AcademicsView: React.FC = () => {
  const { session, recordAudit, isDense } = useApp();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') as 'scores' | 'broadsheet' | 'transcript' | 'curriculum' | null;
  const [activeTab, setActiveTab] = useState<'scores' | 'broadsheet' | 'transcript' | 'curriculum'>(tabParam || 'scores');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (id: string) => {
    setActiveTab(id as any);
    setSearchParams({ tab: id });
  };
  const [selectedCourse, setSelectedCourse] = useState('CHE201');
  const [workflowStatus, setWorkflowStatus] = useState<'DRAFT' | 'HOD_APPROVED' | 'DEAN_APPROVED' | 'PUBLISHED'>('DRAFT');

  // Scores state for CHE201
  const [scores, setScores] = useState<StudentScoreRecord[]>([
    { matricNumber: 'CHE/2026/0014', studentName: 'Blessing Adeyemi', caScore: 24, examScore: 50 },
    { matricNumber: 'CHE/2026/0015', studentName: 'Oluwaseun Bakare', caScore: 21, examScore: 42 },
    { matricNumber: 'CHE/2026/0016', studentName: 'Fatima Ibrahim', caScore: 27, examScore: 58 },
    { matricNumber: 'CHE/2026/0017', studentName: 'Chinedu Eze', caScore: 16, examScore: 22 }, // carryover case
  ]);

  const [selectedTranscriptStudent, setSelectedTranscriptStudent] = useState<string | null>(null);

  const handleScoreChange = (index: number, field: 'caScore' | 'examScore', val: string) => {
    if (workflowStatus === 'PUBLISHED' && session.activeRole !== 'EXAM') {
      showToast({
        type: 'danger',
        title: 'Score Locked (Rule P3)',
        message: 'Published grades require Exams Officer role and an official amendment reason.',
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

  const handleAdvanceApproval = () => {
    // Hard rule P1: no self-approval in the same persona
    if (workflowStatus === 'DRAFT') {
      if (session.activeRole !== 'HOD' && session.activeRole !== 'PROVOST') {
        showToast({
          type: 'warning',
          title: 'Approval Authorization',
          message: 'Only HOD or Provost can approve course scores for Dean review.',
        });
        return;
      }
      setWorkflowStatus('HOD_APPROVED');
      recordAudit('COURSE_SCORES_HOD_APPROVED', 'EXM_SCORES', selectedCourse);
      showToast({ type: 'success', title: 'HOD Approval Recorded', message: 'Passed to Dean of Health Sciences' });
    } else if (workflowStatus === 'HOD_APPROVED') {
      setWorkflowStatus('DEAN_APPROVED');
      recordAudit('COURSE_SCORES_DEAN_APPROVED', 'EXM_SCORES', selectedCourse);
      showToast({ type: 'success', title: 'Dean Sign-Off Completed', message: 'Passed to Exams Officer for Publishing' });
    } else if (workflowStatus === 'DEAN_APPROVED') {
      if (session.activeRole !== 'EXAM' && session.activeRole !== 'PROVOST') {
        showToast({
          type: 'danger',
          title: 'Exams Officer Role Required',
          message: 'Only Exams Officer or Provost can publish final institutional broadsheets.',
        });
        return;
      }
      setWorkflowStatus('PUBLISHED');
      recordAudit('RESULT_PUBLISHED', 'EXM_SCORES', selectedCourse);
      showToast({
        type: 'success',
        title: 'Results Published to Portals',
        message: 'Broadsheet frozen. Immutable statement of results now live for students.',
      });
    }
  };

  const scoreColumns = [
    { key: 'matricNumber', header: 'Matric No.', render: (s: StudentScoreRecord) => <span className="font-semibold">{s.matricNumber}</span> },
    { key: 'studentName', header: 'Student Name' },
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
          className="w-16 h-7 text-right px-2 border border-slate-300 rounded-[4px] text-xs font-tabular focus:outline-none focus:ring-1 focus:ring-[#0A77FE] disabled:bg-slate-50"
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
          className="w-16 h-7 text-right px-2 border border-slate-300 rounded-[4px] text-xs font-tabular focus:outline-none focus:ring-1 focus:ring-[#0A77FE] disabled:bg-slate-50"
        />
      ),
    },
    {
      key: 'totalScore',
      header: 'Total Score',
      align: 'right' as const,
      render: (s: StudentScoreRecord) => {
        const computed = computeCourseResult({
          courseCode: selectedCourse,
          courseTitle: 'Primary Health Care',
          creditUnits: 3,
          caScore: s.caScore,
          examScore: s.examScore,
        });
        return <span className="font-bold text-slate-900 font-tabular">{computed.totalScore}%</span>;
      },
    },
    {
      key: 'grade',
      header: 'Grade Letter',
      align: 'center' as const,
      render: (s: StudentScoreRecord) => {
        const computed = computeCourseResult({
          courseCode: selectedCourse,
          courseTitle: 'Primary Health Care',
          creditUnits: 3,
          caScore: s.caScore,
          examScore: s.examScore,
        });
        return (
          <Badge variant={computed.grade === 'F' ? 'danger' : 'success'}>
            Grade {computed.grade} ({computed.gradePoint.toFixed(1)})
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academics & Examination</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Course grades, examination broadsheets, transcripts, and curriculum
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
                : 'Publish Results'}
            </Button>
          ) : (
            <Badge variant="success" size="md">
              <Lock className="w-3 h-3 inline mr-1" /> Results Published
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'scores', label: 'Score Entry Grid' },
          { id: 'broadsheet', label: 'Examination Broadsheets' },
          { id: 'transcript', label: 'Student Transcripts' },
          { id: 'curriculum', label: 'Courses & Curriculum' },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {/* Tab 1: Scores Grid */}
      {activeTab === 'scores' && (
        <Card>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-[4px] border border-slate-200">
            <div>
              <span className="text-xs font-semibold text-slate-900">
                CHE 201: Primary Health Care I (3 Credit Units)
              </span>
              <p className="text-[11px] text-slate-500">
                Department of Community Health • Instructor: Dr. K. Bello • CA (30%) + Exam (70%)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">Approval State:</span>
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

          <Table
            columns={scoreColumns}
            data={scores}
            keyExtractor={(s) => s.matricNumber}
            isDense={isDense}
          />
        </Card>
      )}

      {/* Tab 2: Broadsheet */}
      {activeTab === 'broadsheet' && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Official Examination Broadsheet — CHEW 200 Level
              </span>
              <p className="text-[11px] text-slate-500">
                Harmattan Semester 2026/2027 • Golden Calculation Engine
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print Broadsheet
            </Button>
          </div>

          <div className="border border-slate-200 rounded-[4px] overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="p-2.5">Matric No.</th>
                  <th className="p-2.5">Student Name</th>
                  <th className="p-2.5 text-center">CHE 201 (3U)</th>
                  <th className="p-2.5 text-center">CHE 202 (2U)</th>
                  <th className="p-2.5 text-center">CHE 203 (4U)</th>
                  <th className="p-2.5 text-right">Units</th>
                  <th className="p-2.5 text-right">QP</th>
                  <th className="p-2.5 text-right font-bold">GPA</th>
                  <th className="p-2.5 text-center">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-semibold">CHE/2026/0014</td>
                  <td className="p-2.5">Blessing Adeyemi</td>
                  <td className="p-2.5 text-center">74% (A)</td>
                  <td className="p-2.5 text-center">63% (B)</td>
                  <td className="p-2.5 text-center">53% (C)</td>
                  <td className="p-2.5 text-right font-tabular">9</td>
                  <td className="p-2.5 text-right font-tabular">35.0</td>
                  <td className="p-2.5 text-right font-bold text-[#0A77FE] font-tabular">3.89</td>
                  <td className="p-2.5 text-center"><Badge variant="success" size="sm">PASS</Badge></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-semibold">CHE/2026/0017</td>
                  <td className="p-2.5">Chinedu Eze</td>
                  <td className="p-2.5 text-center text-[#F83A20] font-bold">38% (F)</td>
                  <td className="p-2.5 text-center">44% (E)</td>
                  <td className="p-2.5 text-center">41% (E)</td>
                  <td className="p-2.5 text-right font-tabular">9</td>
                  <td className="p-2.5 text-right font-tabular">6.0</td>
                  <td className="p-2.5 text-right font-bold text-[#F83A20] font-tabular">0.67</td>
                  <td className="p-2.5 text-center"><Badge variant="danger" size="sm">PROBATION</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Official Transcript */}
      {activeTab === 'transcript' && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Official Academic Transcript Generator
              </span>
              <p className="text-[11px] text-slate-500">
                Sealed & Numbered Institutional Statement of Academic Record
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setSelectedTranscriptStudent('CHE/2026/0014')}
              leftIcon={<Eye className="w-3.5 h-3.5" />}
            >
              Preview Blessing Adeyemi Transcript
            </Button>
          </div>

          <div className="p-6 border border-slate-200 rounded-[4px] bg-slate-50/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Candidate: Blessing Adeyemi (CHE/2026/0014)
                </h3>
                <p className="text-slate-500 text-xs">
                  Programme: Community Health Extension Worker (CHEW) • Admitted: 2026
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#13A348]">CGPA: 3.89 / 5.00</span>
                <p className="text-[10px] text-slate-400">Class: Upper Credit Division</p>
              </div>
            </div>

            <div className="text-xs text-slate-600">
              Clearance status for graduation:
              <span className="ml-2 font-medium text-emerald-600">Academic units complete</span> •
              <span className="ml-2 font-medium text-amber-600">Fee clearance pending (₦55,000)</span>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 4: Health Programmes & Curriculum */}
      {activeTab === 'curriculum' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <Card
            header={
              <span className="font-semibold text-slate-900 uppercase tracking-wider">
                Community Health (CHEW) Curriculum
              </span>
            }
          >
            <div className="divide-y divide-slate-100 space-y-1">
              <div className="py-2 flex justify-between">
                <span>CHE 101: Introduction to Primary Health Care</span>
                <span className="font-semibold">3 Units</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>CHE 201: Maternal & Child Health</span>
                <span className="font-semibold">3 Units</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>CHE 202: Anatomy & Physiology for Health</span>
                <span className="font-semibold">2 Units</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>CHE 203: Pharmacology in Primary Care</span>
                <span className="font-semibold">4 Units</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>CHE 301: Rural Clinical Posting & Fieldwork</span>
                <span className="font-semibold">6 Units</span>
              </div>
            </div>
          </Card>

          <Card
            header={
              <span className="font-semibold text-slate-900 uppercase tracking-wider">
                Medical Laboratory Tech (MLT) Curriculum
              </span>
            }
          >
            <div className="divide-y divide-slate-100 space-y-1">
              <div className="py-2 flex justify-between">
                <span>MLT 101: General Medical Microbiology</span>
                <span className="font-semibold">3 Units</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>MLT 201: Clinical Chemistry & Urinalysis</span>
                <span className="font-semibold">3 Units</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>MLT 202: Haematology & Blood Transfusion</span>
                <span className="font-semibold">4 Units</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>MLT 203: Histopathology Techniques</span>
                <span className="font-semibold">3 Units</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

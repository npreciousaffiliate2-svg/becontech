import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Card,
  Button,
  Table,
  Badge,
  useToast,
  Tabs,
} from '@campusone/ui';
import {
  CalendarCheck,
  Check,
  X,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface AttendanceStudent {
  id: string;
  matricNumber: string;
  fullName: string;
  attendedSessions: number;
  totalSessions: number;
  statusToday: 'PRESENT' | 'ABSENT' | 'EXCUSED';
}

export const AttendanceView: React.FC = () => {
  const { session, recordAudit, isDense } = useApp();
  const { showToast } = useToast();

  const [students, setStudents] = useState<AttendanceStudent[]>([
    {
      id: 'att-01',
      matricNumber: 'CHE/2026/0014',
      fullName: 'Blessing Adeyemi',
      attendedSessions: 22,
      totalSessions: 24,
      statusToday: 'PRESENT',
    },
    {
      id: 'att-02',
      matricNumber: 'CHE/2026/0015',
      fullName: 'Oluwaseun Bakare',
      attendedSessions: 20,
      totalSessions: 24,
      statusToday: 'PRESENT',
    },
    {
      id: 'att-03',
      matricNumber: 'CHE/2026/0016',
      fullName: 'Fatima Ibrahim',
      attendedSessions: 23,
      totalSessions: 24,
      statusToday: 'PRESENT',
    },
    {
      id: 'att-04',
      matricNumber: 'CHE/2026/0017',
      fullName: 'Chinedu Eze',
      attendedSessions: 14,
      totalSessions: 24,
      statusToday: 'ABSENT', // 14/24 = 58.3% < 75% threshold
    },
  ]);

  const handleToggleStatus = (id: string, status: 'PRESENT' | 'ABSENT' | 'EXCUSED') => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, statusToday: status } : s))
    );
  };

  const handleSaveRegister = () => {
    recordAudit('ATTENDANCE_REGISTER_SAVED', 'ATT_REGISTER', 'CHE201-2026-11-13');
    showToast({
      type: 'success',
      title: 'Class Register Saved',
      message: 'Attendance facts posted and eligibility thresholds recalculated.',
    });
  };

  const columns = [
    { key: 'matricNumber', header: 'Matric No.', render: (s: AttendanceStudent) => <span className="font-semibold">{s.matricNumber}</span> },
    { key: 'fullName', header: 'Student Name' },
    {
      key: 'cumulative',
      header: 'Cumulative Attendance',
      render: (s: AttendanceStudent) => {
        const pct = Math.round((s.attendedSessions / s.totalSessions) * 100);
        const isEligible = pct >= 75;
        return (
          <div className="flex items-center gap-2">
            <span className="font-tabular font-bold">{s.attendedSessions} / {s.totalSessions} ({pct}%)</span>
            <Badge variant={isEligible ? 'success' : 'danger'} size="sm">
              {isEligible ? 'Eligible' : 'Barred (<75%)'}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'marking',
      header: "Today's Mark (One-Tap)",
      align: 'right' as const,
      render: (s: AttendanceStudent) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleToggleStatus(s.id, 'PRESENT')}
            className={`px-2.5 py-1 text-xs rounded-[4px] border font-medium flex items-center gap-1 transition-colors ${
              s.statusToday === 'PRESENT'
                ? 'bg-[#13A348] text-white border-[#13A348]'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Check className="w-3 h-3" /> P
          </button>
          <button
            type="button"
            onClick={() => handleToggleStatus(s.id, 'ABSENT')}
            className={`px-2.5 py-1 text-xs rounded-[4px] border font-medium flex items-center gap-1 transition-colors ${
              s.statusToday === 'ABSENT'
                ? 'bg-[#F83A20] text-white border-[#F83A20]'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <X className="w-3 h-3" /> A
          </button>
          <button
            type="button"
            onClick={() => handleToggleStatus(s.id, 'EXCUSED')}
            className={`px-2.5 py-1 text-xs rounded-[4px] border font-medium flex items-center gap-1 transition-colors ${
              s.statusToday === 'EXCUSED'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3 h-3" /> E
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Attendance & Exam Eligibility (ATT)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Instructor Class Register • Mobile-First One-Tap Marking • 75% Threshold Exam Gate (PRD §5.3)
          </p>
        </div>
        <Button size="sm" onClick={handleSaveRegister} leftIcon={<Check className="w-3.5 h-3.5" />}>
          Save Class Register
        </Button>
      </div>

      <Card>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-[4px] border border-slate-200">
          <div>
            <span className="text-xs font-semibold text-slate-900">
              CHE 201: Primary Health Care I — Session 24 (13 Nov 2026)
            </span>
            <p className="text-[11px] text-slate-500">
              Lecture Hall 2 • Instructor: Dr. K. Bello • 75% attendance mandatory for exam entry
            </p>
          </div>
          <Badge variant="primary">Harmattan 2026</Badge>
        </div>
        <Table
          columns={columns}
          data={students}
          keyExtractor={(s) => s.id}
          isDense={isDense}
        />
      </Card>
    </div>
  );
};

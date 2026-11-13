import React, { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Badge,
  Tabs,
  useToast,
} from '@campusone/ui';
import {
  Building2,
  Users,
  GraduationCap,
  Award,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

interface Department {
  id: string;
  name: string;
  code: string;
  hod: string;
  programmesCount: number;
  studentsCount: number;
  facultyCount: number;
  accreditationStatus: 'FULL' | 'PROVISIONAL' | 'RENEWAL_DUE';
  regulatoryBody: string;
}

export const DepartmentsView: React.FC = () => {
  const { isDense } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'directory' | 'programmes' | 'hods'>('directory');

  const departments: Department[] = [
    {
      id: 'dept-01',
      name: 'Department of Community Health',
      code: 'CHE',
      hod: 'Dr. K. Bello (HOD)',
      programmesCount: 2,
      studentsCount: 480,
      facultyCount: 14,
      accreditationStatus: 'FULL',
      regulatoryBody: 'CHPRBN',
    },
    {
      id: 'dept-02',
      name: 'Department of Medical Laboratory Technology',
      code: 'MLT',
      hod: 'Mr. O. Adebisi (HOD)',
      programmesCount: 2,
      studentsCount: 320,
      facultyCount: 11,
      accreditationStatus: 'FULL',
      regulatoryBody: 'MLSCN',
    },
    {
      id: 'dept-03',
      name: 'Department of Pharmacy Technician Studies',
      code: 'PHT',
      hod: 'Pharm. F. Oladipo (HOD)',
      programmesCount: 1,
      studentsCount: 260,
      facultyCount: 8,
      accreditationStatus: 'PROVISIONAL',
      regulatoryBody: 'PCN',
    },
    {
      id: 'dept-04',
      name: 'Department of Health Information Management',
      code: 'HIM',
      hod: 'Mrs. T. Adeleke (HOD)',
      programmesCount: 1,
      studentsCount: 120,
      facultyCount: 6,
      accreditationStatus: 'FULL',
      regulatoryBody: 'HRORBN',
    },
    {
      id: 'dept-05',
      name: 'Department of Environmental Health Sciences',
      code: 'EHT',
      hod: 'Sanitarian B. Ibrahim (HOD)',
      programmesCount: 1,
      studentsCount: 68,
      facultyCount: 5,
      accreditationStatus: 'FULL',
      regulatoryBody: 'EHORECON',
    },
  ];

  const columns = [
    {
      key: 'name',
      header: 'Department Name',
      render: (d: Department) => (
        <div className="whitespace-nowrap">
          <p className="font-bold text-slate-900">{d.name}</p>
          <span className="text-[11px] text-slate-500 font-medium">Code: {d.code} • Board: {d.regulatoryBody}</span>
        </div>
      ),
    },
    {
      key: 'hod',
      header: 'Head of Department (HOD)',
      render: (d: Department) => <span className="font-semibold text-slate-800 whitespace-nowrap">{d.hod}</span>,
    },
    {
      key: 'studentsCount',
      header: 'Enrolled Students',
      align: 'right' as const,
      render: (d: Department) => <span className="font-bold text-slate-900">{d.studentsCount}</span>,
    },
    {
      key: 'facultyCount',
      header: 'Academic Staff',
      align: 'right' as const,
      render: (d: Department) => <span className="font-semibold text-slate-700">{d.facultyCount}</span>,
    },
    {
      key: 'accreditation',
      header: 'Board Accreditation',
      render: (d: Department) => (
        <Badge
          variant={
            d.accreditationStatus === 'FULL'
              ? 'success'
              : d.accreditationStatus === 'PROVISIONAL'
              ? 'warning'
              : 'danger'
          }
        >
          {d.accreditationStatus === 'FULL' ? 'Full Accreditation' : 'Provisional'}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Actions',
      align: 'right' as const,
      render: (d: Department) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            showToast({
              type: 'info',
              title: `${d.name} Selected`,
              message: `Viewing curriculum and course offerings for ${d.code}.`,
            })
          }
        >
          View Department
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Departments</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Accredited health technology departments, Heads of Department (HODs), and faculty allocations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() =>
              showToast({
                type: 'info',
                title: 'Department Setup',
                message: 'All 5 statutory departments are currently configured.',
              })
            }
          >
            Add Department
          </Button>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Departments</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-2 block">5</span>
          <span className="text-xs text-slate-500 mt-1 block">Accredited by regulatory bodies</span>
        </div>
        <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Health Programmes</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-2 block">7</span>
          <span className="text-xs text-slate-500 mt-1 block">Diploma & certificate courses</span>
        </div>
        <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Academic Faculty</span>
          <span className="text-2xl font-extrabold text-[#0F7640] mt-2 block">44</span>
          <span className="text-xs text-slate-500 mt-1 block">Lecturers & clinical tutors</span>
        </div>
        <div className="bg-white rounded-[4px] border border-slate-200 p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Students</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-2 block">1,248</span>
          <span className="text-xs text-slate-500 mt-1 block">Active across all levels</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'directory', label: 'Department Directory' },
          { id: 'programmes', label: 'Accredited Programmes' },
          { id: 'hods', label: 'Heads of Department' },
        ]}
        activeTab={activeTab}
        onChange={(id: any) => setActiveTab(id)}
      />

      {/* Department Directory Table */}
      {activeTab === 'directory' && (
        <Card header={<span className="font-bold text-slate-900">Health Technology Academic Departments</span>}>
          <Table
            columns={columns}
            data={departments}
            keyExtractor={(d) => d.id}
            isDense={isDense}
          />
        </Card>
      )}

      {/* Accredited Programmes Tab */}
      {activeTab === 'programmes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card header={<span className="font-bold text-slate-900">Community Health Programmes</span>}>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">Community Health Extension Worker (CHEW)</p>
                  <span className="text-slate-500">3-Year Professional Diploma • 340 Students</span>
                </div>
                <Badge variant="success">Accredited</Badge>
              </div>
              <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">Junior Community Health Extension Worker (JCHEW)</p>
                  <span className="text-slate-500">2-Year Certificate Programme • 140 Students</span>
                </div>
                <Badge variant="success">Accredited</Badge>
              </div>
            </div>
          </Card>

          <Card header={<span className="font-bold text-slate-900">Medical Laboratory Programmes</span>}>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">Medical Laboratory Technician (MLT)</p>
                  <span className="text-slate-500">3-Year Professional Diploma • 220 Students</span>
                </div>
                <Badge variant="success">Accredited</Badge>
              </div>
              <div className="p-3 bg-slate-50 rounded-[4px] border border-slate-200 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">Medical Laboratory Assistant (MLA)</p>
                  <span className="text-slate-500">2-Year Certificate Programme • 100 Students</span>
                </div>
                <Badge variant="success">Accredited</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* HODs Tab */}
      {activeTab === 'hods' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d) => (
            <Card key={d.id}>
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {d.code}
                </span>
                <p className="font-extrabold text-sm text-slate-900">{d.hod}</p>
                <p className="text-slate-600 font-medium">{d.name}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Faculty: {d.facultyCount} Lecturers</span>
                  <Badge variant="neutral" size="sm">{d.regulatoryBody}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

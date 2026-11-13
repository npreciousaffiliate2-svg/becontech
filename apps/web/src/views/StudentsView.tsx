import React, { useState } from 'react';
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
  Users,
  IdCard,
  QrCode,
  FileText,
  Printer,
  Shield,
  HeartPulse,
} from 'lucide-react';

interface Student {
  id: string;
  matricNumber: string;
  fullName: string;
  programme: string;
  level: string;
  bloodGroup: string;
  genotype: string;
  hepatitisBStatus: 'VACCINATED' | 'PENDING';
  status: 'ACTIVE' | 'SUSPENDED' | 'DEFERRED' | 'GRADUATED';
}

export const StudentsView: React.FC = () => {
  const { session, recordAudit, isDense } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'directory' | 'lifecycle' | 'id_cards'>('directory');
  const [selectedIdCard, setSelectedIdCard] = useState<Student | null>(null);

  const [students, setStudents] = useState<Student[]>([
    {
      id: 'stu-001',
      matricNumber: 'CHE/2026/0014',
      fullName: 'Blessing Adeyemi',
      programme: 'Community Health Extension Worker (CHEW)',
      level: '200 Level',
      bloodGroup: 'O+',
      genotype: 'AA',
      hepatitisBStatus: 'VACCINATED',
      status: 'ACTIVE',
    },
    {
      id: 'stu-002',
      matricNumber: 'MLT/2026/0029',
      fullName: 'Emmanuel Chukwuma',
      programme: 'Medical Laboratory Technician (MLT)',
      level: '100 Level',
      bloodGroup: 'A+',
      genotype: 'AS',
      hepatitisBStatus: 'VACCINATED',
      status: 'ACTIVE',
    },
    {
      id: 'stu-003',
      matricNumber: 'PHT/2026/0009',
      fullName: 'Khadijat Sani',
      programme: 'Pharmacy Technician',
      level: '100 Level',
      bloodGroup: 'B+',
      genotype: 'AA',
      hepatitisBStatus: 'PENDING',
      status: 'ACTIVE',
    },
  ]);

  const columns = [
    { key: 'matricNumber', header: 'Matric No.', render: (s: Student) => <span className="font-mono font-bold text-[#0A77FE]">{s.matricNumber}</span> },
    { key: 'fullName', header: 'Full Name' },
    { key: 'programme', header: 'Programme' },
    { key: 'level', header: 'Level' },
    {
      key: 'clinicalHealth',
      header: 'Clinical Health / Serology',
      render: (s: Student) => (
        <span className="text-[11px] font-medium text-slate-700">
          {s.bloodGroup} • {s.genotype} • HepB: {s.hepatitisBStatus}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Lifecycle Status',
      render: (s: Student) => (
        <Badge variant={s.status === 'ACTIVE' ? 'success' : 'danger'}>
          {s.status}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'ID Card Studio',
      align: 'right' as const,
      render: (s: Student) => (
        <Button size="sm" variant="secondary" onClick={() => setSelectedIdCard(s)} leftIcon={<IdCard className="w-3.5 h-3.5" />}>
          View ID
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Student Information System (SIS)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Student 360 Master Records • Semester Registration • Status Lifecycle • ID Card Studio
          </p>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'directory', label: 'Master Student Registry' },
          { id: 'lifecycle', label: 'Status Lifecycle Workflow' },
          { id: 'id_cards', label: 'ID Card Generation' },
        ]}
        activeTab={activeTab}
        onChange={(id: any) => setActiveTab(id)}
      />

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Enrolled Trainees Directory
          </span>
          <span className="text-xs text-slate-500">
            Compliant with Health Training Standards
          </span>
        </div>
        <Table
          columns={columns}
          data={students}
          keyExtractor={(s) => s.id}
          isDense={isDense}
        />
      </Card>

      {/* ID Card Studio Modal */}
      {selectedIdCard && (
        <Modal
          isOpen={!!selectedIdCard}
          onClose={() => setSelectedIdCard(null)}
          title="Print-Ready Student ID Card"
          description="Institutional credential compliant with clinical posting verification requirements."
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button size="sm" variant="secondary" onClick={() => window.print()} leftIcon={<Printer className="w-3.5 h-3.5" />}>
                Print Plastic Card
              </Button>
            </div>
          }
        >
          <div className="w-80 mx-auto rounded-[4px] border border-slate-300 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white p-4 shadow-xl flex flex-col justify-between h-52 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <div>
                <h4 className="text-[11px] font-bold tracking-widest uppercase text-blue-400">
                  Bethsaida College
                </h4>
                <p className="text-[8px] text-slate-300 tracking-wider">College of Health Tech</p>
              </div>
              <Badge variant="primary" size="sm">STUDENT</Badge>
            </div>

            <div className="flex items-center gap-3 my-2">
              <div className="w-16 h-18 bg-slate-700 rounded-[4px] border border-slate-600 flex items-center justify-center text-slate-400 text-xs font-semibold shrink-0">
                PHOTO
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs truncate">{selectedIdCard.fullName}</p>
                <p className="text-[10px] text-blue-300 font-mono">{selectedIdCard.matricNumber}</p>
                <p className="text-[9px] text-slate-300 truncate mt-0.5">{selectedIdCard.programme}</p>
                <p className="text-[9px] text-slate-400">Blood: {selectedIdCard.bloodGroup} | Genotype: {selectedIdCard.genotype}</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-700 pt-1.5 text-[8px] text-slate-400">
              <span className="font-mono">VALID: 2026 – 2028</span>
              <QrCode className="w-6 h-6 text-white p-0.5 bg-slate-800 rounded-[2px]" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

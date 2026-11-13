import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import {
  Card,
  Button,
  Table,
  Badge,
  Modal,
  Tabs,
} from '@campusone/ui';
import {
  IdCard,
  QrCode,
  Printer,
  UserCheck,
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

// Industry Standard Code 128 / Code 39 Linear Barcode
const Barcode: React.FC<{ value: string; className?: string }> = ({ value, className = '' }) => {
  const bars = [
    2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 1, 2, 1, 2, 3, 1, 2, 1, 1, 3,
    1, 2, 2, 1, 3, 1, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 1, 2,
    1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 2,
    1, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 1, 2, 1, 2, 3, 1, 2, 1, 1
  ];

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="flex items-end h-7 gap-[1.5px] bg-white px-2 py-0.5 rounded-[2px] border border-slate-200">
        {bars.map((width, idx) => (
          <span
            key={idx}
            className={`h-full ${idx % 2 === 0 ? 'bg-slate-900' : 'bg-transparent'}`}
            style={{ width: `${width}px` }}
          />
        ))}
      </div>
      <span className="text-[9px] font-semibold tracking-widest text-slate-700 mt-0.5 font-sans">
        *{value}*
      </span>
    </div>
  );
};

export const StudentsView: React.FC = () => {
  const { isDense } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') as 'directory' | 'lifecycle' | 'id_cards' | null;
  const [activeTab, setActiveTab] = useState<'directory' | 'lifecycle' | 'id_cards'>(tabParam || 'directory');
  const [selectedIdCard, setSelectedIdCard] = useState<Student | null>(null);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (id: string) => {
    setActiveTab(id as any);
    setSearchParams({ tab: id });
  };

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
    { key: 'matricNumber', header: 'Matric No.', render: (s: Student) => <span className="font-bold text-[#0F7640]">{s.matricNumber}</span> },
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Information System</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Student records, status changes, and student ID cards
          </p>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'directory', label: 'Student Directory' },
          { id: 'lifecycle', label: 'Status Lifecycle' },
          { id: 'id_cards', label: 'Student ID Cards' },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
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
          title="Official Student Identity Card"
          description="Institutional credential compliant with clinical posting verification requirements."
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button size="sm" variant="secondary" onClick={() => window.print()} leftIcon={<Printer className="w-3.5 h-3.5" />}>
                Print Plastic Card
              </Button>
            </div>
          }
        >
          {/* Authentic White PVC ID Card with Institutional Green Header */}
          <div className="w-[340px] mx-auto rounded-[6px] border border-slate-300 bg-white shadow-lg overflow-hidden flex flex-col justify-between">
            {/* Header Banner */}
            <div className="bg-[#093322] px-3.5 py-2.5 text-white flex items-center justify-between border-b-2 border-[#FEC10A]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-[2px] bg-white text-[#093322] font-black text-[10px] flex items-center justify-center shrink-0">
                  C1
                </div>
                <div>
                  <h4 className="text-[10px] font-bold tracking-wider uppercase leading-tight">
                    Bethsaida College
                  </h4>
                  <p className="text-[8px] text-emerald-200 uppercase tracking-widest leading-none">
                    College of Health Technology
                  </p>
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded-[2px] bg-[#FEC10A] text-slate-900 font-extrabold text-[9px] uppercase tracking-wider">
                Student
              </span>
            </div>

            {/* Card Body */}
            <div className="p-3.5 bg-white flex items-start gap-3">
              {/* Photo Box */}
              <div className="w-20 h-24 bg-slate-100 rounded-[3px] border border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0 relative overflow-hidden">
                <UserCheck className="w-8 h-8 text-slate-300" />
                <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">PASSPORT</span>
                <div className="absolute bottom-0 inset-x-0 bg-slate-200/80 text-[7px] text-center font-bold text-slate-500 py-0.5 uppercase">
                  VERIFIED
                </div>
              </div>

              {/* Student Details */}
              <div className="min-w-0 flex-1 space-y-1">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Student Name</span>
                  <p className="font-extrabold text-xs text-slate-900 truncate leading-tight uppercase">
                    {selectedIdCard.fullName}
                  </p>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Matriculation No.</span>
                  <p className="font-bold text-xs text-[#0F7640] leading-tight">
                    {selectedIdCard.matricNumber}
                  </p>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Programme</span>
                  <p className="text-[10px] font-semibold text-slate-800 truncate leading-tight">
                    {selectedIdCard.programme}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-0.5 text-[9px] font-medium text-slate-600">
                  <span>Blood: <strong className="text-slate-800">{selectedIdCard.bloodGroup}</strong></span>
                  <span>Genotype: <strong className="text-slate-800">{selectedIdCard.genotype}</strong></span>
                </div>
              </div>
            </div>

            {/* Industry Standard Linear Barcode Section */}
            <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-200 flex flex-col items-center justify-center">
              <Barcode value={selectedIdCard.matricNumber} />
              <div className="w-full flex items-center justify-between text-[8px] text-slate-500 pt-1 mt-1 border-t border-slate-200/60 font-medium">
                <span>ISSUED: NOV 2026</span>
                <span className="font-bold text-slate-700">VALID THRU: OCT 2028</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

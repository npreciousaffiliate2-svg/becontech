import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
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
  Plus,
  Printer,
  QrCode,
  ShieldCheck,
  CreditCard,
  DollarSign,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Send,
  Eye,
} from 'lucide-react';
import { formatNaira, FeeCategory, PaymentMethod } from '@campusone/contracts';

/* ─── TYPES ─── */
type BursaryTab = 'ledger' | 'receipts' | 'structure' | 'debtors' | 'reconciliation';

interface DebtorRecord {
  id: string;
  studentId: string;
  matricNumber: string;
  studentName: string;
  departmentCode: string;
  departmentName: string;
  level: string;
  totalAssessedKobo: number;
  totalPaidKobo: number;
  overdueKobo: number;
  installmentPlan: string;
  gateRestricted: boolean;
  lastReminderDate: string;
}

interface ReconciliationRecord {
  id: string;
  date: string;
  gateway: 'PAYSTACK' | 'REMITA' | 'FLUTTERWAVE' | 'DIRECT_BANK_WIRE';
  gatewayReference: string;
  transactionsCount: number;
  grossAmountKobo: number;
  netSettledKobo: number;
  status: 'RECONCILED' | 'PENDING_SETTLEMENT';
}

interface FeeStructureItem {
  id: string;
  programmeName: string;
  departmentCode: string;
  version: string;
  tuitionKobo: number;
  clinicalLevyKobo: number;
  labBenchKobo: number;
  boardExamLevyKobo: number;
  developmentKobo: number;
  totalKobo: number;
}

export const BursaryView: React.FC = () => {
  const { ledgerEntries, receipts, addLedgerPayment, isDense, recordAudit } = useApp();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tab: routeTab } = useParams<{ tab: string }>();

  // Tab synchronization
  const resolveTab = (tabStr?: string | null): BursaryTab => {
    if (!tabStr) return 'ledger';
    if (['ledger', 'receipts', 'structure', 'debtors', 'reconciliation'].includes(tabStr)) {
      return tabStr as BursaryTab;
    }
    return 'ledger';
  };

  const [activeTab, setActiveTab] = useState<BursaryTab>(
    resolveTab(routeTab || searchParams.get('tab'))
  );

  useEffect(() => {
    const nextTab = resolveTab(routeTab || searchParams.get('tab'));
    setActiveTab(nextTab);
  }, [routeTab, searchParams]);

  const handleTabChange = (id: BursaryTab) => {
    setActiveTab(id);
    navigate(`/bursary/${id}`);
  };

  /* ─── FILTERS STATE ─── */
  const [ledgerCategoryFilter, setLedgerCategoryFilter] = useState('ALL');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [receiptSearchQuery, setReceiptSearchQuery] = useState('');
  const [receiptGatewayFilter, setReceiptGatewayFilter] = useState('ALL');
  const [debtorSearchQuery, setDebtorSearchQuery] = useState('');
  const [reconcileSearchQuery, setReconcileSearchQuery] = useState('');

  /* ─── MODAL STATES ─── */
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState<FeeStructureItem | null>(null);

  /* ─── PAYMENT FORM STATE ─── */
  const [studentId, setStudentId] = useState('stu-001');
  const [matricNumber, setMatricNumber] = useState('CHE/2026/0014');
  const [studentName, setStudentName] = useState('Blessing Adeyemi');
  const [amountNaira, setAmountNaira] = useState('55000');
  const [category, setCategory] = useState<FeeCategory>('tuition');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paystack');

  /* ─── PRE-CONFIGURED ACTIVE STUDENTS FOR EASY PAYMENT POSTING ─── */
  const registeredStudents = [
    { id: 'stu-001', matric: 'CHE/2026/0014', name: 'Blessing Adeyemi', dept: 'CHE', defaultAmount: '55000' },
    { id: 'stu-002', matric: 'MLT/2026/0029', name: 'Emmanuel Chukwuma', dept: 'MLT', defaultAmount: '60000' },
    { id: 'stu-003', matric: 'PHT/2026/0009', name: 'Khadijat Sani', dept: 'PHT', defaultAmount: '40000' },
    { id: 'stu-004', matric: 'CHE/2026/0017', name: 'Chinedu Eze', dept: 'CHE', defaultAmount: '75000' },
    { id: 'stu-005', matric: 'HIM/2026/0005', name: 'Rukayat Sanusi', dept: 'HIM', defaultAmount: '35000' },
    { id: 'stu-006', matric: 'EHT/2026/0012', name: 'Solomon Giwa', dept: 'EHT', defaultAmount: '50000' },
  ];

  const handleSelectStudentForPayment = (matric: string) => {
    const s = registeredStudents.find((item) => item.matric === matric);
    if (s) {
      setStudentId(s.id);
      setMatricNumber(s.matric);
      setStudentName(s.name);
      setAmountNaira(s.defaultAmount);
    }
  };

  /* ─── DATA: DEBTORS REGISTRY ─── */
  const [debtors, setDebtors] = useState<DebtorRecord[]>([
    {
      id: 'dbt-01',
      studentId: 'stu-001',
      matricNumber: 'CHE/2026/0014',
      studentName: 'Blessing Adeyemi',
      departmentCode: 'CHE',
      departmentName: 'Community Health Extension (CHEW)',
      level: '200L',
      totalAssessedKobo: 22000000,
      totalPaidKobo: 16500000,
      overdueKobo: 5500000,
      installmentPlan: '2nd Semester Balance Due',
      gateRestricted: false,
      lastReminderDate: '2026-11-10',
    },
    {
      id: 'dbt-02',
      studentId: 'stu-003',
      matricNumber: 'PHT/2026/0009',
      studentName: 'Khadijat Sani',
      departmentCode: 'PHT',
      departmentName: 'Pharmacy Technician Studies',
      level: '200L',
      totalAssessedKobo: 24500000,
      totalPaidKobo: 16500000,
      overdueKobo: 8000000,
      installmentPlan: 'Overdue 1st Semester Installment',
      gateRestricted: true,
      lastReminderDate: '2026-11-12',
    },
    {
      id: 'dbt-03',
      studentId: 'stu-004',
      matricNumber: 'CHE/2026/0017',
      studentName: 'Chinedu Eze',
      departmentCode: 'CHE',
      departmentName: 'Community Health Extension (CHEW)',
      level: '200L',
      totalAssessedKobo: 22000000,
      totalPaidKobo: 11000000,
      overdueKobo: 11000000,
      installmentPlan: 'First Installment Default',
      gateRestricted: true,
      lastReminderDate: '2026-11-08',
    },
    {
      id: 'dbt-04',
      studentId: 'stu-006',
      matricNumber: 'EHT/2026/0012',
      studentName: 'Solomon Giwa',
      departmentCode: 'EHT',
      departmentName: 'Environmental Health Sciences',
      level: '200L',
      totalAssessedKobo: 18500000,
      totalPaidKobo: 12000000,
      overdueKobo: 6500000,
      installmentPlan: 'Clinical Posting Levy Unpaid',
      gateRestricted: true,
      lastReminderDate: '2026-11-09',
    },
  ]);

  /* ─── DATA: FEE STRUCTURES ─── */
  const feeStructures: FeeStructureItem[] = [
    {
      id: 'fs-01',
      programmeName: 'Community Health Extension Worker (CHEW)',
      departmentCode: 'CHE',
      version: 'v2026.1 (Active)',
      tuitionKobo: 12000000,
      clinicalLevyKobo: 3500000,
      labBenchKobo: 2000000,
      boardExamLevyKobo: 4500000,
      developmentKobo: 0,
      totalKobo: 22000000,
    },
    {
      id: 'fs-02',
      programmeName: 'Medical Laboratory Technician (MLT)',
      departmentCode: 'MLT',
      version: 'v2026.1 (Active)',
      tuitionKobo: 14000000,
      clinicalLevyKobo: 4000000,
      labBenchKobo: 3000000,
      boardExamLevyKobo: 5000000,
      developmentKobo: 0,
      totalKobo: 26000000,
    },
    {
      id: 'fs-03',
      programmeName: 'Pharmacy Technician Studies (PHT)',
      departmentCode: 'PHT',
      version: 'v2026.1 (Active)',
      tuitionKobo: 13500000,
      clinicalLevyKobo: 3500000,
      labBenchKobo: 2500000,
      boardExamLevyKobo: 5000000,
      developmentKobo: 0,
      totalKobo: 24500000,
    },
    {
      id: 'fs-04',
      programmeName: 'Health Information Management (HIM)',
      departmentCode: 'HIM',
      version: 'v2026.1 (Active)',
      tuitionKobo: 11000000,
      clinicalLevyKobo: 3000000,
      labBenchKobo: 2000000,
      boardExamLevyKobo: 3500000,
      developmentKobo: 0,
      totalKobo: 19500000,
    },
    {
      id: 'fs-05',
      programmeName: 'Environmental Health Sciences (EHT)',
      departmentCode: 'EHT',
      version: 'v2026.1 (Active)',
      tuitionKobo: 10500000,
      clinicalLevyKobo: 3000000,
      labBenchKobo: 1500000,
      boardExamLevyKobo: 3500000,
      developmentKobo: 0,
      totalKobo: 18500000,
    },
  ];

  /* ─── DATA: RECONCILIATION AUDIT ─── */
  const reconciliations: ReconciliationRecord[] = [
    {
      id: 'rec-01',
      date: '2026-11-13',
      gateway: 'PAYSTACK',
      gatewayReference: 'PSTK-SETTLE-20261113-0941',
      transactionsCount: 48,
      grossAmountKobo: 485000000,
      netSettledKobo: 477725000,
      status: 'RECONCILED',
    },
    {
      id: 'rec-02',
      date: '2026-11-12',
      gateway: 'REMITA',
      gatewayReference: 'REM-SETTLE-20261112-8802',
      transactionsCount: 32,
      grossAmountKobo: 340000000,
      netSettledKobo: 334900000,
      status: 'RECONCILED',
    },
    {
      id: 'rec-03',
      date: '2026-11-12',
      gateway: 'DIRECT_BANK_WIRE',
      gatewayReference: 'BNK-STANBIC-20261112-1402',
      transactionsCount: 14,
      grossAmountKobo: 210000000,
      netSettledKobo: 210000000,
      status: 'RECONCILED',
    },
    {
      id: 'rec-04',
      date: '2026-11-11',
      gateway: 'FLUTTERWAVE',
      gatewayReference: 'FLW-SETTLE-20261111-5510',
      transactionsCount: 22,
      grossAmountKobo: 185000000,
      netSettledKobo: 182410000,
      status: 'RECONCILED',
    },
  ];

  /* ─── PAYMENT ACTION ─── */
  const handlePostPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountKobo = Math.round(parseFloat(amountNaira) * 100);
    if (!amountKobo || amountKobo <= 0) {
      showToast({ type: 'danger', title: 'Invalid Amount', message: 'Amount must be greater than zero.' });
      return;
    }

    const receipt = addLedgerPayment({
      studentId,
      matricNumber,
      studentName,
      amountKobo,
      category,
      description: `${paymentMethod.toUpperCase()} Direct Settlement — ${category.replace('_', ' ').toUpperCase()}`,
      paymentMethod,
    });

    // Update debtor records if applicable
    setDebtors((prev) =>
      prev.map((d) => {
        if (d.matricNumber === matricNumber) {
          const newOverdue = Math.max(0, d.overdueKobo - amountKobo);
          return {
            ...d,
            totalPaidKobo: d.totalPaidKobo + amountKobo,
            overdueKobo: newOverdue,
            gateRestricted: newOverdue > 0,
          };
        }
        return d;
      })
    );

    recordAudit('STUDENT_FEE_PAYMENT_POSTED', 'BURSARY_LEDGER', matricNumber);

    setIsPaymentModalOpen(false);
    showToast({
      type: 'success',
      title: 'Payment Confirmed & Posted',
      message: `Official Receipt #${receipt.receiptNumber} generated with immutable ledger audit.`,
    });
    setSelectedReceipt(receipt);
  };

  const handleOpenPaymentForDebtor = (debtor: DebtorRecord) => {
    setStudentId(debtor.studentId);
    setMatricNumber(debtor.matricNumber);
    setStudentName(debtor.studentName);
    setAmountNaira(String(Math.round(debtor.overdueKobo / 100)));
    setIsPaymentModalOpen(true);
  };

  const handleDispatchReminder = (debtor: DebtorRecord) => {
    setDebtors((prev) =>
      prev.map((d) =>
        d.id === debtor.id ? { ...d, lastReminderDate: new Date().toISOString().split('T')[0] } : d
      )
    );
    recordAudit('FEE_OVERDUE_NOTICE_DISPATCHED', 'BURSARY_NOTIFICATIONS', debtor.matricNumber);
    showToast({
      type: 'success',
      title: 'Overdue Notice Dispatched',
      message: `Automated SMS & email installment reminder sent to ${debtor.studentName} (${debtor.matricNumber}).`,
    });
  };

  /* ─── DERIVED FILTERED LISTS ─── */
  const filteredLedgerEntries = ledgerEntries.filter((l) => {
    if (ledgerCategoryFilter !== 'ALL' && l.category !== ledgerCategoryFilter) return false;
    if (ledgerTypeFilter !== 'ALL' && l.entryType !== ledgerTypeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMatric = l.matricNumber.toLowerCase().includes(q);
      const matchDesc = l.description.toLowerCase().includes(q);
      if (!matchMatric && !matchDesc) return false;
    }
    return true;
  });

  const filteredReceipts = receipts.filter((r) => {
    if (receiptGatewayFilter !== 'ALL' && r.paymentMethod !== receiptGatewayFilter) return false;
    if (receiptSearchQuery.trim()) {
      const q = receiptSearchQuery.toLowerCase();
      const matchNum = r.receiptNumber.toLowerCase().includes(q);
      const matchName = r.studentName.toLowerCase().includes(q);
      const matchMatric = r.matricNumber.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchMatric) return false;
    }
    return true;
  });

  const filteredDebtors = debtors.filter((d) => {
    if (debtorSearchQuery.trim()) {
      const q = debtorSearchQuery.toLowerCase();
      const matchName = d.studentName.toLowerCase().includes(q);
      const matchMatric = d.matricNumber.toLowerCase().includes(q);
      const matchDept = d.departmentName.toLowerCase().includes(q);
      if (!matchName && !matchMatric && !matchDept) return false;
    }
    return true;
  });

  const filteredReconciliations = reconciliations.filter((rec) => {
    if (reconcileSearchQuery.trim()) {
      const q = reconcileSearchQuery.toLowerCase();
      const matchRef = rec.gatewayReference.toLowerCase().includes(q);
      const matchGateway = rec.gateway.toLowerCase().includes(q);
      if (!matchRef && !matchGateway) return false;
    }
    return true;
  });

  /* ─── TABLE 1: MASTER LEDGER COLUMNS ─── */
  const ledgerColumns = [
    {
      key: 'createdAt',
      header: 'Posting Date',
      nowrap: true,
      render: (l: any) => (
        <span className="text-xs text-slate-700">{l.createdAt.split('T')[0]}</span>
      ),
    },
    {
      key: 'matricNumber',
      header: 'Matriculation No.',
      nowrap: true,
      render: (l: any) => (
        <span className="font-semibold text-slate-900">{l.matricNumber}</span>
      ),
    },
    {
      key: 'category',
      header: 'Fee Category',
      nowrap: true,
      render: (l: any) => (
        <Badge variant="neutral" size="sm">
          {l.category.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'description',
      header: 'Description / Transaction Note',
      render: (l: any) => (
        <span className="text-xs text-slate-800 font-medium block truncate max-w-xs" title={l.description}>
          {l.description}
        </span>
      ),
    },
    {
      key: 'entryType',
      header: 'Type',
      nowrap: true,
      render: (l: any) => (
        <Badge variant={l.entryType === 'credit' ? 'success' : 'danger'} size="sm">
          {l.entryType === 'credit' ? 'Credit (Payment)' : 'Debit (Levy)'}
        </Badge>
      ),
    },
    {
      key: 'amountKobo',
      header: 'Amount',
      align: 'right' as const,
      nowrap: true,
      render: (l: any) => (
        <span className={`font-bold font-sans ${l.entryType === 'credit' ? 'text-[#13A348]' : 'text-slate-900'}`}>
          {l.entryType === 'credit' ? '-' : '+'}{formatNaira(l.amountKobo)}
        </span>
      ),
    },
    {
      key: 'balanceAfterKobo',
      header: 'Derived Balance',
      align: 'right' as const,
      nowrap: true,
      render: (l: any) => (
        <span className="font-bold text-slate-900 font-sans">
          {formatNaira(l.balanceAfterKobo)}
        </span>
      ),
    },
  ];

  /* ─── TABLE 2: RECEIPTS COLUMNS ─── */
  const receiptColumns = [
    {
      key: 'receiptNumber',
      header: 'Receipt Number',
      nowrap: true,
      render: (r: any) => (
        <span className="font-bold text-[#0F7640]">{r.receiptNumber}</span>
      ),
    },
    {
      key: 'paidAt',
      header: 'Payment Date',
      nowrap: true,
      render: (r: any) => (
        <span className="text-xs text-slate-600">{r.paidAt.replace('T', ' ').slice(0, 16)}</span>
      ),
    },
    {
      key: 'studentName',
      header: 'Student Name',
      render: (r: any) => (
        <div>
          <span className="font-semibold text-slate-900 block">{r.studentName}</span>
          <span className="text-[11px] text-slate-500">{r.matricNumber}</span>
        </div>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Payment Gateway',
      nowrap: true,
      render: (r: any) => (
        <Badge variant="primary" size="sm">
          {r.paymentMethod.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'formattedAmount',
      header: 'Amount Paid',
      align: 'right' as const,
      nowrap: true,
      render: (r: any) => (
        <span className="font-extrabold text-[#13A348] text-sm font-sans">
          {r.formattedAmount}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right' as const,
      nowrap: true,
      render: (r: any) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setSelectedReceipt(r)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
          className="whitespace-nowrap"
        >
          View Receipt
        </Button>
      ),
    },
  ];

  /* ─── TABLE 3: DEBTORS COLUMNS ─── */
  const debtorColumns = [
    {
      key: 'matricNumber',
      header: 'Matriculation No.',
      nowrap: true,
      render: (d: DebtorRecord) => (
        <span className="font-semibold text-slate-900">{d.matricNumber}</span>
      ),
    },
    {
      key: 'studentName',
      header: 'Student & Department',
      render: (d: DebtorRecord) => (
        <div>
          <span className="font-semibold text-slate-900 block">{d.studentName}</span>
          <span className="text-[11px] text-slate-500">{d.departmentName} • {d.level}</span>
        </div>
      ),
    },
    {
      key: 'totalAssessedKobo',
      header: 'Session Charge',
      nowrap: true,
      render: (d: DebtorRecord) => (
        <span className="text-xs text-slate-700 font-sans">{formatNaira(d.totalAssessedKobo)}</span>
      ),
    },
    {
      key: 'totalPaidKobo',
      header: 'Total Paid',
      nowrap: true,
      render: (d: DebtorRecord) => (
        <span className="text-xs font-semibold text-[#13A348] font-sans">{formatNaira(d.totalPaidKobo)}</span>
      ),
    },
    {
      key: 'overdueKobo',
      header: 'Outstanding Balance',
      nowrap: true,
      render: (d: DebtorRecord) => (
        <span className="text-sm font-bold text-[#F83A20] font-sans">{formatNaira(d.overdueKobo)}</span>
      ),
    },
    {
      key: 'gateRestricted',
      header: 'Exam Hall Status',
      nowrap: true,
      render: (d: DebtorRecord) => (
        <Badge variant={d.gateRestricted ? 'danger' : 'warning'} size="sm">
          {d.gateRestricted ? 'Restricted' : 'Provisionally Allowed'}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Actions',
      align: 'right' as const,
      nowrap: true,
      render: (d: DebtorRecord) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleDispatchReminder(d)}
            leftIcon={<Send className="w-3.5 h-3.5" />}
            className="whitespace-nowrap"
          >
            Send Notice
          </Button>
          <Button
            size="sm"
            onClick={() => handleOpenPaymentForDebtor(d)}
            className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
          >
            Clear Balance
          </Button>
        </div>
      ),
    },
  ];

  /* ─── TABLE 4: RECONCILIATION COLUMNS ─── */
  const reconciliationColumns = [
    {
      key: 'date',
      header: 'Settlement Date',
      nowrap: true,
      render: (rec: ReconciliationRecord) => (
        <span className="text-xs text-slate-800">{rec.date}</span>
      ),
    },
    {
      key: 'gateway',
      header: 'Gateway Channel',
      nowrap: true,
      render: (rec: ReconciliationRecord) => (
        <Badge variant="primary" size="sm">
          {rec.gateway.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'gatewayReference',
      header: 'Settlement Reference',
      nowrap: true,
      render: (rec: ReconciliationRecord) => (
        <span className="text-xs text-slate-600 font-sans">{rec.gatewayReference}</span>
      ),
    },
    {
      key: 'transactionsCount',
      header: 'Transactions',
      nowrap: true,
      render: (rec: ReconciliationRecord) => (
        <span className="font-semibold text-slate-800">{rec.transactionsCount} Settlements</span>
      ),
    },
    {
      key: 'grossAmountKobo',
      header: 'Gross Collected',
      align: 'right' as const,
      nowrap: true,
      render: (rec: ReconciliationRecord) => (
        <span className="font-bold text-slate-900 font-sans">{formatNaira(rec.grossAmountKobo)}</span>
      ),
    },
    {
      key: 'netSettledKobo',
      header: 'Net Credited to Bank',
      align: 'right' as const,
      nowrap: true,
      render: (rec: ReconciliationRecord) => (
        <span className="font-extrabold text-[#13A348] font-sans">{formatNaira(rec.netSettledKobo)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Audit Status',
      nowrap: true,
      render: (rec: ReconciliationRecord) => (
        <Badge variant="success" size="sm">
          {rec.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">School Fees & Bursary</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Student fee accounts, double-entry financial ledger, official receipts, fee schedules, and debtor management.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsPaymentModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
          >
            Record Student Payment
          </Button>
        </div>
      </div>

      {/* ─── Institutional Stat Cards (Spacious, No Squeezing) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#13A348] flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">₦84.25M</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">74.0% recovery</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Target ₦114M</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overdue Receivables
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-rose-50 text-[#F83A20] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#F83A20] font-sans tracking-tight">₦18.40M</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#F83A20] font-semibold">142 debtors</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Overdue plans</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Settlements Reconciled
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">384</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">100% matched</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Zero discrepancy</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Exam Fee Clearance
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">88.6%</div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">Trainees cleared</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">Gate Pass active</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <Tabs
        tabs={[
          { id: 'ledger', label: 'Student Master Ledger' },
          { id: 'receipts', label: 'Payment Receipts' },
          { id: 'structure', label: 'Fee Schedules & Levies' },
          { id: 'debtors', label: 'Debtors & Installments' },
          { id: 'reconciliation', label: 'Bank Reconciliation' },
        ]}
        activeTab={activeTab}
        onChange={(id: any) => handleTabChange(id)}
      />

      {/* ─── TAB 1: STUDENT MASTER LEDGER ─── */}
      {activeTab === 'ledger' && (
        <Card>
          <Table
            columns={ledgerColumns}
            data={filteredLedgerEntries}
            keyExtractor={(l) => l.id}
            isDense={isDense}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search matriculation or description..."
            toolbarFilters={
              <>
                <div className="w-44">
                  <Select
                    value={ledgerCategoryFilter}
                    onChange={(val) => setLedgerCategoryFilter(val)}
                    options={[
                      { value: 'ALL', label: 'All Fee Categories' },
                      { value: 'tuition', label: 'Tuition Fees' },
                      { value: 'clinical_posting', label: 'Clinical Levies' },
                      { value: 'acceptance', label: 'Acceptance Fees' },
                      { value: 'exam', label: 'Board Exam Levies' },
                      { value: 'hostel', label: 'Hostel Fees' },
                    ]}
                  />
                </div>
                <div className="w-36">
                  <Select
                    value={ledgerTypeFilter}
                    onChange={(val) => setLedgerTypeFilter(val)}
                    options={[
                      { value: 'ALL', label: 'All Types' },
                      { value: 'credit', label: 'Credits (Payments)' },
                      { value: 'debit', label: 'Debits (Charges)' },
                    ]}
                  />
                </div>
              </>
            }
            emptyTitle="No Ledger Entries Found"
            emptyDescription="No transactions match your search filter."
          />
        </Card>
      )}

      {/* ─── TAB 2: PAYMENT RECEIPTS ─── */}
      {activeTab === 'receipts' && (
        <Card>
          <Table
            columns={receiptColumns}
            data={filteredReceipts}
            keyExtractor={(r) => r.receiptNumber}
            isDense={isDense}
            searchValue={receiptSearchQuery}
            onSearchChange={setReceiptSearchQuery}
            searchPlaceholder="Search receipt number, student, or matric..."
            toolbarFilters={
              <div className="w-48">
                <Select
                  value={receiptGatewayFilter}
                  onChange={(val) => setReceiptGatewayFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Gateways' },
                    { value: 'paystack', label: 'Paystack' },
                    { value: 'remita', label: 'Remita' },
                    { value: 'flutterwave', label: 'Flutterwave' },
                    { value: 'bank_transfer_direct', label: 'Direct Bank Settlement' },
                  ]}
                />
              </div>
            }
          />
        </Card>
      )}

      {/* ─── TAB 3: FEE SCHEDULES & LEVIES ─── */}
      {activeTab === 'structure' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center justify-between text-xs text-slate-600">
            <span>
              <strong>Governing Fee Policy:</strong> Statutory approved session charges for the 2026/2027 Academic Session across all accredited health training disciplines.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feeStructures.map((fs) => (
              <Card key={fs.id} className="p-4 bg-white border border-slate-200 rounded-[4px] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#0F7640] text-xs uppercase">{fs.departmentCode}</span>
                  <Badge variant="success" size="sm">{fs.version}</Badge>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {fs.programmeName}
                </h3>

                <div className="divide-y divide-slate-100 text-xs pt-1">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-600">Session Tuition</span>
                    <span className="font-semibold text-slate-800 font-sans">{formatNaira(fs.tuitionKobo)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-600">Clinical Hospital Posting</span>
                    <span className="font-semibold text-slate-800 font-sans">{formatNaira(fs.clinicalLevyKobo)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-600">Laboratory Consumables</span>
                    <span className="font-semibold text-slate-800 font-sans">{formatNaira(fs.labBenchKobo)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-600">National Board Exam Levy</span>
                    <span className="font-semibold text-slate-800 font-sans">{formatNaira(fs.boardExamLevyKobo)}</span>
                  </div>
                  <div className="py-2.5 flex justify-between font-bold text-slate-900 bg-slate-50 px-2 rounded-[4px] mt-1">
                    <span>Total Session Levy</span>
                    <span className="text-[#0F7640] font-sans">{formatNaira(fs.totalKobo)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: DEBTORS & INSTALLMENTS ─── */}
      {activeTab === 'debtors' && (
        <Card>
          <Table
            columns={debtorColumns}
            data={filteredDebtors}
            keyExtractor={(d) => d.id}
            isDense={isDense}
            searchValue={debtorSearchQuery}
            onSearchChange={setDebtorSearchQuery}
            searchPlaceholder="Search debtor name, matric, or department..."
            toolbarFilters={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  showToast({
                    type: 'info',
                    title: 'SMS Reminders Queued',
                    message: 'Automated installment reminders dispatched to all 142 overdue student accounts.',
                  });
                }}
                leftIcon={<Send className="w-3.5 h-3.5" />}
                className="whitespace-nowrap"
              >
                Dispatch All Overdue Notices
              </Button>
            }
          />
        </Card>
      )}

      {/* ─── TAB 5: BANK RECONCILIATION ─── */}
      {activeTab === 'reconciliation' && (
        <Card>
          <Table
            columns={reconciliationColumns}
            data={filteredReconciliations}
            keyExtractor={(rec) => rec.id}
            isDense={isDense}
            searchValue={reconcileSearchQuery}
            onSearchChange={setReconcileSearchQuery}
            searchPlaceholder="Search settlement reference or gateway..."
            toolbarFilters={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  showToast({
                    type: 'info',
                    title: 'Reconciliation Statement Export',
                    message: 'Exporting audited bank reconciliation statement for the Bursar.',
                  });
                }}
                leftIcon={<Download className="w-3.5 h-3.5" />}
                className="whitespace-nowrap"
              >
                Export Statement
              </Button>
            }
          />
        </Card>
      )}

      {/* ─── MODAL 1: RECORD STUDENT PAYMENT ─── */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Verified Student Payment"
        size="md"
      >
        <form onSubmit={handlePostPayment} className="space-y-4 text-xs text-slate-800">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Select Student Candidate:</label>
            <Select
              value={matricNumber}
              onChange={(val) => handleSelectStudentForPayment(val)}
              options={registeredStudents.map((s) => ({
                value: s.matric,
                label: `${s.name} (${s.matric}) — ${s.dept}`,
              }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Matriculation No.:</label>
              <input
                type="text"
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-[4px] font-bold text-slate-900"
                readOnly
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Student Name:</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-[4px] font-semibold text-slate-900"
                readOnly
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-900 block">Amount Paid (NGN ₦):</label>
            <input
              type="number"
              value={amountNaira}
              onChange={(e) => setAmountNaira(e.target.value)}
              className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-[4px] font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
              placeholder="e.g. 55000"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Fee Category:</label>
              <Select
                value={category}
                onChange={(v) => setCategory(v as FeeCategory)}
                options={[
                  { value: 'tuition', label: 'Tuition Fee' },
                  { value: 'clinical_posting', label: 'Clinical Posting Levy' },
                  { value: 'acceptance', label: 'Acceptance Fee' },
                  { value: 'exam', label: 'Board Examination Levy' },
                  { value: 'hostel', label: 'Hostel Accommodation' },
                  { value: 'uniform_kit', label: 'Uniform & Clinical Kit' },
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Payment Gateway Channel:</label>
              <Select
                value={paymentMethod}
                onChange={(v) => setPaymentMethod(v as PaymentMethod)}
                options={[
                  { value: 'paystack', label: 'Paystack (Card / USSD)' },
                  { value: 'remita', label: 'Remita (RRR Transfer)' },
                  { value: 'flutterwave', label: 'Flutterwave' },
                  { value: 'bank_transfer_direct', label: 'Direct Bank Settlement' },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
              Confirm & Post to Ledger
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 2: OFFICIAL COLLEGE RECEIPT VIEWER ─── */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title="Official Bursary Payment Receipt"
          size="lg"
        >
          <div className="space-y-6 text-xs text-slate-800">
            <div className="border border-slate-200 p-6 rounded-[4px] bg-white relative">
              {/* College Header */}
              <div className="text-center pb-4 border-b border-slate-200">
                <div className="w-12 h-12 mx-auto mb-2 rounded-[4px] bg-[#0F7640] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  BCHT
                </div>
                <h2 className="text-base font-bold text-slate-900 tracking-wide uppercase">
                  Bethsaida College of Health Technology
                </h2>
                <p className="text-[11px] text-slate-500">
                  Approved by Federal Ministry of Health • Moniya, Ibadan, Oyo State, Nigeria
                </p>
                <div className="mt-2 inline-block px-3 py-1 bg-emerald-50 rounded-[4px] text-xs font-bold text-[#0F7640] border border-emerald-200 uppercase">
                  OFFICIAL RECEIPT NO: {selectedReceipt.receiptNumber}
                </div>
              </div>

              {/* Receipt Details */}
              <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Trainee Paid By</span>
                  <span className="font-bold text-slate-900 text-sm block">{selectedReceipt.studentName}</span>
                  <span className="text-slate-600 font-medium block">{selectedReceipt.matricNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date & Channel</span>
                  <span className="font-semibold text-slate-800 block">
                    {selectedReceipt.paidAt ? selectedReceipt.paidAt.replace('T', ' ').slice(0, 16) : '2026-11-13 14:20'}
                  </span>
                  <span className="text-emerald-700 font-bold text-[11px] block uppercase">
                    Channel: {selectedReceipt.paymentMethod?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="py-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                      <th className="py-2 px-2">Line Item Description</th>
                      <th className="py-2 px-2">Category</th>
                      <th className="py-2 px-2 text-right">Amount Settled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 px-2 font-medium text-slate-800">
                        {selectedReceipt.description || 'Harmattan 2026/2027 Academic Session Fee Settlement'}
                      </td>
                      <td className="py-2.5 px-2 capitalize text-slate-600">
                        {selectedReceipt.category ? selectedReceipt.category.replace('_', ' ') : 'Tuition'}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-[#13A348] text-sm font-sans">
                        {selectedReceipt.formattedAmount || formatNaira(selectedReceipt.amountKobo || 5500000)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Security Proof & Signatures */}
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="w-10 h-10 text-slate-800 p-1 border border-slate-300 rounded-[4px] bg-white shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900 text-[11px] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#13A348]" /> Cryptographically Verified
                    </p>
                    <p className="text-[10px] text-slate-500 font-sans">
                      Ref: {selectedReceipt.gatewayReference || 'PSTK-BCHT-8890214'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Bursary Signature</span>
                  <div className="w-24 border-b border-slate-700 ml-auto my-0.5"></div>
                  <span className="font-bold text-slate-800 text-xs block">College Bursar</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setSelectedReceipt(null)}>
                Close
              </Button>
              <Button
                onClick={() => window.print()}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
              >
                Print Official Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

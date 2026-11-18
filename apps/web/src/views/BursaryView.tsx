import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { useSharedRecords } from '../lib/sharedRecords.ts';
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
  Edit2,
  Trash2,
} from 'lucide-react';
import { formatNaira, nairaToKobo, FeeCategory, PaymentMethod } from '@campusone/contracts';
import { exportToCsv, printInstitutionalDocument } from '../utils/documentExport.ts';
import { PersonAvatar, pluralize } from '../components/common/PersonAvatar.tsx';

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
  sessionSchedule: string;
  tuitionKobo: number;
  clinicalLevyKobo: number;
  labBenchKobo: number;
  boardExamLevyKobo: number;
  developmentKobo: number;
  totalKobo: number;
}

export const BursaryView: React.FC = () => {
  const { session, persona, ledgerEntries, receipts, addLedgerPayment, isDense, recordAudit, schoolProfile, departments } = useApp();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tab: routeTab } = useParams<{ tab: string }>();

  // Role Scope Enforcer: Students & Sponsors only view their own records
  const isStudent = session.activeRole === 'STU' || session.activeRole === 'SPON';
  const userMatric = persona?.matricNumber || 'CHE/2026/0014';

  // Tab synchronization
  const resolveTab = (tabStr?: string | null): BursaryTab => {
    if (isStudent) {
      if (tabStr === 'receipts') return 'receipts';
      return 'ledger';
    }
    if (tabStr && ['ledger', 'receipts', 'structure', 'debtors', 'reconciliation'].includes(tabStr)) {
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
  const [isOnlinePayModalOpen, setIsOnlinePayModalOpen] = useState(false);
  const [onlinePaymentAmount, setOnlinePaymentAmount] = useState('25000');
  const [onlinePaymentCategory, setOnlinePaymentCategory] = useState<FeeCategory>('tuition');
  const [onlinePaymentGateway, setOnlinePaymentGateway] = useState<'paystack' | 'remita'>('paystack');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
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
  const [debtors, setDebtors] = useSharedRecords<DebtorRecord>('bursary.debtors', [
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

  /* ─── DATA: FEE STRUCTURES (Managed State) ─── */
  const initialFeeStructures: FeeStructureItem[] = [
    {
      id: 'fs-01',
      programmeName: 'Community Health Extension Worker (CHEW)',
      departmentCode: 'CHE',
      sessionSchedule: '2026/2027 Approved Schedule',
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
      sessionSchedule: '2026/2027 Approved Schedule',
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
      sessionSchedule: '2026/2027 Approved Schedule',
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
      sessionSchedule: '2026/2027 Approved Schedule',
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
      sessionSchedule: '2026/2027 Approved Schedule',
      tuitionKobo: 10500000,
      clinicalLevyKobo: 3000000,
      labBenchKobo: 1500000,
      boardExamLevyKobo: 3500000,
      developmentKobo: 0,
      totalKobo: 18500000,
    },
  ];

  const [feeStructures, setFeeStructuresState] = useSharedRecords<FeeStructureItem>('bursary.fees', initialFeeStructures);

  const setFeeStructures = (updater: (prev: FeeStructureItem[]) => FeeStructureItem[]) => {
    setFeeStructuresState(updater);
  };

  const [isAddFeeOpen, setIsAddFeeOpen] = useState(false);
  const [isEditFeeOpen, setIsEditFeeOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeStructureItem | null>(null);
  const [isDeleteFeeOpen, setIsDeleteFeeOpen] = useState(false);
  const [deleteFeeTarget, setDeleteFeeTarget] = useState<FeeStructureItem | null>(null);

  const [newFeeForm, setNewFeeForm] = useState({
    programmeName: '',
    departmentCode: 'CHE',
    tuitionNaira: '120000',
    clinicalLevyNaira: '35000',
    labBenchNaira: '20000',
    boardExamLevyNaira: '45000',
  });

  const handleAddFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeeForm.programmeName) {
      showToast({
        type: 'danger',
        title: 'Missing Programme Name',
        message: 'Please provide programme name.',
      });
      return;
    }

    const tKobo = (parseInt(newFeeForm.tuitionNaira, 10) || 0) * 100;
    const cKobo = (parseInt(newFeeForm.clinicalLevyNaira, 10) || 0) * 100;
    const lKobo = (parseInt(newFeeForm.labBenchNaira, 10) || 0) * 100;
    const bKobo = (parseInt(newFeeForm.boardExamLevyNaira, 10) || 0) * 100;
    const newFs: FeeStructureItem = {
      id: `fs-${Date.now().toString().slice(-4)}`,
      programmeName: newFeeForm.programmeName,
      departmentCode: newFeeForm.departmentCode,
      sessionSchedule: `${schoolProfile?.activeSession || '2026/2027'} Approved Schedule`,
      tuitionKobo: tKobo,
      clinicalLevyKobo: cKobo,
      labBenchKobo: lKobo,
      boardExamLevyKobo: bKobo,
      developmentKobo: 0,
      totalKobo: tKobo + cKobo + lKobo + bKobo,
    };

    setFeeStructures((prev) => [newFs, ...prev]);
    setIsAddFeeOpen(false);
    showToast({
      type: 'success',
      title: 'Fee Schedule Added',
      message: `${newFs.programmeName} fee schedule registered.`,
    });
  };

  const handleUpdateFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFee) return;
    const total =
      editingFee.tuitionKobo +
      editingFee.clinicalLevyKobo +
      editingFee.labBenchKobo +
      editingFee.boardExamLevyKobo +
      (editingFee.developmentKobo || 0);
    const updated = { ...editingFee, totalKobo: total };
    setFeeStructures((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    setIsEditFeeOpen(false);
    showToast({
      type: 'success',
      title: 'Fee Schedule Updated',
      message: `${updated.programmeName} schedule saved.`,
    });
  };

  const handleDeleteFeeSubmit = () => {
    if (!deleteFeeTarget) return;
    setFeeStructures((prev) => prev.filter((f) => f.id !== deleteFeeTarget.id));
    setIsDeleteFeeOpen(false);
    showToast({
      type: 'success',
      title: 'Schedule Removed',
      message: `${deleteFeeTarget.programmeName} schedule deleted.`,
    });
    setDeleteFeeTarget(null);
  };

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
    const amountKobo = nairaToKobo(Number(String(amountNaira).replace(/,/g, '')));
    if (!amountKobo || amountKobo <= 0) {
      showToast({ type: 'danger', title: 'Invalid Amount', message: 'Amount must be greater than zero.' });
      return;
    }

    const selectedStudent = registeredStudents.find((item) => item.id === studentId);
    const receipt = addLedgerPayment({
      studentId,
      matricNumber,
      studentName,
      amountKobo,
      category,
      description: `${paymentMethod.toUpperCase()} Direct Settlement — ${category.replace('_', ' ').toUpperCase()}`,
      paymentMethod,
      programme: selectedStudent ? `${selectedStudent.dept} programme` : persona?.department,
      level: persona?.title,
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
      message: `Official Receipt #${receipt.receiptNumber} generated and credited to student account.`,
    });
    setSelectedReceipt(receipt);
  };

  const loadPaystackScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).PaystackPop) {
        resolve(true);
        return;
      }
      const existing = document.querySelector('script[src*="paystack"]');
      if (existing) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleOnlinePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountKobo = nairaToKobo(Number(String(onlinePaymentAmount || '0').replace(/,/g, '')));
    if (!amountKobo || amountKobo <= 0) {
      showToast({
        type: 'danger',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount in Naira.',
      });
      return;
    }

    const payer = registeredStudents.find((item) => item.matric === userMatric);
    const payerId = payer?.id || `stu-${userMatric.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
    const payerName = persona?.fullName || payer?.name || 'Student';

    if (onlinePaymentGateway !== 'paystack') {
      showToast({
        type: 'danger',
        title: 'Gateway Not Connected',
        message: 'Remita checkout is not configured. A receipt is issued only after the bank confirms the payment.',
      });
      return;
    }

    const { data: gateway } = await supabase
      .from('integration_settings')
      .select('public_key, is_enabled')
      .eq('gateway_type', 'payment_paystack')
      .maybeSingle();
    const paystackKey = gateway?.is_enabled ? gateway.public_key || '' : '';
    if (!paystackKey) {
      showToast({
        type: 'danger',
        title: 'Paystack Key Missing',
        message: 'Save the Paystack public key in Administration before students can pay online.',
      });
      return;
    }

    setIsProcessingPayment(true);
    loadPaystackScript().then((loaded) => {
      if (!loaded || !(window as any).PaystackPop) {
        setIsProcessingPayment(false);
        showToast({
          type: 'danger',
          title: 'Checkout Unavailable',
          message: 'Paystack could not be loaded. No amount was charged and no receipt was issued.',
        });
        return;
      }

      try {
        const handler = (window as any).PaystackPop.setup({
          key: paystackKey,
          email: persona?.email || 'info@becohtech.edu.ng',
          amount: amountKobo,
          currency: 'NGN',
          ref: `BCHT_PAY_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          metadata: {
            custom_fields: [
              {
                display_name: 'Student Name',
                variable_name: 'student_name',
                value: payerName,
              },
              {
                display_name: 'Matriculation No',
                variable_name: 'matric_no',
                value: userMatric,
              },
              {
                display_name: 'Fee Category',
                variable_name: 'category',
                value: onlinePaymentCategory,
              },
            ],
          },
          callback: (response: any) => {
            const ref = response.reference || response.trxref;
            if (!ref) {
              setIsProcessingPayment(false);
              showToast({
                type: 'danger',
                title: 'Payment Unconfirmed',
                message: 'Paystack returned no transaction reference. The fee payment was not credited.',
              });
              return;
            }
            const receipt = addLedgerPayment({
              studentId: payerId,
              matricNumber: userMatric,
              studentName: payerName,
              amountKobo,
              category: onlinePaymentCategory,
              description: `Paystack Verified Payment (${onlinePaymentCategory.toUpperCase()}) — Ref: ${ref}`,
              paymentMethod: 'paystack',
              referenceId: ref,
              gatewayReference: ref,
              programme: persona?.department || (payer ? `${payer.dept} programme` : undefined),
              level: persona?.title,
            });

            recordAudit('ONLINE_PAYMENT_SUCCESS', 'BURSARY_PAYSTACK', userMatric, {
              gateway: 'paystack',
              amountKobo,
              reference: ref,
              receiptNo: receipt.receiptNumber,
            });

            setIsProcessingPayment(false);
            setIsOnlinePayModalOpen(false);
            showToast({
              type: 'success',
              title: 'Paystack Payment Confirmed',
              message: `Official Receipt #${receipt.receiptNumber} generated. Reference: ${ref}`,
            });
            setSelectedReceipt(receipt);
          },
          onClose: () => {
            setIsProcessingPayment(false);
            showToast({
              type: 'info',
              title: 'Payment Cancelled',
              message: 'Paystack transaction was closed before completion. No receipt was issued.',
            });
          },
        });

        handler.openIframe();
      } catch (err) {
        console.warn('[CampusOne] Paystack inline checkout initiation note:', err);
        setIsProcessingPayment(false);
        showToast({
          type: 'danger',
          title: 'Checkout Failed',
          message: 'Paystack could not open. No amount was charged and no receipt was issued.',
        });
      }
    });
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
      message: `Overdue notice recorded for ${debtor.studentName} (${debtor.matricNumber}). Send it through the college SMS gateway when that channel is connected.`,
    });
  };

  /* ─── DERIVED FILTERED LISTS (Scoped by Role & User Tenancy) ─── */
  const scopedLedgerEntries = isStudent
    ? ledgerEntries.filter((l) => l.matricNumber === userMatric)
    : ledgerEntries;

  const scopedReceipts = isStudent
    ? receipts.filter((r) => r.matricNumber === userMatric)
    : receipts;

  const filteredLedgerEntries = scopedLedgerEntries.filter((l) => {
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

  const filteredReceipts = scopedReceipts.filter((r) => {
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
        <div className="flex items-center gap-2.5">
          <PersonAvatar name={r.studentName} code={r.matricNumber} size="sm" />
          <div>
            <span className="font-semibold text-slate-900 block">{r.studentName}</span>
            <span className="text-[11px] text-slate-500">{r.matricNumber}</span>
          </div>
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
        <div className="flex items-center gap-2.5">
          <PersonAvatar name={d.studentName} code={d.matricNumber} size="sm" />
          <div>
            <span className="font-semibold text-slate-900 block">{d.studentName}</span>
            <span className="text-[11px] text-slate-500">{d.departmentName} • {d.level}</span>
          </div>
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
        <span className="font-semibold text-slate-800">{pluralize(rec.transactionsCount, 'Settlement')}</span>
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
      {/* ─── Page Header (Role-Scoped) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-sans">
            {isStudent ? 'My Tuition & Fee Account' : 'School Fees & Bursary'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            {isStudent
              ? 'Personal tuition account balance, payment history, official digital receipts, and online settlement.'
              : 'Student fee accounts, double-entry financial ledger, official receipts, fee schedules, and debtor management.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isStudent && (
            <Button
              size="sm"
              onClick={() => setIsPaymentModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
            >
              Record Student Payment
            </Button>
          )}
          {isStudent && (
            <Button
              size="sm"
              onClick={() => setIsOnlinePayModalOpen(true)}
              leftIcon={<CreditCard className="w-3.5 h-3.5" />}
              className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
            >
              Pay Fees Online
            </Button>
          )}
        </div>
      </div>

      {/* ─── Bursary Stat Cards (Spacious, No Squeezing) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              {isStudent ? 'Assessed Tuition' : 'Total Revenue'}
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#13A348] flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {isStudent ? '₦140,000' : '₦84.25M'}
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">{isStudent ? '2026/2027 Session' : '74.0% recovery'}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">{isStudent ? 'Standard Tariff' : 'Target ₦114M'}</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              {isStudent ? 'Outstanding Balance' : 'Overdue Receivables'}
            </span>
            <div className={`w-8 h-8 rounded-[4px] flex items-center justify-center shrink-0 ${isStudent ? 'bg-emerald-50 text-[#13A348]' : 'bg-rose-50 text-[#F83A20]'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold font-sans tracking-tight ${isStudent ? 'text-[#13A348]' : 'text-[#F83A20]'}`}>
              {isStudent ? '₦0.00' : '₦18.40M'}
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className={`font-semibold ${isStudent ? 'text-[#13A348]' : 'text-[#F83A20]'}`}>
                {isStudent ? 'Zero Debt' : '142 debtors'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">{isStudent ? 'No liabilities' : 'Overdue plans'}</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              {isStudent ? 'Total Remitted' : 'Settlements Reconciled'}
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {isStudent ? '₦140,000' : '384'}
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">{isStudent ? '100% Paid' : '100% matched'}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">{isStudent ? 'Remita Confirmed' : 'Zero discrepancy'}</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-[4px] flex flex-col justify-between h-full min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Exam Fee Clearance
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-emerald-50 text-[#0F7640] flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
              {isStudent ? 'CLEARED' : '88.6%'}
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[#13A348] font-semibold">{isStudent ? 'Docket Valid' : 'Trainees cleared'}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">{isStudent ? 'Gate Pass Issued' : 'Gate Pass active'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs (Filtered by Persona Role) ─── */}
      <Tabs
        tabs={
          isStudent
            ? [
                { id: 'ledger', label: 'My Tuition Account' },
                { id: 'receipts', label: 'My Payment Receipts' },
              ]
            : [
                { id: 'ledger', label: 'Student Master Ledger' },
                { id: 'receipts', label: 'Payment Receipts' },
                { id: 'structure', label: 'Fee Schedules & Levies' },
                { id: 'debtors', label: 'Debtors & Installments' },
                { id: 'reconciliation', label: 'Bank Reconciliation' },
              ]
        }
        activeTab={activeTab}
        onChange={(id: any) => handleTabChange(id)}
      />

      {/* ─── TAB 1: STUDENT MASTER LEDGER / PERSONAL TUITION ACCOUNT ─── */}
      {activeTab === 'ledger' && (
        <Card>
          <Table
            columns={isStudent ? ledgerColumns.filter((c) => c.key !== 'matricNumber') : ledgerColumns}
            data={filteredLedgerEntries}
            keyExtractor={(l) => l.id}
            isDense={isDense}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={isStudent ? "Search transaction description..." : "Search matriculation or description..."}
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
            columns={isStudent ? receiptColumns.filter((c) => c.key !== 'studentName') : receiptColumns}
            data={filteredReceipts}
            keyExtractor={(r) => r.receiptNumber}
            isDense={isDense}
            searchValue={receiptSearchQuery}
            onSearchChange={setReceiptSearchQuery}
            searchPlaceholder={isStudent ? "Search receipt number or date..." : "Search receipt number, student, or matric..."}
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
      {!isStudent && activeTab === 'structure' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-[4px] text-xs text-slate-700">
            <span>
              <strong>Academic Session Fees:</strong> Official approved fees and levies for {schoolProfile?.activeSession || '2026/2027'}.
            </span>
            <Button
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setNewFeeForm({
                  programmeName: '',
                  departmentCode: 'CHE',
                  tuitionNaira: '120000',
                  clinicalLevyNaira: '35000',
                  labBenchNaira: '20000',
                  boardExamLevyNaira: '45000',
                });
                setIsAddFeeOpen(true);
              }}
              className="bg-[#0F7640] hover:bg-[#093322]"
            >
              Add Fee Schedule
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feeStructures.map((fs) => (
              <Card key={fs.id} className="p-4 bg-white border border-slate-200 rounded-[4px] space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0F7640] text-xs uppercase">{fs.departmentCode}</span>
                    <Badge variant="success" size="sm">Active Schedule</Badge>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug mt-2">
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
                      <span className="text-slate-600">Board Examination Levy</span>
                      <span className="font-semibold text-slate-800 font-sans">{formatNaira(fs.boardExamLevyKobo)}</span>
                    </div>
                    <div className="py-2.5 flex justify-between font-bold text-slate-900 bg-slate-50 px-2 rounded-[4px] mt-1">
                      <span>Total Session Fee</span>
                      <span className="text-[#0F7640] font-sans">{formatNaira(fs.totalKobo)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<Edit2 className="w-3 h-3" />}
                    onClick={() => {
                      setEditingFee({ ...fs });
                      setIsEditFeeOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setDeleteFeeTarget(fs);
                      setIsDeleteFeeOpen(true);
                    }}
                    title="Delete Fee Schedule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: DEBTORS & INSTALLMENTS ─── */}
      {!isStudent && activeTab === 'debtors' && (
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
      {!isStudent && activeTab === 'reconciliation' && (
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
                  exportToCsv({
                    filename: `BCHT_Bank_Reconciliation_Statement_${new Date().toISOString().slice(0, 10)}.csv`,
                    columns: [
                      { key: 'date', header: 'Settlement Date' },
                      { key: 'gatewayReference', header: 'Settlement Reference' },
                      { key: 'gateway', header: 'Payment Gateway' },
                      { key: 'transactionsCount', header: 'Transactions Count' },
                      { key: 'grossAmountKobo', header: 'Gross Amount', format: (v) => formatNaira(Number(v)) },
                      {
                        key: 'fee',
                        header: 'Gateway Charges',
                        format: (_, r) => formatNaira(Math.max(0, Number(r.grossAmountKobo) - Number(r.netSettledKobo))),
                      },
                      { key: 'netSettledKobo', header: 'Net Bank Credit', format: (v) => formatNaira(Number(v)) },
                      { key: 'status', header: 'Reconciliation Status' },
                    ],
                    data: filteredReconciliations,
                  });
                  showToast({
                    type: 'success',
                    title: 'Reconciliation Statement Exported',
                    message: `Exported ${filteredReconciliations.length} bank settlement batches to CSV.`,
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

      {/* ─── MODAL 1: RECORD STUDENT PAYMENT (Accounts / Staff Only) ─── */}
      {!isStudent && (
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      )}

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
                <img
                  src={schoolProfile?.logoUrl || '/BeonTech-Logo.png'}
                  alt="College Crest"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/BeonTech-Logo.png';
                  }}
                  className="w-14 h-14 mx-auto mb-2 rounded-[4px] object-contain shadow-xs"
                />
                <h2 className="text-base font-bold text-slate-900 tracking-wide uppercase">
                  {schoolProfile?.institutionName || 'Bethsaida College of Health Technology'}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {schoolProfile?.campusAddress || 'Ikolaba Aladan layout, off Ayegun Yemetu Road, along CAC grammar school, Ogbomoso, Oyo State'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Email: {schoolProfile?.officialEmail || 'info@becohtech.edu.ng'} &bull; Tel: {schoolProfile?.officialPhone || '+234 907 578 9045'} &bull; Web: {schoolProfile?.websiteUrl || 'www.becohtech.edu.ng'}
                </p>
                <p className="text-[10px] font-bold text-[#0F7640] uppercase tracking-wider mt-1">
                  Bursary &amp; Treasury Directorate &bull; Official Payment Receipt
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
                        {selectedReceipt.description || `${schoolProfile?.activeSemester || 'Harmattan'} ${schoolProfile?.activeSession || '2026/2027'} Fee Settlement`}
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
                      <ShieldCheck className="w-3.5 h-3.5 text-[#13A348]" /> Officially Verified Receipt
                    </p>
                    <p className="text-[10px] text-slate-500 font-sans">
                      Ref: {selectedReceipt.gatewayReference || `PSTK-${schoolProfile?.institutionAcronym || 'BCHT'}-8890214`}
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
                onClick={() => {
                  if (!selectedReceipt) return;
                  const amountFormatted =
                    selectedReceipt.formattedAmount || formatNaira(selectedReceipt.amountKobo || 5500000);
                  const categoryLabel = selectedReceipt.category
                    ? selectedReceipt.category.replace('_', ' ').toUpperCase()
                    : 'TUITION FEE';
                  const paidDate = selectedReceipt.paidAt
                    ? selectedReceipt.paidAt.replace('T', ' ').slice(0, 16)
                    : '2026-11-13 14:20';
                  const gatewayRef =
                    selectedReceipt.gatewayReference ||
                    `PSTK-${schoolProfile?.institutionAcronym || 'BCHT'}-8890214`;
                  printInstitutionalDocument({
                    title: `Official Payment Receipt — ${selectedReceipt.receiptNumber}`,
                    badgeText: `OFFICIAL BURSARY RECEIPT NO: ${selectedReceipt.receiptNumber}`,
                    referenceNo: gatewayRef,
                    issuedDate: paidDate,
                    schoolProfile,
                    officeSubtitle: 'Bursary & Treasury Directorate • Double-Entry Verified Receipt',
                    metaItems: [
                      { label: 'Trainee Paid By', value: selectedReceipt.studentName, highlight: true },
                      { label: 'Matriculation Number', value: selectedReceipt.matricNumber, highlight: true },
                      { label: 'Programme & Level', value: `${selectedReceipt.programme || 'Health Technology'} (${selectedReceipt.level || '100 Level'})` },
                      { label: 'Payment Channel', value: (selectedReceipt.paymentMethod || 'PAYSTACK').replace('_', ' ').toUpperCase() },
                      { label: 'Gateway Reference', value: gatewayRef },
                      { label: 'Amount Settled', value: amountFormatted, highlight: true },
                    ],
                    tableColumns: [
                      { key: 'sn', header: 'S/N', align: 'center' },
                      { key: 'description', header: 'Line Item Description', bold: true },
                      { key: 'category', header: 'Fee Category', align: 'center' },
                      { key: 'amount', header: 'Amount Settled', align: 'right', highlight: true },
                    ],
                    tableData: [
                      {
                        sn: 1,
                        description:
                          selectedReceipt.description ||
                          `${schoolProfile?.activeSemester || 'Harmattan'} ${schoolProfile?.activeSession || '2026/2027'} Statutory Fee Settlement`,
                        category: categoryLabel,
                        amount: amountFormatted,
                      },
                    ],
                    summaryNoteHtml: `
                      <strong>Verification &amp; Audit Notice:</strong> This receipt is cryptographically signed and registered in the College bursary system.
                      Verification Hash: <strong>${selectedReceipt.qrVerificationHash || gatewayRef}</strong> &bull; Issuer: ${selectedReceipt.issuer || 'Bursary Department'}.
                    `,
                    stampText: 'OFFICIALLY PAID & CLEARED',
                    signatures: [
                      { title: 'Student / Payer Signature', subtitle: selectedReceipt.studentName },
                      { title: 'College Bursar', subtitle: schoolProfile?.institutionName || 'Bethsaida College of Health Tech' },
                    ],
                  });
                }}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                className="whitespace-nowrap bg-[#0F7640] hover:bg-[#093322]"
              >
                Print Official Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {/* ─── MODAL 3: STUDENT ONLINE FEE PAYMENT CHECKOUT ─── */}
      {isStudent && (
        <Modal
          isOpen={isOnlinePayModalOpen}
          onClose={() => setIsOnlinePayModalOpen(false)}
          title="Online Fee Payment Checkout"
          description="Settle your college tuition and statutory levies securely via Paystack or Remita."
          size="md"
        >
          <form onSubmit={handleOnlinePaymentSubmit} className="space-y-4 text-xs text-slate-800">
            {/* Trainee Identification Box */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Trainee Name:</span>
                <span className="font-bold text-slate-900">{persona?.fullName || 'Blessing Adeyemi'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Matriculation No.:</span>
                <span className="font-bold text-[#0F7640] font-sans">{userMatric}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Department:</span>
                <span className="text-slate-700">{persona?.department || 'Community Health Extension (CHEW)'}</span>
              </div>
            </div>

            {/* Fee Category */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Payment Category:</label>
              <Select
                value={onlinePaymentCategory}
                onChange={(v) => setOnlinePaymentCategory(v as FeeCategory)}
                options={[
                  { value: 'tuition', label: 'Semester Tuition Fee' },
                  { value: 'clinical_posting', label: 'Clinical Posting Levy' },
                  { value: 'acceptance', label: 'Acceptance Fee' },
                  { value: 'exam', label: 'Board Examination Levy' },
                  { value: 'hostel', label: 'Hostel Accommodation' },
                  { value: 'uniform_kit', label: 'Clinical Uniform & Practical Kit' },
                ]}
              />
            </div>

            {/* Payment Amount */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Amount to Remit (NGN ₦):</label>
              <input
                type="number"
                value={onlinePaymentAmount}
                onChange={(e) => setOnlinePaymentAmount(e.target.value)}
                className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-[4px] font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
                placeholder="e.g. 25000"
                required
              />
            </div>

            {/* Gateway Segmented Toggle (Zero Native Radios) */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Select Payment Channel:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOnlinePaymentGateway('paystack')}
                  className={`p-3 rounded-[4px] border text-left transition-colors ${
                    onlinePaymentGateway === 'paystack'
                      ? 'bg-emerald-50/70 border-[#0F7640] text-slate-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">Paystack Gateway</span>
                    <Badge variant={onlinePaymentGateway === 'paystack' ? 'success' : 'neutral'} size="sm">
                      INSTANT
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Debit Card (Mastercard / Visa / Verve), USSD, or Bank Transfer
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setOnlinePaymentGateway('remita')}
                  className={`p-3 rounded-[4px] border text-left transition-colors ${
                    onlinePaymentGateway === 'remita'
                      ? 'bg-emerald-50/70 border-[#0F7640] text-slate-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">Remita Central RRR</span>
                    <Badge variant={onlinePaymentGateway === 'remita' ? 'success' : 'neutral'} size="sm">
                      TSA BILLING
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Generate RRR code for commercial bank branch deposit or Internet banking
                  </p>
                </button>
              </div>
            </div>

            {/* Confirmation Banner */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[4px] text-xs space-y-1">
              <div className="font-bold text-[#0F7640] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Instant Automated Clearance
              </div>
              <p className="text-slate-600">
                Payment is credited to your student fee record immediately. An official numbered receipt is
                generated with an encrypted QR code for examination docket clearance.
              </p>
              <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] font-semibold text-slate-700">
                <span>Total Payment:</span>
                <span className="text-sm font-extrabold text-[#0F7640] font-sans">
                  {formatNaira(nairaToKobo(Number(String(onlinePaymentAmount || '0').replace(/,/g, '')) || 0))}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsOnlinePayModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isProcessingPayment}
                className="bg-[#0F7640] hover:bg-[#093322]"
              >
                Pay {formatNaira(nairaToKobo(Number(String(onlinePaymentAmount || '0').replace(/,/g, '')) || 0))} Now
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {/* ─── MODAL 4: ADD FEE SCHEDULE ─── */}
      {!isStudent && (
        <Modal
          isOpen={isAddFeeOpen}
          onClose={() => setIsAddFeeOpen(false)}
          title="Add Fee Schedule"
          description="Establish standard session fee structure for a programme."
          size="md"
        >
          <form onSubmit={handleAddFeeSubmit} className="space-y-3.5 text-xs">
            <Input
              label="Programme Name"
              placeholder="e.g. Dental Health Technology"
              value={newFeeForm.programmeName}
              onChange={(e) => setNewFeeForm({ ...newFeeForm, programmeName: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Department"
                options={departments.map((d) => ({ value: d.code, label: d.name }))}
                value={newFeeForm.departmentCode}
                onChange={(val) => setNewFeeForm({ ...newFeeForm, departmentCode: val })}
              />
              <Input
                label="Tuition Fee (₦)"
                type="number"
                value={newFeeForm.tuitionNaira}
                onChange={(e) => setNewFeeForm({ ...newFeeForm, tuitionNaira: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Clinical Levy (₦)"
                type="number"
                value={newFeeForm.clinicalLevyNaira}
                onChange={(e) => setNewFeeForm({ ...newFeeForm, clinicalLevyNaira: e.target.value })}
              />
              <Input
                label="Lab Bench Levy (₦)"
                type="number"
                value={newFeeForm.labBenchNaira}
                onChange={(e) => setNewFeeForm({ ...newFeeForm, labBenchNaira: e.target.value })}
              />
              <Input
                label="Board Exam Levy (₦)"
                type="number"
                value={newFeeForm.boardExamLevyNaira}
                onChange={(e) => setNewFeeForm({ ...newFeeForm, boardExamLevyNaira: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddFeeOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
                Save Schedule
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL 5: EDIT FEE SCHEDULE ─── */}
      {!isStudent && editingFee && (
        <Modal
          isOpen={isEditFeeOpen}
          onClose={() => setIsEditFeeOpen(false)}
          title={`Edit ${editingFee.programmeName} Schedule`}
          size="md"
        >
          <form onSubmit={handleUpdateFeeSubmit} className="space-y-3.5 text-xs">
            <Input
              label="Programme Name"
              value={editingFee.programmeName}
              onChange={(e) => setEditingFee({ ...editingFee, programmeName: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Session Tuition (₦)"
                type="number"
                value={String(Math.round(editingFee.tuitionKobo / 100))}
                onChange={(e) => setEditingFee({ ...editingFee, tuitionKobo: (parseInt(e.target.value, 10) || 0) * 100 })}
                required
              />
              <Input
                label="Clinical Levy (₦)"
                type="number"
                value={String(Math.round(editingFee.clinicalLevyKobo / 100))}
                onChange={(e) => setEditingFee({ ...editingFee, clinicalLevyKobo: (parseInt(e.target.value, 10) || 0) * 100 })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Laboratory Consumables (₦)"
                type="number"
                value={String(Math.round(editingFee.labBenchKobo / 100))}
                onChange={(e) => setEditingFee({ ...editingFee, labBenchKobo: (parseInt(e.target.value, 10) || 0) * 100 })}
              />
              <Input
                label="Board Exam Levy (₦)"
                type="number"
                value={String(Math.round(editingFee.boardExamLevyKobo / 100))}
                onChange={(e) => setEditingFee({ ...editingFee, boardExamLevyKobo: (parseInt(e.target.value, 10) || 0) * 100 })}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" size="sm" type="button" onClick={() => setIsEditFeeOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" className="bg-[#0F7640] hover:bg-[#093322]">
                Update Schedule
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL 6: DELETE FEE SCHEDULE CONFIRMATION ─── */}
      {!isStudent && deleteFeeTarget && (
        <Modal
          isOpen={isDeleteFeeOpen}
          onClose={() => setIsDeleteFeeOpen(false)}
          title="Delete Fee Schedule"
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-700 leading-relaxed">
              Are you sure you want to delete the fee schedule for{' '}
              <strong className="text-slate-900">{deleteFeeTarget.programmeName}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" size="sm" onClick={() => setIsDeleteFeeOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={handleDeleteFeeSubmit}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

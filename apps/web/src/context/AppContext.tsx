import React, { createContext, useContext, useState, useEffect } from 'react';
import type { RoleCode, UserSession } from '@campusone/contracts';
import {
  StudentLedgerEntry,
  OfficialReceipt,
  AuditEventRecord,
  formatNaira,
} from '@campusone/contracts';

export interface AppContextType {
  session: UserSession;
  switchRole: (role: RoleCode) => void;
  isDense: boolean;
  toggleDense: () => void;
  ledgerEntries: StudentLedgerEntry[];
  addLedgerPayment: (entry: {
    studentId: string;
    matricNumber: string;
    studentName: string;
    amountKobo: number;
    category: any;
    description: string;
    paymentMethod: any;
  }) => OfficialReceipt;
  receipts: OfficialReceipt[];
  auditLogs: AuditEventRecord[];
  recordAudit: (action: string, entityType: string, entityId: string, details?: any) => void;
}

const INITIAL_AUDIT_LOGS: AuditEventRecord[] = [
  {
    id: 'aud-001',
    collegeId: 'bethsaida',
    actorId: 'user-provost',
    actorRole: 'PROVOST',
    action: 'SESSION_CONFIGURATION_APPROVED',
    entityType: 'TENANT_SETTINGS',
    entityId: 'bethsaida:2026/2027',
    beforeSnapshot: null,
    afterSnapshot: { session: '2026/2027', status: 'ACTIVE' },
    ipAddress: '102.89.44.12',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    timestamp: '2026-11-01T08:00:00Z',
    chainHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
  },
  {
    id: 'aud-002',
    collegeId: 'bethsaida',
    actorId: 'user-bursar',
    actorRole: 'BURSAR',
    action: 'FEE_SCHEDULE_VERSION_PUBLISHED',
    entityType: 'FEE_STRUCTURE',
    entityId: 'fee-sched-2026-v1',
    beforeSnapshot: null,
    afterSnapshot: { version: '2026.1', tuitionKobo: 15000000 },
    ipAddress: '102.89.44.18',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    timestamp: '2026-11-02T09:30:00Z',
    chainHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    prevHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
];

const INITIAL_LEDGER_ENTRIES: StudentLedgerEntry[] = [
  {
    id: 'led-001',
    collegeId: 'bethsaida',
    studentId: 'stu-001',
    matricNumber: 'CHE/2026/0014',
    entryType: 'debit',
    category: 'tuition',
    description: 'Harmattan Semester 2026/2027 Tuition Fee (CHEW 200L)',
    amountKobo: 12000000,
    balanceAfterKobo: 12000000,
    referenceId: 'chg-chew-200-t1',
    createdAt: '2026-11-03T08:00:00Z',
  },
  {
    id: 'led-002',
    collegeId: 'bethsaida',
    studentId: 'stu-001',
    matricNumber: 'CHE/2026/0014',
    entryType: 'debit',
    category: 'clinical_posting',
    description: 'Rural Health Clinical Posting Levy (PHC Posting)',
    amountKobo: 3500000,
    balanceAfterKobo: 15500000,
    referenceId: 'chg-chew-cln-01',
    createdAt: '2026-11-03T08:05:00Z',
  },
  {
    id: 'led-003',
    collegeId: 'bethsaida',
    studentId: 'stu-001',
    matricNumber: 'CHE/2026/0014',
    entryType: 'credit',
    category: 'tuition',
    description: 'Paystack Card Settlement — Part Payment Ref: PSTK_91823719',
    amountKobo: 10000000,
    balanceAfterKobo: 5500000,
    referenceId: 'pay-pstk-001',
    createdAt: '2026-11-05T11:20:00Z',
  },
  {
    id: 'led-004',
    collegeId: 'bethsaida',
    studentId: 'stu-002',
    matricNumber: 'MLT/2026/0029',
    entryType: 'debit',
    category: 'tuition',
    description: 'Harmattan Semester 2026/2027 Tuition Fee (MLT 100L)',
    amountKobo: 14000000,
    balanceAfterKobo: 14000000,
    referenceId: 'chg-mlt-100-t1',
    createdAt: '2026-11-03T08:00:00Z',
  },
  {
    id: 'led-005',
    collegeId: 'bethsaida',
    studentId: 'stu-002',
    matricNumber: 'MLT/2026/0029',
    entryType: 'credit',
    category: 'tuition',
    description: 'Remita Bank Branch Transfer Settlement — Ref: RMT_8820192',
    amountKobo: 14000000,
    balanceAfterKobo: 0,
    referenceId: 'pay-rmt-002',
    createdAt: '2026-11-06T14:15:00Z',
  },
];

const INITIAL_RECEIPTS: OfficialReceipt[] = [
  {
    receiptNumber: 'RCP-2026-00104',
    collegeId: 'bethsaida',
    studentId: 'stu-001',
    studentName: 'Blessing Adeyemi',
    matricNumber: 'CHE/2026/0014',
    programme: 'Community Health Extension Worker (CHEW)',
    level: '200 Level',
    category: 'tuition',
    amountKobo: 10000000,
    formattedAmount: formatNaira(10000000),
    paymentMethod: 'paystack',
    transactionReference: 'BTH-TX-2026-9021',
    gatewayReference: 'PSTK_91823719',
    paidAt: '2026-11-05T11:20:00Z',
    qrVerificationHash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    issuer: 'Bursary Department, Bethsaida College',
  },
  {
    receiptNumber: 'RCP-2026-00105',
    collegeId: 'bethsaida',
    studentId: 'stu-002',
    studentName: 'Emmanuel Chukwuma',
    matricNumber: 'MLT/2026/0029',
    programme: 'Medical Laboratory Technician (MLT)',
    level: '100 Level',
    category: 'tuition',
    amountKobo: 14000000,
    formattedAmount: formatNaira(14000000),
    paymentMethod: 'remita',
    transactionReference: 'BTH-TX-2026-9022',
    gatewayReference: 'RMT_8820192',
    paidAt: '2026-11-06T14:15:00Z',
    qrVerificationHash: 'b2c3d4e5f6a17890123456789abcdef0123456789abcdef0123456789abcdef0',
    issuer: 'Bursary Department, Bethsaida College',
  },
];

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<RoleCode>('PROVOST');
  const [isDense, setIsDense] = useState(false);
  const [ledgerEntries, setLedgerEntries] = useState<StudentLedgerEntry[]>(INITIAL_LEDGER_ENTRIES);
  const [receipts, setReceipts] = useState<OfficialReceipt[]>(INITIAL_RECEIPTS);
  const [auditLogs, setAuditLogs] = useState<AuditEventRecord[]>(INITIAL_AUDIT_LOGS);

  const session: UserSession = {
    userId: 'usr-admin-01',
    collegeId: 'bethsaida',
    email: 'provost@bethsaida.edu.ng',
    fullName: 'Dr. Timothy Balogun',
    activeRole,
    roles: [
      { role: 'PROVOST', scope: 'college' },
      { role: 'REG', scope: 'college' },
      { role: 'BURSAR', scope: 'college' },
      { role: 'HOD', scope: 'department', scopeId: 'dept-chew' },
      { role: 'INSTR', scope: 'department', scopeId: 'dept-chew' },
      { role: 'EXAM', scope: 'college' },
      { role: 'CLINSUP', scope: 'site', scopeId: 'site-uch' },
      { role: 'SADMIN', scope: 'college' },
      { role: 'STU', scope: 'self', scopeId: 'stu-001' },
      { role: 'SPON', scope: 'self', scopeId: 'stu-001' },
    ],
    permissions: [
      'adm:read', 'adm:write', 'adm:approve',
      'sis:read', 'sis:write', 'sis:status_change',
      'fin:read', 'fin:write', 'fin:reversal', 'fin:reconciliation',
      'exm:read', 'exm:score_entry', 'exm:approve_hod', 'exm:approve_dean', 'exm:publish', 'exm:amend',
      'att:read', 'att:mark', 'att:override',
      'cln:read', 'cln:allocate', 'cln:assess', 'cln:clearance',
      'lms:read', 'lms:write', 'lms:grade',
      'hrm:read', 'hrm:write', 'hrm:payroll',
      'hst:read', 'hst:allocate',
      'tts:read', 'tts:write',
      'com:read', 'com:broadcast',
      'rpt:read', 'rpt:export', 'rpt:audit',
      'core:admin', 'core:users', 'core:tenant_config',
    ],
  };

  const recordAudit = (action: string, entityType: string, entityId: string, details?: any) => {
    const prev = auditLogs[auditLogs.length - 1];
    const prevHash = prev ? prev.chainHash : '0000000000000000000000000000000000000000000000000000000000000000';
    // Deterministic pseudo-hash for demonstrability
    const chainHash = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

    const newLog: AuditEventRecord = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      collegeId: 'bethsaida',
      actorId: session.userId,
      actorRole: session.activeRole,
      action,
      entityType,
      entityId,
      beforeSnapshot: null,
      afterSnapshot: details || null,
      ipAddress: '102.89.44.12',
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      chainHash,
      prevHash,
    };

    setAuditLogs((prevList) => [newLog, ...prevList]);
  };

  const addLedgerPayment = (entry: {
    studentId: string;
    matricNumber: string;
    studentName: string;
    amountKobo: number;
    category: any;
    description: string;
    paymentMethod: any;
  }): OfficialReceipt => {
    const studentEntries = ledgerEntries.filter((l) => l.studentId === entry.studentId);
    let currentBalanceKobo = 0;
    for (const e of studentEntries) {
      if (e.entryType === 'debit') currentBalanceKobo += e.amountKobo;
      else currentBalanceKobo -= e.amountKobo;
    }
    const balanceAfterKobo = Math.max(0, currentBalanceKobo - entry.amountKobo);
    const receiptNum = `RCP-2026-${String(receipts.length + 101).padStart(5, '0')}`;
    const txRef = `BTH-TX-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const gatewayRef = `PSTK_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const newLedgerEntry: StudentLedgerEntry = {
      id: `led-${Date.now()}`,
      collegeId: 'bethsaida',
      studentId: entry.studentId,
      matricNumber: entry.matricNumber,
      entryType: 'credit',
      category: entry.category,
      description: entry.description,
      amountKobo: entry.amountKobo,
      balanceAfterKobo,
      referenceId: txRef,
      createdAt: new Date().toISOString(),
    };

    const newReceipt: OfficialReceipt = {
      receiptNumber: receiptNum,
      collegeId: 'bethsaida',
      studentId: entry.studentId,
      studentName: entry.studentName,
      matricNumber: entry.matricNumber,
      programme: 'Community Health Extension Worker (CHEW)',
      level: '200 Level',
      category: entry.category,
      amountKobo: entry.amountKobo,
      formattedAmount: formatNaira(entry.amountKobo),
      paymentMethod: entry.paymentMethod,
      transactionReference: txRef,
      gatewayReference: gatewayRef,
      paidAt: new Date().toISOString(),
      qrVerificationHash: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
      issuer: 'Bursary Department, Bethsaida College',
    };

    setLedgerEntries((prev) => [newLedgerEntry, ...prev]);
    setReceipts((prev) => [newReceipt, ...prev]);
    recordAudit('PAYMENT_POSTED', 'FIN_LEDGER', newLedgerEntry.id, {
      matricNumber: entry.matricNumber,
      amountKobo: entry.amountKobo,
      receiptNumber: receiptNum,
    });

    return newReceipt;
  };

  return (
    <AppContext.Provider
      value={{
        session,
        switchRole: (role) => {
          setActiveRole(role);
          recordAudit('ROLE_SWITCHED', 'USER_SESSION', role);
        },
        isDense,
        toggleDense: () => setIsDense(!isDense),
        ledgerEntries,
        addLedgerPayment,
        receipts,
        auditLogs,
        recordAudit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

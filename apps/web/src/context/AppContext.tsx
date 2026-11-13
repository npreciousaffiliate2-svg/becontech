import React, { createContext, useContext, useState, useEffect } from 'react';
import type { RoleCode, UserSession } from '@campusone/contracts';
import {
  StudentLedgerEntry,
  OfficialReceipt,
  AuditEventRecord,
  formatNaira,
} from '@campusone/contracts';
import { PERSONA_PROFILES, PersonaProfile } from './personas.ts';
import { supabase } from '../lib/supabase.ts';

export { PERSONA_PROFILES };
export type { PersonaProfile };

export interface AppContextType {
  session: UserSession;
  persona: PersonaProfile;
  switchRole: (role: RoleCode) => void;
  updateProfile?: (updates: {
    fullName?: string;
    phone?: string;
    address?: string;
    bio?: string;
    emergencyContact?: string;
    avatarUrl?: string;
  }) => Promise<void>;
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
    entityId: 'fee-sched-2026/2027',
    beforeSnapshot: null,
    afterSnapshot: { schedule: '2026/2027 Approved Schedule', tuitionKobo: 15000000 },
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
  const [customProfiles, setCustomProfiles] = useState<Record<string, Partial<PersonaProfile>>>({});

  const basePersona = PERSONA_PROFILES[activeRole] || PERSONA_PROFILES.PROVOST;
  const personaOverrides = customProfiles[activeRole] || {};
  const persona: PersonaProfile = {
    ...basePersona,
    ...personaOverrides,
    permissions: personaOverrides.permissions || basePersona.permissions,
  };

  const session: UserSession = {
    userId: `usr-${activeRole.toLowerCase()}-01`,
    collegeId: 'bethsaida',
    email: persona.email,
    fullName: persona.fullName,
    avatarUrl: persona.avatarUrl,
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
    permissions: persona.permissions,
  };

  // ─── Live Hydration from Supabase Remote Database (Single Source of Truth) ───
  useEffect(() => {
    async function loadSupabaseData() {
      try {
        const [ledgersRes, receiptsRes, auditsRes, profilesRes] = await Promise.all([
          supabase.from('student_ledgers').select('*').order('created_at', { ascending: false }),
          supabase.from('official_receipts').select('*').order('paid_at', { ascending: false }),
          supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }),
          supabase.from('profiles').select('*'),
        ]);

        if (profilesRes.data && profilesRes.data.length > 0) {
          const loadedOverrides: Record<string, Partial<PersonaProfile>> = {};
          profilesRes.data.forEach((p: any) => {
            if (p.role) {
              loadedOverrides[p.role] = {
                fullName: p.full_name || undefined,
                phone: p.phone || undefined,
                address: p.address || undefined,
                bio: p.bio || undefined,
                emergencyContact: p.emergency_contact || undefined,
                avatarUrl: p.avatar_url || undefined,
                permissions: (p.permissions && p.permissions.length > 0) ? p.permissions : undefined,
              };
            }
          });
          setCustomProfiles((prev) => ({ ...prev, ...loadedOverrides }));
        }

        if (ledgersRes.data && ledgersRes.data.length > 0) {
          setLedgerEntries(
            ledgersRes.data.map((row: any) => ({
              id: row.id,
              collegeId: row.college_id,
              studentId: row.student_id,
              matricNumber: row.matric_number,
              entryType: row.entry_type,
              category: row.category,
              description: row.description,
              amountKobo: Number(row.amount_kobo),
              balanceAfterKobo: Number(row.balance_after_kobo),
              referenceId: row.reference_id,
              createdAt: row.created_at,
            }))
          );
        }

        if (receiptsRes.data && receiptsRes.data.length > 0) {
          setReceipts(
            receiptsRes.data.map((row: any) => ({
              receiptNumber: row.receipt_number,
              collegeId: row.college_id,
              studentId: row.student_id,
              studentName: row.student_name,
              matricNumber: row.matric_number,
              programme: row.programme,
              level: row.level,
              category: row.category,
              amountKobo: Number(row.amount_kobo),
              formattedAmount: formatNaira(Number(row.amount_kobo)),
              paymentMethod: row.payment_method,
              transactionReference: row.transaction_reference,
              gatewayReference: row.gateway_reference,
              paidAt: row.paid_at,
              qrVerificationHash: row.qr_verification_hash,
              issuer: row.issuer,
            }))
          );
        }

        if (auditsRes.data && auditsRes.data.length > 0) {
          setAuditLogs(
            auditsRes.data.map((row: any) => ({
              id: row.id,
              collegeId: row.college_id,
              actorId: row.actor_id,
              actorRole: row.actor_role,
              action: row.action,
              entityType: row.entity_type,
              entityId: row.entity_id,
              beforeSnapshot: row.before_snapshot,
              afterSnapshot: row.after_snapshot,
              ipAddress: row.ip_address,
              userAgent: row.user_agent,
              timestamp: row.timestamp,
              chainHash: row.chain_hash,
              prevHash: row.prev_hash,
            }))
          );
        }
      } catch (err) {
        console.warn('[CampusOne] Supabase live hydration fallback active:', err);
      }
    }

    loadSupabaseData();
  }, []);

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

    // Live Supabase Sync
    supabase.from('audit_logs').insert({
      id: newLog.id,
      college_id: newLog.collegeId,
      actor_id: newLog.actorId,
      actor_role: newLog.actorRole,
      action: newLog.action,
      entity_type: newLog.entityType,
      entity_id: newLog.entityId,
      before_snapshot: newLog.beforeSnapshot,
      after_snapshot: newLog.afterSnapshot,
      ip_address: newLog.ipAddress,
      user_agent: newLog.userAgent,
      chain_hash: newLog.chainHash,
      prev_hash: newLog.prevHash,
      timestamp: newLog.timestamp,
    }).then(({ error }) => {
      if (error) console.warn('[CampusOne] Supabase audit sync:', error.message);
    });
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

    // Live Supabase Sync
    supabase.from('student_ledgers').insert({
      id: newLedgerEntry.id,
      college_id: newLedgerEntry.collegeId,
      student_id: newLedgerEntry.studentId,
      matric_number: newLedgerEntry.matricNumber,
      entry_type: newLedgerEntry.entryType,
      category: newLedgerEntry.category,
      description: newLedgerEntry.description,
      amount_kobo: newLedgerEntry.amountKobo,
      balance_after_kobo: newLedgerEntry.balanceAfterKobo,
      reference_id: newLedgerEntry.referenceId,
      created_at: newLedgerEntry.createdAt,
    }).then(({ error }) => {
      if (error) console.warn('[CampusOne] Supabase ledger sync:', error.message);
    });

    supabase.from('official_receipts').insert({
      receipt_number: newReceipt.receiptNumber,
      college_id: newReceipt.collegeId,
      student_id: newReceipt.studentId,
      student_name: newReceipt.studentName,
      matric_number: newReceipt.matricNumber,
      programme: newReceipt.programme,
      level: newReceipt.level,
      category: newReceipt.category,
      amount_kobo: newReceipt.amountKobo,
      payment_method: newReceipt.paymentMethod,
      transaction_reference: newReceipt.transactionReference,
      gateway_reference: newReceipt.gatewayReference,
      qr_verification_hash: newReceipt.qrVerificationHash,
      issuer: newReceipt.issuer,
      paid_at: newReceipt.paidAt,
    }).then(({ error }) => {
      if (error) console.warn('[CampusOne] Supabase receipt sync:', error.message);
    });

    recordAudit('PAYMENT_POSTED', 'FIN_LEDGER', newLedgerEntry.id, {
      matricNumber: entry.matricNumber,
      amountKobo: entry.amountKobo,
      receiptNumber: receiptNum,
    });

    return newReceipt;
  };

  const updateProfile = async (updates: {
    fullName?: string;
    phone?: string;
    address?: string;
    bio?: string;
    emergencyContact?: string;
    avatarUrl?: string;
  }) => {
    // 1. Update local reactive state
    setCustomProfiles((prev) => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        ...updates,
      },
    }));

    // 2. Persist directly to Supabase profiles table (Single Source of Truth)
    const profilePayload: any = { updated_at: new Date().toISOString() };
    if (updates.fullName !== undefined) profilePayload.full_name = updates.fullName;
    if (updates.phone !== undefined) profilePayload.phone = updates.phone;
    if (updates.address !== undefined) profilePayload.address = updates.address;
    if (updates.bio !== undefined) profilePayload.bio = updates.bio;
    if (updates.emergencyContact !== undefined) profilePayload.emergency_contact = updates.emergencyContact;
    if (updates.avatarUrl !== undefined) profilePayload.avatar_url = updates.avatarUrl;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(profilePayload)
        .eq('email', persona.email);

      if (error) {
        console.warn('[CampusOne] Supabase profile update error:', error.message);
      }
    } catch (err) {
      console.warn('[CampusOne] Supabase profile update failed:', err);
    }

    recordAudit('PROFILE_UPDATED', 'USER_PROFILE', persona.email, {
      role: activeRole,
      updatedFields: Object.keys(updates),
    });
  };

  return (
    <AppContext.Provider
      value={{
        session,
        persona,
        switchRole: (role) => {
          setActiveRole(role);
          recordAudit('ROLE_SWITCHED', 'USER_SESSION', role);
        },
        updateProfile,
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

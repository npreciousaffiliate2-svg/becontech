export type FeeCategory =
  | 'tuition'
  | 'acceptance'
  | 'clinical_posting'
  | 'uniform_kit'
  | 'hostel'
  | 'exam'
  | 'application'
  | 'other';

export type PaymentMethod = 'paystack' | 'flutterwave' | 'remita' | 'bank_transfer_direct';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'reversed';

export type LedgerEntryType = 'debit' | 'credit';

export interface FeeStructureItem {
  id: string;
  category: FeeCategory;
  name: string;
  amountKobo: number; // integer kobo (minor units)
  isCompulsory: boolean;
  dueDate?: string; // ISO 8601
}

export interface StudentLedgerEntry {
  id: string;
  collegeId: string;
  studentId: string;
  matricNumber: string;
  entryType: LedgerEntryType; // debit = student owes; credit = student paid
  category: FeeCategory;
  description: string;
  amountKobo: number;
  balanceAfterKobo: number;
  referenceId: string; // paymentId or chargeId
  createdAt: string; // ISO 8601 UTC
}

export interface OfficialReceipt {
  receiptNumber: string; // e.g. "RCP-2026-00842"
  collegeId: string;
  studentId: string;
  studentName: string;
  matricNumber: string;
  programme: string;
  level: string;
  category: FeeCategory;
  amountKobo: number;
  formattedAmount: string;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  gatewayReference: string;
  paidAt: string; // ISO 8601 UTC
  qrVerificationHash: string;
  issuer: string;
}

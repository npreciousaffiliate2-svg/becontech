import type { StudentLedgerEntry } from '../types/finance.js';

export function koboToNaira(amountKobo: number): number {
  return amountKobo / 100;
}

export function nairaToKobo(amountNaira: number): number {
  return Math.round(amountNaira * 100);
}

export function formatNaira(amountKobo: number): string {
  const naira = koboToNaira(amountKobo);
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(naira).replace('NGN', '₦');
}

export function calculateLedgerBalance(entries: StudentLedgerEntry[]): {
  totalDebitsKobo: number;
  totalCreditsKobo: number;
  outstandingBalanceKobo: number; // debits - credits
  isDebtor: boolean;
} {
  let totalDebitsKobo = 0;
  let totalCreditsKobo = 0;

  for (const entry of entries) {
    if (entry.entryType === 'debit') {
      totalDebitsKobo += entry.amountKobo;
    } else if (entry.entryType === 'credit') {
      totalCreditsKobo += entry.amountKobo;
    }
  }

  const outstandingBalanceKobo = totalDebitsKobo - totalCreditsKobo;

  return {
    totalDebitsKobo,
    totalCreditsKobo,
    outstandingBalanceKobo,
    isDebtor: outstandingBalanceKobo > 0,
  };
}

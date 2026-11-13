import test from 'node:test';
import assert from 'node:assert/strict';
import { determineGrade, computeSemesterGpa, computeCgpa } from '../dist/math/academic.js';
import { formatNaira, calculateLedgerBalance } from '../dist/math/finance.js';

test('Golden vector: Grade determination matches RFC default scale', () => {
  assert.equal(determineGrade(75).grade, 'A');
  assert.equal(determineGrade(70).grade, 'A');
  assert.equal(determineGrade(69.5).grade, 'B');
  assert.equal(determineGrade(60).grade, 'B');
  assert.equal(determineGrade(55).grade, 'C');
  assert.equal(determineGrade(48).grade, 'D');
  assert.equal(determineGrade(42).grade, 'E');
  assert.equal(determineGrade(39.9).grade, 'F');
  assert.equal(determineGrade(0).grade, 'F');
});

test('Golden vector: Semester GPA deterministic calculation', () => {
  // Course 1: 3 units, 24 CA + 50 Exam = 74 (A = 5.0) -> QP = 15.0
  // Course 2: 2 units, 18 CA + 45 Exam = 63 (B = 4.0) -> QP = 8.0
  // Course 3: 4 units, 15 CA + 38 Exam = 53 (C = 3.0) -> QP = 12.0
  // Total units: 9, Total QP: 35.0, GPA: 35 / 9 = 3.8888 -> 3.89
  const courses = [
    { courseCode: 'CHE201', courseTitle: 'Primary Health Care I', creditUnits: 3, caScore: 24, examScore: 50 },
    { courseCode: 'CHE202', courseTitle: 'Anatomy & Physiology', creditUnits: 2, caScore: 18, examScore: 45 },
    { courseCode: 'CHE203', courseTitle: 'Pharmacology for Health', creditUnits: 4, caScore: 15, examScore: 38 },
  ];

  const result = computeSemesterGpa(courses);
  assert.equal(result.totalCreditUnits, 9);
  assert.equal(result.totalQualityPoints, 35);
  assert.equal(result.gpa, 3.89);
  assert.equal(result.passedUnits, 9);
  assert.equal(result.failedUnits, 0);
  assert.equal(result.onProbation, false);
});

test('Golden vector: Naira kobo formatting', () => {
  // 15000000 kobo = ₦150,000.00
  const formatted = formatNaira(15000000);
  assert.match(formatted, /150,000\.00/);
});

test('Golden vector: Ledger balance and debtor status', () => {
  const entries = [
    {
      id: '1',
      collegeId: 'bethsaida',
      studentId: 'stu-1',
      matricNumber: 'CHT/2026/001',
      entryType: 'debit',
      category: 'tuition',
      description: 'First Semester Tuition',
      amountKobo: 12000000,
      balanceAfterKobo: 12000000,
      referenceId: 'chg-1',
      createdAt: '2026-11-01T08:00:00Z',
    },
    {
      id: '2',
      collegeId: 'bethsaida',
      studentId: 'stu-1',
      matricNumber: 'CHT/2026/001',
      entryType: 'credit',
      category: 'tuition',
      description: 'Paystack Payment Online',
      amountKobo: 7000000,
      balanceAfterKobo: 5000000,
      referenceId: 'pay-1',
      createdAt: '2026-11-02T10:00:00Z',
    },
  ];

  const balance = calculateLedgerBalance(entries);
  assert.equal(balance.totalDebitsKobo, 12000000);
  assert.equal(balance.totalCreditsKobo, 7000000);
  assert.equal(balance.outstandingBalanceKobo, 5000000);
  assert.equal(balance.isDebtor, true);
});

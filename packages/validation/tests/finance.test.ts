import assert from 'node:assert/strict';
import test from 'node:test';
import {
  validateDoubleEntry,
  validatePaymentReference,
  reconcileSubLedgerWithGL,
  generateReversalJournalEntry,
} from '../src/finance.ts';
import type { JournalEntry } from '@candi/types';

test('validateDoubleEntry accepts balanced entry with debits matching credits', () => {
  const lines = [
    {
      id: 'l1',
      accountCode: '1100',
      accountName: 'Accounts Receivable',
      debit: 150000,
      credit: 0,
      memo: 'Invoice to Metro Cash & Carry',
    },
    {
      id: 'l2',
      accountCode: '4010',
      accountName: 'Wholesale Sales Revenue',
      debit: 0,
      credit: 150000,
      memo: 'Invoice to Metro Cash & Carry',
    },
  ];

  const result = validateDoubleEntry(lines);
  assert.equal(result.isBalanced, true);
  assert.equal(result.totalDebit, 150000);
  assert.equal(result.totalCredit, 150000);
  assert.equal(result.difference, 0);
  assert.equal(result.error, undefined);
});

test('validateDoubleEntry rejects unbalanced entry with debit/credit mismatch', () => {
  const lines = [
    {
      id: 'l1',
      accountCode: '1100',
      accountName: 'Accounts Receivable',
      debit: 150000,
      credit: 0,
      memo: 'Invoice',
    },
    {
      id: 'l2',
      accountCode: '4010',
      accountName: 'Wholesale Sales Revenue',
      debit: 0,
      credit: 145000, // 5,000 difference
      memo: 'Invoice',
    },
  ];

  const result = validateDoubleEntry(lines);
  assert.equal(result.isBalanced, false);
  assert.equal(result.totalDebit, 150000);
  assert.equal(result.totalCredit, 145000);
  assert.equal(result.difference, 5000);
  assert.match(result.error || '', /Difference is PKR 5,000/);
});

test('validatePaymentReference enforces reference on non-cash payments', () => {
  const validBank = validatePaymentReference({
    paymentMethod: 'bank_transfer',
    receiptReference: 'HBL-FT-99201',
    amount: 50000,
  });
  assert.equal(validBank.isValid, true);

  const invalidBank = validatePaymentReference({
    paymentMethod: 'bank_transfer',
    receiptReference: '',
    amount: 50000,
  });
  assert.equal(invalidBank.isValid, false);
  assert.match(invalidBank.error || '', /mandatory for bank transfer/i);

  const invalidZeroAmount = validatePaymentReference({
    paymentMethod: 'cash',
    amount: 0,
  });
  assert.equal(invalidZeroAmount.isValid, false);
  assert.match(invalidZeroAmount.error || '', /greater than zero/i);
});

test('reconcileSubLedgerWithGL calculates variance and reconciliation status', () => {
  // Balanced: 502,500 Subledger vs 502,500 GL 1100
  const reconciled = reconcileSubLedgerWithGL(502500, 502500);
  assert.equal(reconciled.isReconciled, true);
  assert.equal(reconciled.variance, 0);
  assert.equal(reconciled.status, 'reconciled');

  // Discrepancy: 502,500 Subledger vs 500,000 GL
  const mismatch = reconcileSubLedgerWithGL(502500, 500000);
  assert.equal(mismatch.isReconciled, false);
  assert.equal(mismatch.variance, 2500);
  assert.equal(mismatch.status, 'variance_detected');
});

test('generateReversalJournalEntry swaps debits and credits and creates immutable reversing record', () => {
  const originalEntry: JournalEntry = {
    id: 'jv-101',
    journalNumber: 'JV-2026-001',
    date: '2026-09-15',
    reference: 'TXN-9988',
    description: 'Advance payment recorded incorrectly',
    preparedBy: 'Ahmed Raza',
    approvedBy: 'Farhan Zaidi',
    status: 'posted',
    postedAt: '2026-09-15T10:00:00Z',
    lines: [
      {
        id: 'l1',
        accountCode: '1020',
        accountName: 'Bank - HBL Current',
        debit: 50000,
        credit: 0,
        memo: 'Received cash advance',
      },
      {
        id: 'l2',
        accountCode: '2020',
        accountName: 'Accrued Liabilities',
        debit: 0,
        credit: 50000,
        memo: 'Temporary liability credit',
      },
    ],
    totalDebit: 50000,
    totalCredit: 50000,
    isBalanced: true,
    auditTrail: [
      {
        timestamp: '2026-09-15T10:00:00Z',
        actor: 'Farhan Zaidi',
        action: 'POSTED',
        details: 'Initial posting',
      },
    ],
  };

  const reversal = generateReversalJournalEntry(originalEntry, 'REV-JV-2026-001', 'Controller', '2026-09-17');

  assert.equal(reversal.journalNumber, 'REV-JV-2026-001');
  assert.equal(reversal.reference, 'JV-2026-001');
  assert.equal(reversal.lines[0].debit, 0);
  assert.equal(reversal.lines[0].credit, 50000);
  assert.equal(reversal.lines[1].debit, 50000);
  assert.equal(reversal.lines[1].credit, 0);
  assert.equal(reversal.totalDebit, 50000);
  assert.equal(reversal.totalCredit, 50000);
  assert.equal(reversal.isReversal, true);
  assert.equal(reversal.reversalRef, 'JV-2026-001');
});

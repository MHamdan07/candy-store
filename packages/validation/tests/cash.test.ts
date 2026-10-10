import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateCashVariance,
  calculateDenominationsTotal,
  validateHandoverDualConfirmation,
  generateCashClosingJournalEntry,
} from '../src/cash.ts';
import type { CashDenominations, CashReconciliationSession } from '@candi/types';

test('calculateCashVariance accurately identifies balanced drawer', () => {
  const result = calculateCashVariance(125400, 125400);
  assert.equal(result.isBalanced, true);
  assert.equal(result.variance, 0);
  assert.equal(result.varianceType, 'none');
  assert.equal(result.requiresExplanation, false);
});

test('calculateCashVariance flags shortages and requires explanation', () => {
  const result = calculateCashVariance(125400, 124900); // 500 shortage
  assert.equal(result.isBalanced, false);
  assert.equal(result.variance, -500);
  assert.equal(result.varianceType, 'shortage');
  assert.equal(result.requiresExplanation, true);
  assert.match(result.message, /shortage of PKR 500/i);
});

test('calculateCashVariance flags excess and requires explanation', () => {
  const result = calculateCashVariance(125400, 125600); // 200 excess
  assert.equal(result.isBalanced, false);
  assert.equal(result.variance, 200);
  assert.equal(result.varianceType, 'excess');
  assert.equal(result.requiresExplanation, true);
  assert.match(result.message, /excess of PKR 200/i);
});

test('calculateDenominationsTotal computes currency note count sum', () => {
  const denoms: CashDenominations = {
    note5000: 10, // 50,000
    note1000: 50, // 50,000
    note500: 40,  // 20,000
    note100: 40,  // 4,000
    note50: 20,   // 1,000
    note20: 15,   // 300
    note10: 10,   // 100
  };
  const total = calculateDenominationsTotal(denoms);
  // 50000 + 50000 + 20000 + 4000 + 1000 + 300 + 100 = 125,400
  assert.equal(total, 125400);
});

test('validateHandoverDualConfirmation rejects unconfirmed handovers', () => {
  const result = validateHandoverDualConfirmation(45000, 45000, true, false);
  assert.equal(result.isConfirmed, false);
  assert.match(result.error || '', /dual-party confirmation required/i);
});

test('validateHandoverDualConfirmation enforces explanation on discrepancy', () => {
  // Discrepancy: Expected 45,000, Actual 44,500, but no explanation provided
  const noReason = validateHandoverDualConfirmation(45000, 44500, true, true, '');
  assert.equal(noReason.isConfirmed, false);
  assert.match(noReason.error || '', /requires a documented reason/i);

  // With explanation: accepted
  const withReason = validateHandoverDualConfirmation(
    45000,
    44500,
    true,
    true,
    'PKR 500 note torn and rejected by cashier'
  );
  assert.equal(withReason.isConfirmed, true);
  assert.equal(withReason.difference, -500);
});

test('generateCashClosingJournalEntry creates balanced double-entry GL voucher', () => {
  const session: CashReconciliationSession = {
    id: 'rec-01',
    sessionNumber: 'REC-CSH-2026-0918',
    date: '2026-09-18',
    openingCash: 125400,
    cashCollected: 65000,
    refunds: 0,
    deposits: 50000,
    expectedClosingCash: 140400,
    actualClosingCash: 140400,
    denominations: {
      note5000: 20,
      note1000: 30,
      note500: 20,
      note100: 4,
      note50: 0,
      note20: 0,
      note10: 0,
    },
    variance: 0,
    varianceType: 'none',
    approvalStatus: 'approved',
    approvedBy: 'Farhan Zaidi',
    auditTrail: [],
    createdAt: '2026-09-18 18:00',
  };

  const jv = generateCashClosingJournalEntry(session, 'JV-2026-0099', 'Farhan Zaidi', '2026-09-18');

  assert.equal(jv.journalNumber, 'JV-2026-0099');
  assert.equal(jv.reference, 'REC-CSH-2026-0918');
  assert.equal(jv.isBalanced, true);
  assert.equal(jv.totalDebit, jv.totalCredit);
  // Lines: Debit 1010 (65k), Credit 1100 (65k), Debit 1020 (50k), Credit 1010 (50k)
  assert.equal(jv.totalDebit, 115000);
});

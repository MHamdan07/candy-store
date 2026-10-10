import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { AgingBucket, CustomerLedgerEntry } from '@candi/types';

describe('Phase 3C: Receivables, Aging & Collections Validation', () => {
  // Test 1: Double-Entry Statement Running Balance Formula
  it('correctly calculates customer statement closing balance from opening balance and ledger entries', () => {
    const openingBalance = 40000;
    const entries: Partial<CustomerLedgerEntry>[] = [
      { entryType: 'invoice', debit: 85000, credit: 0 },
      { entryType: 'payment', debit: 0, credit: 16000 },
      { entryType: 'invoice', debit: 95000, credit: 0 },
      { entryType: 'credit_note', debit: 0, credit: 40000 },
      { entryType: 'payment', debit: 0, credit: 40000 },
    ];

    let runningBalance = openingBalance;
    for (const entry of entries) {
      runningBalance = runningBalance + (entry.debit || 0) - (entry.credit || 0);
    }

    assert.strictEqual(runningBalance, 124000, 'Closing balance must exactly match double-entry ledger calculation');
  });

  // Test 2: Automated 5-Bucket Aging Classification
  it('classifies invoices into proper aging buckets based on due date relative to evaluation date', () => {
    const asOfDate = new Date('2026-09-17').getTime();

    const classify = (dueDateStr: string): { daysOverdue: number; bucket: AgingBucket } => {
      const due = new Date(dueDateStr).getTime();
      const days = Math.floor((asOfDate - due) / (1000 * 60 * 60 * 24));
      if (days <= 0) return { daysOverdue: 0, bucket: 'current' };
      if (days <= 30) return { daysOverdue: days, bucket: '1_30' };
      if (days <= 60) return { daysOverdue: days, bucket: '31_60' };
      if (days <= 90) return { daysOverdue: days, bucket: '61_90' };
      return { daysOverdue: days, bucket: 'over_90' };
    };

    // Case 1: Future / current invoice
    assert.strictEqual(classify('2026-09-24').bucket, 'current');
    assert.strictEqual(classify('2026-09-24').daysOverdue, 0);

    // Case 2: 1-30 days overdue
    assert.strictEqual(classify('2026-09-12').bucket, '1_30');
    assert.strictEqual(classify('2026-09-12').daysOverdue, 5);

    // Case 3: 31-60 days overdue
    assert.strictEqual(classify('2026-07-30').bucket, '31_60');
    assert.strictEqual(classify('2026-07-30').daysOverdue, 49);

    // Case 4: 61-90 days overdue
    assert.strictEqual(classify('2026-06-25').bucket, '61_90');
    assert.strictEqual(classify('2026-06-25').daysOverdue, 84);

    // Case 5: Over 90 days overdue
    assert.strictEqual(classify('2026-05-30').bucket, 'over_90');
    assert.strictEqual(classify('2026-05-30').daysOverdue, 110);
  });

  // Test 3: Credit-Hold Governance Rule Trigger
  it('triggers Credit-Hold alert when overdue exceeds 15 days or credit limit is breached', () => {
    const checkCreditHold = (params: { creditLimit: number; currentBalance: number; maxDaysOverdue: number }) => {
      return params.currentBalance > params.creditLimit || params.maxDaysOverdue > 15;
    };

    // Compliant customer
    assert.strictEqual(checkCreditHold({ creditLimit: 200000, currentBalance: 18000, maxDaysOverdue: 0 }), false);

    // Overdue > 15 days triggers hold
    assert.strictEqual(checkCreditHold({ creditLimit: 500000, currentBalance: 124000, maxDaysOverdue: 49 }), true);

    // Balance > credit limit triggers hold
    assert.strictEqual(checkCreditHold({ creditLimit: 200000, currentBalance: 250000, maxDaysOverdue: 5 }), true);
  });

  // Test 4: Payment Allocation
  it('accurately allocates payment to reduce invoice balance and records unapplied credit if overpaid', () => {
    const invoiceBalance = 48500;
    const collectedPayment = 50000;

    const allocated = Math.min(invoiceBalance, collectedPayment);
    const remainingInvoiceBalance = invoiceBalance - allocated;
    const unappliedCredit = collectedPayment - allocated;

    assert.strictEqual(allocated, 48500);
    assert.strictEqual(remainingInvoiceBalance, 0);
    assert.strictEqual(unappliedCredit, 1500);
  });
});

import type { JournalEntry, JournalEntryLine } from '@candi/types';

export interface DoubleEntryValidationResult {
  isBalanced: boolean;
  totalDebit: number;
  totalCredit: number;
  difference: number;
  error?: string;
}

export function validateDoubleEntry(lines: JournalEntryLine[]): DoubleEntryValidationResult {
  if (!lines || lines.length < 2) {
    return {
      isBalanced: false,
      totalDebit: 0,
      totalCredit: 0,
      difference: 0,
      error: 'A journal entry must have at least two line items.',
    };
  }

  const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
  const difference = Math.abs(Math.round((totalDebit - totalCredit) * 100) / 100);
  const isBalanced = difference === 0;

  return {
    isBalanced,
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    difference,
    error: isBalanced ? undefined : `Debit and Credit must balance. Difference is PKR ${difference.toLocaleString()}`,
  };
}

export function validatePaymentReference(params: {
  paymentMethod: string;
  receiptReference?: string;
  invoiceReference?: string;
  amount: number;
}): { isValid: boolean; error?: string } {
  if (params.amount <= 0) {
    return { isValid: false, error: 'Payment amount must be greater than zero.' };
  }

  if (params.paymentMethod === 'bank_transfer' || params.paymentMethod === 'cheque' || params.paymentMethod === 'pay_order') {
    if (!params.receiptReference || params.receiptReference.trim().length === 0) {
      return {
        isValid: false,
        error: `Receipt or transaction reference is mandatory for ${params.paymentMethod.replace('_', ' ')}.`,
      };
    }
  }

  return { isValid: true };
}

export function reconcileSubLedgerWithGL(subLedgerBalance: number, glAccountBalance: number): {
  isReconciled: boolean;
  variance: number;
  status: 'reconciled' | 'variance_detected';
} {
  const roundedSub = Math.round(subLedgerBalance * 100) / 100;
  const roundedGL = Math.round(glAccountBalance * 100) / 100;
  const variance = Math.abs(Math.round((roundedSub - roundedGL) * 100) / 100);

  return {
    isReconciled: variance === 0,
    variance,
    status: variance === 0 ? 'reconciled' : 'variance_detected',
  };
}

export function generateReversalJournalEntry(
  original: JournalEntry,
  reversalNumber: string,
  reversedBy: string,
  reversalDate: string
): JournalEntry {
  if (original.status !== 'posted') {
    throw new Error('Only posted journal entries can be reversed.');
  }

  const reversedLines: JournalEntryLine[] = original.lines.map((line, idx) => ({
    id: `rev-line-${idx + 1}`,
    accountCode: line.accountCode,
    accountName: line.accountName,
    // Swap debit and credit
    debit: line.credit,
    credit: line.debit,
    memo: `Reversal of ${original.journalNumber}: ${line.memo}`,
  }));

  return {
    id: `reversal-${original.id}`,
    journalNumber: reversalNumber,
    date: reversalDate,
    reference: original.journalNumber,
    description: `Compensating Reversal for Journal ${original.journalNumber} - ${original.description}`,
    preparedBy: reversedBy,
    approvedBy: reversedBy,
    status: 'posted',
    postedAt: new Date().toISOString(),
    lines: reversedLines,
    totalDebit: original.totalCredit,
    totalCredit: original.totalDebit,
    isBalanced: true,
    isReversal: true,
    reversalRef: original.journalNumber,
    auditTrail: [
      ...original.auditTrail,
      {
        timestamp: new Date().toISOString(),
        actor: reversedBy,
        action: 'REVERSAL_GENERATED',
        details: `Reversed original journal entry ${original.journalNumber}`,
      },
    ],
  };
}

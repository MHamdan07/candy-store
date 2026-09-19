import type {
  CashDenominations,
  CashReconciliationSession,
  CashVarianceType,
  JournalEntry,
  JournalEntryLine,
} from '@candi/types';

export interface CashVarianceResult {
  variance: number;
  varianceType: CashVarianceType;
  requiresExplanation: boolean;
  isBalanced: boolean;
  message: string;
}

export function calculateCashVariance(expectedClosingCash: number, actualClosingCash: number): CashVarianceResult {
  const expected = Math.round(expectedClosingCash * 100) / 100;
  const actual = Math.round(actualClosingCash * 100) / 100;
  const variance = Math.round((actual - expected) * 100) / 100;

  if (variance === 0) {
    return {
      variance: 0,
      varianceType: 'none',
      requiresExplanation: false,
      isBalanced: true,
      message: 'Cash drawer count matches expected closing cash perfectly ($0.00 variance).',
    };
  }

  if (variance < 0) {
    return {
      variance,
      varianceType: 'shortage',
      requiresExplanation: true,
      isBalanced: false,
      message: `Cash shortage of PKR ${Math.abs(variance).toLocaleString()} detected. Explanation and supervisor authorization required.`,
    };
  }

  return {
    variance,
    varianceType: 'excess',
    requiresExplanation: true,
    isBalanced: false,
    message: `Cash excess of PKR ${variance.toLocaleString()} detected. Explanation and supervisor authorization required.`,
  };
}

export function calculateDenominationsTotal(denominations: CashDenominations): number {
  return (
    (denominations.note5000 || 0) * 5000 +
    (denominations.note1000 || 0) * 1000 +
    (denominations.note500 || 0) * 500 +
    (denominations.note100 || 0) * 100 +
    (denominations.note50 || 0) * 50 +
    (denominations.note20 || 0) * 20 +
    (denominations.note10 || 0) * 10
  );
}

export function validateHandoverDualConfirmation(
  expectedAmount: number,
  actualAmount: number,
  collectorConfirmed: boolean,
  receiverConfirmed: boolean,
  explanation?: string
): {
  isConfirmed: boolean;
  hasDifference: boolean;
  difference: number;
  error?: string;
} {
  const difference = Math.round((actualAmount - expectedAmount) * 100) / 100;
  const hasDifference = difference !== 0;

  if (!collectorConfirmed || !receiverConfirmed) {
    return {
      isConfirmed: false,
      hasDifference,
      difference,
      error: 'Dual-party confirmation required: both field Collector and depot Receiver must sign off.',
    };
  }

  if (hasDifference && (!explanation || explanation.trim().length === 0)) {
    return {
      isConfirmed: false,
      hasDifference: true,
      difference,
      error: `Handover discrepancy of PKR ${Math.abs(difference).toLocaleString()} requires a documented reason.`,
    };
  }

  return {
    isConfirmed: true,
    hasDifference,
    difference,
  };
}

export function generateCashClosingJournalEntry(
  session: CashReconciliationSession,
  jvNumber: string,
  postedBy: string,
  postedDate: string
): JournalEntry {
  const lines: JournalEntryLine[] = [];
  let lineIdx = 1;

  // 1. Debit Cash on Hand (GL 1010) for total collections
  if (session.cashCollected > 0) {
    lines.push({
      id: `jl-csh-${lineIdx++}`,
      accountCode: '1010',
      accountName: 'Cash on Hand (Disbursements & Drawer)',
      debit: session.cashCollected,
      credit: 0,
      memo: `Route cash collections deposited to depot vault (${session.sessionNumber})`,
    });

    // Credit Trade Receivables (GL 1100)
    lines.push({
      id: `jl-csh-${lineIdx++}`,
      accountCode: '1100',
      accountName: 'Trade Accounts Receivable (Control)',
      debit: 0,
      credit: session.cashCollected,
      memo: `Reduction of trade receivables from customer cash collections (${session.sessionNumber})`,
    });
  }

  // 2. If deposits to bank occurred: Debit Bank (GL 1020), Credit Cash (GL 1010)
  if (session.deposits > 0) {
    lines.push({
      id: `jl-csh-${lineIdx++}`,
      accountCode: '1020',
      accountName: 'Habib Bank Limited (HBL Corporate)',
      debit: session.deposits,
      credit: 0,
      memo: `Cash deposit from depot vault to HBL corporate account (${session.sessionNumber})`,
    });

    lines.push({
      id: `jl-csh-${lineIdx++}`,
      accountCode: '1010',
      accountName: 'Cash on Hand (Disbursements & Drawer)',
      debit: 0,
      credit: session.deposits,
      memo: `Vault outflow deposited to HBL corporate account (${session.sessionNumber})`,
    });
  }

  // 3. If cash shortage: Debit Cash Shortage Expense (GL 6020/Operating), Credit Cash (GL 1010)
  if (session.variance < 0) {
    const shortage = Math.abs(session.variance);
    lines.push({
      id: `jl-csh-${lineIdx++}`,
      accountCode: '6020',
      accountName: 'Warehouse Lease & Depot Utilities (Operating Variance)',
      debit: shortage,
      credit: 0,
      memo: `Approved cash shortage adjustment: ${session.explanation || 'Depot count shortage'}`,
    });

    lines.push({
      id: `jl-csh-${lineIdx++}`,
      accountCode: '1010',
      accountName: 'Cash on Hand (Disbursements & Drawer)',
      debit: 0,
      credit: shortage,
      memo: `Write-down of cash drawer balance to actual physical count (${session.sessionNumber})`,
    });
  } else if (session.variance > 0) {
    // Cash excess: Debit Cash (GL 1010), Credit Other Operating Income (GL 4010)
    const excess = session.variance;
    lines.push({
      id: `jl-csh-${lineIdx++}`,
      accountCode: '1010',
      accountName: 'Cash on Hand (Disbursements & Drawer)',
      debit: excess,
      credit: 0,
      memo: `Unexplained cash excess added to drawer (${session.sessionNumber})`,
    });

    lines.push({
      id: `jl-csh-${lineIdx++}`,
      accountCode: '4010',
      accountName: 'Wholesale Confectionery Sales Revenue (Cash Overage)',
      debit: 0,
      credit: excess,
      memo: `Cash overage credit recognition: ${session.explanation || 'Physical cash excess'}`,
    });
  }

  const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);

  return {
    id: `jv-${session.id}`,
    journalNumber: jvNumber,
    date: postedDate,
    reference: session.sessionNumber,
    description: `Automated Daily Vault Closing & Reconciliation (${session.sessionNumber})`,
    lines,
    totalDebit,
    totalCredit,
    isBalanced: Math.round(totalDebit * 100) === Math.round(totalCredit * 100),
    status: 'posted',
    preparedBy: postedBy,
    approvedBy: session.approvedBy || postedBy,
    postedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    auditTrail: [
      {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        actor: postedBy,
        action: 'POSTED_FROM_CASH_RECONCILIATION',
        details: `Generated and posted closing journal voucher for session ${session.sessionNumber} with ${lines.length} lines.`,
      },
    ],
  };
}

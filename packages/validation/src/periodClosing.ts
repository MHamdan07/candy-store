import type {
  AccountingPeriod,
  ChartOfAccount,
} from '@candi/types';

export interface TrialBalanceResult {
  totalDebits: number;
  totalCredits: number;
  variance: number;
  isBalanced: boolean;
  rows: {
    code: string;
    name: string;
    type: string;
    debit: number;
    credit: number;
  }[];
}

export interface ProfitAndLossResult {
  grossRevenue: number;
  tradeDiscounts: number;
  netRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossMarginPct: number;
  operatingExpenses: number;
  netOperatingProfit: number;
  netProfitMarginPct: number;
}

export interface BalanceSheetResult {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  variance: number;
}

export function validatePeriodCloseEligibility(
  period: AccountingPeriod,
  unreconciledCount: number,
  materialVariance: number
): { canClose: boolean; error?: string } {
  if (period.isLocked) {
    return {
      canClose: false,
      error: `Accounting period ${period.periodName} is already locked and cannot be modified.`,
    };
  }

  if (unreconciledCount > 0) {
    return {
      canClose: false,
      error: `Cannot close period: ${unreconciledCount} unreconciled transactions must be cleared before closing.`,
    };
  }

  if (Math.abs(materialVariance) > 0) {
    return {
      canClose: false,
      error: `Cannot close period: Unexplained material variance of PKR ${Math.abs(materialVariance).toLocaleString()} detected.`,
    };
  }

  return { canClose: true };
}

export function calculateTrialBalance(accounts: ChartOfAccount[]): TrialBalanceResult {
  let totalDebits = 0;
  let totalCredits = 0;

  const rows = accounts
    .filter((a) => a.isActive)
    .map((acc) => {
      let debit = 0;
      let credit = 0;

      if (acc.type === 'asset' || acc.type === 'expense') {
        debit = acc.currentBalancePKR >= 0 ? acc.currentBalancePKR : 0;
        credit = acc.currentBalancePKR < 0 ? Math.abs(acc.currentBalancePKR) : 0;
      } else if (acc.type === 'liability' || acc.type === 'equity') {
        credit = acc.currentBalancePKR >= 0 ? acc.currentBalancePKR : 0;
        debit = acc.currentBalancePKR < 0 ? Math.abs(acc.currentBalancePKR) : 0;
      } else if (acc.type === 'revenue') {
        // Normal revenue is Credit; contra-revenue (negative balance e.g. -65,000) is Debit
        if (acc.currentBalancePKR >= 0) {
          credit = acc.currentBalancePKR;
        } else {
          debit = Math.abs(acc.currentBalancePKR);
        }
      }

      totalDebits += debit;
      totalCredits += credit;

      return {
        code: acc.code,
        name: acc.name,
        type: acc.type,
        debit,
        credit,
      };
    });

  const variance = Math.abs(Math.round((totalDebits - totalCredits) * 100) / 100);
  const isBalanced = variance === 0;

  return {
    totalDebits: Math.round(totalDebits * 100) / 100,
    totalCredits: Math.round(totalCredits * 100) / 100,
    variance,
    isBalanced,
    rows,
  };
}

export function calculateProfitAndLoss(accounts: ChartOfAccount[]): ProfitAndLossResult {
  const revAccount = accounts.find((a) => a.code === '4010');
  const discountAccount = accounts.find((a) => a.code === '4020');
  const cogsAccount = accounts.find((a) => a.code === '5010');

  const grossRevenue = revAccount?.currentBalancePKR || 0;
  const tradeDiscounts = Math.abs(discountAccount?.currentBalancePKR || 0);
  const netRevenue = grossRevenue - tradeDiscounts;
  const costOfGoodsSold = cogsAccount?.currentBalancePKR || 0;
  const grossProfit = netRevenue - costOfGoodsSold;
  const grossMarginPct = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

  // Operating expenses: 6000s accounts
  const operatingExpenses = accounts
    .filter((a) => a.type === 'expense' && a.code.startsWith('6'))
    .reduce((sum, a) => sum + a.currentBalancePKR, 0);

  const netOperatingProfit = grossProfit - operatingExpenses;
  const netProfitMarginPct = netRevenue > 0 ? (netOperatingProfit / netRevenue) * 100 : 0;

  return {
    grossRevenue,
    tradeDiscounts,
    netRevenue,
    costOfGoodsSold,
    grossProfit,
    grossMarginPct: Math.round(grossMarginPct * 10) / 10,
    operatingExpenses,
    netOperatingProfit,
    netProfitMarginPct: Math.round(netProfitMarginPct * 10) / 10,
  };
}

export function calculateBalanceSheet(
  accounts: ChartOfAccount[],
  currentNetProfit: number
): BalanceSheetResult {
  const totalAssets = accounts
    .filter((a) => a.type === 'asset' && a.isActive)
    .reduce((sum, a) => sum + a.currentBalancePKR, 0);

  const totalLiabilities = accounts
    .filter((a) => a.type === 'liability' && a.isActive)
    .reduce((sum, a) => sum + a.currentBalancePKR, 0);

  const baseEquity = accounts
    .filter((a) => a.type === 'equity' && a.isActive)
    .reduce((sum, a) => sum + a.currentBalancePKR, 0);

  const totalEquity = baseEquity + currentNetProfit;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  const variance = Math.abs(Math.round((totalAssets - totalLiabilitiesAndEquity) * 100) / 100);

  return {
    totalAssets: Math.round(totalAssets * 100) / 100,
    totalLiabilities: Math.round(totalLiabilities * 100) / 100,
    totalEquity: Math.round(totalEquity * 100) / 100,
    totalLiabilitiesAndEquity: Math.round(totalLiabilitiesAndEquity * 100) / 100,
    isBalanced: variance === 0,
    variance,
  };
}

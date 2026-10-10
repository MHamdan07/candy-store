import assert from 'node:assert/strict';
import test from 'node:test';
import {
  validatePeriodCloseEligibility,
  calculateTrialBalance,
  calculateProfitAndLoss,
  calculateBalanceSheet,
} from '../src/periodClosing.ts';
import type { AccountingPeriod, ChartOfAccount } from '@candi/types';

const MOCK_ACCOUNTS: ChartOfAccount[] = [
  { code: '1010', name: 'Cash on Hand', type: 'asset', currentBalancePKR: 125400, currency: 'PKR', isActive: true, description: '', createdAt: '', updatedAt: '' },
  { code: '1020', name: 'HBL Corporate Bank', type: 'asset', currentBalancePKR: 1840000, currency: 'PKR', isActive: true, description: '', createdAt: '', updatedAt: '' },
  { code: '1030', name: 'Meezan Islamic', type: 'asset', currentBalancePKR: 650000, currency: 'PKR', isActive: true, description: '', createdAt: '', updatedAt: '' },
  { code: '1100', name: 'Trade Receivables', type: 'asset', currentBalancePKR: 502500, currency: 'PKR', isActive: true, description: '', createdAt: '', updatedAt: '' },
  { code: '1200', name: 'Inventory Asset', type: 'asset', currentBalancePKR: 1420000, currency: 'PKR', isActive: true, description: '', createdAt: '', updatedAt: '' },
  { code: '1300', name: 'Prepaid Logistics', type: 'asset', currentBalancePKR: 85000, currency: 'PKR', isActive: true, description: '', createdAt: '', updatedAt: '' },
  { code: '2010', name: 'Trade Payables', type: 'liability', currentBalancePKR: 560000, currency: 'PKR', isActive: true, description: '', createdAt: '', updatedAt: '' },
  { code: '2020', name: 'Accrued Expenses', type: 'liability', currentBalancePKR: 92000, currency: 'PKR', isActive: true, description: '', createdAt: '', updatedAt: '' },
  { code: '2030', name: 'Sales Tax Payable', type: 'liability', currentBalancePKR: 48500, currency: 'PKR', isActive: true, description: '', createdAt: '', updatedAt: '' },
  { code: '3010', name: 'Share Capital', type: 'equity', currentBalancePKR: 3000000, currency: 'PKR', isActive: true, description: '', createdAt: '', updatedAt: '' },
  { code: '3020', name: 'Retained Earnings', type: 'equity', currentBalancePKR: 547400, currency: 'PKR', isActive: true, description: '', createdAt: '', updatedAt: '' },
  { code: '4010', name: 'Sales Revenue', type: 'revenue', currentBalancePKR: 2450000, currency: 'PKR', isActive: true, description: '', createdAt: '', updatedAt: '' },
  { code: '4020', name: 'Trade Discounts', type: 'revenue', currentBalancePKR: -65000, currency: 'PKR', isActive: true, description: '', createdAt: '', updatedAt: '' },
  { code: '5010', name: 'COGS', type: 'expense', currentBalancePKR: 1615000, currency: 'PKR', isActive: true, description: '', createdAt: '', updatedAt: '' },
  { code: '6010', name: 'Fleet Fuel', type: 'expense', currentBalancePKR: 115000, currency: 'PKR', isActive: true, description: '', createdAt: '', updatedAt: '' },
  { code: '6020', name: 'Depot Utilities', type: 'expense', currentBalancePKR: 85000, currency: 'PKR', isActive: true, description: '', createdAt: '', updatedAt: '' },
  { code: '6030', name: 'Staff Payroll', type: 'expense', currentBalancePKR: 195000, currency: 'PKR', isActive: true, description: '', createdAt: '', updatedAt: '' },
];

test('calculateTrialBalance verifies debits equal credits with zero variance', () => {
  const tb = calculateTrialBalance(MOCK_ACCOUNTS);
  assert.equal(tb.isBalanced, true);
  assert.equal(tb.variance, 0);
  assert.equal(tb.totalDebits, 6697900);
  assert.equal(tb.totalCredits, 6697900);
});

test('calculateProfitAndLoss computes accurate gross margin and net profit', () => {
  const pl = calculateProfitAndLoss(MOCK_ACCOUNTS);
  // Net Revenue = 2,450,000 - 65,000 = 2,385,000
  assert.equal(pl.netRevenue, 2385000);
  // COGS = 1,615,000
  assert.equal(pl.costOfGoodsSold, 1615000);
  // Gross Profit = 770,000
  assert.equal(pl.grossProfit, 770000);
  // Operating Expenses = 115k + 85k + 195k = 395,000
  assert.equal(pl.operatingExpenses, 395000);
  // Net Operating Profit = 770k - 395k = 375,000
  assert.equal(pl.netOperatingProfit, 375000);
});

test('calculateBalanceSheet verifies Total Assets equals Total Liabilities plus Equity', () => {
  const pl = calculateProfitAndLoss(MOCK_ACCOUNTS);
  const bs = calculateBalanceSheet(MOCK_ACCOUNTS, pl.netOperatingProfit);

  assert.equal(bs.isBalanced, true);
  assert.equal(bs.variance, 0);
  // Assets = 4,622,900
  assert.equal(bs.totalAssets, 4622900);
  // Liabilities = 700,500
  assert.equal(bs.totalLiabilities, 700500);
  // Equity = 3,000,000 + 547,400 + 375,000 = 3,922,400
  assert.equal(bs.totalEquity, 3922400);
  // Liabilities + Equity = 4,622,900
  assert.equal(bs.totalLiabilitiesAndEquity, 4622900);
});

test('validatePeriodCloseEligibility enforces zero unreconciled vouchers and zero variance', () => {
  const period: AccountingPeriod = {
    id: 'p-01',
    periodCode: '2026-09',
    periodName: 'September 2026',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    status: 'open',
    openingBalancesTotal: 4000000,
    closingBalancesTotal: 4622900,
    postedTransactionsCount: 42,
    unreconciledCount: 0,
    adjustmentsCount: 3,
    preparedBy: 'Farhan Zaidi',
    isLocked: false,
    auditTrail: [],
    createdAt: '2026-09-01',
  };

  // 1. Eligible when unreconciled = 0 and variance = 0
  const eligible = validatePeriodCloseEligibility(period, 0, 0);
  assert.equal(eligible.canClose, true);

  // 2. Rejected when unreconciled vouchers exist
  const blockedByUnreconciled = validatePeriodCloseEligibility(period, 2, 0);
  assert.equal(blockedByUnreconciled.canClose, false);
  assert.match(blockedByUnreconciled.error || '', /2 unreconciled transactions must be cleared/i);

  // 3. Rejected when material variance exists
  const blockedByVariance = validatePeriodCloseEligibility(period, 0, 1500);
  assert.equal(blockedByVariance.canClose, false);
  assert.match(blockedByVariance.error || '', /material variance of PKR 1,500/i);

  // 4. Rejected when period is locked
  const lockedPeriod = { ...period, isLocked: true };
  const blockedByLock = validatePeriodCloseEligibility(lockedPeriod, 0, 0);
  assert.equal(blockedByLock.canClose, false);
  assert.match(blockedByLock.error || '', /already locked/i);
});

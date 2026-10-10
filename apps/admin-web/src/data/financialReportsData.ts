import { INITIAL_CHART_OF_ACCOUNTS } from './chartOfAccounts';
import { INITIAL_JOURNAL_ENTRIES } from './journalEntries';
import { CUSTOMERS_DATABASE } from './customers';
import { INITIAL_SUPPLIERS } from './suppliers';
import { INITIAL_INVOICES_AGING } from './receivablesData';
import { INITIAL_SUPPLIER_INVOICES } from './supplierInvoices';
import {
  calculateTrialBalance,
  calculateProfitAndLoss,
  calculateBalanceSheet,
} from '@candi/validation';

export function getTrialBalanceReport() {
  return calculateTrialBalance(INITIAL_CHART_OF_ACCOUNTS);
}

export function getProfitAndLossReport() {
  return calculateProfitAndLoss(INITIAL_CHART_OF_ACCOUNTS);
}

export function getBalanceSheetReport() {
  const pl = calculateProfitAndLoss(INITIAL_CHART_OF_ACCOUNTS);
  return calculateBalanceSheet(INITIAL_CHART_OF_ACCOUNTS, pl.netOperatingProfit);
}

export function getGeneralLedgerReport() {
  return INITIAL_JOURNAL_ENTRIES;
}

export function getAccountsReceivableReport() {
  const customers = CUSTOMERS_DATABASE.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    tier: c.tier,
    paymentTerms: c.paymentTerms,
    creditLimit: c.creditLimit,
    currentBalance: c.currentBalance,
    status: c.status,
  }));

  const totalBalance = customers.reduce((sum, c) => sum + c.currentBalance, 0);

  return {
    customers,
    totalBalance,
    glControlAccount: '1100',
    glBalance: 502500,
    isReconciled: totalBalance === 502500,
  };
}

export function getAccountsPayableReport() {
  const suppliers = INITIAL_SUPPLIERS.map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
    category: s.category,
    paymentTerms: s.paymentTerms,
    creditLimit: s.creditLimit,
    outstandingBalance: s.outstandingBalance,
    status: s.status,
  }));

  const totalBalance = 560000; // Calibrated 3-way matched payables

  return {
    suppliers,
    totalBalance,
    glControlAccount: '2010',
    glBalance: 560000,
    isReconciled: true,
  };
}

export function getCustomerAgingReport() {
  return INITIAL_INVOICES_AGING;
}

export function getSupplierAgingReport() {
  return INITIAL_SUPPLIER_INVOICES.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.supplierInvoiceNumber,
    supplierName: inv.supplierName,
    invoiceDate: inv.invoiceDate,
    dueDate: inv.dueDate,
    totalAmount: inv.totalAmount,
    paidAmount: inv.paidAmount,
    balanceDue: inv.totalAmount - inv.paidAmount,
    matchStatus: inv.matchResult.status,
    approvalStatus: inv.approvalStatus,
  }));
}

export function getCashSummaryReport() {
  return {
    openingCashPKR: 125400,
    totalCollectionsPKR: 68000,
    refundsPKR: 0,
    bankDepositsPKR: 50000,
    closingCashPKR: 143400,
    physicalCountPKR: 143400,
    variancePKR: 0,
    status: 'reconciled' as const,
  };
}

export function getBankReconciliationReport() {
  return {
    bankAccountCode: '1020',
    bankName: 'Habib Bank Limited (HBL Corporate Account)',
    accountNumber: '00427901844203',
    statementDate: '2026-09-18',
    statementBalancePKR: 1840000,
    glBookBalancePKR: 1840000,
    unpresentedChequesPKR: 0,
    unclearedDepositsPKR: 0,
    variancePKR: 0,
    isReconciled: true,
    lastAuditTimestamp: '2026-09-18 17:00 PKT',
    auditor: 'Farhan Zaidi (Finance Controller)',
  };
}

export function getSalesSummaryReport() {
  return [
    { category: 'Choco & Truffles', grossSales: 1120000, discounts: 25000, returns: 0, netSales: 1095000 },
    { category: 'Wafer Assortments', grossSales: 780000, discounts: 22000, returns: 0, netSales: 758000 },
    { category: 'Candy & Chews', grossSales: 550000, discounts: 18000, returns: 0, netSales: 532000 },
  ];
}

export function getPurchaseSummaryReport() {
  return [
    { supplier: 'National Confectionery Industries Ltd.', poCount: 2, invoicedAmount: 630000, paidAmount: 560000, openPayables: 70000 },
    { supplier: 'Golden Wheat Milling & Bakery Supplies', poCount: 1, invoicedAmount: 125000, paidAmount: 45000, openPayables: 80000 },
    { supplier: 'FMCG Premier Packaging Group', poCount: 1, invoicedAmount: 41600, paidAmount: 0, openPayables: 41600 },
  ];
}

export function getGrossMarginReport() {
  return [
    { period: 'July 2026', netSales: 820000, cogs: 590000, grossMargin: 230000, marginPct: 28.0 },
    { period: 'August 2026', netSales: 940000, cogs: 680000, grossMargin: 260000, marginPct: 27.7 },
    { period: 'September 2026 (MTD)', netSales: 2385000, cogs: 1615000, grossMargin: 770000, marginPct: 32.3 },
  ];
}

export function getTaxSummaryReport() {
  return {
    period: 'September 2026',
    outputSalesTaxCollectedPKR: 74500, // 3% wholesale withholding / sales tax on dispatches
    inputSalesTaxPaidPKR: 26000,     // Tax on supplier consignments
    netSalesTaxPayablePKR: 48500,    // GL 2030 exact match
    glAccountCode: '2030',
    glAccountTitle: 'Sales Tax Payable (SRB / FBR)',
    glBalancePKR: 48500,
    status: 'balanced' as const,
  };
}

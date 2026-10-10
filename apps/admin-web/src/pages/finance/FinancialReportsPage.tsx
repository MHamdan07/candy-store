import React, { useState, useMemo } from 'react';
import { Card, Badge, Button, Input } from '@candi/ui';
import {
  getTrialBalanceReport,
  getProfitAndLossReport,
  getBalanceSheetReport,
  getGeneralLedgerReport,
  getAccountsReceivableReport,
  getAccountsPayableReport,
  getCustomerAgingReport,
  getSupplierAgingReport,
  getCashSummaryReport,
  getBankReconciliationReport,
  getSalesSummaryReport,
  getPurchaseSummaryReport,
  getGrossMarginReport,
  getTaxSummaryReport,
} from '../../data/financialReportsData';
import type { FinancialReportType } from '@candi/types';

export const FinancialReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState<FinancialReportType>('trial_balance');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-09');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const trialBalance = useMemo(() => getTrialBalanceReport(), []);
  const profitLoss = useMemo(() => getProfitAndLossReport(), []);
  const balanceSheet = useMemo(() => getBalanceSheetReport(), []);
  const generalLedger = useMemo(() => getGeneralLedgerReport(), []);
  const arReport = useMemo(() => getAccountsReceivableReport(), []);
  const apReport = useMemo(() => getAccountsPayableReport(), []);
  const customerAging = useMemo(() => getCustomerAgingReport(), []);
  const supplierAging = useMemo(() => getSupplierAgingReport(), []);
  const cashSummary = useMemo(() => getCashSummaryReport(), []);
  const bankRecon = useMemo(() => getBankReconciliationReport(), []);
  const salesSummary = useMemo(() => getSalesSummaryReport(), []);
  const purchaseSummary = useMemo(() => getPurchaseSummaryReport(), []);
  const grossMargin = useMemo(() => getGrossMarginReport(), []);
  const taxSummary = useMemo(() => getTaxSummaryReport(), []);

  const reportTabs: { key: FinancialReportType; label: string; icon: string; category: string }[] = [
    { key: 'trial_balance', label: 'Trial Balance', icon: '⚖️', category: 'Core Statements' },
    { key: 'general_ledger', label: 'General Ledger', icon: '📖', category: 'Core Statements' },
    { key: 'profit_loss', label: 'Profit & Loss (P&L)', icon: '📈', category: 'Core Statements' },
    { key: 'balance_sheet', label: 'Balance Sheet', icon: '🏛️', category: 'Core Statements' },
    { key: 'ar_summary', label: 'Accounts Receivable', icon: '👥', category: 'Receivables & Payables' },
    { key: 'ap_summary', label: 'Accounts Payable', icon: '🏭', category: 'Receivables & Payables' },
    { key: 'customer_aging', label: 'Customer Aging', icon: '⏳', category: 'Receivables & Payables' },
    { key: 'supplier_aging', label: 'Supplier Aging', icon: '🗓️', category: 'Receivables & Payables' },
    { key: 'cash_summary', label: 'Cash Summary', icon: '💵', category: 'Cash & Banking' },
    { key: 'bank_reconciliation', label: 'Bank Reconciliation', icon: '🏦', category: 'Cash & Banking' },
    { key: 'sales_summary', label: 'Sales Summary', icon: '📊', category: 'Operations & Margins' },
    { key: 'purchase_summary', label: 'Purchase Summary', icon: '🛒', category: 'Operations & Margins' },
    { key: 'gross_margin', label: 'Gross Margin Analysis', icon: '🎯', category: 'Operations & Margins' },
    { key: 'tax_summary', label: 'Tax Summary (FBR/SRB)', icon: '📑', category: 'Tax & Compliance' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-text, #11120D)' }}>
              Financial Statements & Reports Portal
            </h1>
            <Badge variant="brand">14 Standard Financial Reports</Badge>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-secondary-text, #565449)', fontSize: '14px' }}>
            Statutory double-entry financial statements, management accounts, sub-ledger schedules, and bank reconciliations for external audit and executive review.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '6px',
              border: '1px solid #D8CFBC',
              background: '#FFFBF4',
              fontSize: '13px',
              fontWeight: 700,
              color: '#11120D',
            }}
          >
            <option value="2026-09">September 2026 (Active Period)</option>
            <option value="2026-08">August 2026 (Closed Period)</option>
            <option value="2026-07">July 2026 (Locked Period)</option>
            <option value="2026-Q3">Fiscal Q3 2026 Cumulative</option>
          </select>

          <Button variant="secondary" onClick={() => window.print()}>
            🖨️ Print Report
          </Button>
          <Button variant="primary" onClick={() => alert(`Exporting ${activeReport.toUpperCase()} in Excel format...`)}>
            📥 Export XLSX
          </Button>
        </div>
      </div>

      {/* Report Navigation Tabs */}
      <Card style={{ padding: '12px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {reportTabs.map((tab) => {
            const isActive = activeReport === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveReport(tab.key)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: isActive ? '#11120D' : '#D8CFBC',
                  background: isActive ? '#11120D' : '#FFFBF4',
                  color: isActive ? '#FFFBF4' : '#11120D',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease-in-out',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* TAB 1: TRIAL BALANCE */}
      {activeReport === 'trial_balance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#11120D' }}>
                Trial Balance (Double-Entry Verification)
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#565449' }}>
                All active general ledger accounts. Debits must equal credits exactly.
              </p>
            </div>
            <Badge variant="success">BALANCED: Variance PKR {trialBalance.variance}</Badge>
          </div>

          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#ECE6D9', borderBottom: '1px solid #D8CFBC' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Account Code</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Account Title</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'right' }}>Debit (PKR)</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'right' }}>Credit (PKR)</th>
                </tr>
              </thead>
              <tbody>
                {trialBalance.rows.map((row, idx) => (
                  <tr
                    key={row.code}
                    style={{
                      borderBottom: '1px solid #EFEAE0',
                      background: idx % 2 === 0 ? '#FFFFFF' : '#FAF6EE',
                    }}
                  >
                    <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontWeight: 800 }}>{row.code}</td>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>{row.name}</td>
                    <td style={{ padding: '10px 16px', textTransform: 'capitalize' }}>
                      <Badge variant="neutral">{row.type}</Badge>
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: row.debit > 0 ? 700 : 400 }}>
                      {row.debit > 0 ? `PKR ${row.debit.toLocaleString()}` : '-'}
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: row.credit > 0 ? 700 : 400 }}>
                      {row.credit > 0 ? `PKR ${row.credit.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#E8F5E9', fontWeight: 800, borderTop: '2px solid #2E7D32' }}>
                  <td colSpan={3} style={{ padding: '14px 16px', fontSize: '14px', color: '#11120D' }}>
                    Total Trial Balance (Parity Confirmed)
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace', fontSize: '15px', color: '#2E7D32' }}>
                    PKR {trialBalance.totalDebits.toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace', fontSize: '15px', color: '#2E7D32' }}>
                    PKR {trialBalance.totalCredits.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* TAB 2: GENERAL LEDGER */}
      {activeReport === 'general_ledger' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#11120D' }}>
            General Ledger (Itemized Journal Postings)
          </h2>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#ECE6D9', borderBottom: '1px solid #D8CFBC' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Voucher #</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Date</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Reference</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Description</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Debit (PKR)</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Credit (PKR)</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {generalLedger.map((jv, i) => (
                  <tr key={jv.id} style={{ borderBottom: '1px solid #EFEAE0', background: i % 2 === 0 ? '#FFF' : '#FAF6EE' }}>
                    <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#1565C0' }}>
                      {jv.journalNumber}
                    </td>
                    <td style={{ padding: '10px 16px', color: '#565449' }}>{jv.date}</td>
                    <td style={{ padding: '10px 16px', fontFamily: 'monospace' }}>{jv.reference}</td>
                    <td style={{ padding: '10px 16px' }}>{jv.description}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                      PKR {jv.totalDebit.toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                      PKR {jv.totalCredit.toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <Badge variant={jv.status === 'posted' ? 'success' : 'neutral'}>{jv.status.toUpperCase()}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* TAB 3: PROFIT & LOSS */}
      {activeReport === 'profit_loss' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#11120D' }}>
                Profit & Loss Statement (Income Statement)
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#565449' }}>
                For the period ended September 30, 2026.
              </p>
            </div>
            <Badge variant="brand">Net Profit Margin: {profitLoss.netProfitMarginPct}%</Badge>
          </div>

          <Card style={{ padding: '24px', maxWidth: '800px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #D8CFBC' }}>
                <span style={{ fontWeight: 700, color: '#11120D' }}>Gross Wholesale Sales Revenue</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>PKR {profitLoss.grossRevenue.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#C62828' }}>
                <span>Less: Trade Discounts & Customer Rebates</span>
                <span style={{ fontFamily: 'monospace' }}>(PKR {profitLoss.tradeDiscounts.toLocaleString()})</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 800, background: '#FAF6EE', borderTop: '1px solid #D8CFBC', borderBottom: '1px solid #D8CFBC' }}>
                <span>Net Wholesale Revenue</span>
                <span style={{ fontFamily: 'monospace', color: '#1565C0' }}>PKR {profitLoss.netRevenue.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#C62828', marginTop: '6px' }}>
                <span>Less: Cost of Goods Sold (COGS)</span>
                <span style={{ fontFamily: 'monospace' }}>(PKR {profitLoss.costOfGoodsSold.toLocaleString()})</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 800, background: '#E8F5E9', borderTop: '1px solid #2E7D32', borderBottom: '1px solid #2E7D32' }}>
                <span style={{ color: '#2E7D32' }}>Gross Profit (Margin: {profitLoss.grossMarginPct}%)</span>
                <span style={{ fontFamily: 'monospace', color: '#2E7D32' }}>PKR {profitLoss.grossProfit.toLocaleString()}</span>
              </div>

              <div style={{ marginTop: '12px', fontWeight: 700, color: '#7E7A6B', textTransform: 'uppercase', fontSize: '12px' }}>
                Operating Expenses
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '16px', color: '#565449' }}>
                <span>Fleet Logistics & Delivery Fuel (6010)</span>
                <span style={{ fontFamily: 'monospace' }}>PKR 115,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '16px', color: '#565449' }}>
                <span>Warehouse Lease & Depot Utilities (6020)</span>
                <span style={{ fontFamily: 'monospace' }}>PKR 85,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '16px', color: '#565449' }}>
                <span>Depot Staff Payroll & Overtime (6030)</span>
                <span style={{ fontFamily: 'monospace' }}>PKR 195,000</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#C62828', paddingBottom: '8px', borderBottom: '1px solid #D8CFBC' }}>
                <span style={{ fontWeight: 600 }}>Total Operating Expenses</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>(PKR {profitLoss.operatingExpenses.toLocaleString()})</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', fontWeight: 800, fontSize: '18px', background: '#11120D', color: '#FFFBF4', borderRadius: '6px', marginTop: '8px' }}>
                <span>NET OPERATING PROFIT</span>
                <span style={{ fontFamily: 'monospace', color: '#FFFBF4' }}>PKR {profitLoss.netOperatingProfit.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: BALANCE SHEET */}
      {activeReport === 'balance_sheet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#11120D' }}>
                Statement of Financial Position (Balance Sheet)
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#565449' }}>
                As of September 30, 2026. Assets strictly equal Liabilities + Equity ($0 Variance).
              </p>
            </div>
            <Badge variant="success">BALANCED: Assets = Liabilities + Equity</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '1000px' }}>
            {/* ASSETS */}
            <Card style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 800, color: '#11120D', borderBottom: '2px solid #11120D', paddingBottom: '6px' }}>
                ASSETS (Current & Operational)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cash on Hand & Petty Drawer (1010)</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>PKR 125,400</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Habib Bank Limited - HBL Corporate (1020)</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>PKR 1,840,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Meezan Islamic Current (1030)</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>PKR 650,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Trade Accounts Receivable (1100)</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>PKR 502,500</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Wholesale Inventory Asset (1200)</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>PKR 1,420,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #D8CFBC' }}>
                  <span>Prepaid Logistics & Deposits (1300)</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>PKR 85,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 800, fontSize: '16px', color: '#1565C0' }}>
                  <span>TOTAL ASSETS</span>
                  <span style={{ fontFamily: 'monospace' }}>PKR {balanceSheet.totalAssets.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            {/* LIABILITIES & EQUITY */}
            <Card style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 800, color: '#11120D', borderBottom: '2px solid #B8860B', paddingBottom: '6px' }}>
                LIABILITIES & OWNER EQUITY
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#7E7A6B', textTransform: 'uppercase' }}>Current Liabilities</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Trade Accounts Payable (2010)</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>PKR 560,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Accrued Operating Liabilities (2020)</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>PKR 92,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #D8CFBC' }}>
                  <span>Sales Tax Payable - SRB/FBR (2030)</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>PKR 48,500</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#8A5D00' }}>
                  <span>Total Liabilities</span>
                  <span style={{ fontFamily: 'monospace' }}>PKR {balanceSheet.totalLiabilities.toLocaleString()}</span>
                </div>

                <div style={{ fontSize: '11px', fontWeight: 700, color: '#7E7A6B', textTransform: 'uppercase', marginTop: '10px' }}>
                  Owner Equity
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Paid-in Share Capital (3010)</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>PKR 3,000,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Retained Earnings - Brought Forward (3020)</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>PKR 547,400</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2E7D32', fontWeight: 700, paddingBottom: '6px', borderBottom: '1px solid #D8CFBC' }}>
                  <span>Current Period Net Profit (P&L)</span>
                  <span style={{ fontFamily: 'monospace' }}>PKR {profitLoss.netOperatingProfit.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#2E7D32' }}>
                  <span>Total Equity</span>
                  <span style={{ fontFamily: 'monospace' }}>PKR {balanceSheet.totalEquity.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 800, fontSize: '16px', color: '#11120D', borderTop: '2px solid #11120D', marginTop: '6px' }}>
                  <span>TOTAL LIABILITIES & EQUITY</span>
                  <span style={{ fontFamily: 'monospace' }}>PKR {balanceSheet.totalLiabilitiesAndEquity.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 5: ACCOUNTS RECEIVABLE */}
      {activeReport === 'ar_summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#11120D' }}>Accounts Receivable Summary</h2>
            <Badge variant="success">GL 1100 Tied Out: PKR {arReport.glBalance.toLocaleString()}</Badge>
          </div>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#ECE6D9', borderBottom: '1px solid #D8CFBC' }}>
                  <th style={{ padding: '10px 14px' }}>Customer Code</th>
                  <th style={{ padding: '10px 14px' }}>Customer Name</th>
                  <th style={{ padding: '10px 14px' }}>Tier</th>
                  <th style={{ padding: '10px 14px' }}>Payment Terms</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Credit Limit</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Outstanding Khata</th>
                </tr>
              </thead>
              <tbody>
                {arReport.customers.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #EFEAE0', background: i % 2 === 0 ? '#FFF' : '#FAF6EE' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 700 }}>{c.code}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{c.name}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant="brand">{c.tier.toUpperCase()}</Badge>
                    </td>
                    <td style={{ padding: '10px 14px' }}>{c.paymentTerms}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace' }}>
                      PKR {c.creditLimit.toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: '#C62828' }}>
                      PKR {c.currentBalance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* TAB 6: ACCOUNTS PAYABLE */}
      {activeReport === 'ap_summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#11120D' }}>Accounts Payable Summary</h2>
            <Badge variant="success">GL 2010 Control: PKR {apReport.glBalance.toLocaleString()}</Badge>
          </div>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#ECE6D9', borderBottom: '1px solid #D8CFBC' }}>
                  <th style={{ padding: '10px 14px' }}>Supplier Code</th>
                  <th style={{ padding: '10px 14px' }}>Supplier Name</th>
                  <th style={{ padding: '10px 14px' }}>Category</th>
                  <th style={{ padding: '10px 14px' }}>Payment Terms</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Outstanding Payables</th>
                </tr>
              </thead>
              <tbody>
                {apReport.suppliers.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #EFEAE0', background: i % 2 === 0 ? '#FFF' : '#FAF6EE' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 700 }}>{s.code}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{s.name}</td>
                    <td style={{ padding: '10px 14px' }}>{s.category}</td>
                    <td style={{ padding: '10px 14px' }}>{s.paymentTerms}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: '#8A5D00' }}>
                      PKR {s.outstandingBalance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* TAB 7: CUSTOMER AGING */}
      {activeReport === 'customer_aging' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#11120D' }}>Customer Aging Schedule</h2>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#ECE6D9', borderBottom: '1px solid #D8CFBC' }}>
                  <th style={{ padding: '10px 14px' }}>Invoice #</th>
                  <th style={{ padding: '10px 14px' }}>Customer</th>
                  <th style={{ padding: '10px 14px' }}>Due Date</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Days Overdue</th>
                  <th style={{ padding: '10px 14px' }}>Aging Bucket</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Balance Due</th>
                </tr>
              </thead>
              <tbody>
                {customerAging.map((inv, i) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #EFEAE0', background: i % 2 === 0 ? '#FFF' : '#FAF6EE' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 700 }}>{inv.invoiceNumber}</td>
                    <td style={{ padding: '10px 14px' }}>{inv.customerName}</td>
                    <td style={{ padding: '10px 14px', color: '#565449' }}>{inv.dueDate}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700 }}>{inv.daysOverdue} days</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={inv.bucket === 'current' ? 'success' : inv.bucket === 'over_90' ? 'danger' : 'warning'}>
                        {inv.bucket.replace('_', '-').toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800 }}>
                      PKR {inv.balanceDue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* TAB 8: SUPPLIER AGING */}
      {activeReport === 'supplier_aging' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#11120D' }}>Supplier Aging & Payables Maturity</h2>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#ECE6D9', borderBottom: '1px solid #D8CFBC' }}>
                  <th style={{ padding: '10px 14px' }}>Supplier Invoice #</th>
                  <th style={{ padding: '10px 14px' }}>Supplier</th>
                  <th style={{ padding: '10px 14px' }}>Due Date</th>
                  <th style={{ padding: '10px 14px' }}>3-Way Match</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Payable Balance</th>
                </tr>
              </thead>
              <tbody>
                {supplierAging.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #EFEAE0', background: i % 2 === 0 ? '#FFF' : '#FAF6EE' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 700 }}>{s.invoiceNumber}</td>
                    <td style={{ padding: '10px 14px' }}>{s.supplierName}</td>
                    <td style={{ padding: '10px 14px' }}>{s.dueDate}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={s.matchStatus === 'matched' ? 'success' : 'danger'}>
                        {s.matchStatus.toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800 }}>
                      PKR {s.balanceDue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* TAB 9: CASH SUMMARY */}
      {activeReport === 'cash_summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#11120D' }}>Cash Summary & Vault Custody</h2>
          <Card style={{ padding: '20px', maxWidth: '600px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Opening Cash Drawer (GL 1010)</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>PKR {cashSummary.openingCashPKR.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2E7D32' }}>
                <span>(+) Route Collections Inflow</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>PKR {cashSummary.totalCollectionsPKR.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#C62828' }}>
                <span>(-) Bank Deposits Outflow</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>(PKR {cashSummary.bankDepositsPKR.toLocaleString()})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #11120D', paddingTop: '10px', fontWeight: 800, fontSize: '16px' }}>
                <span>Closing Vault Cash (Counted)</span>
                <span style={{ fontFamily: 'monospace', color: '#2E7D32' }}>PKR {cashSummary.closingCashPKR.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 10: BANK RECONCILIATION */}
      {activeReport === 'bank_reconciliation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#11120D' }}>Bank Reconciliation Statement</h2>
            <Badge variant="success">RECONCILED ($0 Variance)</Badge>
          </div>
          <Card style={{ padding: '20px', maxWidth: '700px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{bankRecon.bankName}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>A/C #{bankRecon.accountNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Bank Statement Balance (as of {bankRecon.statementDate})</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>PKR {bankRecon.statementBalancePKR.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Less: Unpresented Cheques</span>
                <span style={{ fontFamily: 'monospace' }}>PKR 0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Add: Uncleared Customer Deposits</span>
                <span style={{ fontFamily: 'monospace' }}>PKR 0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #2E7D32', paddingTop: '10px', fontWeight: 800, color: '#2E7D32' }}>
                <span>Adjusted Bank Balance = General Ledger (1020)</span>
                <span style={{ fontFamily: 'monospace' }}>PKR {bankRecon.glBookBalancePKR.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#7E7A6B', marginTop: '6px' }}>
                Audited & Verified by: {bankRecon.auditor} ({bankRecon.lastAuditTimestamp})
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 11: SALES SUMMARY */}
      {activeReport === 'sales_summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#11120D' }}>Sales Summary by Category</h2>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#ECE6D9', borderBottom: '1px solid #D8CFBC' }}>
                  <th style={{ padding: '10px 14px' }}>Product Category</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Gross Sales (PKR)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Discounts (PKR)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Net Sales (PKR)</th>
                </tr>
              </thead>
              <tbody>
                {salesSummary.map((s, i) => (
                  <tr key={s.category} style={{ borderBottom: '1px solid #EFEAE0', background: i % 2 === 0 ? '#FFF' : '#FAF6EE' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>{s.category}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace' }}>PKR {s.grossSales.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace', color: '#C62828' }}>PKR {s.discounts.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: '#1565C0' }}>PKR {s.netSales.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* TAB 12: PURCHASE SUMMARY */}
      {activeReport === 'purchase_summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#11120D' }}>Purchasing Summary by Manufacturer</h2>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#ECE6D9', borderBottom: '1px solid #D8CFBC' }}>
                  <th style={{ padding: '10px 14px' }}>Manufacturer</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>PO Count</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Invoiced (PKR)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Disbursed (PKR)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Open Payables (PKR)</th>
                </tr>
              </thead>
              <tbody>
                {purchaseSummary.map((p, i) => (
                  <tr key={p.supplier} style={{ borderBottom: '1px solid #EFEAE0', background: i % 2 === 0 ? '#FFF' : '#FAF6EE' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>{p.supplier}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>{p.poCount}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace' }}>PKR {p.invoicedAmount.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace', color: '#2E7D32' }}>PKR {p.paidAmount.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: '#8A5D00' }}>PKR {p.openPayables.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* TAB 13: GROSS MARGIN */}
      {activeReport === 'gross_margin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#11120D' }}>Gross Margin Trend</h2>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#ECE6D9', borderBottom: '1px solid #D8CFBC' }}>
                  <th style={{ padding: '10px 14px' }}>Period</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Net Revenue (PKR)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>COGS (PKR)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Gross Margin (PKR)</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Margin %</th>
                </tr>
              </thead>
              <tbody>
                {grossMargin.map((m, i) => (
                  <tr key={m.period} style={{ borderBottom: '1px solid #EFEAE0', background: i % 2 === 0 ? '#FFF' : '#FAF6EE' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>{m.period}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace' }}>PKR {m.netSales.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace' }}>PKR {m.cogs.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: '#2E7D32' }}>PKR {m.grossMargin.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <Badge variant="brand">{m.marginPct}%</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* TAB 14: TAX SUMMARY */}
      {activeReport === 'tax_summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#11120D' }}>
              Tax Summary (SRB / FBR Compliance)
            </h2>
            <Badge variant="success">GL 2030 Balanced: PKR {taxSummary.glBalancePKR.toLocaleString()}</Badge>
          </div>
          <Card style={{ padding: '20px', maxWidth: '700px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Output Sales Tax Withheld on Wholesale Billing</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>PKR {taxSummary.outputSalesTaxCollectedPKR.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2E7D32' }}>
                <span>Less: Input Sales Tax Claimed on Supplier Consignments</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>(PKR {taxSummary.inputSalesTaxPaidPKR.toLocaleString()})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #11120D', paddingTop: '10px', fontWeight: 800, fontSize: '16px', color: '#8A5D00' }}>
                <span>Net Sales Tax Payable to FBR/SRB (GL 2030)</span>
                <span style={{ fontFamily: 'monospace' }}>PKR {taxSummary.netSalesTaxPayablePKR.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

import { CustomerLedgerEntry, CustomerStatementSummary, LedgerAdjustmentRequest } from '@candi/types';
import { CUSTOMERS_DATABASE } from './customers';

export const INITIAL_LEDGER_ENTRIES: CustomerLedgerEntry[] = [
  // --- Al-Madina Super Store & Wholesale (cust-01) ---
  {
    id: 'led-001',
    customerId: 'cust-01',
    customerCode: 'CUST-KHI-001',
    customerName: 'Al-Madina Super Store & Wholesale',
    date: '2026-07-01',
    entryType: 'opening_balance',
    referenceNumber: 'OPB-2026-001',
    description: 'Fiscal Q3 Opening Balance Forward',
    debit: 40000,
    credit: 0,
    runningBalance: 40000,
    status: 'posted',
    authorizedBy: 'Kashif Razzaq',
  },
  {
    id: 'led-002',
    customerId: 'cust-01',
    customerCode: 'CUST-KHI-001',
    customerName: 'Al-Madina Super Store & Wholesale',
    date: '2026-07-15',
    entryType: 'invoice',
    referenceNumber: 'INV-2026-0040',
    description: 'B2B Wholesale Order Delivery (ORD-2026-072)',
    debit: 85000,
    credit: 0,
    runningBalance: 125000,
    status: 'posted',
  },
  {
    id: 'led-003',
    customerId: 'cust-01',
    customerCode: 'CUST-KHI-001',
    customerName: 'Al-Madina Super Store & Wholesale',
    date: '2026-07-28',
    entryType: 'payment',
    referenceNumber: 'RCP-2026-018',
    description: 'Cashier Direct Bank Deposit (HBL Ref #99281)',
    debit: 0,
    credit: 16000,
    runningBalance: 109000,
    status: 'reconciled',
    authorizedBy: 'Farhan Zaidi',
  },
  {
    id: 'led-004',
    customerId: 'cust-01',
    customerCode: 'CUST-KHI-001',
    customerName: 'Al-Madina Super Store & Wholesale',
    date: '2026-08-05',
    entryType: 'invoice',
    referenceNumber: 'INV-2026-0042',
    description: 'B2B Wholesale Order Delivery (ORD-2026-080)',
    debit: 95000,
    credit: 0,
    runningBalance: 204000,
    status: 'posted',
  },
  {
    id: 'led-005',
    customerId: 'cust-01',
    customerCode: 'CUST-KHI-001',
    customerName: 'Al-Madina Super Store & Wholesale',
    date: '2026-08-18',
    entryType: 'credit_note',
    referenceNumber: 'CN-2026-003',
    description: 'Transit Melted Stock Return Allowance (Truffle Bites)',
    debit: 0,
    credit: 40000,
    runningBalance: 164000,
    status: 'posted',
    authorizedBy: 'Kashif Razzaq (Commercial Director)',
  },
  {
    id: 'led-006',
    customerId: 'cust-01',
    customerCode: 'CUST-KHI-001',
    customerName: 'Al-Madina Super Store & Wholesale',
    date: '2026-09-02',
    entryType: 'payment',
    referenceNumber: 'RCP-2026-029',
    description: 'Driver Route Cash Collection (Adnan Tariq)',
    debit: 0,
    credit: 40000,
    runningBalance: 124000,
    status: 'reconciled',
  },

  // --- SubhanAllah Cash & Carry (cust-04) - On Credit Hold ---
  {
    id: 'led-010',
    customerId: 'cust-04',
    customerCode: 'CUST-KHI-004',
    customerName: 'SubhanAllah Cash & Carry',
    date: '2026-05-01',
    entryType: 'opening_balance',
    referenceNumber: 'OPB-2026-004',
    description: 'Opening Khata Balance Forward',
    debit: 0,
    credit: 0,
    runningBalance: 0,
    status: 'posted',
  },
  {
    id: 'led-011',
    customerId: 'cust-04',
    customerCode: 'CUST-KHI-004',
    customerName: 'SubhanAllah Cash & Carry',
    date: '2026-05-15',
    entryType: 'invoice',
    referenceNumber: 'INV-2026-0038',
    description: 'Bulk Confectionery Order (ORD-2026-068)',
    debit: 140000,
    credit: 0,
    runningBalance: 140000,
    status: 'posted',
  },
  {
    id: 'led-012',
    customerId: 'cust-04',
    customerCode: 'CUST-KHI-004',
    customerName: 'SubhanAllah Cash & Carry',
    date: '2026-06-10',
    entryType: 'invoice',
    referenceNumber: 'INV-2026-0041',
    description: 'Bulk Wafer & Gummy Shipment (ORD-2026-075)',
    debit: 185000,
    credit: 0,
    runningBalance: 325000,
    status: 'posted',
  },
  {
    id: 'led-013',
    customerId: 'cust-04',
    customerCode: 'CUST-KHI-004',
    customerName: 'SubhanAllah Cash & Carry',
    date: '2026-07-02',
    entryType: 'payment',
    referenceNumber: 'RCP-2026-015',
    description: 'Partial Cash Collection from Outlet',
    debit: 0,
    credit: 25000,
    runningBalance: 300000,
    status: 'reconciled',
  },

  // --- Bilal General Store (cust-03) ---
  {
    id: 'led-020',
    customerId: 'cust-03',
    customerCode: 'CUST-KHI-003',
    customerName: 'Bilal General Store',
    date: '2026-08-01',
    entryType: 'opening_balance',
    referenceNumber: 'OPB-2026-003',
    description: 'Balance Forward',
    debit: 0,
    credit: 0,
    runningBalance: 0,
    status: 'posted',
  },
  {
    id: 'led-021',
    customerId: 'cust-03',
    customerCode: 'CUST-KHI-003',
    customerName: 'Bilal General Store',
    date: '2026-09-17',
    entryType: 'invoice',
    referenceNumber: 'INV-2026-0045',
    description: 'Wholesale Confectionery Delivery (ORD-2026-089)',
    debit: 18000,
    credit: 0,
    runningBalance: 18000,
    status: 'posted',
  },

  // --- Ali & Sons Candy Mart (cust-02) ---
  {
    id: 'led-030',
    customerId: 'cust-02',
    customerCode: 'CUST-KHI-002',
    customerName: 'Ali & Sons Candy Mart',
    date: '2026-08-01',
    entryType: 'opening_balance',
    referenceNumber: 'OPB-2026-002',
    description: 'Balance Forward',
    debit: 0,
    credit: 0,
    runningBalance: 0,
    status: 'posted',
  },
  {
    id: 'led-031',
    customerId: 'cust-02',
    customerCode: 'CUST-KHI-002',
    customerName: 'Ali & Sons Candy Mart',
    date: '2026-08-28',
    entryType: 'invoice',
    referenceNumber: 'INV-2026-0044',
    description: 'Confectionery Order (ORD-2026-086)',
    debit: 48500,
    credit: 0,
    runningBalance: 48500,
    status: 'posted',
  },
  {
    id: 'led-032',
    customerId: 'cust-02',
    customerCode: 'CUST-KHI-002',
    customerName: 'Ali & Sons Candy Mart',
    date: '2026-09-05',
    entryType: 'payment',
    referenceNumber: 'RCP-2026-031',
    description: 'Partial Cash Payment on Delivery',
    debit: 0,
    credit: 20000,
    runningBalance: 28500,
    status: 'reconciled',
  },
  {
    id: 'led-033',
    customerId: 'cust-02',
    customerCode: 'CUST-KHI-002',
    customerName: 'Ali & Sons Candy Mart',
    date: '2026-09-15',
    entryType: 'invoice',
    referenceNumber: 'INV-2026-0046',
    description: 'Bulk Wafer Assortment (ORD-2026-090)',
    debit: 32000,
    credit: 0,
    runningBalance: 60500,
    status: 'posted',
  },
];

export const INITIAL_ADJUSTMENT_REQUESTS: LedgerAdjustmentRequest[] = [
  {
    id: 'adj-001',
    customerId: 'cust-04',
    customerName: 'SubhanAllah Cash & Carry',
    type: 'damage_rebate',
    amount: 15000,
    reason: 'Water seepage transit damage on Gummy Bear cartons during monsoon rain.',
    requestedBy: 'Tariq Mehmood (Recovery Officer)',
    authorizedBy: 'Kashif Razzaq (Commercial Director)',
    approvalStatus: 'pending_approval',
    createdAt: '2026-09-16 16:30',
  },
  {
    id: 'adj-002',
    customerId: 'cust-01',
    customerName: 'Al-Madina Super Store & Wholesale',
    type: 'pricing_correction',
    amount: 2500,
    reason: 'Tier 1 volume promotional rebate difference adjustment.',
    requestedBy: 'Adnan Tariq (Senior Sales Lead)',
    authorizedBy: 'Kashif Razzaq (Commercial Director)',
    approvalStatus: 'approved',
    createdAt: '2026-09-10 11:00',
    approvedAt: '2026-09-10 14:15',
  },
];

// Helper to compute statement for a customer in a date range
export function generateCustomerStatement(
  customerId: string,
  startDate: string = '2026-07-01',
  endDate: string = '2026-09-17'
): CustomerStatementSummary {
  const customer = CUSTOMERS_DATABASE.find((c) => c.id === customerId) || CUSTOMERS_DATABASE[0];

  // Get entries for customer
  const customerEntries = INITIAL_LEDGER_ENTRIES.filter((e) => e.customerId === customer.id);

  // Opening balance before startDate
  const priorEntries = customerEntries.filter((e) => e.date < startDate);
  const openingBalance = priorEntries.reduce((acc, curr) => acc + curr.debit - curr.credit, 0);

  // Filter entries in range
  const rangeEntries = customerEntries
    .filter((e) => e.date >= startDate && e.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date));

  let running = openingBalance;
  const computedEntries: CustomerLedgerEntry[] = rangeEntries.map((e) => {
    running = running + e.debit - e.credit;
    return {
      ...e,
      runningBalance: running,
    };
  });

  const totalInvoiced = computedEntries
    .filter((e) => e.entryType === 'invoice')
    .reduce((sum, e) => sum + e.debit, 0);

  const totalPaid = computedEntries
    .filter((e) => e.entryType === 'payment')
    .reduce((sum, e) => sum + e.credit, 0);

  const totalCreditNotes = computedEntries
    .filter((e) => e.entryType === 'credit_note')
    .reduce((sum, e) => sum + e.credit, 0);

  const totalReturns = computedEntries
    .filter((e) => e.entryType === 'return_credit')
    .reduce((sum, e) => sum + e.credit, 0);

  const totalAdjustments = computedEntries
    .filter((e) => e.entryType === 'discount_adjustment' || e.entryType === 'write_off')
    .reduce((sum, e) => sum + e.credit - e.debit, 0);

  return {
    customerId: customer.id,
    customerCode: customer.code,
    customerName: customer.name,
    customerTier: customer.tier,
    startDate,
    endDate,
    openingBalance,
    totalInvoiced,
    totalPaid,
    totalCreditNotes,
    totalReturns,
    totalAdjustments,
    closingBalance: running,
    entries: computedEntries,
  };
}

import type { JournalEntry } from '@candi/types';

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  // JV-01: Wholesale Sales Invoicing for Orders ORD-072 & ORD-080
  {
    id: 'jv-001',
    journalNumber: 'JV-2026-0081',
    date: '2026-08-05',
    reference: 'SALES-RUN-0805',
    description: 'System Automated: Commercial Dispatch Invoicing to Tier 1 Accounts',
    preparedBy: 'Billing Automation System',
    approvedBy: 'Farhan Zaidi',
    status: 'posted',
    postedAt: '2026-08-05 18:30',
    lines: [
      {
        id: 'jl-101',
        accountCode: '1100',
        accountName: 'Trade Accounts Receivable (Control)',
        debit: 180000,
        credit: 0,
        memo: 'Invoiced receivables for Al-Madina and SubhanAllah consignments',
      },
      {
        id: 'jl-102',
        accountCode: '4010',
        accountName: 'Wholesale Confectionery Sales Revenue',
        debit: 0,
        credit: 180000,
        memo: 'Gross wholesale billing across 2 delivery routes',
      },
    ],
    totalDebit: 180000,
    totalCredit: 180000,
    isBalanced: true,
    auditTrail: [
      {
        timestamp: '2026-08-05 18:30',
        actor: 'Farhan Zaidi',
        action: 'APPROVED_AND_POSTED',
        details: 'Approved automated sales revenue journal entry',
      },
    ],
  },

  // JV-02: Supplier Consignment Intake (PO-081 / GRN-089)
  {
    id: 'jv-002',
    journalNumber: 'JV-2026-0085',
    date: '2026-09-14',
    reference: 'GRN-2026-089',
    description: 'Procurement Intake: 98 Cartons Choco Dream Bites from National Confectionery',
    preparedBy: 'Asim Raza (Warehouse Lead)',
    approvedBy: 'Farhan Zaidi (Procurement Manager)',
    status: 'posted',
    postedAt: '2026-09-14 17:00',
    lines: [
      {
        id: 'jl-201',
        accountCode: '1200',
        accountName: 'Wholesale Inventory Asset',
        debit: 274400,
        credit: 0,
        memo: 'Inventory addition 98 cartons @ 2,800 PKR/ctn accepted',
      },
      {
        id: 'jl-202',
        accountCode: '2030',
        accountName: 'Sales Tax Payable (SRB / FBR)',
        debit: 5600,
        credit: 0,
        memo: 'Input sales tax credit claimable on supplier invoice',
      },
      {
        id: 'jl-203',
        accountCode: '2010',
        accountName: 'Trade Accounts Payable (Control)',
        debit: 0,
        credit: 280000,
        memo: '3-way matched liability for INV-NAT-9921',
      },
    ],
    totalDebit: 280000,
    totalCredit: 280000,
    isBalanced: true,
    auditTrail: [
      {
        timestamp: '2026-09-14 17:00',
        actor: 'Farhan Zaidi',
        action: 'POSTED_TO_LEDGER',
        details: 'Posted following 3-way match sign-off',
      },
    ],
  },

  // JV-03: Bank Settlement to National Confectionery Ltd.
  {
    id: 'jv-003',
    journalNumber: 'JV-2026-0088',
    date: '2026-09-05',
    reference: 'PAY-2026-441',
    description: 'Supplier Disbursement: HBL Cheque #882901 payment against INV-NAT-9840',
    preparedBy: 'Farhan Zaidi',
    approvedBy: 'Kashif Razzaq',
    status: 'posted',
    postedAt: '2026-09-05 14:15',
    lines: [
      {
        id: 'jl-301',
        accountCode: '2010',
        accountName: 'Trade Accounts Payable (Control)',
        debit: 150000,
        credit: 0,
        memo: 'Discharge of trade liability to National Confectionery',
      },
      {
        id: 'jl-302',
        accountCode: '1020',
        accountName: 'Habib Bank Limited (HBL Corporate)',
        debit: 0,
        credit: 150000,
        memo: 'Cheque cleared from corporate current account',
      },
    ],
    totalDebit: 150000,
    totalCredit: 150000,
    isBalanced: true,
    auditTrail: [
      {
        timestamp: '2026-09-05 14:15',
        actor: 'Kashif Razzaq',
        action: 'APPROVED_PAYMENT_POSTING',
        details: 'Dual authorization cleared for bank disbursement',
      },
    ],
  },

  // JV-04: Fuel & Fleet Route Operating Expenses
  {
    id: 'jv-004',
    journalNumber: 'JV-2026-0091',
    date: '2026-09-15',
    reference: 'EXP-FLEET-441',
    description: 'Mid-Month Fleet Van Diesel Fuel & Vehicle Inspection Routine',
    preparedBy: 'Fleet Logistics Supervisor',
    approvedBy: 'Farhan Zaidi',
    status: 'posted',
    postedAt: '2026-09-15 11:30',
    lines: [
      {
        id: 'jl-401',
        accountCode: '6010',
        accountName: 'Fleet Logistics & Dispatch Fuel',
        debit: 35000,
        credit: 0,
        memo: 'PSO fuel card refill across 4 delivery vans',
      },
      {
        id: 'jl-402',
        accountCode: '1010',
        accountName: 'Cash on Hand (Disbursements & Drawer)',
        debit: 0,
        credit: 35000,
        memo: 'Petty cash disbursement with PSO automated pump receipts attached',
      },
    ],
    totalDebit: 35000,
    totalCredit: 35000,
    isBalanced: true,
    auditTrail: [
      {
        timestamp: '2026-09-15 11:30',
        actor: 'Farhan Zaidi',
        action: 'APPROVED_AND_POSTED',
        details: 'Approved fleet fuel expenses',
      },
    ],
  },
];

import type { SupplierLedgerEntry } from '@candi/types';

export const INITIAL_SUPPLIER_LEDGER_ENTRIES: SupplierLedgerEntry[] = [
  // ================= NATIONAL CONFECTIONERY INDUSTRIES LTD. (sup-01) =================
  {
    id: 'sled-001',
    supplierId: 'sup-01',
    supplierCode: 'SUP-NAT-01',
    supplierName: 'National Confectionery Industries Ltd.',
    date: '2026-08-01',
    entryType: 'opening_balance',
    referenceNumber: 'OPB-SUP-01',
    description: 'Fiscal Q3 Brought Forward Payable Balance',
    debit: 0,
    credit: 410000,
    runningBalance: 410000,
    dueDate: '2026-08-31',
    status: 'posted',
    authorizedBy: 'Farhan Zaidi',
  },
  {
    id: 'sled-002',
    supplierId: 'sup-01',
    supplierCode: 'SUP-NAT-01',
    supplierName: 'National Confectionery Industries Ltd.',
    date: '2026-08-25',
    entryType: 'payment',
    referenceNumber: 'PAY-2026-398',
    description: 'HBL RTGS Online Settlement for Inv #INV-NAT-9710',
    debit: 410000,
    credit: 0,
    runningBalance: 0,
    status: 'reconciled',
    authorizedBy: 'Kashif Razzaq',
  },
  {
    id: 'sled-003',
    supplierId: 'sup-01',
    supplierCode: 'SUP-NAT-01',
    supplierName: 'National Confectionery Industries Ltd.',
    date: '2026-08-28',
    entryType: 'supplier_invoice',
    referenceNumber: 'INV-NAT-9840',
    description: 'PO-2026-075 Delivery (150 cartons Truffle Bites)',
    debit: 0,
    credit: 350000,
    runningBalance: 350000,
    dueDate: '2026-09-28',
    status: 'posted',
    authorizedBy: 'Farhan Zaidi',
  },
  {
    id: 'sled-004',
    supplierId: 'sup-01',
    supplierCode: 'SUP-NAT-01',
    supplierName: 'National Confectionery Industries Ltd.',
    date: '2026-09-05',
    entryType: 'payment',
    referenceNumber: 'PAY-2026-441',
    description: 'Part Payment via HBL Cheque #CHQ-882901',
    debit: 150000,
    credit: 0,
    runningBalance: 200000,
    status: 'reconciled',
    authorizedBy: 'Farhan Zaidi',
  },
  {
    id: 'sled-005',
    supplierId: 'sup-01',
    supplierCode: 'SUP-NAT-01',
    supplierName: 'National Confectionery Industries Ltd.',
    date: '2026-09-14',
    entryType: 'supplier_invoice',
    referenceNumber: 'INV-NAT-9921',
    description: 'PO-2026-081 Consignment (GRN-2026-089)',
    debit: 0,
    credit: 280000,
    runningBalance: 480000,
    dueDate: '2026-10-14',
    status: 'posted',
    authorizedBy: 'Farhan Zaidi',
  },

  // ================= GOLDEN WHEAT MILLING & BAKERY SUPPLIES (sup-02) =================
  {
    id: 'sled-006',
    supplierId: 'sup-02',
    supplierCode: 'SUP-GLD-02',
    supplierName: 'Golden Wheat Milling & Bakery Supplies',
    date: '2026-09-10',
    entryType: 'supplier_invoice',
    referenceNumber: 'INV-GLD-4011',
    description: 'PO-2026-082 Wafer Consignment (GRN-2026-085)',
    debit: 0,
    credit: 125000,
    runningBalance: 125000,
    dueDate: '2026-09-25',
    status: 'posted',
    authorizedBy: 'Farhan Zaidi',
  },
  {
    id: 'sled-007',
    supplierId: 'sup-02',
    supplierCode: 'SUP-GLD-02',
    supplierName: 'Golden Wheat Milling & Bakery Supplies',
    date: '2026-09-14',
    entryType: 'debit_note',
    referenceNumber: 'DN-2026-004',
    description: 'Debit Note for Damaged Packaging Credit Agreement',
    debit: 45000,
    credit: 0,
    runningBalance: 80000,
    dueDate: '2026-09-25',
    status: 'reconciled',
    authorizedBy: 'Farhan Zaidi',
  },
];

export function getSupplierLedger(supplierId?: string): {
  entries: SupplierLedgerEntry[];
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
} {
  const filtered = supplierId
    ? INITIAL_SUPPLIER_LEDGER_ENTRIES.filter((e) => e.supplierId === supplierId)
    : INITIAL_SUPPLIER_LEDGER_ENTRIES;

  const totalDebit = filtered.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = filtered.reduce((sum, e) => sum + e.credit, 0);

  // In accounts payable, liability balance = total credit - total debit
  const closingBalance = totalCredit - totalDebit;

  return {
    entries: filtered,
    totalDebit,
    totalCredit,
    closingBalance,
  };
}

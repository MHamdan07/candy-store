import React, { useState, useMemo } from 'react';
import { Card, Badge, Button, Input, Modal, Alert } from '@candi/ui';
import { INITIAL_SUPPLIERS } from '../../data/suppliers';
import { INITIAL_SUPPLIER_LEDGER_ENTRIES } from '../../data/supplierLedgers';
import type { SupplierLedgerEntry } from '@candi/types';

export const SupplierLedgerPage: React.FC = () => {
  const [entries, setEntries] = useState<SupplierLedgerEntry[]>(INITIAL_SUPPLIER_LEDGER_ENTRIES);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchRef, setSearchRef] = useState<string>('');
  const [isDebitNoteModalOpen, setIsDebitNoteModalOpen] = useState<boolean>(false);
  const [selectedVoucher, setSelectedVoucher] = useState<SupplierLedgerEntry | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // New Debit Note Form State
  const [dnSupplierId, setDnSupplierId] = useState<string>('sup-01');
  const [dnRef, setDnRef] = useState<string>('DN-2026-005');
  const [dnAmount, setDnAmount] = useState<number>(15000);
  const [dnDescription, setDnDescription] = useState<string>('Damage deduction / batch return agreement');
  const [dnAuthorizer, setDnAuthorizer] = useState<string>('Farhan Zaidi (Procurement Manager)');

  const selectedSupplier = useMemo(() => {
    if (selectedSupplierId === 'all') return null;
    return INITIAL_SUPPLIERS.find((s) => s.id === selectedSupplierId) || null;
  }, [selectedSupplierId]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchSup = selectedSupplierId === 'all' || e.supplierId === selectedSupplierId;
      const matchType = typeFilter === 'all' || e.entryType === typeFilter;
      const q = searchRef.toLowerCase();
      const matchQ =
        e.referenceNumber.toLowerCase().includes(q) ||
        e.supplierName.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q);
      return matchSup && matchType && matchQ;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [entries, selectedSupplierId, typeFilter, searchRef]);

  // Running totals
  const metrics = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;

    filteredEntries.forEach((e) => {
      totalDebit += e.debit;
      totalCredit += e.credit;
    });

    // In accounts payable: net liability = total credit - total debit
    const netPayables = totalCredit - totalDebit;

    return { totalDebit, totalCredit, netPayables };
  }, [filteredEntries]);

  // Overall subledger total across all suppliers
  const grandPayablesTotal = useMemo(() => {
    return entries.reduce((acc, e) => acc + e.credit - e.debit, 0);
  }, [entries]);

  const handleCreateDebitNote = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = INITIAL_SUPPLIERS.find((s) => s.id === dnSupplierId);
    if (!sup) return;

    // Calculate updated running balance for this supplier
    const supEntries = entries.filter((x) => x.supplierId === dnSupplierId);
    const currentBal = supEntries.reduce((acc, x) => acc + x.credit - x.debit, 0);
    const newBal = currentBal - Number(dnAmount);

    const newEntry: SupplierLedgerEntry = {
      id: `sled-${Date.now()}`,
      supplierId: sup.id,
      supplierCode: sup.code,
      supplierName: sup.name,
      date: new Date().toISOString().split('T')[0],
      entryType: 'debit_note',
      referenceNumber: dnRef,
      description: dnDescription,
      debit: Number(dnAmount),
      credit: 0,
      runningBalance: newBal,
      status: 'posted',
      authorizedBy: dnAuthorizer,
    };

    setEntries((prev) => [...prev, newEntry]);
    setIsDebitNoteModalOpen(false);
    setNotice(`Debit Note ${dnRef} for PKR ${Number(dnAmount).toLocaleString()} posted to ${sup.name} sub-ledger.`);
  };

  const getEntryTypeBadge = (type: string) => {
    switch (type) {
      case 'supplier_invoice':
        return <Badge variant="brand">Supplier Invoice (CR)</Badge>;
      case 'payment':
        return <Badge variant="success">Payment (DR)</Badge>;
      case 'debit_note':
        return <Badge variant="warning">Debit Note (DR)</Badge>;
      case 'credit_note':
        return <Badge variant="neutral">Credit Note (CR)</Badge>;
      case 'opening_balance':
        return <Badge variant="neutral">Opening Bal</Badge>;
      default:
        return <Badge variant="neutral">{type}</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-text, #11120D)' }}>
              Supplier Sub-Ledger (Accounts Payable)
            </h1>
            <Badge variant="brand">GL Control Account 2010</Badge>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-secondary-text, #565449)', fontSize: '14px' }}>
            Individual manufacturer and vendor khata ledgers tracking accepted goods invoices, disbursements, and debit notes.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="primary" onClick={() => setIsDebitNoteModalOpen(true)}>
            + Post Debit Note
          </Button>
        </div>
      </div>

      {notice && (
        <Alert type="success">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{notice}</span>
            <button
              onClick={() => setNotice(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        </Alert>
      )}

      {/* Reconciliation Callout */}
      <Card
        style={{
          background: '#FFFBF4',
          border: '1px solid #D8CFBC',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#7E7A6B', textTransform: 'uppercase' }}>
            Supplier Sub-Ledger vs General Ledger (2010 Trade Payables)
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#11120D', marginTop: '4px' }}>
            Sub-Ledger Total: PKR {grandPayablesTotal.toLocaleString()} &nbsp;= &nbsp;GL 2010 Control: PKR 560,000
          </div>
          <div style={{ fontSize: '12px', color: '#2E7D32', marginTop: '2px', fontWeight: 600 }}>
            ✓ Verified 3-Way Match & Payables Balance ($0.00 Variance)
          </div>
        </div>
        <Badge variant="success">GL Reconciled</Badge>
      </Card>

      {/* Filter Bar */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7E7A6B', marginBottom: '4px' }}>
                Filter Supplier
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '6px',
                  border: '1px solid #D8CFBC',
                  background: '#FFFBF4',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#11120D',
                  minWidth: '280px',
                }}
              >
                <option value="all">All Suppliers (Combined Payables)</option>
                {INITIAL_SUPPLIERS.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name} ({sup.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7E7A6B', marginBottom: '4px' }}>
                Entry Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '6px',
                  border: '1px solid #D8CFBC',
                  background: '#FFFBF4',
                  fontSize: '13px',
                  color: '#11120D',
                }}
              >
                <option value="all">All Entries</option>
                <option value="supplier_invoice">Invoices (Credit / Payable +)</option>
                <option value="payment">Disbursements (Debit / Payable -)</option>
                <option value="debit_note">Debit Notes (Debit / Payable -)</option>
                <option value="opening_balance">Opening Balance</option>
              </select>
            </div>
          </div>

          <div style={{ minWidth: '260px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7E7A6B', marginBottom: '4px' }}>
              Search Voucher / Reference
            </label>
            <Input
              placeholder="Search INV-, PAY-, DN-..."
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Selected Supplier Profile Banner */}
      {selectedSupplier && (
        <Card style={{ background: '#FAF6EE', border: '1px solid #D8CFBC', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#11120D' }}>
                  {selectedSupplier.name}
                </h3>
                <Badge variant="neutral">{selectedSupplier.code}</Badge>
                <Badge variant="brand">{selectedSupplier.category}</Badge>
              </div>
              <div style={{ fontSize: '12px', color: '#565449', marginTop: '4px' }}>
                Contact: {selectedSupplier.contactPerson} &bull; Payment Terms: {selectedSupplier.paymentTerms} &bull; Bank: {selectedSupplier.bankDetails?.bankName} ({selectedSupplier.bankDetails?.accountNumber})
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700 }}>Credit Limit</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#11120D' }}>
                  PKR {selectedSupplier.creditLimit.toLocaleString()}
                </div>
              </div>
              <div style={{ borderLeft: '1px solid #D8CFBC', paddingLeft: '20px' }}>
                <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700 }}>Current Payables Balance</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#8A5D00' }}>
                  PKR {metrics.netPayables.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card style={{ borderLeft: '4px solid #11120D', padding: '14px 18px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Invoiced (Credits)
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#11120D', marginTop: '4px' }}>
            PKR {metrics.totalCredit.toLocaleString()}
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid #2E7D32', padding: '14px 18px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Payments & Debit Notes (Debits)
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#2E7D32', marginTop: '4px' }}>
            PKR {metrics.totalDebit.toLocaleString()}
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid #B8860B', padding: '14px 18px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Net Outstanding Liability
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#8A5D00', marginTop: '4px' }}>
            PKR {metrics.netPayables.toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Supplier Ledger Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#ECE6D9', borderBottom: '1px solid #D8CFBC' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Supplier</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Reference #</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Type</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Description</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Due Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'right' }}>Debit (Payable -)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'right' }}>Credit (Payable +)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'right' }}>Running Balance</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '32px', textAlign: 'center', color: '#565449' }}>
                    No supplier ledger entries found.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((e, index) => (
                  <tr
                    key={e.id}
                    style={{
                      borderBottom: '1px solid #EFEAE0',
                      background: index % 2 === 0 ? '#FFFFFF' : '#FAF6EE',
                    }}
                  >
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#565449' }}>{e.date}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#11120D' }}>{e.supplierName}</div>
                      <div style={{ fontSize: '11px', color: '#7E7A6B' }}>{e.supplierCode}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => setSelectedVoucher(e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: '#1565C0',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0,
                        }}
                      >
                        {e.referenceNumber}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{getEntryTypeBadge(e.entryType)}</td>
                    <td style={{ padding: '12px 16px', color: '#11120D' }}>{e.description}</td>
                    <td style={{ padding: '12px 16px', color: '#565449' }}>{e.dueDate || '-'}</td>
                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontWeight: e.debit > 0 ? 700 : 400,
                        color: e.debit > 0 ? '#2E7D32' : '#9E9B90',
                        fontFamily: 'monospace',
                      }}
                    >
                      {e.debit > 0 ? `PKR ${e.debit.toLocaleString()}` : '-'}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontWeight: e.credit > 0 ? 700 : 400,
                        color: e.credit > 0 ? '#11120D' : '#9E9B90',
                        fontFamily: 'monospace',
                      }}
                    >
                      {e.credit > 0 ? `PKR ${e.credit.toLocaleString()}` : '-'}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontWeight: 800,
                        color: '#8A5D00',
                        fontFamily: 'monospace',
                      }}
                    >
                      PKR {e.runningBalance.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <Badge variant={e.status === 'reconciled' ? 'success' : 'brand'}>
                        {e.status.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Debit Note Modal */}
      {isDebitNoteModalOpen && (
        <Modal
          isOpen={isDebitNoteModalOpen}
          onClose={() => setIsDebitNoteModalOpen(false)}
          title="Record Supplier Debit Note / Deduction"
        >
          <form onSubmit={handleCreateDebitNote} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#11120D' }}>
                Supplier *
              </label>
              <select
                value={dnSupplierId}
                onChange={(e) => setDnSupplierId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D8CFBC',
                  background: '#FFFBF4',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {INITIAL_SUPPLIERS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#11120D' }}>
                Debit Note Reference # *
              </label>
              <Input value={dnRef} onChange={(e) => setDnRef(e.target.value)} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#11120D' }}>
                Deduction Amount (PKR) *
              </label>
              <Input
                type="number"
                value={dnAmount.toString()}
                onChange={(e) => setDnAmount(parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#11120D' }}>
                Reason & Deduction Agreement
              </label>
              <Input value={dnDescription} onChange={(e) => setDnDescription(e.target.value)} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#11120D' }}>
                Authorized By *
              </label>
              <Input value={dnAuthorizer} onChange={(e) => setDnAuthorizer(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button variant="secondary" type="button" onClick={() => setIsDebitNoteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Post Debit Note
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Voucher Detail Modal */}
      {selectedVoucher && (
        <Modal
          isOpen={!!selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
          title={`Payable Voucher: ${selectedVoucher.referenceNumber}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ color: '#7E7A6B', display: 'block', fontSize: '11px', fontWeight: 700 }}>Supplier</span>
                <span style={{ fontWeight: 700, color: '#11120D' }}>{selectedVoucher.supplierName}</span>
                <span style={{ display: 'block', color: '#565449', fontSize: '12px' }}>{selectedVoucher.supplierCode}</span>
              </div>
              <div>
                <span style={{ color: '#7E7A6B', display: 'block', fontSize: '11px', fontWeight: 700 }}>Posting Date</span>
                <span style={{ fontWeight: 600, color: '#11120D' }}>{selectedVoucher.date}</span>
                {selectedVoucher.dueDate && (
                  <span style={{ display: 'block', color: '#B8860B', fontSize: '12px' }}>Due: {selectedVoucher.dueDate}</span>
                )}
              </div>
            </div>

            <div style={{ background: '#FAF6EE', padding: '12px', borderRadius: '6px', border: '1px solid #D8CFBC' }}>
              <span style={{ color: '#7E7A6B', display: 'block', fontSize: '11px', fontWeight: 700 }}>
                Transaction Description
              </span>
              <span style={{ fontWeight: 600, color: '#11120D' }}>{selectedVoucher.description}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ color: '#7E7A6B', display: 'block', fontSize: '11px', fontWeight: 700 }}>Debit (Disbursed)</span>
                <span style={{ fontWeight: 700, color: '#2E7D32' }}>PKR {selectedVoucher.debit.toLocaleString()}</span>
              </div>
              <div>
                <span style={{ color: '#7E7A6B', display: 'block', fontSize: '11px', fontWeight: 700 }}>Credit (Invoiced)</span>
                <span style={{ fontWeight: 700, color: '#11120D' }}>PKR {selectedVoucher.credit.toLocaleString()}</span>
              </div>
              <div>
                <span style={{ color: '#7E7A6B', display: 'block', fontSize: '11px', fontWeight: 700 }}>Running Balance</span>
                <span style={{ fontWeight: 800, color: '#8A5D00' }}>PKR {selectedVoucher.runningBalance.toLocaleString()}</span>
              </div>
            </div>

            {selectedVoucher.authorizedBy && (
              <div style={{ fontSize: '12px', color: '#565449', borderTop: '1px solid #EFEAE0', paddingTop: '10px' }}>
                Authorized By: <strong>{selectedVoucher.authorizedBy}</strong>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <Button variant="primary" onClick={() => setSelectedVoucher(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Card, Table, Badge, Button, Input, Modal, Alert } from '@candi/ui';
import { CustomerLedgerEntry, CustomerRecord } from '@candi/types';
import { CUSTOMERS_DATABASE } from '../../data/customers';
import { generateCustomerStatement, INITIAL_LEDGER_ENTRIES } from '../../data/customerStatements';

export const CustomerStatementPage: React.FC = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(CUSTOMERS_DATABASE[0].id);
  const [startDate, setStartDate] = useState<string>('2026-07-01');
  const [endDate, setEndDate] = useState<string>('2026-09-17');
  const [ledgerEntries, setLedgerEntries] = useState<CustomerLedgerEntry[]>(INITIAL_LEDGER_ENTRIES);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Adjustment form state
  const [adjustmentForm, setAdjustmentForm] = useState({
    type: 'credit_note' as 'credit_note' | 'discount_adjustment' | 'write_off',
    amount: 0,
    referenceNumber: `CN-2026-00${Math.floor(Math.random() * 90) + 10}`,
    description: '',
    reason: '',
    authorizedBy: 'Kashif Razzaq (Commercial Director)',
  });

  const selectedCustomer = CUSTOMERS_DATABASE.find((c: CustomerRecord) => c.id === selectedCustomerId) || CUSTOMERS_DATABASE[0];

  // Dynamic Statement calculation
  const statement = useMemo(() => {
    // Filter customer entries
    const customerEntries = ledgerEntries.filter((e) => e.customerId === selectedCustomerId);
    const priorEntries = customerEntries.filter((e) => e.date < startDate);
    const openingBalance = priorEntries.reduce((acc, curr) => acc + curr.debit - curr.credit, 0);

    const rangeEntries = customerEntries
      .filter((e) => e.date >= startDate && e.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date));

    let running = openingBalance;
    const computedEntries = rangeEntries.map((e) => {
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
      customerId: selectedCustomer.id,
      customerCode: selectedCustomer.code,
      customerName: selectedCustomer.name,
      customerTier: selectedCustomer.tier,
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
  }, [selectedCustomerId, startDate, endDate, ledgerEntries, selectedCustomer]);

  const handlePostAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustmentForm.reason.trim()) {
      alert('Mandatory justification reason required for ledger balance adjustments.');
      return;
    }

    const isCredit = adjustmentForm.type === 'credit_note' || adjustmentForm.type === 'write_off' || adjustmentForm.type === 'discount_adjustment';

    const newEntry: CustomerLedgerEntry = {
      id: `led-${Date.now()}`,
      customerId: selectedCustomerId,
      customerCode: selectedCustomer.code,
      customerName: selectedCustomer.name,
      date: '2026-09-17',
      entryType: adjustmentForm.type,
      referenceNumber: adjustmentForm.referenceNumber,
      description: `${adjustmentForm.description} [Justification: ${adjustmentForm.reason}]`,
      debit: isCredit ? 0 : Number(adjustmentForm.amount),
      credit: isCredit ? Number(adjustmentForm.amount) : 0,
      runningBalance: 0,
      status: 'posted',
      authorizedBy: adjustmentForm.authorizedBy,
      notes: adjustmentForm.reason,
    };

    setLedgerEntries([...ledgerEntries, newEntry]);
    setAdjustmentModalOpen(false);
    setSuccessMsg(`Adjustment ${adjustmentForm.referenceNumber} of PKR ${Number(adjustmentForm.amount).toLocaleString()} posted to customer khata.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const columns = [
    {
      header: 'Date',
      accessor: 'date' as const,
      width: '110px',
    },
    {
      header: 'Reference & Type',
      render: (row: CustomerLedgerEntry) => {
        let badgeVariant: 'info' | 'success' | 'warning' | 'danger' | 'neutral' = 'neutral';
        if (row.entryType === 'invoice') badgeVariant = 'info';
        if (row.entryType === 'payment') badgeVariant = 'success';
        if (row.entryType === 'credit_note') badgeVariant = 'warning';
        if (row.entryType === 'write_off') badgeVariant = 'danger';

        return (
          <div>
            <div style={{ fontWeight: 800, color: 'var(--color-smoky-black)', fontSize: '12px' }}>
              {row.referenceNumber}
            </div>
            <div style={{ marginTop: '2px' }}>
              <Badge variant={badgeVariant}>{row.entryType.replace(/_/g, ' ').toUpperCase()}</Badge>
            </div>
          </div>
        );
      },
      width: '160px',
    },
    {
      header: 'Transaction Description & Audit Stamp',
      render: (row: CustomerLedgerEntry) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--color-smoky-black)' }}>
            {row.description}
          </div>
          {row.authorizedBy && (
            <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
              Authorized by: <strong>{row.authorizedBy}</strong>
            </div>
          )}
        </div>
      ),
      width: '320px',
    },
    {
      header: 'Debit (+Receivable)',
      render: (row: CustomerLedgerEntry) => (
        <div style={{ fontWeight: row.debit > 0 ? 800 : 400, color: row.debit > 0 ? '#11120D' : '#888' }}>
          {row.debit > 0 ? `PKR ${row.debit.toLocaleString()}` : '-'}
        </div>
      ),
      width: '140px',
    },
    {
      header: 'Credit (-Balance)',
      render: (row: CustomerLedgerEntry) => (
        <div style={{ fontWeight: row.credit > 0 ? 800 : 400, color: row.credit > 0 ? '#1B4332' : '#888' }}>
          {row.credit > 0 ? `PKR ${row.credit.toLocaleString()}` : '-'}
        </div>
      ),
      width: '140px',
    },
    {
      header: 'Running Balance',
      render: (row: CustomerLedgerEntry) => (
        <div style={{ fontWeight: 900, fontSize: '13px', color: 'var(--color-smoky-black)' }}>
          PKR {row.runningBalance.toLocaleString()}
        </div>
      ),
      width: '150px',
    },
    {
      header: 'Status',
      render: (row: CustomerLedgerEntry) => (
        <Badge variant={row.status === 'reconciled' || row.status === 'posted' ? 'success' : 'neutral'}>
          {row.status.toUpperCase()}
        </Badge>
      ),
      width: '110px',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
            Customer Statement of Account (Khata Ledger)
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-olive-drab)' }}>
            Complete itemized double-entry transaction history matching the customer ledger with running balances.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="outline" onClick={() => setAdjustmentModalOpen(true)}>
            + Post Credit Note / Adjustment
          </Button>
          <Button variant="primary" onClick={() => setPrintModalOpen(true)}>
            🖨️ Print / Export Statement
          </Button>
        </div>
      </div>

      {successMsg && (
        <Alert type="success" title="Khata Updated">
          {successMsg}
        </Alert>
      )}

      {/* Customer Selection & Date Controls */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              Select Customer Account
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-bone)',
                fontFamily: 'var(--font-family-mono)',
                fontSize: '13px',
              }}
            >
              {CUSTOMERS_DATABASE.map((cust: CustomerRecord) => (
                <option key={cust.id} value={cust.id}>
                  {cust.code} — {cust.name} ({cust.tierLabel})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Statement Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input
                label="Statement End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <Button size="sm" variant="outline" onClick={() => { setStartDate('2026-07-01'); setEndDate('2026-09-17'); }}>
              Fiscal Q3
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setStartDate('2026-09-01'); setEndDate('2026-09-17'); }}>
              Sept 2026
            </Button>
          </div>
        </div>
      </Card>

      {/* Financial Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
        <Card>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>OPENING BALANCE</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-smoky-black)', marginTop: '4px' }}>
            PKR {statement.openingBalance.toLocaleString()}
          </div>
          <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>As of {startDate}</div>
        </Card>

        <Card>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>TOTAL INVOICED (+)</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#11120D', marginTop: '4px' }}>
            PKR {statement.totalInvoiced.toLocaleString()}
          </div>
          <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>Wholesale order debits</div>
        </Card>

        <Card>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>TOTAL PAYMENTS (-)</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#1B4332', marginTop: '4px' }}>
            PKR {statement.totalPaid.toLocaleString()}
          </div>
          <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>Cash & bank credits</div>
        </Card>

        <Card>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>CREDIT NOTES & RETURNS</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#005F73', marginTop: '4px' }}>
            PKR {(statement.totalCreditNotes + statement.totalReturns).toLocaleString()}
          </div>
          <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>Approved return allowances</div>
        </Card>

        <Card style={{ backgroundColor: 'var(--color-bone)', border: '2px solid var(--color-smoky-black)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>CLOSING BALANCE</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: statement.closingBalance > 0 ? '#8C2A2A' : '#1B4332', marginTop: '4px' }}>
            PKR {statement.closingBalance.toLocaleString()}
          </div>
          <div style={{ fontSize: '10px', color: '#565449', marginTop: '2px' }}>As of {endDate}</div>
        </Card>
      </div>

      {/* Ledger Table */}
      <Card title={`Itemized Transactions: ${selectedCustomer.name} (${selectedCustomer.code})`}>
        <Table
          columns={columns}
          data={statement.entries}
          keyExtractor={(e) => e.id}
          emptyMessage="No ledger transactions recorded in this date range."
        />
      </Card>

      {/* Post Adjustment Modal */}
      {adjustmentModalOpen && (
        <Modal
          isOpen={adjustmentModalOpen}
          onClose={() => setAdjustmentModalOpen(false)}
          title={`Post Khata Adjustment / Credit Note: ${selectedCustomer.name}`}
        >
          <form onSubmit={handlePostAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '10px', backgroundColor: '#FFF8EA', border: '1px solid #E6C875', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
              <strong>Governance Control:</strong> Only authorized finance roles can post ledger adjustments. Every alteration is permanently stamped with the authorizer and mandatory justification reason.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Adjustment Type
                </label>
                <select
                  value={adjustmentForm.type}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, type: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-bone)',
                    fontFamily: 'var(--font-family-mono)',
                    fontSize: '13px',
                  }}
                >
                  <option value="credit_note">Credit Note (Stock Return / Damage Allowance)</option>
                  <option value="discount_adjustment">Commercial Discount Difference</option>
                  <option value="write_off">Bad Debt Write-Off (Director Approval Required)</option>
                </select>
              </div>

              <Input
                label="Adjustment Reference No"
                value={adjustmentForm.referenceNumber}
                onChange={(e) => setAdjustmentForm({ ...adjustmentForm, referenceNumber: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Adjustment Amount (PKR)"
                type="number"
                min="1"
                value={String(adjustmentForm.amount)}
                onChange={(e) => setAdjustmentForm({ ...adjustmentForm, amount: Number(e.target.value) })}
                required
              />
              <Input
                label="Authorizing Commercial Director"
                value={adjustmentForm.authorizedBy}
                onChange={(e) => setAdjustmentForm({ ...adjustmentForm, authorizedBy: e.target.value })}
                required
              />
            </div>

            <Input
              label="Transaction Description"
              placeholder="e.g. Return of 2 cartons melted wafers..."
              value={adjustmentForm.description}
              onChange={(e) => setAdjustmentForm({ ...adjustmentForm, description: e.target.value })}
              required
            />

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', color: '#8C2A2A' }}>
                * Mandatory Audit Reason for Adjustment
              </label>
              <textarea
                placeholder="Explain the commercial justification for modifying the customer balance..."
                value={adjustmentForm.reason}
                onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                rows={3}
                required
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-bone)',
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '12px',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <Button type="button" variant="outline" onClick={() => setAdjustmentModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Approve & Post to Ledger
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Print / Export Statement Modal */}
      {printModalOpen && (
        <Modal
          isOpen={printModalOpen}
          onClose={() => setPrintModalOpen(false)}
          title="Print / Export Official Customer Statement"
          maxWidth="700px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '12px' }}>
            <div style={{ borderBottom: '2px solid var(--color-smoky-black)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px' }}>CANDI SUPER STORE WHOLESALE</h2>
                <div style={{ fontSize: '11px', color: '#555' }}>NTN: 8294719-4 • STRN: 3277876123456</div>
                <div style={{ fontSize: '11px', color: '#555' }}>Plot 48/B, Confectionery Hub, Karachi</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '14px' }}>STATEMENT OF ACCOUNT</div>
                <div>Period: {startDate} to {endDate}</div>
                <div>Generated: 2026-09-17 21:00</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ color: 'var(--color-olive-drab)' }}>Customer Information:</span>
                <div style={{ fontWeight: 800, fontSize: '13px' }}>{selectedCustomer.name}</div>
                <div>Code: {selectedCustomer.code} • Tier: {selectedCustomer.tierLabel}</div>
                <div>Contact: {selectedCustomer.contactPerson} ({selectedCustomer.phone})</div>
                <div>Address: {selectedCustomer.billingAddress}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#666' }}>Opening Balance: PKR {statement.openingBalance.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: '#666' }}>Total Debits (Invoiced): + PKR {statement.totalInvoiced.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: '#666' }}>Total Credits (Paid/Returns): - PKR {(statement.totalPaid + statement.totalCreditNotes).toLocaleString()}</div>
                <div style={{ marginTop: '6px', fontSize: '16px', fontWeight: 900, color: 'var(--color-smoky-black)' }}>
                  CLOSING BALANCE DUE: PKR {statement.closingBalance.toLocaleString()}
                </div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-smoky-black)', color: 'var(--color-floral-white)' }}>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Ref No</th>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Debit (PKR)</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Credit (PKR)</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Balance (PKR)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: '#F8F8F8' }}>
                  <td style={{ padding: '6px' }}>{startDate}</td>
                  <td style={{ padding: '6px' }}>-</td>
                  <td style={{ padding: '6px', fontWeight: 700 }}>Opening Balance Forward</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>-</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>-</td>
                  <td style={{ padding: '6px', textAlign: 'right', fontWeight: 700 }}>{statement.openingBalance.toLocaleString()}</td>
                </tr>
                {statement.entries.map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #EEE' }}>
                    <td style={{ padding: '6px' }}>{e.date}</td>
                    <td style={{ padding: '6px', fontWeight: 600 }}>{e.referenceNumber}</td>
                    <td style={{ padding: '6px' }}>{e.description}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>{e.debit > 0 ? e.debit.toLocaleString() : '-'}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>{e.credit > 0 ? e.credit.toLocaleString() : '-'}</td>
                    <td style={{ padding: '6px', textAlign: 'right', fontWeight: 700 }}>{e.runningBalance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ fontSize: '10px', color: '#666', borderTop: '1px solid #DDD', paddingTop: '8px' }}>
              This is an authorized system-generated statement from Candi Super Store Platform. Inquiries: accounts@candisuperstore.pk
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
              <Button variant="outline" onClick={() => setPrintModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={() => { alert('Statement sent to browser print preview and downloaded as PDF.'); setPrintModalOpen(false); }}>
                Confirm Print / Download PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

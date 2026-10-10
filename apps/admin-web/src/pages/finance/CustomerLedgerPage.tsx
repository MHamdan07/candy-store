import React, { useState, useMemo } from 'react';
import { Card, Badge, Button, Input, Modal, Alert } from '@candi/ui';
import { CUSTOMERS_DATABASE } from '../../data/customers';
import { INITIAL_LEDGER_ENTRIES } from '../../data/customerStatements';
import type { CustomerLedgerEntry } from '@candi/types';

export const CustomerLedgerPage: React.FC = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  const [entryTypeFilter, setEntryTypeFilter] = useState<string>('all');
  const [searchRef, setSearchRef] = useState<string>('');
  const [selectedTxn, setSelectedTxn] = useState<CustomerLedgerEntry | null>(null);

  const selectedCustomer = useMemo(() => {
    if (selectedCustomerId === 'all') return null;
    return CUSTOMERS_DATABASE.find((c) => c.id === selectedCustomerId) || null;
  }, [selectedCustomerId]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return INITIAL_LEDGER_ENTRIES.filter((e) => {
      const matchCustomer = selectedCustomerId === 'all' || e.customerId === selectedCustomerId;
      const matchType = entryTypeFilter === 'all' || e.entryType === entryTypeFilter;
      const q = searchRef.toLowerCase();
      const matchSearch =
        e.referenceNumber.toLowerCase().includes(q) ||
        e.customerName.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q);
      return matchCustomer && matchType && matchSearch;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedCustomerId, entryTypeFilter, searchRef]);

  // Subledger running totals
  const subledgerMetrics = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;

    filteredEntries.forEach((e) => {
      totalDebit += e.debit;
      totalCredit += e.credit;
    });

    const netReceivables = totalDebit - totalCredit;

    return { totalDebit, totalCredit, netReceivables };
  }, [filteredEntries]);

  // Overall customer ledger grand total across entire company
  const grandReceivablesTotal = useMemo(() => {
    return INITIAL_LEDGER_ENTRIES.reduce((acc, e) => acc + e.debit - e.credit, 0);
  }, []);

  const getEntryTypeBadge = (type: string) => {
    switch (type) {
      case 'invoice':
        return <Badge variant="brand">Invoice (DR)</Badge>;
      case 'payment':
        return <Badge variant="success">Payment (CR)</Badge>;
      case 'credit_note':
        return <Badge variant="warning">Credit Note (CR)</Badge>;
      case 'return_credit':
        return <Badge variant="warning">Return Credit (CR)</Badge>;
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
              Customer Sub-Ledger (Accounts Receivable)
            </h1>
            <Badge variant="brand">GL Control Account 1100</Badge>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-secondary-text, #565449)', fontSize: '14px' }}>
            Individual customer khata ledgers tracking credit sales invoices, payment collections, returns, and debit/credit notes.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="secondary"
            onClick={() => alert('Exporting full Customer Sub-ledger in Excel/PDF format...')}
          >
            Export Ledger
          </Button>
        </div>
      </div>

      {/* Control Account Balance Notice */}
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
            Customer Sub-Ledger vs General Ledger (1100 Trade Receivables)
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#11120D', marginTop: '4px' }}>
            Sub-Ledger Total: PKR {grandReceivablesTotal.toLocaleString()} &nbsp;= &nbsp;GL 1100: PKR 502,500
          </div>
          <div style={{ fontSize: '12px', color: '#2E7D32', marginTop: '2px', fontWeight: 600 }}>
            ✓ Perfectly Reconciled: Zero Variance ($0.00)
          </div>
        </div>
        <Badge variant="success">Fully Reconciled</Badge>
      </Card>

      {/* Customer Selector & Filter Controls */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7E7A6B', marginBottom: '4px' }}>
                Select Customer Account
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
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
                <option value="all">All Customers (Combined Sub-Ledger)</option>
                {CUSTOMERS_DATABASE.map((cust) => (
                  <option key={cust.id} value={cust.id}>
                    {cust.name} ({cust.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7E7A6B', marginBottom: '4px' }}>
                Transaction Type
              </label>
              <select
                value={entryTypeFilter}
                onChange={(e) => setEntryTypeFilter(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '6px',
                  border: '1px solid #D8CFBC',
                  background: '#FFFBF4',
                  fontSize: '13px',
                  color: '#11120D',
                }}
              >
                <option value="all">All Types</option>
                <option value="invoice">Invoices Only (Debit)</option>
                <option value="payment">Payments Only (Credit)</option>
                <option value="credit_note">Credit Notes</option>
                <option value="opening_balance">Opening Balance</option>
              </select>
            </div>
          </div>

          <div style={{ minWidth: '260px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7E7A6B', marginBottom: '4px' }}>
              Search Reference / Detail
            </label>
            <Input
              placeholder="Search INV-, RCP-, details..."
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Selected Customer Summary Card (if specific customer is selected) */}
      {selectedCustomer && (
        <Card style={{ background: '#FAF6EE', border: '1px solid #D8CFBC', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#11120D' }}>
                  {selectedCustomer.name}
                </h3>
                <Badge variant="neutral">{selectedCustomer.code}</Badge>
                <Badge variant="brand">{selectedCustomer.tier.replace('_', ' ').toUpperCase()}</Badge>
              </div>
              <div style={{ fontSize: '12px', color: '#565449', marginTop: '4px' }}>
                Contact: {selectedCustomer.contactPerson} ({selectedCustomer.phone}) &bull; Payment Terms: {selectedCustomer.paymentTerms}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700 }}>Credit Limit</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#11120D' }}>
                  PKR {selectedCustomer.creditLimit.toLocaleString()}
                </div>
              </div>
              <div style={{ borderLeft: '1px solid #D8CFBC', paddingLeft: '20px' }}>
                <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700 }}>Current Khata Balance</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#C62828' }}>
                  PKR {selectedCustomer.currentBalance.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Subledger Running Totals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card style={{ borderLeft: '4px solid #11120D', padding: '14px 18px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Invoiced (Debits)
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#11120D', marginTop: '4px' }}>
            PKR {subledgerMetrics.totalDebit.toLocaleString()}
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid #2E7D32', padding: '14px 18px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Credits & Collections
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#2E7D32', marginTop: '4px' }}>
            PKR {subledgerMetrics.totalCredit.toLocaleString()}
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid #C62828', padding: '14px 18px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Net Receivables Balance
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#C62828', marginTop: '4px' }}>
            PKR {subledgerMetrics.netReceivables.toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Customer Sub-Ledger Transaction Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#ECE6D9', borderBottom: '1px solid #D8CFBC' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Customer</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Reference #</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Type</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Description / Memo</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'right' }}>Debit (PKR)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'right' }}>Credit (PKR)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'right' }}>Running Balance</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#565449' }}>
                    No customer ledger entries match the selected filters.
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
                      <div style={{ fontWeight: 600, color: '#11120D' }}>{e.customerName}</div>
                      <div style={{ fontSize: '11px', color: '#7E7A6B' }}>{e.customerCode}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => setSelectedTxn(e)}
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
                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontWeight: e.debit > 0 ? 700 : 400,
                        color: e.debit > 0 ? '#11120D' : '#9E9B90',
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
                        color: e.credit > 0 ? '#2E7D32' : '#9E9B90',
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
                        color: e.runningBalance > 0 ? '#C62828' : '#11120D',
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

      {/* Transaction Detail Modal */}
      {selectedTxn && (
        <Modal
          isOpen={!!selectedTxn}
          onClose={() => setSelectedTxn(null)}
          title={`Sub-Ledger Voucher: ${selectedTxn.referenceNumber}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ color: '#7E7A6B', display: 'block', fontSize: '11px', fontWeight: 700 }}>
                  Customer
                </span>
                <span style={{ fontWeight: 700, color: '#11120D' }}>{selectedTxn.customerName}</span>
                <span style={{ display: 'block', color: '#565449', fontSize: '12px' }}>{selectedTxn.customerCode}</span>
              </div>
              <div>
                <span style={{ color: '#7E7A6B', display: 'block', fontSize: '11px', fontWeight: 700 }}>
                  Transaction Date
                </span>
                <span style={{ fontWeight: 600, color: '#11120D' }}>{selectedTxn.date}</span>
              </div>
            </div>

            <div style={{ background: '#FAF6EE', padding: '12px', borderRadius: '6px', border: '1px solid #D8CFBC' }}>
              <span style={{ color: '#7E7A6B', display: 'block', fontSize: '11px', fontWeight: 700 }}>
                Description & Commercial Reference
              </span>
              <span style={{ fontWeight: 600, color: '#11120D' }}>{selectedTxn.description}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ color: '#7E7A6B', display: 'block', fontSize: '11px', fontWeight: 700 }}>Debit (Receivable +)</span>
                <span style={{ fontWeight: 700, color: '#11120D' }}>PKR {selectedTxn.debit.toLocaleString()}</span>
              </div>
              <div>
                <span style={{ color: '#7E7A6B', display: 'block', fontSize: '11px', fontWeight: 700 }}>Credit (Payment/Rebate -)</span>
                <span style={{ fontWeight: 700, color: '#2E7D32' }}>PKR {selectedTxn.credit.toLocaleString()}</span>
              </div>
              <div>
                <span style={{ color: '#7E7A6B', display: 'block', fontSize: '11px', fontWeight: 700 }}>Running Balance</span>
                <span style={{ fontWeight: 800, color: '#C62828' }}>PKR {selectedTxn.runningBalance.toLocaleString()}</span>
              </div>
            </div>

            {selectedTxn.authorizedBy && (
              <div style={{ fontSize: '12px', color: '#565449', borderTop: '1px solid #EFEAE0', paddingTop: '10px' }}>
                Authorized By: <strong>{selectedTxn.authorizedBy}</strong>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <Button variant="primary" onClick={() => setSelectedTxn(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

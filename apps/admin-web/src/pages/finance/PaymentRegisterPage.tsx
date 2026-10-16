import React, { useState, useMemo } from 'react';
import { Card, Badge, Button, Input, Modal, Alert } from '@candi/ui';
import { INITIAL_PAYMENT_REGISTER } from '../../data/paymentRegister';
import { CUSTOMERS_DATABASE } from '../../data/customers';
import { validatePaymentReference } from '@candi/validation';
import type { PaymentRegisterRecord } from '@candi/types';

export const PaymentRegisterPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRegisterRecord[]>(INITIAL_PAYMENT_REGISTER);
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRegisterRecord | null>(null);
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  // New Payment Form State (Customer Receipts)
  const [newCustomerId, setNewCustomerId] = useState<string>(CUSTOMERS_DATABASE[0].id);
  const [newMethod, setNewMethod] = useState<'cash' | 'bank_transfer' | 'cheque' | 'pay_order'>('bank_transfer');
  const [newAmount, setNewAmount] = useState<number>(25000);
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [newInvoiceRef, setNewInvoiceRef] = useState<string>('INV-2026-0046');
  const [newTxnRef, setNewTxnRef] = useState<string>('HBL-FT-772109');
  const [newNotes, setNewNotes] = useState<string>('Customer electronic transfer received in corporate account.');
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered customer receipts
  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => {
        const matchMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;
        const q = searchQuery.toLowerCase();
        const matchSearch =
          p.paymentNumber.toLowerCase().includes(q) ||
          p.partyName.toLowerCase().includes(q) ||
          p.invoiceReference.toLowerCase().includes(q) ||
          p.receiptOrTransactionRef.toLowerCase().includes(q);
        return matchMethod && matchSearch;
      })
      .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
  }, [payments, methodFilter, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    let totalCollected = 0;
    let bankTransferTotal = 0;
    let cashTotal = 0;
    let chequeTotal = 0;

    payments.forEach((p) => {
      totalCollected += p.amount;
      if (p.paymentMethod === 'bank_transfer') bankTransferTotal += p.amount;
      if (p.paymentMethod === 'cash') cashTotal += p.amount;
      if (p.paymentMethod === 'cheque' || p.paymentMethod === 'pay_order') chequeTotal += p.amount;
    });

    return { totalCollected, bankTransferTotal, cashTotal, chequeTotal };
  }, [payments]);

  // Handle Record Customer Receipt
  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();

    const val = validatePaymentReference({
      paymentMethod: newMethod,
      receiptReference: newTxnRef,
      invoiceReference: newInvoiceRef,
      amount: Number(newAmount),
    });

    if (!val.isValid) {
      setFormError(val.error || 'Validation error.');
      return;
    }

    if (!newInvoiceRef.trim()) {
      setFormError('Invoice reference is required for payment matching.');
      return;
    }

    const customer = CUSTOMERS_DATABASE.find((c) => c.id === newCustomerId) || CUSTOMERS_DATABASE[0];

    const newRec: PaymentRegisterRecord = {
      id: `pay-${Date.now()}`,
      paymentNumber: `PAY-2026-${Math.floor(100 + Math.random() * 900)}`,
      partyType: 'customer',
      partyId: customer.id,
      partyCode: customer.code,
      partyName: customer.name,
      paymentMethod: newMethod,
      amount: Number(newAmount),
      paymentDate: newDate,
      invoiceReference: newInvoiceRef.trim(),
      receiptOrTransactionRef: newTxnRef.trim(),
      recordedBy: 'Farhan Zaidi (Cashier/Accounts)',
      approvalStatus: 'approved',
      approvedBy: 'Farhan Zaidi',
      notes: newNotes,
      reconciledInGL: true,
    };

    setPayments((prev) => [newRec, ...prev]);
    setIsModalOpen(false);
    setFormError(null);
    setAlertNotice(`Payment receipt ${newRec.paymentNumber} of PKR ${newRec.amount.toLocaleString()} posted to customer khata.`);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-family-mono)', fontSize: '24px', fontWeight: 800, color: 'var(--color-smoky-black)', margin: 0 }}>
            Customer Payment Register & Khata Receipts
          </h1>
          <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '13px', color: 'var(--color-olive-drab)', margin: '4px 0 0 0' }}>
            Chronological audit register of customer inflows, bank clearances, and field COD collections.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Record Customer Receipt
        </Button>
      </div>

      {alertNotice && (
        <div style={{ marginBottom: '16px' }}>
          <Alert type="success">{alertNotice}</Alert>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Total Collections Logged
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>
            PKR {metrics.totalCollected.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            {payments.length} verified customer receipts
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Bank Transfers Received
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-smoky-black)', marginTop: '4px' }}>
            PKR {metrics.bankTransferTotal.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Corporate account direct deposits
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Cash & COD Inflows
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-smoky-black)', marginTop: '4px' }}>
            PKR {metrics.cashTotal.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Depot vault & route driver receipts
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Cheques & Pay Orders
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-smoky-black)', marginTop: '4px' }}>
            PKR {metrics.chequeTotal.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Bank clearance vouchers
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card padding="md" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <Input
              placeholder="Search receipt #, customer name, invoice #, bank ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-olive-drab)' }}>Method:</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid var(--color-bone)',
                fontSize: '13px',
              }}
            >
              <option value="all">All Payment Methods</option>
              <option value="cash">Cash / COD</option>
              <option value="bank_transfer">Bank Transfer (IBFT/RTGS)</option>
              <option value="cheque">Bank Cheque</option>
              <option value="pay_order">Pay Order</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Receipts Table */}
      <Card padding="none">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-floral-white)', borderBottom: '2px solid var(--color-bone)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Voucher #</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Customer Name</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Payment Method</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Matched Invoice</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Reference / Instrument</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Amount (PKR)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-olive-drab)' }}>
                    No payment receipts match your criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-bone)' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-family-mono)', fontWeight: 700 }}>
                      {p.paymentNumber}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-olive-drab)' }}>{p.paymentDate}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <strong>{p.partyName}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>{p.partyCode}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant="neutral">{p.paymentMethod.replace('_', ' ').toUpperCase()}</Badge>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-family-mono)' }}>
                      {p.invoiceReference}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-olive-drab)', fontSize: '12px' }}>
                      {p.receiptOrTransactionRef}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#15803d' }}>
                      PKR {p.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <Button size="sm" variant="secondary" onClick={() => setSelectedPayment(p)}>
                        View Receipt
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Record Customer Receipt */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Customer Receipt against Khata">
        <form onSubmit={handleCreatePayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {formError && <Alert type="danger">{formError}</Alert>}

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-smoky-black)', display: 'block', marginBottom: '4px' }}>
              Select Retailer / Sub-Wholesaler *
            </label>
            <select
              value={newCustomerId}
              onChange={(e) => setNewCustomerId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid var(--color-bone)',
                fontSize: '13px',
              }}
            >
              {CUSTOMERS_DATABASE.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name} ({c.tierLabel || c.category})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-smoky-black)', display: 'block', marginBottom: '4px' }}>
                Payment Channel *
              </label>
              <select
                value={newMethod}
                onChange={(e) => setNewMethod(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--color-bone)',
                  fontSize: '13px',
                }}
              >
                <option value="bank_transfer">Bank Transfer (IBFT/RTGS)</option>
                <option value="cash">Cash / Delivery COD</option>
                <option value="cheque">Bank Cheque</option>
                <option value="pay_order">Bank Pay Order</option>
              </select>
            </div>
            <Input
              label="Receipt Date *"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Amount Received (PKR) *"
              type="number"
              value={newAmount.toString()}
              onChange={(e) => setNewAmount(Number(e.target.value))}
              required
            />
            <Input
              label="Matched Invoice Number *"
              placeholder="e.g. INV-2026-0046"
              value={newInvoiceRef}
              onChange={(e) => setNewInvoiceRef(e.target.value)}
              required
            />
          </div>

          <Input
            label="Transaction Reference / Cheque Number *"
            placeholder="e.g. HBL-FT-99201 or CHQ-448102"
            value={newTxnRef}
            onChange={(e) => setNewTxnRef(e.target.value)}
            required
          />

          <Input
            label="Deposit Slip / Collection Notes"
            placeholder="e.g. Deposited in HBL Wholesale Account #0042..."
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              ✓ Post Receipt to Customer Khata
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Receipt Details */}
      {selectedPayment && (
        <Modal isOpen={true} onClose={() => setSelectedPayment(null)} title={`Payment Voucher: ${selectedPayment.paymentNumber}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ color: 'var(--color-olive-drab)' }}>Customer:</span>{' '}
                <strong>{selectedPayment.partyName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)' }}>Customer Code:</span>{' '}
                <code>{selectedPayment.partyCode}</code>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)' }}>Receipt Date:</span>{' '}
                <span>{selectedPayment.paymentDate}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)' }}>Payment Channel:</span>{' '}
                <Badge variant="neutral">{selectedPayment.paymentMethod.replace('_', ' ').toUpperCase()}</Badge>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)' }}>Matched Invoice:</span>{' '}
                <code>{selectedPayment.invoiceReference}</code>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)' }}>Instrument / Reference:</span>{' '}
                <code>{selectedPayment.receiptOrTransactionRef}</code>
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: '#dcfce7', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>CREDITED TO CUSTOMER KHATA</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#15803d' }}>
                PKR {selectedPayment.amount.toLocaleString()}
              </div>
            </div>

            {selectedPayment.notes && (
              <div style={{ padding: '10px', backgroundColor: 'var(--color-bone)', borderRadius: '4px' }}>
                📝 {selectedPayment.notes}
              </div>
            )}

            <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>
              Recorded By: <strong>{selectedPayment.recordedBy}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button variant="secondary" onClick={() => setSelectedPayment(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

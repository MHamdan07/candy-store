import React, { useState, useMemo } from 'react';
import { Card, Badge, Button, Input, Modal, Alert } from '@candi/ui';
import { INITIAL_PAYMENT_REGISTER } from '../../data/paymentRegister';
import { CUSTOMERS_DATABASE } from '../../data/customers';
import { INITIAL_SUPPLIERS } from '../../data/suppliers';
import { validatePaymentReference } from '@candi/validation';
import type { PaymentRegisterRecord, PaymentPartyType } from '@candi/types';

export const PaymentRegisterPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRegisterRecord[]>(INITIAL_PAYMENT_REGISTER);
  const [partyTypeFilter, setPartyTypeFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [reconciliationFilter, setReconciliationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRegisterRecord | null>(null);
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  // New Payment Form State
  const [newPartyType, setNewPartyType] = useState<PaymentPartyType>('customer');
  const [newPartyId, setNewPartyId] = useState<string>(CUSTOMERS_DATABASE[0].id);
  const [newMethod, setNewMethod] = useState<'cash' | 'bank_transfer' | 'cheque' | 'pay_order'>('bank_transfer');
  const [newAmount, setNewAmount] = useState<number>(25000);
  const [newDate, setNewDate] = useState<string>('2026-09-17');
  const [newInvoiceRef, setNewInvoiceRef] = useState<string>('INV-2026-0046');
  const [newTxnRef, setNewTxnRef] = useState<string>('HBL-FT-772109');
  const [newNotes, setNewNotes] = useState<string>('Customer electronic transfer received in corporate account.');
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchType = partyTypeFilter === 'all' || p.partyType === partyTypeFilter;
      const matchMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;
      const matchRecon =
        reconciliationFilter === 'all' ||
        (reconciliationFilter === 'reconciled' && p.reconciledInGL) ||
        (reconciliationFilter === 'unreconciled' && !p.reconciledInGL);
      const q = searchQuery.toLowerCase();
      const matchSearch =
        p.paymentNumber.toLowerCase().includes(q) ||
        p.partyName.toLowerCase().includes(q) ||
        p.invoiceReference.toLowerCase().includes(q) ||
        p.receiptOrTransactionRef.toLowerCase().includes(q);
      return matchType && matchMethod && matchRecon && matchSearch;
    }).sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
  }, [payments, partyTypeFilter, methodFilter, reconciliationFilter, searchQuery]);

  // Aggregate metrics
  const metrics = useMemo(() => {
    let customerInflows = 0;
    let supplierOutflows = 0;
    let pendingApprovalCount = 0;
    let unreconciledCount = 0;

    payments.forEach((p) => {
      if (p.partyType === 'customer') {
        customerInflows += p.amount;
      } else {
        supplierOutflows += p.amount;
      }
      if (p.approvalStatus === 'pending_approval') {
        pendingApprovalCount += 1;
      }
      if (!p.reconciledInGL) {
        unreconciledCount += 1;
      }
    });

    const netCashFlow = customerInflows - supplierOutflows;
    return { customerInflows, supplierOutflows, netCashFlow, pendingApprovalCount, unreconciledCount };
  }, [payments]);

  // Handle Create Payment
  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce validation rule
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
      setFormError('Invoice reference is strictly required.');
      return;
    }

    let partyCode = '';
    let partyName = '';

    if (newPartyType === 'customer') {
      const c = CUSTOMERS_DATABASE.find((x) => x.id === newPartyId) || CUSTOMERS_DATABASE[0];
      partyCode = c.code;
      partyName = c.name;
    } else {
      const s = INITIAL_SUPPLIERS.find((x) => x.id === newPartyId) || INITIAL_SUPPLIERS[0];
      partyCode = s.code;
      partyName = s.name;
    }

    const newRec: PaymentRegisterRecord = {
      id: `pay-${Date.now()}`,
      paymentNumber: `PAY-2026-${Math.floor(100 + Math.random() * 900)}`,
      partyType: newPartyType,
      partyId: newPartyId,
      partyCode,
      partyName,
      paymentMethod: newMethod,
      amount: Number(newAmount),
      paymentDate: newDate,
      invoiceReference: newInvoiceRef.trim(),
      receiptOrTransactionRef: newTxnRef.trim(),
      recordedBy: 'Farhan Zaidi (Cashier/Controller)',
      approvalStatus: 'approved',
      approvedBy: 'Farhan Zaidi',
      notes: newNotes,
      reconciledInGL: false,
    };

    setPayments((prev) => [newRec, ...prev]);
    setIsModalOpen(false);
    setFormError(null);
    setAlertNotice(`Payment voucher ${newRec.paymentNumber} of PKR ${newRec.amount.toLocaleString()} recorded successfully.`);
  };

  // Quick Approval
  const handleApprove = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === paymentId) {
          return {
            ...p,
            approvalStatus: 'reconciled',
            approvedBy: 'Farhan Zaidi',
            reconciledInGL: true,
          };
        }
        return p;
      })
    );
    setAlertNotice(`Payment ${paymentId} approved and marked reconciled in GL.`);
  };

  const getMethodBadge = (m: string) => {
    switch (m) {
      case 'bank_transfer':
        return <Badge variant="brand">Bank RTGS</Badge>;
      case 'cash':
        return <Badge variant="success">Cash</Badge>;
      case 'cheque':
        return <Badge variant="warning">Cheque</Badge>;
      case 'pay_order':
        return <Badge variant="neutral">Pay Order</Badge>;
      default:
        return <Badge variant="neutral">{m}</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-text, #11120D)' }}>
              Payment Register
            </h1>
            <Badge variant="brand">Inflows & Disbursements</Badge>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-secondary-text, #565449)', fontSize: '14px' }}>
            Master clearing register recording customer settlements, supplier bank payouts, payment receipts, and cheque clearances.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Record Payment
        </Button>
      </div>

      {alertNotice && (
        <Alert type="success">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{alertNotice}</span>
            <button
              onClick={() => setAlertNotice(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        </Alert>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card style={{ borderLeft: '4px solid #2E7D32', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Customer Inflows (Collections)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#2E7D32', marginTop: '4px' }}>
            PKR {metrics.customerInflows.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#565449', marginTop: '2px' }}>Cash & Bank settlements</div>
        </Card>

        <Card style={{ borderLeft: '4px solid #C62828', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Supplier Outflows (Disbursements)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#C62828', marginTop: '4px' }}>
            PKR {metrics.supplierOutflows.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#565449', marginTop: '2px' }}>3-way matched supplier payments</div>
        </Card>

        <Card style={{ borderLeft: '4px solid #11120D', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Net Operating Cash Variance
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#11120D', marginTop: '4px' }}>
            PKR {metrics.netCashFlow.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#565449', marginTop: '2px' }}>Current clearing flow balance</div>
        </Card>

        <Card style={{ borderLeft: '4px solid #B8860B', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Pending Authorization
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#8A5D00', marginTop: '4px' }}>
            {metrics.pendingApprovalCount} Vouchers
          </div>
          <div style={{ fontSize: '12px', color: '#565449', marginTop: '2px' }}>Awaiting dual CFO sign-off</div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7E7A6B', marginBottom: '4px' }}>
                Party Flow
              </label>
              <select
                value={partyTypeFilter}
                onChange={(e) => setPartyTypeFilter(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '6px',
                  border: '1px solid #D8CFBC',
                  background: '#FFFBF4',
                  fontSize: '13px',
                  color: '#11120D',
                }}
              >
                <option value="all">All Flows (Inflows & Outflows)</option>
                <option value="customer">Customer Collections Only (Inflow)</option>
                <option value="supplier">Supplier Payouts Only (Outflow)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7E7A6B', marginBottom: '4px' }}>
                Payment Method
              </label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '6px',
                  border: '1px solid #D8CFBC',
                  background: '#FFFBF4',
                  fontSize: '13px',
                  color: '#11120D',
                }}
              >
                <option value="all">All Methods</option>
                <option value="bank_transfer">Bank Transfer (RTGS)</option>
                <option value="cash">Cash on Delivery / Drawer</option>
                <option value="cheque">Cheque Clearing</option>
                <option value="pay_order">Pay Order</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7E7A6B', marginBottom: '4px' }}>
                GL Reconciliation
              </label>
              <select
                value={reconciliationFilter}
                onChange={(e) => setReconciliationFilter(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '6px',
                  border: '1px solid #D8CFBC',
                  background: '#FFFBF4',
                  fontSize: '13px',
                  color: '#11120D',
                }}
              >
                <option value="all">All ({payments.length})</option>
                <option value="unreconciled">⚠️ Unreconciled Only ({metrics.unreconciledCount})</option>
                <option value="reconciled">✓ Reconciled in GL</option>
              </select>
            </div>
          </div>

          <div style={{ minWidth: '260px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7E7A6B', marginBottom: '4px' }}>
              Search Payment / Reference #
            </label>
            <Input
              placeholder="Search PAY-, INV-, Cheque #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Payment Register Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#ECE6D9', borderBottom: '1px solid #D8CFBC' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Payment #</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Party (Customer / Supplier)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Flow</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Method</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Invoice Ref</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Receipt / Bank Ref</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'right' }}>Amount (PKR)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '32px', textAlign: 'center', color: '#565449' }}>
                    No payment records found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p, index) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid #EFEAE0',
                      background: index % 2 === 0 ? '#FFFFFF' : '#FAF6EE',
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => setSelectedPayment(p)}
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
                        {p.paymentNumber}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#565449', whiteSpace: 'nowrap' }}>{p.paymentDate}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#11120D' }}>{p.partyName}</div>
                      <div style={{ fontSize: '11px', color: '#7E7A6B' }}>{p.partyCode}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant={p.partyType === 'customer' ? 'success' : 'danger'}>
                        {p.partyType === 'customer' ? 'INFLOW' : 'OUTFLOW'}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{getMethodBadge(p.paymentMethod)}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600 }}>{p.invoiceReference}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#565449' }}>
                      {p.receiptOrTransactionRef}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        color: p.partyType === 'customer' ? '#2E7D32' : '#C62828',
                      }}
                    >
                      PKR {p.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Badge
                          variant={
                            p.approvalStatus === 'reconciled'
                              ? 'success'
                              : p.approvalStatus === 'approved'
                              ? 'brand'
                              : 'warning'
                          }
                        >
                          {p.approvalStatus.toUpperCase()}
                        </Badge>
                        {p.reconciledInGL ? (
                          <span style={{ fontSize: '11px', color: '#2E7D32', fontWeight: 600 }}>✓ Reconciled in GL</span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#B8860B', fontWeight: 700 }}>⚠️ Unreconciled in GL</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {p.approvalStatus === 'pending_approval' ? (
                        <button
                          onClick={() => handleApprove(p.id)}
                          style={{
                            padding: '4px 10px',
                            background: '#2E7D32',
                            color: '#FFFBF4',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Approve
                        </button>
                      ) : !p.reconciledInGL ? (
                        <button
                          onClick={() => {
                            setPayments((prev) =>
                              prev.map((item) =>
                                item.id === p.id ? { ...item, reconciledInGL: true } : item
                              )
                            );
                            setAlertNotice(`Payment ${p.paymentNumber} marked reconciled in GL drawer.`);
                          }}
                          style={{
                            padding: '4px 8px',
                            background: '#FFFBF4',
                            border: '1px solid #2E7D32',
                            color: '#2E7D32',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Reconcile to GL
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#2E7D32', fontWeight: 600 }}>✓ Reconciled</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setFormError(null);
          }}
          title="Record Payment / Disbursement Voucher"
        >
          <form onSubmit={handleCreatePayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {formError && <Alert type="danger">{formError}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                  Transaction Flow *
                </label>
                <select
                  value={newPartyType}
                  onChange={(e) => {
                    const pt = e.target.value as PaymentPartyType;
                    setNewPartyType(pt);
                    setNewPartyId(pt === 'customer' ? CUSTOMERS_DATABASE[0].id : INITIAL_SUPPLIERS[0].id);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #D8CFBC',
                    background: '#FFFBF4',
                    fontSize: '13px',
                  }}
                >
                  <option value="customer">Customer Inflow (Collection)</option>
                  <option value="supplier">Supplier Outflow (Disbursement)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                  Party Account *
                </label>
                <select
                  value={newPartyId}
                  onChange={(e) => setNewPartyId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #D8CFBC',
                    background: '#FFFBF4',
                    fontSize: '13px',
                  }}
                >
                  {newPartyType === 'customer'
                    ? CUSTOMERS_DATABASE.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </option>
                      ))
                    : INITIAL_SUPPLIERS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                  Payment Method *
                </label>
                <select
                  value={newMethod}
                  onChange={(e) => setNewMethod(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #D8CFBC',
                    background: '#FFFBF4',
                    fontSize: '13px',
                  }}
                >
                  <option value="bank_transfer">Bank Transfer (HBL RTGS)</option>
                  <option value="cash">Cash on Hand / Drawer</option>
                  <option value="cheque">Cross Cheque</option>
                  <option value="pay_order">Bank Pay Order</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                  Payment Date *
                </label>
                <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                  Payment Amount (PKR) *
                </label>
                <Input
                  type="number"
                  value={newAmount.toString()}
                  onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                  Mandatory Invoice Reference *
                </label>
                <Input
                  placeholder="e.g. INV-2026-0046 or INV-NAT-9921"
                  value={newInvoiceRef}
                  onChange={(e) => setNewInvoiceRef(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                Bank Transaction Ref / Cheque # / Cash Slip *
              </label>
              <Input
                placeholder="e.g. HBL-FT-992014, CHQ-882901"
                value={newTxnRef}
                onChange={(e) => setNewTxnRef(e.target.value)}
                required
              />
              <div style={{ fontSize: '11px', color: '#7E7A6B', marginTop: '2px' }}>
                Dual-entry audit control: all non-cash settlements require a verified banking token.
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                Notes / Audit Remarks
              </label>
              <Input value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setFormError(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Submit & Record Voucher
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <Modal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          title={`Payment Voucher: ${selectedPayment.paymentNumber}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ color: '#7E7A6B', display: 'block', fontSize: '11px', fontWeight: 700 }}>Beneficiary / Payee</span>
                <span style={{ fontWeight: 700, color: '#11120D' }}>{selectedPayment.partyName}</span>
                <span style={{ display: 'block', color: '#565449', fontSize: '12px' }}>{selectedPayment.partyCode}</span>
              </div>
              <div>
                <span style={{ color: '#7E7A6B', display: 'block', fontSize: '11px', fontWeight: 700 }}>Posting Date</span>
                <span style={{ fontWeight: 600, color: '#11120D' }}>{selectedPayment.paymentDate}</span>
                <span style={{ display: 'block', color: '#2E7D32', fontSize: '12px', fontWeight: 600 }}>
                  {selectedPayment.paymentMethod.toUpperCase()}
                </span>
              </div>
            </div>

            <div style={{ background: '#FAF6EE', padding: '12px', borderRadius: '6px', border: '1px solid #D8CFBC' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ color: '#7E7A6B', fontSize: '11px', fontWeight: 700, display: 'block' }}>Linked Invoice</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{selectedPayment.invoiceReference}</span>
                </div>
                <div>
                  <span style={{ color: '#7E7A6B', fontSize: '11px', fontWeight: 700, display: 'block' }}>Banking Reference</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{selectedPayment.receiptOrTransactionRef}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#7E7A6B', fontSize: '11px', fontWeight: 700, display: 'block' }}>Amount</span>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: selectedPayment.partyType === 'customer' ? '#2E7D32' : '#C62828',
                  }}
                >
                  PKR {selectedPayment.amount.toLocaleString()}
                </span>
              </div>
              <Badge variant={selectedPayment.reconciledInGL ? 'success' : 'brand'}>
                {selectedPayment.reconciledInGL ? 'GL RECONCILED' : 'PENDING RECONCILIATION'}
              </Badge>
            </div>

            <div style={{ fontSize: '12px', color: '#565449', borderTop: '1px solid #EFEAE0', paddingTop: '10px' }}>
              Recorded by: <strong>{selectedPayment.recordedBy}</strong>
              {selectedPayment.approvedBy && (
                <div>
                  Approved by: <strong>{selectedPayment.approvedBy}</strong>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <Button variant="primary" onClick={() => setSelectedPayment(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

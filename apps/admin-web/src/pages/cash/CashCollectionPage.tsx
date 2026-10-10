import React, { useState, useMemo } from 'react';
import { Card, Badge, Button, Input, Modal, Alert } from '@candi/ui';
import { INITIAL_CASH_COLLECTIONS } from '../../data/cashManagement';
import { CUSTOMERS_DATABASE } from '../../data/customers';
import type { CashCollectionRecord, CashPaymentMethod } from '@candi/types';

export const CashCollectionPage: React.FC = () => {
  const [collections, setCollections] = useState<CashCollectionRecord[]>(INITIAL_CASH_COLLECTIONS);
  const [selectedCollector, setSelectedCollector] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [receiptVoucher, setReceiptVoucher] = useState<CashCollectionRecord | null>(null);
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  // Form State
  const [collectorName, setCollectorName] = useState<string>('Asif Nawaz (Driver Fleet Van #3)');
  const [customerId, setCustomerId] = useState<string>(CUSTOMERS_DATABASE[0].id);
  const [invoiceRef, setInvoiceRef] = useState<string>('INV-2026-0044');
  const [amount, setAmount] = useState<number>(20000);
  const [method, setMethod] = useState<CashPaymentMethod>('cash');
  const [collectionDate, setCollectionDate] = useState<string>('2026-09-18');
  const [notes, setNotes] = useState<string>('Retailer store delivery COD cash payment.');
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered collections
  const filtered = useMemo(() => {
    return collections.filter((c) => {
      const matchCollector = selectedCollector === 'all' || c.collectorName.includes(selectedCollector);
      const matchStatus = selectedStatus === 'all' || c.handoverStatus === selectedStatus;
      const q = searchQuery.toLowerCase();
      const matchQ =
        c.receiptNumber.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.invoiceReference.toLowerCase().includes(q) ||
        c.collectorName.toLowerCase().includes(q);
      return matchCollector && matchStatus && matchQ;
    }).sort((a, b) => b.collectionDate.localeCompare(a.collectionDate));
  }, [collections, selectedCollector, selectedStatus, searchQuery]);

  // Aggregate stats
  const stats = useMemo(() => {
    let totalCollected = 0;
    let pendingHandover = 0;
    let reconciled = 0;

    collections.forEach((c) => {
      totalCollected += c.amountReceived;
      if (c.handoverStatus === 'pending_handover') pendingHandover += c.amountReceived;
      if (c.handoverStatus === 'reconciled') reconciled += c.amountReceived;
    });

    return { totalCollected, pendingHandover, reconciled };
  }, [collections]);

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      setFormError('Collection amount must be greater than zero.');
      return;
    }
    if (!invoiceRef.trim()) {
      setFormError('Invoice reference is mandatory.');
      return;
    }

    const customer = CUSTOMERS_DATABASE.find((c) => c.id === customerId) || CUSTOMERS_DATABASE[0];
    const receiptNumber = `RCP-CSH-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newRecord: CashCollectionRecord = {
      id: `col-${Date.now()}`,
      receiptNumber,
      collectorId: 'staff-driver',
      collectorName,
      customerId: customer.id,
      customerCode: customer.code,
      customerName: customer.name,
      invoiceReference: invoiceRef.trim(),
      amountReceived: Number(amount),
      paymentMethod: method,
      collectionDate,
      handoverStatus: 'pending_handover',
      notes,
      createdAt: `${collectionDate} ${new Date().toLocaleTimeString().slice(0, 5)}`,
    };

    setCollections((prev) => [newRecord, ...prev]);
    setIsModalOpen(false);
    setFormError(null);
    setAlertNotice(`Official receipt ${newRecord.receiptNumber} recorded for ${newRecord.customerName}.`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reconciled':
        return <Badge variant="success">Vault Reconciled</Badge>;
      case 'handed_over':
        return <Badge variant="brand">Handed Over</Badge>;
      case 'pending_handover':
        return <Badge variant="warning">In Driver Possession</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-text, #11120D)' }}>
              Field Cash Collections
            </h1>
            <Badge variant="brand">Route COD & Recovery</Badge>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-secondary-text, #565449)', fontSize: '14px' }}>
            Log and track every rupee collected by fleet drivers and recovery officers at retail shop counters with unique receipt tracking.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Record Field Collection
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

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card style={{ borderLeft: '4px solid #11120D', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Collections Logged
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#11120D', marginTop: '4px' }}>
            PKR {stats.totalCollected.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#565449', marginTop: '2px' }}>{collections.length} Official Receipts</div>
        </Card>

        <Card style={{ borderLeft: '4px solid #B8860B', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            In Transit (Driver Hands)
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#8A5D00', marginTop: '4px' }}>
            PKR {stats.pendingHandover.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#565449', marginTop: '2px' }}>Awaiting depot handover</div>
        </Card>

        <Card style={{ borderLeft: '4px solid #2E7D32', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, textTransform: 'uppercase' }}>
            Reconciled in Depot Vault
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#2E7D32', marginTop: '4px' }}>
            PKR {stats.reconciled.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#565449', marginTop: '2px' }}>Counted & posted to GL 1010</div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7E7A6B', marginBottom: '4px' }}>
                Collector / Driver
              </label>
              <select
                value={selectedCollector}
                onChange={(e) => setSelectedCollector(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '6px',
                  border: '1px solid #D8CFBC',
                  background: '#FFFBF4',
                  fontSize: '13px',
                  color: '#11120D',
                }}
              >
                <option value="all">All Field Collectors</option>
                <option value="Asif Nawaz">Asif Nawaz (Fleet Van #3)</option>
                <option value="Zubair Shah">Zubair Shah (Fleet Van #1)</option>
                <option value="Tariq Mehmood">Tariq Mehmood (Recovery Lead)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7E7A6B', marginBottom: '4px' }}>
                Handover Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '6px',
                  border: '1px solid #D8CFBC',
                  background: '#FFFBF4',
                  fontSize: '13px',
                  color: '#11120D',
                }}
              >
                <option value="all">All Statuses</option>
                <option value="pending_handover">Pending Handover (Driver Possession)</option>
                <option value="handed_over">Handed Over to Depot</option>
                <option value="reconciled">Reconciled in Vault</option>
              </select>
            </div>
          </div>

          <div style={{ minWidth: '260px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#7E7A6B', marginBottom: '4px' }}>
              Search Receipt / Customer / Invoice
            </label>
            <Input
              placeholder="Search RCP-, INV-, shop name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Collections Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#ECE6D9', borderBottom: '1px solid #D8CFBC' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Receipt #</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Collector / Driver</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Customer</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Invoice Ref</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'right' }}>Amount (PKR)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Method</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D' }}>Handover Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#11120D', textAlign: 'center' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#565449' }}>
                    No cash collection records match the filter.
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: '1px solid #EFEAE0',
                      background: idx % 2 === 0 ? '#FFFFFF' : '#FAF6EE',
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#1565C0' }}>
                        {c.receiptNumber}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#565449', whiteSpace: 'nowrap' }}>
                      {c.collectionDate}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#11120D' }}>{c.collectorName}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#11120D' }}>{c.customerName}</div>
                      <div style={{ fontSize: '11px', color: '#7E7A6B' }}>{c.customerCode}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600 }}>
                      {c.invoiceReference}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        color: '#2E7D32',
                      }}
                    >
                      PKR {c.amountReceived.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant="brand">{c.paymentMethod.toUpperCase()}</Badge>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{getStatusBadge(c.handoverStatus)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => setReceiptVoucher(c)}
                        style={{
                          padding: '4px 8px',
                          background: '#FFFBF4',
                          border: '1px solid #D8CFBC',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          color: '#1565C0',
                        }}
                      >
                        View Voucher
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Collection Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setFormError(null);
          }}
          title="Record Field Cash Collection"
        >
          <form onSubmit={handleCreateCollection} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {formError && <Alert type="danger">{formError}</Alert>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                  Field Collector / Driver *
                </label>
                <select
                  value={collectorName}
                  onChange={(e) => setCollectorName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #D8CFBC',
                    background: '#FFFBF4',
                    fontSize: '13px',
                  }}
                >
                  <option value="Asif Nawaz (Driver Fleet Van #3)">Asif Nawaz (Fleet Van #3)</option>
                  <option value="Zubair Shah (Driver Fleet Van #1)">Zubair Shah (Fleet Van #1)</option>
                  <option value="Tariq Mehmood (Field Recovery Lead)">Tariq Mehmood (Recovery Lead)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                  Customer Account *
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #D8CFBC',
                    background: '#FFFBF4',
                    fontSize: '13px',
                  }}
                >
                  {CUSTOMERS_DATABASE.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                  Invoice Reference *
                </label>
                <Input
                  placeholder="e.g. INV-2026-0044"
                  value={invoiceRef}
                  onChange={(e) => setInvoiceRef(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                  Amount Received (PKR) *
                </label>
                <Input
                  type="number"
                  value={amount.toString()}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                  Payment Method *
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as CashPaymentMethod)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #D8CFBC',
                    background: '#FFFBF4',
                    fontSize: '13px',
                  }}
                >
                  <option value="cash">Cash (Currency Notes)</option>
                  <option value="cheque">Cross Cheque</option>
                  <option value="pay_order">Bank Pay Order</option>
                  <option value="bank_deposit_slip">Customer Bank Deposit Slip</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                  Collection Date *
                </label>
                <Input type="date" value={collectionDate} onChange={(e) => setCollectionDate(e.target.value)} required />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#11120D' }}>
                Field Notes / Shopkeeper Remarks
              </label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
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
                Record & Generate Receipt
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Receipt Voucher Modal */}
      {receiptVoucher && (
        <Modal
          isOpen={!!receiptVoucher}
          onClose={() => setReceiptVoucher(null)}
          title={`Official Collection Receipt: ${receiptVoucher.receiptNumber}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
            <div
              style={{
                border: '2px dashed #11120D',
                padding: '16px',
                borderRadius: '8px',
                background: '#FAF6EE',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #D8CFBC', paddingBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#11120D' }}>CANDI SUPER STORE WHOLESALE</div>
                  <div style={{ fontSize: '11px', color: '#565449' }}>Karachi Central Confectionery Distribution Depot</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1565C0', fontFamily: 'monospace' }}>
                    {receiptVoucher.receiptNumber}
                  </div>
                  <div style={{ fontSize: '11px', color: '#7E7A6B' }}>Date: {receiptVoucher.collectionDate}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, display: 'block' }}>Received From</span>
                  <span style={{ fontWeight: 700, color: '#11120D' }}>{receiptVoucher.customerName}</span>
                  <span style={{ display: 'block', fontSize: '11px', color: '#565449' }}>Account: {receiptVoucher.customerCode}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#7E7A6B', fontWeight: 700, display: 'block' }}>Settling Invoice</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{receiptVoucher.invoiceReference}</span>
                  <span style={{ display: 'block', fontSize: '11px', color: '#565449' }}>
                    Method: {receiptVoucher.paymentMethod.toUpperCase()}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '16px', padding: '12px', background: '#EFEAE0', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#11120D', fontSize: '14px' }}>Amount Received:</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#2E7D32', fontFamily: 'monospace' }}>
                    PKR {receiptVoucher.amountReceived.toLocaleString()}
                  </span>
                </div>
                {receiptVoucher.notes && (
                  <div style={{ fontSize: '11px', color: '#565449', marginTop: '4px' }}>
                    Remarks: {receiptVoucher.notes}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #D8CFBC' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#7E7A6B', display: 'block' }}>Collector / Driver Signature</span>
                  <span style={{ fontWeight: 700, fontSize: '12px' }}>{receiptVoucher.collectorName}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '10px', color: '#7E7A6B', display: 'block' }}>Depot Handover Status</span>
                  {getStatusBadge(receiptVoucher.handoverStatus)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button variant="secondary" onClick={() => window.print()}>
                🖨️ Print Receipt
              </Button>
              <Button variant="primary" onClick={() => setReceiptVoucher(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

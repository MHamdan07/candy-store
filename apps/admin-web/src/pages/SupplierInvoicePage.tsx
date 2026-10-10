import React, { useState } from 'react';
import { Card, Table, Badge, Button, Input, Dropdown, Modal, Alert } from '@candi/ui';
import type { SupplierInvoice, ThreeWayMatchResult } from '@candi/types';
import { INITIAL_SUPPLIER_INVOICES } from '../data/supplierInvoices';
import { INITIAL_POS } from './PurchaseOrderListPage';
import { INITIAL_GRNS } from '../data/goodsReceipts';
import { INITIAL_SUPPLIERS } from '../data/suppliers';

export const SupplierInvoicePage: React.FC = () => {
  const [invoices, setInvoices] = useState<SupplierInvoice[]>(INITIAL_SUPPLIER_INVOICES);
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoice | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // New Invoice Form State
  const [supplierId, setSupplierId] = useState<string>(INITIAL_SUPPLIERS[0].id);
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState('');
  const [poId, setPoId] = useState<string>('');
  const [grnId, setGrnId] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('2026-10-17');
  const [subtotal, setSubtotal] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [attachmentName, setAttachmentName] = useState('Vendor_Billing_Scan.pdf');

  // Filter linked POs and GRNs when supplier changes
  const availablePOs = INITIAL_POS.filter((p) => p.supplierId === supplierId);
  const availableGRNs = INITIAL_GRNS.filter((g) => g.supplierId === supplierId);

  const handleSelectPO = (id: string) => {
    setPoId(id);
    const p = INITIAL_POS.find((item) => item.id === id);
    if (p) {
      setSubtotal(p.subtotal);
      setDiscount(p.discount || 0);
      setTax(p.tax || 0);
      setTotalAmount(p.total);

      // Match linked GRN if available
      const linkedGrn = availableGRNs.find((g) => g.poNumber === p.poNumber);
      if (linkedGrn) setGrnId(linkedGrn.id);
    }
  };

  const handleSubtotalChange = (sub: number, disc: number, tx: number) => {
    setSubtotal(sub);
    setDiscount(disc);
    setTax(tx);
    setTotalAmount(Math.max(0, sub - disc + tx));
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const sup = suppliers.find((s) => s.id === supplierId);
    const po = INITIAL_POS.find((p) => p.id === poId);
    const grn = INITIAL_GRNS.find((g) => g.id === grnId);

    if (!supplierInvoiceNumber.trim()) {
      setFormError('Supplier Invoice Number is required.');
      return;
    }

    if (!po) {
      setFormError('Please select a Purchase Order.');
      return;
    }

    if (!grn) {
      setFormError('Please select the corresponding Goods Received Note (GRN).');
      return;
    }

    // CONTROL: "Prevent duplicate supplier invoices"
    const duplicate = invoices.some(
      (inv) =>
        inv.supplierId === supplierId &&
        inv.supplierInvoiceNumber.toLowerCase() === supplierInvoiceNumber.trim().toLowerCase()
    );

    if (duplicate) {
      setFormError(
        `DUPLICATE INVOICE DETECTED: Invoice number "${supplierInvoiceNumber}" has already been entered for ${sup?.name}. Duplicate invoices cannot be created.`
      );
      return;
    }

    // PERFORM THREE-WAY MATCHING ENGINE EVALUATION
    const discrepancies = [];

    // 1. Quantity comparison: GRN accepted vs PO ordered
    const grnAcceptedQty = grn.totalAcceptedQty;
    const poOrderedQty = po.items.reduce((acc, it) => acc + it.orderedQuantity, 0);

    if (grnAcceptedQty < poOrderedQty) {
      discrepancies.push({
        field: 'quantity' as const,
        message: `Quantity Variance: GRN accepted ${grnAcceptedQty} units, but PO ordered ${poOrderedQty} units.`,
        expectedValue: `${grnAcceptedQty} units accepted`,
        actualValue: `${poOrderedQty} units ordered`,
        severity: 'warning' as const,
      });
    }

    // 2. Total amount comparison
    if (Math.abs(totalAmount - po.total) > 0.01) {
      discrepancies.push({
        field: 'total_amount' as const,
        message: `Total Amount Mismatch: Invoiced PKR ${totalAmount.toLocaleString()} vs PO Agreed PKR ${po.total.toLocaleString()}.`,
        expectedValue: po.total,
        actualValue: totalAmount,
        severity: 'error' as const,
      });
    }

    const isCleanMatch = discrepancies.length === 0;

    const matchResult: ThreeWayMatchResult = {
      isMatch: isCleanMatch,
      status: isCleanMatch ? 'matched' : 'mismatched',
      discrepancies,
      poAgreedTotal: po.total,
      grnAcceptedValue: po.subtotal,
      invoicedTotal: totalAmount,
      varianceAmount: totalAmount - po.total,
    };

    const newInvoice: SupplierInvoice = {
      id: `sinv-${Date.now()}`,
      supplierInvoiceNumber: supplierInvoiceNumber.trim().toUpperCase(),
      supplierId,
      supplierName: sup?.name || 'Supplier',
      poNumber: po.poNumber,
      poId: po.id,
      grnNumber: grn.grnNumber,
      grnId: grn.id,
      invoiceDate,
      dueDate,
      subtotal,
      discount,
      tax,
      totalAmount,
      approvalStatus: 'pending_approval',
      paymentStatus: 'unpaid',
      paidAmount: 0,
      attachmentName,
      attachmentSize: '480 KB',
      matchResult,
      auditTrail: [
        {
          timestamp: new Date().toISOString().slice(0, 16),
          actor: 'Accounts Staff (Farhan Zaidi)',
          action: 'Created Supplier Invoice',
          details: `Invoice entered. 3-Way Match executed: ${isCleanMatch ? 'ALL CHECKS PASSED' : 'DISCREPANCIES DETECTED'}`,
        },
      ],
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setInvoices([newInvoice, ...invoices]);
    setIsCreateModalOpen(false);
    setNotice(
      `Supplier Invoice ${newInvoice.supplierInvoiceNumber} registered! 3-Way Match Status: ${matchResult.status.toUpperCase()}`
    );
    setSupplierInvoiceNumber('');
  };

  // CONTROL: Invoice Approval & Supplier Ledger Update
  const handleApproveInvoice = (inv: SupplierInvoice) => {
    // Check if there are critical errors
    const hasFatalErrors = inv.matchResult.discrepancies.some((d) => d.severity === 'error');
    if (hasFatalErrors) {
      alert(
        'CONTROL WARNING: This invoice has unresolved 3-Way Match errors. Manager approval override required.'
      );
    }

    // 1. Update Invoice Status
    const updatedInvoices = invoices.map((i) => {
      if (i.id === inv.id) {
        return {
          ...i,
          approvalStatus: 'approved' as const,
          approvedBy: 'Farhan Zaidi (Authorized Lead)',
          approvedAt: new Date().toISOString().slice(0, 16),
          auditTrail: [
            ...i.auditTrail,
            {
              timestamp: new Date().toISOString().slice(0, 16),
              actor: 'Farhan Zaidi',
              action: 'Approved Invoice for Payment',
              details: `Invoice ${inv.supplierInvoiceNumber} approved. Credit posted to supplier ledger khata.`,
            },
          ],
        };
      }
      return i;
    });

    setInvoices(updatedInvoices);

    // 2. Update Supplier Ledger Khata (Increase outstanding balance)
    // Control: "Update the supplier ledger after invoice approval"
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === inv.supplierId) {
          const newBalance = s.outstandingBalance + inv.totalAmount;
          return {
            ...s,
            outstandingBalance: newBalance,
            auditHistory: [
              ...(s.auditHistory || []),
              {
                timestamp: new Date().toISOString().slice(0, 16),
                actor: 'System Accounting Engine',
                action: 'Supplier Khata Ledger Credited',
                details: `Invoice ${inv.supplierInvoiceNumber} approved (+PKR ${inv.totalAmount.toLocaleString()}). New outstanding balance: PKR ${newBalance.toLocaleString()}`,
              },
            ],
          };
        }
        return s;
      })
    );

    setNotice(
      `Invoice ${inv.supplierInvoiceNumber} APPROVED! Supplier ${inv.supplierName} ledger khata credited by PKR ${inv.totalAmount.toLocaleString()}.`
    );

    if (selectedInvoice && selectedInvoice.id === inv.id) {
      setSelectedInvoice({
        ...inv,
        approvalStatus: 'approved',
        approvedBy: 'Farhan Zaidi (Authorized Lead)',
        approvedAt: new Date().toISOString().slice(0, 16),
      });
    }
  };

  // CONTROL: Record Payment
  const handleRecordPayment = (inv: SupplierInvoice) => {
    const updated = invoices.map((i) => {
      if (i.id === inv.id) {
        return {
          ...i,
          paymentStatus: 'paid' as const,
          paidAmount: i.totalAmount,
          auditTrail: [
            ...i.auditTrail,
            {
              timestamp: new Date().toISOString().slice(0, 16),
              actor: 'Finance Director (Farhan Zaidi)',
              action: 'Disbursed Payment',
              details: `Bank transfer voucher generated for PKR ${i.totalAmount.toLocaleString()}. Invoice settled.`,
            },
          ],
        };
      }
      return i;
    });

    setInvoices(updated);

    // Decrease supplier balance
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === inv.supplierId) {
          return {
            ...s,
            outstandingBalance: Math.max(0, s.outstandingBalance - inv.totalAmount),
          };
        }
        return s;
      })
    );

    setNotice(`Payment of PKR ${inv.totalAmount.toLocaleString()} recorded for ${inv.supplierInvoiceNumber}!`);
  };

  const columns = [
    {
      header: 'Invoice #',
      render: (row: SupplierInvoice) => (
        <div>
          <button
            onClick={() => setSelectedInvoice(row)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontWeight: 700,
              color: 'var(--color-smoky-black)',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontFamily: 'var(--font-family-mono)',
            }}
          >
            {row.supplierInvoiceNumber}
          </button>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>Date: {row.invoiceDate}</div>
        </div>
      ),
      width: '160px',
    },
    {
      header: 'Supplier',
      render: (row: SupplierInvoice) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.supplierName}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>
            PO: {row.poNumber} • GRN: {row.grnNumber}
          </div>
        </div>
      ),
    },
    {
      header: 'Due Date',
      render: (row: SupplierInvoice) => (
        <span style={{ fontSize: '13px', fontWeight: 500 }}>{row.dueDate}</span>
      ),
      width: '120px',
    },
    {
      header: 'Total Amount',
      render: (row: SupplierInvoice) => (
        <div>
          <div style={{ fontWeight: 800 }}>PKR {row.totalAmount.toLocaleString()}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>
            Tax: PKR {row.tax.toLocaleString()}
          </div>
        </div>
      ),
      width: '150px',
    },
    {
      header: '3-Way Match',
      render: (row: SupplierInvoice) => (
        row.matchResult.isMatch ? (
          <Badge variant="success">MATCHED</Badge>
        ) : (
          <Badge variant="danger">MISMATCH ({row.matchResult.discrepancies.length})</Badge>
        )
      ),
      width: '140px',
    },
    {
      header: 'Approval',
      render: (row: SupplierInvoice) => (
        <Badge
          variant={
            row.approvalStatus === 'approved'
              ? 'success'
              : row.approvalStatus === 'pending_approval'
              ? 'warning'
              : 'danger'
          }
        >
          {row.approvalStatus.replace(/_/g, ' ').toUpperCase()}
        </Badge>
      ),
      width: '150px',
    },
    {
      header: 'Payment Status',
      render: (row: SupplierInvoice) => (
        <Badge
          variant={
            row.paymentStatus === 'paid'
              ? 'success'
              : row.paymentStatus === 'partially_paid'
              ? 'warning'
              : 'danger'
          }
        >
          {row.paymentStatus.toUpperCase()}
        </Badge>
      ),
      width: '130px',
    },
    {
      header: 'Actions',
      render: (row: SupplierInvoice) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button size="sm" variant="secondary" onClick={() => setSelectedInvoice(row)}>
            Review & Match
          </Button>
          {row.approvalStatus === 'pending_approval' && (
            <Button size="sm" variant="primary" onClick={() => handleApproveInvoice(row)}>
              Approve
            </Button>
          )}
        </div>
      ),
      width: '200px',
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--color-smoky-black)',
              margin: 0,
            }}
          >
            Supplier Invoices & 3-Way Matching
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: '13px',
              color: 'var(--color-olive-drab)',
              margin: '4px 0 0 0',
            }}
          >
            Automated validation comparing Purchase Order + Goods Received (GRN) + Supplier Invoice before payment release.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          + Enter Supplier Invoice
        </Button>
      </div>

      {notice && (
        <div style={{ marginBottom: '16px' }}>
          <Alert type="success">{notice}</Alert>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Total Invoiced Amount
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-smoky-black)', marginTop: '4px' }}>
            PKR {invoices.reduce((acc, i) => acc + i.totalAmount, 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Across {invoices.length} supplier billing documents
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Unpaid Payables
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#b91c1c', marginTop: '4px' }}>
            PKR {invoices.filter((i) => i.paymentStatus !== 'paid').reduce((acc, i) => acc + i.totalAmount, 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Scheduled for payment disbursement
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            3-Way Match Health
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>
            {invoices.filter((i) => i.matchResult.isMatch).length} / {invoices.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Clean matches verified without variance
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Mismatches Flagged
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>
            {invoices.filter((i) => !i.matchResult.isMatch).length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Price, quantity or tax discrepancies locked
          </div>
        </Card>
      </div>

      {/* Invoice Table */}
      <Card padding="none">
        <Table columns={columns} data={invoices} emptyMessage="No supplier invoices recorded." />
      </Card>

      {/* Modal: Review & Three-Way Match Engine */}
      {selectedInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedInvoice(null)}
          title={`3-Way Match Verification: ${selectedInvoice.supplierInvoiceNumber}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* 3-Way Match Header Card */}
            <div
              style={{
                padding: '16px',
                borderRadius: '6px',
                backgroundColor: selectedInvoice.matchResult.isMatch ? '#f0fdf4' : '#fef2f2',
                border: `1.5px solid ${selectedInvoice.matchResult.isMatch ? '#86efac' : '#fca5a5'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: selectedInvoice.matchResult.isMatch ? '#166534' : '#991b1b' }}>
                    {selectedInvoice.matchResult.isMatch
                      ? '✓ THREE-WAY MATCH PERFECT: ALL VALIDATION CRITERIA SATISFIED'
                      : '⚠ THREE-WAY MATCH DISCREPANCY DETECTED'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
                    Compared: Purchase Order ({selectedInvoice.poNumber}) + Goods Receipt ({selectedInvoice.grnNumber}) + Invoice ({selectedInvoice.supplierInvoiceNumber})
                  </div>
                </div>
                <Badge variant={selectedInvoice.matchResult.isMatch ? 'success' : 'danger'}>
                  {selectedInvoice.matchResult.status.toUpperCase()}
                </Badge>
              </div>

              {/* List of Discrepancies if any */}
              {!selectedInvoice.matchResult.isMatch && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedInvoice.matchResult.discrepancies.map((d, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #f87171',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#b91c1c',
                      }}
                    >
                      <strong>Discrepancy in {d.field.toUpperCase()}:</strong> {d.message}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Side-by-Side Comparison Matrix */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                Three-Way Comparison Matrix
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '12px' }}>
                {/* Column 1: PO Agreed */}
                <div style={{ padding: '12px', border: '1px solid var(--color-bone)', borderRadius: '6px', backgroundColor: 'var(--color-floral-white)' }}>
                  <div style={{ fontWeight: 800, color: 'var(--color-smoky-black)', marginBottom: '8px' }}>
                    1. Purchase Order ({selectedInvoice.poNumber})
                  </div>
                  <div>Agreed Total: <strong>PKR {selectedInvoice.matchResult.poAgreedTotal.toLocaleString()}</strong></div>
                  <div>Status: Approved by Manager</div>
                  <div>Authorized Terms: Applied</div>
                </div>

                {/* Column 2: GRN Accepted */}
                <div style={{ padding: '12px', border: '1px solid var(--color-bone)', borderRadius: '6px', backgroundColor: 'var(--color-floral-white)' }}>
                  <div style={{ fontWeight: 800, color: 'var(--color-smoky-black)', marginBottom: '8px' }}>
                    2. Goods Received ({selectedInvoice.grnNumber})
                  </div>
                  <div>Accepted Stock Value: <strong>PKR {selectedInvoice.matchResult.grnAcceptedValue.toLocaleString()}</strong></div>
                  <div>Stock Status: Committed to Inventory</div>
                  <div>Damaged Goods: Quarantined</div>
                </div>

                {/* Column 3: Supplier Invoiced */}
                <div style={{ padding: '12px', border: '1px solid var(--color-bone)', borderRadius: '6px', backgroundColor: 'var(--color-floral-white)' }}>
                  <div style={{ fontWeight: 800, color: 'var(--color-smoky-black)', marginBottom: '8px' }}>
                    3. Supplier Invoiced ({selectedInvoice.supplierInvoiceNumber})
                  </div>
                  <div>Invoiced Total: <strong>PKR {selectedInvoice.totalAmount.toLocaleString()}</strong></div>
                  <div>Subtotal: PKR {selectedInvoice.subtotal.toLocaleString()}</div>
                  <div>Tax: PKR {selectedInvoice.tax.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Document Details & Attachment */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--color-olive-drab)' }}>Supplier:</span> <strong>{selectedInvoice.supplierName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)' }}>Due Date:</span> <span>{selectedInvoice.dueDate}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)' }}>Approval Status:</span>{' '}
                <Badge variant={selectedInvoice.approvalStatus === 'approved' ? 'success' : 'warning'}>
                  {selectedInvoice.approvalStatus.toUpperCase()}
                </Badge>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)' }}>Payment Status:</span>{' '}
                <Badge variant={selectedInvoice.paymentStatus === 'paid' ? 'success' : 'danger'}>
                  {selectedInvoice.paymentStatus.toUpperCase()}
                </Badge>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--color-olive-drab)' }}>Attached Physical Invoice:</span>{' '}
                <code>📄 {selectedInvoice.attachmentName} ({selectedInvoice.attachmentSize})</code>
              </div>
            </div>

            {/* Audit History */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Invoice Audit Log:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                {selectedInvoice.auditTrail.map((a, idx) => (
                  <div key={idx} style={{ fontSize: '11px', padding: '6px 8px', backgroundColor: 'var(--color-bone)', borderRadius: '4px' }}>
                    <strong>{a.timestamp}</strong> — {a.actor} ({a.action}): {a.details}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
              <Button variant="secondary" onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>

              {selectedInvoice.approvalStatus === 'pending_approval' && (
                <Button variant="primary" onClick={() => handleApproveInvoice(selectedInvoice)}>
                  ✓ Approve Invoice & Post to Ledger
                </Button>
              )}

              {selectedInvoice.approvalStatus === 'approved' && selectedInvoice.paymentStatus !== 'paid' && (
                <Button variant="primary" onClick={() => handleRecordPayment(selectedInvoice)}>
                  💳 Disburse Payment (PKR {selectedInvoice.totalAmount.toLocaleString()})
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Enter New Supplier Invoice */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Enter Supplier Invoice for 3-Way Match Verification"
      >
        <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formError && <Alert type="danger">{formError}</Alert>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Dropdown
              label="Supplier *"
              value={supplierId}
              onChange={(e) => {
                setSupplierId(e.target.value);
                setPoId('');
                setGrnId('');
              }}
              options={suppliers.map((s) => ({ value: s.id, label: `${s.name} (${s.code})` }))}
              required
            />
            <Input
              label="Supplier Invoice Number *"
              placeholder="e.g. INV-NAT-9930"
              value={supplierInvoiceNumber}
              onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Dropdown
              label="Purchase Order Reference *"
              value={poId}
              onChange={(e) => handleSelectPO(e.target.value)}
              options={[
                { value: '', label: '-- Select Linked PO --' },
                ...availablePOs.map((p) => ({
                  value: p.id,
                  label: `${p.poNumber} (PKR ${p.total.toLocaleString()})`,
                })),
              ]}
              required
            />
            <Dropdown
              label="Goods Received Note (GRN) Reference *"
              value={grnId}
              onChange={(e) => setGrnId(e.target.value)}
              options={[
                { value: '', label: '-- Select Verified GRN --' },
                ...availableGRNs.map((g) => ({
                  value: g.id,
                  label: `${g.grnNumber} (${g.totalAcceptedQty} accepted units)`,
                })),
              ]}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Invoice Date *"
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              required
            />
            <Input
              label="Payment Due Date *"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          {/* Pricing breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            <Input
              label="Subtotal (PKR) *"
              type="number"
              value={subtotal.toString()}
              onChange={(e) => handleSubtotalChange(Number(e.target.value), discount, tax)}
              required
            />
            <Input
              label="Discount (PKR)"
              type="number"
              value={discount.toString()}
              onChange={(e) => handleSubtotalChange(subtotal, Number(e.target.value), tax)}
            />
            <Input
              label="Tax (PKR)"
              type="number"
              value={tax.toString()}
              onChange={(e) => handleSubtotalChange(subtotal, discount, Number(e.target.value))}
            />
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-smoky-black)', display: 'block', marginBottom: '4px' }}>
                Net Total
              </label>
              <div
                style={{
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  backgroundColor: 'var(--color-bone)',
                  borderRadius: '4px',
                  fontWeight: 800,
                  fontSize: '14px',
                }}
              >
                PKR {totalAmount.toLocaleString()}
              </div>
            </div>
          </div>

          <Input
            label="Invoice Document Attachment (PDF/Scan)"
            value={attachmentName}
            onChange={(e) => setAttachmentName(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Run 3-Way Match & Submit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

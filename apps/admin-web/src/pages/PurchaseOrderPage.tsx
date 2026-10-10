import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Badge, Button, Input, Dropdown, Modal, Alert } from '@candi/ui';
import type { PurchaseOrder, PurchaseOrderItem } from '@candi/types';
import { INITIAL_POS } from './PurchaseOrderListPage';

import { INITIAL_SUPPLIERS } from '../data/suppliers';

export const PurchaseOrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isNew = id === 'new';
  const existingPo = INITIAL_POS.find((p) => p.id === id);

  const [po, setPo] = useState<PurchaseOrder>(
    existingPo || {
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-08${INITIAL_POS.length + 3}`,
      supplierId: INITIAL_SUPPLIERS[0].id,
      supplierName: INITIAL_SUPPLIERS[0].name,
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDeliveryDate: '2026-09-25',
      paymentTerms: INITIAL_SUPPLIERS[0].paymentTerms,
      subtotal: 140000,
      discount: 0,
      tax: 0,
      total: 140000,
      status: 'draft',
      items: [
        {
          id: 'item-1',
          sku: 'CND-CHOC-01',
          productName: 'Choco Dream Truffle Bites (24x50g)',
          unit: 'carton',
          orderedQuantity: 50,
          purchasePrice: 2800,
          subtotal: 140000,
          receivedQuantity: 0,
          outstandingQuantity: 50,
        },
      ],
      auditTrail: [{ action: 'Created draft', actor: 'Farhan Zaidi', timestamp: new Date().toISOString().slice(0, 16) }],
      createdAt: new Date().toISOString().slice(0, 16),
      updatedAt: new Date().toISOString().slice(0, 16),
    }
  );

  const [discount, setDiscount] = useState<number>(po.discount || 0);
  const [tax, setTax] = useState<number>(po.tax || 0);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [receiveQty, setReceiveQty] = useState<number>(0);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [notice, setNotice] = useState<string | null>(null);

  // Auto calculate total when items, discount or tax change
  useEffect(() => {
    const computedSubtotal = po.items.reduce((acc, it) => acc + it.subtotal, 0);
    const computedTotal = Math.max(0, computedSubtotal - discount + tax);
    setPo((prev) => ({
      ...prev,
      subtotal: computedSubtotal,
      discount,
      tax,
      total: computedTotal,
    }));
  }, [po.items, discount, tax]);

  const handleSupplierChange = (supId: string) => {
    const s = INITIAL_SUPPLIERS.find((item) => item.id === supId);
    if (s) {
      if (s.status === 'inactive') {
        alert(`SECURITY CONTROL: Supplier "${s.name}" is INACTIVE. Inactive suppliers cannot be used for new purchase orders.`);
        return;
      }
      if (s.status === 'on_hold') {
        alert(`SECURITY CONTROL: Supplier "${s.name}" is ON HOLD. Resolve compliance hold before issuing new purchase orders.`);
        return;
      }

      setPo((prev) => ({
        ...prev,
        supplierId: s.id,
        supplierName: s.name,
        paymentTerms: s.paymentTerms,
      }));
    }
  };

  const handleWorkflowTransition = (nextStatus: PurchaseOrder['status'], actionDescription: string) => {
    setPo((prev) => ({
      ...prev,
      status: nextStatus,
      approvedBy: nextStatus === 'approved' ? 'Farhan Zaidi (Authorized Lead)' : prev.approvedBy,
      approvedAt: nextStatus === 'approved' ? new Date().toISOString().slice(0, 16) : prev.approvedAt,
      auditTrail: [
        ...prev.auditTrail,
        { action: actionDescription, actor: 'Farhan Zaidi', timestamp: new Date().toISOString().slice(0, 16) },
      ],
    }));
    setNotice(`PO status updated: ${nextStatus.toUpperCase()} (${actionDescription})`);
  };

  const handleReceiveStock = () => {
    const item = po.items[selectedItemIndex];
    if (!item) return;

    const newReceived = item.receivedQuantity + Number(receiveQty);
    const newOutstanding = Math.max(0, item.orderedQuantity - newReceived);

    const updatedItems = [...po.items];
    updatedItems[selectedItemIndex] = {
      ...item,
      receivedQuantity: newReceived,
      outstandingQuantity: newOutstanding,
    };

    const allFulfilled = updatedItems.every((it) => it.outstandingQuantity === 0);
    const newStatus: PurchaseOrder['status'] = allFulfilled ? 'fully_received' : 'partially_received';

    setPo((prev) => ({
      ...prev,
      items: updatedItems,
      status: newStatus,
      auditTrail: [
        ...prev.auditTrail,
        {
          action: `Received ${receiveQty} ${item.unit}s of ${item.sku}. Outstanding: ${newOutstanding}`,
          actor: 'Asim Raza (Warehouse)',
          timestamp: new Date().toISOString().slice(0, 16),
        },
      ],
    }));

    setNotice(`Received ${receiveQty} units into warehouse inventory. Stock updated!`);
    setReceiveModalOpen(false);
    setReceiveQty(0);
  };

  const itemColumns = [
    { header: 'SKU', accessor: 'sku' as const, width: '130px' },
    { header: 'Product Name', accessor: 'productName' as const },
    { header: 'Unit', accessor: 'unit' as const, width: '90px' },
    { header: 'Ordered Qty', accessor: 'orderedQuantity' as const, width: '110px' },
    {
      header: 'Purchase Price',
      render: (row: PurchaseOrderItem) => `PKR ${row.purchasePrice.toLocaleString()}`,
    },
    {
      header: 'Subtotal',
      render: (row: PurchaseOrderItem) => (
        <span style={{ fontWeight: 700 }}>PKR {row.subtotal.toLocaleString()}</span>
      ),
    },
    {
      header: 'Received / Pending',
      render: (row: PurchaseOrderItem) => (
        <div>
          <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{row.receivedQuantity} received</span>
          {row.outstandingQuantity > 0 && (
            <span style={{ color: 'var(--color-danger)', marginLeft: '6px', fontSize: '11px' }}>
              ({row.outstandingQuantity} pending)
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Action',
      render: (_row: PurchaseOrderItem, idx: number) =>
        ['approved', 'sent_to_supplier', 'partially_received'].includes(po.status) ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedItemIndex(idx);
              setReceiveQty(po.items[idx].outstandingQuantity);
              setReceiveModalOpen(true);
            }}
          >
            Receive Stock
          </Button>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--color-olive-drab)' }}>Awaiting Approval</span>
        ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {notice && <Alert type="success">{notice}</Alert>}

      {/* Top Header Card */}
      <Card padding="md">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Button size="sm" variant="ghost" onClick={() => navigate('/procurement/orders')}>
                ← Back to PO List
              </Button>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
                {po.poNumber}
              </h2>
              <Badge status={po.status} label={po.status.replace(/_/g, ' ').toUpperCase()} />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-olive-drab)', marginTop: '4px' }}>
              Created on {po.orderDate} • Delivery due: {po.expectedDeliveryDate}
            </p>
          </div>

          {/* Workflow Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {po.status === 'draft' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleWorkflowTransition('submitted', 'Submitted for review')}
              >
                Submit PO for Approval
              </Button>
            )}

            {po.status === 'submitted' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleWorkflowTransition('approved', 'Approved by operations director')}
              >
                ✓ Authorize & Approve PO
              </Button>
            )}

            {po.status === 'approved' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleWorkflowTransition('sent_to_supplier', 'Sent to supplier via EDI / email')}
              >
                ✉ Send to Supplier
              </Button>
            )}

            {po.status === 'fully_received' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleWorkflowTransition('closed', 'Closed & settled')}
              >
                Close & Archive PO
              </Button>
            )}

            {po.status !== 'cancelled' && po.status !== 'closed' && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleWorkflowTransition('cancelled', 'Cancelled by management')}
              >
                Cancel PO
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Supplier & Logistics Details */}
      <Card padding="lg">
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-smoky-black)', marginBottom: '14px' }}>
          Supplier & Commercial Terms
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <Dropdown
            label="Selected Supplier"
            value={po.supplierId}
            disabled={po.status !== 'draft'}
            onChange={(e) => handleSupplierChange(e.target.value)}
            options={INITIAL_SUPPLIERS.map((s) => ({
              value: s.id,
              label: `${s.name} (${s.code}) - [${s.status.toUpperCase()}]`,
            }))}
          />

          <Input
            label="Payment Terms"
            value={po.paymentTerms}
            readOnly
            helperText="Auto-populated from supplier profile"
          />

          <Input
            label="Order Date"
            type="date"
            value={po.orderDate}
            disabled={po.status !== 'draft'}
            onChange={(e) => setPo({ ...po, orderDate: e.target.value })}
          />

          <Input
            label="Expected Delivery Date"
            type="date"
            value={po.expectedDeliveryDate}
            onChange={(e) => setPo({ ...po, expectedDeliveryDate: e.target.value })}
          />
        </div>
      </Card>

      {/* Ordered Products & Outstanding Quantities */}
      <Card padding="lg">
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-smoky-black)', marginBottom: '14px' }}>
          Procurement Items & Outstanding Quantities
        </h3>

        <Table columns={itemColumns} data={po.items} keyExtractor={(it) => it.id} />

        {/* Totals & Automatic Calculation */}
        <div
          style={{
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              width: '320px',
              backgroundColor: 'var(--color-surface-muted)',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-bone)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--color-olive-drab)' }}>Subtotal:</span>
              <span style={{ fontWeight: 700 }}>PKR {po.subtotal.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
              <span style={{ color: 'var(--color-olive-drab)' }}>Discount (PKR):</span>
              <input
                type="number"
                value={discount}
                disabled={po.status !== 'draft'}
                onChange={(e) => setDiscount(Number(e.target.value))}
                style={{
                  width: '100px',
                  padding: '2px 8px',
                  border: '1px solid var(--color-bone)',
                  borderRadius: '3px',
                  fontFamily: 'inherit',
                  textAlign: 'right',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
              <span style={{ color: 'var(--color-olive-drab)' }}>Tax (PKR):</span>
              <input
                type="number"
                value={tax}
                disabled={po.status !== 'draft'}
                onChange={(e) => setTax(Number(e.target.value))}
                style={{
                  width: '100px',
                  padding: '2px 8px',
                  border: '1px solid var(--color-bone)',
                  borderRadius: '3px',
                  fontFamily: 'inherit',
                  textAlign: 'right',
                }}
              />
            </div>

            <div
              style={{
                borderTop: '1.5px solid var(--color-bone)',
                paddingTop: '8px',
                marginTop: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '16px',
                fontWeight: 800,
                color: 'var(--color-smoky-black)',
              }}
            >
              <span>Automatic Total:</span>
              <span>PKR {po.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Audit Trail */}
      <Card padding="md">
        <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-smoky-black)', marginBottom: '10px' }}>
          Immutable PO Audit History
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {po.auditTrail.map((ev, idx) => (
            <div
              key={idx}
              style={{
                fontSize: '12px',
                color: 'var(--color-olive-drab)',
                padding: '6px 10px',
                backgroundColor: 'var(--color-surface-muted)',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              <strong style={{ color: 'var(--color-smoky-black)' }}>{ev.timestamp}</strong> — {ev.action} (by {ev.actor})
            </div>
          ))}
        </div>
      </Card>

      {/* Receive Stock Modal */}
      {receiveModalOpen && (
        <Modal
          isOpen={receiveModalOpen}
          onClose={() => setReceiveModalOpen(false)}
          title={`Receive Stock: ${po.items[selectedItemIndex]?.productName}`}
          footer={
            <>
              <Button variant="outline" onClick={() => setReceiveModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleReceiveStock}>
                Confirm Stock Inward
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-olive-drab)' }}>
              Enter quantity physically inspected and unloaded at Karachi Depot warehouse.
            </p>
            <Input
              label="Quantity Received"
              type="number"
              value={receiveQty}
              max={po.items[selectedItemIndex]?.outstandingQuantity}
              onChange={(e) => setReceiveQty(Number(e.target.value))}
              helperText={`Max outstanding: ${po.items[selectedItemIndex]?.outstandingQuantity} units`}
              autoFocus
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

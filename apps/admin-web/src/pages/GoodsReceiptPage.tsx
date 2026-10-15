import React, { useState } from 'react';
import { Card, Table, Badge, Button, Input, Dropdown, Modal, Alert } from '@candi/ui';
import type { GoodsReceiptNote, GoodsReceiptItem, PackagingUnitType } from '@candi/types';
import { INITIAL_GRNS } from '../data/goodsReceipts';
import { VENDOR_REGISTRY } from '../data/vendors';

const RECEIVING_SKU_TEMPLATES: { sku: string; productName: string; unit: PackagingUnitType; defaultQty: number }[] = [
  { sku: 'CND-CHOC-01', productName: 'Choco Dream Truffle Bites (24x50g)', unit: 'carton', defaultQty: 100 },
  { sku: 'CND-CHOC-02', productName: 'Velvet Caramel Bar Bulk Pack (48 pcs)', unit: 'box', defaultQty: 50 },
  { sku: 'CND-WAF-01', productName: 'Crispy Hazelnut Wafers (36 packets)', unit: 'carton', defaultQty: 80 },
  { sku: 'CND-CND-01', productName: 'Fizzy Cola Bottles Gummy Pouch (12x100g)', unit: 'carton', defaultQty: 60 },
  { sku: 'CND-TOF-01', productName: 'Creamy Royal Butter Toffee Jar (120 pcs)', unit: 'box', defaultQty: 40 },
];

export const GoodsReceiptPage: React.FC = () => {
  const [grns, setGrns] = useState<GoodsReceiptNote[]>(INITIAL_GRNS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGrn, setSelectedGrn] = useState<GoodsReceiptNote | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State for New GRN
  const [selectedVendorId, setSelectedVendorId] = useState<string>(VENDOR_REGISTRY[0].id);
  const [warehouse, setWarehouse] = useState('Korangi Central Depot — Receiving Bay 1');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [receiverName, setReceiverName] = useState('Asim Raza (Warehouse Lead)');
  const [receivingDate, setReceivingDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedSku, setSelectedSku] = useState<string>(RECEIVING_SKU_TEMPLATES[0].sku);
  const [receivingItems, setReceivingItems] = useState<GoodsReceiptItem[]>([
    {
      id: 'item-new-1',
      sku: RECEIVING_SKU_TEMPLATES[0].sku,
      productName: RECEIVING_SKU_TEMPLATES[0].productName,
      unit: RECEIVING_SKU_TEMPLATES[0].unit,
      orderedQuantity: 100,
      receivedQuantity: 100,
      damagedQuantity: 0,
      rejectedQuantity: 0,
      acceptedQuantity: 100,
      batchNumber: `BATCH-NAT-${Date.now().toString().slice(-4)}`,
      expiryDate: '2027-12-31',
      rejectionReason: '',
    },
  ]);
  const [notes, setNotes] = useState('');

  const handleAddLineItem = () => {
    const tmpl = RECEIVING_SKU_TEMPLATES.find((t) => t.sku === selectedSku) || RECEIVING_SKU_TEMPLATES[0];
    const newItem: GoodsReceiptItem = {
      id: `item-new-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sku: tmpl.sku,
      productName: tmpl.productName,
      unit: tmpl.unit,
      orderedQuantity: tmpl.defaultQty,
      receivedQuantity: tmpl.defaultQty,
      damagedQuantity: 0,
      rejectedQuantity: 0,
      acceptedQuantity: tmpl.defaultQty,
      batchNumber: `BATCH-${tmpl.sku.slice(-4)}-${Date.now().toString().slice(-4)}`,
      expiryDate: '2027-12-31',
      rejectionReason: '',
    };
    setReceivingItems((prev) => [...prev, newItem]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (receivingItems.length <= 1) {
      setFormError('At least one item line is required for goods receipt intake.');
      return;
    }
    setReceivingItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemQtyChange = (
    index: number,
    field: 'receivedQuantity' | 'damagedQuantity' | 'rejectedQuantity',
    val: number
  ) => {
    setReceivingItems((prev) => {
      const copy = [...prev];
      const it = { ...copy[index] };
      it[field] = Math.max(0, val);
      // Auto compute Accepted Quantity: Received - Damaged - Rejected
      it.acceptedQuantity = Math.max(0, it.receivedQuantity - it.damagedQuantity - it.rejectedQuantity);
      copy[index] = it;
      return copy;
    });
  };

  const handleItemDetailChange = (
    index: number,
    field: 'batchNumber' | 'expiryDate' | 'rejectionReason',
    val: string
  ) => {
    setReceivingItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleCreateGRN = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const vendor = VENDOR_REGISTRY.find((v) => v.id === selectedVendorId) || VENDOR_REGISTRY[0];

    if (!deliveryNote.trim()) {
      setFormError('Supplier Delivery Note (Challan # / Bilty #) is required.');
      return;
    }

    if (receivingItems.length === 0) {
      setFormError('Please add at least one line item to receive.');
      return;
    }

    const totalAccepted = receivingItems.reduce((acc, it) => acc + it.acceptedQuantity, 0);
    const totalDamaged = receivingItems.reduce((acc, it) => acc + it.damagedQuantity, 0);
    const totalRejected = receivingItems.reduce((acc, it) => acc + it.rejectedQuantity, 0);

    const newGrn: GoodsReceiptNote = {
      id: `grn-${Date.now()}`,
      grnNumber: `GRN-2026-0${grns.length + 92}`,
      poNumber: `RCV-DIR-${Date.now().toString().slice(-4)}`,
      poId: `rcv-${Date.now()}`,
      supplierId: vendor.id,
      supplierName: vendor.name,
      receivingDate,
      warehouse,
      deliveryNoteNumber: deliveryNote,
      receiverName,
      items: receivingItems,
      totalAcceptedQty: totalAccepted,
      totalDamagedQty: totalDamaged,
      totalRejectedQty: totalRejected,
      stockUpdated: true,
      stockUpdatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'closed',
      notes: notes || 'Physical inspection complete. Accepted items added to warehouse inventory.',
      createdAt: new Date().toISOString().slice(0, 16),
    };

    setGrns([newGrn, ...grns]);
    setIsModalOpen(false);
    setNotice(
      `GRN ${newGrn.grnNumber} generated! Inventory updated for ${totalAccepted} accepted units. ${totalDamaged} damaged & ${totalRejected} rejected units routed to Quarantine.`
    );
    setDeliveryNote('');
  };

  const columns = [
    {
      header: 'GRN Number',
      render: (row: GoodsReceiptNote) => (
        <span
          style={{
            fontFamily: 'var(--font-family-mono)',
            fontWeight: 700,
            color: 'var(--color-smoky-black)',
            backgroundColor: 'var(--color-bone)',
            padding: '2px 8px',
            borderRadius: '4px',
          }}
        >
          {row.grnNumber}
        </span>
      ),
      width: '140px',
    },
    {
      header: 'Delivery Reference',
      render: (row: GoodsReceiptNote) => (
        <div>
          <div style={{ fontWeight: 700 }}>{row.deliveryNoteNumber}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>Batch Ref: {row.poNumber}</div>
        </div>
      ),
      width: '160px',
    },
    {
      header: 'Vendor / Manufacturer',
      render: (row: GoodsReceiptNote) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.supplierName}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>Intake: {row.receivingDate}</div>
        </div>
      ),
    },
    {
      header: 'Warehouse & Receiver',
      render: (row: GoodsReceiptNote) => (
        <div style={{ fontSize: '12px' }}>
          <div>{row.warehouse}</div>
          <div style={{ color: 'var(--color-olive-drab)' }}>By: {row.receiverName}</div>
        </div>
      ),
    },
    {
      header: 'Breakdown (Accepted / Damaged / Rejected)',
      render: (row: GoodsReceiptNote) => (
        <div style={{ fontSize: '12px', display: 'flex', gap: '8px' }}>
          <span style={{ color: '#15803d', fontWeight: 700 }}>Accepted: {row.totalAcceptedQty}</span>
          {row.totalDamagedQty > 0 && (
            <span style={{ color: '#b91c1c', fontWeight: 700 }}>Damaged: {row.totalDamagedQty}</span>
          )}
          {row.totalRejectedQty > 0 && (
            <span style={{ color: '#6b7280', fontWeight: 700 }}>Rejected: {row.totalRejectedQty}</span>
          )}
        </div>
      ),
      width: '240px',
    },
    {
      header: 'Stock Status',
      render: (row: GoodsReceiptNote) => (
        row.stockUpdated ? (
          <Badge variant="success">Stock Updated</Badge>
        ) : (
          <Badge variant="warning">Pending Stock</Badge>
        )
      ),
      width: '140px',
    },
    {
      header: 'Actions',
      render: (row: GoodsReceiptNote) => (
        <Button size="sm" variant="secondary" onClick={() => setSelectedGrn(row)}>
          View Inspection
        </Button>
      ),
      width: '130px',
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
            Goods Received Notes (GRN)
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: '13px',
              color: 'var(--color-olive-drab)',
              margin: '4px 0 0 0',
            }}
          >
            Physical receiving inspection, damage segregation, and verified warehouse stock updates.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Record Goods Receipt
        </Button>
      </div>

      {notice && (
        <div style={{ marginBottom: '16px' }}>
          <Alert type="success">{notice}</Alert>
        </div>
      )}

      {/* Receiving Workflow Progression Card */}
      <Card padding="md" style={{ marginBottom: '20px', backgroundColor: 'var(--color-floral-white)' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-olive-drab)', marginBottom: '8px', letterSpacing: '0.05em' }}>
          PHYSICAL RECEIVING & BATCH LOGGING ENGINE (REPORT §5.3)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '12px' }}>
          <span style={{ padding: '4px 8px', backgroundColor: 'var(--color-bone)', borderRadius: '4px', fontWeight: 700 }}>1. Delivery at Dock</span>
          <span>→</span>
          <span style={{ padding: '4px 8px', backgroundColor: 'var(--color-bone)', borderRadius: '4px', fontWeight: 700 }}>2. Physical Quantity Check</span>
          <span>→</span>
          <span style={{ padding: '4px 8px', backgroundColor: 'var(--color-bone)', borderRadius: '4px', fontWeight: 700 }}>3. Batch & Expiry Logged</span>
          <span>→</span>
          <span style={{ padding: '4px 8px', backgroundColor: 'var(--color-bone)', borderRadius: '4px', fontWeight: 700 }}>4. Damage Segregation</span>
          <span>→</span>
          <span style={{ padding: '4px 8px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '4px', fontWeight: 700 }}>5. Stock Updated</span>
        </div>
      </Card>

      {/* GRN List Table */}
      <Card padding="none">
        <Table columns={columns} data={grns} emptyMessage="No Goods Received Notes recorded yet." />
      </Card>

      {/* Modal: New Goods Receipt Recording */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Receive Goods & Perform Quality Inspection"
      >
        <form onSubmit={handleCreateGRN} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formError && <Alert type="danger">{formError}</Alert>}

          {/* Select Vendor */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <Dropdown
              label="Select Vendor / Manufacturer *"
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              options={VENDOR_REGISTRY.map((v) => ({
                value: v.id,
                label: `${v.name} (${v.city})`,
              }))}
              required
            />
            <Input
              label="Receiving Date *"
              type="date"
              value={receivingDate}
              onChange={(e) => setReceivingDate(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <Input
              label="Warehouse / Bay *"
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              required
            />
            <Input
              label="Delivery Note / Challan # *"
              placeholder="e.g. DN-9912 / Bilty 4401"
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              required
            />
            <Input
              label="Receiver Staff Name *"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              required
            />
          </div>

          {/* Line Item Receiving & Inspection */}
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-smoky-black)' }}>
                Item Quantity Verification & Segregation (Damaged / Rejected)
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--color-bone)',
                    fontSize: '12px',
                  }}
                >
                  {RECEIVING_SKU_TEMPLATES.map((t) => (
                    <option key={t.sku} value={t.sku}>
                      {t.sku} — {t.productName}
                    </option>
                  ))}
                </select>
                <Button type="button" size="sm" variant="secondary" onClick={handleAddLineItem}>
                  + Add SKU Line
                </Button>
              </div>
            </div>

            {receivingItems.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  padding: '12px',
                  border: '1.5px solid var(--color-bone)',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-floral-white)',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <strong>{item.productName}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--color-olive-drab)', marginLeft: '8px' }}>
                      SKU: {item.sku} • Unit: {item.unit}
                    </span>
                  </div>
                  {receivingItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#b91c1c',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <Input
                    label="Received Qty"
                    type="number"
                    value={item.receivedQuantity.toString()}
                    onChange={(e) => handleItemQtyChange(idx, 'receivedQuantity', Number(e.target.value))}
                  />
                  <Input
                    label="Damaged Qty"
                    type="number"
                    value={item.damagedQuantity.toString()}
                    onChange={(e) => handleItemQtyChange(idx, 'damagedQuantity', Number(e.target.value))}
                  />
                  <Input
                    label="Rejected Qty"
                    type="number"
                    value={item.rejectedQuantity.toString()}
                    onChange={(e) => handleItemQtyChange(idx, 'rejectedQuantity', Number(e.target.value))}
                  />
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#15803d', display: 'block', marginBottom: '4px' }}>
                      Accepted Qty (Stock)
                    </label>
                    <div
                      style={{
                        height: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 12px',
                        backgroundColor: '#dcfce7',
                        border: '1px solid #86efac',
                        borderRadius: '4px',
                        fontWeight: 800,
                        color: '#166534',
                      }}
                    >
                      {item.acceptedQuantity} {item.unit}s
                    </div>
                  </div>
                </div>

                {/* Batch & Expiry and Rejection notes */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '8px', marginTop: '8px' }}>
                  <Input
                    label="Batch Number *"
                    value={item.batchNumber || ''}
                    onChange={(e) => handleItemDetailChange(idx, 'batchNumber', e.target.value)}
                    required
                  />
                  <Input
                    label="Expiry Date *"
                    type="date"
                    value={item.expiryDate || ''}
                    onChange={(e) => handleItemDetailChange(idx, 'expiryDate', e.target.value)}
                    required
                  />
                  <Input
                    label="Damage / Rejection Reason"
                    placeholder="e.g. Dent, wet carton, seal broken..."
                    value={item.rejectionReason || ''}
                    onChange={(e) => handleItemDetailChange(idx, 'rejectionReason', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <Input
            label="General Inspection Notes & Dock Observations"
            placeholder="e.g. Temperature checked at 21°C. Pallets unloaded without accident."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              ✓ Confirm Receipt & Update Warehouse Stock
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Existing GRN Details */}
      {selectedGrn && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedGrn(null)}
          title={`Goods Received Note: ${selectedGrn.grnNumber}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--color-olive-drab)' }}>Challan / Bilty Ref:</span> <strong>{selectedGrn.deliveryNoteNumber}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)' }}>Vendor / Supplier:</span> <strong>{selectedGrn.supplierName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)' }}>Warehouse Dock:</span> <span>{selectedGrn.warehouse}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)' }}>Batch Intake Ref:</span> <code>{selectedGrn.poNumber}</code>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)' }}>Receiver:</span> <span>{selectedGrn.receiverName}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-olive-drab)' }}>Stock Commit:</span>{' '}
                <Badge variant="success">Updated {selectedGrn.stockUpdatedAt}</Badge>
              </div>
            </div>

            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Inspected Line Items:</div>
              {selectedGrn.items.map((it) => (
                <div
                  key={it.id}
                  style={{
                    padding: '10px',
                    border: '1px solid var(--color-bone)',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{it.productName} ({it.sku})</div>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                    <span>Ordered: <strong>{it.orderedQuantity}</strong></span>
                    <span>Received: <strong>{it.receivedQuantity}</strong></span>
                    <span style={{ color: '#15803d', fontWeight: 700 }}>Accepted into Stock: {it.acceptedQuantity}</span>
                    {it.damagedQuantity > 0 && <span style={{ color: '#b91c1c' }}>Damaged: {it.damagedQuantity}</span>}
                  </div>
                  {it.batchNumber && (
                    <div style={{ color: 'var(--color-olive-drab)', marginTop: '4px' }}>
                      Batch: {it.batchNumber} • Expiry: {it.expiryDate} {it.rejectionReason && `• Note: ${it.rejectionReason}`}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedGrn.notes && (
              <div style={{ padding: '10px', backgroundColor: 'var(--color-bone)', borderRadius: '4px', fontSize: '12px' }}>
                📝 {selectedGrn.notes}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button variant="secondary" onClick={() => setSelectedGrn(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

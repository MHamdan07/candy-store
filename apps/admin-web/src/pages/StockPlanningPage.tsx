import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Badge, Button, Input, Dropdown, Modal, Alert } from '@candi/ui';
import type { StockPlanningItem, StockStatus } from '@candi/types';
import { INITIAL_STOCK_PLANNING } from '../data/stockPlanning';
import { INITIAL_SUPPLIERS } from '../data/suppliers';

export const StockPlanningPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<StockPlanningItem[]>(INITIAL_STOCK_PLANNING);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  // Edit Thresholds Modal State
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockPlanningItem | null>(null);
  const [editMin, setEditMin] = useState('');
  const [editMax, setEditMax] = useState('');
  const [editReorder, setEditReorder] = useState('');
  const [editReason, setEditReason] = useState('');
  const [thresholdError, setThresholdError] = useState<string | null>(null);

  // Manual Stock Adjustment Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  // Create PO from Suggestion Modal State
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [targetItem, setTargetItem] = useState<StockPlanningItem | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');

  // Recalculate status and suggested quantities
  const calculateItem = (item: StockPlanningItem): StockPlanningItem => {
    const avail = Math.max(0, item.currentStock - item.reservedStock);
    const suggested = Math.max(0, item.maxStockLevel - avail - item.pendingPurchaseQuantity);

    let status: StockStatus = 'healthy';
    if (item.currentStock === 0) {
      status = 'out_of_stock';
    } else if (avail <= item.minStockLevel) {
      status = 'reorder_required';
    } else if (avail <= item.reorderPoint) {
      status = 'low_stock';
    } else if (avail > item.maxStockLevel) {
      status = 'overstock';
    }

    return {
      ...item,
      availableStock: avail,
      suggestedPurchaseQuantity: suggested,
      stockStatus: status,
    };
  };

  const filteredItems = items
    .map(calculateItem)
    .filter((it) => {
      const matchesSearch =
        it.productName.toLowerCase().includes(search.toLowerCase()) ||
        it.sku.toLowerCase().includes(search.toLowerCase()) ||
        (it.supplierName && it.supplierName.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        filterStatus === 'all' ||
        it.stockStatus === filterStatus ||
        (filterStatus === 'no_supplier' && !it.hasActiveSupplier) ||
        (filterStatus === 'slow_moving' && it.isSlowMoving);

      return matchesSearch && matchesStatus;
    });

  // KPI Metrics for Replenishment Dashboard
  const reorderCount = items.filter((i) => i.availableStock <= i.reorderPoint && i.currentStock > 0).length;
  const outOfStockCount = items.filter((i) => i.currentStock === 0).length;
  const lowStockCount = items.filter((i) => i.stockStatus === 'low_stock').length;
  const overstockCount = items.filter((i) => i.stockStatus === 'overstock').length;
  const noSupplierCount = items.filter((i) => !i.hasActiveSupplier).length;
  const slowMovingCount = items.filter((i) => i.isSlowMoving).length;

  // Total Estimated Replenishment Cost
  const totalReplenishmentCost = items.reduce(
    (acc, it) => acc + it.suggestedPurchaseQuantity * it.supplierUnitCost,
    0
  );

  const handleOpenThresholdModal = (item: StockPlanningItem) => {
    setSelectedItem(item);
    setEditMin(item.minStockLevel.toString());
    setEditMax(item.maxStockLevel.toString());
    setEditReorder(item.reorderPoint.toString());
    setEditReason('');
    setThresholdError(null);
    setIsThresholdModalOpen(true);
  };

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    setThresholdError(null);

    if (!selectedItem) return;
    if (!editReason.trim()) {
      setThresholdError('Mandatory justification reason is required for threshold modifications.');
      return;
    }

    const min = Number(editMin);
    const max = Number(editMax);
    const reorder = Number(editReorder);

    if (min >= max) {
      setThresholdError('Minimum Stock Level must be less than Maximum Stock Level.');
      return;
    }

    if (reorder < min || reorder > max) {
      setThresholdError('Reorder Point must be between Minimum and Maximum Stock Levels.');
      return;
    }

    const updated = items.map((i) => {
      if (i.id === selectedItem.id) {
        const audit = [
          {
            timestamp: new Date().toISOString().slice(0, 16),
            actor: 'Farhan Zaidi (Authorized Planner)',
            change: `Thresholds revised: Min (${i.minStockLevel}→${min}), Reorder (${i.reorderPoint}→${reorder}), Max (${i.maxStockLevel}→${max})`,
            reason: editReason,
          },
          ...(i.thresholdAuditLog || []),
        ];

        return calculateItem({
          ...i,
          minStockLevel: min,
          maxStockLevel: max,
          reorderPoint: reorder,
          thresholdAuditLog: audit,
        });
      }
      return i;
    });

    setItems(updated);
    setIsThresholdModalOpen(false);
    setNotice(`Thresholds for ${selectedItem.sku} successfully updated and recorded in audit log.`);
  };

  const handleOpenAdjustModal = (item: StockPlanningItem) => {
    setSelectedItem(item);
    setAdjustQty(item.currentStock.toString());
    setAdjustReason('');
    setIsAdjustModalOpen(true);
  };

  const handleSaveManualAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (!adjustReason.trim()) {
      alert('CONTROL: A formal reason is mandatory for manual quantity adjustments.');
      return;
    }

    const newQty = Math.max(0, Number(adjustQty));
    const delta = newQty - selectedItem.currentStock;

    const updated = items.map((i) => {
      if (i.id === selectedItem.id) {
        const audit = [
          {
            timestamp: new Date().toISOString().slice(0, 16),
            actor: 'Farhan Zaidi (Supervisor)',
            change: `Manual Stock Count Adjustment: ${selectedItem.currentStock} → ${newQty} (${delta >= 0 ? '+' : ''}${delta})`,
            reason: adjustReason,
          },
          ...(i.thresholdAuditLog || []),
        ];

        return calculateItem({
          ...i,
          currentStock: newQty,
          thresholdAuditLog: audit,
        });
      }
      return i;
    });

    setItems(updated);
    setIsAdjustModalOpen(false);
    setNotice(`Manual stock count for ${selectedItem.sku} adjusted to ${newQty}. Reason logged.`);
  };

  const handleOpenCreatePO = (item: StockPlanningItem) => {
    if (!item.hasActiveSupplier) {
      alert('SECURITY CONTROL: Cannot create Purchase Order. Product has no active or authorized supplier.');
      return;
    }
    setTargetItem(item);
    setSelectedSupplierId(item.supplierId || INITIAL_SUPPLIERS[0].id);
    setIsPoModalOpen(true);
  };

  const handleConfirmCreatePO = () => {
    if (!targetItem) return;
    setIsPoModalOpen(false);
    navigate(`/procurement/orders/new`, {
      state: {
        sku: targetItem.sku,
        productName: targetItem.productName,
        quantity: targetItem.suggestedPurchaseQuantity,
        supplierId: selectedSupplierId,
        unitPrice: targetItem.supplierUnitCost,
      },
    });
  };

  const getStatusBadge = (status: StockStatus) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="success">Healthy</Badge>;
      case 'low_stock':
        return <Badge variant="warning">Low Stock</Badge>;
      case 'reorder_required':
        return <Badge variant="danger">Reorder Required</Badge>;
      case 'overstock':
        return <Badge variant="info">Overstock</Badge>;
      case 'out_of_stock':
        return <Badge variant="danger">Out of Stock</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Product / SKU',
      render: (row: StockPlanningItem) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-smoky-black)' }}>{row.productName}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>
            SKU: {row.sku} • Unit: {row.packagingUnit}
            {row.isSlowMoving && (
              <span style={{ marginLeft: '6px', color: '#b45309', fontWeight: 700 }}>🐢 Slow-Moving</span>
            )}
          </div>
        </div>
      ),
      width: '240px',
    },
    {
      header: 'Stock Breakdown',
      render: (row: StockPlanningItem) => (
        <div style={{ fontSize: '12px' }}>
          <div>Current: <strong>{row.currentStock}</strong></div>
          <div style={{ color: 'var(--color-olive-drab)' }}>
            Reserved: <strong>{row.reservedStock}</strong>
          </div>
          <div style={{ color: row.availableStock <= row.reorderPoint ? '#b91c1c' : '#15803d', fontWeight: 800 }}>
            Available: {row.availableStock}
          </div>
        </div>
      ),
      width: '150px',
    },
    {
      header: 'Thresholds (Min / Reorder / Max)',
      render: (row: StockPlanningItem) => (
        <div style={{ fontSize: '12px' }}>
          <div>Min: {row.minStockLevel} | Max: {row.maxStockLevel}</div>
          <div style={{ color: 'var(--color-olive-drab)', fontWeight: 700 }}>Reorder Pt: {row.reorderPoint}</div>
          <button
            onClick={() => handleOpenThresholdModal(row)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '11px',
              color: 'var(--color-olive-drab)',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontFamily: 'var(--font-family-mono)',
            }}
          >
            Edit Thresholds (Auth)
          </button>
        </div>
      ),
      width: '200px',
    },
    {
      header: 'Pending Orders & Delivery',
      render: (row: StockPlanningItem) => (
        <div style={{ fontSize: '12px' }}>
          <div>Pending: <strong>{row.pendingPurchaseQuantity}</strong></div>
          {row.expectedDeliveryDate ? (
            <div style={{ color: 'var(--color-olive-drab)' }}>Due: {row.expectedDeliveryDate}</div>
          ) : (
            <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>No open PO</div>
          )}
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>
            Expected Post-Delivery: {row.availableStock + row.pendingPurchaseQuantity}
          </div>
        </div>
      ),
      width: '180px',
    },
    {
      header: 'Supplier & Lead Time',
      render: (row: StockPlanningItem) => (
        <div style={{ fontSize: '12px' }}>
          {row.hasActiveSupplier ? (
            <>
              <div style={{ fontWeight: 600 }}>{row.supplierName}</div>
              <div style={{ color: 'var(--color-olive-drab)' }}>Lead: {row.supplierLeadTime}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>Rate: PKR {row.supplierUnitCost}</div>
            </>
          ) : (
            <span style={{ color: '#b91c1c', fontWeight: 800, backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>
              ⚠ No Active Supplier
            </span>
          )}
        </div>
      ),
      width: '220px',
    },
    {
      header: 'Stock Status',
      render: (row: StockPlanningItem) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {getStatusBadge(row.stockStatus)}
        </div>
      ),
      width: '150px',
    },
    {
      header: 'Suggested Purchase Qty',
      render: (row: StockPlanningItem) => (
        <div>
          {row.suggestedPurchaseQuantity > 0 ? (
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#b91c1c' }}>
              {row.suggestedPurchaseQuantity} {row.packagingUnit}s
              <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', fontWeight: 500 }}>
                Est: PKR {(row.suggestedPurchaseQuantity * row.supplierUnitCost).toLocaleString()}
              </div>
            </div>
          ) : (
            <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 700 }}>Optimal (0)</span>
          )}
        </div>
      ),
      width: '170px',
    },
    {
      header: 'Actions',
      render: (row: StockPlanningItem) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {row.suggestedPurchaseQuantity > 0 && row.hasActiveSupplier && (
            <Button size="sm" variant="primary" onClick={() => handleOpenCreatePO(row)}>
              + Create PO Draft
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={() => handleOpenAdjustModal(row)}>
            Adjust Count
          </Button>
        </div>
      ),
      width: '140px',
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
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
            Replenishment & Stock Planning Dashboard
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: '13px',
              color: 'var(--color-olive-drab)',
              margin: '4px 0 0 0',
            }}
          >
            Predictive stock planning calculating available inventory, reorder triggers, and automated purchase quantities.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" onClick={() => navigate('/procurement/orders')}>
            View Open POs
          </Button>
          <Button variant="primary" onClick={() => navigate('/procurement/requests')}>
            + New Purchase Request
          </Button>
        </div>
      </div>

      {notice && (
        <div style={{ marginBottom: '16px' }}>
          <Alert type="success">{notice}</Alert>
        </div>
      )}

      {/* REPLENISHMENT DASHBOARD KPI STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <Card padding="md" style={{ borderTop: '4px solid #b91c1c' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Reorder Required
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#b91c1c', marginTop: '4px' }}>
            {reorderCount} SKUs
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Available $\le$ Reorder Point
          </div>
        </Card>

        <Card padding="md" style={{ borderTop: '4px solid #11120D' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Out of Stock
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#11120D', marginTop: '4px' }}>
            {outOfStockCount} SKUs
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Zero stock on shelf
          </div>
        </Card>

        <Card padding="md" style={{ borderTop: '4px solid #b45309' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Low Stock Buffer
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>
            {lowStockCount} SKUs
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Approaching minimum levels
          </div>
        </Card>

        <Card padding="md" style={{ borderTop: '4px solid #0284c7' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Overstocked / Slow
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
            {overstockCount} SKUs ({slowMovingCount} Slow)
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            Available &gt; Max capacity
          </div>
        </Card>

        <Card padding="md" style={{ borderTop: '4px solid #15803d' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-olive-drab)', fontWeight: 700 }}>
            Est. Replenishment Cost
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>
            PKR {totalReplenishmentCost.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)', marginTop: '2px' }}>
            To restore optimal stock
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card padding="md" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', alignItems: 'center' }}>
          <Input
            placeholder="Search by SKU, product name, or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Dropdown
            label="Filter Stock Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { label: 'All Products (Catalog)', value: 'all' },
              { label: '🔴 Reorder Required', value: 'reorder_required' },
              { label: '⛔ Out of Stock', value: 'out_of_stock' },
              { label: '🟡 Low Stock', value: 'low_stock' },
              { label: '🔵 Overstock', value: 'overstock' },
              { label: '🟢 Healthy Stock', value: 'healthy' },
              { label: '⚠ No Active Supplier Flagged', value: 'no_supplier' },
              { label: '🐢 Slow-Moving Stock', value: 'slow_moving' },
            ]}
          />
        </div>
      </Card>

      {/* Replenishment Calculation Rule Banner */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'var(--color-floral-white)',
          border: '1px solid var(--color-bone)',
          borderRadius: '6px',
          marginBottom: '20px',
          fontSize: '12px',
          color: 'var(--color-olive-drab)',
        }}
      >
        📐 <strong>Replenishment Formula:</strong>{' '}
        <code>Suggested Qty = Maximum Stock Level − Available Stock (Current − Reserved) − Pending PO Qty</code>
        {' • '}
        <em>Threshold changes and manual adjustments require authorization and mandatory audit justifications.</em>
      </div>

      {/* Main Stock Planning Table */}
      <Card padding="none">
        <Table columns={columns} data={filteredItems} emptyMessage="No products match your replenishment filters." />
      </Card>

      {/* MODAL 1: Edit Thresholds (Min / Max / Reorder Point) */}
      {selectedItem && (
        <Modal
          isOpen={isThresholdModalOpen}
          onClose={() => setIsThresholdModalOpen(false)}
          title={`Edit Stock Thresholds: ${selectedItem.productName} (${selectedItem.sku})`}
        >
          <form onSubmit={handleSaveThresholds} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {thresholdError && <Alert type="danger">{thresholdError}</Alert>}

            <Alert type="warning">
              SECURITY CONTROL: Only authorized inventory managers can update stock thresholds. Changes are audited.
            </Alert>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <Input
                label="Minimum Stock Level *"
                type="number"
                value={editMin}
                onChange={(e) => setEditMin(e.target.value)}
                required
              />
              <Input
                label="Reorder Trigger Point *"
                type="number"
                value={editReorder}
                onChange={(e) => setEditReorder(e.target.value)}
                required
              />
              <Input
                label="Maximum Stock Capacity *"
                type="number"
                value={editMax}
                onChange={(e) => setEditMax(e.target.value)}
                required
              />
            </div>

            <Input
              label="Mandatory Audit Justification Reason *"
              placeholder="e.g. Sales velocity increase during Ramzan wholesale surge"
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
              <Button variant="secondary" onClick={() => setIsThresholdModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save & Update Thresholds
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Manual Stock Count Adjustment */}
      {selectedItem && (
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title={`Manual Stock Count Adjustment: ${selectedItem.productName}`}
        >
          <form onSubmit={handleSaveManualAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Current System Stock
                </label>
                <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-bone)', borderRadius: '4px', fontWeight: 800 }}>
                  {selectedItem.currentStock} {selectedItem.packagingUnit}s
                </div>
              </div>
              <Input
                label="New Verified Physical Stock *"
                type="number"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                required
              />
            </div>

            <Input
              label="Mandatory Adjustment Reason *"
              placeholder="e.g. Bi-weekly physical cycle count discrepancy resolution"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
              <Button variant="secondary" onClick={() => setIsAdjustModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Authorize Adjustment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: Confirm Purchase Order Creation from Replenishment Suggestion */}
      {targetItem && (
        <Modal
          isOpen={isPoModalOpen}
          onClose={() => setIsPoModalOpen(false)}
          title="Convert Replenishment Suggestion into Purchase Order"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--color-floral-white)', border: '1px solid var(--color-bone)', borderRadius: '6px' }}>
              <div style={{ fontWeight: 800, fontSize: '15px' }}>{targetItem.productName}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-olive-drab)', marginTop: '4px' }}>
                SKU: {targetItem.sku} • Suggested Qty: <strong>{targetItem.suggestedPurchaseQuantity} {targetItem.packagingUnit}s</strong>
              </div>
              <div style={{ fontSize: '13px', marginTop: '8px', color: '#15803d', fontWeight: 700 }}>
                Estimated PO Total: PKR {(targetItem.suggestedPurchaseQuantity * targetItem.supplierUnitCost).toLocaleString()}
              </div>
            </div>

            <Dropdown
              label="Select Supplier *"
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              options={INITIAL_SUPPLIERS.filter((s) => s.status === 'active').map((s) => ({
                value: s.id,
                label: `${s.name} (${s.paymentTerms}, Lead: ${s.deliveryLeadTime})`,
              }))}
            />

            <Alert type="info">
              CONTROL: Purchase suggestions do not automatically generate POs without approval. Clicking proceed will open the PO creation form pre-populated with these values.
            </Alert>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <Button variant="secondary" onClick={() => setIsPoModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmCreatePO}>
                Proceed to Purchase Order Form →
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

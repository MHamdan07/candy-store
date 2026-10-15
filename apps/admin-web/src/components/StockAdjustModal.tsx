import React, { useState } from 'react';
import { Modal, Button, Alert } from '@candi/ui';
import { ProductItem } from '../pages/ProductListPage';

export interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductItem | null;
  onStockUpdated: (productId: string, newAvailableStock: number, reason: string) => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  onClose,
  product,
  onStockUpdated,
}) => {
  if (!product) return null;

  const [quantityToAdd, setQuantityToAdd] = useState<number>(50);
  const [reason, setReason] = useState<string>('Supplier Shipment Inward Receipt');
  const [error, setError] = useState<string | null>(null);

  const currentAvailable = product.availableStock;
  const currentReserved = product.reservedStock;
  const newProjectedAvailable = Math.max(0, currentAvailable + quantityToAdd);

  const isLowStock = currentAvailable < 50;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityToAdd === 0) {
      setError('Please enter a non-zero adjustment quantity');
      return;
    }
    if (newProjectedAvailable < 0) {
      setError('Available stock cannot fall below zero');
      return;
    }

    onStockUpdated(product.id, newProjectedAvailable, reason);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`📦 Stock Check & Inward Restock: ${product.sku}`}
    >
      <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0' }}>
        {error && <Alert type="error">{error}</Alert>}

        {/* Product Summary Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#F8FAFC',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: '#0F172A',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '22px' }}>🍫</span>
            )}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{product.name}</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>
              {product.brand} • <span style={{ color: '#D97706', fontWeight: 600 }}>{product.category}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
              {product.conversionSummary}
            </div>
          </div>
        </div>

        {/* Stock Metrics Card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <div style={{ padding: '10px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 700 }}>Available Units</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#1E3A8A', marginTop: '2px' }}>
              {currentAvailable} {product.baseUnit}s
            </div>
            <div style={{ fontSize: '10px', color: isLowStock ? '#DC2626' : '#059669', fontWeight: 700, marginTop: '2px' }}>
              {isLowStock ? '⚠️ Low Stock Alert' : '✓ Healthy Inventory'}
            </div>
          </div>

          <div style={{ padding: '10px', backgroundColor: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#92400E', fontWeight: 700 }}>Reserved (Orders)</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#78350F', marginTop: '2px' }}>
              {currentReserved} {product.baseUnit}s
            </div>
            <div style={{ fontSize: '10px', color: '#92400E', marginTop: '2px' }}>Pending Dispatch</div>
          </div>

          <div style={{ padding: '10px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>Projected New Stock</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#14532D', marginTop: '2px' }}>
              {newProjectedAvailable} {product.baseUnit}s
            </div>
            <div style={{ fontSize: '10px', color: '#16A34A', fontWeight: 700, marginTop: '2px' }}>
              {quantityToAdd >= 0 ? `+${quantityToAdd}` : `${quantityToAdd}`} change
            </div>
          </div>
        </div>

        {/* Quick Add Presets */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            Quick Inward Restock Presets (+ Cartons):
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[10, 25, 50, 100, 250].map((qty) => (
              <button
                key={qty}
                type="button"
                onClick={() => setQuantityToAdd(qty)}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: '6px',
                  border: quantityToAdd === qty ? '2px solid #E11D48' : '1px solid #CBD5E1',
                  backgroundColor: quantityToAdd === qty ? '#FFF1F2' : '#FFFFFF',
                  color: quantityToAdd === qty ? '#BE123C' : '#0F172A',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                +{qty}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Quantity Input */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Quantity to Adjust ({product.baseUnit}s)
            </label>
            <input
              type="number"
              value={quantityToAdd}
              onChange={(e) => setQuantityToAdd(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                border: '1.5px solid #CBD5E1',
                fontSize: '14px',
                fontWeight: 800,
              }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Restock Log Note / Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Inward consignment receipt from factory depot"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                border: '1.5px solid #CBD5E1',
                fontSize: '13px',
              }}
              required
            />
          </div>
        </div>

        {/* Modal Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Confirm Stock Restock ({quantityToAdd >= 0 ? `+${quantityToAdd}` : quantityToAdd})
          </Button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Modal, Button, Badge } from '@candi/ui';
import { WholesaleProductItem } from '../data/wholesaleCatalogData';
import { useWholesaleOrder } from '../context/WholesaleOrderContext';

export interface ProductDetailModalProps {
  product: WholesaleProductItem | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart } = useWholesaleOrder();

  if (!product) return null;

  const [orderQuantity, setOrderQuantity] = useState(product.minOrderQuantity || 1);
  const [selectedUnit, setSelectedUnit] = useState(product.baseUnit);
  const [customRetailPrice, setCustomRetailPrice] = useState(product.retailPricePerPiece);
  const [isAdded, setIsAdded] = useState(false);

  // Dynamic Margin calculations
  const totalPieces = product.piecesPerUnit;
  const totalRevenue = customRetailPrice * totalPieces;
  const wholesaleCost = product.standardWholesalePrice;
  const netProfitPerUnit = totalRevenue - wholesaleCost;
  const profitMarginPercent = totalRevenue > 0 ? Math.round((netProfitPerUnit / totalRevenue) * 1000) / 10 : 0;
  const profitPerPiece = Math.round((customRetailPrice - product.wholesaleCostPerPiece) * 100) / 100;

  const handleAdd = () => {
    addToCart(product, selectedUnit, orderQuantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1000);
  };

  return (
    <Modal
      isOpen={Boolean(product)}
      onClose={onClose}
      title={`${product.name} (${product.sku})`}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4px)' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)', fontWeight: 600 }}>Total Order Cost:</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--color-text-main, #0F172A)' }}>
              PKR {(orderQuantity * product.standardWholesalePrice).toLocaleString()}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleAdd} disabled={isAdded}>
              {isAdded ? '✓ Added to Cart!' : `Add ${orderQuantity} ${selectedUnit}(s)`}
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-family-base)' }}>
        {/* Header Hero Ribbon */}
        <div
          style={{
            background: `linear-gradient(135deg, ${product.accentColor} 0%, #0F172A 100%)`,
            color: '#FFFFFF',
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  flexShrink: 0,
                }}
              />
            )}
            <div>
              <div style={{ fontSize: '11px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                {product.brand} • {product.category}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>{product.name}</div>
              <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.95, fontWeight: 600 }}>
                📦 {product.conversionSummary}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', opacity: 0.9, fontWeight: 600 }}>Factory Wholesale Rate:</div>
            <div style={{ fontSize: '22px', fontWeight: 900 }}>
              PKR {product.standardWholesalePrice.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>
              PKR {product.wholesaleCostPerPiece.toFixed(1)} / piece cost
            </div>
          </div>
        </div>

        {/* Product Description */}
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted, #64748B)', margin: 0, lineHeight: 1.5 }}>
          {product.description}
        </p>

        {/* INTERACTIVE RETAILER MARGIN CALCULATOR */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid var(--color-border, #E2E8F0)',
            borderRadius: '12px',
            padding: '16px 20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🧮</span>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)' }}>
                Kiryana Profit Margin Calculator
              </span>
            </div>
            <Badge status="approved" label="LIVE PROFIT ESTIMATOR" />
          </div>

          <p style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748B)', marginBottom: '14px' }}>
            Adjust your counter selling price per piece to simulate your exact retail store profit per carton.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              backgroundColor: '#FFFFFF',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #E2E8F0)',
            }}
          >
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted, #64748B)', display: 'block', marginBottom: '4px' }}>
                Selling Price Per Piece (PKR):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800 }}>Rs.</span>
                <input
                  type="number"
                  min={1}
                  step={0.5}
                  value={customRetailPrice}
                  onChange={(e) => setCustomRetailPrice(Number(e.target.value) || 0)}
                  style={{
                    width: '90px',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border, #E2E8F0)',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    fontWeight: 800,
                    outline: 'none',
                    color: 'var(--color-text-main, #0F172A)',
                  }}
                />
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted, #64748B)' }}>
                Base wholesale cost: Rs. {product.wholesaleCostPerPiece.toFixed(1)}/pc
              </span>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted, #64748B)', display: 'block', marginBottom: '4px' }}>
                Profit Per Piece:
              </label>
              <div style={{ fontSize: '16px', fontWeight: 900, color: profitPerPiece > 0 ? '#059669' : '#EF4444' }}>
                +PKR {profitPerPiece.toFixed(2)}
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted, #64748B)' }}>
                Across {totalPieces} pieces
              </span>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted, #64748B)', display: 'block', marginBottom: '4px' }}>
                Total Carton Profit:
              </label>
              <div style={{ fontSize: '16px', fontWeight: 900, color: netProfitPerUnit > 0 ? '#059669' : '#EF4444' }}>
                +PKR {netProfitPerUnit.toLocaleString()}
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted, #64748B)' }}>
                Carton Revenue: PKR {totalRevenue.toLocaleString()}
              </span>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted, #64748B)', display: 'block', marginBottom: '4px' }}>
                Profit Margin %:
              </label>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 900,
                  color: profitMarginPercent >= 20 ? 'var(--color-primary, #E11D48)' : '#059669',
                }}
              >
                +{profitMarginPercent}%
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted, #64748B)' }}>
                Kiryana store ROI
              </span>
            </div>
          </div>
        </div>

        {/* Tier Pricing Breakdown Table */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)', marginBottom: '8px' }}>
            Volume Tier Pricing Schedule (Karachi Hub):
          </div>
          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--color-border, #E2E8F0)' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border, #E2E8F0)' }}>Customer Tier</th>
                  <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border, #E2E8F0)' }}>Eligibility</th>
                  <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border, #E2E8F0)' }}>Carton Rate</th>
                  <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border, #E2E8F0)' }}>Savings</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border, #E2E8F0)', fontWeight: 700 }}>
                    Standard Retail
                  </td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border, #E2E8F0)' }}>
                    All Retail Kiryana Stores
                  </td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border, #E2E8F0)', fontWeight: 800 }}>
                    PKR {product.tierPrices.standard_retail.toLocaleString()}
                  </td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border, #E2E8F0)', color: 'var(--color-text-muted, #64748B)' }}>
                    Base Catalog
                  </td>
                </tr>
                <tr style={{ backgroundColor: '#FFFBEB' }}>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border, #E2E8F0)', fontWeight: 700 }}>
                    Tier 2 (Gold)
                  </td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border, #E2E8F0)' }}>
                    Monthly Volume &gt; 50 Cartons
                  </td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border, #E2E8F0)', fontWeight: 800 }}>
                    PKR {product.tierPrices.tier_2_gold.toLocaleString()}
                  </td>
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border, #E2E8F0)', color: '#059669', fontWeight: 700 }}>
                    Save PKR {(product.tierPrices.standard_retail - product.tierPrices.tier_2_gold).toLocaleString()}
                  </td>
                </tr>
                <tr style={{ backgroundColor: '#ECFDF5' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 700 }}>
                    Tier 1 (Platinum Sub-Wholesale)
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    Registered Wholesale Distributors
                  </td>
                  <td style={{ padding: '8px 12px', fontWeight: 800 }}>
                    PKR {product.tierPrices.tier_1_platinum.toLocaleString()}
                  </td>
                  <td style={{ padding: '8px 12px', color: '#059669', fontWeight: 800 }}>
                    Save PKR {(product.tierPrices.standard_retail - product.tierPrices.tier_1_platinum).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quality, Batch, & Shelf Life Specifications */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
            fontSize: '11px',
            color: 'var(--color-text-muted, #64748B)',
            backgroundColor: '#F8FAFC',
            padding: '12px 14px',
            borderRadius: '8px',
            border: '1px solid var(--color-border, #E2E8F0)',
          }}
        >
          <div>
            <strong>Weight / Dimensions:</strong> {product.weightKg} kg gross
          </div>
          <div>
            <strong>Batch Lot Number:</strong> {product.batchNumber}
          </div>
          <div>
            <strong>Shelf Life:</strong> {product.shelfLifeMonths} Months
          </div>
          <div>
            <strong>Expiry Date:</strong> {product.expiryDate}
          </div>
          <div>
            <strong>Storage Recommendation:</strong> {product.storageCondition}
          </div>
          <div>
            <strong>Certification:</strong> 100% Halal Certified
          </div>
        </div>

        {/* Quantity Stepper Selector in Modal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '8px',
            borderTop: '1px solid var(--color-border, #E2E8F0)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-main, #0F172A)' }}>
            Select Order Quantity ({product.baseUnit}s):
          </span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--color-border, #E2E8F0)',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#FFFFFF',
            }}
          >
            <button
              onClick={() => setOrderQuantity((prev) => Math.max(product.minOrderQuantity || 1, prev - 1))}
              type="button"
              style={{
                padding: '8px 16px',
                border: 'none',
                backgroundColor: '#F8FAFC',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 800,
                color: 'var(--color-text-main, #0F172A)',
              }}
            >
              −
            </button>
            <span
              style={{
                padding: '8px 16px',
                fontSize: '15px',
                fontWeight: 900,
                minWidth: '32px',
                textAlign: 'center',
                color: 'var(--color-text-main, #0F172A)',
              }}
            >
              {orderQuantity}
            </span>
            <button
              onClick={() => setOrderQuantity((prev) => prev + 1)}
              type="button"
              style={{
                padding: '8px 16px',
                border: 'none',
                backgroundColor: '#F8FAFC',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 800,
                color: 'var(--color-text-main, #0F172A)',
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

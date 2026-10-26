import React, { useState } from 'react';
import { Modal, Button, Badge } from '@candi/ui';
import { WholesaleProductItem } from '../data/wholesaleCatalogData';
import { useWholesaleOrder } from '../context/WholesaleOrderContext';

export interface ProductDetailModalProps {
  product: WholesaleProductItem | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useWholesaleOrder();

  if (!product) return null;

  // Live cart persistence: find active quantity of this SKU in customer's cart
  const inCartItem = cartItems.find((item) => item.productId === product.id);
  const cartQuantity = inCartItem?.quantity || 0;
  const isInCart = cartQuantity > 0;

  const [customRetailPrice, setCustomRetailPrice] = useState(product.retailPricePerPiece);

  // Dynamic Margin calculations
  const totalPieces = product.piecesPerUnit;
  const totalRevenue = customRetailPrice * totalPieces;
  const wholesaleCost = product.standardWholesalePrice;
  const netProfitPerUnit = totalRevenue - wholesaleCost;
  const profitMarginPercent = totalRevenue > 0 ? Math.round((netProfitPerUnit / totalRevenue) * 1000) / 10 : 0;
  const profitPerPiece = Math.round((customRetailPrice - product.wholesaleCostPerPiece) * 100) / 100;

  // Stepper handlers directly connected to active cart
  const handleInitialAdd = () => {
    addToCart(product, product.baseUnit, 1);
  };

  const handleIncrement = () => {
    if (isInCart) {
      updateQuantity(product.id, cartQuantity + 1);
    } else {
      addToCart(product, product.baseUnit, 1);
    }
  };

  const handleDecrement = () => {
    if (cartQuantity <= 1) {
      removeFromCart(product.id);
    } else {
      updateQuantity(product.id, cartQuantity - 1);
    }
  };

  const activeDisplayQty = isInCart ? cartQuantity : 1;
  const totalOrderCost = activeDisplayQty * product.standardWholesalePrice;

  return (
    <Modal
      isOpen={Boolean(product)}
      onClose={onClose}
      title={`${product.name} (${product.sku})`}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4px)' }}>
          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted, #64748B)', fontWeight: 600 }}>
              {isInCart ? `Cart Total (${cartQuantity} ${cartQuantity === 1 ? 'carton' : 'cartons'} in order):` : 'Wholesale Carton Cost:'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--color-text-main, #0F172A)' }}>
              PKR {totalOrderCost.toLocaleString()}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>

            {/* Zero Heavy Background: Transparent Stepper with Trash Can Delete */}
            {isInCart ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid var(--color-primary, #1e2023)',
                  borderRadius: '999px',
                  padding: '3px 8px',
                  boxShadow: '0 2px 6px rgba(225, 29, 72, 0.12)',
                }}
              >
                {/* Minus or Trash Button */}
                <button
                  type="button"
                  onClick={handleDecrement}
                  aria-label={cartQuantity === 1 ? 'Remove from basket' : 'Decrease quantity'}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: cartQuantity === 1 ? '#EF4444' : '#0F172A',
                    fontSize: cartQuantity === 1 ? '13px' : '17px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cartQuantity === 1 ? '🗑️' : '−'}
                </button>

                {/* Quantity Number */}
                <span
                  style={{
                    minWidth: '24px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 900,
                    color: '#0F172A',
                    userSelect: 'none',
                    padding: '0 4px',
                  }}
                >
                  {cartQuantity}
                </span>

                {/* Plus Button */}
                <button
                  type="button"
                  onClick={handleIncrement}
                  aria-label="Increase quantity"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--color-primary, #1e2023)',
                    fontSize: '17px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInitialAdd}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  border: '1.5px solid var(--color-primary, #1e2023)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-primary, #1e2023)',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(225, 29, 72, 0.12)',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <span style={{ fontSize: '15px', fontWeight: 900 }}>+</span>
                <span>Add {product.baseUnit}</span>
              </button>
            )}
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
                  color: profitMarginPercent >= 20 ? 'var(--color-primary, #1e2023)' : '#059669',
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

        {/* Quantity Stepper Selector in Modal (Synchronized with Active Basket) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: isInCart ? '#F0FDF4' : '#F8FAFC',
            border: isInCart ? '1.5px solid #86EFAC' : '1px solid var(--color-border, #E2E8F0)',
            borderRadius: '10px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: isInCart ? '#166534' : 'var(--color-text-main, #0F172A)' }}>
              {isInCart ? `🛒 Added to Order (${cartQuantity} ${cartQuantity === 1 ? 'Carton' : 'Cartons'} in Basket)` : `Select Order Quantity (${product.baseUnit}s):`}
            </div>
            <div style={{ fontSize: '11px', color: isInCart ? '#15803D' : '#64748B' }}>
              {isInCart ? 'Active in your cart • Use buttons to adjust or remove' : 'Click to add wholesale cartons to your current order'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isInCart ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid var(--color-primary, #1e2023)',
                  borderRadius: '999px',
                  padding: '3px 8px',
                  boxShadow: '0 1px 4px rgba(225, 29, 72, 0.12)',
                }}
              >
                {/* Minus or Trash Button */}
                <button
                  type="button"
                  onClick={handleDecrement}
                  aria-label={cartQuantity === 1 ? 'Remove from basket' : 'Decrease quantity'}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: cartQuantity === 1 ? '#EF4444' : '#0F172A',
                    fontSize: cartQuantity === 1 ? '13px' : '17px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cartQuantity === 1 ? '🗑️' : '−'}
                </button>

                {/* Quantity Number */}
                <span
                  style={{
                    minWidth: '24px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 900,
                    color: '#0F172A',
                    userSelect: 'none',
                    padding: '0 4px',
                  }}
                >
                  {cartQuantity}
                </span>

                {/* Plus Button */}
                <button
                  type="button"
                  onClick={handleIncrement}
                  aria-label="Increase quantity"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--color-primary, #1e2023)',
                    fontSize: '17px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInitialAdd}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 15px',
                  borderRadius: '999px',
                  border: '1.5px solid var(--color-primary, #1e2023)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-primary, #1e2023)',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(225, 29, 72, 0.12)',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <span style={{ fontSize: '15px', fontWeight: 900 }}>+</span>
                <span>Add {product.baseUnit}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

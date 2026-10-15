import React, { useState } from 'react';
import { WholesaleProductItem } from '../data/wholesaleCatalogData';
import { useWholesaleOrder } from '../context/WholesaleOrderContext';

export interface ProductCardProps {
  product: WholesaleProductItem;
  onOpenDetails: (product: WholesaleProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useWholesaleOrder();
  const [imgError, setImgError] = useState(false);

  // Live cart persistence: finds active quantity of this SKU in the user's cart
  const inCartItem = cartItems.find((item) => item.productId === product.id);
  const cartQuantity = inCartItem?.quantity || 0;
  const isInCart = cartQuantity > 0;

  // Clean packaging display text (e.g. "10 Display Boxes • 120 Packs")
  const cleanPackaging = product.conversionSummary
    ? product.conversionSummary
        .replace(/^1\s*Carton\s*=\s*/i, '')
        .replace(/=\s*/g, '• ')
        .trim()
    : 'Standard Wholesale Pack';

  const handleInitialAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, product.baseUnit, 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, cartQuantity + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartQuantity <= 1) {
      removeFromCart(product.id);
    } else {
      updateQuantity(product.id, cartQuantity - 1);
    }
  };

  return (
    <div
      className="candi-product-card"
      onClick={() => onOpenDetails(product)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: isInCart
          ? '1.5px solid var(--color-primary, #E11D48)'
          : '1px solid var(--color-border, #E2E8F0)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: isInCart
          ? '0 4px 14px rgba(225, 29, 72, 0.12)'
          : '0 1px 4px rgba(15, 23, 42, 0.04)',
        position: 'relative',
        fontFamily: 'var(--font-family-base)',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* ---------------------------------------------------- */}
      {/* 1. HERO PRODUCT PHOTO (Clean, Bright, Zero Dark Textures) */}
      {/* ---------------------------------------------------- */}
      <div
        className="product-card-header"
        style={{
          position: 'relative',
          height: '135px',
          width: '100%',
          overflow: 'hidden',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Product Photo: Pure, clean photography with zero dark overlays */}
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="product-card-img"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: '6px',
              boxSizing: 'border-box',
              display: 'block',
              transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        ) : (
          /* High-Quality Minimal Fallback */
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '38px' }}>
              {product.category === 'Chocolates'
                ? '🍫'
                : product.category === 'Candies & Chews'
                ? '🍬'
                : product.category === 'Biscuits & Wafers'
                ? '🧇'
                : product.category === 'Gummies & Chews'
                ? '🐻'
                : product.category === 'Gums & Mints'
                ? '🌿'
                : '🍭'}
            </span>
          </div>
        )}

        {/* Subtle, Minimal Pill Badge (Top Left Only, if applicable) */}
        {product.badgeText && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#0F172A',
              fontSize: '9.5px',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: '6px',
              letterSpacing: '0.02em',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.1)',
              lineHeight: 1.1,
              pointerEvents: 'none',
              backdropFilter: 'blur(4px)',
            }}
          >
            ★ {product.badgeText}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. REFINED MINIMALIST CARD BODY */}
      {/* ---------------------------------------------------- */}
      <div
        className="product-card-body"
        style={{
          padding: '10px 10px 10px 10px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
          gap: '4px',
          boxSizing: 'border-box',
        }}
      >
        <div>
          {/* Subtle Brand Tag */}
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#94A3B8',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              lineHeight: 1.1,
              marginBottom: '2px',
            }}
          >
            {product.brand}
          </div>

          {/* Product Title (Clean, crisp typography) */}
          <h3
            className="product-card-title"
            title={product.name}
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 4px 0',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '31px',
            }}
          >
            {product.name}
          </h3>

          {/* Packaging Note (Clean, lightweight grey) */}
          <div
            style={{
              fontSize: '10.5px',
              color: '#64748B',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.2,
            }}
          >
            📦 {cleanPackaging}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 3. PRICE & MINIMALIST CONTROLLER (Strictly 1 Row) */}
        {/* ---------------------------------------------------- */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '6px',
            paddingTop: '6px',
            borderTop: '1px solid #F1F5F9',
          }}
        >
          {/* Wholesale Carton Price Only (Profit pill removed for clean UI) */}
          <div>
            <span
              style={{
                fontSize: '13.5px',
                fontWeight: 900,
                color: '#0F172A',
                lineHeight: 1,
              }}
            >
              PKR {product.standardWholesalePrice.toLocaleString()}
            </span>
            <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>
              /ctn
            </span>
          </div>

          {/* Minimalist Action Controller (Zero Heavy Red Backgrounds) */}
          <div onClick={(e) => e.stopPropagation()}>
            {isInCart ? (
              /* TRANSPARENT MINIMAL STEPPER */
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid var(--color-primary, #E11D48)',
                  borderRadius: '999px',
                  padding: '2px 4px',
                  boxShadow: '0 1px 4px rgba(225, 29, 72, 0.12)',
                }}
              >
                {/* Minus or Trash Button */}
                <button
                  type="button"
                  onClick={handleDecrement}
                  aria-label={cartQuantity === 1 ? 'Remove from basket' : 'Decrease quantity'}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: cartQuantity === 1 ? '#EF4444' : '#0F172A',
                    fontSize: cartQuantity === 1 ? '11px' : '15px',
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
                    minWidth: '18px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 900,
                    color: '#0F172A',
                    userSelect: 'none',
                    padding: '0 2px',
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
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--color-primary, #E11D48)',
                    fontSize: '15px',
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
              /* LIGHTWEIGHT ROUND "+" BUTTON */
              <button
                type="button"
                onClick={handleInitialAdd}
                aria-label={`Add ${product.name} to order`}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '1.5px solid var(--color-primary, #E11D48)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-primary, #E11D48)',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  boxShadow: '0 1px 3px rgba(225, 29, 72, 0.12)',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                +
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

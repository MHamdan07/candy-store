import React, { useState } from 'react';
import { WholesaleProductItem } from '../data/wholesaleCatalogData';
import { useWholesaleOrder } from '../context/WholesaleOrderContext';

export interface ProductCardProps {
  product: WholesaleProductItem;
  onOpenDetails: (product: WholesaleProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addToCart, cartItems } = useWholesaleOrder();
  const [selectedUnit, setSelectedUnit] = useState(product.baseUnit);
  const [quantity, setQuantity] = useState(product.minOrderQuantity || 1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Check if item is already in cart
  const inCartItem = cartItems.find((item) => item.productId === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedUnit, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 1400);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((prev) => Math.max(product.minOrderQuantity || 1, prev - 1));
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((prev) => prev + 1);
  };

  return (
    <div
      className="candi-product-card"
      onClick={() => onOpenDetails(product)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid var(--color-border, #E2E8F0)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
        position: 'relative',
        fontFamily: 'var(--font-family-base)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* ---------------------------------------------------- */}
      {/* 1. COMPACT PHOTO / VISUAL HEADER (95px / 80px mobile) */}
      {/* ---------------------------------------------------- */}
      <div
        className="product-card-header"
        style={{
          position: 'relative',
          height: '95px',
          width: '100%',
          overflow: 'hidden',
          backgroundColor: '#0F172A',
        }}
      >
        {/* Product Photo with Smooth Hover Zoom */}
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
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        ) : (
          /* High-Quality Geometric Graphic Fallback */
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, ${product.accentColor} 0%, #0F172A 120%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '32px', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }}>
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

        {/* Subtle Dark Gradient Overlay for Stock/Badge Readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(15, 23, 42, 0.65) 0%, rgba(15, 23, 42, 0.1) 45%, rgba(15, 23, 42, 0.6) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Badges Overlay (Promo / Bulk on Left, Stock on Right) */}
        <div
          style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            right: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          {/* Promo Pill */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {product.badgeText && (
              <span
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: '#0F172A',
                  fontSize: '9px',
                  fontWeight: 900,
                  padding: '2px 5px',
                  borderRadius: '4px',
                  letterSpacing: '0.3px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  lineHeight: 1.1,
                }}
              >
                {product.badgeText}
              </span>
            )}
            {product.isBulkOfferEligible && (
              <span
                style={{
                  backgroundColor: '#F59E0B',
                  color: '#FFFFFF',
                  fontSize: '9px',
                  fontWeight: 900,
                  padding: '2px 5px',
                  borderRadius: '4px',
                  letterSpacing: '0.2px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  lineHeight: 1.1,
                }}
              >
                BULK
              </span>
            )}
          </div>

          {/* Stock Chip */}
          <span
            style={{
              backgroundColor:
                product.stockStatus === 'in_stock'
                  ? 'rgba(16, 185, 129, 0.95)'
                  : 'rgba(239, 68, 68, 0.95)',
              color: '#FFFFFF',
              fontSize: '9px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '999px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              lineHeight: 1.1,
            }}
          >
            {product.stockStatus === 'in_stock'
              ? `✓ ${product.unitsInStock}`
              : `⚠ ${product.unitsInStock}`}
          </span>
        </div>

        {/* Brand Label Bottom Left */}
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            left: '6px',
            color: '#FFFFFF',
            fontSize: '9px',
            fontWeight: 800,
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
          }}
        >
          {product.brand}
        </div>

        {/* In-cart Indicator Badge Top Right Corner */}
        {inCartItem && (
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '6px',
              backgroundColor: 'var(--color-primary, #E11D48)',
              color: '#FFFFFF',
              fontSize: '9px',
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: '4px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}
          >
            ✓ In Cart ({inCartItem.quantity})
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. COMPACT CARD BODY CONTENT (~180px–200px) */}
      {/* ---------------------------------------------------- */}
      <div
        className="product-card-body"
        style={{
          padding: '10px 10px 8px 10px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          gap: '6px',
          boxSizing: 'border-box',
        }}
      >
        {/* Title */}
        <h3
          className="product-card-title"
          title={product.name}
          style={{
            fontSize: '13px',
            fontWeight: 800,
            color: 'var(--color-text-main, #0F172A)',
            margin: 0,
            lineHeight: 1.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '32px',
          }}
        >
          {product.name}
        </h3>

        {/* Compact 1-Line Packaging Formula Tag */}
        <div
          className="product-card-formula"
          title={product.conversionSummary}
          style={{
            backgroundColor: 'var(--color-surface-muted, #F8FAFC)',
            padding: '3px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            color: '#475569',
            fontWeight: 700,
            border: '1px solid var(--color-border, #E2E8F0)',
            borderLeft: `2.5px solid ${product.accentColor}`,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.2,
          }}
        >
          📦 {product.conversionSummary}
        </div>

        {/* Multi-Tier Packaging Selector (Only shown if multiple units exist) */}
        {product.availableUnits && product.availableUnits.length > 1 && (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ fontSize: '9px', fontWeight: 700, color: '#94A3B8' }}>Unit:</span>
            <div style={{ display: 'flex', gap: '3px' }}>
              {product.availableUnits.map((u) => {
                const isSelected = selectedUnit === u;
                return (
                  <button
                    key={u}
                    onClick={() => setSelectedUnit(u)}
                    type="button"
                    style={{
                      padding: '1px 5px',
                      borderRadius: '4px',
                      fontSize: '9px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      border: isSelected
                        ? '1px solid var(--color-primary, #E11D48)'
                        : '1px solid var(--color-border, #E2E8F0)',
                      backgroundColor: isSelected ? '#FFF1F2' : '#FFFFFF',
                      color: isSelected
                        ? 'var(--color-primary, #E11D48)'
                        : 'var(--color-text-main, #0F172A)',
                      textTransform: 'capitalize',
                      lineHeight: 1.2,
                    }}
                  >
                    {u}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* 3. SLEEK SINGLE ROW: PRICE + PROFIT PILL */}
        {/* ---------------------------------------------------- */}
        <div
          className="product-card-price-row"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '4px',
            marginTop: '2px',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 900,
                color: 'var(--color-text-main, #0F172A)',
                lineHeight: 1,
              }}
            >
              PKR {product.standardWholesalePrice.toLocaleString()}
            </span>
            <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>
              /{selectedUnit === 'carton' ? 'ctn' : selectedUnit}
            </span>
          </div>

          {/* Highlighted Profit Pill */}
          <span
            className="product-profit-pill"
            style={{
              backgroundColor: '#ECFDF5',
              color: '#059669',
              border: '1px solid #A7F3D0',
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 5px',
              borderRadius: '999px',
              whiteSpace: 'nowrap',
              lineHeight: 1.1,
            }}
          >
            +{product.marginPercentage}%
          </span>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 4. INLINE QUANTITY STEPPER & ADD TO CART (STRICTLY 1 ROW) */}
        {/* ---------------------------------------------------- */}
        <div
          className="product-card-action-row"
          onClick={(e) => e.stopPropagation()}
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            height: '36px',
          }}
        >
          {/* Stepper: [ - 1 + ] */}
          <div
            className="product-card-stepper"
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--color-border, #E2E8F0)',
              borderRadius: '6px',
              backgroundColor: '#F8FAFC',
              height: '36px',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <button
              onClick={handleDecrement}
              type="button"
              className="product-card-stepper-btn"
              aria-label="Decrease quantity"
              style={{
                width: '28px',
                height: '36px',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--color-text-main, #0F172A)',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              −
            </button>
            <span
              style={{
                minWidth: '20px',
                padding: '0 3px',
                height: '36px',
                fontSize: '12px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFFFFF',
                color: 'var(--color-text-main, #0F172A)',
                userSelect: 'none',
              }}
            >
              {quantity}
            </span>
            <button
              onClick={handleIncrement}
              type="button"
              className="product-card-stepper-btn"
              aria-label="Increase quantity"
              style={{
                width: '28px',
                height: '36px',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--color-text-main, #0F172A)',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              +
            </button>
          </div>

          {/* Inline Add to Order Button */}
          <button
            onClick={handleAddToCart}
            type="button"
            className="product-card-add-btn"
            style={{
              flex: 1,
              height: '36px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: addedNotice ? '#059669' : 'var(--color-primary, #E11D48)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '0 8px',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: addedNotice
                ? '0 2px 8px rgba(5, 150, 105, 0.35)'
                : '0 2px 6px rgba(225, 29, 72, 0.25)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {addedNotice ? (
              <span className="candi-spring-badge">✓ Added!</span>
            ) : (
              <>
                <span style={{ fontSize: '14px', lineHeight: 1 }}>+</span>
                <span>Add</span>
              </>
            )}
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 5. QUICK MARGIN SPECS LINK (COMPACT) */}
        {/* ---------------------------------------------------- */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(product);
          }}
          type="button"
          style={{
            border: 'none',
            background: 'none',
            color: 'var(--color-primary, #E11D48)',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '2px 0 0 0',
            textAlign: 'center',
            textDecoration: 'none',
            lineHeight: 1.1,
          }}
        >
          📊 Margin Specs →
        </button>
      </div>
    </div>
  );
};

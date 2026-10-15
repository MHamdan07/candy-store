import React from 'react';
import { useWholesaleOrder } from '../context/WholesaleOrderContext';
import { CategoryPillBar } from './CategoryPillBar';

export interface WholesaleCatalogHeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  highMarginOnly: boolean;
  onToggleHighMargin: () => void;
  inStockOnly: boolean;
  onToggleInStock: () => void;
  sortBy: 'featured' | 'margin_desc' | 'price_asc' | 'price_desc';
  onSortChange: (sort: 'featured' | 'margin_desc' | 'price_asc' | 'price_desc') => void;
  brands: string[];
  categoryCounts?: Record<string, number>;
}

export const WholesaleCatalogHero: React.FC<WholesaleCatalogHeroProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  highMarginOnly,
  onToggleHighMargin,
  inStockOnly,
  onToggleInStock,
  sortBy,
  onSortChange,
  brands,
  categoryCounts,
}) => {
  const { subtotal, isFreeDelivery, freeDeliveryShortfall } = useWholesaleOrder();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Promotional Banner Card */}
      <div
        className="wholesale-hero-banner"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 55%, #881337 100%)',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.12)',
        }}
      >
        <div style={{ maxWidth: '640px', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(225, 29, 72, 0.2)',
              border: '1px solid rgba(225, 29, 72, 0.6)',
              color: '#FFE4E6',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '12px',
            }}
          >
            <span>🔥 Monsoon Wholesale Fest 2026</span>
            <span>•</span>
            <span style={{ color: '#FCD34D' }}>Extra 5% Off On 5+ Cartons</span>
          </div>

          <h1
            className="wholesale-hero-title"
            style={{
              fontSize: '28px',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '8px',
              fontFamily: 'var(--font-family-heading)',
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            Karachi Confectionery Wholesale Catalog
          </h1>

          <p style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 1.5, marginBottom: '16px' }}>
            Direct factory-gate pricing on premium chocolates, candies, wafers, and toffees. Guaranteed same-day or next-day delivery across all Karachi retail markets.
          </p>

          {/* Quick Value Metrics */}
          <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#34D399', fontSize: '14px' }}>✓</span>
              <span>Average Kiryana Margin: <strong style={{ color: '#FFFFFF' }}>24% – 35%</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#34D399', fontSize: '14px' }}>✓</span>
              <span>Min. Order Value: <strong style={{ color: '#FFFFFF' }}>PKR 5,000 Free Delivery</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#34D399', fontSize: '14px' }}>✓</span>
              <span>100% Tax Filer Compliant WHT</span>
            </div>
          </div>
        </div>

        {/* Free Delivery Dynamic Progress Meter in Banner */}
        <div
          style={{
            marginTop: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            maxWidth: '340px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
            <span>🚚 Delivery Status:</span>
            <span style={{ color: isFreeDelivery && subtotal > 0 ? '#34D399' : '#FCD34D' }}>
              {subtotal === 0
                ? 'Free on PKR 5,000+'
                : isFreeDelivery
                ? 'FREE DELIVERY QUALIFIED! 🎉'
                : `PKR ${freeDeliveryShortfall.toLocaleString()} to Free`}
            </span>
          </div>

          <div
            style={{
              height: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.round((subtotal / 5000) * 100))}%`,
                backgroundColor: isFreeDelivery && subtotal > 0 ? '#10B981' : '#F59E0B',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* Search & Filter Control Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* Row 1: Search input + Brand + Sort dropdowns */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '15px',
                color: 'var(--color-text-dim)',
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by confectionery product name, SKU, or flavor..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 14px 10px 40px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontFamily: 'inherit',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: 'var(--color-canvas)',
                color: 'var(--color-text)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-dim)',
                  fontSize: '14px',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Brand Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              value={selectedBrand}
              onChange={(e) => onSelectBrand(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontFamily: 'inherit',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                color: 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Brands ({brands.length})</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div style={{ minWidth: '170px' }}>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontFamily: 'inherit',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                color: 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              <option value="featured">Sort: Featured Bestsellers</option>
              <option value="margin_desc">Highest Retailer Margin %</option>
              <option value="price_asc">Wholesale Price (Low to High)</option>
              <option value="price_desc">Wholesale Price (High to Low)</option>
            </select>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onToggleHighMargin}
              style={{
                padding: '9px 14px',
                borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${highMarginOnly ? '#D97706' : 'var(--color-border)'}`,
                backgroundColor: highMarginOnly ? '#FFFBEB' : '#FFFFFF',
                color: highMarginOnly ? '#B45309' : 'var(--color-text-muted)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>💰</span>
              <span>High Margin (+25%)</span>
            </button>

            <button
              onClick={onToggleInStock}
              style={{
                padding: '9px 14px',
                borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${inStockOnly ? '#059669' : 'var(--color-border)'}`,
                backgroundColor: inStockOnly ? '#ECFDF5' : '#FFFFFF',
                color: inStockOnly ? '#047857' : 'var(--color-text-muted)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>📦</span>
              <span>In Stock Only</span>
            </button>
          </div>
        </div>

        {/* Row 2: Category Pills (Interactive, scrollbar-free, smooth scrolling & micro-animations) */}
        <CategoryPillBar
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          categoryCounts={categoryCounts}
        />
      </div>
    </div>
  );
};

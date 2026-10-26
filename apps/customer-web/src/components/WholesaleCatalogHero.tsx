import React from 'react';
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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

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

import React, { useRef, useState, useEffect } from 'react';
import { WHOLESALE_CATEGORIES, WholesaleCategoryItem } from '../data/wholesaleCatalogData';

export interface CategoryPillBarProps {
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  categoryCounts?: Record<string, number>;
  className?: string;
}

export const CategoryPillBar: React.FC<CategoryPillBarProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position to dynamically show/hide scroll assistance chevrons
  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (!el) return undefined;
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = 260;
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  // Enable mouse wheel horizontal navigation without visible scrollbar
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY) && el.scrollWidth > el.clientWidth) {
      // If user scrolls vertically over horizontal pill bar, translate to horizontal scroll
      el.scrollLeft += e.deltaY;
    }
  };

  const handlePillClick = (cat: WholesaleCategoryItem, e: React.MouseEvent<HTMLButtonElement>) => {
    onSelectCategory(cat.id);
    e.currentTarget.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  };

  return (
    <div
      className={`category-pill-bar-wrapper ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {/* Scroll Left Assistant Button */}
      {canScrollLeft && (
        <button
          type="button"
          aria-label="Scroll left categories"
          onClick={() => handleScroll('left')}
          style={{
            position: 'absolute',
            left: '-8px',
            zIndex: 10,
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border, #E2E8F0)',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#0F172A',
            transition: 'all 0.15s ease',
          }}
        >
          ‹
        </button>
      )}

      {/* Scroll Container: COMPLETELY HIDES SCROLLBAR, SMOOTH SCROLL */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="category-pill-scroll-container"
        style={{
          display: 'flex',
          gap: '8px',
          width: '100%',
          padding: '4px 2px',
          alignItems: 'center',
        }}
      >
        {WHOLESALE_CATEGORIES.map((cat) => {
          const isSelected =
            (selectedCategory === 'all' && cat.id === 'all') ||
            selectedCategory.toLowerCase() === cat.id.toLowerCase();

          const count = categoryCounts[cat.id] ?? cat.count ?? 0;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={(e) => handlePillClick(cat, e)}
              className={`category-pill-btn ${isSelected ? 'active-pill' : ''}`}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full, 9999px)',
                border: isSelected ? '1.5px solid #0F172A' : '1px solid var(--color-border, #E2E8F0)',
                backgroundColor: isSelected ? '#0F172A' : '#F8FAFC',
                color: isSelected ? '#FFFFFF' : 'var(--color-text, #334155)',
                fontSize: '12.5px',
                fontWeight: isSelected ? 800 : 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                userSelect: 'none',
              }}
            >
              <span className="category-pill-icon" style={{ fontSize: '15px', lineHeight: 1 }}>
                {cat.icon}
              </span>
              <span>{cat.name}</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : '#E2E8F0',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  lineHeight: 1.2,
                  transition: 'all 0.2s ease',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scroll Right Assistant Button */}
      {canScrollRight && (
        <button
          type="button"
          aria-label="Scroll right categories"
          onClick={() => handleScroll('right')}
          style={{
            position: 'absolute',
            right: '-8px',
            zIndex: 10,
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border, #E2E8F0)',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#0F172A',
            transition: 'all 0.15s ease',
          }}
        >
          ›
        </button>
      )}
    </div>
  );
};

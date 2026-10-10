import React from 'react';
import { Logo, Badge, Button } from '@candi/ui';
import { useAuth } from '@candi/auth';
import { useWholesaleOrder } from '../context/WholesaleOrderContext';

export interface WholesaleNavbarProps {
  activeTab: 'catalog' | 'orders' | 'khata' | 'addresses';
  onTabChange: (tab: 'catalog' | 'orders' | 'khata' | 'addresses') => void;
  lang: 'en' | 'ur';
  onToggleLang: () => void;
}

export const WholesaleNavbar: React.FC<WholesaleNavbarProps> = ({
  activeTab,
  onTabChange,
  lang,
  onToggleLang,
}) => {
  const { profile, customerAccount, signOut } = useAuth();
  const { cartItemCount, totalCartons, grandTotal, setIsCartOpen, orders } = useWholesaleOrder();

  const activeOrdersCount = orders.filter((o) => o.orderStatus !== 'delivered').length;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Top Wholesale Micro-bar (Hidden on screens < 768px) */}
      <div
        className="wholesale-microbar"
        style={{
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          padding: '6px 20px',
          fontSize: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ color: '#F59E0B', fontWeight: 700 }}>
            ★ Candi B2B Wholesale Portal
          </span>
          <span style={{ color: '#475569' }}>•</span>
          <span style={{ color: '#94A3B8' }}>Karachi Central Depot (Jodia Bazaar / Korangi)</span>
          <span style={{ color: '#475569' }}>•</span>
          <span style={{ color: '#10B981', fontWeight: 600 }}>✓ FBR Active Taxpayer Wholesale Supply</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Language Switcher for Desktop */}
          <button
            onClick={onToggleLang}
            type="button"
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#F8FAFC',
              borderRadius: '4px',
              padding: '2px 8px',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: 'inherit',
            }}
          >
            {lang === 'en' ? 'اردو میں دیکھیں (Urdu)' : 'View in English'}
          </button>
          <span style={{ color: '#94A3B8' }}>Helpline: +92 (021) 111-CANDI-1</span>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div
        style={{
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Brand & Store Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <Logo size="sm" variant="confectionery" />

          {/* Active Retailer Pill (Hidden on screens < 768px to save screen real estate) */}
          <div
            className="wholesale-retailer-pill"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#F8FAFC',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 6px rgba(16, 185, 129, 0.5)',
              }}
            />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1 }}>
                {customerAccount?.businessName || 'Bilal General Store'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                {customerAccount?.customerType === 'sub_wholesaler' ? 'Sub-Wholesale Platinum Tier' : 'Verified Retail Partner'} • Karachi
              </div>
            </div>
            <Badge
              status="approved"
              label={customerAccount?.customerType === 'sub_wholesaler' ? 'TIER 1' : 'RETAILER'}
            />
          </div>
        </div>

        {/* Navigation Tabs - Desktop Only (Hidden on screens < 768px) */}
        <nav
          className="wholesale-desktop-tabs"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            overflowX: 'auto',
            paddingBottom: '2px',
          }}
        >
          <button
            onClick={() => onTabChange('catalog')}
            type="button"
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === 'catalog' ? '#0F172A' : 'transparent',
              color: activeTab === 'catalog' ? '#FFFFFF' : 'var(--color-text-muted)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🛍️</span>
            <span>Wholesale Catalog</span>
          </button>

          <button
            onClick={() => onTabChange('orders')}
            type="button"
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === 'orders' ? '#0F172A' : 'transparent',
              color: activeTab === 'orders' ? '#FFFFFF' : 'var(--color-text-muted)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              position: 'relative',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <span>📋</span>
            <span>My Orders</span>
            {activeOrdersCount > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--color-promo-crimson)',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  padding: '1px 6px',
                  fontSize: '10px',
                  fontWeight: 800,
                }}
              >
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('khata')}
            type="button"
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === 'khata' ? '#0F172A' : 'transparent',
              color: activeTab === 'khata' ? '#FFFFFF' : 'var(--color-text-muted)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <span>📒</span>
            <span>Credit Khata</span>
          </button>

          <button
            onClick={() => onTabChange('addresses')}
            type="button"
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === 'addresses' ? '#0F172A' : 'transparent',
              color: activeTab === 'addresses' ? '#FFFFFF' : 'var(--color-text-muted)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🏪</span>
            <span>Shop Profile</span>
          </button>
        </nav>

        {/* Right Actions: Accessible on all screen sizes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Mobile Language Switch Button (Accessible on screens < 768px) */}
          <button
            onClick={onToggleLang}
            className="wholesale-mobile-lang"
            type="button"
            aria-label="Switch language"
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              color: '#0F172A',
              borderRadius: '8px',
              padding: '8px 10px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: 'inherit',
              alignItems: 'center',
              gap: '4px',
              minHeight: '40px',
              minWidth: '40px',
              justifyContent: 'center',
            }}
          >
            <span>🌐</span>
            <span>{lang === 'en' ? 'اردو' : 'EN'}</span>
          </button>

          {/* Desktop Expanded Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="wholesale-desktop-cart"
            type="button"
            style={{
              backgroundColor: cartItemCount > 0 ? 'var(--color-promo-crimson, #E11D48)' : '#334155',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '13px',
              boxShadow: cartItemCount > 0 ? '0 4px 12px rgba(225, 29, 72, 0.3)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ fontSize: '15px' }}>🛒</span>
            <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
              <div style={{ fontSize: '10px', opacity: 0.9 }}>
                {cartItemCount} Items ({totalCartons} Units)
              </div>
              <div style={{ fontSize: '13px', fontWeight: 900 }}>
                PKR {grandTotal.toLocaleString()}
              </div>
            </div>
          </button>

          {/* Mobile Compact Cart Icon Badge (Accessible on screens < 768px) */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="wholesale-mobile-cart"
            type="button"
            aria-label={`Shopping cart with ${cartItemCount} items`}
            style={{
              backgroundColor: cartItemCount > 0 ? 'var(--color-promo-crimson, #E11D48)' : '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              minWidth: '40px',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
              boxShadow: cartItemCount > 0 ? '0 3px 10px rgba(225, 29, 72, 0.35)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '18px' }}>🛒</span>
            {cartItemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-primary, #E11D48)',
                  borderRadius: '10px',
                  minWidth: '18px',
                  height: '18px',
                  fontSize: '10px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  border: '1.5px solid var(--color-primary, #E11D48)',
                }}
              >
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Sign Out Button (Desktop / Tablet) */}
          <div className="wholesale-desktop-tabs">
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                await signOut();
                window.location.href = '/welcome';
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

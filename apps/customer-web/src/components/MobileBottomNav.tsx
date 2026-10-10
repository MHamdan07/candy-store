import React from 'react';
import { useWholesaleOrder } from '../context/WholesaleOrderContext';

export interface MobileBottomNavProps {
  activeTab: 'catalog' | 'orders' | 'khata' | 'addresses';
  onTabChange: (tab: 'catalog' | 'orders' | 'khata' | 'addresses') => void;
  activeOrdersCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  activeOrdersCount: propActiveOrdersCount,
}) => {
  const { orders } = useWholesaleOrder();
  const activeOrdersCount =
    propActiveOrdersCount !== undefined
      ? propActiveOrdersCount
      : orders.filter((o) => o.orderStatus !== 'delivered').length;

  const tabs: Array<{
    id: 'catalog' | 'orders' | 'khata' | 'addresses';
    label: string;
    icon: React.ReactNode;
    badgeCount?: number;
  }> = [
    {
      id: 'catalog',
      label: 'Catalog',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      id: 'orders',
      label: 'Orders',
      badgeCount: activeOrdersCount,
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      id: 'khata',
      label: 'Khata',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="9" y1="7" x2="15" y2="7" />
          <line x1="9" y1="11" x2="13" y2="11" />
        </svg>
      ),
    },
    {
      id: 'addresses',
      label: 'Account',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid #E2E8F0',
        boxShadow: '0 -4px 20px rgba(15, 23, 42, 0.08)',
        paddingTop: '6px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)',
        paddingLeft: '8px',
        paddingRight: '8px',
        alignItems: 'center',
        justifyContent: 'space-around',
        fontFamily: 'var(--font-family-base)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`${tab.label} tab`}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              minHeight: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 6px',
              position: 'relative',
              borderRadius: '8px',
              color: isActive ? 'var(--color-primary, #E11D48)' : '#64748B',
              transition: 'all 0.15s ease',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                marginBottom: '3px',
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                transition: 'transform 0.15s ease',
              }}
            >
              {tab.icon}

              {/* Active Badge Count for Orders */}
              {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-10px',
                    backgroundColor: 'var(--color-primary, #E11D48)',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 800,
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    boxShadow: '0 2px 4px rgba(225, 29, 72, 0.4)',
                    border: '1.5px solid #FFFFFF',
                  }}
                >
                  {tab.badgeCount}
                </span>
              )}
            </div>

            <span
              style={{
                fontSize: '11px',
                fontWeight: isActive ? 800 : 600,
                letterSpacing: '0.01em',
                lineHeight: 1.1,
              }}
            >
              {tab.label}
            </span>

            {/* Active Pill Indicator */}
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '0px',
                  width: '16px',
                  height: '3px',
                  backgroundColor: 'var(--color-primary, #E11D48)',
                  borderRadius: '3px',
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};

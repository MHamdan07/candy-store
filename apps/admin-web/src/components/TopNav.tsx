import React from 'react';
import { useAuth } from '@candi/auth';

interface TopNavProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onToggleSidebar?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ title, subtitle, actions, onToggleSidebar }) => {
  const { staffAccount, profile } = useAuth();

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--color-border, #E2E8F0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(16px, 3vw, 32px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        fontFamily: 'var(--font-family-base)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Mobile Hamburger Drawer Toggle */}
        <button
          onClick={onToggleSidebar}
          type="button"
          aria-label="Toggle Navigation Menu"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: '1px solid var(--color-border, #E2E8F0)',
            borderRadius: '6px',
            padding: '7px 9px',
            cursor: 'pointer',
            fontSize: '16px',
            color: 'var(--color-text-main, #0F172A)',
          }}
        >
          ☰
        </button>

        <div>
          <h1
            style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: '17px',
              fontWeight: 800,
              color: 'var(--color-text-main, #0F172A)',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: '12px',
                color: 'var(--color-text-muted, #64748B)',
                margin: '2px 0 0 0',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Search bar input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            border: '1px solid var(--color-border, #E2E8F0)',
            borderRadius: '8px',
            padding: '6px 12px',
            width: '240px',
          }}
          className="admin-search-bar"
        >
          <span style={{ marginRight: '8px', color: 'var(--color-text-muted, #64748B)', fontSize: '13px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search orders, customers, SKUs..."
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontFamily: 'inherit',
              fontSize: '12px',
              width: '100%',
              color: 'var(--color-text-main, #0F172A)',
            }}
          />
          <kbd
            style={{
              fontSize: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border, #E2E8F0)',
              borderRadius: '3px',
              padding: '1px 5px',
              color: 'var(--color-text-muted, #64748B)',
            }}
          >
            /
          </kbd>
        </div>

        {/* Authenticated Staff Identity Badge */}
        {staffAccount && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#F8FAFC',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #E2E8F0)',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#E11D48',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              {(profile?.fullName || 'S')[0]}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main, #0F172A)', lineHeight: 1.2 }}>
                {profile?.fullName || 'Staff User'}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-text-muted, #64748B)', textTransform: 'capitalize' }}>
                {staffAccount.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        {/* Custom Actions */}
        {actions && <div style={{ display: 'flex', gap: '8px' }}>{actions}</div>}
      </div>
    </header>
  );
};

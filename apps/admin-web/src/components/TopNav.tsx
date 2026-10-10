import React from 'react';
import { usePermissions } from '@candi/auth';

interface TopNavProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onToggleSidebar?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ title, subtitle, actions, onToggleSidebar }) => {
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

        {/* Live RBAC Role Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F8FAFC', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--color-border, #E2E8F0)' }}>
          <span style={{ fontSize: '13px' }}>🎭</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--color-text-muted, #64748B)', textTransform: 'uppercase' }}>
              Simulated Role
            </span>
            <RoleSwitcherSelect />
          </div>
        </div>

        {/* Operational Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
            }}
          />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
            Live
          </span>
        </div>

        {/* Custom Actions */}
        {actions && <div style={{ display: 'flex', gap: '8px' }}>{actions}</div>}
      </div>
    </header>
  );
};

const RoleSwitcherSelect: React.FC = () => {
  try {
    const { activeRole, switchRole } = usePermissions();
    return (
      <select
        value={activeRole}
        onChange={(e) => switchRole(e.target.value as any)}
        style={{
          border: 'none',
          backgroundColor: 'transparent',
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--color-text-main, #0F172A)',
          cursor: 'pointer',
          outline: 'none',
          padding: 0,
        }}
      >
        <option value="super_admin">Super Administrator</option>
        <option value="admin_manager">Operations & HR Mgr</option>
        <option value="warehouse_manager">Warehouse Manager</option>
        <option value="warehouse_staff">Warehouse Staff</option>
        <option value="sales_agent">Wholesale Sales Agent</option>
        <option value="delivery_manager">Delivery Manager</option>
        <option value="rider">Delivery Rider</option>
        <option value="accounts_staff">Accounts & Payroll</option>
      </select>
    );
  } catch {
    return <span style={{ fontSize: '11px', fontWeight: 600 }}>Super Admin</span>;
  }
};

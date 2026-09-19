import React from 'react';
import { usePermissions } from '@candi/auth';

interface TopNavProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const TopNav: React.FC<TopNavProps> = ({ title, subtitle, actions }) => {
  return (
    <header
      style={{
        height: '70px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1.5px solid var(--color-bone)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-family-mono)',
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--color-smoky-black)',
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: '12px',
              color: 'var(--color-olive-drab)',
              marginTop: '2px',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Search bar input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-muted)',
            border: '1px solid var(--color-bone)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            width: '280px',
          }}
        >
          <span style={{ marginRight: '8px', color: 'var(--color-olive-drab)', fontSize: '13px' }}>🔍</span>
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
              color: 'var(--color-smoky-black)',
            }}
          />
          <kbd
            style={{
              fontSize: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-bone)',
              borderRadius: '3px',
              padding: '1px 5px',
              color: 'var(--color-olive-drab)',
            }}
          >
            /
          </kbd>
        </div>

        {/* Live RBAC Role Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F8FAFC', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--color-bone)' }}>
          <span style={{ fontSize: '13px' }}>🎭</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-olive-drab)', textTransform: 'uppercase' }}>
              Simulated Role
            </span>
            <RoleSwitcherSelect />
          </div>
        </div>

        {/* Operational Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success)',
              boxShadow: '0 0 0 2px var(--color-success-bg)',
            }}
          />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-olive-drab)' }}>
            Central Hub Live
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
          color: 'var(--color-smoky-black)',
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

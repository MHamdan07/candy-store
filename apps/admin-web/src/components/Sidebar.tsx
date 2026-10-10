import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Logo } from '@candi/ui';
import { useAuth, usePermissions } from '@candi/auth';
import type { SystemModule } from '@candi/types';

interface NavLeafItem {
  label: string;
  path: string;
  icon: string;
  badge?: string;
  module: SystemModule;
}

interface NavSectionItem {
  heading: string;
  module: SystemModule;
  items: {
    label: string;
    path: string;
    icon: string;
    badge?: string;
  }[];
}

type NavEntry = NavLeafItem | NavSectionItem;

export interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const { signOut, profile } = useAuth();
  const { hasPermission, activeRole } = usePermissions();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navEntries: NavEntry[] = [
    { label: 'Dashboard', path: '/', icon: '📊', module: 'dashboard' },
    { label: 'Customers', path: '/customers', icon: '🏪', badge: '5', module: 'customers' },
    { label: 'Products Master', path: '/products', icon: '📦', module: 'inventory' },
    { label: 'Orders Queue', path: '/orders', icon: '📝', badge: '12', module: 'sales' },
    { label: '5-Stage Verification & Picking', path: '/orders/verification', icon: '💬', badge: '5-Stage', module: 'sales' },
    { label: 'Invoices & Khata', path: '/invoices', icon: '🧾', module: 'sales' },
    {
      heading: 'PRICING & OFFERS',
      module: 'sales',
      items: [
        { label: 'Customer Tiers', path: '/pricing/tiers', icon: '🏷️' },
        { label: 'Wholesale Price Lists', path: '/pricing/lists', icon: '💲' },
        { label: 'Trade Offers & Schemes', path: '/pricing/trade-offers', icon: '🎁', badge: '4' },
        { label: 'Order Pricing Preview', path: '/pricing/preview', icon: '⚡' },
      ],
    },
    {
      heading: 'PROCUREMENT',
      module: 'procurement',
      items: [
        { label: 'Suppliers Database', path: '/suppliers', icon: '🏭', badge: '6' },
        { label: 'Purchase Requests', path: '/procurement/requests', icon: '📋' },
        { label: 'Purchase Orders', path: '/procurement/orders', icon: '🛒', badge: '3' },
        { label: 'Goods Received (GRN)', path: '/procurement/grn', icon: '📥', badge: '3' },
        { label: 'Supplier Invoices', path: '/procurement/supplier-invoices', icon: '⚖️', badge: '3' },
        { label: 'Stock Planning & Reorder', path: '/procurement/planning', icon: '📈', badge: '3' },
      ],
    },
    {
      heading: 'RECEIVABLES & KHATA',
      module: 'sales',
      items: [
        { label: 'Receivables Dashboard', path: '/receivables/dashboard', icon: '💳' },
        { label: 'Customer Statement', path: '/receivables/statement', icon: '📜' },
        { label: 'Invoice Aging', path: '/receivables/aging', icon: '⏳', badge: '5' },
        { label: 'Collection Follow-ups', path: '/receivables/follow-ups', icon: '📞', badge: '4' },
      ],
    },
    {
      heading: 'FLEET & LAST-MILE DELIVERY',
      module: 'delivery',
      items: [
        { label: 'Trip Manifest Console', path: '/delivery/fleet-console', icon: '🚚', badge: 'Live' },
        { label: 'Cash Collections', path: '/cash/collections', icon: '📥', badge: '5' },
        { label: 'Cash Handover', path: '/cash/handovers', icon: '🤝', badge: '2' },
        { label: 'Vault Reconciliation', path: '/cash/reconciliation', icon: '🔐', badge: '$0' },
      ],
    },
    {
      heading: 'FINANCE & LEDGERS',
      module: 'finance',
      items: [
        { label: 'Chart of Accounts', path: '/finance/coa', icon: '🏛️' },
        { label: 'Customer Ledger', path: '/finance/customer-ledger', icon: '👤' },
        { label: 'Supplier Ledger', path: '/finance/supplier-ledger', icon: '🏭' },
        { label: 'Payment Register', path: '/finance/payments', icon: '💵', badge: '7' },
        { label: 'Journal Entries', path: '/finance/journal-entries', icon: '📖', badge: '4' },
        { label: 'GL Reconciliation', path: '/finance/reconciliation', icon: '⚖️', badge: '$0' },
        { label: 'Financial Reports', path: '/finance/reports', icon: '📊', badge: '14' },
        { label: 'Period Closing', path: '/finance/period-closing', icon: '🔒', badge: 'GAAP' },
        { label: 'Exception Tower', path: '/finance/exceptions', icon: '🚨', badge: '8' },
        { label: 'Approvals & Controls', path: '/finance/approvals', icon: '🛡️', badge: '4' },
        { label: 'Financial Audit Trail', path: '/finance/audit-trail', icon: '🔍' },
      ],
    },
    {
      heading: 'WORKFORCE & OPERATIONS',
      module: 'administration',
      items: [
        { label: 'Workforce Dashboard', path: '/workforce/dashboard', icon: '👥' },
        { label: 'Employees Master', path: '/workforce/employees', icon: '📇' },
        { label: 'Shifts & Rosters', path: '/workforce/shifts', icon: '⏰' },
        { label: 'Attendance Register', path: '/workforce/attendance', icon: '📅' },
        { label: 'Leave Requests', path: '/workforce/leaves', icon: '🏖️' },
        { label: 'Payroll Register', path: '/workforce/payroll', icon: '💰' },
        { label: 'Performance Appraisals', path: '/workforce/performance', icon: '🎯' },
        { label: 'Training Matrix', path: '/workforce/training', icon: '📚' },
        { label: 'Workforce Reports', path: '/workforce/reports', icon: '📑' },
        { label: 'Roles & Permissions', path: '/admin/roles', icon: '🔑' },
        { label: 'Audit Trail', path: '/workforce/audit', icon: '🛡️' },
      ],
    },
  ];

  const visibleEntries = navEntries.filter((entry) => {
    return hasPermission(entry.module, 'view');
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            zIndex: 998,
            backdropFilter: 'blur(3px)',
          }}
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          borderRight: '1px solid #1E293B',
          flexShrink: 0,
          fontFamily: 'var(--font-family-base)',
          zIndex: 999,
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={mobileOpen ? 'admin-sidebar-mobile-open' : ''}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid #1E293B',
            backgroundColor: '#0F172A',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Logo variant="light" size="sm" />
          {mobileOpen && (
            <button
              onClick={onMobileClose}
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {visibleEntries.map((item, idx) => {
            if ('heading' in item && item.items) {
              return (
                <div key={idx} style={{ marginTop: '18px', marginBottom: '6px' }}>
                  <div
                    style={{
                      padding: '0 12px',
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      color: '#64748B',
                      marginBottom: '6px',
                    }}
                  >
                    {item.heading}
                  </div>
                  {item.items.map((sub, sIdx) => (
                    <NavLink
                      key={sIdx}
                      to={sub.path}
                      onClick={onMobileClose}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        marginBottom: '2px',
                        fontSize: '13px',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#FFFFFF' : '#94A3B8',
                        backgroundColor: isActive ? '#1E293B' : 'transparent',
                        textDecoration: 'none',
                        borderLeft: isActive ? '3px solid #E11D48' : '3px solid transparent',
                        transition: 'all 0.15s ease',
                      })}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '15px' }}>{sub.icon}</span>
                        <span>{sub.label}</span>
                      </div>
                      {sub.badge && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            backgroundColor: '#E11D48',
                            color: '#FFFFFF',
                            padding: '1px 6px',
                            borderRadius: '999px',
                          }}
                        >
                          {sub.badge}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              );
            }

            if ('path' in item) {
              return (
                <NavLink
                  key={idx}
                  to={item.path}
                  onClick={onMobileClose}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    marginBottom: '2px',
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    backgroundColor: isActive ? '#1E293B' : 'transparent',
                    textDecoration: 'none',
                    borderLeft: isActive ? '3px solid #E11D48' : '3px solid transparent',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '15px' }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        backgroundColor: '#E11D48',
                        color: '#FFFFFF',
                        padding: '1px 6px',
                        borderRadius: '999px',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            }

            return null;
          })}
        </nav>

        {/* User Session Footer */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid #1E293B',
            backgroundColor: '#0B1120',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#1E293B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '12px',
                border: '1px solid #334155',
              }}
            >
              {profile?.fullName ? profile.fullName.slice(0, 2).toUpperCase() : 'FZ'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: '#FFFFFF',
                }}
              >
                {profile?.fullName || 'Farhan Zaidi'}
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'capitalize' }}>
                Role: <strong style={{ color: '#E2E8F0' }}>{activeRole}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              padding: '4px 0',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#FFFFFF')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#94A3B8')}
          >
            Sign Out of Control Tower →
          </button>
        </div>
      </aside>
    </>
  );
};

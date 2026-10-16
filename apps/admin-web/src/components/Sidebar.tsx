import React, { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Logo } from '@candi/ui';
import { useAuth, usePermissions } from '@candi/auth';
import type { SystemModule } from '@candi/types';
import {
  IconDashboard,
  IconOrders,
  IconVerification,
  IconInvoice,
  IconCustomers,
  IconPricing,
  IconInventory,
  IconGoodsReceipt,
  IconFleet,
  IconCash,
  IconKhata,
  IconLogout,
} from './Icons';

// Live Demo Stores for Dynamic Badges
import { INITIAL_VERIFICATION_RECORDS } from '../data/conversationalVerification';
import { CUSTOMERS_DATABASE } from '../data/customers';
import { INITIAL_INVOICES_AGING } from '../data/receivablesData';

interface NavLeafItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  module: SystemModule;
}

interface NavSectionItem {
  heading: string;
  items: {
    label: string;
    path: string;
    icon: React.ReactNode;
    badge?: string;
    module: SystemModule;
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

  // Real-time badge calculations
  const pendingConfirmationsCount = useMemo(() => {
    return INITIAL_VERIFICATION_RECORDS.filter(
      (r) =>
        r.verificationStatus === 'whatsapp_pending' ||
        r.verificationStatus === 'whatsapp_delivered' ||
        r.verificationStatus === 'whatsapp_read' ||
        r.verificationStatus === 'escalated_telesales' ||
        r.verificationStatus === 'changes_requested'
    ).length;
  }, []);

  const pendingCustomerReviewCount = useMemo(() => {
    return CUSTOMERS_DATABASE.filter(
      (c) => c.status === 'pending_approval' || c.status === 'new_customer'
    ).length;
  }, []);

  const overdueInvoicesCount = useMemo(() => {
    return INITIAL_INVOICES_AGING.filter(
      (inv) => inv.status === 'overdue' || (inv.daysOverdue || 0) > 0
    ).length;
  }, []);

  // Workflow-grouped navigation according to blueprint
  const navEntries: NavEntry[] = [
    {
      label: 'Control Tower',
      path: '/',
      icon: <IconDashboard size={18} />,
      module: 'dashboard',
    },
    {
      heading: 'ORDERS & VERIFICATION',
      items: [
        {
          label: 'Order Console',
          path: '/orders',
          icon: <IconOrders size={18} />,
          module: 'sales',
        },
        {
          label: '5-Stage Verification',
          path: '/orders/verification',
          icon: <IconVerification size={18} />,
          badge: pendingConfirmationsCount > 0 ? pendingConfirmationsCount.toString() : undefined,
          module: 'sales',
        },
        {
          label: 'Invoices & Challans',
          path: '/invoices',
          icon: <IconInvoice size={18} />,
          module: 'sales',
        },
      ],
    },
    {
      heading: 'CUSTOMERS & PRICING',
      items: [
        {
          label: 'Customers Directory',
          path: '/customers',
          icon: <IconCustomers size={18} />,
          badge: pendingCustomerReviewCount > 0 ? pendingCustomerReviewCount.toString() : undefined,
          module: 'customers',
        },
        {
          label: 'Customer Tiers',
          path: '/pricing/tiers',
          icon: <IconPricing size={18} />,
          module: 'customers',
        },
        {
          label: 'Wholesale Price Lists',
          path: '/pricing/lists',
          icon: <IconPricing size={18} />,
          module: 'customers',
        },
        {
          label: 'Trade Offers & Schemes',
          path: '/pricing/trade-offers',
          icon: <IconPricing size={18} />,
          module: 'sales',
        },
      ],
    },
    {
      heading: 'INVENTORY & WAREHOUSE',
      items: [
        {
          label: 'Products Master',
          path: '/products',
          icon: <IconInventory size={18} />,
          module: 'inventory',
        },
        {
          label: 'Goods Receipts (GRN)',
          path: '/procurement/grn',
          icon: <IconGoodsReceipt size={18} />,
          module: 'inventory',
        },
      ],
    },
    {
      heading: 'FLEET & CASH SETTLEMENT',
      items: [
        {
          label: 'Trip Manifest Console',
          path: '/delivery/fleet-console',
          icon: <IconFleet size={18} />,
          module: 'delivery',
        },
        {
          label: 'Cash Collections',
          path: '/cash/collections',
          icon: <IconCash size={18} />,
          module: 'delivery',
        },
        {
          label: 'Cash Handover',
          path: '/cash/handovers',
          icon: <IconCash size={18} />,
          module: 'delivery',
        },
        {
          label: 'Vault Reconciliation',
          path: '/cash/reconciliation',
          icon: <IconCash size={18} />,
          module: 'delivery',
        },
      ],
    },
    {
      heading: 'KHATA & RECEIVABLES',
      items: [
        {
          label: 'Receivables Dashboard',
          path: '/receivables/dashboard',
          icon: <IconKhata size={18} />,
          module: 'sales',
        },
        {
          label: 'Customer Statements',
          path: '/receivables/statement',
          icon: <IconKhata size={18} />,
          module: 'sales',
        },
        {
          label: 'Invoice Aging',
          path: '/receivables/aging',
          icon: <IconInvoice size={18} />,
          badge: overdueInvoicesCount > 0 ? overdueInvoicesCount.toString() : undefined,
          module: 'sales',
        },
        {
          label: 'Collection Follow-ups',
          path: '/receivables/follow-ups',
          icon: <IconKhata size={18} />,
          module: 'sales',
        },
        {
          label: 'Customer Sub-Ledger',
          path: '/finance/customer-ledger',
          icon: <IconKhata size={18} />,
          module: 'finance',
        },
        {
          label: 'Payment Register',
          path: '/finance/payments',
          icon: <IconCash size={18} />,
          module: 'finance',
        },
      ],
    },
  ];

  // Role-based visibility filtering per item and section
  const visibleEntries = useMemo(() => {
    return navEntries
      .map((entry) => {
        if ('items' in entry) {
          const permittedItems = entry.items.filter((item) =>
            hasPermission(item.module, 'view')
          );
          if (permittedItems.length === 0) return null;
          return {
            ...entry,
            items: permittedItems,
          };
        }
        if (hasPermission(entry.module, 'view')) {
          return entry;
        }
        return null;
      })
      .filter((entry): entry is NavEntry => entry !== null);
  }, [hasPermission, activeRole, pendingConfirmationsCount, pendingCustomerReviewCount, overdueInvoicesCount]);

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
        <nav style={{ flex: 1, padding: '14px 12px', overflowY: 'auto' }}>
          {visibleEntries.map((item, idx) => {
            if ('heading' in item && item.items) {
              return (
                <div key={idx} style={{ marginTop: '16px', marginBottom: '4px' }}>
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
                        <span style={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
                          {sub.icon}
                        </span>
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
                            minWidth: '18px',
                            textAlign: 'center',
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
                    <span style={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
                      {item.icon}
                    </span>
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
              {profile?.fullName ? profile.fullName.slice(0, 2).toUpperCase() : 'AD'}
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
                {profile?.fullName || 'Staff User'}
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
              padding: '6px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#FFFFFF')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#94A3B8')}
          >
            <IconLogout size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

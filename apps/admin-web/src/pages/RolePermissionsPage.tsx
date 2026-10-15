import React, { useState } from 'react';
import { Card, Badge, Button, Alert } from '@candi/ui';
import { usePermissions, STANDARD_ROLES } from '@candi/auth';
import type { StaffRoleName, SystemModule, ModulePermissions } from '@candi/types';

const MODULES_LIST: { id: SystemModule; name: string; icon: string; description: string; sensitive?: boolean }[] = [
  { id: 'dashboard', name: 'Dashboard', icon: '📊', description: 'Operational command center and real-time wholesale analytics' },
  { id: 'sales', name: 'Sales & Orders', icon: '📝', description: 'Order booking, invoicing, pricing tiers, and khata ledger' },
  { id: 'customers', name: 'Customers & Retailers', icon: '🏪', description: 'Retailer KYC verification, tier assignments, and khata balances' },
  { id: 'inventory', name: 'Inventory Master', icon: '📦', description: 'SKU catalog, buffer levels, stock intake, and physical stock counts' },
  { id: 'procurement', name: 'Procurement & Purchasing', icon: '🛒', description: 'Purchase requests, supplier purchase orders, and GRN dock receipts' },
  { id: 'suppliers', name: 'Suppliers Database', icon: '🏭', description: 'Manufacturer profiles, wholesale covenants, and vendor ledgers' },
  { id: 'delivery', name: 'Fleet Delivery', icon: '🚚', description: 'Route optimization, delivery dispatch, rider manifests, and COD receipts' },
  { id: 'finance', name: 'Finance & Ledgers', icon: '🏛️', description: 'Double-entry journals, Chart of Accounts, payables, and period closings', sensitive: true },
  { id: 'reports', name: 'Intelligence & Reports', icon: '📈', description: 'Operational business intelligence, aging reports, and audit trails' },
  { id: 'administration', name: 'Workforce & Administration', icon: '🛡️', description: 'User security, employee onboarding, shift rostering, and RBAC matrix', sensitive: true },
];

const ACTIONS_LIST: (keyof ModulePermissions)[] = ['view', 'create', 'edit', 'approve', 'delete'];

export const RolePermissionsPage: React.FC = () => {
  const {
    activeRole,
    matrix,
    switchRole,
    updateRolePermission,
    resetPermissionsToDefault,
  } = usePermissions();

  const [inspectingRole, setInspectingRole] = useState<StaffRoleName>(activeRole);
  const [notification, setNotification] = useState<string | null>(null);

  const roleDef = STANDARD_ROLES.find((r) => r.roleName === inspectingRole) || STANDARD_ROLES[0];
  const rolePermissions = matrix[inspectingRole] || roleDef.permissions;

  const handleToggle = (module: SystemModule, action: keyof ModulePermissions) => {
    const currentVal = rolePermissions[module]?.[action] || false;
    updateRolePermission(inspectingRole, module, action, !currentVal);
    setNotification(`Updated permission: ${inspectingRole} -> ${module}.${action} = ${!currentVal ? 'GRANTED' : 'REVOKED'}`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleApplyRole = (roleName: StaffRoleName) => {
    switchRole(roleName);
    setNotification(`Switched active session role to "${roleName.toUpperCase()}". Navigation guards updated.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '20px 24px',
          borderRadius: '12px',
          border: '1px solid var(--color-gray-200)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-gray-900)', margin: 0 }}>
              10-Module RBAC Permissions Matrix & Security Governance
            </h1>
            <Badge variant="primary">{STANDARD_ROLES.length} Standard Roles</Badge>
            <span
              style={{
                fontSize: '12px',
                padding: '4px 10px',
                backgroundColor: 'var(--color-cream)',
                borderRadius: '16px',
                color: 'var(--color-olive-drab)',
                fontWeight: 600,
                border: '1px solid var(--color-olive-drab)',
              }}
            >
              Simulating: {activeRole}
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', color: 'var(--color-gray-600)', fontSize: '14px' }}>
            Define role capabilities across all 10 platform modules. Changes take effect in real-time across navigation and route guards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" onClick={resetPermissionsToDefault}>
            🔄 Reset to Standard Template
          </Button>
          <Button
            variant="primary"
            onClick={() => handleApplyRole(inspectingRole)}
          >
            🚀 Impersonate / Test {inspectingRole}
          </Button>
        </div>
      </div>

      {notification && (
        <Alert variant="success" onClose={() => setNotification(null)}>
          {notification}
        </Alert>
      )}

      {/* Role Selection Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-gray-200)', overflowX: 'auto', paddingBottom: '8px' }}>
        {STANDARD_ROLES.map((r) => {
          const isSelected = inspectingRole === r.roleName;
          const isCurrentActive = activeRole === r.roleName;
          return (
            <button
              key={r.id}
              onClick={() => setInspectingRole(r.roleName)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: isCurrentActive ? '2px solid #F59E0B' : '1px solid transparent',
                backgroundColor: isSelected ? 'var(--color-olive-drab)' : '#F3F4F6',
                color: isSelected ? '#FFFFFF' : 'var(--color-gray-700)',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
              }}
            >
              {r.displayName}
              {isCurrentActive && (
                <span
                  style={{
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                  }}
                >
                  ACTIVE
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Role Overview Card */}
      <Card style={{ padding: '20px 24px', backgroundColor: '#F8FAFC' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'var(--color-gray-900)' }}>
                {roleDef.displayName}
              </h2>
              <Badge variant={roleDef.isSensitive ? 'error' : 'neutral'}>
                {roleDef.isSensitive ? 'SENSITIVE PRIVILEGES' : 'STANDARD OPERATIONAL'}
              </Badge>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--color-gray-600)' }}>
              {roleDef.description}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="secondary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={() => handleApplyRole(inspectingRole)}
            >
              Switch Active User Role to {inspectingRole}
            </Button>
          </div>
        </div>
      </Card>

      {/* 10-Module Permissions Matrix Grid */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: 'var(--color-gray-900)' }}>
              Module Access Matrix for: <span style={{ color: 'var(--color-olive-drab)' }}>{roleDef.displayName}</span>
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
              Toggle checkboxes to customize capabilities. Unauthorized modules will be completely hidden from the sidebar and route-guarded.
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left', color: 'var(--color-gray-600)' }}>
                <th style={{ padding: '14px 18px', width: '30%' }}>System Module</th>
                <th style={{ padding: '14px 18px', textAlign: 'center' }}>View / Read</th>
                <th style={{ padding: '14px 18px', textAlign: 'center' }}>Create / Add</th>
                <th style={{ padding: '14px 18px', textAlign: 'center' }}>Edit / Update</th>
                <th style={{ padding: '14px 18px', textAlign: 'center' }}>Approve / Authorize</th>
                <th style={{ padding: '14px 18px', textAlign: 'center' }}>Delete / Deactivate</th>
              </tr>
            </thead>
            <tbody>
              {MODULES_LIST.map((mod) => {
                const perms = rolePermissions[mod.id] || {
                  view: false,
                  create: false,
                  edit: false,
                  approve: false,
                  delete: false,
                };

                return (
                  <tr
                    key={mod.id}
                    style={{
                      borderBottom: '1px solid var(--color-gray-100)',
                      backgroundColor: perms.view ? '#FFFFFF' : '#F9FAFB',
                    }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '18px' }}>{mod.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-gray-900)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {mod.name}
                            {mod.sensitive && (
                              <span style={{ fontSize: '10px', backgroundColor: '#FEE2E2', color: '#991B1B', padding: '1px 5px', borderRadius: '3px' }}>
                                SENSITIVE
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--color-gray-500)', display: 'block' }}>
                            {mod.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    {ACTIONS_LIST.map((action) => {
                      const isChecked = perms[action];
                      return (
                        <td key={action} style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggle(mod.id, action)}
                              style={{
                                width: '18px',
                                height: '18px',
                                cursor: 'pointer',
                                accentColor: 'var(--color-olive-drab)',
                              }}
                            />
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

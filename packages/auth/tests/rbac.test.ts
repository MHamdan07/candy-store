import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_ROLE_PERMISSIONS } from '../src/matrix.ts';
import { MOCK_ACCOUNTS } from '../src/client.ts';
import type { StaffRoleName, SystemModule } from '@candi/types';

// Helper function to check view permission for a given role on a module
function canRoleAccessModule(role: StaffRoleName, module: SystemModule): boolean {
  const rolePerms = DEFAULT_ROLE_PERMISSIONS[role];
  if (!rolePerms) return false;
  return Boolean(rolePerms[module]?.view);
}

test('Test users exist in MOCK_ACCOUNTS for all 8 staff roles', () => {
  const expectedStaff = [
    { phone: '+923009999999', role: 'super_admin', name: 'Farhan Zaidi' },
    { phone: '+923009999901', role: 'admin_manager', name: 'Bilal Ahmed' },
    { phone: '+923009999902', role: 'warehouse_manager', name: 'Asim Raza' },
    { phone: '+923009999903', role: 'warehouse_staff', name: 'Kashif Mehmood' },
    { phone: '+923009999904', role: 'sales_agent', name: 'Hamza Tariq' },
    { phone: '+923009999905', role: 'delivery_manager', name: 'Salman Khan' },
    { phone: '+923009999906', role: 'rider', name: 'Usman Ghani' },
    { phone: '+923009999907', role: 'accounts_staff', name: 'Naveed Siddiqui' },
  ];

  for (const staff of expectedStaff) {
    const account = MOCK_ACCOUNTS[staff.phone];
    assert.ok(account, `Account for ${staff.phone} (${staff.role}) should exist`);
    assert.ok(account.staffAccount, `staffAccount should be present for ${staff.phone}`);
    assert.equal(account.staffAccount.role, staff.role);
    assert.equal(account.staffAccount.isActive, true);
    assert.ok(account.profile.fullName.includes(staff.name));
  }
});

test('Super Admin has access to all active modules and routes', () => {
  const modules: SystemModule[] = [
    'dashboard',
    'sales',
    'customers',
    'inventory',
    'delivery',
    'finance',
  ];

  for (const mod of modules) {
    assert.equal(canRoleAccessModule('super_admin', mod), true, `Super admin must access ${mod}`);
  }
});

test('Warehouse Manager can only access allowed operational routes', () => {
  // Allowed
  assert.equal(canRoleAccessModule('warehouse_manager', 'dashboard'), true);
  assert.equal(canRoleAccessModule('warehouse_manager', 'inventory'), true);
  assert.equal(canRoleAccessModule('warehouse_manager', 'delivery'), true);

  // Prohibited: sales orders, customer khata, finance GL
  assert.equal(canRoleAccessModule('warehouse_manager', 'sales'), false);
  assert.equal(canRoleAccessModule('warehouse_manager', 'customers'), false);
  assert.equal(canRoleAccessModule('warehouse_manager', 'finance'), false);
});

test('Delivery Rider can only access delivery routes and customer drop-offs', () => {
  // Allowed
  assert.equal(canRoleAccessModule('rider', 'dashboard'), true);
  assert.equal(canRoleAccessModule('rider', 'delivery'), true);
  assert.equal(canRoleAccessModule('rider', 'customers'), true);

  // Prohibited: inventory adjustment, sales order book, finance GL
  assert.equal(canRoleAccessModule('rider', 'inventory'), false);
  assert.equal(canRoleAccessModule('rider', 'sales'), false);
  assert.equal(canRoleAccessModule('rider', 'finance'), false);
});

test('Accounts Staff can access finance, khata, customer ledger, but not delivery routing', () => {
  // Allowed
  assert.equal(canRoleAccessModule('accounts_staff', 'dashboard'), true);
  assert.equal(canRoleAccessModule('accounts_staff', 'finance'), true);
  assert.equal(canRoleAccessModule('accounts_staff', 'sales'), true);
  assert.equal(canRoleAccessModule('accounts_staff', 'customers'), true);

  // Prohibited: fleet delivery dispatch
  assert.equal(canRoleAccessModule('accounts_staff', 'delivery'), false);
});

test('Wholesale Sales Agent can book orders and view customers, but cannot access finance GL', () => {
  // Allowed
  assert.equal(canRoleAccessModule('sales_agent', 'dashboard'), true);
  assert.equal(canRoleAccessModule('sales_agent', 'sales'), true);
  assert.equal(canRoleAccessModule('sales_agent', 'customers'), true);
  assert.equal(canRoleAccessModule('sales_agent', 'inventory'), true);

  // Prohibited
  assert.equal(canRoleAccessModule('sales_agent', 'finance'), false);
});

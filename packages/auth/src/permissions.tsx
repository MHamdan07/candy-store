import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  StaffRoleName,
  SystemModule,
  ModulePermissions,
  RoleDefinition,
} from '@candi/types';
import { useAuth } from './context';

// Standard 10-Module Default Permissions Matrix
export const DEFAULT_ROLE_PERMISSIONS: Record<StaffRoleName, Record<SystemModule, ModulePermissions>> = {
  super_admin: {
    dashboard: { view: true, create: true, edit: true, approve: true, delete: true },
    sales: { view: true, create: true, edit: true, approve: true, delete: true },
    customers: { view: true, create: true, edit: true, approve: true, delete: true },
    inventory: { view: true, create: true, edit: true, approve: true, delete: true },
    procurement: { view: true, create: true, edit: true, approve: true, delete: true },
    suppliers: { view: true, create: true, edit: true, approve: true, delete: true },
    delivery: { view: true, create: true, edit: true, approve: true, delete: true },
    finance: { view: true, create: true, edit: true, approve: true, delete: true },
    reports: { view: true, create: true, edit: true, approve: true, delete: true },
    administration: { view: true, create: true, edit: true, approve: true, delete: true },
  },
  admin_manager: {
    dashboard: { view: true, create: true, edit: true, approve: true, delete: false },
    sales: { view: true, create: true, edit: true, approve: true, delete: false },
    customers: { view: true, create: true, edit: true, approve: true, delete: false },
    inventory: { view: true, create: true, edit: true, approve: true, delete: false },
    procurement: { view: true, create: true, edit: true, approve: true, delete: false },
    suppliers: { view: true, create: true, edit: true, approve: true, delete: false },
    delivery: { view: true, create: true, edit: true, approve: true, delete: false },
    finance: { view: true, create: true, edit: true, approve: true, delete: false },
    reports: { view: true, create: true, edit: true, approve: true, delete: false },
    administration: { view: true, create: true, edit: true, approve: true, delete: false },
  },
  warehouse_manager: {
    dashboard: { view: true, create: false, edit: false, approve: false, delete: false },
    sales: { view: true, create: false, edit: false, approve: false, delete: false },
    customers: { view: true, create: false, edit: false, approve: false, delete: false },
    inventory: { view: true, create: true, edit: true, approve: true, delete: false },
    procurement: { view: true, create: true, edit: true, approve: false, delete: false },
    suppliers: { view: true, create: false, edit: false, approve: false, delete: false },
    delivery: { view: true, create: true, edit: true, approve: true, delete: false },
    finance: { view: false, create: false, edit: false, approve: false, delete: false },
    reports: { view: true, create: false, edit: false, approve: false, delete: false },
    administration: { view: false, create: false, edit: false, approve: false, delete: false },
  },
  warehouse_staff: {
    dashboard: { view: true, create: false, edit: false, approve: false, delete: false },
    sales: { view: false, create: false, edit: false, approve: false, delete: false },
    customers: { view: false, create: false, edit: false, approve: false, delete: false },
    inventory: { view: true, create: true, edit: false, approve: false, delete: false },
    procurement: { view: true, create: false, edit: false, approve: false, delete: false },
    suppliers: { view: false, create: false, edit: false, approve: false, delete: false },
    delivery: { view: true, create: false, edit: false, approve: false, delete: false },
    finance: { view: false, create: false, edit: false, approve: false, delete: false },
    reports: { view: false, create: false, edit: false, approve: false, delete: false },
    administration: { view: false, create: false, edit: false, approve: false, delete: false },
  },
  sales_agent: {
    dashboard: { view: true, create: false, edit: false, approve: false, delete: false },
    sales: { view: true, create: true, edit: true, approve: false, delete: false },
    customers: { view: true, create: true, edit: true, approve: false, delete: false },
    inventory: { view: true, create: false, edit: false, approve: false, delete: false },
    procurement: { view: false, create: false, edit: false, approve: false, delete: false },
    suppliers: { view: false, create: false, edit: false, approve: false, delete: false },
    delivery: { view: true, create: false, edit: false, approve: false, delete: false },
    finance: { view: false, create: false, edit: false, approve: false, delete: false },
    reports: { view: true, create: false, edit: false, approve: false, delete: false },
    administration: { view: false, create: false, edit: false, approve: false, delete: false },
  },
  delivery_manager: {
    dashboard: { view: true, create: false, edit: false, approve: false, delete: false },
    sales: { view: true, create: false, edit: false, approve: false, delete: false },
    customers: { view: true, create: false, edit: false, approve: false, delete: false },
    inventory: { view: true, create: false, edit: false, approve: false, delete: false },
    procurement: { view: false, create: false, edit: false, approve: false, delete: false },
    suppliers: { view: false, create: false, edit: false, approve: false, delete: false },
    delivery: { view: true, create: true, edit: true, approve: true, delete: false },
    finance: { view: false, create: false, edit: false, approve: false, delete: false },
    reports: { view: true, create: false, edit: false, approve: false, delete: false },
    administration: { view: false, create: false, edit: false, approve: false, delete: false },
  },
  rider: {
    dashboard: { view: true, create: false, edit: false, approve: false, delete: false },
    sales: { view: false, create: false, edit: false, approve: false, delete: false },
    customers: { view: true, create: false, edit: false, approve: false, delete: false },
    inventory: { view: false, create: false, edit: false, approve: false, delete: false },
    procurement: { view: false, create: false, edit: false, approve: false, delete: false },
    suppliers: { view: false, create: false, edit: false, approve: false, delete: false },
    delivery: { view: true, create: false, edit: true, approve: false, delete: false },
    finance: { view: false, create: false, edit: false, approve: false, delete: false },
    reports: { view: false, create: false, edit: false, approve: false, delete: false },
    administration: { view: false, create: false, edit: false, approve: false, delete: false },
  },
  accounts_staff: {
    dashboard: { view: true, create: false, edit: false, approve: false, delete: false },
    sales: { view: true, create: false, edit: false, approve: false, delete: false },
    customers: { view: true, create: false, edit: false, approve: false, delete: false },
    inventory: { view: true, create: false, edit: false, approve: false, delete: false },
    procurement: { view: true, create: false, edit: false, approve: false, delete: false },
    suppliers: { view: true, create: false, edit: false, approve: false, delete: false },
    delivery: { view: false, create: false, edit: false, approve: false, delete: false },
    finance: { view: true, create: true, edit: true, approve: true, delete: false },
    reports: { view: true, create: true, edit: false, approve: false, delete: false },
    administration: { view: false, create: false, edit: false, approve: false, delete: false },
  },
};

export const STANDARD_ROLES: RoleDefinition[] = [
  {
    id: 'role-super-admin',
    roleName: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Full unconstrained platform control, user governance, security and financial clearance',
    isSystemRole: true,
    isSensitive: true,
    permissions: DEFAULT_ROLE_PERMISSIONS.super_admin,
    assignedEmployeeCount: 1,
  },
  {
    id: 'role-admin-manager',
    roleName: 'admin_manager',
    displayName: 'Operations & HR Manager',
    description: 'Workforce operations, approvals, customer verification, and organizational governance',
    isSystemRole: true,
    isSensitive: true,
    permissions: DEFAULT_ROLE_PERMISSIONS.admin_manager,
    assignedEmployeeCount: 3,
  },
  {
    id: 'role-warehouse-manager',
    roleName: 'warehouse_manager',
    displayName: 'Warehouse Manager',
    description: 'Inventory control, warehouse shifts, receiving (GRN) and dispatch operations',
    isSystemRole: true,
    isSensitive: false,
    permissions: DEFAULT_ROLE_PERMISSIONS.warehouse_manager,
    assignedEmployeeCount: 4,
  },
  {
    id: 'role-warehouse-staff',
    roleName: 'warehouse_staff',
    displayName: 'Warehouse Staff',
    description: 'Picking, packing, barcode scanning, and receiving dock assistance',
    isSystemRole: true,
    isSensitive: false,
    permissions: DEFAULT_ROLE_PERMISSIONS.warehouse_staff,
    assignedEmployeeCount: 12,
  },
  {
    id: 'role-sales-agent',
    roleName: 'sales_agent',
    displayName: 'Wholesale Sales Representative',
    description: 'Customer order booking, tier rate checks, customer visits, and order tracking',
    isSystemRole: true,
    isSensitive: false,
    permissions: DEFAULT_ROLE_PERMISSIONS.sales_agent,
    assignedEmployeeCount: 8,
  },
  {
    id: 'role-delivery-manager',
    roleName: 'delivery_manager',
    displayName: 'Logistics & Fleet Manager',
    description: 'Fleet routing, delivery scheduling, rider shifts, and delivery completion signoff',
    isSystemRole: true,
    isSensitive: false,
    permissions: DEFAULT_ROLE_PERMISSIONS.delivery_manager,
    assignedEmployeeCount: 2,
  },
  {
    id: 'role-rider',
    roleName: 'rider',
    displayName: 'Delivery Fleet Rider',
    description: 'Order drop-off, electronic proof of delivery, and cash collection on routes',
    isSystemRole: true,
    isSensitive: false,
    permissions: DEFAULT_ROLE_PERMISSIONS.rider,
    assignedEmployeeCount: 15,
  },
  {
    id: 'role-accounts-staff',
    roleName: 'accounts_staff',
    displayName: 'Accounts & Payroll Officer',
    description: 'Double-entry bookkeeping, cash reconciliation, khata ledgers, and payroll batches',
    isSystemRole: true,
    isSensitive: true,
    permissions: DEFAULT_ROLE_PERMISSIONS.accounts_staff,
    assignedEmployeeCount: 3,
  },
];

interface PermissionsContextType {
  activeRole: StaffRoleName;
  matrix: Record<StaffRoleName, Record<SystemModule, ModulePermissions>>;
  hasPermission: (module: SystemModule, action?: keyof ModulePermissions) => boolean;
  canViewCompensation: () => boolean;
  canApproveLeave: () => boolean;
  canApprovePayroll: () => boolean;
  canOverrideAttendance: () => boolean;
  switchRole: (role: StaffRoleName) => void;
  updateRolePermission: (
    role: StaffRoleName,
    module: SystemModule,
    action: keyof ModulePermissions,
    value: boolean
  ) => void;
  resetPermissionsToDefault: () => void;
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

const STORAGE_KEY_ROLE = 'candi_active_role_v1';
const STORAGE_KEY_MATRIX = 'candi_role_permissions_matrix_v1';

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { staffAccount } = useAuth();

  const [activeRole, setActiveRole] = useState<StaffRoleName>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ROLE);
    if (saved) return saved as StaffRoleName;
    return staffAccount?.role || 'super_admin';
  });

  const [matrix, setMatrix] = useState<Record<StaffRoleName, Record<SystemModule, ModulePermissions>>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MATRIX);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_ROLE_PERMISSIONS;
  });

  // Sync if staffAccount changes and no override saved
  useEffect(() => {
    if (staffAccount?.role && !localStorage.getItem(STORAGE_KEY_ROLE)) {
      setActiveRole(staffAccount.role);
    }
  }, [staffAccount]);

  const switchRole = (role: StaffRoleName) => {
    setActiveRole(role);
    localStorage.setItem(STORAGE_KEY_ROLE, role);
  };

  const updateRolePermission = (
    role: StaffRoleName,
    module: SystemModule,
    action: keyof ModulePermissions,
    value: boolean
  ) => {
    setMatrix((prev) => {
      const updated = {
        ...prev,
        [role]: {
          ...prev[role],
          [module]: {
            ...prev[role][module],
            [action]: value,
          },
        },
      };
      localStorage.setItem(STORAGE_KEY_MATRIX, JSON.stringify(updated));
      return updated;
    });
  };

  const resetPermissionsToDefault = () => {
    setMatrix(DEFAULT_ROLE_PERMISSIONS);
    localStorage.removeItem(STORAGE_KEY_MATRIX);
  };

  const hasPermission = (module: SystemModule, action: keyof ModulePermissions = 'view'): boolean => {
    const rolePermissions = matrix[activeRole];
    if (!rolePermissions) return false;
    const modPerms = rolePermissions[module];
    if (!modPerms) return false;
    return Boolean(modPerms[action]);
  };

  const canViewCompensation = (): boolean => {
    return activeRole === 'super_admin' || activeRole === 'admin_manager' || activeRole === 'accounts_staff';
  };

  const canApproveLeave = (): boolean => {
    return (
      activeRole === 'super_admin' ||
      activeRole === 'admin_manager' ||
      activeRole === 'warehouse_manager' ||
      activeRole === 'delivery_manager'
    );
  };

  const canApprovePayroll = (): boolean => {
    return activeRole === 'super_admin' || activeRole === 'admin_manager' || activeRole === 'accounts_staff';
  };

  const canOverrideAttendance = (): boolean => {
    return activeRole === 'super_admin' || activeRole === 'admin_manager' || activeRole === 'warehouse_manager';
  };

  return (
    <PermissionsContext.Provider
      value={{
        activeRole,
        matrix,
        hasPermission,
        canViewCompensation,
        canApproveLeave,
        canApprovePayroll,
        canOverrideAttendance,
        switchRole,
        updateRolePermission,
        resetPermissionsToDefault,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

export interface PermissionGateProps {
  module: SystemModule;
  action?: keyof ModulePermissions;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  module,
  action = 'view',
  fallback = null,
  children,
}) => {
  const { hasPermission } = usePermissions();
  if (!hasPermission(module, action)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};

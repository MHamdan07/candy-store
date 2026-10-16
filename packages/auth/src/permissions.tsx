import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  StaffRoleName,
  SystemModule,
  ModulePermissions,
  RoleDefinition,
} from '@candi/types';
import { useAuth } from './context';

import { DEFAULT_ROLE_PERMISSIONS, STANDARD_ROLES } from './matrix';
export { DEFAULT_ROLE_PERMISSIONS, STANDARD_ROLES };

interface PermissionsContextType {
  activeRole: StaffRoleName;
  matrix: Record<StaffRoleName, Record<SystemModule, ModulePermissions>>;
  hasPermission: (module: SystemModule, action?: keyof ModulePermissions) => boolean;
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

const STORAGE_KEY_MATRIX = 'candi_role_permissions_matrix_v1';

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { staffAccount } = useAuth();

  const [activeRole, setActiveRole] = useState<StaffRoleName>(() => {
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

  // Automatically sync role to authenticated staff account
  useEffect(() => {
    if (staffAccount?.role) {
      setActiveRole(staffAccount.role);
    }
  }, [staffAccount]);

  const switchRole = (role: StaffRoleName) => {
    setActiveRole(role);
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

  return (
    <PermissionsContext.Provider
      value={{
        activeRole,
        matrix,
        hasPermission,
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

'use client';

import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/authSlice';
import {
  Permission,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  isRoleAtLeast,
  isRoleHigherThan,
  RoleChecks,
} from '@/lib/permissions';
import { AdminRole } from '@/types';

/**
 * Hook to check user permissions based on their role
 * 
 * @example
 * const { can, canAll, canAny, role } = usePermissions();
 * 
 * // Check single permission
 * if (can(Permission.SET_PRODUCT_POINTS)) {
 *   // Show points input
 * }
 * 
 * // Check multiple permissions
 * if (canAll([Permission.CREATE_PRODUCT, Permission.SET_PRODUCT_POINTS])) {
 *   // Show full product form
 * }
 */
export function usePermissions() {
  const role = useAppSelector(selectUserRole);

  return {
    /** Current user's role */
    role,

    /** Check if user has a specific permission */
    can: (permission: Permission) => hasPermission(role, permission),

    /** Check if user has ALL of the specified permissions */
    canAll: (permissions: Permission[]) => hasAllPermissions(role, permissions),

    /** Check if user has ANY of the specified permissions */
    canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),

    /** Check if user's role is at least the specified role */
    isAtLeast: (minimumRole: AdminRole) => isRoleAtLeast(role, minimumRole),

    /** Check if user's role is higher than the specified role */
    isHigherThan: (otherRole: AdminRole) => isRoleHigherThan(role, otherRole),

    /** Role-specific checks */
    isSuperAdmin: RoleChecks.isSuperAdmin(role),
    isAdmin: RoleChecks.isAdmin(role),
    isModerator: RoleChecks.isModerator(role),
    isSponsor: RoleChecks.isSponsor(role),
    isAdminOrHigher: RoleChecks.isAdminOrHigher(role),
    isModeratorOrHigher: RoleChecks.isModeratorOrHigher(role),
    isReadOnly: RoleChecks.isReadOnly(role),

    /** Common permission checks */
    canManageUsers: RoleChecks.canManageUsers(role),
    canManageAdmins: RoleChecks.canManageAdmins(role),
    canSetProductPoints: RoleChecks.canSetProductPoints(role),
    canDeleteProducts: RoleChecks.canDeleteProducts(role),
  };
}

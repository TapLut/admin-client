import { AdminRole } from '@/types';

/**
 * Permission types that can be checked across the application
 */
export enum Permission {
  // Product permissions
  CREATE_PRODUCT = 'create_product',
  EDIT_PRODUCT = 'edit_product',
  DELETE_PRODUCT = 'delete_product',
  SET_PRODUCT_POINTS = 'set_product_points', // Manually set points (sponsors cannot)
  VIEW_ALL_PRODUCTS = 'view_all_products',

  // Order permissions
  VIEW_ORDERS = 'view_orders',
  MANAGE_ORDERS = 'manage_orders',
  VIEW_ALL_ORDERS = 'view_all_orders',

  // User permissions
  VIEW_USERS = 'view_users',
  MANAGE_USERS = 'manage_users',
  DELETE_USERS = 'delete_users',

  // Quest permissions
  VIEW_QUESTS = 'view_quests',
  CREATE_QUEST = 'create_quest',
  EDIT_QUEST = 'edit_quest',
  DELETE_QUEST = 'delete_quest',

  // Campaign permissions
  VIEW_CAMPAIGNS = 'view_campaigns',
  CREATE_CAMPAIGN = 'create_campaign',
  EDIT_CAMPAIGN = 'edit_campaign',
  DELETE_CAMPAIGN = 'delete_campaign',

  // Admin permissions
  MANAGE_ADMINS = 'manage_admins',
  VIEW_DASHBOARD = 'view_dashboard',
  VIEW_FULL_DASHBOARD = 'view_full_dashboard', // Full stats vs sponsor-only stats

  // Sponsor management permissions
  VIEW_SPONSORS = 'view_sponsors',
  INVITE_SPONSORS = 'invite_sponsors',
  MANAGE_SPONSORS = 'manage_sponsors',

  // Settings
  MANAGE_SETTINGS = 'manage_settings',
}

/**
 * Role hierarchy (higher index = more permissions)
 */
const ROLE_HIERARCHY: AdminRole[] = [
  AdminRole.SPONSOR,
  AdminRole.MODERATOR,
  AdminRole.ADMIN,
  AdminRole.SUPER_ADMIN,
];

/**
 * Permission matrix: defines which roles have which permissions
 */
const PERMISSION_MATRIX: Record<Permission, AdminRole[]> = {
  // Product permissions
  [Permission.CREATE_PRODUCT]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.SPONSOR],
  [Permission.EDIT_PRODUCT]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.SPONSOR],
  [Permission.DELETE_PRODUCT]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN],
  [Permission.SET_PRODUCT_POINTS]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN], // Sponsors cannot set points manually
  [Permission.VIEW_ALL_PRODUCTS]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR],

  // Order permissions
  [Permission.VIEW_ORDERS]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR, AdminRole.SPONSOR],
  [Permission.MANAGE_ORDERS]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN],
  [Permission.VIEW_ALL_ORDERS]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR],

  // User permissions
  [Permission.VIEW_USERS]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR],
  [Permission.MANAGE_USERS]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN],
  [Permission.DELETE_USERS]: [AdminRole.SUPER_ADMIN],

  // Quest permissions
  [Permission.VIEW_QUESTS]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR],
  [Permission.CREATE_QUEST]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN],
  [Permission.EDIT_QUEST]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN],
  [Permission.DELETE_QUEST]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN],

  // Campaign permissions
  [Permission.VIEW_CAMPAIGNS]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR, AdminRole.SPONSOR],
  [Permission.CREATE_CAMPAIGN]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN],
  [Permission.EDIT_CAMPAIGN]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN],
  [Permission.DELETE_CAMPAIGN]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN],

  // Admin permissions
  [Permission.MANAGE_ADMINS]: [AdminRole.SUPER_ADMIN],
  [Permission.VIEW_DASHBOARD]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR, AdminRole.SPONSOR],
  [Permission.VIEW_FULL_DASHBOARD]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN],

  // Sponsor management permissions
  [Permission.VIEW_SPONSORS]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN],
  [Permission.INVITE_SPONSORS]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN],
  [Permission.MANAGE_SPONSORS]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN],

  // Settings
  [Permission.MANAGE_SETTINGS]: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: AdminRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return PERMISSION_MATRIX[permission]?.includes(role) ?? false;
}

/**
 * Check if a role has ALL of the specified permissions
 */
export function hasAllPermissions(role: AdminRole | null | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has ANY of the specified permissions
 */
export function hasAnyPermission(role: AdminRole | null | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if roleA is higher than roleB in the hierarchy
 */
export function isRoleHigherThan(roleA: AdminRole | null | undefined, roleB: AdminRole | null | undefined): boolean {
  if (!roleA || !roleB) return false;
  const indexA = ROLE_HIERARCHY.indexOf(roleA);
  const indexB = ROLE_HIERARCHY.indexOf(roleB);
  return indexA > indexB;
}

/**
 * Check if roleA is at least as high as roleB in the hierarchy
 */
export function isRoleAtLeast(role: AdminRole | null | undefined, minimumRole: AdminRole): boolean {
  if (!role) return false;
  const roleIndex = ROLE_HIERARCHY.indexOf(role);
  const minimumIndex = ROLE_HIERARCHY.indexOf(minimumRole);
  return roleIndex >= minimumIndex;
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: AdminRole | null | undefined): Permission[] {
  if (!role) return [];
  return Object.entries(PERMISSION_MATRIX)
    .filter(([, roles]) => roles.includes(role))
    .map(([permission]) => permission as Permission);
}

/**
 * Role-specific helper functions
 */
export const RoleChecks = {
  isSuperAdmin: (role: AdminRole | null | undefined) => role === AdminRole.SUPER_ADMIN,
  isAdmin: (role: AdminRole | null | undefined) => role === AdminRole.ADMIN,
  isModerator: (role: AdminRole | null | undefined) => role === AdminRole.MODERATOR,
  isSponsor: (role: AdminRole | null | undefined) => role === AdminRole.SPONSOR,
  
  isAdminOrHigher: (role: AdminRole | null | undefined) => isRoleAtLeast(role, AdminRole.ADMIN),
  isModeratorOrHigher: (role: AdminRole | null | undefined) => isRoleAtLeast(role, AdminRole.MODERATOR),
  
  canManageUsers: (role: AdminRole | null | undefined) => hasPermission(role, Permission.MANAGE_USERS),
  canManageAdmins: (role: AdminRole | null | undefined) => hasPermission(role, Permission.MANAGE_ADMINS),
  canSetProductPoints: (role: AdminRole | null | undefined) => hasPermission(role, Permission.SET_PRODUCT_POINTS),
  canDeleteProducts: (role: AdminRole | null | undefined) => hasPermission(role, Permission.DELETE_PRODUCT),
  
  isReadOnly: (role: AdminRole | null | undefined) => role === AdminRole.MODERATOR,
};

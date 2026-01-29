import { AdminRole } from "../enum/adminRole";

/**
 * Base interface containing common properties for all admin types
 */
interface BaseAdmin {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  lastLoginIp?: string | null;
  createdAt: string;
}

/**
 * Super Admin - Has full access to the system
 */
export interface SuperAdmin extends BaseAdmin {
  role: AdminRole.SUPER_ADMIN;
}

/**
 * Regular Admin - standard administrative capabilities
 */
export interface RegularAdmin extends BaseAdmin {
  role: AdminRole.ADMIN;
}

/**
 * Sponsor - Restricted access, linked to a specific sponsor entity
 */
export interface SponsorAdmin extends BaseAdmin {
  role: AdminRole.SPONSOR;
  sponsorId: number;
  sponsorName: string;
  sponsorLogo?: string;
}

/**
 * Discriminated Union of all Admin types
 */
export type AdminUser = SuperAdmin | RegularAdmin | SponsorAdmin | ModeratorAdmin;

/**
 * Moderator - Content moderation capabilities
 */
export interface ModeratorAdmin extends BaseAdmin {
  role: AdminRole.MODERATOR;
}

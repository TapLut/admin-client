/**
 * Raw admin user data as received from the server API
 */
export interface ServerAdminUserResponse {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: string;
  lastLoginAt: string | null;
  lastLoginIp?: string | null;
  createdAt: string;
  isActive?: boolean;
  // Sponsor-specific fields
  sponsorId?: number;
  sponsorName?: string;
  sponsorLogo?: string;
}

export default interface ServerAuthResponse {
  accessToken: string;
  refreshToken: string;
  admin: {
    id: number;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    lastLoginAt?: string | null;
    // Sponsor specific fields
    sponsorId?: number;
    sponsorName?: string;
    sponsorLogo?: string;
  };
}
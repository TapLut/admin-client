export interface User {
  id: number;
  username: string | null;
  displayName: string | null;
  email: string | null;
  pictureUrl: string | null;
  level: number;
  points: string;
  totalSpent: string;
  referralCount: number;
  createdAt: string;
  lastActiveAt: string | null;
}

import { AdminUser } from "../dto/admin";

export default interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}
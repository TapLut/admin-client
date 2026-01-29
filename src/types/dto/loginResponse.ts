import { AdminUser } from "./admin";

export default interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}
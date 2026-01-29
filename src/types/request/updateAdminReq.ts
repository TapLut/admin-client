import { AdminRole } from "../enum/adminRole";

export default interface UpdateAdminReq {
  name?: string;
  role?: AdminRole;
  isActive?: boolean;
  sponsorId?: number;
}
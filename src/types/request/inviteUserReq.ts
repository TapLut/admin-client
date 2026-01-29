import { AdminRole } from "../enum/adminRole";

export default interface InviteUserReq {
  email: string;
  name: string;
  role: AdminRole;
  sponsorId?: number;
}
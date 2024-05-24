import type { USER_ROLE } from "@prisma/client";
import type { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: USER_ROLE;
    active: boolean;
    phone: string | null;  // Change this to allow null
  }
  interface Session {
    user: User;  // Make user non-optional
  }
}
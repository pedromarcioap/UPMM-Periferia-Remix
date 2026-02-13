import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string;
      image?: string | null;
      username?: string | null;
      vibePoints?: number;
      responsaPoints?: number;
      level?: number;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
    username?: string | null;
    vibePoints?: number;
    responsaPoints?: number;
    level?: number;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string | null;
    email: string;
    picture?: string | null;
    username?: string | null;
    vibePoints?: number;
    responsaPoints?: number;
    level?: number;
    role?: string;
  }
}

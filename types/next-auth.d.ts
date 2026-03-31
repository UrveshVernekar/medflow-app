import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "patient" | "doctor" | "admin";
      email: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "patient" | "doctor" | "admin";
    email: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

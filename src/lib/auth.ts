import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";
import { randomBytes, randomUUID } from "crypto";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    generateSessionToken: () => {
      return randomUUID?.() ?? randomBytes(32).toString("hex");
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "seu@email.com" },
        name: { label: "Nome", type: "text", placeholder: "Seu nome" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        let user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user && credentials.name) {
          user = await db.user.create({
            data: {
              email: credentials.email,
              name: credentials.name,
              username: credentials.email.split("@")[0] + "_" + Date.now().toString(36),
            },
          });
        }

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email!,
        },
      });

      if (!dbUser) {
        if (user) {
          token.id = user.id;
        }
        return token;
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.avatar,
      };
    },
  },
  events: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser && !existingUser.googleId && account.providerAccountId) {
          await db.user.update({
            where: { id: existingUser.id },
            data: { googleId: account.providerAccountId },
          });
        }
      }
    },
  },
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      username?: string | null;
      vibePoints?: number;
      responsaPoints?: number;
      level?: number;
      role?: string;
    };
  }
  interface User {
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
    picture: string | null;
  }
}

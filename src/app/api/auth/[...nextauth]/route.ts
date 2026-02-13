import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // User not found
        if (!user) {
          return null;
        }

        // If user has password, verify it
        if (user.password && credentials.password) {
          const isValid = await compare(credentials.password, user.password);
          if (!isValid) {
            return null;
          }
        }

        // Return user object on success
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          image: user.avatar,
          vibePoints: user.vibePoints,
          responsaPoints: user.responsaPoints,
          level: user.level,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.vibePoints = (user as any).vibePoints;
        token.responsaPoints = (user as any).responsaPoints;
        token.level = (user as any).level;
        token.role = (user as any).role;
      }
      
      // Google sign in - fetch user from DB
      if (account?.provider === "google") {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.username = dbUser.username;
          token.vibePoints = dbUser.vibePoints;
          token.responsaPoints = dbUser.responsaPoints;
          token.level = dbUser.level;
          token.role = dbUser.role;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.vibePoints = token.vibePoints as number;
        session.user.responsaPoints = token.responsaPoints as number;
        session.user.level = token.level as number;
        session.user.role = token.role as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      // For Google auth, create user if doesn't exist
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Create new user from Google account
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              avatar: user.image,
              googleId: account.providerAccountId,
              username: user.email.split("@")[0] + "_" + Date.now().toString(36),
            },
          });
        } else if (!existingUser.googleId) {
          // Link Google account to existing user
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { googleId: account.providerAccountId },
          });
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "upmm-secret-key-2024",
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

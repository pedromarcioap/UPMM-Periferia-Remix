import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { compare, hashSync } from "bcrypt";

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
        name: { label: "Name", type: "text" },
        isRegister: { label: "Is Register", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email é obrigatório");
        }

        const isRegister = credentials.isRegister === "true";

        if (isRegister) {
          if (!credentials.name) {
            throw new Error("Nome é obrigatório para cadastro");
          }

          const existingUser = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (existingUser) {
            throw new Error("Este email já está cadastrado");
          }

          const hashedPassword = credentials.password 
            ? hashSync(credentials.password, 10)
            : null;

          const user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.name,
              password: hashedPassword,
              username: credentials.email.split("@")[0] + "_" + Date.now().toString(36),
            },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
            vibePoints: user.vibePoints,
            responsaPoints: user.responsaPoints,
            level: user.level,
            role: user.role,
          };
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Email ou senha inválidos");
        }

        if (credentials.password) {
          const isValid = await compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Email ou senha inválidos");
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
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
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.vibePoints = user.vibePoints;
        token.responsaPoints = user.responsaPoints;
        token.level = user.level;
        token.role = user.role;
      }
      
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
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "upmm-secret-key-2024",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

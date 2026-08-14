import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/utils/db";
import { nanoid } from "nanoid";

// Safety net: NextAuth reads `process.env.NEXTAUTH_URL` at request time (and
// bakes it into the client bundle at build). If the value is missing or still a
// placeholder from the Vercel dashboard, derive the real base URL from
// `VERCEL_URL` (set automatically by Vercel) so auth redirects never leave the
// deployed site.
const rawAuthUrl = process.env.NEXTAUTH_URL || "";
let authHost = "";
try {
  authHost = new URL(rawAuthUrl).hostname;
} catch {}
if (!rawAuthUrl || authHost === "example.com" || authHost === "example.vercel.app") {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL || "localhost:3000"}`;
}

export const authOptions: any = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        try {
          const user = await prisma.user.findFirst({
            where: {
              email: credentials.email,
            },
          });
          if (user) {
            const isPasswordCorrect = await bcrypt.compare(
              credentials.password,
              user.password!
            );
            if (isPasswordCorrect) {
              return {
                id: user.id,
                name: user.name || null,
                email: user.email,
                role: user.role || "user",
                image: user.image || null,
              };
            }
          }
        } catch (err: any) {
          throw new Error(err);
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "credentials") {
        return true;
      }
      if (account?.provider === "github" || account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findFirst({
            where: {
              email: user.email!,
            },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                id: nanoid(),
                email: user.email!,
                role: "user",
                password: null,
              },
            });
          }
          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.image = user.image || null;
        token.iat = Math.floor(Date.now() / 1000);
      }

      // Persist profile updates (e.g. avatar upload) into the JWT so they
      // survive page reloads — NextAuth re-encodes the token after this
      // callback, so the updated image lands in the session cookie.
      if (trigger === "update" && session && "image" in session) {
        token.image = session.image || null;
      }

      const now = Math.floor(Date.now() / 1000);
      const tokenAge = now - (token.iat as number);
      const maxAge = 15 * 60;
      
      if (tokenAge > maxAge) {
        return {};
      }
      
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.image = (token.image as string) || null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 15 * 60,
    updateAge: 5 * 60,
  },
  jwt: {
    maxAge: 15 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Let NextAuth trust the request host (serverless/Vercel) so auth URLs stay
  // on whatever domain the site is actually served from.
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
};

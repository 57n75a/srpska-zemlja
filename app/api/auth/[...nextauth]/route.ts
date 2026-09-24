import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import AppleProvider from 'next-auth/providers/apple';
import { prisma } from '@/lib/prisma';

// Each provider requires real credentials from that platform's developer
// console — these are placeholders read from environment variables.
// See README.md "Setting up SSO" for where to register each one.
export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || '',
      clientSecret: process.env.APPLE_CLIENT_SECRET || '', // generated JWT, see README
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // On every successful sign-in, make sure a Member row exists for this
    // email — this is what links a real login to the reservation data
    // already modeled in prisma/schema.prisma.
    async signIn({ user }) {
      if (!user.email) return false;
      await prisma.member.upsert({
        where: { email: user.email },
        update: { displayName: user.name || undefined },
        create: { email: user.email, displayName: user.name || undefined },
      });
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const member = await prisma.member.findUnique({ where: { email: session.user.email } });
        if (member) {
          (session.user as any).id = member.id;
          (session.user as any).isVojvoda = member.isVojvoda;
        }
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

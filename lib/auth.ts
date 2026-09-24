import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import AppleProvider from 'next-auth/providers/apple';
import { prisma } from '@/lib/prisma';

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
      clientSecret: process.env.APPLE_CLIENT_SECRET || '',
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
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

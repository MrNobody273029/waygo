import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.profile.findUnique({
          where: { email: credentials.email },
        });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        if (!user.emailVerified) throw new Error('EMAIL_NOT_VERIFIED');
        return {
          id: user.id,
          email: user.email ?? '',
          name: user.fullName,
          role: user.role as 'USER' | 'HOST' | 'ADMIN',
          isVerified: user.isVerified,
          hostVerified: user.hostVerified,
          verificationStatus: user.verificationStatus,
          hostVerificationStatus: user.hostVerificationStatus,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.isVerified = (user as any).isVerified;
        token.hostVerified = (user as any).hostVerified;
        token.verificationStatus = (user as any).verificationStatus;
        token.hostVerificationStatus = (user as any).hostVerificationStatus;
      }
      if (trigger === 'update') {
        const fresh = await prisma.profile.findUnique({ where: { id: token.id as string } });
        if (fresh) {
          token.role = fresh.role;
          token.isVerified = fresh.isVerified;
          token.hostVerified = fresh.hostVerified;
          token.verificationStatus = fresh.verificationStatus;
          token.hostVerificationStatus = fresh.hostVerificationStatus;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).isVerified = token.isVerified;
        (session.user as any).hostVerified = token.hostVerified;
        (session.user as any).verificationStatus = token.verificationStatus;
        (session.user as any).hostVerificationStatus = token.hostVerificationStatus;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
};

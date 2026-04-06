import NextAuth from 'next-auth';
import Kakao from 'next-auth/providers/kakao';
import Naver from 'next-auth/providers/naver';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authConfig } from '@/lib/auth.config';
import { loginSchema } from '@/lib/validations/auth';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  allowDangerousEmailAccountLinking: true,
  providers: [
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
    }),
    Naver({
      clientId: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Redis 로그인 잠금 체크
        const { redis } = await import('@/lib/redis');
        const attemptsKey = `login_attempts:${email}`;
        const attempts = await redis.get(attemptsKey);

        if (attempts && parseInt(attempts) >= 5) {
          throw new Error('ACCOUNT_LOCKED');
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
          await redis.incr(attemptsKey);
          await redis.expire(attemptsKey, 1800);
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          await redis.incr(attemptsKey);
          await redis.expire(attemptsKey, 1800);
          return null;
        }

        if (!user.emailVerified) {
          throw new Error('EMAIL_NOT_VERIFIED');
        }

        await redis.del(attemptsKey);

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
        };
      },
    }),
  ],
  events: {
    async signIn({ user }) {
      if (user.id) {
        const dbUser = await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
        user.onboardingCompleted = dbUser.onboardingCompleted;
      }
    },
  },
});

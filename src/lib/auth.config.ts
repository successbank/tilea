import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnAuth = nextUrl.pathname.startsWith('/auth');
      const isOnOnboarding = nextUrl.pathname === '/auth/onboarding';

      if (isOnDashboard || isOnAdmin) {
        if (!isLoggedIn) return false;

        if (!auth.user.onboardingCompleted && !isOnOnboarding) {
          return Response.redirect(new URL('/auth/onboarding', nextUrl));
        }

        return true;
      }

      if (isOnAuth && isLoggedIn) {
        if (isOnOnboarding) {
          if (auth.user.onboardingCompleted) {
            return Response.redirect(new URL('/dashboard', nextUrl));
          }
          return true;
        }
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.onboardingCompleted = user.onboardingCompleted ?? false;
      }
      if (trigger === 'update' && session?.onboardingCompleted !== undefined) {
        token.onboardingCompleted = session.onboardingCompleted;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.onboardingCompleted = token.onboardingCompleted;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

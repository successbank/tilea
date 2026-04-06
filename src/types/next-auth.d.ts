import { UserRole } from '@prisma/client';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role: UserRole;
    onboardingCompleted: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      onboardingCompleted: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    onboardingCompleted: boolean;
  }
}

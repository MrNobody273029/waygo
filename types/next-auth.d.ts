import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'USER' | 'HOST' | 'ADMIN';
    } & DefaultSession['user'];
  }
  interface User {
    role: 'USER' | 'HOST' | 'ADMIN';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'USER' | 'HOST' | 'ADMIN';
  }
}

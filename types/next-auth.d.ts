// types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    organizationId?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      organizationId?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    organizationId?: string;
  }
}


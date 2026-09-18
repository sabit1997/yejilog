import "next-auth";

declare module "next-auth" {
  interface Session {
    /** GitHub OAuth access token. Server-only usage. Never pass to client. */
    accessToken?: string;
    user: {
      login?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    login?: string;
    accessToken?: string;
  }
}

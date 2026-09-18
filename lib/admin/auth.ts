import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const isProd = process.env.NODE_ENV === "production";

const clientId = isProd
  ? process.env.GITHUB_OAUTH_CLIENT_ID
  : process.env.GITHUB_OAUTH_CLIENT_ID_DEV ?? process.env.GITHUB_OAUTH_CLIENT_ID;

const clientSecret = isProd
  ? process.env.GITHUB_OAUTH_CLIENT_SECRET
  : process.env.GITHUB_OAUTH_CLIENT_SECRET_DEV ??
    process.env.GITHUB_OAUTH_CLIENT_SECRET;

export const ADMIN_LOGIN = process.env.ADMIN_GITHUB_USERNAME;

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId,
      clientSecret,
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async signIn({ profile }) {
      if (!ADMIN_LOGIN) return false;
      const login = (profile as { login?: string } | undefined)?.login;
      return login === ADMIN_LOGIN;
    },
    async jwt({ token, profile }) {
      const login = (profile as { login?: string } | undefined)?.login;
      if (login) token.login = login;
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.login === "string") {
        session.user.login = token.login;
      }
      return session;
    },
  },
});

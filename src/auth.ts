import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { db } from "./database/drizzle";
import { users } from "./database/schema";
import { eq } from "drizzle-orm";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

export const { 
    handlers, 
    auth, 
    signIn, 
    signOut 
} = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  pages: {
    signIn: "/sign-in",
  }
});

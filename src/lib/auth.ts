import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db"; // your drizzle instance
import { schema } from "@/lib/db/schema";
import { nextCookies } from "better-auth/next-js";
import { v4 as uuidv4 } from 'uuid';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: schema
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    resetPasswordTokenExpiresIn: 60 * 60, // 1 hour
  },
  advanced: {
    database: {
      generateId: () => uuidv4()
    },
    defaultCookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 24 * 7 // 7 days in seconds
    }
  },
  session: {
    updateAge: 1000 * 60 * 24, // 24 hours
    expiresIn: 1000 * 60 * 24 * 7, // 7 days
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "readonly",
        input: false,
        returned: true, // Make sure role is returned in session
      }
    },
    changeEmail: {
      enabled: true,
    },
    changePassword: {
      enabled: true,
    }
  },
  plugins: [
    nextCookies(),
  ]
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

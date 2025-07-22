import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
})

export type Session = typeof authClient.$Infer.Session
export type User = typeof authClient.$Infer.Session.user

export const {
  signUp,
  signIn,
  signOut,
  useSession,
  forgetPassword,
  resetPassword
} = authClient

import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { supabase } from "./supabase"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        try {
          // Check if user already exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('google_api_access')
            .eq('id', user.id)
            .single()

          if (existingUser) {
            // User exists - only update non-sensitive fields, preserve google_api_access
            const { error } = await supabase
              .from('users')
              .update({
                email: user.email,
                name: user.name,
                image: user.image,
              })
              .eq('id', user.id)

            if (error) {
              console.error('Failed to update existing user:', error)
            }
          } else {
            // New user - insert with default google_api_access: false
            const { error } = await supabase
              .from('users')
              .insert({
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                google_api_access: false, // Only set false for new users
              })

            if (error) {
              console.error('Failed to insert new user:', error)
            }
          }
        } catch (error) {
          console.error('Error handling user sign in:', error)
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
      },
    }),
  },
  debug: process.env.NODE_ENV === "development",
}

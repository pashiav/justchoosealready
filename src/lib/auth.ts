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
    async signIn({ user, account, profile }) {
      if (user.email) {
        try {
          // Upsert user to Supabase database
          const { error } = await supabase
            .from('users')
            .upsert({
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            }, {
              onConflict: 'id'
            })

          if (error) {
            console.error('Failed to upsert user to database:', error)
          }
        } catch (error) {
          console.error('Error upserting user:', error)
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
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

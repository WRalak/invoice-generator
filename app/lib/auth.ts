import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcryptjs from 'bcryptjs'

// Simple in-memory user store for development
const users: any[] = []

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          // Find user in memory store
          let user = users.find(u => u.email === credentials.email)

          // Create user if not exists (auto-registration)
          if (!user) {
            const hashedPassword = await bcryptjs.hash(credentials.password, 12)
            user = {
              id: Date.now().toString(),
              email: credentials.email,
              name: credentials.email.split('@')[0],
              password: hashedPassword,
            }
            users.push(user)
          }

          // Verify password
          const isPasswordValid = await bcryptjs.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.sub!
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
    async jwt({ user, token }) {
      if (user) {
        token.sub = user.id.toString()
        token.email = user.email
        token.name = user.name
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// src/libs/auth.ts
// Third-party Imports
import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

// ** Usuarios de ejemplo con el tipo correcto
const users = [
  {
    id: '1', // ID como string (requisito de NextAuth)
    name: 'John Doe',
    email: 'admin@materio.com',
    password: 'admin',
    role: 'admin',
    image: '/images/avatars/1.png'
  }
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialProvider({
      name: 'Credentials',
      type: 'credentials',
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string }

        try {
          // Buscar usuario
          const user = users.find(user => user.email === email && user.password === password)

          if (!user) {
            throw new Error(JSON.stringify({ message: ['Email or Password is invalid'] }))
          }

          // Devolvemos el usuario sin la contraseña y compatible con User de NextAuth
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image
          }
        } catch (e: any) {
          throw new Error(e.message)
        }
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // ** 30 days
  },

  pages: {
    signIn: '/login'
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Almacenamos el nombre y la imagen desde el usuario
        token.name = user.name
        token.image = user.image

        // Guardamos el rol como una propiedad personalizada
        // @ts-ignore - role no es parte del tipo User estándar
        if (typeof user === 'object' && 'role' in user) {
          token.role = user.role as string
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string
        session.user.image = token.image as string

        // Añadimos el rol como una propiedad personalizada
        // @ts-ignore - role no es parte del tipo Session.user estándar
        session.user.role = token.role
      }

      return session
    }
  }
}

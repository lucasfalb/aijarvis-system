import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies() // Resolver a Promise

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value ?? null
        },
        set(name: string, value: string, options?: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            console.error('Error setting cookie:', error)
            throw new Error('Failed to set authentication cookie')
          }
        },
        remove(name: string, options?: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: -1 }) // Remover cookie
          } catch (error) {
            console.error('Error removing cookie:', error)
            throw new Error('Failed to remove authentication cookie')
          }
        },
      },
    }
  )
}

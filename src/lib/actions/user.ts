import { createClient } from '@/lib/supabase/server'

export async function getUserInfo() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.user_metadata?.full_name,
    name: user.user_metadata?.name,
    avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    provider: user.app_metadata?.provider,
    providers: user.app_metadata?.providers || [],
    emailConfirmed: !!user.email_confirmed_at,
    phoneVerified: user.user_metadata?.phone_verified,
    createdAt: user.created_at,
    lastSignIn: user.last_sign_in_at,
  }
}

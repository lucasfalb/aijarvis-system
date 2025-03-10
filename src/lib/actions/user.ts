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
    avatar: user.user_metadata?.avatar_url,
    provider: user.app_metadata?.provider,
  }
}
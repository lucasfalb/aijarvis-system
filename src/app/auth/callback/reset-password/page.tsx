import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ResetPasswordCallback() {
  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(window.location.search)
  
  if (!error) {
    return redirect('/auth/update-password')
  }

  return redirect('/auth/sign-in')
}
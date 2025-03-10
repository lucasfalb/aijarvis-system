import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SignUpCallback() {
  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(window.location.search)
  
  if (!error) {
    return redirect('/')
  }

  return redirect('/auth/sign-in')
}
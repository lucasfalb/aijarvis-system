import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ResetPasswordCallback({ searchParams }: Props) {
  const params = await searchParams
  const code = typeof params.code === 'string' ? params.code : null

  if (!code) {
    return redirect('/auth/sign-in?error=Invalid%20reset%20token')
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return redirect('/auth/sign-in?error=Invalid%20or%20expired%20reset%20token')
  }

  return redirect(`/auth/update-password?token=${data.session.refresh_token}`)
}

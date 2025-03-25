import { UpdatePasswordForm } from '@/components/auth/update-password-form'
import { Logo } from '@/components/logo'
import { generateMetadata } from '@/lib/utils'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = generateMetadata('Update Password')

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function UpdatePasswordPage({ searchParams }: Props) {
  const params = await searchParams
  const refresh_token = params.token

  if (!refresh_token || typeof refresh_token !== 'string') {
    return redirect('/auth/sign-in?error=Invalid%20reset%20token')
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.refreshSession({ refresh_token })

  if (error || !data.session) {
    return redirect('/auth/sign-in?error=Invalid%20or%20expired%20reset%20token')
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <Logo className="w-42 h-auto" />
        </a>
        <UpdatePasswordForm token={refresh_token} className="w-full max-w-[400px]" />
      </div>
    </div>
  )
}

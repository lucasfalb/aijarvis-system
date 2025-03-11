'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignUpCallback() {
  const router = useRouter()

  useEffect(() => {
    async function handleAuth() {
      const supabase = createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.search)

      if (!error) {
        router.push('/')
      } else {
        router.push('/auth/sign-in')
      }
    }

    handleAuth()
  }, [])

  return null
}

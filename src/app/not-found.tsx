'use client'

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function NotFound() {
  const [redirectPath, setRedirectPath] = useState('/')

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setRedirectPath('/app')
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="mx-auto container flex h-screen w-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
        <p className="text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href={redirectPath}>
          <Button>Return Home</Button>
        </Link>
      </div>
    </div>
  )
}
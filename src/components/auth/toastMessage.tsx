"use client"

import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useEffect, useRef } from "react"

export function ToastMessage() {
  const searchParams = useSearchParams()
  const toastShown = useRef(false)
  
  useEffect(() => {
    if (toastShown.current) return
    
    const message = searchParams.get("message")
    const error = searchParams.get("error")

    if (message) {
      toast.success(message)
      toastShown.current = true
    }

    if (error) {
      toast.error(error)
      toastShown.current = true
    }
  }, [searchParams])

  return null
}
"use client"

import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useEffect, useRef, Suspense } from "react"

function ToastMessageContent() {
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

export function ToastMessage() {
  return (
    <Suspense fallback={null}>
      <ToastMessageContent />
    </Suspense>
  )
}
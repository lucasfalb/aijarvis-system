'use client'

import { resetPassword } from "@/lib/actions/auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export function ResetPasswordForm({ className, ...props }: React.ComponentProps<"div">) {
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)

  async function onSubmit(formData: FormData) {
    setError("")
    setSuccess(false)

    const result = await resetPassword(formData)
    
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset your password</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={onSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@aijarvis.co"
                  required
                />
              </div>
              {error && (
                <p className="text-sm p-[0.625rem] rounded-sm text-center bg-destructive text-white shadow-xs">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm bg-primary text-primary-foreground shadow-xs rounded-sm p-[0.625rem] text-center">
                  Check your email for password reset instructions
                </p>
              )}
              <Button type="submit" className="w-full">
                Send Reset Link
              </Button>
              <div className="text-center text-sm">
                Remember your password?{" "}
                <a href="/auth/sign-in" className="text-primary underline underline-offset-4">
                  Sign in
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
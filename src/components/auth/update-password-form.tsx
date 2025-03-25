'use client'

import { updatePassword } from "@/lib/actions/auth"
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
import { useRouter } from "next/navigation"

interface UpdatePasswordFormProps extends React.ComponentProps<"div"> {
  token: string
}

export function UpdatePasswordForm({ className, token, ...props }: UpdatePasswordFormProps) {
  const [error, setError] = useState<string>("")
  const router = useRouter()
  console.log(token)
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    const formData = new FormData(event.currentTarget)
    const result = await updatePassword(formData, token)

    if (result.error) {
      setError(result.error)
    } else {
      router.push('/auth/sign-in?message=Password updated successfully')
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Update your password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                />
              </div>
              {error && (
                <p className="text-sm p-[0.625rem] rounded-sm text-center bg-destructive text-white shadow-xs">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full">
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

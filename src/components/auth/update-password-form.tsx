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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { passwordUpdateSchema } from "@/lib/validations/auth"
import type * as z from "zod"
import { useRouter } from "next/navigation"

type FormData = z.infer<typeof passwordUpdateSchema>

function getValidationStatus(condition: boolean) {
  return condition ? "text-green-500" : "text-white dark:text-black"
}

export function UpdatePasswordForm({ token, className, ...props }: { token: string } & React.ComponentProps<"div">) {
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(passwordUpdateSchema),
  })

  const password = watch("password", "")
  const validations = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const onSubmit = handleSubmit(async (data) => {
    setError("")
    setSuccess(false)
    
    try {
      const formData = new FormData()
      formData.append("password", data.password)
      formData.append("token", token)
      
      const result = await updatePassword(formData, token)
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/sign-in?message=Password+updated+successfully')
        }, 2000)
      }
    } catch (err) {
      setError("Failed to update password. Please try again later.")
      console.error("Password update error:", err)
    }
  })

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Update Your Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="password">New Password</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input {...register("password")} id="password" type="password" placeholder="********" />
                    </TooltipTrigger>
                    <TooltipContent side="right" align="start" className="w-fit p-4 hidden md:block">
                      <div className="space-y-3">
                        <p className="font-semibold">Password requirements:</p>
                        <ul className="space-y-2">
                          <li className={cn("flex items-center gap-2 transition-colors", getValidationStatus(validations.minLength))}>
                            {validations.minLength ? "✓" : "○"} At least 8 characters
                          </li>
                          <li className={cn("flex items-center gap-2 transition-colors", getValidationStatus(validations.hasUpperCase))}>
                            {validations.hasUpperCase ? "✓" : "○"} One uppercase letter
                          </li>
                          <li className={cn("flex items-center gap-2 transition-colors", getValidationStatus(validations.hasSpecialChar))}>
                            {validations.hasSpecialChar ? "✓" : "○"} One special character
                          </li>
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <div className="mt-2 p-3 space-y-2 text-xs bg-foreground rounded-md md:hidden">
                    <p className="font-semibold text-black">Password must contain:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li className={getValidationStatus(validations.minLength)}>
                        {validations.minLength ? "✓" : "○"} At least 8 characters
                      </li>
                      <li className={getValidationStatus(validations.hasUpperCase)}>
                        {validations.hasUpperCase ? "✓" : "○"} One uppercase letter
                      </li>
                      <li className={getValidationStatus(validations.hasSpecialChar)}>
                        {validations.hasSpecialChar ? "✓" : "○"} One special character
                      </li>
                    </ul>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input {...register("confirmPassword")} id="confirmPassword" type="password" placeholder="********" />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>
                {error && <p className="text-sm p-[0.625rem] rounded-sm text-center bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40">{error}</p>}
                {success && (
                  <p className="text-sm bg-primary text-primary-foreground shadow-xs rounded-sm p-[0.625rem] text-center">
                    Password updated successfully! Redirecting...
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
    </TooltipProvider>
  )
}

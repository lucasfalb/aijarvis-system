'use client'

import { signUp } from "@/lib/actions/auth"
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
import { authSchema } from "@/lib/validations/auth"
import type * as z from "zod"
import { signInWithGoogle } from "@/lib/actions/auth"

type FormData = z.infer<typeof authSchema>
function getValidationStatus(condition: boolean) {
  return condition ? "text-green-500" : "text-muted-foreground"
}
export function SignUpForm({ className, ...props }: React.ComponentProps<"div">) {
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)
  const isSignUp = true
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(authSchema),
  })

  const password = watch("password", "")
  const validations = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const onSubmit = handleSubmit(async (data) => {
    setError("") // Reset error state
    setSuccess(false) // Reset success state

    const formData = new FormData()
    formData.append("email", data.email)
    formData.append("password", data.password)

    const result = await signUp(formData)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      reset() // Reset form fields
    }
  })

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle()
    if (typeof result === 'string') {
      // If result is a URL string, redirect to it
      window.location.href = result
    } else if (result.error) {
      setError(result.error)
    }
  }

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Create an account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit}>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
                    </svg>
                    Sign up with Google
                  </Button>
                </div>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-background text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input {...register("email")} id="email" type="email" placeholder="email@aijarvis.co" />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="password">Password</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input {...register("password")} id="password" type="password" placeholder="********" />
                      </TooltipTrigger>
                      <TooltipContent side="right" align="start" className="w-80 p-4 hidden md:block">
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
                    <div className="mt-2 p-3 space-y-2 text-xs bg-secondary rounded-md md:hidden">
                      <p className="font-semibold">Password must contain:</p>
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
                      Check your email to confirm your account
                    </p>
                  )}
                  <Button type="submit" className="w-full">
                    Sign Up
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <a href="/auth/sign-in" className="underline underline-offset-4">
                    Sign in
                  </a>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          By clicking {isSignUp ? "Sign Up" : "Sign In"}, you agree to our{" "}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </TooltipProvider>
  )
}
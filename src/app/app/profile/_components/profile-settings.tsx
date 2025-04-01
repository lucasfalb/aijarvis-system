"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { updateUserProfile, changeUserPassword } from "@/lib/actions/profile"
import { Separator } from "@/components/ui/separator"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Define a proper type for the user object
interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  fullName?: string;
  avatar?: string;
  provider?: string;
  providers?: string[];
  createdAt?: string;
  lastSignIn?: string;
}

const profileFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).max(50, {
    message: "Name cannot be longer than 50 characters."
  }).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  const hasPasswordData = !!data.currentPassword || !!data.newPassword || !!data.confirmPassword;
  if (hasPasswordData) {
    if (!data.currentPassword) return false;
    if (!data.newPassword || data.newPassword.length < 8) return false;
    if (!data.confirmPassword) return false;
    if (data.newPassword !== data.confirmPassword) return false;
  }
  return true;
}, {
  message: "Please fill all password fields correctly",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.newPassword) {
    const hasUppercase = /[A-Z]/.test(data.newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(data.newPassword);
    return hasUppercase && hasSpecial;
  }
  return true;
}, {
  message: "Password must contain at least one uppercase letter and one special character",
  path: ["newPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfileSettings({ user }: { user: UserProfile }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const isEmailUser = user?.provider === 'email' || !user?.provider

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)
    try {
      let changesMade = false;

      if (data.fullName !== user?.fullName) {
        const profileResult = await updateUserProfile({ fullName: data.fullName });
        if (profileResult.error) {
          toast.error(`Profile error: ${profileResult.error}`);
          return;
        }
        changesMade = true;
      }

      if (data.currentPassword && data.newPassword && data.confirmPassword) {
        if (isEmailUser) {
          const passwordResult = await changeUserPassword({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
            confirmPassword: data.confirmPassword
          });

          if (passwordResult.error) {
            toast.error(`Password error: ${passwordResult.error}`);
            return;
          }
          changesMade = true;
        }
      }

      if (changesMade) {
        toast.success("Settings updated successfully");
        // Reset only password fieldsÆ
        form.setValue("currentPassword", "");
        form.setValue("newPassword", "");
        form.setValue("confirmPassword", "");
        router.refresh();
      } else {
        toast.info("No changes were made");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <h3 className="text-lg font-medium">General Information</h3>
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormDescription>
                  This is the name that will be displayed on your profile
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className="space-y-6">
          <h3 className="text-lg font-medium">Security</h3>

          {!isEmailUser ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Password change is not available for accounts using {user?.provider} authentication.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormDescription>
                      Password must be at least 8 characters with one uppercase letter and one special character.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <Button type="submit" disabled={isLoading} className="mt-6">
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  )
}

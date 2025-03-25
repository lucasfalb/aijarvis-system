import { generateMetadata } from "@/lib/utils"

export const metadata = generateMetadata("Sign Up")

import { SignUpForm } from "@/components/auth/sign-up-form"
import { Logo } from "@/components/logo"
import { ToastMessage } from "@/components/auth/toastMessage"

export default function SignUpPage() {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="/" className="flex items-center gap-2 self-center font-medium">
                    <Logo className="w-42 h-auto" />
                </a>
                <SignUpForm />
                <ToastMessage />
            </div>
        </div>
    )
}
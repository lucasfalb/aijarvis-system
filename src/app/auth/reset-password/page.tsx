import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Logo } from "@/components/logo"

export default function SignInPage() {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <Logo className="w-42 h-auto" />
                </a>
                <ResetPasswordForm className="w-full max-w-[400px]" />
            </div>
        </div>
    )
}
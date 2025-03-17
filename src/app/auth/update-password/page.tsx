import { UpdatePasswordForm } from "@/components/auth/update-password-form"
import { Logo } from "@/components/logo"
import { generateMetadata } from "@/lib/utils"
import { redirect } from 'next/navigation'

export const metadata = generateMetadata("Update Password")

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function UpdatePasswordPage({ searchParams }: Props) {
    const params = await searchParams
    const token = params.token

    if (!token || typeof token !== 'string') {
        return redirect('/auth/sign-in?error=Invalid%20reset%20token')
    }

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <Logo className="w-42 h-auto" />
                </a>
                <UpdatePasswordForm token={token} className="w-full max-w-[400px]" />
            </div>
        </div>
    )
}
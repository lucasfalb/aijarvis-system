import { getUserInfo } from "@/lib/actions/user"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generateMetadata } from "@/lib/utils"

export const metadata = generateMetadata("Dashboard")

export default async function AppPage() {
    const user = await getUserInfo()
    return (
        <Card>
            <CardHeader>
                <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <h3 className="font-medium">{user?.fullName || 'No name set'}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">Signed in with {user?.provider || 'email'}</p>
                </div>
            </CardContent>
        </Card>
    )
}
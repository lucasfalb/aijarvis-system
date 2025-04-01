import { getUserInfo } from "@/lib/actions/user"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generateMetadata } from "@/lib/utils"
import ProfileSettings from "./_components/profile-settings"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

export const metadata = generateMetadata("Profile")

export default async function ProfilePage() {
  const user = await getUserInfo()

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row  sm:items-center gap-4">
            <Avatar className="h-24 w-24 border-4 border-background shadow-md">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-xl">{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="space-y-2 flex-1">
              <h3 className="text-2xl font-medium">{user?.fullName || user?.name || 'No name set'}</h3>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {user?.providers?.map((provider: string) => (
                  <Badge key={provider} className="capitalize">
                    {provider}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Account created:</p>
              <p>{user?.createdAt ? format(new Date(user.createdAt), 'PPP') : 'Unknown'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Last sign in:</p>
              <p>{user?.lastSignIn ? format(new Date(user.lastSignIn), 'PPP p') : 'Unknown'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileSettings user={user} />
        </CardContent>
      </Card>
    </>
  )
}

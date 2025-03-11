import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getMonitor } from "@/lib/actions/monitor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface MonitorPageProps {
  params: { 
    id: string;
    monitorId: string;
  }
}

export async function generateMetadata({ params }: MonitorPageProps): Promise<Metadata> {
  const result = await getMonitor(params.monitorId);
  
  if (!result.success) {
    return { title: 'Monitor Not Found' }
  }

  return {
    title: `${result.monitor.account_name} - Monitor`,
    description: `Monitor details for ${result.monitor.account_name}`,
  }
}

export default async function MonitorPage({ params }: MonitorPageProps) {
  const result = await getMonitor(params.monitorId);

  if (!result.success) {
    notFound();
  }

  const { monitor } = result;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/app/projects/${params.id}/monitors`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{monitor.account_name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monitor Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <div className="text-sm font-medium">Platform</div>
            <div className="text-sm text-muted-foreground">{monitor.platform}</div>
          </div>
          
          <div className="grid gap-2">
            <div className="text-sm font-medium">Webhook URL</div>
            <div className="text-sm text-muted-foreground">{monitor.webhook}</div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Created At</div>
            <div className="text-sm text-muted-foreground">
              {new Date(monitor.created_at).toLocaleString()}
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Status</div>
            <div className="text-sm text-muted-foreground">
              {monitor.status || 'Active'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
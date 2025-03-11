import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMonitor } from "@/lib/actions/monitor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CommentsTable from "./_components/comments-table";

interface MonitorPageProps {
  params: Promise<{ id: string; monitorId: string }>;
}

export async function generateMetadata({ params }: MonitorPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { monitorId } = resolvedParams;

  const result = await getMonitor(monitorId);

  if (!result.success || !result.monitor) {
    return { title: "Monitor Not Found" };
  }

  return {
    title: `${result.monitor.account_name} - Monitor`,
    description: `Monitor details for ${result.monitor.account_name}`,
  };
}

export default async function MonitorPage({ params }: MonitorPageProps) {
  const resolvedParams = await params; 
  const { id, monitorId } = resolvedParams;

  const result = await getMonitor(monitorId);

  if (!result.success || !result.monitor) {
    notFound();
  }

  const { monitor } = result;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/app/projects/${id}/monitors`}>
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
            <div className="text-sm text-muted-foreground">{monitor.webhook_receive}</div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Verification Token</div>
            <div className="text-sm text-muted-foreground">{monitor.webhook_token}</div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Created At</div>
            <div className="text-sm text-muted-foreground">
              {new Date(monitor.created_at).toLocaleString()}
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Last Updated</div>
            <div className="text-sm text-muted-foreground">
              {new Date(monitor.updated_at || monitor.created_at).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <CommentsTable monitorId={monitorId} />
        </CardContent>
      </Card>
    </div>
  );
}

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMonitor } from "@/lib/actions/monitor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CommentsTable from "./_components/comments-table";
import CopyButton from "./_components/copy-button";

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
        <Link href={`/app/projects/${id}`}>
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
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground truncate">
                {monitor.webhook_receive}
              </div>
              <CopyButton
                value={monitor.webhook_receive}
                label="Webhook URL"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Verification Token</div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground truncate">
                {monitor.webhook_token}
              </div>
              <CopyButton
                value={monitor.webhook_token}
                label="Verification Token"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Created At</div>
            <div className="text-sm text-muted-foreground">
              {new Date(monitor.created_at).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Last Updated</div>
            <div className="text-sm text-muted-foreground">
              {new Date(monitor.updated_at || monitor.created_at).toLocaleString('pt-BR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <CommentsTable
            monitorId={monitorId}
            access_token={monitor.access_token || ''}
          />
        </CardContent>
      </Card>
    </div>
  );
}

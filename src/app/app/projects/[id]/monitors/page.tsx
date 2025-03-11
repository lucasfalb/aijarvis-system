import { Metadata } from "next";
import { notFound } from "next/navigation";
import CreateNewMonitor from "./_components/create-new-monitor";
import { getMonitors } from "@/lib/actions/monitor";
import { getProject } from "@/lib/actions/project";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

interface MonitorsPageProps {
  params: Promise<{ id: string }>;
}

export default async function MonitorsPage({ params }: MonitorsPageProps) {
  const resolvedParams = await params; 
  const { id } = resolvedParams;

  const projectResult = await getProject(id);
  if (!projectResult.success || !projectResult.project) {
    notFound();
  }

  const { success, monitors, error } = await getMonitors(id);
  if (!success) {
    console.error("Error loading monitors:", error);
    return <div>Error: {error}</div>;
  }

  const projectMonitors = monitors || [];

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Monitors</h1>
          <p className="text-muted-foreground mt-1">
            Project: {projectResult.project.name}
          </p>
        </div>
        <CreateNewMonitor projectId={id} />
      </div>

      <DataTable
        columns={columns}
        data={projectMonitors}
        searchKey="account_name"
        pageSize={10}
        showPaginationOnLength={10}
      />
    </div>
  );
}

export async function generateMetadata({ params }: MonitorsPageProps): Promise<Metadata> {
  const resolvedParams = await params; 
  const { id } = resolvedParams;

  const result = await getProject(id);

  if (!result.success || !result.project) {
    return { title: "Monitors - Not Found" };
  }

  return {
    title: `Monitors - ${result.project.name}`,
    description: `Monitor list for project ${result.project.name}`,
  };
}

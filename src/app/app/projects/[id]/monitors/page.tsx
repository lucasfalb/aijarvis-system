import { Metadata } from "next"
import { notFound } from "next/navigation"
import CreateNewMonitor from "./_components/create-new-monitor"
import { getMonitors } from "@/lib/actions/monitor"
import { getProject } from "@/lib/actions/project"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"

export default async function MonitorsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const projectResult = await getProject(params.id);
  if (!projectResult.success || !projectResult.project) {
    notFound();
  }

  const { success, monitors, error } = await getMonitors(params.id);
  if (!success) {
    console.error('Error loading monitors:', error);
    return <div>Error: {error}</div>
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
        <CreateNewMonitor projectId={params.id} />
      </div>

      <DataTable 
        columns={columns} 
        data={projectMonitors}
        searchKey="account_name"
      />
    </div>
  )
}


export async function generateMetadata({ 
  params 
}: { 
  params: { id: string } 
}): Promise<Metadata> {
  const result = await getProject(params.id)
  
  if (!result.success || !result.project) {
    return { title: 'Monitors - Not Found' }
  }

  return {
    title: `Monitors - ${result.project.name}`,
    description: `Monitor list for project ${result.project.name}`,
  }
}
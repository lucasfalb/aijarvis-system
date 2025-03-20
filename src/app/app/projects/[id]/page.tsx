import { getProject } from "@/lib/actions/project"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { getMonitors } from "@/lib/actions/monitor"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, ExternalLink, Calendar, User, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/data-table"
import CreateNewMonitor from "./monitors/_components/create-new-monitor"
import { columns } from "./monitors/columns"
import { EditProject } from "../_components/edit-project"

type ProjectPageProps = {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: ProjectPageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getProject(id)
  if (!result.success || !result.project) {
    return { title: 'Project Not Found' }
  }

  return {
    title: `${result.project.name} - AIJARVIS`,
    description: `${result.project.description} - AIJARVIS`,
  }
}

export default async function ProjectPage({
  params
}: ProjectPageProps) {
  const { id } = await params;
  const result = await getProject(id)
  const monitorsResult = await getMonitors(id)

  if (!result.success || !result.project) {
    notFound()
  }

  const { project, role } = result
  const projectMonitors = monitorsResult.success && monitorsResult.monitors
    ? monitorsResult.monitors.filter(m => m.project_id === id)
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <EditProject project={project} />
        </div>
        <CreateNewMonitor projectId={id} />
      </div>

      {/* Project details and statistics cards remain the same */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Created: {new Date(project.created_at).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })}</span>
              </div>
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Your Role: {role}</span>
              </div>
              <div className="flex items-center text-sm">
                <RefreshCw className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Last Updated: {new Date(project.updated_at).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })} {new Date(project.updated_at).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monitor Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-2xl font-bold">{projectMonitors?.length || 0}</div>
                <div className="text-xs text-muted-foreground">Total Monitors</div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-2xl font-bold">
                  {projectMonitors?.filter(m => m.platform === 'instagram')?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Instagram Monitors</div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-2xl font-bold">
                  {projectMonitors?.filter(m => m.platform === 'facebook')?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Facebook Monitors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All Monitors</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
            <TabsTrigger value="facebook">Facebook</TabsTrigger>
          </TabsList>
          <Link href={`/app/projects/${id}/monitors`}>
            <Button variant="outline" size="sm">
              Manage Monitors
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <TabsContent value="all" className="mt-0">
          <Card className="p-4 pt-0">
            <CardContent className="p-0">
              {projectMonitors.length > 0 ? (
                <DataTable 
                  columns={columns} 
                  data={projectMonitors} 
                  searchKey="account_name"
                  pageSize={5}
                  showPaginationOnLength={5}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-5">
                  <p className="text-muted-foreground mb-4">No monitors found for this project</p>
                  <Link href={`/app/projects/${id}/monitors/new`}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Monitor
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="instagram" className="mt-0">
          <Card className="p-4 pt-0">
            <CardContent className="p-0">
              {projectMonitors.filter(m => m.platform === 'instagram').length > 0 ? (
                <DataTable 
                  columns={columns} 
                  data={projectMonitors.filter(m => m.platform === 'instagram')} 
                  searchKey="account_name"
                  pageSize={5}
                  showPaginationOnLength={5}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-5">
                  <p className="text-muted-foreground">No Instagram monitors found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="facebook" className="mt-0">
          <Card className="p-4 pt-0">
            <CardContent className="p-0">
              {projectMonitors.filter(m => m.platform === 'facebook').length > 0 ? (
                <DataTable 
                  columns={columns} 
                  data={projectMonitors.filter(m => m.platform === 'facebook')} 
                  searchKey="account_name"
                  pageSize={5}
                  showPaginationOnLength={5}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-5">
                  <p className="text-muted-foreground">No Facebook monitors found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
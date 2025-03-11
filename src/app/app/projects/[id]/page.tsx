import { getProject } from "@/lib/actions/project"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { getMonitors } from "@/lib/actions/monitor"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

type ProjectPageProps = {
  params: {
    id: string
  }
}

export async function generateMetadata({ 
  params 
}: ProjectPageProps): Promise<Metadata> {
  const {id} = await params
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
  const {id} = await params;
  const result = await getProject(id)
  const monitorsResult = await getMonitors(id)

  if (!result.success || !result.project) {
    notFound()
  }

  const { project, role } = result
  const projectMonitors = monitorsResult.success 
    ? monitorsResult.monitors?.filter(m => m.project_id === id) 
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{project.name}</h1>
        {project.description && (
          <p className="text-muted-foreground mt-2">{project.description}</p>
        )}
      </div>

      <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
            <span>Your Role: {role}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Monitors</CardTitle>
            <Link href={`/app/projects/${id}/monitors`}>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {projectMonitors && projectMonitors.length > 0 ? (
              <div className="space-y-4">
                {projectMonitors.slice(0, 3).map((monitor) => (
                  <div key={monitor.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{monitor.account_name}</div>
                      <div className="text-sm text-muted-foreground">{monitor.platform}</div>
                    </div>
                    <Link href={`/app/projects/${id}/monitors/${monitor.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
                {projectMonitors.length > 3 && (
                  <div className="text-sm text-muted-foreground text-center pt-2">
                    And {projectMonitors.length - 3} more monitors...
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No monitors found. Create your first monitor to get started.
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  )
}
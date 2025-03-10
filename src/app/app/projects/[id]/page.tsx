import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function ProjectPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Fetch project and check user access
  const { data: project, error } = await supabase
    .from("projects")
    .select(`
      id,
      name,
      description,
      created_at,
      user_projects!inner (
        role
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{project.name}</h1>
        {project.description && (
          <p className="text-muted-foreground mt-2">{project.description}</p>
        )}
      </div>

      <div className="grid gap-4">
        {/* Project content will go here */}
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold mb-2">Project Details</h2>
          <div className="text-sm text-muted-foreground">
            Created: {new Date(project.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
}
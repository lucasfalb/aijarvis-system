'use client'

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createProject, updateProject, shareProject } from "@/lib/actions/project"

interface ProjectFormProps {
  onSuccess?: () => void;
  initialData?: {
    id: string;
    name: string;
    description?: string;
  };
}

export default function ProjectForm({ onSuccess, initialData }: ProjectFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  
  // ✅ Fixed: Use valid roles ('admin', 'moderator', 'viewer')
  const [role, setRole] = useState<'admin' | 'moderator' | 'viewer'>('viewer')

  const isEditing = !!initialData

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const result = isEditing 
        ? await updateProject(initialData.id, formData)
        : await createProject(formData)

      if (!result.success) {
        throw new Error(result.error)
      }

      toast.success(isEditing ? "Project updated" : "Project created", {
        description: `Project has been ${isEditing ? 'updated' : 'created'} successfully.`,
        action: isEditing ? undefined : {
          label: "View",
          onClick: () => router.push(`/app/projects/${result.project?.id}`),
        },
      })

      router.push("/app/projects")
      router.refresh()
      onSuccess?.()
    } catch (error) {
      console.error("Error with project:", error)
      toast.error("Error", {
        description: error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'create'} project. Please try again.`,
      })
    } finally {
      setLoading(false)
    }
  }


  return (
    <form onSubmit={onSubmit} className="space-y-6 p-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">Name</label>
        <Input id="name" name="name" required defaultValue={initialData?.name} />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <Textarea id="description" name="description" defaultValue={initialData?.description} />
      </div>
    
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Project" : "Create Project")}
      </Button>
    </form>
  );
}

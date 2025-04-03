'use client'

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createProject, updateProject } from "@/lib/actions/project"
import { FileUpload } from "@/components/file-upload"
import { getProjectFiles, deleteProjectFile } from "@/lib/actions/files"
import { Trash2 } from "lucide-react"

interface ProjectFormProps {
  onSuccess?: () => void;
  initialData?: {
    id: string;
    name: string;
    description?: string;
  };
}

interface ProjectFile {
  id: string;
  name: string;
}

export default function ProjectForm({ onSuccess, initialData }: ProjectFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [existingFiles, setExistingFiles] = useState<ProjectFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const isEditing = !!initialData

  useEffect(() => {
    let isMounted = true;

    if (isEditing && initialData?.id) {
      setLoadingFiles(true);
      getProjectFiles(initialData.id)
        .then(result => {
          if (!isMounted) return;

          if (result.success && result.data) {
            setExistingFiles(result.data || []);
          } else {
            toast.error("Failed to load project files");
          }
        })
        .catch(error => {
          if (!isMounted) return;
          console.error("Error fetching project files:", error);
          toast.error("Error loading files");
        })
        .finally(() => {
          if (isMounted) setLoadingFiles(false);
        });
    }

    return () => { isMounted = false; };
  }, [initialData?.id, isEditing]);


  const handleDeleteFile = async (fileId: string) => {
    if (!initialData?.id) return;

    try {
      const result = await deleteProjectFile(initialData.id, fileId);
      if (result.success) {
        toast.success("File deleted successfully");
        setExistingFiles(existingFiles.filter(file => file.id !== fileId));
      } else {
        toast.error(result.error || "Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Error deleting file");
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    try {
      const form = event.currentTarget as HTMLFormElement
      const formData = new FormData()

      const nameInput = form.elements.namedItem('name') as HTMLInputElement
      const descriptionInput = form.elements.namedItem('description') as HTMLTextAreaElement

      formData.append('name', nameInput.value)
      formData.append('description', descriptionInput.value || '')

      if (files.length > 0) {
        files.forEach(file => {
          formData.append('files', file)
        })
      }

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

      router.refresh()
      router.push("/app/projects")
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
  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles)
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

      {isEditing && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Existing Files</label>
          {loadingFiles ? (
            <div className="text-sm text-muted-foreground">Loading files...</div>
          ) : existingFiles.length > 0 ? (
            <div className="space-y-2">
              {existingFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 border rounded-md">
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFile(file.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">-</div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Upload New Files</label>
        <FileUpload onFilesChange={handleFilesChange} />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Project" : "Create Project")}
      </Button>
    </form>
  )
}

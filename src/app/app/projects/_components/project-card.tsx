"use client"
import { Project } from "@/lib/types/database";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditProject } from "./edit-project";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProject } from "@/lib/actions/project";
import Link from "next/link";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    toast("Are you sure you want to delete this project?", {
      action: {
        label: "Delete",
        onClick: async () => {
          setIsDeleting(true);
          toast.promise(
            new Promise(async (resolve, reject) => {
              try {
                // In handleDelete function, update the success handling
                const result = await deleteProject(String(project.id));
                if (!result.success) {
                  throw new Error(result.error);
                }
                router.refresh();
                router.push('/app/projects');
                resolve(true);
              } catch (error) {
                reject(error instanceof Error ? error.message : 'Failed to delete project');
              } finally {
                setIsDeleting(false);
              }
            }),
            {
              loading: 'Deleting project...',
              success: 'Project deleted successfully',
              error: (error) => `Error: ${error}`
            }
          );
        }
      },
    });
  };

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <Link href={`/app/projects/${project.id}`} prefetch>
        <CardHeader>
          <CardTitle>{project.name || "Untitled Project"}</CardTitle>
          <CardDescription>{project.description || "No description available"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Created: {project.created_at ? new Date(project.created_at).toLocaleDateString('pt-BR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }) : "N/A"}
          </div>
        </CardContent>
      </Link>
      <CardFooter className="flex justify-end gap-2">
        <EditProject project={{
          id: String(project.id),
          name: project.name,
          description: project.description || undefined
        }} />
        <Button 
          variant="ghost" 
          size="icon"
          disabled={isDeleting}
          onClick={handleDelete}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

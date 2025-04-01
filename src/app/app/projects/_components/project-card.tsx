"use client"

import { Project } from "@/lib/types/database";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditProject } from "./edit-project";
import { Clock, Folder, MoreHorizontal, TrashIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProject } from "@/lib/actions/project";
import Link from "next/link";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toast("Are you sure you want to delete this project?", {
      action: {
        label: "Delete",
        onClick: async () => {
          setIsDeleting(true);
          toast.promise(
            new Promise(async (resolve, reject) => {
              try {
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

  const getProjectColor = (id: string | number) => {
    const stringId = String(id);
    let hash = 0;
    for (let i = 0; i < stringId.length; i++) {
      hash = ((hash << 5) - hash) + stringId.charCodeAt(i);
      hash = hash & hash;
    }

    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 90%)`;
  };

  const projectColor = getProjectColor(project.id);
  const formattedDate = project.created_at
    ? format(new Date(project.created_at), 'dd MMM yyyy')
    : "N/A";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300 border-muted/6 p-0 gap-0 h-full flex flex-col">
      <Link href={`/app/projects/${project.id}`} prefetch className="flex-1 gap-0 py-4  flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center"
                style={{ backgroundColor: projectColor }}
              >
                <Folder className="h-5 w-5 text-black" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-lg">{project.name || "Untitled Project"}</CardTitle>
                <CardDescription className="line-clamp-1">
                  {project.description || "No description available"}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Link>

      <CardFooter className="border-t bg-muted/20 px-4 py-2 flex justify-between">
        <div className="text-xs text-muted-foreground flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Last updated: {project.updated_at ? format(new Date(project.updated_at), 'dd MMM yyyy') : formattedDate}
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild className="flex flex-col">
                <div className="w-full">
                <EditProject project={{
                  id: String(project.id),
                  name: project.name,
                  description: project.description || undefined
                }}>
                  Edit Project
                </EditProject>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}

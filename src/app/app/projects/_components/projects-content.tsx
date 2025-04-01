"use client";

import { useState } from "react";
import { Project } from "@/lib/types/database";
import { FolderIcon, SearchIcon, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProjectCard from "./project-card";
import CreateNewProject from "./create-new-project";

interface ProjectsContentProps {
  projects: Project[];
}

export default function ProjectsContent({ projects }: ProjectsContentProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projects.filter(project => {
    if (!searchQuery.trim()) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      project.name?.toLowerCase().includes(searchLower) ||
      project.description?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your projects
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
          <CreateNewProject />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg">
          <div className="flex flex-col items-center text-center">
            <FolderIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">
              {searchQuery ? "No matching projects found" : "No projects found"}
            </h3>
            <p className="text-muted-foreground mt-1 mb-4">
              {searchQuery
                ? "Try a different search term or clear the search"
                : "Get started by creating your first project"}
            </p>
            {!searchQuery && <CreateNewProject />}
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

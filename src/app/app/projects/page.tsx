import { Metadata } from "next";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { UserProject } from "@/lib/types/database";

import ProjectCard from "./_components/project-card";
import CreateNewProject from "./_components/create-new-project";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function ProjectsPage() {
  const supabase = createServerComponentClient({ cookies });

  // ✅ Fetch projects linked to the user
  const { data: userProjects, error: userProjectsError } = await supabase
    .from("user_projects")
    .select(`
      project_id,
      projects (
        id,
        name,
        description,
        created_at
      )
    `) as { data: UserProject[] | null, error: any }

  if (userProjectsError) {
    console.error("Error fetching projects:", userProjectsError);
    return <div className="text-red-500">Error loading projects.</div>;
  }

  const projects = userProjects?.map((up) => up.projects).filter(Boolean) || [];

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <CreateNewProject />
      </div>

      {projects.length === 0 ? (
        <p className="text-gray-500">No projects found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project?.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

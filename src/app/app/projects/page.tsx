import { Metadata } from "next";
import ProjectCard from "./_components/project-card";
import CreateNewProject from "./_components/create-new-project";
import { getProjects } from "@/lib/actions/project";

export const metadata: Metadata = {
    title: "Projects",
};

export default async function ProjectsPage() {
    const { success, projects, error } = await getProjects();

    if (!success) {
        console.error("Error fetching projects:", error);
        return <div className="text-red-500">Error loading projects.</div>;
    }

    return (
        <div className="container py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Projects</h1>
                <CreateNewProject />
            </div>

            {projects?.length === 0 ? (
                <p className="text-gray-500">No projects found.</p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects?.map((project) => (
                        <ProjectCard key={project?.id} project={project} />
                    ))}
                </div>
            )}
        </div>
    );
}

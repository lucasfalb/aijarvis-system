import { Metadata } from "next";
import { getProjects } from "@/lib/actions/project";
import { Project } from "@/lib/types/database";
import ProjectsContent from "./_components/projects-content";

export const metadata: Metadata = {
    title: "Projects",
};

export default async function ProjectsPage() {
    const { success, projects, error } = await getProjects();

    if (!success) {
        console.error("Error fetching projects:", error);
        return <div className="text-red-500">Error loading projects.</div>;
    }

    const typedProjects = (projects as unknown) as Project[];

    return (
        <div>
            <ProjectsContent projects={typedProjects} />
        </div>
    );
}

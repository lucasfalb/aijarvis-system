import { generateMetadata } from "@/lib/utils"
import ProjectsPage from "./projects/page"

export const metadata = generateMetadata("Dashboard")

export default async function AppPage() {
    return (
       <ProjectsPage />
    )
}

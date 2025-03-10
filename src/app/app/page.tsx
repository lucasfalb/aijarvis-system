import { generateMetadata } from "@/lib/utils"
import DashboardPage from "./dashboard/page"
export const metadata = generateMetadata("Dashboard")

export default function AppPage(){
    return <DashboardPage />
}
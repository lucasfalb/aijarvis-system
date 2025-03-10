import { Metadata } from "next"
import { CreateProjectForm } from "@/app/app/projects/_components/project-form"

export const metadata: Metadata = {
  title: "New Project",
}

export default function NewProjectPage() {
  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
      <CreateProjectForm />
    </div>
  )
}
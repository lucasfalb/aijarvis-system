import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ProjectNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
      <h1 className="text-2xl font-bold">Project Not Found</h1>
      <p className="text-muted-foreground">
      The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Button asChild>
        <Link href="/app/projects">Back to Projects</Link>
      </Button>
    </div>
  )
}
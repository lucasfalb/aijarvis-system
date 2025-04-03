'use client'

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { PencilIcon } from "lucide-react"
import ProjectForm from "./project-form"
import { useState } from "react"
import ProjectMembers from "./project-members"
import ShareProject from "./share-project"
import { ReactNode } from "react"

interface EditProjectProps {
  project: {
    id: string
    name: string
    description?: string
  }
  children?: ReactNode
  className?: string
}

export function EditProject({ project, children, className }: EditProjectProps) {
  const [open, setOpen] = useState(false)
  const [key, setKey] = useState(0)

  const refreshMembers = () => {
    setKey(prev => prev + 1)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className={className} variant="ghost" size="icon">
          <PencilIcon className="h-4 w-4" />
          {children}
        </Button>
      </SheetTrigger>
      <SheetContent className="gap-0 min-w-[100vw] md:min-w-[600px]">
        <SheetHeader>
          <SheetTitle>Edit Project</SheetTitle>
          <SheetDescription>
            Make changes to your project here.
          </SheetDescription>
        </SheetHeader>
        <ProjectForm
          initialData={project}
          onSuccess={() => setOpen(false)}
        />
        <div className="flex flex-col gap-5 p-4">
          <ShareProject
            projectId={project.id}
            onShare={refreshMembers}
          />
          <ProjectMembers
            key={key}
            projectId={project.id}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

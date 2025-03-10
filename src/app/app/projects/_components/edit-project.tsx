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

interface EditProjectProps {
  project: {
    id: string
    name: string
    description?: string
  }
}

export function EditProject({ project }: EditProjectProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <PencilIcon className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
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
      </SheetContent>
    </Sheet>
  )
}
"use client"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { PlusIcon } from "lucide-react";
import ProjectForm from "./project-form";
import { useState } from "react";

export default function CreateNewProject() {
    const [open, setOpen] = useState(false);
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    New Projects
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Create New Project</SheetTitle>
                    <SheetDescription>
                        Its easy, just fill the form and we will get started.
                    </SheetDescription>
                </SheetHeader>
                <ProjectForm onSuccess={() => setOpen(false)} />
            </SheetContent>
        </Sheet>
    )
}
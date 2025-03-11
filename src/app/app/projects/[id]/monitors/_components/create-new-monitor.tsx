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
import MonitorForm from "./monitor-form";
import { useState } from "react";

interface CreateNewMonitorProps {
    projectId: string;
}

export default function CreateNewMonitor({ projectId }: CreateNewMonitorProps) {
    const [open, setOpen] = useState(false);
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    New Monitor
                </Button>
            </SheetTrigger>
            <SheetContent className="gap-0">
                <SheetHeader>
                    <SheetTitle>Create New Monitor</SheetTitle>
                    <SheetDescription>
                        Add a new monitor to track your social media accounts.
                    </SheetDescription>
                </SheetHeader>
                <MonitorForm projectId={projectId} onSuccess={() => setOpen(false)} />
            </SheetContent>
        </Sheet>
    )
}
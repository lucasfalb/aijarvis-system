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
import MonitorForm from "./monitor-form";
import { useState } from "react";

interface EditMonitorProps {
    projectId: string;
    monitor: {
        id: string;
        account_name: string;
        access_token: string;
        platform: string;
        webhook_receive: string;
    };
}

export default function EditMonitor({ projectId, monitor }: EditMonitorProps) {
    const [open, setOpen] = useState(false);
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" className="w-full text-left focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/40 data-[variant=destructive]:focus:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-pointer justify-start items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                    Edit Monitor
                </Button>
            </SheetTrigger>
            <SheetContent className="gap-0">
                <SheetHeader>
                    <SheetTitle>Edit Monitor</SheetTitle>
                    <SheetDescription>
                        Update your monitor settings.
                    </SheetDescription>
                </SheetHeader>
                <MonitorForm 
                    projectId={projectId} 
                    mode="edit"
                    onSuccess={() => setOpen(false)}
                    initialData={monitor}
                />
            </SheetContent>
        </Sheet>
    )
}
"use client"

import { createMonitor } from "@/lib/actions/monitor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface MonitorFormProps {
    projectId: string;
    onSuccess?: () => void;
}

export default function MonitorForm({ projectId, onSuccess }: MonitorFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(event.currentTarget)
            formData.append('project_id', projectId)

            const result = await createMonitor(formData)

            if (!result.success) {
                throw new Error(result.error)
            }

            toast.success("Monitor created successfully")
            router.refresh()
            onSuccess?.()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create monitor")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4 p-4">
            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                    Account Name
                </label>
                <Input
                    id="name"
                    name="name"
                    placeholder="Enter account name"
                    required
                />
            </div>

            <div className="space-y-2 w-full">
                <label htmlFor="platform" className="text-sm font-medium">
                    Platform
                </label>
                <Select name="platform" required>
                    <SelectTrigger  className="w-full">
                        <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <label htmlFor="access_token" className="text-sm font-medium">
                    Access Token
                </label>
                <Input
                    id="access_token"
                    name="access_token"
                    type="password"
                    placeholder="Enter access token"
                    required
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="webhook" className="text-sm font-medium">
                    Webhook URL
                </label>
                <Input
                    id="webhook"
                    name="webhook"
                    type="url"
                    placeholder="https://your-webhook-url.com"
                    required
                />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Monitor"}
            </Button>
        </form>
    )
}
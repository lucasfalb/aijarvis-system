"use client"

import { createMonitor, updateMonitor } from "@/lib/actions/monitor"
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
import { EyeIcon, EyeOffIcon, Copy } from "lucide-react";

interface MonitorFormProps {
    projectId: string;
    onSuccess?: () => void;
    initialData?: {
        id: string;
        account_name: string;
        access_token: string;
        platform: string;
        webhook_receive: string;
    };
    mode?: 'create' | 'edit';
}

export default function MonitorForm({ projectId, onSuccess, initialData, mode = 'create' }: MonitorFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showToken, setShowToken] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(event.currentTarget);
            formData.append('project_id', projectId);

            const result = mode === 'edit' && initialData
                ? await updateMonitor(initialData.id, formData)
                : await createMonitor(formData);

            if (!result.success) {
                throw new Error(result.error);
            }

            toast.success(mode === 'edit' ? "Monitor updated" : "Monitor created", {
                description: `Monitor has been ${mode === 'edit' ? 'updated' : 'created'} successfully.`
            });

            router.refresh();
            onSuccess?.();
        } catch (error) {
            console.error("Error with monitor:", error);
            toast.error("Error", {
                description: error instanceof Error ? error.message : `Failed to ${mode === 'edit' ? 'update' : 'create'} monitor`
            });
        } finally {
            setLoading(false);
        }
    }

    const handleCopyWebhook = async (text: string) => {
        await navigator.clipboard.writeText(text);
        toast.success("Webhook URL copied to clipboard");
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6 p-4">
            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                    Account Name
                </label>
                <Input
                    id="name"
                    name="name"
                    placeholder="Enter account name"
                    required
                    defaultValue={initialData?.account_name}
                />
            </div>

            <div className="space-y-2 w-full">
                <label htmlFor="platform" className="text-sm font-medium">
                    Platform
                </label>
                <Select name="platform" required defaultValue={initialData?.platform}>
                    <SelectTrigger className="w-full">
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
                <div className="relative">
                    <Input
                        id="access_token"
                        name="access_token"
                        type={showToken ? "text" : "password"}
                        placeholder="Enter access token"
                        required={mode === 'create'}
                        defaultValue={initialData?.access_token}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowToken(!showToken)}
                    >
                        {showToken ? (
                            <EyeOffIcon className="h-4 w-4" />
                        ) : (
                            <EyeIcon className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
            {mode === 'edit' && (
                <>
                    <div className="space-y-2">
                        <label htmlFor="webhook_receive" className="text-sm font-medium">
                            Webhook Receive URL
                        </label>
                        <div className="relative group">
                            <Input
                                id="webhook_receive"
                                name="webhook_receive"
                                type="url"
                                placeholder="Webhook receive URL will be generated automatically"
                                disabled
                                defaultValue={initialData?.webhook_receive}
                                className="cursor-pointer"
                                onClick={() => initialData?.webhook_receive && handleCopyWebhook(initialData.webhook_receive)}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary"
                                onClick={() => initialData?.webhook_receive && handleCopyWebhook(initialData.webhook_receive)}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
                {loading 
                    ? (mode === 'edit' ? "Updating..." : "Creating...") 
                    : (mode === 'edit' ? "Update Monitor" : "Create Monitor")}
            </Button>
        </form>
    )
}
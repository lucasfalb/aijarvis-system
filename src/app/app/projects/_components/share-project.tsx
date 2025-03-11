'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { shareProject } from "@/lib/actions/project"
import { useRouter } from "next/navigation"

interface ShareProjectProps {
  projectId: string;
  onShare?: () => void;
}

export default function ShareProject({ projectId, onShare }: ShareProjectProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<'admin' | 'moderator' | 'viewer'>('viewer')

  async function handleShare(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const result = await shareProject(projectId, email, role)
      if (!result.success) {
        throw new Error(result.error)
      }
      toast.success("Shared successfully", {
        description: result.message,
      })
      setEmail("")
      router.refresh()
      onShare?.()
    } catch (error) {
      toast.error("Error sharing project", {
        description: error instanceof Error ? error.message : "Failed to share project",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Share Project</label>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className="border rounded px-2"
          value={role}
          onChange={(e) => setRole(e.target.value as 'viewer' | 'moderator' | 'admin')}
        >
          <option value="viewer">Viewer</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
        <Button 
          type="button" 
          onClick={handleShare}
          disabled={loading || !email}
        >
          Share
        </Button>
      </div>
    </div>
  )
}
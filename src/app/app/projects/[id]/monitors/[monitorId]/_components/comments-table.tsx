"use client"

import { useState, useEffect, useCallback } from "react"
import { DataTable } from "@/components/data-table"
import { columns } from "./comments-columns"
import { getComments } from "@/lib/actions/comments"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"
import { Comment } from "@/lib/types/database"

interface CommentsTableProps {
  monitorId: string;
  access_token: string;
}

export default function CommentsTable({ monitorId, access_token }: CommentsTableProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const POLLING_INTERVAL = 30000;

  const fetchComments = useCallback(async () => {
    if (!access_token) {
      console.error("Access token is missing");
      return;
    }

    setLoading(true)
    try {
      const result = await getComments(monitorId)
      if (result.success && result.comments) {
        setComments(result.comments as Comment[])
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setLoading(false)
    }
  }, [monitorId, access_token])

  useEffect(() => {
    fetchComments()

    let intervalId: NodeJS.Timeout | undefined;
    
    if (autoRefresh) {
      intervalId = setInterval(fetchComments, POLLING_INTERVAL)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [fetchComments, autoRefresh])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Comments</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto-refresh: {autoRefresh ? "ON" : "OFF"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchComments}
            disabled={loading}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns(access_token)}
        data={comments}
        searchKey="username"
      />
    </div>
  )
}
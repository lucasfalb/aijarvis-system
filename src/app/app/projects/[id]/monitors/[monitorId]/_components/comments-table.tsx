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
  }, [fetchComments])

  if (!access_token) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Comments</h2>
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
      <DataTable
        columns={columns(access_token)}
        data={comments}
        searchKey="username"
      />

    </div>
  )
}
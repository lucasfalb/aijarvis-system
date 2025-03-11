"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updateCommentStatus, deleteComment } from "@/lib/actions/comments"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Comment } from "@/lib/types/database"



export const columns: ColumnDef<Comment>[] = [
  {
    accessorKey: "content",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Content
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="max-w-[400px] truncate">
        {row.getValue("content")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("status") === "pending" ? "secondary" : "default"}>
        {row.getValue("status")}
      </Badge>
    ),
  },
  {
    accessorKey: "received_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Received At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.getValue("received_at")).toLocaleString(),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const comment = row.original

      const handleStatusUpdate = async (status: string) => {
        try {
          const result = await updateCommentStatus(comment.id, status)
          if (!result.success) throw new Error(result.error)
          toast.success("Status updated successfully")
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to update status")
        }
      }

      const handleDelete = async () => {
        try {
          const result = await deleteComment(comment.id)
          if (!result.success) throw new Error(result.error)
          toast.success("Comment deleted successfully")
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to delete comment")
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStatusUpdate("pending")}>
              Mark as Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate("resolved")}>
              Mark as Resolved
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                toast.warning("Are you sure you want to delete this comment?", {
                  action: {
                    label: "Delete",
                    onClick: handleDelete
                  }
                })
              }}
              className="text-red-600"
            >
              Delete Comment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
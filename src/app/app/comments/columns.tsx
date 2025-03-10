"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Comment } from "@/lib/types/database"
import { formatDistanceToNow } from "date-fns"

export const columns: ColumnDef<Comment>[] = [
  {
    accessorKey: "text",
    header: "Comment",
    cell: ({ row }) => (
      <div className="max-w-[400px] truncate">{row.getValue("text")}</div>
    ),
  },
  {
    accessorKey: "username",
    header: "User",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("username")}</div>
    ),
  },
  {
    accessorKey: "monitors",
    header: "Monitor",
    cell: ({ row }) => {
      const monitor = row.original.monitors
      return monitor ? `${monitor.platform} - ${monitor.account_name}` : "N/A"
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "comment_tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.comment_tags
      return tags?.length ? (
        <div className="flex gap-1">
          {tags.map((tag, i) => (
            <span key={i} className="px-2 py-1 text-xs bg-muted rounded-full">
              {tag.tag}
            </span>
          ))}
        </div>
      ) : null
    },
  },
  {
    accessorKey: "received_at",
    header: "Received",
    cell: ({ row }) => {
      const date = row.getValue("received_at") as string
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    },
  },
]
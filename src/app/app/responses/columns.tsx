"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Response } from "@/lib/types/database"
import { formatDistanceToNow } from "date-fns"

export const columns: ColumnDef<Response>[] = [
  {
    accessorKey: "content",
    header: "Response",
    cell: ({ row }) => (
      <div className="max-w-[500px] truncate">{row.getValue("content")}</div>
    ),
  },
  {
    accessorKey: "reviewed_by",
    header: "Reviewed By",
    cell: ({ row }) => row.getValue("reviewed_by") || "Not reviewed",
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    },
  },
  {
    accessorKey: "updated_at",
    header: "Last Updated",
    cell: ({ row }) => {
      const date = row.getValue("updated_at") as string
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    },
  },
]
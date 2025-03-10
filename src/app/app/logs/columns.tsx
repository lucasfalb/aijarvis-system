"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Log } from "@/lib/types/database"
import { formatDistanceToNow } from "date-fns"

export const columns: ColumnDef<Log>[] = [
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("action")}</div>
    ),
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => {
      const details = row.getValue("details") as string
      try {
        const parsedDetails = JSON.parse(details)
        return (
          <div className="max-w-[400px] truncate">
            {JSON.stringify(parsedDetails, null, 2)}
          </div>
        )
      } catch {
        return <div className="max-w-[400px] truncate">{details}</div>
      }
    },
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.original.user
      return user ? user.email : "System"
    },
  },
  {
    accessorKey: "created_at",
    header: "Time",
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    },
  },
]
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteMonitor } from "@/lib/actions/monitor"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export type Monitor = {
  id: string
  account_name: string
  platform: string
  created_at: string
  updated_at: string
  webhook: string
  project_id: string
}

export const columns: ColumnDef<Monitor>[] = [
  {
    accessorKey: "account_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Account Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "platform",
    header: "Platform",
  },
  {
    accessorKey: "webhook",
    header: "Webhook URL",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.getValue("webhook")}>
        {row.getValue("webhook")}
      </div>
    ),
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Updated
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("updated_at") || row.getValue("created_at")
      return new Date(date as string).toLocaleString()
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleString(),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const monitor = row.original
      const router = useRouter()

      const handleDelete = async () => {
        try {
          const result = await deleteMonitor(monitor.id)
          if (!result.success) {
            throw new Error(result.error)
          }
          toast.success("Monitor deleted successfully")
          router.refresh()
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Failed to delete monitor")
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/app/projects/${monitor.project_id}/monitors/${monitor.id}`)}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                toast.warning("Are you sure you want to delete this monitor?", {
                  action: {
                    label: "Delete",
                    onClick: handleDelete
                  }
                })
              }}
              className="text-red-600"
            >
              Delete Monitor
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
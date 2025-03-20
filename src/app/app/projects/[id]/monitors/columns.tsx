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
import EditMonitor from "./_components/edit-monitor"
import { Copy } from "lucide-react"
import { Row } from "@tanstack/react-table"

export type Monitor = {
  access_token: string
  id: string
  account_name: string
  platform: string
  created_at: string
  updated_at: string
  webhook_receive: string
  webhook_token: string
  project_id: string
}

const AccountNameCell = ({ row }: { row: Row<Monitor> }) => {
  const router = useRouter();
  const monitor = row.original;
  
  return (
    <Button
      variant="ghost"
      className="p-0 h-auto font-normal"
      onClick={() => router.push(`/app/projects/${monitor.project_id}/monitors/${monitor.id}`)}
    >
      {monitor.account_name}
    </Button>
  );
};

const ActionsCell = ({ row }: { row: Row<Monitor> }) => {
  const monitor = row.original;
  const router = useRouter();
  
  const handleDelete = async () => {
    try {
      const result = await deleteMonitor(monitor.id);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success("Monitor deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete monitor");
    }
  };

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
        <DropdownMenuItem asChild>
          <EditMonitor
            projectId={monitor.project_id}
            monitor={{
              id: monitor.id,
              account_name: monitor.account_name,
              access_token: monitor.access_token,
              platform: monitor.platform,
              webhook_receive: monitor.webhook_receive,
              webhook_token: monitor.webhook_token,
            }}
          />
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
  );
};

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
    cell: AccountNameCell
  },
  {
    accessorKey: "platform",
    header: "Platform",
  },
  {
    accessorKey: "webhook_receive",
    header: "Webhook URL",
    cell: ({ row }) => {
        const webhook = row.getValue("webhook_receive");
        
        const handleCopy = async () => {
            await navigator.clipboard.writeText(webhook as string);
            toast.success("Webhook URL copied to clipboard");
        };
    
        return (
            <div className="flex items-center gap-2 max-w-[200px] group">
                <div 
                    className="truncate cursor-pointer hover:text-primary" 
                    title={webhook as string}
                    onClick={handleCopy}
                >
                    {webhook as string}
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0 h-8 w-8 hover:bg-secondary"
                    onClick={handleCopy}
                >
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        );
    },
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
      const dateValue = row.getValue("updated_at") || row.getValue("created_at");
      const date = new Date(dateValue as string);
      
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }) + ' ' + date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
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
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at") as string);
      
      // Use a fixed locale and format to ensure consistency between server and client
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }) + ' ' + date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    },
  },
  {
    id: "actions",
    cell: ActionsCell
  },
]
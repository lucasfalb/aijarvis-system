"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Comment } from "@/lib/types/database";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { MediaCell } from "./media-cell";
import { ActionCell } from "./action-cell";
import { ResponseDetails } from "./response-details";

// Columns configuration
export const columns = (
  access_token: string, 
  onStatusUpdate?: (commentId: string, status: string) => void
): ColumnDef<Comment>[] => [
  {
    accessorKey: "username",
    header: "User",
    cell: ({ row }) => row.getValue("username"),
  },
  {
    accessorKey: "text",
    header: "Comment",
    cell: ({ row }) => (
      <div className="max-w-[400px] truncate">{row.getValue("text")}</div>
    ),
  },
  {
    accessorKey: "media_id",
    header: "Media",
    cell: ({ row }) => (
      <MediaCell mediaId={row.getValue("media_id")} access_token={access_token} />
    ),
  },
  {
    accessorKey: "received_at",
    header: "Time",
    cell: ({ row }) => new Date(row.getValue("received_at")).toLocaleString(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      const comment = row.original;
      return status === "responded" ? (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Badge variant="default" className="cursor-pointer">
              {String(status)}
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <ResponseDetails comment={comment} />
          </HoverCardContent>
        </HoverCard>
      ) : (
        <Badge variant="secondary">{String(status)}</Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionCell 
        comment={row.original} 
        access_token={access_token} 
        onStatusUpdate={onStatusUpdate}
      />
    ),
  },
];  
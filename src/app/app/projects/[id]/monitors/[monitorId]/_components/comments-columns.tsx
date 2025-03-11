"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { updateCommentStatus } from "@/lib/actions/comments";
import { Badge } from "@/components/ui/badge";
import { Comment } from "@/lib/types/database";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Image from "next/image";
import { Loader } from "lucide-react";
import { useInstagramMedia } from "@/lib/hooks/use-instagram-media";

interface MediaCellProps {
  mediaId: string;
  access_token: string;
}

const MediaCell = ({ mediaId, access_token }: MediaCellProps) => {
  const { mediaData, loading } = useInstagramMedia(mediaId, access_token);

  return (
    <div className="max-w-[150px] min-h-[50px] flex items-center justify-center">
      {loading ? (
        <Loader className="w-5 h-5 animate-spin text-muted-foreground" />
      ) : mediaData?.media_url ? (
        <Image
          src={mediaData.media_url}
          alt="Media"
          width={50}
          height={50}
          className="rounded-md object-cover"
        />
      ) : <span className="text-muted-foreground text-xs">No Media</span>}
    </div>
  );
};

interface ActionCellProps {
  comment: Comment;
  access_token: string;
}

const ActionCell = ({ comment, access_token }: ActionCellProps) => {
  const router = useRouter();
  const [replyText, setReplyText] = useState(comment.generate_response || "");
  const { mediaData, loading } = useInstagramMedia(comment.media_id, access_token);

  const handleReply = async () => {
    if (!replyText.trim()) return;

    try {
      const commentId = String(comment.id);
      const result = await updateCommentStatus(commentId, replyText);

      if (!result.success) {
        throw new Error(result.error);
      }

      setReplyText("");
      router.refresh();
    } catch (err) {
      console.error("Failed to submit reply:", err);
    }
  };

  return (
    <div>
      {comment.status === "pending" ? (
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm" className="w-[100px]">
              Reply
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="flex justify-center max-w-[700px] mx-auto items-center p-6">
              {loading ? <div>Loading media...</div> : null}
              {mediaData && (
                <div className="mb-6 w-full max-w-md">
                  {mediaData.media_type === "IMAGE" && mediaData.media_url && (
                    <div className="relative aspect-square w-full mb-4">
                      <Image
                        src={mediaData.media_url}
                        alt="Instagram media"
                        width={500}
                        height={500}
                        className="object-cover w-full h-auto rounded-xs"
                      />
                    </div>
                  )}
                  <a
                    href={mediaData.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    View on Instagram
                  </a>
                </div>
              )}
              <div className="w-full max-w-md">
                <DrawerHeader>
                  <DrawerTitle>Reply to Comment</DrawerTitle>
                  <DrawerDescription>
                    Responding to {comment.username}&apos;s comment: &quot;
                    {comment.text}&quot;
                  </DrawerDescription>
                </DrawerHeader>

                <div className="p-4">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    className="min-h-[200px] resize-none"
                    maxLength={1000}
                  />
                  <div className="text-xs text-muted-foreground text-right mt-2">
                    {replyText.length}/1000
                  </div>
                </div>

                <DrawerFooter>
                  <Button onClick={handleReply} disabled={!replyText.trim()}>
                    Submit Reply
                  </Button>
                  <DrawerClose asChild>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setReplyText(comment.generate_response || "")
                      }
                    >
                      Cancel
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <span className="text-muted-foreground text-sm">Replied</span>
      )}
    </div>
  );
};

export const columns = (access_token: string): ColumnDef<Comment>[] => [
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
    cell: ({ row }) => (
      <Badge variant={row.getValue("status") === "responded" ? "default" : "secondary"}>
        {String(row.getValue("status"))}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell comment={row.original} access_token={access_token} />,
  },
];

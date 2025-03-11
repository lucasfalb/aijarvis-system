"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { updateCommentStatus } from "@/lib/actions/comments";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Comment } from "@/lib/types/database";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { getInstagramMedia } from "@/lib/utils/instagram";
import Image from "next/image";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { MessageCircle, Clock } from "lucide-react";

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
    cell: ({ row }) => {
      const mediaId = row.getValue("media_id");
      const [mediaData, setMediaData] = useState<any>(null);
      const [loading, setLoading] = useState(false);

      useEffect(() => {
        if (mediaId && access_token) {
          setLoading(true);
          getInstagramMedia(mediaId as string, access_token)
            .then((result) => {
              if (result.success) {
                setMediaData(result.data);
              } else {
                toast.error("Failed to load media details");
              }
            })
            .catch(() => toast.error("Error loading media details"))
            .finally(() => setLoading(false));
        }
      }, [mediaId, access_token]);

      return (
        <div className="max-w-[150px] min-h-[50px] flex items-center justify-start">
          {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {mediaData?.media_url && (
            <Image
              src={mediaData.media_url}
              alt="Media"
              width={50}
              height={50}
              className="rounded-md object-cover"
            />
          )}
        </div>
      );
    },
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

      if (status === "responded") {
        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Badge variant="default" className="cursor-pointer">
                {String(status)}
              </Badge>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <h4 className="text-sm font-semibold">Comment Details</h4>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">From:</span> {comment.username}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Message:</span> {comment.text}
                  </p>
                  {comment.generate_response && (
                    <p className="text-sm text-wrap">
                      <span className="font-medium">Response:</span>{" "}
                      {comment.generate_response}
                    </p>
                  )}
                  <div className="flex items-center pt-2">
                    <Clock className="mr-2 h-4 w-4 opacity-70" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.received_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        );
      }

      return (
        <Badge variant="secondary">{String(status)}</Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const router = useRouter();
      const comment = row.original;
      const [replyText, setReplyText] = useState(comment.generate_response || "");
      const [mediaData, setMediaData] = useState<any>(null);
      const [loading, setLoading] = useState(false);

      useEffect(() => {
        if (comment.media_id && access_token) {
          setLoading(true);
          getInstagramMedia(comment.media_id, access_token)
            .then((result) => {
              if (result.success) {
                setMediaData(result.data);
              } else {
                toast.error("Failed to load media details");
              }
            })
            .catch(() => toast.error("Error loading media details"))
            .finally(() => setLoading(false));
        }
      }, [comment.media_id, access_token]);

      const handleReply = async () => {
        if (!replyText.trim()) {
          toast.error("Reply text cannot be empty");
          return;
        }

        try {
          const commentId = String(comment.id);
          const result = await updateCommentStatus(commentId, replyText);

          if (!result.success) {
            throw new Error(result.error);
          }

          setReplyText("");
          toast.success("Reply submitted successfully");
          router.refresh();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to submit reply");
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
                <div className="grid grid-cols-2 max-w-[700px] mx-auto items-center p-6">
                  {loading && <div>Loading media...</div>}
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
                        Responding to {comment.username}&apos;s comment: &quot;{comment.text}&quot;
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
                          onClick={() => setReplyText(comment.generate_response || "")}
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
    },
  },
];

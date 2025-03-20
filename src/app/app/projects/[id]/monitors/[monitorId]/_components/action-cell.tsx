"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { Comment } from "@/lib/types/database";
import { updateCommentStatus } from "@/lib/actions/comments";
import { useInstagramMedia } from "@/lib/hooks/use-instagram-media";
import { MediaPreview } from "./media-cell";
import { ResponseDetails } from "./response-details";
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface ActionCellProps {
  comment: Comment;
  access_token: string;
  onStatusUpdate?: (commentId: string, status: string) => void;
}

export const ActionCell = ({ comment, access_token, onStatusUpdate }: ActionCellProps) => {
  const router = useRouter();
  const [replyText, setReplyText] = useState(comment.generate_response || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mediaData, loading } = useInstagramMedia(comment.media_id, access_token);

  const handleReply = async () => {
    if (!replyText.trim()) return;

    try {
      setIsSubmitting(true);
      const result = await updateCommentStatus(String(comment.id), replyText);
      if (!result.success) throw new Error(result.error);
      
      toast.success("Reply sent successfully");
      
      // Update the local state immediately
      if (onStatusUpdate) {
        onStatusUpdate(String(comment.id), "responded");
      }
      
      router.refresh();
    } catch (err) {
      console.error("Failed to submit reply:", err);
      toast.error(err instanceof Error ? err.message : "Failed to submit reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (comment.status !== "pending") {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <span className="text-muted-foreground text-sm cursor-pointer">Replied</span>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <ResponseDetails comment={comment} />
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="w-[100px]">Reply</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="flex flex-col md:flex-row justify-center max-w-[700px] mx-auto items-center p-6">
          {loading ? (
            <div>Loading media...</div>
          ) : (
            <MediaPreview mediaData={mediaData} />
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
              <Button 
                onClick={handleReply} 
                disabled={!replyText.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Reply"
                )}
              </Button>
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  onClick={() => setReplyText(comment.generate_response || "")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
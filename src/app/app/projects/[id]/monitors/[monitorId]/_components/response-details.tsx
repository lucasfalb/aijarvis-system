"use client";

import { useState, useEffect } from "react";
import { Comment } from "@/lib/types/database";
import { getResponse } from "@/lib/actions/responses";
import { Loader, MessageCircle } from "lucide-react";
import Image from "next/image";

interface ResponseData {
  id: string;
  comment_id: string;
  response: string;
  reviewed_at: string;
  user?: {
    id: string;
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

export const ResponseDetails = ({ comment }: { comment: Comment }) => {
  const [responseData, setResponseData] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchResponseData() {
      if (comment.status === "responded") {
        setLoading(true);
        try {
          const result = await getResponse(String(comment.id));
          if (result.success && result.response) {
            setResponseData(result.response as ResponseData);
          }
        } catch (error) {
          console.error("Error fetching response:", error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchResponseData();
  }, [comment.id, comment.status]);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-4 w-4" />
        <h4 className="text-sm font-semibold">Response Details</h4>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-2">
          <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-1">
          <p className="text-sm text-wrap">
            <span className="font-bold">To:</span> {comment.username}
          </p>
          <p className="text-sm text-wrap">
            <span className="font-bold">Comment:</span> {comment.text}
          </p>
          {responseData ? (
            <>
              <p className="text-sm text-wrap">
                <span className="font-bold">Response:</span>{" "}
                {responseData.response}
              </p>
              {responseData.reviewed_at && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {responseData.user?.avatar_url ? (
                      <Image 
                        src={responseData.user.avatar_url} 
                        alt={responseData.user.full_name || "User"}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full uppercase p-0 bg-primary/10 flex items-center justify-center text-[10px]">
                        {responseData.user?.full_name?.[0] || "U"}
                      </div>
                    )}
                    <span>
                      Sent by {responseData.user?.full_name || "Unknown"} on{" "}
                      {new Date(responseData.reviewed_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            comment.generate_response && (
              <p className="text-sm text-wrap">
                <span className="font-bold">Response:</span>{" "}
                {comment.generate_response}
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
};
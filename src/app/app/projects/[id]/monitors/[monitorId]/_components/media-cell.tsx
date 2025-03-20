"use client";

import { memo } from "react";
import Image from "next/image";
import { Loader } from "lucide-react";
import { useInstagramMedia } from "@/lib/hooks/use-instagram-media";

interface MediaCellProps {
  mediaId: string;
  access_token: string;
}

export const MediaCell = memo(({ mediaId, access_token }: MediaCellProps) => {
  const { mediaData, loading } = useInstagramMedia(mediaId, access_token);

  return (
    <div className="max-w-[150px] min-h-[50px] flex items-center justify-start">
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
      ) : (
        <span className="text-muted-foreground text-xs">No Media</span>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if mediaId or access_token change
  return prevProps.mediaId === nextProps.mediaId && 
         prevProps.access_token === nextProps.access_token;
});

MediaCell.displayName = "MediaCell";

// Interface for media data
export interface InstagramMediaData {
  media_type?: string;
  media_url?: string;
  permalink?: string;
}

// Media preview component for the drawer
export const MediaPreview = ({ mediaData }: { mediaData: InstagramMediaData | null }) => {
  if (!mediaData) return null;
  
  return (
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
      {mediaData.permalink && (
        <a
          href={mediaData.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:underline"
        >
          View on Instagram
        </a>
      )}
    </div>
  );
};
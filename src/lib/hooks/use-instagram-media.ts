import { useState, useEffect } from 'react';
import { getInstagramMedia } from "@/lib/utils/instagram";

interface MediaData {
  media_url?: string;
  media_type?: string;
  permalink?: string;
}

export function useInstagramMedia(mediaId: string | null, access_token: string) {
  const [mediaData, setMediaData] = useState<MediaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (mediaId && !attempted && access_token) {
      setLoading(true);
      setAttempted(true);

      getInstagramMedia(mediaId, access_token)
        .then((result) => {
          if (result.success) {
            setMediaData(result.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [mediaId, access_token, attempted]);

  return { mediaData, loading };
}
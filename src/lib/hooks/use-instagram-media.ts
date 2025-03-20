// use-instagram-media.ts
import { useState, useEffect, useRef } from 'react';
import { getInstagramMedia } from "@/lib/utils/instagram";

interface MediaData {
  media_url?: string;
  media_type?: string;
  permalink?: string;
}

// Global cache shared across all component instances
const globalMediaCache = new Map<string, MediaData | null>();
const pendingRequests = new Map<string, Promise<MediaData | null>>();

export function useInstagramMedia(mediaId: string | null, access_token: string) {
  const [mediaData, setMediaData] = useState<MediaData | null>(null);
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);
  
  // Create a stable cache key
  const cacheKey = mediaId ? `${mediaId}-${access_token}` : '';
  
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Skip if no valid mediaId or access_token
    if (!mediaId || !access_token || !cacheKey) {
      setMediaData(null);
      setLoading(false);
      return;
    }
    
    // First check if we already have the data cached
    if (globalMediaCache.has(cacheKey)) {
      setMediaData(globalMediaCache.get(cacheKey) || null);
      setLoading(false);
      return;
    }
    
    // Check if there's already a pending request for this media
    if (pendingRequests.has(cacheKey)) {
      setLoading(true);
      
      // Use the existing promise to avoid duplicate requests
      pendingRequests.get(cacheKey)!.then(data => {
        if (isMounted.current) {
          setMediaData(data);
          setLoading(false);
        }
      }).catch(() => {
        if (isMounted.current) {
          setLoading(false);
        }
      });
      
      return;
    }
    
    setLoading(true);
    
    const fetchPromise = (async () => {
      try {
        const result = await getInstagramMedia(mediaId, access_token);
        
        if (result.success) {
          globalMediaCache.set(cacheKey, result.data);
          return result.data;
        }
        return null;
      } catch (error) {
        console.error("Error fetching Instagram media:", error);
        return null;
      } finally {
        pendingRequests.delete(cacheKey);
      }
    })();
    
    pendingRequests.set(cacheKey, fetchPromise);
    
    fetchPromise.then(data => {
      if (isMounted.current) {
        setMediaData(data);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted.current) {
        setLoading(false);
      }
    });
    
  }, [cacheKey, mediaId, access_token]);

  return { mediaData, loading };
}
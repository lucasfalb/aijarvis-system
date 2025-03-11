export async function getInstagramMedia(mediaId: string, accessToken: string) {
  try {
    const response = await fetch(
      `https://graph.instagram.com/${mediaId}?fields=id,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch media');
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error fetching Instagram media:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch media'
    };
  }
}
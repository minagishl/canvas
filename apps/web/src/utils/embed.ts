export function convertYouTubeUrlToEmbed(url: string): string | null {
  // Extract YouTube video IDs with regular expressions
  const regexPatterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/, // Normal URL
    /(?:https?:\/\/)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/, // www. None
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/, // youtu.be short URL
  ];

  for (const pattern of regexPatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube-nocookie.com/embed/${match[1]}`;
    }
  }

  return null;
}

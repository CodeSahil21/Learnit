export const getYouTubeEmbedUrl = (url: string): string => {
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1].split('?')[0]
    return `https://www.youtube-nocookie.com/embed/${videoId}`
  } else if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1].split('&')[0]
    return `https://www.youtube-nocookie.com/embed/${videoId}`
  }
  return url
}

export const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube') || url.includes('youtu.be')
}
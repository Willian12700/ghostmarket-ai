/**
 * Extrai o ID do vídeo do YouTube a partir de qualquer formato de link,
 * incluindo vídeos não-listados, links encurtados (youtu.be), shorts ou embeds.
 */
export function extractYoutubeVideoId(input: string): string | null {
  if (!input) return null
  const trimmed = input.trim()

  // Se já for diretamente um ID de 11 caracteres (letras, números, hífen, underscore)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed
  }

  try {
    // Regex abrangente para YouTube (watch?v=, youtu.be/, shorts/, embed/, etc.)
    const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
    const match = trimmed.match(regExp)
    if (match && match[1]) {
      return match[1]
    }

    // Fallback com URL parser
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed)
      if (url.hostname.includes('youtu.be')) {
        const id = url.pathname.replace(/^\//, '').split('/')[0]
        if (id && id.length === 11) return id
      }
      if (url.hostname.includes('youtube.com')) {
        const v = url.searchParams.get('v')
        if (v && v.length === 11) return v
        const parts = url.pathname.split('/')
        const lastPart = parts[parts.length - 1]
        if (lastPart && lastPart.length === 11) return lastPart
      }
    }
  } catch (err) {
    // Silencia erro de URL inválida
  }

  return null
}

/**
 * Retorna a URL de embed segura do YouTube (nocookie) pronta para iframes
 */
export function getYoutubeEmbedUrl(videoId: string, autoplay = true): string {
  if (!videoId) return ''
  const ap = autoplay ? '1' : '0'
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${ap}&rel=0&modestbranding=1&playsinline=1`
}

/**
 * Retorna a URL da imagem de capa (thumbnail) oficial do YouTube
 */
export function getYoutubeThumbnail(videoId: string, quality: 'max' | 'hq' = 'hq'): string {
  if (!videoId) return ''
  if (quality === 'max') {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

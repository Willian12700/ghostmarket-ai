export interface VideoMetadata {
  duration: number // em segundos
  width: number
  height: number
  thumbnailBlob: Blob | null
  thumbnailPreviewUrl: string | null
}

/**
 * Extrai metadados (duração, dimensões) e gera um snapshot de thumbnail
 * a partir de um arquivo de vídeo usando HTML5 Video e Canvas.
 */
export const extractVideoMetadataAndThumbnail = (file: File): Promise<VideoMetadata> => {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video')
      const objectUrl = URL.createObjectURL(file)

      video.src = objectUrl
      video.muted = true
      video.playsInline = true
      video.preload = 'metadata'

      // Timeout de segurança caso o navegador não consiga decodificar o container
      const timeoutId = setTimeout(() => {
        cleanup()
        resolve({
          duration: 0,
          width: 0,
          height: 0,
          thumbnailBlob: null,
          thumbnailPreviewUrl: null
        })
      }, 7000)

      const cleanup = () => {
        clearTimeout(timeoutId)
        video.pause()
        video.removeAttribute('src')
        video.load()
        URL.revokeObjectURL(objectUrl)
      }

      video.onloadedmetadata = () => {
        const duration = Math.round(video.duration || 0)

        // Pular para o primeiro segundo ou 25% do vídeo para capturar um frame significativo
        const seekTime = Math.min(1.0, Math.max(0.1, duration * 0.25))
        video.currentTime = seekTime
      }

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas')
          // Redimensiona thumbnail para economizar banda (máximo 640px de largura mantendo proporção)
          const targetWidth = Math.min(640, video.videoWidth || 640)
          const aspectRatio = (video.videoHeight || 360) / (video.videoWidth || 640)
          const targetHeight = Math.round(targetWidth * aspectRatio)

          canvas.width = targetWidth
          canvas.height = targetHeight

          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(video, 0, 0, targetWidth, targetHeight)
            const previewUrl = canvas.toDataURL('image/jpeg', 0.82)

            canvas.toBlob(
              (blob) => {
                cleanup()
                resolve({
                  duration: Math.round(video.duration || 0),
                  width: video.videoWidth || 0,
                  height: video.videoHeight || 0,
                  thumbnailBlob: blob,
                  thumbnailPreviewUrl: previewUrl
                })
              },
              'image/jpeg',
              0.82
            )
            return
          }
        } catch (e) {
          console.warn('Não foi possível gerar thumbnail via canvas:', e)
        }

        cleanup()
        resolve({
          duration: Math.round(video.duration || 0),
          width: video.videoWidth || 0,
          height: video.videoHeight || 0,
          thumbnailBlob: null,
          thumbnailPreviewUrl: null
        })
      }

      video.onerror = () => {
        cleanup()
        resolve({
          duration: 0,
          width: 0,
          height: 0,
          thumbnailBlob: null,
          thumbnailPreviewUrl: null
        })
      }
    } catch (err) {
      console.warn('Erro ao processar vídeo localmente:', err)
      resolve({
        duration: 0,
        width: 0,
        height: 0,
        thumbnailBlob: null,
        thumbnailPreviewUrl: null
      })
    }
  })
}

/**
 * Formata bytes em unidades legíveis (B, KB, MB, GB)
 */
export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

/**
 * Formata segundos no padrão mm:ss ou hh:mm:ss
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0 || isNaN(seconds)) return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

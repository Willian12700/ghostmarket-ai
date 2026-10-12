export interface VideoItem {
  id: string
  userId: string
  userEmail: string
  userName?: string
  title: string
  originalFileName: string
  storagePath: string
  downloadUrl: string
  thumbnailUrl?: string
  thumbnailPath?: string
  size: number // bytes
  duration: number // seconds
  width?: number
  height?: number
  mimeType: string
  isPublic: boolean
  status: 'ready' | 'uploading' | 'processing' | 'error'
  views: number
  createdAt: string // ISO string
  updatedAt: string // ISO string
}

export interface VideoUploadProgress {
  progress: number // 0 a 100
  bytesTransferred: number
  totalBytes: number
  status: 'extracting' | 'uploading_thumb' | 'uploading_video' | 'saving' | 'completed' | 'error' | 'canceled'
  error?: string
}

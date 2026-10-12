import { create } from 'zustand'
import { db, storage } from '@/config/firebase'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  increment
} from 'firebase/firestore'
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask
} from 'firebase/storage'
import { VideoItem, VideoUploadProgress } from '@/types/video'
import { extractVideoMetadataAndThumbnail } from '@/utils/videoProcessor'

interface VideoState {
  videos: VideoItem[]
  isLoading: boolean
  error: string | null
  currentUploadTask: UploadTask | null
  uploadProgress: VideoUploadProgress | null

  fetchVideos: (userId: string, isAdmin?: boolean) => Promise<void>
  uploadVideo: (
    file: File,
    title: string,
    isPublic: boolean,
    user: { uid: string; email?: string; name?: string; displayName?: string },
    onProgressUpdate?: (progress: VideoUploadProgress) => void
  ) => Promise<VideoItem>
  cancelUpload: () => void
  updateVideoTitle: (videoId: string, newTitle: string) => Promise<void>
  toggleVideoPrivacy: (videoId: string, currentPublic: boolean) => Promise<void>
  deleteVideo: (video: VideoItem) => Promise<void>
  getVideoById: (videoId: string) => Promise<VideoItem | null>
  incrementVideoViews: (videoId: string) => Promise<void>
}

export const useVideoStore = create<VideoState>((set, get) => ({
  videos: [],
  isLoading: false,
  error: null,
  currentUploadTask: null,
  uploadProgress: null,

  fetchVideos: async (userId: string, isAdmin = false) => {
    if (!userId) return
    set({ isLoading: true, error: null })

    try {
      const videosRef = collection(db, 'videos')
      // Se não for admin, busca apenas os vídeos pertencentes ao usuário logado
      const q = isAdmin
        ? query(videosRef)
        : query(videosRef, where('userId', '==', userId))

      const snapshot = await getDocs(q)
      const list: VideoItem[] = []

      snapshot.forEach((d) => {
        const data = d.data() as VideoItem
        list.push({ ...data, id: d.id })
      })

      // Ordenar por data decrescente na memória (evita necessidade de índices compostos manuais)
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      set({ videos: list, isLoading: false })
    } catch (err: any) {
      console.error('Erro ao buscar vídeos:', err)
      set({ error: err.message || 'Erro ao carregar vídeos', isLoading: false })
    }
  },

  uploadVideo: async (file, title, isPublic, user, onProgressUpdate) => {
    const videoId = 'vid_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)

    const updateProg = (p: VideoUploadProgress) => {
      set({ uploadProgress: p })
      if (onProgressUpdate) onProgressUpdate(p)
    }

    updateProg({
      progress: 5,
      bytesTransferred: 0,
      totalBytes: file.size,
      status: 'extracting'
    })

    try {
      // 1. Extração de metadados e miniatura no navegador (instantâneo)
      const meta = await extractVideoMetadataAndThumbnail(file)

      // 2. Usar miniatura gerada localmente em base64 (elimina requisições extras)
      const thumbnailUrl = meta.thumbnailPreviewUrl || ''

      updateProg({
        progress: 15,
        bytesTransferred: 0,
        totalBytes: file.size,
        status: 'uploading_video'
      })

      // 3. Upload resumable do arquivo de vídeo principal
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storagePath = `videos/${user.uid}/${videoId}_${cleanFileName}`
      const videoRef = ref(storage, storagePath)

      const uploadTask = uploadBytesResumable(videoRef, file, {
        contentType: file.type || 'video/mp4'
      })

      set({ currentUploadTask: uploadTask })

      // Retorna uma Promise que resolve quando o upload concluir
      const videoItem = await new Promise<VideoItem>((resolve, reject) => {
        let hasTransferredAnyByte = false

        // Timeout watchdog: se em 15s não transferir nenhum byte, detecta bucket inexistente/CORS
        const watchdog = setTimeout(() => {
          if (!hasTransferredAnyByte) {
            uploadTask.cancel()
            const storageError = new Error(
              'O Firebase Storage ainda não foi ativado no Console do Firebase para o projeto ghostmarket-ai-2cc26. Acesse console.firebase.google.com/project/ghostmarket-ai-2cc26/storage e clique em "Começar" para ativar o bucket.'
            )
            updateProg({
              progress: 0,
              bytesTransferred: 0,
              totalBytes: file.size,
              status: 'error',
              error: storageError.message
            })
            set({ currentUploadTask: null })
            reject(storageError)
          }
        }, 15000)

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.bytesTransferred > 0) {
              hasTransferredAnyByte = true
              clearTimeout(watchdog)
            }

            const rawProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            // Mapeia o progresso entre 15% e 95%
            const mappedProgress = Math.round(15 + (rawProgress * 0.8))

            updateProg({
              progress: Math.min(95, mappedProgress),
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              status: 'uploading_video'
            })
          },
          (error) => {
            clearTimeout(watchdog)
            console.error('Erro no upload resumable:', error)

            let formattedMsg = error.message
            if (error.code === 'storage/unknown' || error.message.includes('unknown') || error.code === 'storage/bucket-not-found') {
              formattedMsg = 'O Firebase Storage ainda não foi ativado no Console do Firebase (projeto ghostmarket-ai-2cc26). Acesse o Console do Firebase > Storage e clique em "Começar" para criar o bucket.'
            } else if (error.code === 'storage/unauthorized') {
              formattedMsg = 'Permissão negada no Firebase Storage. Verifique se as regras do Storage permitem escrita para usuários autenticados.'
            }

            updateProg({
              progress: 0,
              bytesTransferred: 0,
              totalBytes: file.size,
              status: 'error',
              error: formattedMsg
            })
            set({ currentUploadTask: null })
            reject(new Error(formattedMsg))
          },
          async () => {
            clearTimeout(watchdog)
            try {
              updateProg({
                progress: 98,
                bytesTransferred: file.size,
                totalBytes: file.size,
                status: 'saving'
              })

              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)

              const newDoc: VideoItem = {
                id: videoId,
                userId: user.uid,
                userEmail: user.email || '',
                userName: user.name || user.displayName || 'Operador Ghost',
                title: title.trim() || file.name.replace(/\.[^/.]+$/, ''),
                originalFileName: file.name,
                storagePath,
                downloadUrl,
                thumbnailUrl: thumbnailUrl || meta.thumbnailPreviewUrl || '',
                thumbnailPath: '',
                size: file.size,
                duration: meta.duration || 0,
                width: meta.width || 0,
                height: meta.height || 0,
                mimeType: file.type || 'video/mp4',
                isPublic,
                status: 'ready',
                views: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }

              // Salva metadados no Firestore
              await setDoc(doc(db, 'videos', videoId), newDoc)

              // Atualiza o estado local imediatamente
              set((state) => ({
                videos: [newDoc, ...state.videos],
                currentUploadTask: null,
                uploadProgress: {
                  progress: 100,
                  bytesTransferred: file.size,
                  totalBytes: file.size,
                  status: 'completed'
                }
              }))

              resolve(newDoc)
            } catch (saveErr) {
              reject(saveErr)
            }
          }
        )
      })

      return videoItem
    } catch (err: any) {
      set({ currentUploadTask: null })
      throw err
    }
  },

  cancelUpload: () => {
    const task = get().currentUploadTask
    if (task) {
      task.cancel()
      set({
        currentUploadTask: null,
        uploadProgress: {
          progress: 0,
          bytesTransferred: 0,
          totalBytes: 0,
          status: 'canceled'
        }
      })
    }
  },

  updateVideoTitle: async (videoId: string, newTitle: string) => {
    try {
      const videoRef = doc(db, 'videos', videoId)
      const updatedAt = new Date().toISOString()
      await updateDoc(videoRef, {
        title: newTitle.trim(),
        updatedAt
      })

      set((state) => ({
        videos: state.videos.map((v) =>
          v.id === videoId ? { ...v, title: newTitle.trim(), updatedAt } : v
        )
      }))
    } catch (err) {
      console.error('Erro ao atualizar título do vídeo:', err)
      throw err
    }
  },

  toggleVideoPrivacy: async (videoId: string, currentPublic: boolean) => {
    try {
      const videoRef = doc(db, 'videos', videoId)
      const nextPublic = !currentPublic
      const updatedAt = new Date().toISOString()

      await updateDoc(videoRef, {
        isPublic: nextPublic,
        updatedAt
      })

      set((state) => ({
        videos: state.videos.map((v) =>
          v.id === videoId ? { ...v, isPublic: nextPublic, updatedAt } : v
        )
      }))
    } catch (err) {
      console.error('Erro ao alterar privacidade do vídeo:', err)
      throw err
    }
  },

  deleteVideo: async (video: VideoItem) => {
    try {
      // 1. Remove documento do Firestore
      await deleteDoc(doc(db, 'videos', video.id))

      // 2. Remove o arquivo de vídeo do Firebase Storage
      if (video.storagePath) {
        try {
          const fileRef = ref(storage, video.storagePath)
          await deleteObject(fileRef)
        } catch (storageErr) {
          console.warn('Arquivo de vídeo não encontrado no Storage ou já removido:', storageErr)
        }
      }

      // 3. Remove a miniatura do Storage se existir
      if (video.thumbnailPath) {
        try {
          const thumbRef = ref(storage, video.thumbnailPath)
          await deleteObject(thumbRef)
        } catch (thumbErr) {
          console.warn('Thumbnail não encontrada no Storage ou já removida:', thumbErr)
        }
      }

      // 4. Atualiza estado local
      set((state) => ({
        videos: state.videos.filter((v) => v.id !== video.id)
      }))
    } catch (err) {
      console.error('Erro ao excluir vídeo:', err)
      throw err
    }
  },

  getVideoById: async (videoId: string): Promise<VideoItem | null> => {
    try {
      const docRef = doc(db, 'videos', videoId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as VideoItem
      }
      return null
    } catch (err) {
      console.error('Erro ao buscar vídeo por ID:', err)
      return null
    }
  },

  incrementVideoViews: async (videoId: string) => {
    try {
      const docRef = doc(db, 'videos', videoId)
      await updateDoc(docRef, {
        views: increment(1)
      })

      set((state) => ({
        videos: state.videos.map((v) =>
          v.id === videoId ? { ...v, views: (v.views || 0) + 1 } : v
        )
      }))
    } catch (err) {
      console.warn('Erro ao incrementar visualizações:', err)
    }
  }
}))

import { create } from 'zustand'
import { TutorialVideo } from '@/types/tutorial'
import { db } from '@/config/firebase'
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore'
import { extractYoutubeVideoId, getYoutubeThumbnail } from '@/utils/youtube'

interface TutorialState {
  tutorials: TutorialVideo[]
  isLoading: boolean
  selectedCategory: string
  searchQuery: string
  activeVideoModal: TutorialVideo | null

  // Ações
  fetchTutorials: () => Promise<void>
  addTutorial: (data: Omit<TutorialVideo, 'id' | 'createdAt' | 'thumbnailUrl' | 'youtubeVideoId'>, userEmail: string) => Promise<TutorialVideo>
  updateTutorial: (id: string, data: Partial<Omit<TutorialVideo, 'id' | 'createdAt'>>) => Promise<void>
  deleteTutorial: (id: string) => Promise<void>
  setSelectedCategory: (category: string) => void
  setSearchQuery: (query: string) => void
  setActiveVideoModal: (video: TutorialVideo | null) => void
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  tutorials: [],
  isLoading: false,
  selectedCategory: 'all',
  searchQuery: '',
  activeVideoModal: null,

  fetchTutorials: async () => {
    try {
      set({ isLoading: true })
      const snap = await getDocs(collection(db, 'tutorials'))
      const list: TutorialVideo[] = []

      snap.forEach((d) => {
        const data = d.data() as Omit<TutorialVideo, 'id'>
        list.push({
          ...data,
          id: d.id
        })
      })

      // Ordenar por ordem numérica (se existir) ou por data decrescente
      list.sort((a, b) => {
        if (typeof a.order === 'number' && typeof b.order === 'number') {
          return a.order - b.order
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      })

      set({ tutorials: list, isLoading: false })
    } catch (err) {
      console.warn('Erro ao carregar tutoriais do Firestore:', err)
      set({ isLoading: false })
    }
  },

  addTutorial: async (data, userEmail) => {
    const videoId = extractYoutubeVideoId(data.youtubeUrl)
    if (!videoId) {
      throw new Error('Link do YouTube inválido. Cole a URL do vídeo.')
    }

    const id = `tut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const nowIso = new Date().toISOString()
    const thumbnailUrl = getYoutubeThumbnail(videoId, 'hq')

    const newTutorial: TutorialVideo = {
      id,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category.trim(),
      youtubeUrl: data.youtubeUrl.trim(),
      youtubeVideoId: videoId,
      thumbnailUrl,
      toolRoute: data.toolRoute?.trim() || undefined,
      duration: data.duration?.trim() || undefined,
      order: typeof data.order === 'number' ? data.order : get().tutorials.length + 1,
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: userEmail
    }

    const docRef = doc(db, 'tutorials', id)
    await setDoc(docRef, newTutorial)

    set((state) => ({
      tutorials: [newTutorial, ...state.tutorials].sort((a, b) => (a.order || 0) - (b.order || 0))
    }))

    return newTutorial
  },

  updateTutorial: async (id, data) => {
    const tutorialRef = doc(db, 'tutorials', id)
    const nowIso = new Date().toISOString()

    let updatedFields: Record<string, any> = {
      ...data,
      updatedAt: nowIso
    }

    if (data.youtubeUrl) {
      const videoId = extractYoutubeVideoId(data.youtubeUrl)
      if (videoId) {
        updatedFields.youtubeVideoId = videoId
        updatedFields.thumbnailUrl = getYoutubeThumbnail(videoId, 'hq')
      }
    }

    await updateDoc(tutorialRef, updatedFields)

    set((state) => ({
      tutorials: state.tutorials.map((t) =>
        t.id === id ? { ...t, ...updatedFields } : t
      ).sort((a, b) => (a.order || 0) - (b.order || 0))
    }))
  },

  deleteTutorial: async (id) => {
    const tutorialRef = doc(db, 'tutorials', id)
    await deleteDoc(tutorialRef)

    set((state) => ({
      tutorials: state.tutorials.filter((t) => t.id !== id),
      activeVideoModal: state.activeVideoModal?.id === id ? null : state.activeVideoModal
    }))
  },

  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveVideoModal: (activeVideoModal) => set({ activeVideoModal })
}))

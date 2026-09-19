import { create } from 'zustand'
import { db } from '@/config/firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'

export interface ThemeConfig {
  agencyName: string
  logoUrl: string
  primaryColor: string
}

interface ThemeState {
  theme: ThemeConfig
  isSynced: boolean
  syncTheme: (userId: string) => () => void
  updateTheme: (userId: string, theme: Partial<ThemeConfig>) => Promise<void>
}

const defaultTheme: ThemeConfig = {
  agencyName: 'GhostMarket AI',
  logoUrl: '',
  primaryColor: '#8B5CF6'
}

// Função para ajustar o brilho de uma cor Hex
const adjustHexColor = (color: string, amount: number) => {
  return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

const applyThemeToDOM = (theme: ThemeConfig) => {
  document.documentElement.style.setProperty('--color-primary', theme.primaryColor)
  document.documentElement.style.setProperty('--color-primary-light', adjustHexColor(theme.primaryColor, 30))
  // Se quiser, o cliente pode customizar as outras, mas vamos usar a primary como base
}

export const useThemeStore = create<ThemeState>()((set) => ({
  theme: defaultTheme,
  isSynced: false,

  syncTheme: (userId: string) => {
    const docRef = doc(db, 'agency_settings', userId)
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as ThemeConfig
        set({ theme: data, isSynced: true })
        applyThemeToDOM(data)
      } else {
        set({ theme: defaultTheme, isSynced: true })
        applyThemeToDOM(defaultTheme)
      }
    })

    return unsubscribe
  },

  updateTheme: async (userId: string, newTheme: Partial<ThemeConfig>) => {
    const docRef = doc(db, 'agency_settings', userId)
    await setDoc(docRef, newTheme, { merge: true })
  }
}))

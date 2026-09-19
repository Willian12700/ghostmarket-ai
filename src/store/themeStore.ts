import { create } from 'zustand'
import { db } from '@/config/firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'

export type AppThemeType = 'default' | 'dark' | 'light'

export interface ThemeConfig {
  agencyName: string
  logoUrl: string
  primaryColor: string
  appTheme?: AppThemeType
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
  primaryColor: '#8B5CF6',
  appTheme: 'default'
}

const adjustHexColor = (color: string, amount: number) => {
  return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

const applyThemeToDOM = (theme: ThemeConfig) => {
  document.documentElement.style.setProperty('--color-primary', theme.primaryColor)
  document.documentElement.style.setProperty('--color-primary-light', adjustHexColor(theme.primaryColor, 30))
  
  const appTheme = theme.appTheme || 'default'
  
  if (appTheme === 'default') {
    // Padrão (Roxo / Essence)
    document.documentElement.style.setProperty('--color-bg', '#0f0c29')
    document.documentElement.style.setProperty('--color-panel', '#151230')
    document.documentElement.style.setProperty('--color-panel-hover', '#1d1840')
    document.documentElement.style.setProperty('--color-border', '#2a2550')
    document.documentElement.style.setProperty('--color-border-hover', '#3e3870')
    document.documentElement.style.setProperty('--color-text-primary', '#F3F4F6')
    document.documentElement.style.setProperty('--color-text-secondary', '#9CA3AF')
  } else if (appTheme === 'dark') {
    // Escuro (Cyberpunk)
    document.documentElement.style.setProperty('--color-bg', '#0A0A0A')
    document.documentElement.style.setProperty('--color-panel', '#111111')
    document.documentElement.style.setProperty('--color-panel-hover', '#171717')
    document.documentElement.style.setProperty('--color-border', '#27272A')
    document.documentElement.style.setProperty('--color-border-hover', '#334155')
    document.documentElement.style.setProperty('--color-text-primary', '#F3F4F6')
    document.documentElement.style.setProperty('--color-text-secondary', '#9CA3AF')
  } else if (appTheme === 'light') {
    // Claro (Light Mode)
    document.documentElement.style.setProperty('--color-bg', '#F3F4F6') // bg-gray-100
    document.documentElement.style.setProperty('--color-panel', '#FFFFFF')
    document.documentElement.style.setProperty('--color-panel-hover', '#F9FAFB')
    document.documentElement.style.setProperty('--color-border', '#E5E7EB')
    document.documentElement.style.setProperty('--color-border-hover', '#D1D5DB')
    document.documentElement.style.setProperty('--color-text-primary', '#111827') // text-gray-900
    document.documentElement.style.setProperty('--color-text-secondary', '#4B5563') // text-gray-600
  }
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

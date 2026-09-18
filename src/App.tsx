import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { MainLayout } from '@/layouts/MainLayout'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Dashboard } from '@/pages/Dashboard'
import { Creator } from '@/pages/Creator'
import { Scanner } from '@/pages/Scanner'
import { Contracts } from '@/pages/Contracts'
import { Settings } from '@/pages/Settings'
import { Integrations } from '@/pages/Integrations'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { useAuthStore } from '@/store/authStore'

import { APIProvider } from '@vis.gl/react-google-maps'

function App() {
  const { initAuthListener, isLoading } = useAuthStore()
  // Usando a chave diretamente para não depender de bugs do Windows com arquivos .env
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyD0zkPrRCRBSTC7egqgVw2AkZMNVrVm_9s'

  useEffect(() => {
    initAuthListener()
  }, [initAuthListener])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <APIProvider 
        apiKey={apiKey === 'DEMO_MAP_ID' ? '' : apiKey} 
        version="beta"
        language="pt-BR"
        region="BR"
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/creator" element={<Creator />} />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/integrations" element={<Integrations />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </APIProvider>
    </ErrorBoundary>
  )
}

export default App

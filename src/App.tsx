import { AdminPanel } from './pages/AdminPanel'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { MainLayout } from '@/layouts/MainLayout'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { ResetPassword } from '@/pages/ResetPassword'
import { Dashboard } from '@/pages/Dashboard'
import { Ranking } from '@/pages/Ranking'
import { Creator } from '@/pages/Creator'
import { Library } from '@/pages/Library'
import { PromptBuilder } from '@/pages/PromptBuilder'
import { SiteBuilder } from '@/pages/SiteBuilder'
import { ImageToLink } from '@/pages/ImageToLink'
import { HostedSites } from '@/pages/HostedSites'
import { Finance } from '@/pages/Finance'
import { Products } from '@/pages/Products'
import { Checkout } from '@/pages/Checkout'
import { SiteViewer } from '@/pages/SiteViewer'
import { ClientReport } from '@/pages/ClientReport'
import { Scanner } from '@/pages/Scanner'
import { Chatbots } from '@/pages/Chatbots'
import { SalesScripts } from '@/pages/SalesScripts'
import { Demo } from '@/pages/Demo'
import { VslGenerator } from '@/pages/marketing/VslGenerator'
import { PlrGenerator } from '@/pages/marketing/PlrGenerator'
import { AdsGenerator } from '@/pages/marketing/AdsGenerator'
import { EmailFunnel } from '@/pages/marketing/EmailFunnel'

import { Contracts } from '@/pages/Contracts'
import { Settings } from '@/pages/Settings'
import { Affiliates } from '@/pages/Affiliates'
import { Integrations } from '@/pages/Integrations'
import { PersonaGenerator } from '@/pages/tiktok/PersonaGenerator'
import { PersonaHistory } from '@/pages/tiktok/PersonaHistory'
import { ViralScripts } from '@/pages/tiktok/ViralScripts'
import { AdCopy } from '@/pages/tiktok/AdCopy'
import { OfferIntelligence } from '@/pages/OfferIntelligence'
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
        <Route path="/pay/:productId" element={<Checkout />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/creator" element={<Creator />} />
              <Route path="/library" element={<Library />} />
              <Route path="/prompt-builder" element={<PromptBuilder />} />
              <Route path="/builder" element={<SiteBuilder />} />
              <Route path="/image-to-link" element={<ImageToLink />} />
              <Route path="/sites" element={<HostedSites />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/products" element={<Products />} />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/chatbots" element={<Chatbots />} />
              <Route path="/scripts" element={<SalesScripts />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminPanel />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/affiliates" element={<Affiliates />} />
              
              {/* TikTok Shop Routes */}
              <Route path="/tiktok/persona" element={<PersonaGenerator />} />
              <Route path="/tiktok/persona-history" element={<PersonaHistory />} />
              <Route path="/tiktok/scripts" element={<ViralScripts />} />
              <Route path="/tiktok/ads" element={<AdCopy />} />
              {/* Marketing Routes */}
              <Route path="/marketing/vsl" element={<VslGenerator />} />
              <Route path="/marketing/plr" element={<PlrGenerator />} />
              <Route path="/marketing/ads" element={<AdsGenerator />} />\n              <Route path="/offers" element={<OfferIntelligence />} />
              <Route path="/marketing/emails" element={<EmailFunnel />} />

            </Route>

            <Route path="/s/:siteId" element={<SiteViewer />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/report/:siteId" element={<ClientReport />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </APIProvider>
    </ErrorBoundary>
  )
}

export default App

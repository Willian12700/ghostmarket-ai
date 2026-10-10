import { AdminPanel } from './pages/AdminPanel'
import { AdminNotes } from './pages/AdminNotes'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { MainLayout } from '@/layouts/MainLayout'
import { Landing } from '@/pages/Landing'
import { PublicPartners } from '@/pages/PublicPartners'
import { TrialLogin } from '@/pages/TrialLogin'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { ResetPassword } from '@/pages/ResetPassword'
import { CloudIde } from '@/pages/CloudIde'
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
import { CnpjScanner } from '@/pages/CnpjScanner'
import { Chatbots } from '@/pages/Chatbots'
import { SalesScripts } from '@/pages/SalesScripts'
import { Demo } from '@/pages/Demo'
import { PartnerPanel } from '@/pages/PartnerPanel'

import { DigitalizaCRM } from '@/pages/DigitalizaCRM'
import { Contracts } from '@/pages/Contracts'
import { Settings } from '@/pages/Settings'
import { Affiliates } from '@/pages/Affiliates'
import { Integrations } from '@/pages/Integrations'
import { OfferIntelligence } from '@/pages/OfferIntelligence'
import { PropostaPdf } from '@/pages/PropostaPdf'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { useAuthStore } from '@/store/authStore'
import { QuizPublic } from '@/pages/QuizPublic'
import { QuizAnalytics } from '@/pages/QuizAnalytics'

import { APIProvider } from '@vis.gl/react-google-maps'

function App() {
  const { initAuthListener, isLoading } = useAuthStore()
  // Usando a chave diretamente para não depender de bugs do Windows com arquivos .env
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyD0zkPrRCRBSTC7egqgVw2AkZMNVrVm_9s'

  useEffect(() => { initAuthListener(); const p=new URLSearchParams(window.location.search); const s=p.get('utm_source'); const m=p.get('utm_medium'); const c=p.get('utm_campaign'); if(s)localStorage.setItem('utm_source',s); if(m)localStorage.setItem('utm_medium',m); if(c)localStorage.setItem('utm_campaign',c); }, [initAuthListener])

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
            <Route path="/quiz" element={<QuizPublic />} />
            <Route path="/parceiros" element={<PublicPartners />} />
            <Route path="/socios" element={<PublicPartners />} />
            <Route path="/login" element={<Login />} />
            <Route path="/trial" element={<TrialLogin />} />
            <Route path="/pay/:productId" element={<Checkout />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route element={<MainLayout />}>
              <Route path="/ide" element={<CloudIde />} />
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
              <Route path="/cnpj" element={<CnpjScanner />} />
              <Route path="/chatbots" element={<Chatbots />} />
              <Route path="/scripts" element={<SalesScripts />} />
              <Route path="/digitaliza-crm" element={<DigitalizaCRM />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/socio" element={<PartnerPanel />} />
              <Route path="/quiz/analytics" element={<QuizAnalytics />} />
              <Route path="/admin/notes" element={<AdminNotes />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/affiliates" element={<Affiliates />} />
              <Route path="/offers" element={<OfferIntelligence />} />
            </Route>

            <Route path="/s/:siteId" element={<SiteViewer />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/proposta" element={<PropostaPdf />} />
            <Route path="/report/:siteId" element={<ClientReport />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </APIProvider>
      <ToastContainer />
    </ErrorBoundary>
  )
}

export default App

import { useState } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { useAuthStore } from '@/store/authStore'
import { ToastContainer } from '@/components/ui/ToastContainer'

const pageInfo: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'Painel de Controle', description: 'Acompanhe suas vendas, projetos e leads em um único lugar.' },
  '/creator': { title: 'Creator IA', description: 'Crie especificações completas para transformar ideias em aplicações SaaS.' },
  '/scanner': { title: 'Scanner de Leads', description: 'Encontre oportunidades comerciais por localização e nicho.' },
  '/contracts': { title: 'Gestão de Contratos', description: 'Gerencie seus clientes, contratos e valores em um único painel.' },
  '/settings': { title: 'Configurações', description: 'Gerencie suas preferências e segurança.' },
}

export const MainLayout = () => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const info = pageInfo[location.pathname] || { title: 'GhostMarket AI', description: '' }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <Topbar 
          title={info.title} 
          description={info.description} 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
        />
        <main className="flex-1 p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}

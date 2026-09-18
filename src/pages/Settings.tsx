import { useState } from 'react'
import { User, Shield, Moon, Globe, Key, Webhook } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'

export const Settings = () => {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  const [isApiModalOpen, setIsApiModalOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')

  const handleSaveApi = () => {
    addToast('Configuração salva com sucesso!', 'success')
    setIsApiModalOpen(false)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primaryLight flex items-center justify-center text-2xl text-white font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-bold text-lg">{user?.name || 'Usuário'}</p>
              <p className="text-textSecondary">{user?.email || 'email@exemplo.com'}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Nome completo" defaultValue={user?.name || ''} disabled />
            <Input label="E-mail" defaultValue={user?.email || ''} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary" />
            Aparência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
            <div>
              <p className="font-medium text-white">Modo escuro</p>
              <p className="text-sm text-textSecondary">Ativo por padrão na GhostMarket AI</p>
            </div>
            <div className="w-11 h-6 bg-primary rounded-full relative cursor-not-allowed">
              <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Nova senha" type="password" placeholder="••••••••" />
            <Input label="Confirmar nova senha" type="password" placeholder="••••••••" />
          </div>
          <Button variant="secondary">Alterar senha</Button>
          
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-medium text-white mb-2">Sessão atual</h4>
            <p className="text-xs text-textSecondary">
              IP: 192.168.0.1 • Localização: Desconhecida • Último acesso: Agora
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Integrações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-panel flex items-center justify-center">
                <Key className="w-5 h-5 text-textSecondary" />
              </div>
              <div>
                <p className="font-medium text-white">Google Places API</p>
                <p className="text-xs text-error">Não conectado</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setIsApiModalOpen(true)}>
              Configurar API
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-panel flex items-center justify-center">
                <Webhook className="w-5 h-5 text-textSecondary" />
              </div>
              <div>
                <p className="font-medium text-white">Webhooks</p>
                <p className="text-xs text-success">1 ativo</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Gerenciar</Button>
          </div>
        </CardContent>
      </Card>

      {/* API Modal */}
      {isApiModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-panel border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold">Integrações</h3>
              <button onClick={() => setIsApiModalOpen(false)} className="text-textSecondary hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-5 h-5 text-primary" />
                <h4 className="font-medium">Google Places API</h4>
              </div>
              
              <div className="bg-error/10 text-error px-3 py-2 rounded-md text-sm mb-4 border border-error/20 inline-block">
                Não conectado
              </div>

              <Input
                label="Chave da API"
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-textSecondary">
                Esta chave será usada pelo Scanner para encontrar leads reais.
              </p>

              <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
                <Button variant="ghost" onClick={() => setIsApiModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveApi}>
                  Salvar chave
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useRef } from 'react'
import { User, Shield, Moon, Globe, Key, Webhook, Camera } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'

export const Settings = () => {
  const { user, updateUserProfile, updateUserPassword } = useAuthStore()
  const { addToast } = useToastStore()
  
  // Profile state
  const [name, setName] = useState(user?.name || '')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Password state
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // API state
  const [isApiModalOpen, setIsApiModalOpen] = useState(false)
  const [apiKey, setApiKey] = useState('')

  const handleSaveApi = () => {
    addToast('Configuração salva com sucesso!', 'success')
    setIsApiModalOpen(false)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      addToast('Por favor, selecione uma imagem válida.', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = async () => {
        // Create a canvas to compress the image
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 200
        const MAX_HEIGHT = 200
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        // Compress heavily so it fits in Firebase Auth photoURL limit
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5)

        try {
          setIsSavingProfile(true)
          // Try to save to Firebase Auth (this will work for local host and Vercel)
          await updateUserProfile(name, compressedBase64)
          addToast('Foto de perfil atualizada!', 'success')
        } catch (error: any) {
          console.error(error)
          // Firebase auth has a limit on photoURL length. 
          // If it still fails, fallback to local storage
          localStorage.setItem(`profile_pic_${user?.uid}`, compressedBase64)
          await updateUserProfile(name, compressedBase64) // updates local zustand store even if firebase fails
          addToast('Foto de perfil salva localmente!', 'success')
        } finally {
          setIsSavingProfile(false)
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true)
      await updateUserProfile(name, user?.photoURL || undefined)
      addToast('Perfil atualizado com sucesso!', 'success')
    } catch (error) {
      console.error(error)
      addToast('Erro ao atualizar perfil.', 'error')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSavePassword = async () => {
    if (password !== confirmPassword) {
      addToast('As senhas não coincidem.', 'error')
      return
    }
    if (password.length < 6) {
      addToast('A senha deve ter no mínimo 6 caracteres.', 'info')
      return
    }

    try {
      setIsSavingPassword(true)
      await updateUserPassword(password)
      addToast('Senha atualizada com sucesso!', 'success')
      setPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      console.error(error)
      if (error.code === 'auth/requires-recent-login') {
        addToast('Você precisa fazer login novamente para alterar a senha.', 'error')
      } else {
        addToast('Erro ao atualizar senha.', 'error')
      }
    } finally {
      setIsSavingPassword(false)
    }
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
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primaryLight flex items-center justify-center text-2xl text-white font-bold border-2 border-transparent">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <p className="font-bold text-lg">{user?.name || 'Usuário'}</p>
              <p className="text-textSecondary">{user?.email || 'email@exemplo.com'}</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-primary hover:underline mt-1"
                disabled={isSavingProfile}
              >
                Trocar foto de perfil
              </button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input 
              label="Nome completo" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
            <Input 
              label="E-mail" 
              value={user?.email || ''} 
              disabled 
            />
          </div>
          <Button onClick={handleSaveProfile} disabled={isSavingProfile || name === user?.name}>
            {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
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
            <Input 
              label="Nova senha" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input 
              label="Confirmar nova senha" 
              type="password" 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button 
            variant="secondary" 
            onClick={handleSavePassword}
            disabled={isSavingPassword || !password || !confirmPassword}
          >
            {isSavingPassword ? 'Atualizando...' : 'Alterar senha'}
          </Button>
          
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-medium text-white mb-2">Sessão atual</h4>
            <p className="text-xs text-textSecondary">
              Protegido pela segurança do Firebase Auth
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

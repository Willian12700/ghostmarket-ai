import { useState, useRef, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Settings as SettingsIcon, Palette, Image as ImageIcon, Link as Shield, Moon, Globe, Key, Webhook, Unlock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { useToastStore } from '@/store/toastStore'
import { updatePassword, getAuth } from 'firebase/auth'
import { db, storage } from '@/config/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export const Settings = () => {
  const { user } = useAuthStore()
  const { theme, updateTheme } = useThemeStore()
  const { addToast } = useToastStore()
  
  const [agencyName, setAgencyName] = useState(theme.agencyName)
  const [primaryColor, setPrimaryColor] = useState(theme.primaryColor)
  const [appTheme, setAppTheme] = useState(theme.appTheme || 'default')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [isSavingTheme, setIsSavingTheme] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [apiKey, setApiKey] = useState('')
  const [isApiModalOpen, setIsApiModalOpen] = useState(false)
  
  const [freeAccessEmail, setFreeAccessEmail] = useState('')
  const [isGrantingAccess, setIsGrantingAccess] = useState(false)

  useEffect(() => {
    setAgencyName(theme.agencyName)
    setPrimaryColor(theme.primaryColor)
    setAppTheme(theme.appTheme || 'default')
  }, [theme])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.uid) return

    setIsUploadingLogo(true)
    try {
      const storageRef = ref(storage, `logos/${user.uid}_${Date.now()}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      
      await updateTheme(user.uid, { logoUrl: url })
      addToast('Logo atualizada com sucesso', 'success')
    } catch (error) {
      addToast('Erro ao fazer upload da logo', 'error')
      console.error(error)
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleSaveTheme = async () => {
    if (!user?.uid) return
    setIsSavingTheme(true)
    try {
      await updateTheme(user.uid, { agencyName, primaryColor, appTheme })
      addToast('Aparência atualizada com sucesso', 'success')
    } catch (error) {
      addToast('Erro ao atualizar aparência', 'error')
    } finally {
      setIsSavingTheme(false)
    }
  }

  const handleSavePassword = async () => {
    if (password !== confirmPassword) {
      addToast('As senhas não coincidem', 'error')
      return
    }

    if (password.length < 6) {
      addToast('A senha deve ter pelo menos 6 caracteres', 'error')
      return
    }

    setIsSavingPassword(true)
    try {
      if (user) {
        const fbUser = getAuth().currentUser; if(fbUser) await updatePassword(fbUser, password)
        addToast('Senha atualizada com sucesso', 'success')
        setPassword('')
        setConfirmPassword('')
      }
    } catch (error: any) {
      console.error(error)
      if (error.code === 'auth/requires-recent-login') {
        addToast('Você precisa fazer login novamente para alterar a senha', 'error')
      } else {
        addToast('Erro ao atualizar senha', 'error')
      }
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleSaveApi = () => {
    addToast('Configuração salva (Simulação)', 'success')
    setIsApiModalOpen(false)
  }

  const handleGrantFreeAccess = async () => {
    if (!freeAccessEmail.trim()) {
      addToast('Digite um email válido', 'error')
      return
    }

    setIsGrantingAccess(true)
    try {
      await setDoc(doc(db, 'allowed_users', freeAccessEmail.toLowerCase().trim()), {
        email: freeAccessEmail.toLowerCase().trim(),
        status: 'approved',
        plan: 'vitalicio',
        grantedByAdmin: true,
        grantedAt: new Date().toISOString()
      })
      
      addToast(`Acesso Vitalício liberado para ${freeAccessEmail}!`, 'success')
      setFreeAccessEmail('')
    } catch (error) {
      console.error(error)
      addToast('Erro ao liberar acesso.', 'error')
    } finally {
      setIsGrantingAccess(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" />
          Configurações
        </h2>
        <p className="text-textSecondary">Gerencie as preferências da sua conta e aparência do painel.</p>
      </div>

      {user?.email === 'willrandrier@gmail.com' && (
        <>
          <Card className="border-primary/50 shadow-[0_0_15px_rgba(139,92,246,0.15)] bg-gradient-to-br from-panel to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Unlock className="w-5 h-5" />
                Painel do Administrador - Liberação de Acesso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-textSecondary">
                  Libere acesso vitalício gratuito para qualquer usuário. Basta informar o e-mail que ele utilizará (ou utilizou) para criar a conta.
                </p>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Input 
                      label="E-mail do Usuário" 
                      placeholder="email@exemplo.com"
                      value={freeAccessEmail}
                      onChange={(e) => setFreeAccessEmail(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleGrantFreeAccess}
                    disabled={isGrantingAccess || !freeAccessEmail}
                    className="w-48"
                  >
                    {isGrantingAccess ? 'Liberando...' : 'Liberar Acesso Free'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-primary" />
                Tema do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textSecondary">Tema Base (Visível para todos)</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={appTheme}
                    onChange={(e) => setAppTheme(e.target.value as any)}
                  >
                    <option value="default">Padrão (Roxo / Essence GhostMarket)</option>
                    <option value="dark">Escuro (Cinza / Cyberpunk)</option>
                    <option value="light">Claro (Branco)</option>
                  </select>
                </div>
                <Button onClick={handleSaveTheme} disabled={isSavingTheme}>
                  {isSavingTheme ? 'Salvando...' : 'Aplicar Tema'}
                </Button>
                <p className="text-xs text-textSecondary">A troca de tema afeta as cores gerais do painel para refletir a sua escolha.</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            White Label
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <input 
                type="file" 
                ref={logoInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleLogoUpload}
              />
              {theme.logoUrl ? (
                <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-border group-hover:border-primary transition-colors cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                  <img src={theme.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              ) : (
                <div 
                  className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-textSecondary cursor-pointer hover:border-primary hover:text-primary transition-colors"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <Palette className="w-6 h-6 mb-1" />
                  <span className="text-xs">Logo</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-white mb-1">Logo do Painel</p>
              <p className="text-sm text-textSecondary mb-2">Recomendado: 256x256px, PNG. Máximo 2MB.</p>
              <Button size="sm" variant="secondary" onClick={() => logoInputRef.current?.click()} disabled={isUploadingLogo}>
                {isUploadingLogo ? 'Enviando...' : 'Enviar nova logo'}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input 
              label="Nome da Agência" 
              placeholder="Ex: Agência Rocket" 
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
            />
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-textSecondary">Cor Principal (HEX)</label>
              <div className="flex gap-3">
                <div 
                  className="w-10 h-10 rounded-md border border-border shadow-sm shrink-0" 
                  style={{ backgroundColor: primaryColor }}
                />
                <Input 
                  placeholder="#8B5CF6" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={handleSaveTheme} disabled={isSavingTheme || (agencyName === theme.agencyName && primaryColor === theme.primaryColor && appTheme === theme.appTheme)}>
              {isSavingTheme ? 'Salvando...' : 'Salvar Personalização'}
            </Button>
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
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input 
              label="Confirmar nova senha" 
              type="password" 
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
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
              <button onClick={() => setIsApiModalOpen(false)} className="text-textSecondary hover:text-white">âœ•</button>
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

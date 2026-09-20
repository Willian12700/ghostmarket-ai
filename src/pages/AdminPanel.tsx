import { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { ShieldAlert, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export const AdminPanel = () => {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  
  const [freeAccessEmail, setFreeAccessEmail] = useState('')
  const [isGrantingAccess, setIsGrantingAccess] = useState(false)

  // Double check admin protection
  if (user?.email !== 'willrandrier@gmail.com') {
    return <div className="text-white p-8">Acesso Negado. Esta área é restrita ao Administrador.</div>
  }

  const handleGrantFreeAccess = async () => {
    if (!freeAccessEmail.trim()) {
      addToast('Digite o email do usuário', 'error')
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
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-primary" />
          Painel de Administração
        </h2>
        <p className="text-textSecondary mt-2">Área restrita. Gerencie o sistema, controle acessos e permissões.</p>
      </div>

      <Card className="border-primary/50 shadow-[0_0_20px_rgba(139,92,246,0.15)] bg-gradient-to-br from-panel to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <UserCheck className="w-5 h-5" />
            Liberar Acesso (VIP / Grátis)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-textSecondary">
              Insira o email de um usuário para liberar acesso total à plataforma GhostMarket sem necessidade de assinatura.
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
                className="w-48 bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              >
                {isGrantingAccess ? 'Liberando...' : 'Liberar Acesso VIP'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Aqui vão entrar os futuros recursos do Painel ADM */}
      <div className="pt-8 text-center text-textSecondary border-t border-border border-dashed mt-8">
        Mais ferramentas de administração serão adicionadas aqui em breve.
      </div>
    </div>
  )
}

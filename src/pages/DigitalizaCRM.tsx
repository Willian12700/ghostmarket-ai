import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useDigitalizaStore, CRMStatus, CRMPriority } from '@/store/digitalizaStore'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'
import { useToastStore } from '@/store/toastStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

import { CRMDashboard } from '@/components/crm/CRMDashboard'
import { CRMKanban } from '@/components/crm/CRMKanban'
import { CRMTable } from '@/components/crm/CRMTable'
import { CRMAnalytics } from '@/components/crm/CRMAnalytics'
import { CRMLeadProfile } from '@/components/crm/CRMLeadProfile'

export const ALLOWED_EMAILS = [
  'oliveiramirandaisaac@gmail.com',
  'josehenrique9373@gmail.com',
  'kaios8252@gmail.com',
  'daviizcl.0003@gmail.com',
  'el6084905@gmail.com',
  'adrianodeoliveiracarneiro13@gmail.com',
  'caioqsilva09@gmail.com',
  'willrandrier@gmail.com'
]

export function DigitalizaCRM() {
  const { user } = useAuthStore()
  const { syncContracts, addContract } = useDigitalizaStore()
  const { addToast } = useToastStore()

  const [view, setView] = useState<'kanban' | 'table' | 'analytics'>('kanban')
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form data for new lead
  const [formData, setFormData] = useState({
    client: '',
    amount: '',
    phone: '',
    email: '',
    company: '',
    status: 'Novo' as CRMStatus,
    priority: 'media' as CRMPriority
  })

  useEffect(() => {
    const unsubscribe = syncContracts()
    return () => unsubscribe()
  }, [syncContracts])

  const handleSubmitNewLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.client) {
      addToast('Preencha o nome do contato!', 'error')
      return
    }

    try {
      await addContract({
        client: formData.client,
        amount: Number(formData.amount) || 0,
        phone: formData.phone,
        email: formData.email,
        company: formData.company,
        status: formData.status,
        priority: formData.priority,
        date: new Date().toISOString().split('T')[0],
        lastInteraction: new Date().toISOString(),
        addedByEmail: user?.email || 'Desconhecido',
        addedByName: (user as any)?.name || user?.email?.split('@')[0] || 'Desconhecido',
        history: [{
          id: Math.random().toString(36).substring(7),
          type: 'mudanca_status',
          content: 'Lead criado no CRM',
          date: new Date().toISOString()
        }]
      })
      
      addToast('Novo lead adicionado!', 'success')
      setIsModalOpen(false)
      setFormData({ client: '', amount: '', phone: '', email: '', company: '', status: 'Novo', priority: 'media' })
    } catch (error) {
      addToast('Erro ao salvar lead', 'error')
    }
  }

  if (!user?.email || !ALLOWED_EMAILS.includes(user.email.toLowerCase())) {
    return (
      <div className="flex-1 p-4 md:p-8 flex items-center justify-center relative min-h-[calc(100vh-64px)] overflow-hidden">
        <AnimatedBackground />
        <div className="text-center z-10 bg-surface/50 p-8 rounded-2xl border border-white/10 backdrop-blur-md">
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h2>
          <p className="text-textSecondary">Você não tem permissão para acessar o Centro de Comando Comercial.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] relative overflow-hidden bg-background">
      <AnimatedBackground />
      
      <CRMDashboard 
        view={view} 
        setView={setView} 
        onNewLead={() => setIsModalOpen(true)} 
      />

      <div className="flex-1 relative z-10 mt-2">
        {view === 'kanban' && <CRMKanban onSelectLead={setSelectedLeadId} />}
        {view === 'table' && <CRMTable onSelectLead={setSelectedLeadId} />}
        {view === 'analytics' && <CRMAnalytics />}
      </div>

      {selectedLeadId && (
        <CRMLeadProfile 
          leadId={selectedLeadId} 
          onClose={() => setSelectedLeadId(null)} 
        />
      )}

      {/* Modal Novo Lead */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-4">Novo Lead</h2>
            <form onSubmit={handleSubmitNewLead} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">Nome do Contato</label>
                <Input value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} placeholder="Ex: João Silva" autoFocus />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">Empresa</label>
                  <Input value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="Ex: Acme Corp" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">Valor Estimado (R$)</label>
                  <Input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="1500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">Email</label>
                  <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="joao@acme.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">Telefone / WhatsApp</label>
                  <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(11) 99999-9999" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">Status Inicial</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value as CRMStatus})}
                    className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-textPrimary outline-none focus:border-primary"
                  >
                    <option value="Novo">Novo Lead</option>
                    <option value="Contato">Em Contato</option>
                    <option value="Qualificado">Qualificado</option>
                    <option value="Proposta">Proposta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1">Prioridade</label>
                  <select 
                    value={formData.priority} 
                    onChange={e => setFormData({...formData, priority: e.target.value as CRMPriority})}
                    className="flex h-10 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-textPrimary outline-none focus:border-primary"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Adicionar Lead</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { collection, query, where, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useDigitalizaStore, CRMWorkspaceMember } from '@/store/digitalizaStore'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToastStore } from '@/store/toastStore'
import { Shield, User, UserMinus, ShieldAlert } from 'lucide-react'

export function CRMTeamManager() {
  const { activeWorkspace } = useDigitalizaStore()
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  const [members, setMembers] = useState<CRMWorkspaceMember[]>([])
  
  useEffect(() => {
    if (!activeWorkspace) return
    const q = query(collection(db, 'crm_workspace_members'), where('workspaceId', '==', activeWorkspace.id))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ms = snapshot.docs.map(doc => doc.data() as CRMWorkspaceMember)
      setMembers(ms)
    })
    return () => unsubscribe()
  }, [activeWorkspace])

  const currentUserMember = members.find(m => m.userId === user?.uid || m.userEmail === user?.email)
  const isOwnerOrAdmin = currentUserMember?.role === 'owner' || currentUserMember?.role === 'admin'

  const handlePromote = async (member: CRMWorkspaceMember, newRole: 'admin' | 'member') => {
    if (member.role === 'owner') return addToast('Não é possível alterar o dono', 'error')
    try {
      await updateDoc(doc(db, 'crm_workspace_members', member.id), { role: newRole })
      addToast(`Usuário atualizado para ${newRole}`, 'success')
    } catch (err) {
      addToast('Erro ao atualizar usuário', 'error')
    }
  }

  const handleRemove = async (member: CRMWorkspaceMember) => {
    if (member.role === 'owner') return addToast('Não é possível remover o dono', 'error')
    if (!window.confirm(`Remover ${member.userName} do workspace?`)) return
    try {
      await deleteDoc(doc(db, 'crm_workspace_members', member.id))
      addToast('Usuário removido', 'success')
    } catch (err) {
      addToast('Erro ao remover usuário', 'error')
    }
  }

  if (!activeWorkspace) return null

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciar Equipe</h2>
          <p className="text-textSecondary">Código de Convite: <span className="text-primary font-mono bg-primary/10 px-2 py-1 rounded">{activeWorkspace.inviteCode}</span></p>
        </div>
      </div>

      <div className="space-y-4">
        {members.map(member => (
          <Card key={member.id} className="p-4 flex items-center justify-between border-white/5 bg-surface/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {member.userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium flex items-center gap-2">
                  {member.userName}
                  {member.role === 'owner' && <ShieldAlert className="w-4 h-4 text-yellow-500" />}
                  {member.role === 'admin' && <Shield className="w-4 h-4 text-blue-400" />}
                  {member.role === 'member' && <User className="w-4 h-4 text-textSecondary" />}
                </p>
                <p className="text-sm text-textSecondary">{member.userEmail}</p>
              </div>
            </div>

            {isOwnerOrAdmin && member.id !== currentUserMember?.id && member.role !== 'owner' && (
              <div className="flex items-center gap-2">
                {member.role === 'member' ? (
                  <Button variant="secondary" size="sm" onClick={() => handlePromote(member, 'admin')}>Promover a Admin</Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => handlePromote(member, 'member')}>Rebaixar a Membro</Button>
                )}
                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => handleRemove(member)}>
                  <UserMinus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

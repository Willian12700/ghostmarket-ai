import { useState, useEffect, useMemo } from 'react'
import {
  GraduationCap,
  Search,
  Plus,
  Video,
  Layers,
  Filter,
  Film
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useTutorialStore } from '@/store/tutorialStore'
import { useToastStore } from '@/store/toastStore'
import { TutorialVideo, PREDEFINED_TUTORIAL_CATEGORIES } from '@/types/tutorial'
import { TutorialCard } from '@/components/tutorials/TutorialCard'
import { TutorialModalPlayer } from '@/components/tutorials/TutorialModalPlayer'
import { PublishTutorialModal } from '@/components/tutorials/PublishTutorialModal'

export const Tutorials = () => {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  const [searchParams] = useSearchParams()

  const {
    tutorials,
    isLoading,
    selectedCategory,
    searchQuery,
    activeVideoModal,
    fetchTutorials,
    deleteTutorial,
    setSelectedCategory,
    setSearchQuery,
    setActiveVideoModal
  } = useTutorialStore()

  const isAdmin = user?.email === 'willrandrier@gmail.com'

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [editingTutorial, setEditingTutorial] = useState<TutorialVideo | null>(null)

  // Carrega tutoriais ao montar
  useEffect(() => {
    fetchTutorials()
  }, [fetchTutorials])

  // Se a rota veio com ?action=new e for admin, abre o modal direto
  useEffect(() => {
    if (searchParams.get('action') === 'new' && isAdmin) {
      setIsPublishModalOpen(true)
    }
  }, [searchParams, isAdmin])

  // Lista única de categorias para as abas
  const availableCategories = useMemo(() => {
    const categoriesSet = new Set<string>()
    // Adiciona categorias com vídeos
    tutorials.forEach((t) => {
      if (t.category) categoriesSet.add(t.category)
    })
    // Adiciona as categorias pré-definidas para navegação limpa
    PREDEFINED_TUTORIAL_CATEGORIES.forEach((c) => categoriesSet.add(c.name))
    return Array.from(categoriesSet)
  }, [tutorials])

  // Filtra vídeos por busca e categoria
  const filteredTutorials = useMemo(() => {
    return tutorials.filter((tut) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        tut.category.toLowerCase() === selectedCategory.toLowerCase()

      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        tut.title.toLowerCase().includes(q) ||
        tut.description.toLowerCase().includes(q) ||
        tut.category.toLowerCase().includes(q)

      return matchesCategory && matchesSearch
    })
  }, [tutorials, selectedCategory, searchQuery])

  // Contagem por categoria
  const getCategoryCount = (catName: string) => {
    if (catName === 'all') return tutorials.length
    return tutorials.filter(
      (t) => t.category.toLowerCase() === catName.toLowerCase()
    ).length
  }

  const handleOpenPublish = () => {
    setEditingTutorial(null)
    setIsPublishModalOpen(true)
  }

  const handleOpenEdit = (tutorial: TutorialVideo) => {
    setEditingTutorial(tutorial)
    setIsPublishModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTutorial(id)
      addToast('Tutorial removido com sucesso!', 'success')
    } catch (err) {
      addToast('Erro ao remover tutorial.', 'error')
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-fade-in px-4 sm:px-6">
      {/* Top Banner / Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c0818] via-[#080512] to-[#040208] border border-purple-500/25 p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        {/* Ambient Glows */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span>Central de Treinamento & Tutoriais</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Domine Cada Ferramenta do <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-emerald-400">
                  Ghost Market AI
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
                Aulas práticas e objetivas explicando como prospectar clientes, gerar páginas com IA, automatizar propostas e fechar contratos comerciais.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-textSecondary">
              <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  <strong className="text-white">{tutorials.length}</strong> {tutorials.length === 1 ? 'Vídeo Publicado' : 'Vídeos Publicados'}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  <strong className="text-white">{availableCategories.length}</strong> Áreas de Conhecimento
                </span>
              </div>
            </div>
          </div>

          {/* Admin Publish Button */}
          {isAdmin && (
            <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
              <Button
                onClick={handleOpenPublish}
                className="bg-primary hover:bg-primaryLight text-white font-bold text-xs h-11 px-6 rounded-2xl flex items-center gap-2 shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Publicar Novo Vídeo</span>
              </Button>
              <span className="text-[10px] text-purple-300/80 font-mono">
                Visível apenas para seu e-mail de Administrador
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Search & Category Filter Navigation Bar */}
      <div className="space-y-4">
        {/* Search Input Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar tutoriais por nome, ferramenta ou palavra-chave..."
              className="w-full bg-[#0a0714] border border-white/10 focus:border-purple-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-textMuted focus:outline-none transition-colors shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-textSecondary shrink-0">
            <Filter className="w-3.5 h-3.5 text-purple-400" />
            <span>Filtrar por Ferramenta:</span>
          </div>
        </div>

        {/* Categories Pills - Horizontal Scrollable */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {/* Aba "Todas" */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                : 'bg-[#0a0714] border border-white/5 text-textSecondary hover:text-white hover:border-purple-500/30'
            }`}
          >
            <span>Todas as Ferramentas</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-textMuted'
              }`}
            >
              {getCategoryCount('all')}
            </span>
          </button>

          {/* Abas por ferramenta */}
          {availableCategories.map((catName) => {
            const count = getCategoryCount(catName)
            const isSelected = selectedCategory.toLowerCase() === catName.toLowerCase()

            return (
              <button
                key={catName}
                onClick={() => setSelectedCategory(catName)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                    : 'bg-[#0a0714] border border-white/5 text-textSecondary hover:text-white hover:border-purple-500/30'
                }`}
              >
                <span>{catName}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-textMuted'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Videos Grid / Content */}
      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-textSecondary">Carregando tutoriais...</p>
        </div>
      ) : filteredTutorials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutorials.map((tutorial) => (
            <TutorialCard
              key={tutorial.id}
              tutorial={tutorial}
              isAdmin={isAdmin}
              onPlay={(tut) => setActiveVideoModal(tut)}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#090614] border border-purple-500/20 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[350px] shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.2)]">
            <Video className="w-8 h-8" />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="text-lg font-bold text-white">
              {searchQuery || selectedCategory !== 'all'
                ? 'Nenhum vídeo encontrado nesta área'
                : 'Nenhum tutorial publicado ainda'}
            </h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              {searchQuery || selectedCategory !== 'all'
                ? 'Tente selecionar "Todas as Ferramentas" ou remover os termos da pesquisa.'
                : 'Os tutoriais serão disponibilizados aqui para que qualquer membro saiba operar 100% de cada ferramenta.'}
            </p>
          </div>

          {isAdmin ? (
            <Button
              onClick={handleOpenPublish}
              className="bg-primary hover:bg-primaryLight text-white font-bold text-xs h-10 px-5 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Primeiro Vídeo</span>
            </Button>
          ) : (
            selectedCategory !== 'all' && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedCategory('all')
                  setSearchQuery('')
                }}
                className="text-xs h-9 px-4 rounded-xl"
              >
                Ver Todas as Ferramentas
              </Button>
            )
          )}
        </div>
      )}

      {/* Video Cinema Player Modal */}
      <TutorialModalPlayer
        tutorial={activeVideoModal}
        onClose={() => setActiveVideoModal(null)}
      />

      {/* Admin Publish / Edit Modal */}
      {isAdmin && (
        <PublishTutorialModal
          isOpen={isPublishModalOpen}
          onClose={() => {
            setIsPublishModalOpen(false)
            setEditingTutorial(null)
          }}
          editingTutorial={editingTutorial}
          userEmail={user?.email || 'admin'}
        />
      )}
    </div>
  )
}

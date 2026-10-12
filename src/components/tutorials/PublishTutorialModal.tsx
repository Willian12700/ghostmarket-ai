import { useState, useEffect } from 'react'
import {
  X,
  Video,
  Sparkles,
  Link as LinkIcon,
  Layers,
  Clock,
  ArrowRight,
  Check,
  AlertCircle,
  Play
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TutorialVideo, PREDEFINED_TUTORIAL_CATEGORIES } from '@/types/tutorial'
import { extractYoutubeVideoId, getYoutubeThumbnail } from '@/utils/youtube'
import { useTutorialStore } from '@/store/tutorialStore'
import { useToastStore } from '@/store/toastStore'

interface PublishTutorialModalProps {
  isOpen: boolean
  onClose: () => void
  editingTutorial?: TutorialVideo | null
  userEmail: string
}

export const PublishTutorialModal = ({
  isOpen,
  onClose,
  editingTutorial,
  userEmail
}: PublishTutorialModalProps) => {
  const { addTutorial, updateTutorial } = useTutorialStore()
  const { addToast } = useToastStore()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(PREDEFINED_TUTORIAL_CATEGORIES[0].name)
  const [customCategory, setCustomCategory] = useState('')
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [description, setDescription] = useState('')
  const [toolRoute, setToolRoute] = useState(PREDEFINED_TUTORIAL_CATEGORIES[0].defaultRoute || '')
  const [duration, setDuration] = useState('')
  const [order, setOrder] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Preenche dados ao editar
  useEffect(() => {
    if (editingTutorial) {
      setTitle(editingTutorial.title)
      const foundPredefined = PREDEFINED_TUTORIAL_CATEGORIES.find(
        (c) => c.name.toLowerCase() === editingTutorial.category.toLowerCase()
      )
      if (foundPredefined) {
        setCategory(foundPredefined.name)
        setIsCustomCategory(false)
      } else {
        setIsCustomCategory(true)
        setCustomCategory(editingTutorial.category)
      }
      setYoutubeUrl(editingTutorial.youtubeUrl)
      setDescription(editingTutorial.description)
      setToolRoute(editingTutorial.toolRoute || '')
      setDuration(editingTutorial.duration || '')
      setOrder(editingTutorial.order || 1)
    } else {
      setTitle('')
      setCategory(PREDEFINED_TUTORIAL_CATEGORIES[0].name)
      setIsCustomCategory(false)
      setCustomCategory('')
      setYoutubeUrl('')
      setDescription('')
      setToolRoute(PREDEFINED_TUTORIAL_CATEGORIES[0].defaultRoute || '')
      setDuration('')
      setOrder(1)
    }
  }, [editingTutorial, isOpen])

  if (!isOpen) return null

  const detectedVideoId = extractYoutubeVideoId(youtubeUrl)
  const previewThumbnail = detectedVideoId ? getYoutubeThumbnail(detectedVideoId, 'hq') : null

  const handleCategorySelect = (selectedName: string) => {
    if (selectedName === 'custom') {
      setIsCustomCategory(true)
    } else {
      setIsCustomCategory(false)
      setCategory(selectedName)
      const found = PREDEFINED_TUTORIAL_CATEGORIES.find((c) => c.name === selectedName)
      if (found?.defaultRoute) {
        setToolRoute(found.defaultRoute)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      addToast('Informe o título do tutorial.', 'error')
      return
    }

    if (!detectedVideoId) {
      addToast('Informe um link válido do YouTube (pode ser vídeo não-listado).', 'error')
      return
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category.trim()
    if (!finalCategory) {
      addToast('Selecione ou digite uma área/categoria.', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingTutorial) {
        await updateTutorial(editingTutorial.id, {
          title: title.trim(),
          category: finalCategory,
          youtubeUrl: youtubeUrl.trim(),
          description: description.trim(),
          toolRoute: toolRoute.trim() || undefined,
          duration: duration.trim() || undefined,
          order: Number(order) || 1
        })
        addToast('Tutorial atualizado com sucesso!', 'success')
      } else {
        await addTutorial(
          {
            title: title.trim(),
            category: finalCategory,
            youtubeUrl: youtubeUrl.trim(),
            description: description.trim(),
            toolRoute: toolRoute.trim() || undefined,
            duration: duration.trim() || undefined,
            order: Number(order) || 1
          },
          userEmail
        )
        addToast('Novo tutorial publicado com sucesso na área de tutoriais!', 'success')
      }

      onClose()
    } catch (err: any) {
      addToast(err?.message || 'Erro ao salvar tutorial.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#090614] border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.9)] my-8">
        {/* Glow ambient */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-600/20 blur-[80px] pointer-events-none rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/10 blur-[80px] pointer-events-none rounded-full" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-emerald-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Video className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{editingTutorial ? 'Editar Vídeo Tutorial' : 'Publicar Novo Tutorial'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase font-mono">
                  Painel Admin
                </span>
              </h2>
              <p className="text-xs text-textSecondary">
                Adicione vídeos não listados do YouTube organizados por ferramenta
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-textSecondary hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-5 relative z-10">
          {/* 1. Título do Vídeo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Título do Tutorial</span>
              <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Como encontrar clientes qualificados com o Scanner de Leads 3D"
              className="w-full bg-[#040208] border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
            />
          </div>

          {/* 2. Área / Ferramenta (Categoria) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Ferramenta / Área</span>
              </label>
              <select
                value={isCustomCategory ? 'custom' : category}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full bg-[#040208] border border-white/10 focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-colors"
              >
                {PREDEFINED_TUTORIAL_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name} className="bg-[#090614] text-white">
                    {cat.name}
                  </option>
                ))}
                <option value="custom" className="bg-[#090614] text-purple-300 font-bold">
                  + Outra Área Personalizada...
                </option>
              </select>
            </div>

            {/* Rota Interna da Ferramenta */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                <span>Link Direto da Ferramenta</span>
              </label>
              <input
                type="text"
                value={toolRoute}
                onChange={(e) => setToolRoute(e.target.value)}
                placeholder="Ex: /scanner ou /builder"
                className="w-full bg-[#040208] border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Categoria Customizada se ativada */}
          {isCustomCategory && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Digite o Nome da Nova Área / Categoria:
              </label>
              <input
                type="text"
                required
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Ex: Fechamento de Vendas X1"
                className="w-full bg-[#040208] border border-purple-500/40 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>
          )}

          {/* 3. Link do Vídeo do YouTube */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>Link do Vídeo do YouTube (Não Listado ou Público)</span>
                <span className="text-purple-400">*</span>
              </span>
              {detectedVideoId && (
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <Check className="w-3 h-3" /> ID: {detectedVideoId}
                </span>
              )}
            </label>
            <input
              type="text"
              required
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Cole o link do YouTube (Ex: https://youtu.be/XyZ123 ou https://youtube.com/watch?v=...)"
              className="w-full bg-[#040208] border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors font-mono"
            />
            <p className="text-[11px] text-textMuted">
              Dica: Grave a tela explicando como mexer na ferramenta, suba no YouTube como <strong>"Não Listado"</strong> e cole o link de compartilhamento aqui.
            </p>
          </div>

          {/* Live Preview do Vídeo */}
          {detectedVideoId ? (
            <div className="p-3 bg-[#040208] border border-purple-500/30 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shrink-0 group">
                {previewThumbnail ? (
                  <img
                    src={previewThumbnail}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback se maxresdefault não carregar
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${detectedVideoId}/hqdefault.jpg`
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-950/30">
                    <Video className="w-6 h-6 text-purple-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-purple-600/90 flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-left w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Vídeo Reconhecido com Sucesso
                </span>
                <p className="text-xs text-white font-semibold line-clamp-1">
                  {title || 'Título do tutorial'}
                </p>
                <p className="text-[11px] text-textMuted">
                  O vídeo será reproduzido em alta definição na área de tutoriais.
                </p>
              </div>
            </div>
          ) : youtubeUrl.trim().length > 5 ? (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Link inválido. Cole a URL completa do YouTube ou o link curto youtu.be.</span>
            </div>
          ) : null}

          {/* 4. Descrição / Dicas do Tutorial */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider">
              Descrição e Instruções (O que o usuário vai aprender)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Nesse vídeo de 5 minutos você vai aprender o passo a passo para escanear comércios da sua cidade, filtrar os que não tem site e mandar proposta..."
              className="w-full bg-[#040208] border border-white/10 focus:border-purple-500 rounded-xl p-3 text-xs text-white focus:outline-none transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* 5. Duração e Ordem */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Duração (Opcional)</span>
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ex: 06:45 ou 7 min"
                className="w-full bg-[#040208] border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Ordem / Posição
              </label>
              <input
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                placeholder="1"
                className="w-full bg-[#040208] border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs h-10 px-4 rounded-xl"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !detectedVideoId}
              className="bg-primary hover:bg-primaryLight text-white font-bold text-xs h-10 px-6 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Salvando Tutorial...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{editingTutorial ? 'Salvar Alterações' : 'Publicar Tutorial'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

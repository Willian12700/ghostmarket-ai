import { useEffect } from 'react'
import {
  X,
  Layers,
  Clock,
  ArrowRight,
  Share2,
  Check
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { TutorialVideo } from '@/types/tutorial'
import { getYoutubeEmbedUrl } from '@/utils/youtube'
import { useToastStore } from '@/store/toastStore'

interface TutorialModalPlayerProps {
  tutorial: TutorialVideo | null
  onClose: () => void
}

export const TutorialModalPlayer = ({
  tutorial,
  onClose
}: TutorialModalPlayerProps) => {
  const navigate = useNavigate()
  const { addToast } = useToastStore()
  const [copied, setCopied] = useState(false)

  // Tecla Escape para fechar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!tutorial) return null

  const embedUrl = getYoutubeEmbedUrl(tutorial.youtubeVideoId, true)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tutorial.youtubeUrl)
    setCopied(true)
    addToast('Link do vídeo copiado para a área de transferência!', 'success')
    setTimeout(() => setCopied(false), 2500)
  }

  const handleNavigateToTool = () => {
    if (!tutorial.toolRoute) return
    onClose()
    navigate(tutorial.toolRoute)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#090614] border border-purple-500/30 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden my-6 flex flex-col">
        {/* Glow ambient */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-600/20 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />

        {/* Header Bar */}
        <div className="bg-[#05030a] border-b border-white/10 px-5 py-3.5 flex items-center justify-between gap-3 relative z-10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
              {tutorial.category}
            </span>
            <h3 className="text-sm font-bold text-white truncate">
              {tutorial.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              title="Copiar Link do Vídeo"
              className="p-2 rounded-xl text-textSecondary hover:text-white hover:bg-white/5 transition-colors text-xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Compartilhar'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-textSecondary hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player 16:9 Iframe */}
        <div className="relative w-full aspect-video bg-black shrink-0">
          <iframe
            src={embedUrl}
            title={tutorial.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>

        {/* Video Info & Action Section */}
        <div className="p-5 sm:p-6 space-y-4 bg-[#080512] relative z-10 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                {tutorial.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-textSecondary mt-1">
                <span className="flex items-center gap-1 text-purple-300">
                  <Layers className="w-3.5 h-3.5" />
                  {tutorial.category}
                </span>
                {tutorial.duration && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-textMuted">
                      <Clock className="w-3.5 h-3.5" />
                      {tutorial.duration}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Direct Tool Shortcut */}
            {tutorial.toolRoute && (
              <Button
                onClick={handleNavigateToTool}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs h-10 px-5 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0"
              >
                <span>Abrir Ferramenta no SaaS</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </Button>
            )}
          </div>

          {/* Description Box */}
          {tutorial.description && (
            <div className="p-4 bg-[#040208] border border-white/5 rounded-2xl text-xs text-textSecondary leading-relaxed whitespace-pre-wrap">
              {tutorial.description}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

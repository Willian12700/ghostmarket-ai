import { useState } from 'react'
import {
  Play,
  Clock,
  ExternalLink,
  Edit2,
  Trash2,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TutorialVideo } from '@/types/tutorial'
import { getYoutubeThumbnail } from '@/utils/youtube'

interface TutorialCardProps {
  tutorial: TutorialVideo
  isAdmin: boolean
  onPlay: (tutorial: TutorialVideo) => void
  onEdit: (tutorial: TutorialVideo) => void
  onDelete: (id: string) => void
}

export const TutorialCard = ({
  tutorial,
  isAdmin,
  onPlay,
  onEdit,
  onDelete
}: TutorialCardProps) => {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const thumbnailUrl = !imgError && tutorial.youtubeVideoId
    ? getYoutubeThumbnail(tutorial.youtubeVideoId, 'hq')
    : null

  const handleNavigateToTool = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (tutorial.toolRoute) {
      navigate(tutorial.toolRoute)
    }
  }

  return (
    <div
      onClick={() => onPlay(tutorial)}
      className="group relative bg-[#090614] border border-purple-500/20 hover:border-purple-500/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-[0_15px_40px_rgba(139,92,246,0.15)] transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* 16:9 Thumbnail Box */}
      <div className="relative aspect-video w-full bg-black overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={tutorial.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-950/40 to-black flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
        )}

        {/* Ambient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090614] via-black/20 to-transparent" />

        {/* Category Pill Top Left */}
        <div className="absolute top-3 left-3 z-10">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-purple-300 border border-purple-500/30 shadow-md">
            {tutorial.category}
          </span>
        </div>

        {/* Duration Pill Bottom Right */}
        {tutorial.duration && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-white/90 border border-white/10 flex items-center gap-1 shadow-md">
              <Clock className="w-3 h-3 text-purple-400" />
              {tutorial.duration}
            </span>
          </div>
        )}

        {/* Center Glowing Play Button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/90 group-hover:bg-purple-500 text-white flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.5)] group-hover:scale-110 transition-all duration-300 border border-white/20">
            <Play className="w-5 h-5 fill-white text-white ml-0.5" />
          </div>
        </div>

        {/* Admin Actions Overlay Top Right */}
        {isAdmin && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-1"
          >
            <button
              onClick={() => onEdit(tutorial)}
              title="Editar Tutorial"
              className="p-1.5 rounded-lg text-textSecondary hover:text-white hover:bg-white/10 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {confirmDelete ? (
              <button
                onClick={() => onDelete(tutorial.id)}
                title="Confirmar Exclusão"
                className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold transition-colors animate-pulse"
              >
                Confirmar?
              </button>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                title="Excluir Tutorial"
                className="p-1.5 rounded-lg text-textSecondary hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
            {tutorial.title}
          </h3>

          {tutorial.description && (
            <p className="text-xs text-textSecondary line-clamp-2 leading-relaxed">
              {tutorial.description}
            </p>
          )}
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-purple-400 group-hover:text-purple-300 flex items-center gap-1">
            <span>Assistir Tutorial</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>

          {tutorial.toolRoute && (
            <button
              onClick={handleNavigateToTool}
              title={`Ir para ${tutorial.category}`}
              className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-[10px] text-textSecondary hover:text-white border border-white/5 transition-colors flex items-center gap-1 shrink-0"
            >
              <span>Abrir Ferramenta</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

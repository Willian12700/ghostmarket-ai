import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Play,
  Copy,
  Check,
  Share2,
  Trash2,
  Edit3,
  Globe,
  Lock,
  Eye,
  Film,
  ExternalLink,
  AlertTriangle
} from 'lucide-react'
import { VideoItem } from '@/types/video'
import { formatFileSize, formatDuration } from '@/utils/videoProcessor'
import { useToastStore } from '@/store/toastStore'
import { useVideoStore } from '@/store/videoStore'
import { Button } from '@/components/ui/Button'

interface VideoCardProps {
  video: VideoItem
  onPlay: (video: VideoItem) => void
  onShare: (video: VideoItem) => void
}

export const VideoCard = ({ video, onPlay, onShare }: VideoCardProps) => {
  const { addToast } = useToastStore()
  const { updateVideoTitle, toggleVideoPrivacy, deleteVideo } = useVideoStore()

  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(video.title)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const shareUrl = `${window.location.origin}/v/${video.id}`

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    addToast('Link do vídeo copiado!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveTitle = async () => {
    if (!editedTitle.trim()) return
    try {
      await updateVideoTitle(video.id, editedTitle)
      setIsEditing(false)
      addToast('Título atualizado!', 'success')
    } catch {
      addToast('Erro ao atualizar título.', 'error')
    }
  }

  const handleTogglePrivacy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await toggleVideoPrivacy(video.id, video.isPublic)
      addToast(
        !video.isPublic ? 'Vídeo agora é público!' : 'Vídeo agora é privado!',
        'success'
      )
    } catch {
      addToast('Erro ao alterar privacidade.', 'error')
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteVideo(video)
      addToast('Vídeo excluído com sucesso!', 'success')
    } catch {
      addToast('Erro ao excluir vídeo.', 'error')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="group bg-[#0b0816] hover:bg-[#0e0a1c] border border-purple-500/15 hover:border-purple-500/40 rounded-2xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-[0_10px_35px_rgba(139,92,246,0.15)] flex flex-col"
      >
        {/* Thumbnail Box */}
        <div
          onClick={() => onPlay(video)}
          className="relative aspect-video bg-[#05030a] cursor-pointer overflow-hidden border-b border-white/5 flex items-center justify-center group/thumb"
        >
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#120a26] to-[#05030a] text-purple-400">
              <Film className="w-10 h-10 opacity-40 mb-1" />
              <span className="text-[10px] text-textMuted uppercase font-mono tracking-wider">Sem miniatura</span>
            </div>
          )}

          {/* Hover Play Button Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/90 text-white flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.8)] scale-90 group-hover/thumb:scale-100 transition-transform">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>

          {/* Duration Badge */}
          {video.duration > 0 && (
            <span className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shadow-md">
              {formatDuration(video.duration)}
            </span>
          )}

          {/* Privacy Badge */}
          <button
            onClick={handleTogglePrivacy}
            className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 backdrop-blur-md shadow-md transition-all ${
              video.isPublic
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30'
            }`}
            title="Clique para alternar privacidade"
          >
            {video.isPublic ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
            <span>{video.isPublic ? 'Público' : 'Privado'}</span>
          </button>
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            {isEditing ? (
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="flex-1 bg-surface border border-purple-500 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1 rounded bg-purple-600 text-white text-xs hover:bg-purple-500"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <h4
                  onClick={() => onPlay(video)}
                  className="text-sm font-bold text-white hover:text-purple-300 transition-colors cursor-pointer line-clamp-1"
                  title={video.title}
                >
                  {video.title}
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditing(true)
                  }}
                  className="text-textMuted hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  title="Renomear"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-textSecondary mt-2">
              <span className="font-mono">{formatFileSize(video.size)}</span>
              <span className="flex items-center gap-1 font-mono">
                <Eye className="w-3 h-3 text-textMuted" />
                {video.views || 0} views
              </span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1">
            <Button
              variant="secondary"
              onClick={handleCopyLink}
              className="flex-1 text-[11px] font-bold h-8 px-2.5 rounded-lg flex items-center justify-center gap-1.5 border-border/70"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copiado' : 'Link'}</span>
            </Button>

            <Button
              variant="secondary"
              onClick={() => onShare(video)}
              className="text-[11px] font-bold h-8 px-2.5 rounded-lg flex items-center justify-center gap-1.5 border-border/70"
              title="Opções de compartilhamento"
            >
              <Share2 className="w-3 h-3" />
            </Button>

            <Button
              variant="secondary"
              onClick={() => window.open(shareUrl, '_blank')}
              className="text-[11px] font-bold h-8 px-2.5 rounded-lg flex items-center justify-center gap-1.5 border-border/70"
              title="Abrir página do vídeo"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>

            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-[11px] font-bold h-8 px-2.5 rounded-lg flex items-center justify-center"
              title="Excluir vídeo"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full bg-[#0d0918] border border-red-500/30 rounded-2xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">Excluir Vídeo Permanentemente?</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Tem certeza que deseja excluir <strong>"{video.title}"</strong>? O arquivo será removido do armazenamento e o link deixará de funcionar.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="text-xs font-bold h-9 px-4 rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
                className="text-xs font-bold h-9 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white"
              >
                Sim, Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

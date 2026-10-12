import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Download,
  Share2,
  Globe,
  Lock,
  Eye,
  Film
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { VideoItem } from '@/types/video'
import { formatFileSize, formatDuration } from '@/utils/videoProcessor'
import { useToastStore } from '@/store/toastStore'

interface VideoPlayerModalProps {
  video: VideoItem | null
  isOpen: boolean
  onClose: () => void
  onShareClick?: (video: VideoItem) => void
}

export const VideoPlayerModal = ({
  video,
  isOpen,
  onClose,
  onShareClick
}: VideoPlayerModalProps) => {
  const { addToast } = useToastStore()
  const [copied, setCopied] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  if (!isOpen || !video) return null

  const shareUrl = `${window.location.origin}/v/${video.id}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    addToast('Link público copiado!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-[#080512] border border-purple-500/20 rounded-3xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.9)] flex flex-col"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0b0818]/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Film className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">{video.title}</h3>
              <p className="text-[11px] text-textSecondary font-mono truncate">{video.originalFileName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-textSecondary hover:text-white hover:bg-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={video.downloadUrl}
            poster={video.thumbnailUrl}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          >
            Seu navegador não suporta a reprodução deste formato de vídeo.
          </video>
        </div>

        {/* Footer info & actions */}
        <div className="p-6 bg-[#06040d] border-t border-white/5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-textSecondary">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${video.isPublic ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                {video.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                <span>{video.isPublic ? 'Público' : 'Privado'}</span>
              </span>

              <span>• Duração: <strong className="text-white font-mono">{formatDuration(video.duration)}</strong></span>
              <span>• Tamanho: <strong className="text-white font-mono">{formatFileSize(video.size)}</strong></span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <strong className="text-white font-mono">{video.views || 0}</strong> views
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={handleCopyLink}
                className="text-xs font-bold h-10 px-4 rounded-xl flex items-center gap-2 border-border/80"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar Link'}</span>
              </Button>

              {onShareClick && (
                <Button
                  variant="secondary"
                  onClick={() => onShareClick(video)}
                  className="text-xs font-bold h-10 px-4 rounded-xl flex items-center gap-2 border-border/80"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartilhar</span>
                </Button>
              )}

              <Button
                variant="secondary"
                onClick={() => window.open(shareUrl, '_blank')}
                className="text-xs font-bold h-10 px-4 rounded-xl flex items-center gap-2 border-border/80"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Página Completa</span>
              </Button>

              <a
                href={video.downloadUrl}
                download={video.originalFileName}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  className="bg-primary hover:bg-primaryLight text-white text-xs font-bold h-10 px-4 rounded-xl flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

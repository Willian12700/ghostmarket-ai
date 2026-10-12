import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  Copy,
  Check,
  Share2,
  Code,
  Globe,
  Lock,
  MessageCircle,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { VideoItem } from '@/types/video'
import { useToastStore } from '@/store/toastStore'
import { useVideoStore } from '@/store/videoStore'

interface VideoShareModalProps {
  video: VideoItem | null
  isOpen: boolean
  onClose: () => void
}

export const VideoShareModal = ({ video, isOpen, onClose }: VideoShareModalProps) => {
  const { addToast } = useToastStore()
  const { toggleVideoPrivacy } = useVideoStore()
  const [copiedType, setCopiedType] = useState<string | null>(null)

  if (!isOpen || !video) return null

  const shareUrl = `${window.location.origin}/v/${video.id}`
  const embedCode = `<iframe src="${shareUrl}" width="100%" height="450" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    addToast('Copiado para a área de transferência!', 'success')
    setTimeout(() => setCopiedType(null), 2000)
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Assista ao vídeo "${video.title}": ${shareUrl}`)
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  const handleTelegramShare = () => {
    const url = encodeURIComponent(shareUrl)
    const text = encodeURIComponent(`Assista ao vídeo "${video.title}"`)
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank')
  }

  const handleTogglePrivacy = async () => {
    try {
      await toggleVideoPrivacy(video.id, video.isPublic)
      addToast(
        !video.isPublic ? 'Vídeo agora está público!' : 'Vídeo agora está privado!',
        'success'
      )
    } catch {
      addToast('Erro ao atualizar privacidade.', 'error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#0a0714] border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Compartilhar Vídeo</h3>
              <p className="text-xs text-textSecondary truncate max-w-xs">{video.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-textSecondary hover:text-white hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Privacy status banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#06040d] border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${video.isPublic ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'}`}>
                {video.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Status: {video.isPublic ? 'Público' : 'Privado'}
                </p>
                <p className="text-[10px] text-textSecondary">
                  {video.isPublic ? 'Qualquer um com o link pode assistir' : 'Apenas você pode assistir'}
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={handleTogglePrivacy}
              className="text-xs font-bold h-8 px-3 rounded-lg border-border"
            >
              Tornar {video.isPublic ? 'Privado' : 'Público'}
            </Button>
          </div>

          {/* Share Link */}
          <div>
            <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider block mb-1.5">
              Link de Reprodução Oficial
            </label>
            <div className="flex items-center gap-2 p-1.5 bg-[#05030a] border border-purple-500/30 rounded-xl">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent border-none text-xs text-white px-2.5 focus:outline-none truncate font-mono"
              />
              <Button
                onClick={() => handleCopy(shareUrl, 'page')}
                className="bg-primary hover:bg-primaryLight text-white font-bold text-xs h-9 px-3.5 rounded-lg flex items-center gap-1.5 shrink-0"
              >
                {copiedType === 'page' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'page' ? 'Copiado' : 'Copiar'}</span>
              </Button>
            </div>
          </div>

          {/* Embed Code */}
          <div>
            <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider block mb-1.5">
              Código Embed (Para Sites e Landing Pages)
            </label>
            <div className="flex items-center gap-2 p-1.5 bg-[#05030a] border border-white/10 rounded-xl">
              <input
                type="text"
                readOnly
                value={embedCode}
                className="flex-1 bg-transparent border-none text-xs text-textSecondary px-2.5 focus:outline-none truncate font-mono"
              />
              <Button
                variant="secondary"
                onClick={() => handleCopy(embedCode, 'embed')}
                className="text-xs font-bold h-9 px-3.5 rounded-lg flex items-center gap-1.5 shrink-0 border-border"
              >
                {copiedType === 'embed' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5" />}
                <span>{copiedType === 'embed' ? 'Copiado' : 'Copiar'}</span>
              </Button>
            </div>
          </div>

          {/* Social Quick Share */}
          <div>
            <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider block mb-2">
              Envio Rápido
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-400/20" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleTelegramShare}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Telegram</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
              className="text-xs font-bold h-10 px-5 rounded-xl border-border"
            >
              Fechar
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

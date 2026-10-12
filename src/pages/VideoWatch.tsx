import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Film,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Share2,
  Copy,
  Check,
  Download,
  Lock,
  Globe,
  Eye,
  Ghost,
  MessageCircle,
  Send
} from 'lucide-react'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/store/authStore'
import { VideoItem } from '@/types/video'
import { formatFileSize, formatDuration } from '@/utils/videoProcessor'
import { Button } from '@/components/ui/Button'
import { useToastStore } from '@/store/toastStore'

export const VideoWatch = () => {
  const { videoId } = useParams<{ videoId: string }>()
  const { user } = useAuthStore()
  const { addToast } = useToastStore()

  const [video, setVideo] = useState<VideoItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [copiedEmbed, setCopiedEmbed] = useState(false)

  // Player state
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<any>(null)

  const isAdmin = user?.email === 'willrandrier@gmail.com'

  useEffect(() => {
    const fetchVideo = async () => {
      if (!videoId) {
        setNotFound(true)
        setLoading(false)
        return
      }

      try {
        const docRef = doc(db, 'videos', videoId)
        const snap = await getDoc(docRef)

        if (!snap.exists()) {
          setNotFound(true)
          setLoading(false)
          return
        }

        const data = { ...snap.data(), id: snap.id } as VideoItem
        setVideo(data)

        // Incrementa contagem de visualizações apenas 1 vez por sessão de navegador
        const sessionKey = `viewed_${videoId}`
        if (!sessionStorage.getItem(sessionKey)) {
          sessionStorage.setItem(sessionKey, '1')
          updateDoc(docRef, { views: increment(1) }).catch(() => {})
        }
      } catch (err) {
        console.error('Erro ao carregar vídeo:', err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [videoId])

  // Player controls handler
  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (!videoRef.current) return
    videoRef.current.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (videoRef.current) {
      videoRef.current.volume = val
      videoRef.current.muted = val === 0
      setIsMuted(val === 0)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    const nextMute = !isMuted
    videoRef.current.muted = nextMute
    setIsMuted(nextMute)
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
  }

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true)
    clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 2500)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      } else if (e.code === 'KeyM') {
        toggleMute()
      } else if (e.code === 'KeyF') {
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, isMuted])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    addToast('Link público copiado com sucesso!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050308] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-textSecondary font-mono tracking-wider uppercase">Carregando player seguro...</p>
        </div>
      </div>
    )
  }

  if (notFound || !video) {
    return (
      <div className="min-h-screen bg-[#050308] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#0a0714] border border-purple-500/20 rounded-3xl p-8 space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <Film className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Vídeo Não Encontrado</h2>
          <p className="text-xs text-textSecondary leading-relaxed">
            O link pode ter expirado, o vídeo foi removido ou o código informado está incorreto.
          </p>
          <Link to="/">
            <Button className="w-full mt-2 bg-primary hover:bg-primaryLight text-white text-xs font-bold h-11 rounded-xl">
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Verificação de privacidade
  const isOwner = user?.uid === video.userId || isAdmin
  if (!video.isPublic && !isOwner) {
    return (
      <div className="min-h-screen bg-[#050308] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#0a0714] border border-purple-500/20 rounded-3xl p-8 space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(139,92,246,0.25)]">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Vídeo Privado</h2>
          <p className="text-xs text-textSecondary leading-relaxed">
            O proprietário deste conteúdo restringiu o acesso. Para assistir a este vídeo, você precisa estar conectado na conta autorizada.
          </p>
          <Link to={`/login?redirect=/v/${video.id}`}>
            <Button className="w-full mt-2 bg-primary hover:bg-primaryLight text-white text-xs font-bold h-11 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              Entrar na Minha Conta
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const shareUrl = window.location.href
  const embedCode = `<iframe src="${shareUrl}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`

  return (
    <div className="min-h-screen bg-[#050308] text-white selection:bg-purple-500/30 flex flex-col">
      {/* Top Navigation */}
      <header className="h-16 border-b border-white/5 bg-[#080510]/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-accent flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)]">
            <Ghost className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-lg tracking-tight text-white">
            GhostMarket <span className="text-purple-400 font-mono text-xs">Video</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="secondary"
            onClick={handleCopyLink}
            className="text-xs font-bold h-9 px-3.5 rounded-xl border-border/80 flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar Link'}</span>
          </Button>

          <Button
            variant="secondary"
            onClick={() => setShowShareModal(true)}
            className="text-xs font-bold h-9 px-3.5 rounded-xl border-border/80 flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compartilhar</span>
          </Button>

          <a href={video.downloadUrl} download={video.originalFileName} target="_blank" rel="noopener noreferrer">
            <Button className="bg-primary hover:bg-primaryLight text-white text-xs font-bold h-9 px-3.5 rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Baixar</span>
            </Button>
          </a>
        </div>
      </header>

      {/* Main Player Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* The Cyber Video Player */}
        <div
          ref={playerContainerRef}
          onMouseMove={handleMouseMove}
          className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-purple-500/25 shadow-[0_20px_80px_rgba(0,0,0,0.9)] group select-none"
        >
          <video
            ref={videoRef}
            src={video.downloadUrl}
            poster={video.thumbnailUrl}
            playsInline
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Big Center Play Overlay */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer transition-all"
            >
              <div className="w-20 h-20 rounded-3xl bg-purple-600/90 hover:bg-purple-500 text-white flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.8)] hover:scale-105 transition-all">
                <Play className="w-8 h-8 fill-white ml-1" />
              </div>
            </div>
          )}

          {/* Custom Controls Bar */}
          <div
            className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 sm:p-6 transition-opacity duration-300 flex flex-col gap-2 ${
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Timeline Progress Slider */}
            <div className="relative w-full flex items-center group/scrub">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:h-2 transition-all"
              />
            </div>

            {/* Bottom Controls Row */}
            <div className="flex items-center justify-between text-white text-xs pt-1">
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                </button>

                {/* Volume & Mute */}
                <div className="flex items-center gap-2 group/volume">
                  <button onClick={toggleMute} className="p-1 rounded hover:bg-white/10 transition-colors">
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-14 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500 hidden sm:block"
                  />
                </div>

                {/* Time Indicator */}
                <span className="font-mono text-[11px] text-textSecondary">
                  <strong className="text-white">{formatDuration(currentTime)}</strong> / {formatDuration(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Speed Dropdown */}
                <select
                  value={playbackSpeed}
                  onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                  className="bg-black/60 border border-white/20 text-[11px] text-white font-mono rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white"
                  title="Tela cheia (F)"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Info Section */}
        <div className="bg-[#0b0816] border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${video.isPublic ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                  {video.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  <span>{video.isPublic ? 'Link Público' : 'Link Privado'}</span>
                </span>
                <span className="text-xs text-textMuted">• {video.userName || 'Autor'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{video.title}</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={handleCopyLink}
                className="text-xs font-bold h-10 px-4 rounded-xl flex items-center gap-2 border-border/80"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
              </Button>
            </div>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#06040d] border border-white/5">
              <span className="text-textMuted block mb-1">Visualizações</span>
              <p className="text-base font-bold text-white font-mono flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-purple-400" />
                {video.views || 0}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#06040d] border border-white/5">
              <span className="text-textMuted block mb-1">Duração</span>
              <p className="text-base font-bold text-white font-mono">
                {formatDuration(video.duration)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#06040d] border border-white/5">
              <span className="text-textMuted block mb-1">Tamanho do Arquivo</span>
              <p className="text-base font-bold text-white font-mono">
                {formatFileSize(video.size)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#06040d] border border-white/5">
              <span className="text-textMuted block mb-1">Publicado em</span>
              <p className="text-base font-bold text-white font-mono">
                {new Date(video.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#0a0714] border border-purple-500/20 rounded-3xl p-6 space-y-5 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Compartilhar Vídeo</h3>
              <button onClick={() => setShowShareModal(false)} className="p-1 rounded-lg text-textMuted hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-textSecondary uppercase block mb-1">Link do Vídeo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-[#05030a] border border-white/10 rounded-xl px-3 text-xs text-white truncate font-mono"
                  />
                  <Button onClick={handleCopyLink} className="text-xs h-9 px-3 rounded-xl bg-primary">
                    Copiar
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-textSecondary uppercase block mb-1">Código Embed (HTML)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={embedCode}
                    className="flex-1 bg-[#05030a] border border-white/10 rounded-xl px-3 text-xs text-textSecondary truncate font-mono"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(embedCode)
                      setCopiedEmbed(true)
                      addToast('Código embed copiado!', 'success')
                      setTimeout(() => setCopiedEmbed(false), 2000)
                    }}
                    className="text-xs h-9 px-3 rounded-xl"
                  >
                    {copiedEmbed ? 'Copiado' : 'Copiar'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    const text = encodeURIComponent(`Assista ao vídeo "${video.title}": ${shareUrl}`)
                    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
                  }}
                  className="py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </button>

                <button
                  onClick={() => {
                    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(video.title)}`, '_blank')
                  }}
                  className="py-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Telegram
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="py-6 border-t border-white/5 text-center text-xs text-textMuted space-y-1">
        <p>Hospedado na nuvem segura do <Link to="/" className="text-purple-400 hover:underline font-bold">GhostMarket AI</Link></p>
        <p className="text-[10px]">Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
import {
  Film,
  UploadCloud,
  Search,
  HardDrive,
  Eye,
  Globe,
  Lock,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Copy,
  ExternalLink,
  Play
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useVideoStore } from '@/store/videoStore'
import { VideoItem } from '@/types/video'
import { VideoCard } from '@/components/videos/VideoCard'
import { VideoUploadModal } from '@/components/videos/VideoUploadModal'
import { VideoPlayerModal } from '@/components/videos/VideoPlayerModal'
import { VideoShareModal } from '@/components/videos/VideoShareModal'
import { formatFileSize, formatDuration } from '@/utils/videoProcessor'
import { useToastStore } from '@/store/toastStore'

const TOTAL_STORAGE_QUOTA_BYTES = 5 * 1024 * 1024 * 1024 // 5 GB

export const Videos = () => {
  const { user } = useAuthStore()
  const { videos, isLoading, fetchVideos } = useVideoStore()
  const { addToast } = useToastStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'private'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'size' | 'views'>('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [activePlayVideo, setActivePlayVideo] = useState<VideoItem | null>(null)
  const [activeShareVideo, setActiveShareVideo] = useState<VideoItem | null>(null)

  const isAdmin = user?.email === 'willrandrier@gmail.com'

  useEffect(() => {
    if (user?.uid) {
      fetchVideos(user.uid, isAdmin)
    }
  }, [user?.uid, isAdmin, fetchVideos])

  // Cálculos de métricas
  const totalStorageUsed = useMemo(() => {
    return videos.reduce((acc, v) => acc + (v.size || 0), 0)
  }, [videos])

  const storagePercentage = useMemo(() => {
    return Math.min(100, Math.round((totalStorageUsed / TOTAL_STORAGE_QUOTA_BYTES) * 100))
  }, [totalStorageUsed])

  const totalViews = useMemo(() => {
    return videos.reduce((acc, v) => acc + (v.views || 0), 0)
  }, [videos])

  const publicCount = useMemo(() => {
    return videos.filter((v) => v.isPublic).length
  }, [videos])

  const privateCount = useMemo(() => {
    return videos.filter((v) => !v.isPublic).length
  }, [videos])

  // Filtragem e ordenação
  const filteredVideos = useMemo(() => {
    return videos
      .filter((v) => {
        const matchesSearch =
          v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.originalFileName.toLowerCase().includes(searchTerm.toLowerCase())

        if (!matchesSearch) return false

        if (privacyFilter === 'public') return v.isPublic
        if (privacyFilter === 'private') return !v.isPublic
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        }
        if (sortBy === 'size') {
          return (b.size || 0) - (a.size || 0)
        }
        if (sortBy === 'views') {
          return (b.views || 0) - (a.views || 0)
        }
        return 0
      })
  }, [videos, searchTerm, privacyFilter, sortBy])

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Film className="w-3.5 h-3.5" />
            <span>Mídia & Hospedagem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Vídeos e Links
          </h1>
          <p className="text-sm text-textSecondary">
            Hospede seus vídeos na nuvem e gere links rápidos de reprodução e compartilhamento.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => user?.uid && fetchVideos(user.uid, isAdmin)}
            className="text-xs font-bold h-11 px-4 rounded-xl border-border/80 flex items-center gap-2"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </Button>

          <Button
            onClick={() => setIsUploadOpen(true)}
            className="bg-primary hover:bg-primaryLight text-white text-xs font-bold h-11 px-5 rounded-xl flex items-center gap-2 shadow-[0_0_25px_rgba(139,92,246,0.4)]"
          >
            <Plus className="w-4 h-4" />
            <span>Enviar Vídeo</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Videos */}
        <div className="bg-[#0b0816] border border-purple-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Total de Vídeos</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{videos.length}</p>
          <p className="text-[11px] text-textMuted mt-1">Arquivos salvos e disponíveis</p>
        </div>

        {/* Card 2: Armazenamento */}
        <div className="bg-[#0b0816] border border-purple-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Armazenamento</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {formatFileSize(totalStorageUsed)} <span className="text-xs font-normal text-textMuted">/ 5 GB</span>
          </p>
          <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden mt-2.5">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full"
              style={{ width: `${storagePercentage}%` }}
            />
          </div>
        </div>

        {/* Card 3: Visualizações */}
        <div className="bg-[#0b0816] border border-purple-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Visualizações</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{totalViews}</p>
          <p className="text-[11px] text-textMuted mt-1">Reproduções totais dos links</p>
        </div>

        {/* Card 4: Status */}
        <div className="bg-[#0b0816] border border-purple-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Privacidade</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {publicCount} Públicos
            </span>
            <span className="text-sm font-bold text-purple-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              {privateCount} Privados
            </span>
          </div>
          <p className="text-[11px] text-textMuted mt-1">Controle de acesso por vídeo</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#090614] border border-purple-500/20">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou título do vídeo..."
            className="w-full bg-[#05030a] border border-border/70 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none transition-colors"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Privacy filter */}
          <div className="flex items-center bg-[#05030a] border border-border/70 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setPrivacyFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${privacyFilter === 'all' ? 'bg-purple-600 text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setPrivacyFilter('public')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${privacyFilter === 'public' ? 'bg-purple-600 text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}
            >
              Públicos
            </button>
            <button
              onClick={() => setPrivacyFilter('private')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${privacyFilter === 'private' ? 'bg-purple-600 text-white shadow-sm' : 'text-textSecondary hover:text-white'}`}
            >
              Privados
            </button>
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-[#05030a] border border-border/70 text-xs text-white font-medium rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
          >
            <option value="recent">Mais Recentes</option>
            <option value="oldest">Mais Antigos</option>
            <option value="size">Maior Tamanho</option>
            <option value="views">Mais Visualizados</option>
          </select>

          {/* View mode toggle */}
          <div className="flex items-center bg-[#05030a] border border-border/70 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-textSecondary hover:text-white'}`}
              title="Visualização em Grade"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-purple-600 text-white' : 'text-textSecondary hover:text-white'}`}
              title="Visualização em Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-[#0b0816] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#090614] border border-purple-500/15 rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(139,92,246,0.2)]">
            <Film className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              {searchTerm || privacyFilter !== 'all' ? 'Nenhum vídeo encontrado com estes filtros' : 'Nenhum vídeo enviado ainda'}
            </h3>
            <p className="text-xs text-textSecondary max-w-sm mx-auto">
              {searchTerm || privacyFilter !== 'all'
                ? 'Tente remover a busca ou alterar os filtros de privacidade.'
                : 'Envie seus primeiros vídeos para gerar links públicos e compartilhar com clientes ou equipes.'}
            </p>
          </div>
          <Button
            onClick={() => setIsUploadOpen(true)}
            className="bg-primary hover:bg-primaryLight text-white text-xs font-bold h-11 px-6 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] inline-flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Hospedar Primeiro Vídeo</span>
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onPlay={(v) => setActivePlayVideo(v)}
              onShare={(v) => setActiveShareVideo(v)}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-[#090614] border border-purple-500/20 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#06040d] border-b border-white/5 text-textSecondary uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Vídeo</th>
                  <th className="py-3 px-4">Duração</th>
                  <th className="py-3 px-4">Tamanho</th>
                  <th className="py-3 px-4">Privacidade</th>
                  <th className="py-3 px-4">Visualizações</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredVideos.map((video) => (
                  <tr key={video.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => setActivePlayVideo(video)}
                          className="w-12 h-8 rounded-lg bg-black cursor-pointer overflow-hidden relative shrink-0 flex items-center justify-center group"
                        >
                          {video.thumbnailUrl ? (
                            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                          ) : (
                            <Film className="w-4 h-4 text-purple-400" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                            <Play className="w-3 h-3 fill-white" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p
                            onClick={() => setActivePlayVideo(video)}
                            className="font-bold text-white hover:text-purple-300 transition-colors cursor-pointer truncate max-w-xs"
                          >
                            {video.title}
                          </p>
                          <p className="text-[10px] text-textMuted font-mono truncate max-w-xs">
                            {video.originalFileName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-textSecondary">{formatDuration(video.duration)}</td>
                    <td className="py-3 px-4 font-mono text-textSecondary">{formatFileSize(video.size)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${video.isPublic ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                        {video.isPublic ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                        <span>{video.isPublic ? 'Público' : 'Privado'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-textSecondary">{video.views || 0}</td>
                    <td className="py-3 px-4 text-textMuted text-[11px]">
                      {new Date(video.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/v/${video.id}`)
                            addToast('Link copiado!', 'success')
                          }}
                          className="h-7 px-2 text-[10px] rounded-lg"
                          title="Copiar Link"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setActiveShareVideo(video)}
                          className="h-7 px-2 text-[10px] rounded-lg"
                          title="Compartilhar"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <VideoUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          if (user?.uid) fetchVideos(user.uid, isAdmin)
        }}
      />

      <VideoPlayerModal
        video={activePlayVideo}
        isOpen={!!activePlayVideo}
        onClose={() => setActivePlayVideo(null)}
        onShareClick={(v) => {
          setActivePlayVideo(null)
          setActiveShareVideo(v)
        }}
      />

      <VideoShareModal
        video={activeShareVideo}
        isOpen={!!activeShareVideo}
        onClose={() => setActiveShareVideo(null)}
      />
    </div>
  )
}

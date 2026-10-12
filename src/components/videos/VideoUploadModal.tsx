import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UploadCloud,
  X,
  FileVideo,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Globe,
  Copy,
  Check,
  Film
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useVideoStore } from '@/store/videoStore'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { formatFileSize, formatDuration, extractVideoMetadataAndThumbnail } from '@/utils/videoProcessor'

interface VideoUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500 MB
const ALLOWED_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
  'video/x-matroska', // .mkv
  'video/ogg',
  'video/avi',
  'video/x-msvideo'
]

export const VideoUploadModal = ({ isOpen, onClose, onSuccess }: VideoUploadModalProps) => {
  const { user } = useAuthStore()
  const { uploadVideo, cancelUpload, uploadProgress } = useVideoStore()
  const { addToast } = useToastStore()

  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [createdVideoId, setCreatedVideoId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  const resetForm = () => {
    setSelectedFile(null)
    setTitle('')
    setIsPublic(true)
    setThumbnailPreview(null)
    setVideoDuration(0)
    setIsExtracting(false)
    setIsUploading(false)
    setUploadComplete(false)
    setCreatedVideoId(null)
    setErrorMessage(null)
    setCopied(false)
  }

  const handleFileProcess = async (file: File) => {
    setErrorMessage(null)

    // Validação de tipo
    if (!file.type.startsWith('video/') && !ALLOWED_TYPES.includes(file.type)) {
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (!['mp4', 'webm', 'mov', 'mkv', 'avi', 'ogg', 'm4v'].includes(ext || '')) {
        setErrorMessage('Formato de vídeo não suportado. Utilize MP4, WebM, MOV ou MKV.')
        return
      }
    }

    // Validação de tamanho
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`O vídeo excede o limite máximo de 500 MB (tamanho atual: ${formatFileSize(file.size)}).`)
      return
    }

    setSelectedFile(file)
    setTitle(file.name.replace(/\.[^/.]+$/, ''))
    setIsExtracting(true)

    try {
      const meta = await extractVideoMetadataAndThumbnail(file)
      setThumbnailPreview(meta.thumbnailPreviewUrl)
      setVideoDuration(meta.duration)
    } catch (err) {
      console.warn('Erro ao extrair metadados preliminares:', err)
    } finally {
      setIsExtracting(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleStartUpload = async () => {
    if (!selectedFile || !user) return
    setIsUploading(true)
    setErrorMessage(null)

    try {
      const created = await uploadVideo(
        selectedFile,
        title,
        isPublic,
        {
          uid: user.uid,
          email: user.email,
          name: user.name
        }
      )

      setCreatedVideoId(created.id)
      setUploadComplete(true)
      setIsUploading(false)
      addToast('Vídeo hospedado com sucesso!', 'success')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error('Falha no upload:', err)
      setErrorMessage(err.message || 'Erro ao realizar upload do vídeo. Tente novamente.')
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    if (isUploading) {
      cancelUpload()
      setIsUploading(false)
      addToast('Upload cancelado pelo usuário.', 'info')
    }
    onClose()
  }

  const getShareUrl = () => {
    if (!createdVideoId) return ''
    return `${window.location.origin}/v/${createdVideoId}`
  }

  const handleCopyLink = () => {
    const url = getShareUrl()
    if (!url) return
    navigator.clipboard.writeText(url)
    setCopied(true)
    addToast('Link público copiado para a área de transferência!', 'success')
    setTimeout(() => setCopied(false), 2500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-[#0a0714] border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-600/15 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-500/10 blur-[90px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Hospedar Novo Vídeo</h2>
              <p className="text-xs text-textSecondary">Envie vídeos e gere links rápidos de reprodução</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 rounded-xl text-textSecondary hover:text-white hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Stages */}
        <div className="relative z-10">
          {/* STAGE 1: Upload Complete */}
          {uploadComplete && createdVideoId ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white mb-2">Vídeo Pronto e Hospedado!</h3>
                <p className="text-sm text-textSecondary max-w-md mx-auto">
                  O link público de compartilhamento foi gerado. Qualquer pessoa com o link poderá assistir sem precisar de login.
                </p>
              </div>

              {/* Link Box */}
              <div className="flex items-center gap-2 p-2 bg-[#05030a] border border-purple-500/30 rounded-2xl">
                <input
                  type="text"
                  readOnly
                  value={getShareUrl()}
                  className="flex-1 bg-transparent border-none text-xs sm:text-sm text-white px-3 focus:outline-none truncate font-mono"
                />
                <Button
                  onClick={handleCopyLink}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                >
                  {copied ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-black" />}
                  <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
                </Button>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={resetForm}
                  className="text-xs font-bold rounded-xl h-11 px-5 border-border"
                >
                  Enviar Outro Vídeo
                </Button>
                <Button
                  onClick={() => window.open(getShareUrl(), '_blank')}
                  className="bg-primary hover:bg-primaryLight text-white text-xs font-bold rounded-xl h-11 px-6 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                >
                  Abrir Player Agora
                </Button>
              </div>
            </motion.div>
          ) : isUploading ? (
            /* STAGE 2: Upload in Progress */
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 py-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enviando para a Nuvem Ghost</span>
                </div>
                <h3 className="text-xl font-black text-white">{title || selectedFile?.name}</h3>
                <p className="text-xs text-textSecondary font-mono">
                  {uploadProgress ? `${formatFileSize(uploadProgress.bytesTransferred)} de ${formatFileSize(uploadProgress.totalBytes)}` : 'Iniciando upload seguro...'}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-white px-1">
                  <span>Progresso do Upload</span>
                  <span className="text-purple-400 font-mono">{uploadProgress?.progress || 0}%</span>
                </div>
                <div className="w-full h-3 bg-surface rounded-full overflow-hidden border border-white/5 relative p-0.5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-600 via-accent to-emerald-400 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.6)]"
                    style={{ width: `${uploadProgress?.progress || 0}%` }}
                    transition={{ ease: 'easeOut', duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Cancel Button */}
              <div className="text-center pt-2">
                <Button
                  variant="danger"
                  onClick={handleCancel}
                  className="text-xs font-bold h-10 px-6 rounded-xl"
                >
                  Cancelar Upload
                </Button>
              </div>
            </motion.div>
          ) : selectedFile ? (
            /* STAGE 3: File Selected - Details & Confirmation */
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Preview Card */}
              <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-[#06040c] border border-purple-500/20">
                <div className="w-full sm:w-44 h-28 rounded-xl bg-surface/50 border border-white/10 relative overflow-hidden shrink-0 flex items-center justify-center">
                  {thumbnailPreview ? (
                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <FileVideo className="w-8 h-8 text-purple-400 animate-pulse" />
                  )}
                  {videoDuration > 0 && (
                    <span className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-white">
                      {formatDuration(videoDuration)}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-textMuted font-mono truncate">{selectedFile.name}</span>
                    <button
                      onClick={() => {
                        setSelectedFile(null)
                        setThumbnailPreview(null)
                      }}
                      className="text-textSecondary hover:text-error text-xs font-semibold"
                    >
                      Trocar arquivo
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider block mb-1">
                      Título do Vídeo
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Demonstração da Agência de Sites"
                      className="w-full bg-surface border border-border/80 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-3 text-xs text-textSecondary pt-1">
                    <span>Tamanho: <strong className="text-white font-mono">{formatFileSize(selectedFile.size)}</strong></span>
                    {videoDuration > 0 && (
                      <span>• Duração: <strong className="text-white font-mono">{formatDuration(videoDuration)}</strong></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Privacy Setting */}
              <div className="p-4 rounded-2xl bg-[#06040c] border border-purple-500/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPublic ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                    {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {isPublic ? 'Acesso Público (Recomendado)' : 'Acesso Privado'}
                    </p>
                    <p className="text-[11px] text-textSecondary">
                      {isPublic
                        ? 'Qualquer pessoa com o link gerado poderá reproduzir o vídeo.'
                        : 'Apenas você conectado na sua conta poderá visualizar este vídeo.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isPublic ? 'bg-emerald-500' : 'bg-surface-elevated'}`}
                >
                  <motion.div
                    layout
                    className="bg-white w-4 h-4 rounded-full shadow-md"
                    animate={{ x: isPublic ? 24 : 0 }}
                  />
                </button>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  className="text-xs font-bold h-11 px-5 rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleStartUpload}
                  disabled={!title.trim() || isExtracting}
                  className="bg-primary hover:bg-primaryLight text-white text-xs font-bold h-11 px-6 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                >
                  {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  <span>{isExtracting ? 'Processando...' : 'Iniciar Upload do Vídeo'}</span>
                </Button>
              </div>
            </motion.div>
          ) : (
            /* STAGE 4: Initial Dropzone */
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,.mp4,.webm,.mov,.mkv,.avi,.ogg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0])
                  }
                }}
              />

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-500/5 shadow-[0_0_40px_rgba(16,185,129,0.2)]'
                    : 'border-purple-500/30 hover:border-purple-500/60 bg-[#06040c]/80 hover:bg-[#0c0818]'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                  Arraste seu arquivo de vídeo aqui
                </h3>
                <p className="text-xs text-textSecondary mb-4">
                  ou clique para selecionar do seu computador
                </p>

                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[11px] text-textMuted font-mono">
                  <span>MP4, WebM, MOV, MKV</span>
                  <span>•</span>
                  <span>Até 500 MB</span>
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

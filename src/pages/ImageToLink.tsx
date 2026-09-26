import { AnimatedBackground } from '@/components/ui/AnimatedBackground'
import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Copy, Check, UploadCloud, Link as LinkIcon, ChevronRight } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'
import { motion, AnimatePresence } from 'framer-motion'
import { storage } from '@/config/firebase'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { useAuthStore } from '@/store/authStore'

export const ImageToLink = () => {
  const { user } = useAuthStore()
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [copied, setCopied] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addToast } = useToastStore()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (!selectedFile.type.startsWith('image/')) {
        addToast('Por favor, selecione apenas imagens.', 'error')
        return
      }
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (!droppedFile.type.startsWith('image/')) {
        addToast('Por favor, arraste apenas imagens.', 'error')
        return
      }
      setFile(droppedFile)
      setPreviewUrl(URL.createObjectURL(droppedFile))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const uploadImage = () => {
    if (!file) return

    
    setStep(2)
    setUploadProgress(0)

    const timestamp = new Date().getTime()
    const fileName = `${timestamp}_${file.name}`
    const userId = user?.uid || 'anonymous'
    const storageRef = ref(storage, `hosted_images/${userId}/${fileName}`)
    
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setUploadProgress(progress)
      }, 
      (error) => {
        console.error(error)
        addToast('Erro ao fazer upload da imagem.', 'error')
        
        setStep(1)
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        setGeneratedUrl(downloadURL)
        
        setStep(3)
        addToast('Imagem hospedada com sucesso!', 'success')
      }
    )
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl)
    setCopied(true)
    addToast('Link copiado! Agora é só colar no código do seu site.', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const reset = () => {
    setFile(null)
    setPreviewUrl(null)
    setGeneratedUrl('')
    setStep(1)
  }

  return (
    <div className="relative overflow-x-hidden min-h-[calc(100vh-64px)] w-full bg-[#09090b] text-white selection:bg-primary/30">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto space-y-6 pt-10 pb-20 relative z-10 min-h-screen">
        
        <div className="mb-12 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 border border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <LinkIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-indigo-400 mb-4">
            Transformar Imagem em Link
          </h1>
          <p className="text-lg text-textSecondary max-w-2xl font-medium">
            Hospede suas imagens na nuvem instantaneamente para usar nos seus sites.
          </p>
        </div>

        <div className="mb-12 relative max-w-2xl mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-border rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-indigo-500"
              initial={{ width: '0%' }}
              animate={{ width: `${((step - 1) / 2) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
          <div className="relative flex justify-between">
            {[1, 2, 3].map(i => (
              <motion.div 
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-4 transition-colors duration-500 ${
                  step >= i 
                  ? 'bg-primary border-panel text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]' 
                  : 'bg-panel border-background text-textSecondary'
                }`}
              >
                {i}
              </motion.div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
              <Card className="border-border/50 bg-panel/50 backdrop-blur-sm shadow-2xl overflow-hidden">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 1 de 3</h3>
                    <h2 className="text-3xl font-black text-white">Selecione sua Imagem</h2>
                    <p className="text-textSecondary">Faça o upload da imagem que você quer colocar no seu site.</p>
                  </div>
                  
                  <div 
                    className={`mt-6 border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 transition-colors ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-background/50'} cursor-pointer`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileSelect}
                      accept="image/*"
                    />
                    
                    {previewUrl ? (
                      <div className="flex flex-col items-center gap-4 w-full">
                        <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg object-contain shadow-lg" />
                        <div className="flex items-center gap-2 text-sm font-medium text-primaryLight bg-primary/10 px-4 py-2 rounded-full">
                          <Check className="w-4 h-4" /> Imagem Pronta
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <UploadCloud className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg">Clique ou arraste a imagem aqui</h3>
                        <p className="text-textSecondary text-sm">PNG, JPG, WEBP, GIF (Max. 5MB)</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-border/50">
                    <Button onClick={uploadImage} disabled={!file} className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-indigo-600 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                      Hospedar Imagem <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
              <Card className="border-border/50 bg-panel/50 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-16 flex flex-col items-center justify-center text-center gap-8">
                  <h2 className="text-2xl font-black text-white">Enviando para a Nuvem...</h2>
                  
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-t-primary border-r-indigo-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-4 border-4 border-t-transparent border-r-transparent border-b-primary border-l-indigo-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                    <UploadCloud className="w-10 h-10 text-primary animate-pulse" />
                  </div>
                  
                  <div className="w-full max-w-md bg-background rounded-full h-3 overflow-hidden border border-border">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary to-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-primaryLight font-bold font-mono">{Math.round(uploadProgress)}% Concluído</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Imagem Hospedada!</h3>
                  <p className="text-textSecondary">Seu link direto está pronto para uso.</p>
                </div>
                <Button variant="secondary" onClick={reset} className="font-bold">
                  Hospedar Outra
                </Button>
              </div>
              
              <Card className="border-border/50 bg-panel/50 backdrop-blur-sm shadow-2xl overflow-hidden">
                <CardContent className="p-8 space-y-8">
                  <div className="flex flex-col items-center gap-6">
                    {previewUrl && (
                      <div className="p-2 bg-background border border-border rounded-xl">
                        <img src={previewUrl} alt="Hospedada" className="max-h-64 rounded-lg object-contain" />
                      </div>
                    )}
                    
                    <div className="w-full space-y-2">
                      <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" /> Link Direto da Imagem
                      </label>
                      <div className="flex gap-3">
                        <Input value={generatedUrl} readOnly className="font-mono text-sm" />
                        <Button onClick={copyToClipboard} className="bg-primary hover:bg-primaryLight shrink-0">
                          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

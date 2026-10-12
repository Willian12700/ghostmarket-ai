import { useRef, useState, useMemo } from 'react'
import {
  Code,
  Upload,
  Copy,
  Trash2,
  Check,
  ClipboardPaste,
  ShieldAlert
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCodeWorkspaceStore } from '@/store/codeWorkspaceStore'
import { detectSecuritySecrets } from '@/utils/codeWorkspaceEngine'
import { useToastStore } from '@/store/toastStore'

export const CodeEditorPanel = () => {
  const { code, setCode, setFileName } = useCodeWorkspaceStore()
  const { addToast } = useToastStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const lineCount = useMemo(() => {
    if (!code) return 0
    return code.split('\n').length
  }, [code])

  const charCount = code.length

  // Análise de segredos e credenciais em tempo real
  const securityWarnings = useMemo(() => {
    if (!code) return []
    return detectSecuritySecrets(code)
  }, [code])

  const handleFileUpload = (file: File) => {
    if (!file) return

    // Limite de 5 MB de texto para evitar travamentos
    if (file.size > 5 * 1024 * 1024) {
      addToast('O arquivo selecionado é muito grande (máximo 5 MB).', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content !== undefined) {
        setCode(content)
        setFileName(file.name)
        addToast(`Arquivo "${file.name}" carregado com sucesso!`, 'success')
      }
    }
    reader.onerror = () => {
      addToast('Erro ao ler o arquivo de código.', 'error')
    }
    reader.readAsText(file)
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setCode(text)
        addToast('Código colado da área de transferência!', 'success')
      } else {
        addToast('Área de transferência vazia.', 'info')
      }
    } catch {
      addToast('Permissão de colar negada no navegador.', 'error')
    }
  }

  const handleCopyCode = () => {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    addToast('Código copiado!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#0a0714] border border-purple-500/20 rounded-2xl flex flex-col h-[520px] shadow-xl overflow-hidden relative">
      {/* Editor Header Bar */}
      <div className="h-12 bg-[#06040d] border-b border-purple-500/20 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-white tracking-wide">Código Fonte</span>
          <span className="text-[11px] font-mono text-textMuted px-2 py-0.5 rounded-full bg-white/5">
            {lineCount} linhas • {charCount.toLocaleString()} caracteres
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* File Upload Hidden Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".tsx,.ts,.jsx,.js,.html,.css,.scss,.py,.json,.sql,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0])
              }
            }}
          />

          <Button
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 px-2.5 text-xs text-textSecondary hover:text-white flex items-center gap-1.5 rounded-lg"
            title="Importar arquivo de código"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload</span>
          </Button>

          <Button
            variant="ghost"
            onClick={handlePasteFromClipboard}
            className="h-8 px-2.5 text-xs text-textSecondary hover:text-white flex items-center gap-1.5 rounded-lg"
            title="Colar da área de transferência"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Colar</span>
          </Button>

          <Button
            variant="ghost"
            onClick={handleCopyCode}
            disabled={!code}
            className="h-8 px-2.5 text-xs text-textSecondary hover:text-white flex items-center gap-1.5 rounded-lg"
            title="Copiar código"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Copiar</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => setCode('')}
            disabled={!code}
            className="h-8 px-2 text-xs text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
            title="Limpar editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Security Warning Banner (if secrets/keys detected) */}
      {securityWarnings.length > 0 && (
        <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2 flex items-center justify-between gap-3 text-xs text-red-300">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              <strong>Atenção de Segurança:</strong> Detectamos possíveis tokens/chaves privadas no código ({securityWarnings[0]}). Remova-os antes de enviar a modelos de IA.
            </span>
          </div>
        </div>
      )}

      {/* Editor Body */}
      <div
        className="flex-1 relative flex overflow-hidden"
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0])
          }
        }}
      >
        {/* Line Numbers Simulation */}
        <div className="w-12 bg-[#05030a] border-r border-white/5 py-4 select-none text-right pr-3 font-mono text-[11px] text-white/20 shrink-0 overflow-hidden">
          {Array.from({ length: Math.min(lineCount || 1, 999) }).map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area Code Editor */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="// Cole seu código aqui ou arraste um arquivo para o editor..."
          className="flex-1 bg-transparent text-white font-mono text-xs p-4 leading-6 resize-none focus:outline-none custom-scrollbar whitespace-pre"
          spellCheck={false}
        />

        {/* Drag and Drop Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-purple-950/80 border-2 border-dashed border-purple-400 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20 pointer-events-none">
            <Upload className="w-8 h-8 text-purple-300 animate-bounce" />
            <p className="text-sm font-bold text-white">Solte o arquivo de código para carregar</p>
          </div>
        )}
      </div>
    </div>
  )
}

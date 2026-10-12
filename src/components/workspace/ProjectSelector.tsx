import { useState } from 'react'
import {
  FolderCode,
  Globe,
  FileCode2,
  ChevronDown,
  RefreshCw
} from 'lucide-react'
import { useCodeWorkspaceStore } from '@/store/codeWorkspaceStore'
import { SupportedLanguage } from '@/types/codeWorkspace'

const LANGUAGES: { id: SupportedLanguage; label: string }[] = [
  { id: 'typescript', label: 'TypeScript (.tsx/.ts)' },
  { id: 'javascript', label: 'JavaScript (.jsx/.js)' },
  { id: 'html', label: 'HTML (.html)' },
  { id: 'css', label: 'CSS / Tailwind (.css)' },
  { id: 'python', label: 'Python (.py)' },
  { id: 'json', label: 'JSON (.json)' },
  { id: 'sql', label: 'SQL (.sql)' },
  { id: 'other', label: 'Outro' }
]

export const ProjectSelector = () => {
  const {
    projectName,
    setProjectName,
    fileName,
    setFileName,
    language,
    setLanguage,
    userSites,
    selectedSiteId,
    selectSite,
    clearWorkspace,
    isLoadingSites
  } = useCodeWorkspaceStore()

  const [isOpenDropdown, setIsOpenDropdown] = useState(false)

  return (
    <div className="bg-[#0a0714] border border-purple-500/20 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* 1. Escolha de Projeto / Origem */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setIsOpenDropdown(!isOpenDropdown)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-500/20 transition-colors text-xs font-bold"
          >
            {selectedSiteId ? (
              <Globe className="w-4 h-4 text-emerald-400" />
            ) : (
              <FolderCode className="w-4 h-4 text-purple-400" />
            )}
            <span className="truncate max-w-[200px]">
              {selectedSiteId ? `Site: ${projectName}` : projectName || 'Código Avulso'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-purple-400/80" />
          </button>

          {/* Dropdown Menu */}
          {isOpenDropdown && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-[#0d091a] border border-purple-500/30 rounded-2xl p-2 shadow-2xl z-50 animate-fade-in backdrop-blur-xl">
              <div className="p-2 border-b border-white/5 mb-1">
                <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">
                  Vincular a um Projeto
                </span>
              </div>

              {/* Opção: Código Avulso */}
              <button
                onClick={() => {
                  clearWorkspace()
                  setProjectName('Código Avulso')
                  setIsOpenDropdown(false)
                }}
                className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs transition-colors ${
                  !selectedSiteId
                    ? 'bg-purple-600/20 text-white font-bold border border-purple-500/30'
                    : 'text-textSecondary hover:text-white hover:bg-white/5'
                }`}
              >
                <FileCode2 className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="font-semibold text-white">Código Avulso / Scratchpad</p>
                  <p className="text-[10px] text-textMuted">Cole ou envie qualquer arquivo</p>
                </div>
              </button>

              {/* Lista dos Sites do Usuário */}
              <div className="pt-2 pb-1 px-2">
                <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider flex items-center justify-between">
                  <span>Meus Sites no Ghost Market</span>
                  {isLoadingSites && <RefreshCw className="w-3 h-3 animate-spin text-purple-400" />}
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {userSites.length === 0 ? (
                  <div className="p-3 text-center text-xs text-textMuted">
                    Nenhum site encontrado na sua conta.
                  </div>
                ) : (
                  userSites.map((site) => (
                    <button
                      key={site.id}
                      onClick={() => {
                        selectSite(site)
                        setIsOpenDropdown(false)
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs transition-colors ${
                        selectedSiteId === site.id
                          ? 'bg-emerald-500/20 text-white font-bold border border-emerald-500/30'
                          : 'text-textSecondary hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <p className="font-semibold text-white truncate">{site.domain}</p>
                        <p className="text-[10px] text-textMuted">Importar HTML completo</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. Nome do Arquivo */}
        <div className="flex items-center gap-2 bg-[#05030a] border border-white/10 rounded-xl px-3 py-1.5">
          <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Nome do arquivo..."
            className="bg-transparent border-none text-xs text-white focus:outline-none w-32 sm:w-40 font-mono"
          />
        </div>
      </div>

      {/* 3. Seletor de Linguagem */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-textMuted hidden sm:inline">Linguagem:</span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
          className="bg-[#05030a] border border-purple-500/30 text-xs text-white font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500 transition-colors"
        >
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

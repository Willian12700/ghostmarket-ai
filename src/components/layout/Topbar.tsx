
import { Menu } from 'lucide-react'

interface TopbarProps {
  title: string
  description?: string
  onMenuClick?: () => void
}

export const Topbar = ({ title, description, onMenuClick }: TopbarProps) => {
  return (
    <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden text-textSecondary hover:text-textPrimary"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          {description && <p className="text-sm text-textSecondary hidden sm:block">{description}</p>}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-success">Sistema online</span>
        </div>
      </div>
    </header>
  )
}

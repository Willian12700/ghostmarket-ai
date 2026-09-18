
import { useToastStore } from '@/store/toastStore'
import { cn } from '@/utils/cn'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 p-4 rounded-lg shadow-lg border animate-in slide-in-from-bottom-5",
            toast.type === 'success' && "bg-panel border-success/30 text-success",
            toast.type === 'error' && "bg-panel border-error/30 text-error",
            toast.type === 'info' && "bg-panel border-border text-textPrimary"
          )}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-primary" />}
          
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          
          <button 
            onClick={() => removeToast(toast.id)}
            className="text-textSecondary hover:text-textPrimary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

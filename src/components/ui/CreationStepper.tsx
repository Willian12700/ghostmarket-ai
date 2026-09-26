import { useNavigate } from 'react-router-dom'
import { Search, Code, Globe } from 'lucide-react'

interface CreationStepperProps {
  currentStep: number;
}

export const CreationStepper = ({ currentStep }: CreationStepperProps) => {
  const navigate = useNavigate()

  const steps = [
    { id: 1, name: 'Achar Leads', path: '/scanner', icon: Search },
    { id: 2, name: 'Criar Prompt', path: '/prompt-builder', icon: Code },
    { id: 3, name: 'Hospedar Site', path: '/builder', icon: Globe },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 bg-surface-elevated border border-border p-3 rounded-2xl shadow-sm flex items-center justify-between">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = currentStep === step.id
        const isPast = currentStep > step.id
        
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <button 
              onClick={() => navigate(step.path)}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-accent/10 border border-accent/20 text-accent shadow-glow-sm' 
                  : isPast 
                    ? 'text-textPrimary hover:bg-surface' 
                    : 'text-textMuted hover:text-textSecondary'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                isActive ? 'border-accent bg-accent/20' : isPast ? 'border-accent bg-accent text-background' : 'border-border bg-surface'
              }`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : isPast ? 'text-white' : 'text-textMuted'}`} />
              </div>
              <span className={`font-bold text-sm hidden sm:block ${isActive ? 'text-accent' : isPast ? 'text-white' : ''}`}>
                {step.name}
              </span>
            </button>
            
            {index < steps.length - 1 && (
              <div className="flex-1 px-4 flex justify-center">
                <div className={`h-[2px] w-full max-w-[50px] rounded-full transition-colors ${isPast ? 'bg-accent' : 'bg-border'}`} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

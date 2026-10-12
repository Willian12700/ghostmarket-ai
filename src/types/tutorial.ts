export interface TutorialVideo {
  id: string
  title: string
  description: string
  category: string
  youtubeUrl: string
  youtubeVideoId: string
  thumbnailUrl?: string
  toolRoute?: string
  duration?: string
  order?: number
  createdAt: string
  updatedAt?: string
  createdBy?: string
}

export interface TutorialCategoryOption {
  id: string
  name: string
  description?: string
  defaultRoute?: string
}

export const PREDEFINED_TUTORIAL_CATEGORIES: TutorialCategoryOption[] = [
  {
    id: 'geral',
    name: 'Visão Geral & Comece Aqui',
    description: 'Introdução à plataforma e primeiros passos',
    defaultRoute: '/dashboard'
  },
  {
    id: 'scanner',
    name: 'Scanner de Leads',
    description: 'Prospecção em massa de comércios no Google Maps com globo 3D',
    defaultRoute: '/scanner'
  },
  {
    id: 'creator',
    name: 'Creator IA',
    description: 'Criação de páginas completas, sites e copy com IA',
    defaultRoute: '/creator'
  },
  {
    id: 'builder',
    name: 'Hospedar Novo Site',
    description: 'Publicação de sites com subdomínio e visual studio',
    defaultRoute: '/builder'
  },
  {
    id: 'ide',
    name: 'Ghost IDE (BETA)',
    description: 'Ambiente de desenvolvimento e código na nuvem',
    defaultRoute: '/ide'
  },
  {
    id: 'code-workspace',
    name: 'AI Code Workspace',
    description: 'Geração de Mega Prompts e refatoração inteligente de código',
    defaultRoute: '/code-workspace'
  },
  {
    id: 'crm',
    name: 'CRM Kanban & Comercial',
    description: 'Gestão de leads, funil de vendas e contratos',
    defaultRoute: '/contracts'
  },
  {
    id: 'digitaliza-crm',
    name: 'CRM Compartilhado',
    description: 'Workspaces colaborativos para múltiplos membros',
    defaultRoute: '/digitaliza-crm'
  },
  {
    id: 'cnpj',
    name: 'Dossiê CNPJ',
    description: 'Consulta rápida de dados fiscais e decisores',
    defaultRoute: '/cnpj'
  },
  {
    id: 'chatbots',
    name: 'Chatbots de IA',
    description: 'Configuração de agentes inteligentes para atendimento',
    defaultRoute: '/chatbots'
  },
  {
    id: 'scripts',
    name: 'Scripts X1',
    description: 'Roteiros de abordagem e fechamento de clientes',
    defaultRoute: '/scripts'
  },
  {
    id: 'offers',
    name: 'Tracker de Ofertas',
    description: 'Espionagem e inteligência de mercado',
    defaultRoute: '/offers'
  },
  {
    id: 'library',
    name: 'Biblioteca IA',
    description: 'Templates e prompts de alta conversão',
    defaultRoute: '/library'
  }
]

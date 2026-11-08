export type LayoutVariant = 'modern' | 'luxury' | 'delivery' | 'clinical' | 'bold' | 'minimal';

export type InteractionMode = 'cart' | 'booking' | 'whatsapp';

export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  badge?: string;
  available?: boolean;
}

export interface ReviewItem {
  name: string;
  role: string;
  text: string;
  rating: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SiteStudioConfig {
  templateId: string;
  templateTitle: string;
  category: string;
  layoutVariant: LayoutVariant;
  interactionMode: InteractionMode;

  // Brand & Texts
  name: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  secondaryCtaText: string;
  catalogTitle: string;
  catalogSubtitle: string;
  aboutTitle: string;
  aboutText: string;
  footerText: string;

  // Real-time Colors & Typography
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: '0px' | '8px' | '16px' | '24px' | '9999px';

  // Media
  logoUrl: string;
  heroImage: string;
  galleryImages: string[];

  // Contact & Info
  whatsapp: string;
  phone: string;
  address: string;
  city: string;
  hours: string;
  instagram: string;
  pixKey?: string;
  deliveryFee?: string;

  // Dynamic Sections
  showPrices: boolean;
  showGallery: boolean;
  showReviews: boolean;
  showFaq: boolean;
  showFloatingWhatsapp: boolean;
  perks: string[];
  catalog: CatalogItem[];
  reviews: ReviewItem[];
  faqs: FaqItem[];

  // Establishment Admin Panel Live Controls
  storeStatus?: 'open' | 'closed' | 'busy';
  waitTimeText?: string;
  promoBannerText?: string;
  siteSlug?: string;
  showAdminLinkInFooter?: boolean;
}

export interface ColorPalettePreset {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
}

export const COLOR_PALETTES: ColorPalettePreset[] = [
  { id: 'noir-gold', name: 'Luxury Gold & Noir', primary: '#D4AF37', secondary: '#F3E5AB', background: '#09090B', surface: '#121216', text: '#F8FAFC' },
  { id: 'flame-burger', name: 'Brasa & Delivery', primary: '#EA580C', secondary: '#F97316', background: '#0C0A09', surface: '#1C1917', text: '#FAFAF9' },
  { id: 'emerald-exec', name: 'Emerald Executive', primary: '#10B981', secondary: '#34D399', background: '#09090B', surface: '#111827', text: '#F9FAFB' },
  { id: 'clinical-clean', name: 'Clinical Sky Clean', primary: '#0284C7', secondary: '#38BDF8', background: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A' },
  { id: 'rose-aesthetic', name: 'Rose Nude Estética', primary: '#E11D48', secondary: '#FB7185', background: '#FFF1F2', surface: '#FFFFFF', text: '#1F2937' },
  { id: 'acai-purple', name: 'Roxo Açaí & Tropical', primary: '#9333EA', secondary: '#FACC15', background: '#0F0718', surface: '#1E1030', text: '#FAF5FF' },
  { id: 'cyber-indigo', name: 'SaaS & Tech Indigo', primary: '#6366F1', secondary: '#818CF8', background: '#09090B', surface: '#13131A', text: '#F8FAFC' },
  { id: 'crimson-pizza', name: 'Forno Italiano', primary: '#DC2626', secondary: '#16A34A', background: '#110C0C', surface: '#1F1616', text: '#FEF2F2' },
  { id: 'fitness-neon', name: 'Performance Lime', primary: '#84CC16', secondary: '#A3E635', background: '#09090B', surface: '#141417', text: '#FAFAFA' },
  { id: 'coffee-warm', name: 'Café & Artesanal', primary: '#B45309', secondary: '#D97706', background: '#FAF7F2', surface: '#FFFFFF', text: '#1C1917' },
  { id: 'pet-teal', name: 'Pet Care & Alegria', primary: '#0D9488', secondary: '#F59E0B', background: '#F0FDFA', surface: '#FFFFFF', text: '#0F172A' },
  { id: 'navy-law', name: 'Corporativo & Jurídico', primary: '#2563EB', secondary: '#60A5FA', background: '#0B0F19', surface: '#111827', text: '#F8FAFC' },
];

export const FONT_PRESETS = [
  { id: 'Inter', label: 'Inter (Moderna & Clean)', importUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap' },
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (SaaS & Tech)', importUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap' },
  { id: 'Playfair Display', label: 'Playfair Display (Luxo & Editorial)', importUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap' },
  { id: 'Syne', label: 'Syne (Impacto & Street)', importUrl: 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@400;500;600&display=swap' },
  { id: 'Outfit', label: 'Outfit (Geométrica & Delivery)', importUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap' },
  { id: 'Space Grotesk', label: 'Space Grotesk (Futurista & Bold)', importUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap' },
];

export const LAYOUT_VARIANTS: { id: LayoutVariant; name: string; desc: string }[] = [
  { id: 'modern', name: 'Modern Bento', desc: 'Hero split + cards com bordas suaves e alto contraste' },
  { id: 'delivery', name: 'Delivery & Cardápio App', desc: 'Focado em fotos de produtos, categorias e sacola no WhatsApp' },
  { id: 'luxury', name: 'Luxury Editorial', desc: 'Tipografia imponente, espaçamento amplo e estética premium' },
  { id: 'clinical', name: 'Clínica & Agendamento', desc: 'Transmite autoridade, confiança, especialidades e agendamento rápido' },
  { id: 'bold', name: 'High Impact & Performance', desc: 'Visual agressivo de alta conversão com destaques vibrantes' },
  { id: 'minimal', name: 'Minimalista Clean', desc: 'Foco absoluto na mensagem, leitura limpa e CTA direto' },
];

export const TEMPLATE_CATEGORIES = [
  'Todos',
  'Alimentação & Delivery',
  'Beleza & Estética',
  'Saúde & Clínicas',
  'Fitness & Esportes',
  'Pet & Veterinária',
  'Serviços & Automotivo',
  'Jurídico & Corporativo',
  'Imobiliária & Construção',
  'Educação & Infoprodutos',
  'Comércio & Lojas',
  'Eventos & Turismo',
] as const;

interface RawTemplateSeed {
  id: string;
  title: string;
  category: (typeof TEMPLATE_CATEGORIES)[number];
  layoutVariant: LayoutVariant;
  interactionMode: InteractionMode;
  name: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  catalogTitle: string;
  aboutText: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: '0px' | '8px' | '16px' | '24px' | '9999px';
  heroImage: string;
  galleryImages: string[];
  perks: string[];
  catalog: Omit<CatalogItem, 'id'>[];
}

const RAW_TEMPLATES_PART_1: RawTemplateSeed[] = [
  // ================= 1. ALIMENTAÇÃO & DELIVERY (10 MODELOS) =================
  {
    id: 'hamburgueria-artesanal',
    title: 'Hamburgueria Artesanal & Smash',
    category: 'Alimentação & Delivery',
    layoutVariant: 'delivery',
    interactionMode: 'cart',
    name: 'Brutus Burger House',
    eyebrow: '🔥 Blend 100% Angus na Brasa • Entrega em 35 min',
    headline: 'O verdadeiro smash burger artesanal com crosta perfeita e queijo derretendo.',
    subheadline: 'Pão brioche selado na manteiga, carne fresca moída no dia e molhos autorais. Monte seu pedido abaixo e receba quentinho em casa.',
    ctaText: 'Fazer Pedido Agora',
    catalogTitle: 'Cardápio na Brasa',
    aboutText: 'Nascemos da paixão pelo verdadeiro hambúrguer artesanal americano. Trabalhamos apenas com carnes frescas selecionadas, insumos premium e preparo na hora para garantir suculência máxima até a sua porta.',
    primaryColor: '#EA580C',
    secondaryColor: '#FACC15',
    backgroundColor: '#0C0A09',
    surfaceColor: '#1C1917',
    textColor: '#FAFAF9',
    fontFamily: 'Outfit',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Pão Brioche Artesanal', 'Blend 180g Moído no Dia', 'Embalagem Térmica Anti-Vapor', 'Pagamento via PIX ou Cartão'],
    catalog: [
      { name: 'Double Smash Cheddar Bacon', description: '2 blends de 100g prensados na chapa, 4 fatias de cheddar inglês, bacon crocante e molho defumado no brioche.', price: 'R$ 36,90', category: 'Mais Vendidos', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', badge: '🔥 Campeão' },
      { name: 'Brutus Trufado 180g', description: 'Hambúrguer alto 180g na parrilla, queijo gouda, cebola caramelizada no whiskey e maionese trufada.', price: 'R$ 42,90', category: 'Especiais', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=600&q=80', badge: 'Chef' },
      { name: 'Combo Casal Smash + Fritas', description: '2 Double Smash Bacon + 1 Porção Grande de Batata Crinkle com Cheddar e Bacon + 2 Latas.', price: 'R$ 84,90', category: 'Combos', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80', badge: 'Economize R$ 18' },
      { name: 'Batata Crinkle Cheddar & Bacon', description: '400g de batata super crocante coberta com creme de cheddar artesanal e farofa de bacon.', price: 'R$ 28,90', category: 'Acompanhamentos', image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'pizzaria-forno-lenha',
    title: 'Pizzaria Napolitana & Delivery',
    category: 'Alimentação & Delivery',
    layoutVariant: 'delivery',
    interactionMode: 'cart',
    name: 'Don Vincenzo Pizzeria',
    eyebrow: '🍕 Massa de Longa Fermentação 48h • Forno a Lenha',
    headline: 'A verdadeira pizza italiana de borda aerada e ingredientes importados.',
    subheadline: 'Molho de tomate San Marzano, muçarela fresca e assada a 450°C. Escolha seus sabores favoritos e peça direto pelo nosso cardápio digital.',
    ctaText: 'Escolher Sabores',
    catalogTitle: 'Pizzas & Calzones',
    aboutText: 'Seguimos a tradição napolitana com farinha italiana 00 e fermentação natural de 48 horas, garantindo uma pizza leve, crocante por fora, macia por dentro e inesquecível.',
    primaryColor: '#DC2626',
    secondaryColor: '#16A34A',
    backgroundColor: '#110C0C',
    surfaceColor: '#1F1616',
    textColor: '#FEF2F2',
    fontFamily: 'Playfair Display',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Fermentação Natural 48h', 'Forno a Lenha 450°C', 'Borda Recheada com Catupiry Original', 'Entrega Expressa'],
    catalog: [
      { name: 'Margherita Verace (8 Fatias)', description: 'Molho San Marzano, muçarela fior di latte, manjericão fresco colhido na hora e azeite extravirgem.', price: 'R$ 64,90', category: 'Tradicionais', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80', badge: 'Clássica' },
      { name: 'Calabresa Artesanal & Catupiry', description: 'Calabresa curada fatiada fina, cebola roxa, requeijão Catupiry legítimo e orégano chileno.', price: 'R$ 69,90', category: 'Mais Pedidas', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80', badge: 'Top 1' },
      { name: 'Pepperoni Diavola com Mel Picante', description: 'Muçarela, dobro de pepperoni crocante, lascas de parmesão maturadas e fio de mel picante.', price: 'R$ 76,90', category: 'Especiais', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80', badge: 'Novidade' },
      { name: 'Pizza Doce Pistache & Chocolate Branco', description: 'Ganache de chocolate branco belga, creme de pistache italiano e pistaches tostados.', price: 'R$ 59,90', category: 'Doces', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'restaurante-japones-sushi',
    title: 'Restaurante Japonês & Sushi Delivery',
    category: 'Alimentação & Delivery',
    layoutVariant: 'luxury',
    interactionMode: 'cart',
    name: 'Kuroi Sushi Lounge',
    eyebrow: '🍣 Salmão Fresco Chileno • Alta Gastronomia Japonesa',
    headline: 'Cortes nobres, combinados autorais e frescor absoluto em cada peça.',
    subheadline: 'De combinados executivos a barcas completas para toda a família. Peça agora pelo cardápio online ou reserve sua mesa.',
    ctaText: 'Ver Combinados',
    catalogTitle: 'Cardápio Oriental',
    aboutText: 'Nossos sushimen preparam cada peça no momento do pedido, utilizando salmão chileno recebido diariamente e arroz temperado na receita tradicional de Tóquio.',
    primaryColor: '#E11D48',
    secondaryColor: '#F59E0B',
    backgroundColor: '#09090B',
    surfaceColor: '#141418',
    textColor: '#F8FAFC',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Peixe Fresco Recebido Todo Dia', 'Embalagem Premium Lacrada', 'Hashis & Molhos Inclusos', 'Opções Maçaricadas e Trufadas'],
    catalog: [
      { name: 'Combinado Kuroi Chef (40 Peças)', description: '10 Sashimis Salmão, 8 Joes Trufados, 6 Niguiris Maçaricados, 8 Uramakis Filadélfia e 8 Hot Rolls.', price: 'R$ 129,90', category: 'Combinados', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80', badge: 'Mais Pedido' },
      { name: 'Combo Individual Salmão (20 Peças)', description: '5 Sashimis, 5 Niguiris, 5 Uramakis e 5 Joes de Salmão com Cream Cheese.', price: 'R$ 68,90', category: 'Combinados', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=600&q=80' },
      { name: 'Temaki Salmão Completo (220g)', description: 'Cone crocante de alga nori recheado até a base com cubos de salmão fresco, cream cheese e cebolinha.', price: 'R$ 38,90', category: 'Temakis', image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=600&q=80' },
      { name: 'Hot Filadélfia Crispy (12 Unidades)', description: 'Empanado na farinha panko dourada com cobertura de tarê artesanal e gergelim torrado.', price: 'R$ 36,90', category: 'Quentes', image: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'acaiteria-sorveteria',
    title: 'Açaiteria & Gelateria Premium',
    category: 'Alimentação & Delivery',
    layoutVariant: 'delivery',
    interactionMode: 'cart',
    name: 'Açaí Concept & Gelato',
    eyebrow: '🟣 Açaí Puro do Pará • Zero Cristal de Gelo',
    headline: 'Cremosidade absurda com camadas generosas de Nutella, Ninho e Morango.',
    subheadline: 'Monte seu copo ou barca do seu jeito e receba geladinho em minutos no conforto da sua casa.',
    ctaText: 'Montar Meu Açaí',
    catalogTitle: 'Copos, Tigelas & Barcas',
    aboutText: 'Nosso açaí é batido na textura de gelato italiano, sem cristais de gelo, acompanhado das melhores marcas originais: Leite Ninho, Nutella, Ovomaltine e frutas frescas cortadas na hora.',
    primaryColor: '#9333EA',
    secondaryColor: '#FACC15',
    backgroundColor: '#0F0718',
    surfaceColor: '#1E1030',
    textColor: '#FAF5FF',
    fontFamily: 'Outfit',
    borderRadius: '24px',
    heroImage: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Textura Cremosa Zero Gelo', 'Nutella & Leite Ninho Originais', 'Pote Térmico Anti-Derretimento', 'Frutas Cortadas na Hora'],
    catalog: [
      { name: 'Copo Supremo Nutella & Ninho 500ml', description: 'Camadas intercaladas de açaí trufado, borda de Nutella original, creme de Ninho e morangos frescos.', price: 'R$ 28,90', category: 'Copos Montados', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80', badge: 'Mais Pedido' },
      { name: 'Copo Pistache Dubai 500ml', description: 'Açaí puro com ganache de pistache, lascas de chocolate branco e castanhas caramelizadas.', price: 'R$ 32,90', category: 'Especiais', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80', badge: 'Tendência' },
      { name: 'Barca Giga 1 Litro (8 Adicionais)', description: 'Ideal para dividir: 1 litro de açaí + morango, banana, kiwi, Nutella, Ninho, Paçoca, Confete e Bis.', price: 'R$ 58,90', category: 'Para Compartilhar', image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'cafeteria-padaria-artesanal',
    title: 'Cafeteria Especial & Padaria Artesanal',
    category: 'Alimentação & Delivery',
    layoutVariant: 'modern',
    interactionMode: 'cart',
    name: 'Grão & Forno Roastery',
    eyebrow: '☕ Cafés Especiais 86+ Pontos • Pães de Fermentação Natural',
    headline: 'O aroma do café recém-torrado com croissants folhados que derretem na boca.',
    subheadline: 'Encomende sua cesta de brunch, pães sourdough levain ou passe para viver uma experiência única.',
    ctaText: 'Ver Menu da Manhã',
    catalogTitle: 'Padaria, Brunch & Cafés',
    aboutText: 'Torramos nossos próprios grãos de pequenos produtores da Mantiqueira e assamos fornadas frescas de croissants franceses e pães de fermentação natural todas as manhãs.',
    primaryColor: '#B45309',
    secondaryColor: '#D97706',
    backgroundColor: '#FAF7F2',
    surfaceColor: '#FFFFFF',
    textColor: '#1C1917',
    fontFamily: 'Playfair Display',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Grãos 100% Arábica Especial', 'Manteiga Francesa nos Folhados', 'Brunch Servido o Dia Todo', 'Wi-Fi Rápido & Pet Friendly'],
    catalog: [
      { name: 'Croissant Amanteigado de Amêndoas', description: 'Folhado francês crocante recheado com creme frangipane e lâminas de amêndoas tostadas.', price: 'R$ 22,00', category: 'Viennoiserie', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80', badge: 'Fornada 8h' },
      { name: 'Combo Brunch para Dois', description: '2 Cappuccinos + 2 Croissants Recheados + Pão Levain na Chapa + Ovos Cremosos + Frutas.', price: 'R$ 94,00', category: 'Brunch', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80', badge: 'Mais Pedido' },
      { name: 'Pão Sourdough Rústico (750g)', description: 'Fermentação natural de 36 horas, casca caramelizada e miolo alveolado.', price: 'R$ 32,00', category: 'Padaria', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'confeitaria-doceria',
    title: 'Confeitaria Fina & Doceria Gourmet',
    category: 'Alimentação & Delivery',
    layoutVariant: 'modern',
    interactionMode: 'cart',
    name: 'Douce Atelier Confeitaria',
    eyebrow: '🍰 Chocolate Belga Callebaut • Encomendas & Pronta-Entrega',
    headline: 'Bolos comemorativos, tortas vitrine e doces finos que transformam momentos em arte.',
    subheadline: 'Temos fatias, bentô cakes, brigadeiros gourmet para pronta-entrega hoje e bolos sob encomenda.',
    ctaText: 'Pedir Pronta-Entrega',
    catalogTitle: 'Vitrine do Dia & Encomendas',
    aboutText: 'Confeitaria autoral feita sem conservantes, com fava de baunilha real, manteiga extra, frutas vermelhas frescas e o legítimo chocolate belga.',
    primaryColor: '#DB2777',
    secondaryColor: '#F472B6',
    backgroundColor: '#FFF5F7',
    surfaceColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Playfair Display',
    borderRadius: '24px',
    heroImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Chocolate Belga 100%', 'Pronta-Entrega Diária', 'Embalagem Presenteável', 'Bolos Personalizados'],
    catalog: [
      { name: 'Fatia Red Velvet com Frutas Vermelhas', description: 'Massa aveludada de cacau com recheio duplo de cream cheese frosting e geleia artesanal.', price: 'R$ 24,90', category: 'Fatias & Potes', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80', badge: 'Favorita' },
      { name: 'Caixa Presente 12 Brigadeiros Belgas', description: 'Ao leite Callebaut, Pistache, Ninho com Nutella, Ferrero e Brulee maçaricado.', price: 'R$ 49,90', category: 'Presentes', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80' },
      { name: 'Bolo Festivo Chocolatudo (1,5kg)', description: 'Serve 15 fatias. Massa black cacau com brigadeiro meio amargo cremoso e morangos.', price: 'R$ 165,00', category: 'Bolos Inteiros', image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'churrascaria-espetinho',
    title: 'Churrascaria, Parrilla & Espetinhos',
    category: 'Alimentação & Delivery',
    layoutVariant: 'delivery',
    interactionMode: 'cart',
    name: 'Fogo & Brasa Parrilla',
    eyebrow: '🥩 Cortes Nobres na Lenha • Jantinha Completa',
    headline: 'Picanha, ancho e espetinhos suculentos assados na brasa de verdade.',
    subheadline: 'Acompanha arroz soltinho, feijão tropeiro da casa, mandioca derretendo e vinagrete fresco.',
    ctaText: 'Pedir Churrasco na Brasa',
    catalogTitle: 'Cortes, Espetos & Guarnições',
    aboutText: 'Acendemos a parrilla todos os dias com lenha de macieira para entregar o sabor defumado autêntico do churrasco gaúcho direto na sua mesa.',
    primaryColor: '#D97706',
    secondaryColor: '#EF4444',
    backgroundColor: '#0C0A09',
    surfaceColor: '#1C1917',
    textColor: '#FAFAF9',
    fontFamily: 'Syne',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Carnes Certificadas Angus', 'Mandioca que Derrete', 'Feijão Tropeiro Artesanal', 'Porções Familiares'],
    catalog: [
      { name: 'Picanha na Brasa para 3 Pessoas (700g)', description: 'Picanha fatiada no ponto desejado + Arroz + Tropeiro + Mandioca + Farofa + Vinagrete.', price: 'R$ 149,90', category: 'Churrasco Família', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', badge: 'Serve 3' },
      { name: 'Jantinha Completa + 2 Espetos Nobres', description: 'Escolha 2 espetos (Contra-filé, Medalhão de Frango ou Kafta com Queijo) + guarnições completas.', price: 'R$ 39,90', category: 'Individual', image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80', badge: 'Campeão' },
      { name: 'Pão de Alho Recheado com Costela', description: 'Baguete crocante na brasa com creme de alho, costela desfiada e provolone maçaricado.', price: 'R$ 24,90', category: 'Entradas', image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'marmitaria-fit-saudavel',
    title: 'Marmitaria Fit & Alimentação Saudável',
    category: 'Alimentação & Delivery',
    layoutVariant: 'modern',
    interactionMode: 'cart',
    name: 'VerdeVita Fit Kitchen',
    eyebrow: '🥗 Comida Saudável de Verdade • Kits Semanais & Almoço',
    headline: 'Praticidade e sabor de restaurante para sua dieta render a semana inteira.',
    subheadline: 'Marmitas balanceadas por nutricionista, ultracongeladas sem conservantes ou frescas para o almoço.',
    ctaText: 'Montar Meu Kit Fit',
    catalogTitle: 'Kits Semanais & Pratos do Dia',
    aboutText: 'Usamos apenas azeite extravirgem, sal marinho, temperos naturais e proteínas magras pesadas na balança para você atingir seus objetivos sem cozinhar.',
    primaryColor: '#16A34A',
    secondaryColor: '#84CC16',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['100% Azeite Extravirgem', 'Pesagem Exata de Macros', 'Embalagem Livre de BPA', 'Aceitamos Vale-Refeição'],
    catalog: [
      { name: 'Kit 10 Marmitas Low Carb / Definição', description: '10 refeições variadas de 350g com frango grelhado, patinho moído, tilápia e legumes no vapor.', price: 'R$ 189,90', category: 'Kits Congelados', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80', badge: 'R$ 18,99/un' },
      { name: 'Bowl Salmão Grelhado & Quinoa (400g)', description: 'Salmão em crosta de gergelim, mix de quinoa, manga, avocado, edamame e molho cítrico.', price: 'R$ 42,90', category: 'Almoço Fresco', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80' },
      { name: 'Escondidinho de Batata-Doce com Frango', description: 'Purê cremoso de batata-doce com peito de frango desfiado ao molho de tomate natural.', price: 'R$ 22,90', category: 'Avulsas', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'bar-gastrobar-drinks',
    title: 'Bar, Pub & Gastrobar de Drinks',
    category: 'Alimentação & Delivery',
    layoutVariant: 'bold',
    interactionMode: 'booking',
    name: 'Alquimia Gastrobar & Lounge',
    eyebrow: '🍸 Coquetelaria Autoral • Música ao Vivo & Tapas',
    headline: 'Drinks premiados, gastronomia para compartilhar e a melhor noite da cidade.',
    subheadline: 'Confira nosso cardápio da noite e garanta a reserva da sua mesa ou aniversário com condições VIP.',
    ctaText: 'Reservar Mesa / Aniversário',
    catalogTitle: 'Drinks Autorais & Petiscos',
    aboutText: 'Um ambiente sofisticado e vibrante que une mixologia contemporânea, chopp artesanal trincando e pratos pensados para compartilhar com amigos.',
    primaryColor: '#F59E0B',
    secondaryColor: '#EC4899',
    backgroundColor: '#09090B',
    surfaceColor: '#141418',
    textColor: '#F8FAFC',
    fontFamily: 'Syne',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Happy Hour até às 20h', 'Benefícios para Aniversariantes', 'DJ & Música ao Vivo', 'Área Externa Climatizada'],
    catalog: [
      { name: 'Moscow Mule com Espuma de Gengibre', description: 'Vodka importada, redução artesanal de gengibre, limão tahiti e espuma cremosa cítrica.', price: 'R$ 34,00', category: 'Drinks', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80', badge: 'Mais Pedido' },
      { name: 'Dadinhos de Tapioca com Geleia de Pimenta', description: '12 unidades crocantes de queijo coalho com melaço de cana picante.', price: 'R$ 42,00', category: 'Para Compartilhar', image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80' },
      { name: 'Combo Aniversariante VIP (Reserva)', description: 'Mesa reservada + 1 Drink Cortesia + Sobremesa com Vela no dia da comemoração.', price: 'Reserva Grátis', category: 'Reservas', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80', badge: 'VIP' },
    ],
  },
  {
    id: 'lanchonete-pastelaria',
    title: 'Pastelaria, Salgados & Lanchonete',
    category: 'Alimentação & Delivery',
    layoutVariant: 'delivery',
    interactionMode: 'cart',
    name: 'Crocante Pastelaria & Caldo',
    eyebrow: '🥟 Pastel de Feira de 30cm • Recheio até as Bordas',
    headline: 'Pastel sequinho, crocante e super recheado frito na hora do seu pedido.',
    subheadline: 'Mais de 30 sabores salgados e doces, porções de mini coxinhas e caldo de cana gelado.',
    ctaText: 'Fazer Pedido Agora',
    catalogTitle: 'Pastéis, Salgados & Bebidas',
    aboutText: 'Massa caseira exclusiva que não absorve óleo e recheios fartos temperados todos os dias com ingredientes de primeira linha.',
    primaryColor: '#EAB308',
    secondaryColor: '#DC2626',
    backgroundColor: '#111111',
    surfaceColor: '#1E1E1E',
    textColor: '#FAFAFA',
    fontFamily: 'Outfit',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['30cm de Recheio Real', 'Massa Sequinha & Crocante', 'Vinagrete & Maionese Temperada Grátis', 'Entrega Rápida'],
    catalog: [
      { name: 'Pastel Especial Carne Seca com Catupiry', description: 'Carne seca desfiada na manteiga de garrafa com muito Catupiry original e queijo muçarela.', price: 'R$ 24,90', category: 'Pastéis 30cm', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', badge: 'Campeão' },
      { name: 'Combo 30 Mini Salgados + Refrigerante 1,5L', description: 'Coxinhas de frango, bolinhas de queijo e travesseirinhos de carne fritos na hora.', price: 'R$ 44,90', category: 'Combos', image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80' },
    ],
  },

  // ================= 2. BELEZA & ESTÉTICA (7 MODELOS) =================
  {
    id: 'barbearia-vip',
    title: 'Barbearia VIP & Club Masculino',
    category: 'Beleza & Estética',
    layoutVariant: 'luxury',
    interactionMode: 'booking',
    name: 'Dom Corleone Barber Club',
    eyebrow: '💈 Visagismo Masculino • Toalha Quente & Cerveja Cortesia',
    headline: 'Mais que um corte: o seu ritual de estilo, barba alinhada e respeito.',
    subheadline: 'Profissionais especialistas em degradê navalhado, cortes clássicos e barboterapia com ozônio. Escolha o serviço e agende seu horário sem fila.',
    ctaText: 'Agendar Meu Horário',
    catalogTitle: 'Serviços & Planos de Assinatura',
    aboutText: 'Ambiente climatizado com poltronas clássicas, primeira cerveja artesanal por nossa conta, sinuca e barbeiros mestres em visagismo.',
    primaryColor: '#D4AF37',
    secondaryColor: '#F3E5AB',
    backgroundColor: '#09090B',
    surfaceColor: '#121216',
    textColor: '#F8FAFC',
    fontFamily: 'Playfair Display',
    borderRadius: '8px',
    heroImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Toalha Quente & Massagem Facial', 'Primeira Cerveja ou Café Grátis', 'Atendimento Pontual Sem Espera', 'Estacionamento Exclusivo'],
    catalog: [
      { name: 'Combo Corte Visagista + Barboterapia', description: 'Corte personalizado, lavagem especial, barba com vapor de ozônio, toalha quente e finalização com pomada.', price: 'R$ 95,00', category: 'Mais Procurados', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80', badge: 'Completo' },
      { name: 'Corte Masculino & Acabamento', description: 'Degradê, social ou executivo na tesoura com lavagem e estilização.', price: 'R$ 55,00', category: 'Avulsos', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80' },
      { name: 'Clube VIP Corte & Barba Ilimitado', description: 'Corte e faça a barba quantas vezes quiser no mês por um valor fixo.', price: 'R$ 169,90/mês', category: 'Assinatura', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80', badge: 'VIP Club' },
    ],
  },
  {
    id: 'salao-beleza-cabelo',
    title: 'Salão de Beleza, Mechas & Hair Studio',
    category: 'Beleza & Estética',
    layoutVariant: 'luxury',
    interactionMode: 'booking',
    name: 'Maison Lumière Hair Studio',
    eyebrow: '✨ Especialistas em Loiros Saudáveis, Morena Iluminada & Tratamentos',
    headline: 'Realce sua beleza única com mechas personalizadas e fios impecáveis.',
    subheadline: 'Trabalhamos exclusivamente com Kérastase, Wella e Braé. Faça seu diagnóstico capilar e agende seu horário.',
    ctaText: 'Agendar Avaliação / Horário',
    catalogTitle: 'Mechas, Cortes & Cronograma',
    aboutText: 'Mais de 10 anos transformando a autoestima feminina com técnicas de iluminação sem marcação que preservam 100% a saúde da fibra capilar.',
    primaryColor: '#C084FC',
    secondaryColor: '#F472B6',
    backgroundColor: '#0C0A0E',
    surfaceColor: '#18141C',
    textColor: '#FAF5FF',
    fontFamily: 'Playfair Display',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Teste de Mecha Incluso', 'Produtos Kérastase & Wella', 'Espaço Noivas & Madrinhas', 'Cappuccino & Espumante Cortesia'],
    catalog: [
      { name: 'Protocolo Mechas Iluminadas + Tratamento Plex', description: 'Técnica personalizada (Blonde ou Morena Iluminada), tonalização, reconstrução Plex e escova.', price: 'Sob Avaliação', category: 'Cor & Mechas', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80', badge: 'Assinatura' },
      { name: 'Corte Bordado + Nutrição Kérastase + Escova', description: 'Renovação das pontas com movimento leve e tratamento profundo de brilho espelhado.', price: 'R$ 220,00', category: 'Corte & Tratamento', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'clinica-estetica-avancada',
    title: 'Clínica de Estética Avançada & Harmonização',
    category: 'Beleza & Estética',
    layoutVariant: 'clinical',
    interactionMode: 'booking',
    name: 'Aura Clinic Estética Avançada',
    eyebrow: '💎 Botox, Bioestimuladores, Lavieen & Estética Corporal',
    headline: 'Rejuvenescimento natural e elegante com protocolos médicos de alta tecnologia.',
    subheadline: 'Resultados sofisticados sem exageros. Agende sua consulta de avaliação estética individualizada.',
    ctaText: 'Agendar Avaliação Estética',
    catalogTitle: 'Protocolos Faciais & Corporais',
    aboutText: 'Unimos ciência, tecnologias aprovadas pela ANVISA e olhar artístico para entregar resultados harmônicos que rejuvenescem mantendo sua identidade.',
    primaryColor: '#E11D48',
    secondaryColor: '#FDA4AF',
    backgroundColor: '#FFF1F2',
    surfaceColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Playfair Display',
    borderRadius: '24px',
    heroImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Tecnologias Originais ANVISA', 'Avaliação Facial 3D', 'Parcelamento em até 12x', 'Acompanhamento Pós-Procedimento'],
    catalog: [
      { name: 'Toxina Botulínica Full Face (3 Regiões + Retoque)', description: 'Suavização de linhas da testa, glabela e área dos olhos com resultado natural e retorno de 15 dias incluso.', price: 'Agendar Avaliação', category: 'Injetáveis', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80', badge: 'Mais Procurado' },
      { name: 'Laser Lavieen (Efeito BB Laser Coreano)', description: 'Fecha poros, uniformiza manchas, estimula colágeno e deixa a pele com efeito porcelana.', price: 'R$ 490,00', category: 'Tecnologias', image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=600&q=80', badge: 'Glow' },
      { name: 'Preenchimento Labial Hidratação & Contorno', description: 'Ácido hialurônico importado para volume delicado, contorno definido e hidratação profunda.', price: 'Agendar Avaliação', category: 'Harmonização', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'studio-unhas-nail-designer',
    title: 'Studio de Unhas, Fibra de Vidro & Manicure',
    category: 'Beleza & Estética',
    layoutVariant: 'modern',
    interactionMode: 'booking',
    name: 'Bella Nails Studio & Spa',
    eyebrow: '💅 Alongamento em Fibra Natural • Biossegurança 100% Autoclave',
    headline: 'Unhas resistentes, finas e com acabamento impecável por até 30 dias.',
    subheadline: 'Alongamento em fibra de vidro, banho de gel, blindagem e spa dos pés. Escolha seu serviço e garanta seu horário.',
    ctaText: 'Reservar Horário no WhatsApp',
    catalogTitle: 'Serviços de Nail Design',
    aboutText: 'Trabalhamos com géis hipoalergênicos importados, materiais 100% esterilizados em autoclave hospitalar e acabamento ultra-natural que não danifica sua unha.',
    primaryColor: '#EC4899',
    secondaryColor: '#F472B6',
    backgroundColor: '#FDF2F8',
    surfaceColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '24px',
    heroImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Durabilidade de 25 a 30 Dias', 'Materiais 100% Esterilizados', 'Mais de 150 Cores em Gel', 'Garantia de 7 Dias'],
    catalog: [
      { name: 'Alongamento em Fibra de Vidro + Esmaltação em Gel', description: 'Curvatura natural, resistência extrema e brilho que não descasca por 30 dias.', price: 'R$ 160,00', category: 'Alongamentos', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80', badge: 'Destaque' },
      { name: 'Blindagem Diamante + Esmaltação em Gel', description: 'Proteção estrutural para suas unhas naturais crescerem fortes sem quebrar.', price: 'R$ 95,00', category: 'Natural', image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'sobrancelhas-cilios-lash',
    title: 'Studio de Cílios (Lash) & Sobrancelhas',
    category: 'Beleza & Estética',
    layoutVariant: 'modern',
    interactionMode: 'booking',
    name: 'Olhar de Rainha Lash & Brow',
    eyebrow: '👁️ Extensão de Cílios, Brow Lamination & Design Estratégico',
    headline: 'Acorde pronta todos os dias com um olhar marcante, leve e sofisticado.',
    subheadline: 'Volume Brasileiro, Fox Eyes, Efeito Rímel e Micropigmentação Labial/Sobrancelhas. Agende seu horário.',
    ctaText: 'Agendar Meu Olhar',
    catalogTitle: 'Cílios & Sobrancelhas',
    aboutText: 'Atendimento em maca nuvem super confortável com isolamento fio a fio perfeito, garantindo retenção prolongada sem pesar nos seus cílios naturais.',
    primaryColor: '#A855F7',
    secondaryColor: '#E879F9',
    backgroundColor: '#FAF5FF',
    surfaceColor: '#FFFFFF',
    textColor: '#1E1B4B',
    fontFamily: 'Playfair Display',
    borderRadius: '24px',
    heroImage: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Maca Nuvem Anti-Stress', 'Isolamento Seguro Fio a Fio', 'Retenção de até 35 Dias', 'Design Personalizado por Visagismo'],
    catalog: [
      { name: 'Extensão Volume Brasileiro / Efeito Fox', description: 'Fios tecnológicos em Y super leves com acabamento preenchido e olhar alongado.', price: 'R$ 150,00', category: 'Extensão de Cílios', image: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=600&q=80', badge: 'Mais Pedido' },
      { name: 'Brow Lamination + Design com Tintura', description: 'Alinhamento e nutrição dos fios da sobrancelha para efeito encorpado e moderno.', price: 'R$ 120,00', category: 'Sobrancelhas', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'spa-massoterapia',
    title: 'Spa Urbano, Massoterapia & Drenagem',
    category: 'Beleza & Estética',
    layoutVariant: 'luxury',
    interactionMode: 'booking',
    name: 'Serenità Day Spa & Wellness',
    eyebrow: '🌿 Massagem Relaxante, Pedras Quentes, Drenagem Método Renata França',
    headline: 'Desconecte-se da rotina e renove seu corpo e mente em um refúgio de paz.',
    subheadline: 'Salas climatizadas à meia-luz, aromaterapia, óleos essenciais puros e terapeutas certificadas.',
    ctaText: 'Reservar Sessão ou Vale-Presente',
    catalogTitle: 'Experiências & Terapias Corporais',
    aboutText: 'Cada detalhe do nosso spa foi desenhado para silenciar o estresse urbano desde o primeiro passo, com escalda-pés de boas-vindas e chás orgânicos.',
    primaryColor: '#059669',
    secondaryColor: '#34D399',
    backgroundColor: '#F4F7F4',
    surfaceColor: '#FFFFFF',
    textColor: '#1C2826',
    fontFamily: 'Playfair Display',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Escalda-Pés & Chá Inclusos', 'Salas Aquecidas com Aromaterapia', 'Vale-Presente Personalizado', 'Estacionamento no Local'],
    catalog: [
      { name: 'Ritual Serenità (Massagem 90min + Pedras Quentes)', description: 'Escalda-pés aromático + massagem corporal completa com óleos mornos e pedras vulcânicas.', price: 'R$ 210,00', category: 'Day Spa', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80', badge: 'Experiência' },
      { name: 'Drenagem Linfática Corporal (60min)', description: 'Redução imediata de inchaço, ativação circulatória e contorno corporal visível na primeira sessão.', price: 'R$ 160,00', category: 'Estética Corporal', image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'studio-tatuagem-piercing',
    title: 'Studio de Tatuagem Autoral & Body Piercing',
    category: 'Beleza & Estética',
    layoutVariant: 'bold',
    interactionMode: 'booking',
    name: 'Black Ink Tattoo & Piercing',
    eyebrow: '🖤 Fine Line, Realismo, Blackwork & Piercing em Titânio',
    headline: 'Arte autoral na pele com traço preciso, biossegurança hospitalar e projeto exclusivo.',
    subheadline: 'Desenvolvemos o desenho único para você. Envie sua ideia e receba seu orçamento direto no WhatsApp.',
    ctaText: 'Solicitar Orçamento da Tattoo',
    catalogTitle: 'Estilos & Body Piercing',
    aboutText: 'Estúdio privado com artistas premiados em Realismo, Fine Line e Blackwork. Utilizamos apenas pigmentos importados e joias em titânio grau implante.',
    primaryColor: '#F43F5E',
    secondaryColor: '#FB7185',
    backgroundColor: '#09090B',
    surfaceColor: '#141417',
    textColor: '#FAFAFA',
    fontFamily: 'Syne',
    borderRadius: '8px',
    heroImage: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Criação de Arte Exclusiva', 'Biossegurança ANVISA 100%', 'Joias em Titânio e Ouro 18k', 'Parcelamento em até 10x'],
    catalog: [
      { name: 'Tatuagem Fine Line / Minimalista (Até 8cm)', description: 'Traços ultrafinos e delicados com agulhas importadas e película cicatrizante inclusa.', price: 'A partir de R$ 250', category: 'Tattoo', image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=600&q=80', badge: 'Fine Line' },
      { name: 'Fechamento / Projeto Autoral Realismo', description: 'Sessão completa com criação digital prévia e acompanhamento de cicatrização.', price: 'Orçamento via WhatsApp', category: 'Projetos', image: 'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?auto=format&fit=crop&w=600&q=80' },
    ],
  },

  // ================= 3. SAÚDE & CLÍNICAS (7 MODELOS) =================
  {
    id: 'clinica-odontologica',
    title: 'Clínica Odontológica, Implantes & Lentes',
    category: 'Saúde & Clínicas',
    layoutVariant: 'clinical',
    interactionMode: 'booking',
    name: 'OdontoPrime Implantes & Estética',
    eyebrow: '🦷 Lentes de Contato Dental, Implantes Sem Dor & Invisalign',
    headline: 'Conquiste o sorriso seguro e harmônico que transforma sua presença.',
    subheadline: 'Planejamento digital 3D do sorriso antes de iniciar o tratamento. Agende sua avaliação com check-up digital.',
    ctaText: 'Agendar Avaliação Odontológica',
    catalogTitle: 'Especialidades Odontológicas',
    aboutText: 'Equipada com scanner intraoral 3D (sem massinha), sedação consciente para pacientes com receio e equipe de especialistas mestres em reabilitação oral.',
    primaryColor: '#0284C7',
    secondaryColor: '#38BDF8',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Escaneamento 3D Sem Massinha', 'Implantes de Carga Rápida', 'Atendimento de Urgência no Mesmo Dia', 'Condições Facilitadas'],
    catalog: [
      { name: 'Facetas em Resina ou Lentes de Porcelana', description: 'Transformação estética do formato e cor dos dentes com planejamento digital prévio (Test-Drive do Sorriso).', price: 'Agendar Avaliação', category: 'Estética Dental', image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80', badge: 'Destaque' },
      { name: 'Implante Dentário Guiado (Sem Cortes)', description: 'Reabilitação segura de dentes perdidos ou protocolo fixo total com tecnologia guiada por computador.', price: 'Agendar Avaliação', category: 'Implantes', image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80' },
      { name: 'Profilaxia Ultrassônica + Clareamento a Laser', description: 'Limpeza profunda com jato de bicarbonato seguida de protocolo clareador seguro para dentes sensíveis.', price: 'Consultar no WhatsApp', category: 'Prevenção & Brilho', image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'clinica-medica-popular',
    title: 'Clínica Médica Multiespecialidades & Exames',
    category: 'Saúde & Clínicas',
    layoutVariant: 'clinical',
    interactionMode: 'booking',
    name: 'MedVida Centro Médico Integrado',
    eyebrow: '🩺 Mais de 20 Especialidades Médicas • Consultas e Exames no Mesmo Lugar',
    headline: 'Cuidado médico humanizado, sem filas e com valores acessíveis para sua família.',
    subheadline: 'Cardiologia, Ginecologia, Dermatologia, Pediatria, Ortopedia e Ultrassom com agendamento para esta semana.',
    ctaText: 'Agendar Consulta / Exame',
    catalogTitle: 'Especialidades & Check-ups',
    aboutText: 'Reunimos médicos especialistas titulados e centro diagnóstico moderno para você realizar sua consulta e seus exames em um só local com rapidez.',
    primaryColor: '#0D9488',
    secondaryColor: '#2DD4BF',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    fontFamily: 'Inter',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Agendamento para a Mesma Semana', 'Retorno de Consulta Incluso', 'Exames Laboratoriais e Imagem', 'Particular Acessível & Convênios'],
    catalog: [
      { name: 'Consulta Médica com Especialista + Retorno', description: 'Clínico Geral, Cardiologia, Dermatologia, Ginecologia, Ortopedia, Endocrinologia ou Pediatria.', price: 'A partir de R$ 140', category: 'Consultas', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80', badge: 'Vagas Hoje' },
      { name: 'Check-up Executivo Completo (Consulta + 18 Exames)', description: 'Avaliação clínica completa + hemograma, colesterol, glicemia, tireoide e eletrocardiograma.', price: 'R$ 320,00', category: 'Check-ups', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'psicologia-terapia',
    title: 'Psicologia Clínica & Terapia Online/Presencial',
    category: 'Saúde & Clínicas',
    layoutVariant: 'minimal',
    interactionMode: 'booking',
    name: 'Psi. Helena Martins | Psicoterapia',
    eyebrow: '🧠 Terapia Cognitivo-Comportamental (TCC) • Online & Presencial',
    headline: 'Um espaço ético, acolhedor e seguro para cuidar da sua saúde emocional.',
    subheadline: 'Tratamento especializado para ansiedade, burnout, relacionamentos, autoestima e transições de carreira.',
    ctaText: 'Agendar Primeira Sessão',
    catalogTitle: 'Modalidades de Atendimento',
    aboutText: 'Psicóloga clínica (CRP ativo) com especialização em Terapia Cognitivo-Comportamental baseada em evidências. Atendimento a brasileiros no Brasil e no exterior.',
    primaryColor: '#4F46E5',
    secondaryColor: '#818CF8',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#1E293B',
    fontFamily: 'Playfair Display',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Sigilo Profissional Absoluto', 'Atendimento Online HD ou Presencial', 'Recibo para Reembolso de Convênio', 'Horários Flexíveis'],
    catalog: [
      { name: 'Psicoterapia Individual (Online ou Presencial)', description: 'Sessões semanais de 50 minutos focadas em autoconhecimento, manejo da ansiedade e metas práticas.', price: 'Consultar Horários', category: 'Individual', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80', badge: 'TCC' },
      { name: 'Terapia de Casal & Relacionamentos', description: 'Mediação de conflitos, melhoria na comunicação afetiva e reconstrução de vínculos.', price: 'Consultar Horários', category: 'Casal', image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'nutricao-emagrecimento',
    title: 'Nutricionista Esportiva & Emagrecimento',
    category: 'Saúde & Clínicas',
    layoutVariant: 'clinical',
    interactionMode: 'booking',
    name: 'Dra. Camila Prado | Nutrição Integrativa',
    eyebrow: '🥑 Emagrecimento Definitivo, Hipertrofia & Bioimpedância InBody',
    headline: 'Alcance o corpo que você deseja com um plano alimentar gostoso e sem terrorismo.',
    subheadline: 'Cardápio 100% adaptado à sua rotina, aplicativo exclusivo no celular e suporte direto comigo no WhatsApp.',
    ctaText: 'Agendar Minha Consulta',
    catalogTitle: 'Programas de Acompanhamento',
    aboutText: 'Mais de 1.800 pacientes transformados com nutrição real: usando alimentos que você já tem em casa e respeitando suas refeições livres.',
    primaryColor: '#16A34A',
    secondaryColor: '#4ADE80',
    backgroundColor: '#F0FDF4',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '24px',
    heroImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Exame de Bioimpedância Incluso', 'Plano Entregue na Hora + App', 'Lista de Compras & Receitas Fit', 'Suporte no WhatsApp por 60 Dias'],
    catalog: [
      { name: 'Consulta Avulsa + Exame de Bioimpedância', description: 'Avaliação corporal completa (% de gordura e massa magra), solicitação de exames e plano personalizado.', price: 'R$ 280,00', category: 'Consulta', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80', badge: 'Completa' },
      { name: 'Protocolo Transformação 90 Dias (3 Consultas)', description: 'Acompanhamento trimestral para emagrecimento ou hipertrofia com ajustes estratégicos mensais.', price: '3x R$ 230,00', category: 'Planos', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80', badge: 'Mais Escolhido' },
    ],
  },
  {
    id: 'fisioterapia-quiropraxia',
    title: 'Fisioterapia, Osteopatia & Quiropraxia',
    category: 'Saúde & Clínicas',
    layoutVariant: 'clinical',
    interactionMode: 'booking',
    name: 'Axis Coluna & Reabilitação',
    eyebrow: '🦴 Alívio Imediato da Dor • Hérnia de Disco, Ciático & Lesões Esportivas',
    headline: 'Volte a se movimentar sem dor nas costas, pescoço ou articulações.',
    subheadline: 'Tratamento manual especializado em coluna vertebral, quiropraxia clínica e recuperação acelerada de atletas.',
    ctaText: 'Agendar Avaliação da Dor',
    catalogTitle: 'Tratamentos Especializados',
    aboutText: 'Não tratamos apenas o sintoma: identificamos a causa biomecânica da sua dor para devolver sua liberdade de movimento já nas primeiras sessões.',
    primaryColor: '#0284C7',
    secondaryColor: '#0EA5E9',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    fontFamily: 'Inter',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Alívio Já na 1ª Sessão', 'Atendimento Individual 60min', 'Maca de Flexo-Distração', 'Reembolso de Planos de Saúde'],
    catalog: [
      { name: 'Sessão de Quiropraxia & Liberação Miofascial', description: 'Ajuste articular seguro, descompressão da coluna, ventosaterapia e liberação muscular profunda.', price: 'R$ 180,00', category: 'Coluna & Dor', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80', badge: 'Alívio Rápido' },
      { name: 'Reabilitação Ortopédica & Esportiva', description: 'Fisioterapia individualizada para joelho, ombro, tornozelo e pós-operatório.', price: 'R$ 160,00', category: 'Fisioterapia', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'laboratorio-exames',
    title: 'Laboratório de Análises Clínicas & Coleta Domiciliar',
    category: 'Saúde & Clínicas',
    layoutVariant: 'clinical',
    interactionMode: 'booking',
    name: 'BioLab Diagnósticos & Saúde',
    eyebrow: '🔬 Resultados Online no Mesmo Dia • Coleta em Casa Sem Taxa',
    headline: 'Exames de sangue, check-ups, sexagem fetal e vacinas com precisão máxima.',
    subheadline: 'Envie a foto do seu pedido médico pelo WhatsApp e receba o orçamento em 2 minutos.',
    ctaText: 'Enviar Pedido Médico / Agendar',
    catalogTitle: 'Exames & Coleta Domiciliar',
    aboutText: 'Tecnologia laboratorial automatizada, sala kids com óculos de realidade virtual para coleta infantil sem choro e atendimento domiciliar pontual.',
    primaryColor: '#2563EB',
    secondaryColor: '#38BDF8',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    fontFamily: 'Inter',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Coleta Domiciliar Gratuita', 'Laudos Online no Celular', 'Desjejum Cortesia na Unidade', 'Mais de 40 Convênios Aceitos'],
    catalog: [
      { name: 'Orçamento de Pedido Médico via WhatsApp', description: 'Tire uma foto da sua guia médica e receba valores e instruções de jejum imediatamente.', price: 'Orçamento Grátis', category: 'Exames', image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80', badge: '2 Minutos' },
      { name: 'Sexagem Fetal a partir da 8ª Semana', description: 'Descubra o sexo do bebê com 99,9% de precisão através de uma simples amostra de sangue materno.', price: 'R$ 199,00', category: 'Gestantes', image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'otica-saude-visual',
    title: 'Ótica & Lentes de Alta Precisão',
    category: 'Saúde & Clínicas',
    layoutVariant: 'modern',
    interactionMode: 'whatsapp',
    name: 'Visão Nobre Ótica & Design',
    eyebrow: '👓 Lentes Varilux, Crizal & Armações de Grife • Laboratório Próprio',
    headline: 'Seus óculos prontos com precisão digital e estilo que valoriza seu rosto.',
    subheadline: 'Envie sua receita pelo WhatsApp para cotação rápida ou agende seu teste de visão gratuito com consultora.',
    ctaText: 'Enviar Receita no WhatsApp',
    catalogTitle: 'Armações, Lentes & Solares',
    aboutText: 'Consultoria de visagismo óptico com medição digital pupilar a laser, garantia de adaptação em lentes multifocais e entrega expressa em até 1 hora para graus simples.',
    primaryColor: '#0F172A',
    secondaryColor: '#D97706',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Óculos Prontos em até 1 Hora', 'Garantia Total de Adaptação', 'Parcelamento em até 12x Sem Juros', 'Ajuste e Limpeza Vitalícios'],
    catalog: [
      { name: 'Combo Armação Acetato Premium + Lentes Filtro Azul', description: 'Proteção completa contra telas de computador e celular com antirreflexo hidrofóbico.', price: '10x R$ 34,90', category: 'Promoções', image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80', badge: 'Campeão' },
      { name: 'Lentes Multifocais Digitais de Campo Amplo', description: 'Visão nítida para perto, intermediário e longe com garantia incondicional de adaptação.', price: 'Cotar Receita', category: 'Multifocais', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80' },
    ],
  },

  // ================= 4. FITNESS & ESPORTES (5 MODELOS) =================
  {
    id: 'academia-musculacao',
    title: 'Academia de Musculação & Centro Fitness',
    category: 'Fitness & Esportes',
    layoutVariant: 'bold',
    interactionMode: 'booking',
    name: 'Titan Gym Performance Club',
    eyebrow: '💪 Equipamentos Importados Hammer Strength • Climatizada 24h',
    headline: 'A estrutura definitiva para você construir sua melhor versão.',
    subheadline: 'Musculação de alto nível, cárdio completo, aulas coletivas inclusas e avaliação física. Garanta sua diária experimental gratuita.',
    ctaText: 'Resgatar Free Pass (3 Dias)',
    catalogTitle: 'Planos & Modalidades',
    aboutText: 'Mais de 1.200m² de área climatizada, equipamentos biomecânicos importados, vestiários padrão hotel e professores em sala o tempo todo.',
    primaryColor: '#84CC16',
    secondaryColor: '#A3E635',
    backgroundColor: '#09090B',
    surfaceColor: '#141418',
    textColor: '#FAFAFA',
    fontFamily: 'Syne',
    borderRadius: '8px',
    heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Sem Taxa de Matrícula ou Cancelamento', 'App de Treino Exclusivo', 'Ambiente 100% Climatizado', 'Estacionamento Grátis'],
    catalog: [
      { name: 'Plano Black Titan (Acesso Total + Leve 1 Amigo)', description: 'Musculação livre em todos os horários, todas as aulas coletivas e cadeira de massagem.', price: 'R$ 129,90/mês', category: 'Planos', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80', badge: 'Mais Assinado' },
      { name: 'Free Pass 3 Dias Grátis', description: 'Venha treinar por 3 dias sem custo para conhecer nossa estrutura e equipe.', price: 'R$ 0,00', category: 'Experimental', image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=600&q=80', badge: 'Grátis' },
    ],
  },
  {
    id: 'personal-trainer-consultoria',
    title: 'Personal Trainer & Consultoria Online',
    category: 'Fitness & Esportes',
    layoutVariant: 'bold',
    interactionMode: 'whatsapp',
    name: 'Lucas Viana | Personal & Team',
    eyebrow: '🔥 Especialista em Emagrecimento e Definição Feminina & Masculina',
    headline: 'Pare de perder tempo na academia fazendo fichas genéricas sem resultado.',
    subheadline: 'Treino periodizado sob medida no aplicativo com vídeos explicativos, correção de postura e acompanhamento diário.',
    ctaText: 'Entrar para a Consultoria',
    catalogTitle: 'Planos de Treinamento',
    aboutText: 'Mais de 900 alunos em 14 países transformaram seus físicos com uma metodologia direta: treinos eficientes de 45 minutos baseados em biomecânica.',
    primaryColor: '#F97316',
    secondaryColor: '#FB923C',
    backgroundColor: '#09090B',
    surfaceColor: '#141418',
    textColor: '#FAFAFA',
    fontFamily: 'Space Grotesk',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['App Exclusivo com Vídeos em HD', 'Análise de Execução por Vídeo', 'Treino em Academia ou em Casa', 'Suporte Direto no WhatsApp'],
    catalog: [
      { name: 'Consultoria Online Trimestral (90 Dias)', description: '3 periodizações completas de treino + guia de cardio + suporte individual no WhatsApp.', price: 'R$ 297,00', category: 'Online', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80', badge: 'Mais Vendido' },
      { name: 'Personal Presencial VIP (Pacote Mensal)', description: 'Acompanhamento presencial exclusivo na sua academia ou condomínio.', price: 'Consultar Vagas', category: 'Presencial', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'box-crossfit-funcional',
    title: 'Box de CrossFit & Treinamento Funcional',
    category: 'Fitness & Esportes',
    layoutVariant: 'bold',
    interactionMode: 'booking',
    name: 'IronBox CrossFit & Conditioning',
    eyebrow: '🏋️ Comunidade Forte • Condicionamento, Força e Queima Calórica',
    headline: 'A melhor hora do seu dia começa no nosso Box.',
    subheadline: 'Turmas adaptadas para todos os níveis — mesmo que você esteja começando do absoluto zero hoje.',
    ctaText: 'Agendar Aula Experimental Grátis',
    catalogTitle: 'Programas & Horários',
    aboutText: 'No IronBox ninguém treina sozinho. Nossos coaches acompanham cada repetição e adaptam as cargas para o seu condicionamento atual.',
    primaryColor: '#EAB308',
    secondaryColor: '#FACC15',
    backgroundColor: '#0A0A0A',
    surfaceColor: '#171717',
    textColor: '#FAFAFA',
    fontFamily: 'Syne',
    borderRadius: '8px',
    heroImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Adaptação para Iniciantes', 'Até 800 kcal por Aula', 'Aceitamos Gympass / Wellhub e TotalPass', 'Comunidade e Eventos'],
    catalog: [
      { name: 'Semana Experimental Gratuita', description: '3 aulas com acompanhamento de coach para você sentir a energia do Box.', price: 'Grátis', category: 'Iniciantes', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80', badge: 'Comece Aqui' },
      { name: 'Plano Mensal Livre (CrossFit + Hyrox)', description: 'Acesso ilimitado a todas as turmas da manhã, almoço e noite + Open Box.', price: 'R$ 269,00/mês', category: 'Planos', image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'studio-pilates-yoga',
    title: 'Studio de Pilates Clássico & Yoga',
    category: 'Fitness & Esportes',
    layoutVariant: 'minimal',
    interactionMode: 'booking',
    name: 'Equilíbrio Pilates & Fisioterapia',
    eyebrow: '🧘‍♀️ Turmas Reduzidas (Máx. 3 Alunos) • Conduzido por Fisioterapeutas',
    headline: 'Postura alinhada, corpo tonificado e zero dores na coluna.',
    subheadline: 'Pilates em aparelhos para adultos, gestantes, idosos e reabilitação de hérnia de disco. Agende sua aula experimental.',
    ctaText: 'Agendar Aula Experimental',
    catalogTitle: 'Modalidades de Pilates',
    aboutText: 'Nosso studio oferece atendimento personalizado com no máximo 3 alunos por fisioterapeuta, garantindo exercícios exclusivos para a sua necessidade.',
    primaryColor: '#0D9488',
    secondaryColor: '#5EEAD4',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    fontFamily: 'Playfair Display',
    borderRadius: '24px',
    heroImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['100% Fisioterapeutas Especialistas', 'Máximo 3 Alunos por Horário', 'Pilates para Gestantes & Terceira Idade', 'Reposição Fácil pelo App'],
    catalog: [
      { name: 'Aula Experimental + Avaliação Postural', description: 'Conheça nossos aparelhos e receba um diagnóstico completo de flexibilidade e coluna.', price: 'Agendar Grátis', category: 'Experimental', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80', badge: 'Grátis' },
      { name: 'Pilates Aparelhos 2x ou 3x por Semana', description: 'Fortalecimento de core, alívio de dores e definição muscular sem impacto articular.', price: 'Consultar Planos', category: 'Mensal', image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'artes-marciais-jiu-jitsu',
    title: 'Academia de Jiu-Jitsu, Muay Thai & Defesa Pessoal',
    category: 'Fitness & Esportes',
    layoutVariant: 'bold',
    interactionMode: 'booking',
    name: 'Bushido Fight Academy',
    eyebrow: '🥋 Jiu-Jitsu, Muay Thai & Turmas Kids Antivalentões',
    headline: 'Disciplina, autoconfiança, defesa pessoal e condicionamento físico real.',
    subheadline: 'Turmas masculinas, femininas e infantis a partir de 4 anos. Agende sua semana experimental gratuita.',
    ctaText: 'Agendar Aula Experimental',
    catalogTitle: 'Modalidades & Turmas',
    aboutText: 'Tatame olímpico higienizado a cada treino, mestres faixa-preta diplomados e ambiente familiar focado em evolução técnica e respeito.',
    primaryColor: '#DC2626',
    secondaryColor: '#F87171',
    backgroundColor: '#09090B',
    surfaceColor: '#141418',
    textColor: '#FAFAFA',
    fontFamily: 'Syne',
    borderRadius: '8px',
    heroImage: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Empréstimo de Kimono na 1ª Aula', 'Turmas Kids a partir de 4 Anos', 'Treino Feminino Exclusivo', 'Ambiente Familiar Seguro'],
    catalog: [
      { name: 'Jiu-Jitsu Adulto & Iniciantes', description: 'Aprenda a arte suave do zero com metodologia progressiva e segura.', price: 'Aula Experimental Grátis', category: 'Jiu-Jitsu', image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=600&q=80', badge: 'Tatame' },
      { name: 'Muay Thai Queima Extrema', description: 'Defesa pessoal e alto gasto calórico para homens e mulheres.', price: 'Aula Experimental Grátis', category: 'Striking', image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=600&q=80' },
    ],
  },

  // ================= 5. PET & VETERINÁRIA (4 MODELOS) =================
  {
    id: 'pet-shop-banho-tosa',
    title: 'Pet Shop, Estética Animal & Banho e Tosa',
    category: 'Pet & Veterinária',
    layoutVariant: 'modern',
    interactionMode: 'booking',
    name: 'MimoPet Estética & Boutique',
    eyebrow: '🐾 Banho com Água Morna Filtrada • Visor de Vidro & Táxi Dog',
    headline: 'Carinho, cheirinho de bebê e cuidado VIP para o seu melhor amigo.',
    subheadline: 'Shampoos hipoalergênicos Hydra, secagem silenciosa sem gaiolas de espera e serviço de leva e traz.',
    ctaText: 'Agendar Banho & Tosa',
    catalogTitle: 'Serviços & Clubinho Pet',
    aboutText: 'Aqui seu pet é tratado como membro da família. Nosso banho e tosa é 100% envidraçado e enviamos fotos e vídeos do seu pet durante o atendimento.',
    primaryColor: '#0D9488',
    secondaryColor: '#F59E0B',
    backgroundColor: '#F0FDFA',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    fontFamily: 'Outfit',
    borderRadius: '24px',
    heroImage: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Produtos Hydra Hipoalergênicos', 'Táxi Pet Climatizado', 'Corte de Unhas e Limpeza de Ouvidos Inclusos', 'Fotos no WhatsApp Durante o Banho'],
    catalog: [
      { name: 'Banho Premium + Hidratação de Argan + Tosa Higiênica', description: 'Banho completo, limpeza auricular, corte de unhas, escovação dental e gravatinha/lacinho.', price: 'A partir de R$ 65', category: 'Banho & Tosa', image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80', badge: 'Mais Pedido' },
      { name: 'Clubinho Mensal (4 Banhos + 1 Tosa Higiênica + Hidratação)', description: 'Seu pet limpinho toda semana com desconto exclusivo de assinante.', price: 'A partir de R$ 219/mês', category: 'Assinatura', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80', badge: 'Economia' },
    ],
  },
  {
    id: 'clinica-veterinaria-24h',
    title: 'Clínica Veterinária 24h, Vacinas & Cirurgias',
    category: 'Pet & Veterinária',
    layoutVariant: 'clinical',
    interactionMode: 'booking',
    name: 'VetCare Hospital Veterinário 24h',
    eyebrow: '🏥 Plantão Veterinário 24 Horas • Consultas, Vacinas Importadas & Internação',
    headline: 'Medicina veterinária de excelência quando seu pet mais precisa.',
    subheadline: 'Consultório exclusivo para gatos (Cat Friendly), centro cirúrgico com anestesia inalatória e exames na hora.',
    ctaText: 'Falar com Veterinário / Agendar',
    catalogTitle: 'Atendimento Clínico & Preventivo',
    aboutText: 'Equipe de médicos veterinários plantonistas 24h por dia, 7 dias por semana, com laboratório próprio e UTI monitorada.',
    primaryColor: '#0284C7',
    secondaryColor: '#10B981',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Emergência 24 Horas', 'Anestesia Inalatória Segura', 'Vacinas Importadas V10 e Raiva', 'Ala Exclusiva para Felinos'],
    catalog: [
      { name: 'Consulta Veterinária Clínica + Check-up', description: 'Avaliação completa, aferição de pressão, peso, temperatura e orientação preventiva.', price: 'R$ 130,00', category: 'Consultas', image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=600&q=80', badge: 'Plantão' },
      { name: 'Protocolo de Vacinação Importada (Cães e Gatos)', description: 'Vacinas V10, Antirrábica, Giardia, Gripe e Quádrupla/Quíntupla Felina com carteira assinada.', price: 'A partir de R$ 95', category: 'Vacinas', image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'hotelzinho-creche-pet',
    title: 'Creche Pet (Day Care) & Hotelzinho sem Baias',
    category: 'Pet & Veterinária',
    layoutVariant: 'modern',
    interactionMode: 'booking',
    name: 'Vila Dog Creche & Resort Pet',
    eyebrow: '🐕 100% Livre de Gaiolas • Gramado, Piscina Pet & Monitoramento',
    headline: 'Seu cão gasta energia, socializa e volta para casa feliz e tranquilo.',
    subheadline: 'Rotina diária com enriquecimento ambiental, brincadeiras supervisionadas por monitores e hospedagem familiar.',
    ctaText: 'Agendar Dia de Adaptação',
    catalogTitle: 'Creche (Day Care) & Hospedagem',
    aboutText: 'Mais de 800m² de área verde segura com separação por porte, piscina rasa, soneca climatizada com musicoterapia e vídeos diários para os tutores.',
    primaryColor: '#F59E0B',
    secondaryColor: '#10B981',
    backgroundColor: '#FFFBEB',
    surfaceColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Outfit',
    borderRadius: '24px',
    heroImage: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['100% Livre de Baias e Gaiolas', 'Separação por Porte e Energia', 'Boletim com Vídeos no WhatsApp', 'Veterinário Responsável'],
    catalog: [
      { name: 'Avaliação Comportamental + Meio Período Experimental', description: 'Teste de socialização assistido por adestrador para entrada segura na matilha.', price: 'Agendar no WhatsApp', category: 'Adaptação', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80', badge: '1º Passo' },
      { name: 'Hospedagem Hotelzinho 24h (Diária)', description: 'Dormitório aconchegante assistido a noite toda + dia inteiro de atividades na creche.', price: 'R$ 95,00/diária', category: 'Hotel', image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'adestramento-canino',
    title: 'Adestramento Positivo & Comportamento Canino',
    category: 'Pet & Veterinária',
    layoutVariant: 'modern',
    interactionMode: 'whatsapp',
    name: 'K9 Educação Canina Positiva',
    eyebrow: '🦮 Fim do Xixi no Lugar Errado, Latidos, Destruição e Puxões na Guia',
    headline: 'Tenha um cão equilibrado e obediente dentro de casa sem punições.',
    subheadline: 'Aulas em domicílio com participação da família para filhotes e cães adultos de todas as raças.',
    ctaText: 'Solicitar Avaliação em Casa',
    catalogTitle: 'Programas de Adestramento',
    aboutText: 'Utilizamos metodologia científica de reforço positivo para ensinar seu cão a ter autocontrole, fazer as necessidades no local certo e passear sem puxar.',
    primaryColor: '#16A34A',
    secondaryColor: '#FACC15',
    backgroundColor: '#09090B',
    surfaceColor: '#141418',
    textColor: '#FAFAFA',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Atendimento na Sua Casa', 'Método 100% Positivo Sem Violência', 'Especialista em Filhotes e Reatividade', 'Suporte por Vídeo entre Aulas'],
    catalog: [
      { name: 'Programa Educação de Filhotes (8 Aulas)', description: 'Educação sanitária (xixi certo), inibição de mordidas, socialização e comandos básicos.', price: 'Consultar Pacote', category: 'Filhotes', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80', badge: 'Mais Procurado' },
      { name: 'Reabilitação Comportamental & Passeio Educado', description: 'Para cães que latem excessivamente, sofrem de ansiedade de separação ou puxam no passeio.', price: 'Consultar Pacote', category: 'Adultos', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80' },
    ],
  },

  // ================= 6. SERVIÇOS & AUTOMOTIVO (8 MODELOS) =================
  {
    id: 'oficina-mecanica-auto-center',
    title: 'Oficina Mecânica Premium & Auto Center',
    category: 'Serviços & Automotivo',
    layoutVariant: 'bold',
    interactionMode: 'whatsapp',
    name: 'PrimeTech Auto Center & Mecânica',
    eyebrow: '🔧 Diagnóstico Computadorizado • Revisão, Freios, Suspensão & Câmbio',
    headline: 'Transparência total: você aprova o orçamento por vídeo antes de mexermos no seu carro.',
    subheadline: 'Mecânica especializada em nacionais e importados com peças originais, garantia em nota fiscal e leva e traz.',
    ctaText: 'Solicitar Orçamento / Agendar Revisão',
    catalogTitle: 'Serviços Automotivos',
    aboutText: 'Chega de surpresas na oficina. Na PrimeTech enviamos vídeos detalhados das peças pelo WhatsApp e só executamos o que você autorizar.',
    primaryColor: '#EA580C',
    secondaryColor: '#F59E0B',
    backgroundColor: '#09090B',
    surfaceColor: '#141418',
    textColor: '#F8FAFC',
    fontFamily: 'Space Grotesk',
    borderRadius: '8px',
    heroImage: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Diagnóstico por Vídeo no WhatsApp', 'Peças Genuínas com Garantia de 1 Ano', 'Serviço Leva e Traz Seguro', 'Parcelamento em até 10x Sem Juros'],
    catalog: [
      { name: 'Revisão Preventiva + Scanner Eletrônico (40 Itens)', description: 'Inspeção completa de freios, suspensão, correias, arrefecimento, bateria e leitura de módulos.', price: 'R$ 149,00', category: 'Revisão', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80', badge: 'Check-up' },
      { name: 'Troca de Óleo Sintético + Filtros + Alinhamento 3D', description: 'Lubrificantes homologados pela montadora + balanceamento das 4 rodas.', price: 'Cotar pelo Modelo', category: 'Manutenção Rápida', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'estetica-automotiva-lava-jato',
    title: 'Estética Automotiva, Polimento & Vitrificação',
    category: 'Serviços & Automotivo',
    layoutVariant: 'luxury',
    interactionMode: 'booking',
    name: 'Carbon Detail Estética Automotiva',
    eyebrow: '🚘 Vitrificação 9H, Polimento Técnico, PPF & Higienização Interna',
    headline: 'Seu carro com brilho de zero quilômetro e proteção cerâmica por até 3 anos.',
    subheadline: 'Lavagem detalhada com pincéis macios, higienização de bancos em couro e correção de pintura.',
    ctaText: 'Agendar Serviço / Orçamento',
    catalogTitle: 'Pacotes de Detalhamento',
    aboutText: 'Utilizamos exclusivamente produtos Vonixx, Gyeon e Menzerna sob iluminação técnica de inspeção para entregar perfeição em cada detalhe.',
    primaryColor: '#EF4444',
    secondaryColor: '#F59E0B',
    backgroundColor: '#09090B',
    surfaceColor: '#121216',
    textColor: '#FAFAFA',
    fontFamily: 'Syne',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Produtos Importados Gyeon & Menzerna', 'Cabine de Iluminação Técnica', 'Oxi-Sanitização Grátis nos Pacotes', 'Buscamos em Domicílio'],
    catalog: [
      { name: 'Lavagem Técnica Detalhada + Cera de Carnaúba', description: 'Pré-lavagem snow foam, limpeza de caixas de roda, emblemas no pincel e proteção hidrofóbica.', price: 'R$ 120,00', category: 'Lavagem Detail', image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=600&q=80', badge: 'Mais Pedido' },
      { name: 'Polimento Técnico + Vitrificação Cerâmica 9H (3 Anos)', description: 'Remoção de até 90% dos riscos superficiais e aplicação de coating cerâmico de alta dureza.', price: 'A partir de R$ 890', category: 'Proteção de Pintura', image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'chaveiro-24-horas',
    title: 'Chaveiro 24 Horas Automotivo & Residencial',
    category: 'Serviços & Automotivo',
    layoutVariant: 'bold',
    interactionMode: 'whatsapp',
    name: 'SOS Chaveiro Express 24h',
    eyebrow: '🔑 Chegamos em até 20 Minutos • Abertura Sem Danos 24 Horas',
    headline: 'Trancou o carro ou a porta de casa? Atendimento imediato onde você estiver.',
    subheadline: 'Abertura residencial e automotiva, chaves codificadas presenciais, fechaduras digitais e troca de segredo.',
    ctaText: 'Chamar Chaveiro de Plantão Agora',
    catalogTitle: 'Atendimento Emergencial & Fechaduras',
    aboutText: 'Técnicos credenciados em moto-atendimento rápido 24 horas por dia, inclusive domingos e feriados, utilizando ferramentas de precisão que não danificam sua fechadura.',
    primaryColor: '#EAB308',
    secondaryColor: '#FACC15',
    backgroundColor: '#09090B',
    surfaceColor: '#141418',
    textColor: '#FAFAFA',
    fontFamily: 'Space Grotesk',
    borderRadius: '8px',
    heroImage: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Chegada Rápida em 20 Minutos', 'Plantão Real 24h Todos os Dias', 'Abertura Técnica Sem Quebrar', 'Aceitamos PIX e Cartão'],
    catalog: [
      { name: 'Abertura de Porta Residencial ou Automotiva 24h', description: 'Desbloqueio rápido de portas trancadas, chaves quebradas ou esquecidas no interior.', price: 'Chamar Agora', category: 'Emergência 24h', image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80', badge: '20 Min' },
      { name: 'Instalação de Fechadura Digital Biométrica', description: 'Instalação profissional com furação limpa para Intelbras, Samsung, Yale e Pado.', price: 'A partir de R$ 220', category: 'Fechaduras Digitais', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'eletricista-manutencao',
    title: 'Eletricista Residencial, Predial & Ar-Condicionado',
    category: 'Serviços & Automotivo',
    layoutVariant: 'modern',
    interactionMode: 'whatsapp',
    name: 'EletroForte Soluções Elétricas',
    eyebrow: '⚡ Eletricista Certificado NR-10 • Emergências, Quadros & Climatização',
    headline: 'Segurança elétrica e instalação limpa para sua residência ou empresa.',
    subheadline: 'Curto-circuito, troca de fiação, quadros de disjuntores, carregador veicular Wallbox e instalação de ar-condicionado.',
    ctaText: 'Solicitar Visita / Orçamento Rápido',
    catalogTitle: 'Serviços Elétricos & Climatização',
    aboutText: 'Atendimento pontual com emissão de nota fiscal, laudo técnico e garantia de 1 ano em todas as instalações seguindo rigorosamente a norma NBR 5410.',
    primaryColor: '#F59E0B',
    secondaryColor: '#0284C7',
    backgroundColor: '#0B0F19',
    surfaceColor: '#111827',
    textColor: '#F8FAFC',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Profissionais Certificados NR-10', 'Atendimento no Mesmo Dia', 'Garantia de 1 Ano nos Serviços', 'Emissão de Nota Fiscal'],
    catalog: [
      { name: 'Manutenção de Emergência / Quadro de Disjuntores', description: 'Identificação de curto-circuito, queda de fase, cheiro de queimado e modernização de QDC.', price: 'Orçamento Imediato', category: 'Elétrica', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80', badge: 'Urgência' },
      { name: 'Instalação e Higienização de Ar-Condicionado Split', description: 'Instalação dentro do padrão da fabricante com bomba de vácuo e tubulação de cobre.', price: 'A partir de R$ 450', category: 'Climatização', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'encanador-caca-vazamentos',
    title: 'Encanador, Caça-Vazamentos & Desentupidora',
    category: 'Serviços & Automotivo',
    layoutVariant: 'clinical',
    interactionMode: 'whatsapp',
    name: 'HidroDetect Caça-Vazamentos 24h',
    eyebrow: '💧 Localização Eletrônica Sem Quebrar Paredes • Desentupimento Limpo',
    headline: 'Conta de água alta ou infiltração? Achamos o vazamento no ponto exato.',
    subheadline: 'Utilizamos Geofone Ultrassônico e Câmera Termográfica com laudo oficial para abatimento na companhia de água.',
    ctaText: 'Chamar Técnico no WhatsApp',
    catalogTitle: 'Hidráulica & Desentupimento',
    aboutText: 'Economize tempo e evite quebrar pisos sem necessidade. Localizamos vazamentos ocultos com precisão milimétrica e fazemos o reparo na mesma visita.',
    primaryColor: '#0284C7',
    secondaryColor: '#38BDF8',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    fontFamily: 'Inter',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Geofone Digital Sem Quebra-Quebra', 'Laudo Técnico para Redução da Conta', 'Desentupimento Sem Sujeira', 'Garantia por Escrito de 90 Dias'],
    catalog: [
      { name: 'Detecção Eletrônica de Vazamento + Laudo Técnico', description: 'Varredura completa com geofone e câmera térmica para localizar vazamentos subterrâneos.', price: 'Solicitar Visita', category: 'Caça-Vazamentos', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80', badge: 'Sem Quebrar' },
      { name: 'Desentupimento de Pias, Ralos, Vasos e Esgoto', description: 'Máquina rotativa elétrica que desobstrui a tubulação sem danificar os canos.', price: 'Orçamento Grátis', category: 'Desentupidora', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'limpeza-estofados-higienizacao',
    title: 'Limpeza, Higienização e Impermeabilização de Estofados',
    category: 'Serviços & Automotivo',
    layoutVariant: 'modern',
    interactionMode: 'whatsapp',
    name: 'EcoClean Estofados & Tapetes',
    eyebrow: '🛋️ Atendimento a Domicílio • Elimina 99,9% dos Ácaros, Manchas e Odores',
    headline: 'Seu sofá limpo, cheiroso e renovado como novo sem sair da sua sala.',
    subheadline: 'Higienização profunda por extração a vácuo em sofás, colchões, poltronas, cadeiras e bancos automotivos.',
    ctaText: 'Enviar Foto do Sofá p/ Orçamento',
    catalogTitle: 'Higienização & Blindagem de Tecido',
    aboutText: 'Produtos biodegradáveis aprovados pela ANVISA, seguros para bebês e pets. Secagem rápida em poucas horas.',
    primaryColor: '#0EA5E9',
    secondaryColor: '#10B981',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '24px',
    heroImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Atendimento na Sua Casa', 'Elimina Odor de Urina Pet e Mofo', 'Produtos Seguros p/ Crianças e Pets', 'Impermeabilização Não Inflamável'],
    catalog: [
      { name: 'Higienização Profunda de Sofá Retrátil', description: 'Extração de sujeira até 5cm da espuma, remoção de manchas, bactericida e perfume suave.', price: 'A partir de R$ 180', category: 'Sofás', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', badge: 'Mais Pedido' },
      { name: 'Combo Sofá + Impermeabilização Blindada', description: 'Limpeza completa seguida de aplicação de escudo repelente contra líquidos e manchas.', price: 'Consultar Tamanho', category: 'Combo Proteção', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80', badge: 'Proteção 1 Ano' },
    ],
  },
  {
    id: 'assistencia-tecnica-celulares',
    title: 'Assistência Técnica de iPhones, Celulares & Notebooks',
    category: 'Serviços & Automotivo',
    layoutVariant: 'modern',
    interactionMode: 'whatsapp',
    name: 'iFix Lab Assistência Especializada',
    eyebrow: '📱 Troca de Tela e Bateria em 40 Minutos • Laboratório à Vista do Cliente',
    headline: 'Conserto rápido do seu iPhone, Samsung ou MacBook sem perder seus dados.',
    subheadline: 'Troca de vidro original, bateria com saúde 100%, reparo avançado de placa e busca/entrega por motoboy.',
    ctaText: 'Cotar Conserto no WhatsApp',
    catalogTitle: 'Reparos Expressos',
    aboutText: 'Mais de 15.000 aparelhos recuperados com peças de qualidade original, vedação contra água refeita e garantia de até 1 ano.',
    primaryColor: '#3B82F6',
    secondaryColor: '#60A5FA',
    backgroundColor: '#09090B',
    surfaceColor: '#13131A',
    textColor: '#F8FAFC',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Pronto em 40 Minutos na Sua Frente', 'Mantém 100% das Suas Fotos e Dados', 'Garantia de até 1 Ano', 'Leva e Traz via Motoboy Próprio'],
    catalog: [
      { name: 'Troca de Tela / Recondicionamento de Vidro Original', description: 'Recupere a tela quebrada mantendo o display original ou instale tela premium com True Tone.', price: 'Cotar Modelo', category: 'Telas', image: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&w=600&q=80', badge: '40 Minutos' },
      { name: 'Substituição de Bateria Homologada + Limpeza Interna', description: 'Volte a ter bateria para o dia inteiro com 1 ano de garantia.', price: 'A partir de R$ 190', category: 'Baterias', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'energia-solar-engenharia',
    title: 'Energia Solar Fotovoltaica & Engenharia',
    category: 'Serviços & Automotivo',
    layoutVariant: 'modern',
    interactionMode: 'whatsapp',
    name: 'Solarix Energia Inteligente',
    eyebrow: '☀️ Reduza até 95% da Sua Conta de Luz • Financiamento em até 72x',
    headline: 'Troque o valor da sua conta de luz pelas parcelas da sua própria usina solar.',
    subheadline: 'Projeto homologado na concessionária, instalação em 48h e monitoramento de geração pelo celular.',
    ctaText: 'Simular Economia Grátis',
    catalogTitle: 'Soluções Fotovoltaicas',
    aboutText: 'Mais de 600 sistemas instalados em residências, comércios, condomínios e propriedades rurais com painéis Tier-1 de 25 anos de garantia.',
    primaryColor: '#F59E0B',
    secondaryColor: '#10B981',
    backgroundColor: '#09090B',
    surfaceColor: '#111827',
    textColor: '#F8FAFC',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Garantia de 25 Anos de Performance', 'Homologação Completa Inclusa', 'Carência de até 120 Dias p/ Pagar', 'Engenheiros CREA Próprios'],
    catalog: [
      { name: 'Sistema Solar Residencial (Contas de R$ 350 a R$ 900)', description: 'Kit completo com microinversores, painéis monocristalinos, instalação e homologação.', price: 'Simular no WhatsApp', category: 'Residencial', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=80', badge: 'Até 95% Economia' },
      { name: 'Usina Solar Comercial & Rural (Alta Demanda)', description: 'Redução drástica do custo fixo da sua empresa ou fazenda com retorno de investimento acelerado.', price: 'Estudo de Viabilidade Grátis', category: 'Empresas & Agro', image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=600&q=80' },
    ],
  },
];

const RAW_TEMPLATES_PART_2: RawTemplateSeed[] = [
  // ================= 7. JURÍDICO & CORPORATIVO (6 MODELOS) =================
  {
    id: 'escritorio-advocacia',
    title: 'Escritório de Advocacia & Consultoria Jurídica',
    category: 'Jurídico & Corporativo',
    layoutVariant: 'luxury',
    interactionMode: 'whatsapp',
    name: 'Mendes & Valença Advogados Associados',
    eyebrow: '⚖️ Atendimento Estratégico, Sigiloso e Personalizado • OAB Ativa',
    headline: 'Defesa técnica implacável dos seus direitos e do seu patrimônio.',
    subheadline: 'Atuação especializada em Direito Trabalhista, Previdenciário, Família & Sucessões, Consumidor e Empresarial.',
    ctaText: 'Falar com Advogado Especialista',
    catalogTitle: 'Áreas de Atuação Jurídica',
    aboutText: 'Mais de 15 anos de atuação nos tribunais superiores com atendimento presencial e digital em todo o Brasil, pautado pela ética, agilidade e clareza em cada etapa do processo.',
    primaryColor: '#D4AF37',
    secondaryColor: '#F3E5AB',
    backgroundColor: '#09090B',
    surfaceColor: '#121216',
    textColor: '#F8FAFC',
    fontFamily: 'Playfair Display',
    borderRadius: '8px',
    heroImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Atendimento Imediato com Advogado', 'Análise Preliminar do Caso', 'Atuação 100% Digital ou Presencial', 'Relatórios Mensais do Processo'],
    catalog: [
      { name: 'Direito Trabalhista & Rescisão Indireta', description: 'Cálculo de verbas rescisórias, horas extras, vínculo empregatício, insalubridade e assédio.', price: 'Analisar Caso', category: 'Trabalhista', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80', badge: 'Especialista' },
      { name: 'Direito de Família, Divórcio, Pensão & Inventário', description: 'Divórcio extrajudicial rápido em cartório, guarda, revisão de pensão e partilha de bens.', price: 'Analisar Caso', category: 'Família', image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=600&q=80' },
      { name: 'Direito Previdenciário & Aposentadoria INSS', description: 'Planejamento previdenciário, concessão de benefícios negados, auxílio-doença e BPC/LOAS.', price: 'Analisar Caso', category: 'INSS', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'contabilidade-consultiva',
    title: 'Contabilidade Digital, abertura de CNPJ & BPO',
    category: 'Jurídico & Corporativo',
    layoutVariant: 'modern',
    interactionMode: 'whatsapp',
    name: 'ExataPrime Contabilidade & Gestão',
    eyebrow: '📊 Abertura de Empresa Grátis no Plano Anual • Redução Legal de Impostos',
    headline: 'Pague o menor imposto permitido por lei com uma contabilidade que fala a sua língua.',
    subheadline: 'Especialistas em Médicos, Prestadores de Serviços, Comércio, Infoprodutores e Migração de MEI para ME.',
    ctaText: 'Falar com Contador no WhatsApp',
    catalogTitle: 'Soluções Contábeis & Fiscais',
    aboutText: 'Unimos plataforma digital intuitiva com atendimento humano de verdade no WhatsApp em menos de 10 minutos para você focar apenas em crescer seu negócio.',
    primaryColor: '#10B981',
    secondaryColor: '#34D399',
    backgroundColor: '#09090B',
    surfaceColor: '#111827',
    textColor: '#F9FAFB',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Abertura de CNPJ em até 48h', 'Planejamento Tributário Fator R', 'Troca de Contador Sem Dor de Cabeça', 'Atendimento Direto no WhatsApp'],
    catalog: [
      { name: 'Abertura de CNPJ + Enquadramento no Menor Imposto', description: 'Cuidamos de todo o processo na Junta Comercial, Prefeitura e Receita Federal.', price: 'A partir de R$ 197/mês', category: 'Abrir Empresa', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80', badge: 'Mais Procurado' },
      { name: 'Migração de Contabilidade + Revisão Tributária', description: 'Assumimos a contabilidade da sua empresa sem burocracia e auditamos seus impostos.', price: 'Diagnóstico Grátis', category: 'Trocar Contador', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'agencia-marketing-digital',
    title: 'Agência de Marketing Digital, Tráfego Pago & IA',
    category: 'Jurídico & Corporativo',
    layoutVariant: 'bold',
    interactionMode: 'whatsapp',
    name: 'ScaleX Growth & Performance',
    eyebrow: '🚀 Meta Ads, Google Ads, Sites de Alta Conversão & Automação de Vendas',
    headline: 'Transformamos cliques em clientes reais todos os dias no seu WhatsApp.',
    subheadline: 'Pare de depender de indicação. Estruturamos seu funil de captação previsível para negócios locais e empresas B2B.',
    ctaText: 'Agendar Diagnóstico de Vendas',
    catalogTitle: 'Ecossistema de Crescimento',
    aboutText: 'Mais de R$ 12 milhões gerados para nossos clientes através de anúncios hiper-segmentados, landing pages ultrarrápidas e scripts comerciais.',
    primaryColor: '#6366F1',
    secondaryColor: '#818CF8',
    backgroundColor: '#09090B',
    surfaceColor: '#13131A',
    textColor: '#F8FAFC',
    fontFamily: 'Space Grotesk',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Gestor de Tráfego Dedicado', 'Dashboard de Resultados em Tempo Real', 'Criação de Criativos e Copy Inclusa', 'Reuniões Quinzenais de Escala'],
    catalog: [
      { name: 'Gestão de Tráfego Pago (Google Ads + Meta Ads)', description: 'Campanhas de intenção de compra no Google e anúncios magnéticos no Instagram.', price: 'Solicitar Proposta', category: 'Tráfego Pago', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80', badge: 'ROI Alto' },
      { name: 'Landing Page Premium + Automação de Atendimento', description: 'Estrutura completa de página de alta velocidade integrada ao seu WhatsApp.', price: 'Solicitar Proposta', category: 'Estrutura', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'consultoria-financeira-seguros',
    title: 'Corretora de Seguros, Planos de Saúde & Consórcios',
    category: 'Jurídico & Corporativo',
    layoutVariant: 'modern',
    interactionMode: 'whatsapp',
    name: 'Patrimônio Prime Seguros & Saúde',
    eyebrow: '🛡️ Cotação Simultânea nas 18 Maiores Seguradoras do Brasil',
    headline: 'Proteja seu veículo, sua família e sua empresa pagando até 40% menos.',
    subheadline: 'Planos de saúde empresariais (MEI/CNPJ) e familiares, seguro auto, vida e consórcio contemplado.',
    ctaText: 'Fazer Cotação Gratuita em 3 Min',
    catalogTitle: 'Seguros, Saúde & Consórcios',
    aboutText: 'Corretora registrada na SUSEP com atendimento humano 24h em caso de sinistro e comparativo imparcial entre Bradesco, Porto Seguro, SulAmérica, Amil e Unimed.',
    primaryColor: '#2563EB',
    secondaryColor: '#60A5FA',
    backgroundColor: '#0B0F19',
    surfaceColor: '#111827',
    textColor: '#F8FAFC',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Redução de até 40% no Plano com CNPJ', 'Cotação em 18 Seguradoras', 'Suporte Pessoal em Sinistros', 'Credenciada SUSEP'],
    catalog: [
      { name: 'Plano de Saúde Individual, Familiar ou Empresarial (MEI)', description: 'Tabela comparativa completa de rede credenciada, carências e reembolso.', price: 'Simular Agora', category: 'Saúde', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80', badge: 'Economia' },
      { name: 'Seguro Automotivo Completo com Guincho Ilimitado', description: 'Cobertura contra roubo, colisão, terceiros e carro reserva.', price: 'Cotar Placa', category: 'Seguro Auto', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'arquitetura-design-interiores',
    title: 'Escritório de Arquitetura & Design de Interiores',
    category: 'Jurídico & Corporativo',
    layoutVariant: 'luxury',
    interactionMode: 'whatsapp',
    name: 'Studio Vértice Arquitetura',
    eyebrow: '🏛️ Projetos Residenciais, Interiores de Alto Padrão & Gestão de Obra',
    headline: 'Transformamos espaços em ambientes atemporais, funcionais e cheios de personalidade.',
    subheadline: 'Projetos 3D ultra-realistas, detalhamento executivo milimétrico e acompanhamento completo da reforma sem dor de cabeça.',
    ctaText: 'Solicitar Proposta de Projeto',
    catalogTitle: 'Projetos & Consultorias',
    aboutText: 'Criamos projetos que respeitam seu orçamento e cronograma, unindo estética contemporânea, iluminação cênica e marcenaria inteligente.',
    primaryColor: '#A16207',
    secondaryColor: '#CA8A04',
    backgroundColor: '#FAF8F5',
    surfaceColor: '#FFFFFF',
    textColor: '#1C1917',
    fontFamily: 'Playfair Display',
    borderRadius: '8px',
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Imagens 3D Fotorrealistas', 'Projeto de Marcenaria e Iluminação', 'Planilha Orçamentária de Compras', 'Gestão e Acompanhamento de Obra'],
    catalog: [
      { name: 'Projeto Completo de Interiores & Reforma', description: 'Estudo de layout, imagens 3D, executivo de gesso, iluminação, marmoraria e marcenaria.', price: 'Orçamento por m²', category: 'Interiores', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80', badge: 'Completo' },
      { name: 'Projeto Arquitetônico Residencial (Condomínios)', description: 'Do estudo solar e fachada imponente à aprovação legal na prefeitura e condomínio.', price: 'Solicitar Reunião', category: 'Arquitetura', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'barbearia-tradicional-classica',
    title: 'Consultoria de RH, Recrutamento & Treinamento',
    category: 'Jurídico & Corporativo',
    layoutVariant: 'modern',
    interactionMode: 'whatsapp',
    name: 'TalentoCerto RH & Hunting',
    eyebrow: '🤝 Recrutamento Especializado • Contrate a Pessoa Certa em até 10 Dias',
    headline: 'Montamos times comerciais e operacionais que batem metas e vestem a camisa.',
    subheadline: 'Mapeamento comportamental DISC, entrevistas técnicas e garantia de reposição gratuita por 90 dias.',
    ctaText: 'Abrir Vaga / Falar com Consultor',
    catalogTitle: 'Soluções em Gente & Gestão',
    aboutText: 'Reduza o turnover da sua empresa com processos seletivos estruturados por psicólogos organizacionais e headhunters.',
    primaryColor: '#4F46E5',
    secondaryColor: '#818CF8',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Finalistas em até 10 Dias Úteis', 'Teste Comportamental DISC Incluso', 'Garantia de Reposição de 90 Dias', 'Treinamento de Equipes de Vendas'],
    catalog: [
      { name: 'Recrutamento & Seleção de Vagas Estratégicas', description: 'Triagem, avaliação psicológica, entrevistas por competência e parecer final de 3 candidatos.', price: 'Solicitar Proposta', category: 'Recrutamento', image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80', badge: 'Garantia 90d' },
      { name: 'Treinamento In-Company de Atendimento e Vendas', description: 'Capacitação prática presencial ou online para destravar o fechamento da sua equipe.', price: 'Solicitar Proposta', category: 'Treinamentos', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80' },
    ],
  },

  // ================= 8. IMOBILIÁRIA & CONSTRUÇÃO (5 MODELOS) =================
  {
    id: 'imobiliaria-alto-padrao',
    title: 'Imobiliária de Alto Padrão & Lançamentos',
    category: 'Imobiliária & Construção',
    layoutVariant: 'luxury',
    interactionMode: 'whatsapp',
    name: 'Palazzo Real Estate & Luxury Homes',
    eyebrow: '🏡 Curadoria Exclusiva de Mansões, Coberturas & Lançamentos',
    headline: 'Imóveis extraordinários selecionados para quem exige exclusividade e valorização.',
    subheadline: 'Atendimento private com assessoria jurídica imobiliária completa, visitas agendadas e acesso a imóveis off-market.',
    ctaText: 'Agendar Visita / Receber Catálogo',
    catalogTitle: 'Imóveis em Destaque',
    aboutText: 'Especialistas no mercado de médio e alto padrão, conectando famílias e investidores aos endereços mais desejados e seguros da região.',
    primaryColor: '#D4AF37',
    secondaryColor: '#F3E5AB',
    backgroundColor: '#09090B',
    surfaceColor: '#121216',
    textColor: '#F8FAFC',
    fontFamily: 'Playfair Display',
    borderRadius: '8px',
    heroImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Assessoria Jurídica e Financiamento', 'Acesso a Lançamentos com Tabela Zero', 'Atendimento Private Discreto', 'Avaliação Gratuita do Seu Imóvel'],
    catalog: [
      { name: 'Casa Contemporânea em Condomínio Fechado (4 Suítes)', description: '420m² construídos, pé-direito duplo, piscina aquecida com borda infinita e espaço gourmet integrado.', price: 'R$ 2.850.000', category: 'Condomínios', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80', badge: 'Exclusivo' },
      { name: 'Apartamento Vista Parque (3 Suítes • 168m²)', description: 'Varanda gourmet panorâmica, elevador privativo, 3 vagas e lazer clube completo.', price: 'R$ 1.490.000', category: 'Apartamentos', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'corretor-imoveis-autonomo',
    title: 'Corretor de Imóveis & Financiamento Caixa',
    category: 'Imobiliária & Construção',
    layoutVariant: 'modern',
    interactionMode: 'whatsapp',
    name: 'Rafael Costa | Especialista Imobiliário',
    eyebrow: '🔑 Saia do Aluguel • Entrada Parcelada em até 60x & Subsídio Minha Casa Minha Vida',
    headline: 'Conquiste as chaves do seu apartamento próprio com parcelas menores que o aluguel.',
    subheadline: 'Use seu FGTS na entrada, junte renda familiar e faça a simulação gratuita do seu financiamento agora mesmo.',
    ctaText: 'Simular Meu Financiamento Grátis',
    catalogTitle: 'Oportunidades da Semana',
    aboutText: 'Mais de 300 famílias já receberam as chaves comigo. Aprovo seu crédito junto aos bancos sem custo e te acompanho até a assinatura da escritura.',
    primaryColor: '#10B981',
    secondaryColor: '#34D399',
    backgroundColor: '#09090B',
    surfaceColor: '#111827',
    textColor: '#F8FAFC',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Use seu FGTS como Entrada', 'Entrada Facilitada direto com a Construtora', 'Aprovação de Crédito em 24h', 'Documentação Grátis em Selecionados'],
    catalog: [
      { name: 'Residencial Parque Clube (2 Quartos com Suíte e Varanda)', description: 'Condomínio fechado com piscina, academia, salão de festas e playground. Entrada parcelada.', price: 'Parcelas a partir de R$ 890', category: 'Na Planta', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80', badge: 'Zero ITBI/Registro' },
      { name: 'Casas Prontas para Morar em Loteamento Planejado', description: '2 e 3 quartos com quintal privativo, vaga para 2 carros e financiamento imediato Caixa.', price: 'Simular Entrada', category: 'Prontos', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'construtora-reformas-engenharia',
    title: 'Construtora, Reformas Residenciais & Engenharia Civil',
    category: 'Imobiliária & Construção',
    layoutVariant: 'bold',
    interactionMode: 'whatsapp',
    name: 'Vanguard Engenharia & Construções',
    eyebrow: '🏗️ Obras Chave na Mão (Turnkey) • Prazo e Custo Garantidos em Contrato',
    headline: 'Construímos ou reformamos seu imóvel sem atrasos e sem desperdício de material.',
    subheadline: 'Engenheiro residente, cronograma semanal via aplicativo e garantia estrutural completa.',
    ctaText: 'Solicitar Orçamento de Obra',
    catalogTitle: 'Serviços de Engenharia',
    aboutText: 'Assumimos 100% da gestão da sua obra: da fundação ao acabamento fino, compra de materiais, equipe própria registrada e entrega limpa pronta para mudar.',
    primaryColor: '#F59E0B',
    secondaryColor: '#FBBF24',
    backgroundColor: '#09090B',
    surfaceColor: '#141418',
    textColor: '#FAFAFA',
    fontFamily: 'Space Grotesk',
    borderRadius: '8px',
    heroImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1541888946425-d09bb18086f6?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['ART Assinada por Engenheiro Civil', 'Prazo de Entrega Garantido em Contrato', 'Relatório Semanal com Fotos', 'Financiamento Terreno + Construção'],
    catalog: [
      { name: 'Construção Residencial Completa (Chave na Mão)', description: 'Execução integral da sua casa em condomínio ou terreno próprio, do projeto ao acabamento.', price: 'Orçar Projeto', category: 'Construção', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80', badge: 'Turnkey' },
      { name: 'Reforma de Apartamento & Salas Comerciais', description: 'Porcelanato, demolição estrutural com laudo, gesso, iluminação, pintura e bancadas.', price: 'Agendar Visita Técnica', category: 'Reformas', image: 'https://images.unsplash.com/photo-1541888946425-d09bb18086f6?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'marcenaria-moveis-planejados',
    title: 'Marcenaria Fina & Móveis Planejados Sob Medida',
    category: 'Imobiliária & Construção',
    layoutVariant: 'luxury',
    interactionMode: 'whatsapp',
    name: 'NobreArte Móveis Planejados',
    eyebrow: '🪚 100% MDF Naval & Ferragens com Amortecimento • Projeto 3D Grátis',
    headline: 'Cozinhas, closets e ambientes planejados com acabamento de alto padrão.',
    subheadline: 'Fábrica própria com corte computadorizado a laser, entrega rigorosamente no prazo e 5 anos de garantia.',
    ctaText: 'Solicitar Projeto 3D + Orçamento',
    catalogTitle: 'Ambientes Sob Medida',
    aboutText: 'Transformamos sua planta ou medida em móveis planejados duráveis com MDF 18mm Arauco/Duratex, fitamento em cola PUR à prova de umidade e corrediças invisíveis.',
    primaryColor: '#D97706',
    secondaryColor: '#F59E0B',
    backgroundColor: '#0C0A09',
    surfaceColor: '#1C1917',
    textColor: '#FAFAF9',
    fontFamily: 'Playfair Display',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Projeto 3D Sem Compromisso', '100% MDF 18mm Resistente à Umidade', 'Dobradiças e Corrediças Slow-Motion', 'Garantia de 5 Anos em Contrato'],
    catalog: [
      { name: 'Cozinha Planejada Completa Sob Medida', description: 'Armários superiores e inferiores em MDF Ultra, torre quente, divisores de talheres e LED embutido.', price: 'Orçar Medidas', category: 'Cozinhas', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=600&q=80', badge: 'Mais Pedido' },
      { name: 'Pacote Apartamento Completo (Cozinha + Quartos + Sala + Banheiros)', description: 'Condição especial direto de fábrica para mobiliar todos os ambientes com parcelamento estendido.', price: 'Condição Especial', category: 'Pacote Completo', image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80', badge: 'Desconto 20%' },
    ],
  },
  {
    id: 'vidracaria-esquadrias-aluminio',
    title: 'Vidraçaria, Box Elegance & Esquadrias de Alumínio',
    category: 'Imobiliária & Construção',
    layoutVariant: 'modern',
    interactionMode: 'whatsapp',
    name: 'CristalMax Vidros & Esquadrias',
    eyebrow: '🪟 Vidro Temperado Blindex, Cortina de Vidro p/ Varanda & Espelhos LED',
    headline: 'Elegância, segurança e acabamento impecável em vidros e esquadrias.',
    subheadline: 'Medição técnica gratuita no local, instalação limpa e parcelamento facilitado no cartão.',
    ctaText: 'Solicitar Orçamento por Medida',
    catalogTitle: 'Vidraçaria & Esquadrias',
    aboutText: 'Atendemos residências, arquitetos e construtoras com vidros certificados pelo INMETRO, espelhos Cebrace que não mancham e perfis de alumínio linha Suprema e Gold.',
    primaryColor: '#0284C7',
    secondaryColor: '#38BDF8',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Medição Gratuita no Local', 'Vidros Temperados Certificados', 'Espelhos Cebrace c/ LED Quente/Frio', 'Entrega Rápida Garantida'],
    catalog: [
      { name: 'Box de Banheiro Elegance / Até o Teto (Inox, Preto ou Dourado)', description: 'Vidro temperado 8mm de segurança com roldanas aparentes em aço inox.', price: 'Cotar Medida', category: 'Banheiros', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', badge: 'Tendência' },
      { name: 'Envidraçamento de Sacada / Cortina de Vidro Retrátil', description: 'Abertura total dos painéis com vedação acústica e proteção contra chuva e vento.', price: 'Solicitar Visita', category: 'Varandas', image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=600&q=80' },
    ],
  },

  // ================= 9. EDUCAÇÃO & INFOPRODUTOS (4 MODELOS) =================
  {
    id: 'curso-online-infoproduto',
    title: 'Página de Vendas de Curso Online & Infoproduto',
    category: 'Educação & Infoprodutos',
    layoutVariant: 'bold',
    interactionMode: 'whatsapp',
    name: 'Método Domínio Digital 360',
    eyebrow: '🎓 Acesso Vitalício + Certificado Reconhecido + 4 Bônus Exclusivos',
    headline: 'Domine a habilidade mais lucrativa do mercado mesmo começando do absoluto zero.',
    subheadline: 'Mais de 80 aulas práticas passo a passo na tela, templates prontos para copiar e colar e comunidade de alunos.',
    ctaText: 'Garantir Minha Vaga com Desconto',
    catalogTitle: 'Módulos & Planos de Acesso',
    aboutText: 'Um treinamento direto ao ponto, sem enrolação teórica, criado para quem precisa de resultados rápidos na prática com garantia incondicional de 7 dias.',
    primaryColor: '#10B981',
    secondaryColor: '#34D399',
    backgroundColor: '#09090B',
    surfaceColor: '#121218',
    textColor: '#F8FAFC',
    fontFamily: 'Space Grotesk',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Acesso Imediato pelo Celular ou PC', '7 Dias de Garantia Incondicional', 'Suporte Individual na Plataforma', 'Certificado de Conclusão Incluso'],
    catalog: [
      { name: 'Inscrição Completa + 4 Bônus de Aceleração', description: 'Acesso a todos os módulos, pack de materiais editáveis, plantões de dúvidas ao vivo e certificado.', price: '12x R$ 29,70', category: 'Oferta Especial', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80', badge: '70% OFF Hoje' },
      { name: 'Plano VIP + Mentoria Individual em Grupo', description: 'Tudo do curso completo + 4 encontros de análise individual no Zoom.', price: '12x R$ 59,70', category: 'VIP', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'mentoria-executiva-high-ticket',
    title: 'Mentoria High-Ticket & Consultoria de Negócios',
    category: 'Educação & Infoprodutos',
    layoutVariant: 'luxury',
    interactionMode: 'whatsapp',
    name: 'Boardroom Mentoria Executiva',
    eyebrow: '♟️ Acompanhamento Estratégico para Empresários que Faturam de R$ 30k a R$ 500k/mês',
    headline: 'Escale o lucro líquido da sua empresa organizando vendas, processos e liderança.',
    subheadline: 'Aplicação aberta para empresários que buscam acompanhamento próximo para dobrar a operação nos próximos 6 meses.',
    ctaText: 'Preencher Aplicação / Falar com Consultor',
    catalogTitle: 'Programas de Aceleração Empresarial',
    aboutText: 'Não vendemos cursos gravados: sentamos na mesma mesa que você para desenhar seu plano de expansão comercial, precificação e cultura de resultados.',
    primaryColor: '#D4AF37',
    secondaryColor: '#F3E5AB',
    backgroundColor: '#09090B',
    surfaceColor: '#121216',
    textColor: '#F8FAFC',
    fontFamily: 'Playfair Display',
    borderRadius: '8px',
    heroImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Encontros Individuais de Direcionamento', 'Imersão Presencial de Networking', 'Playbooks Comerciais e Financeiros', 'Acesso Direto via Grupo Exclusivo'],
    catalog: [
      { name: 'Mentoria Boardroom (6 Meses de Acompanhamento)', description: 'Diagnóstico 360º do negócio, implementação de máquina de vendas e encontros quinzenais.', price: 'Sob Aplicação', category: 'Mentoria', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80', badge: 'Vagas Limitadas' },
      { name: 'Sessão Estratégica de Diagnóstico (60 Minutos)', description: 'Reunião individual para mapear os gargalos de crescimento da sua empresa.', price: 'Agendar Sessão', category: 'Diagnóstico', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'escola-idiomas-ingles',
    title: 'Escola de Inglês, Conversação & Idiomas',
    category: 'Educação & Infoprodutos',
    layoutVariant: 'modern',
    interactionMode: 'booking',
    name: 'FluentNow English Academy',
    eyebrow: '🌎 Fale Inglês Desde a 1ª Aula • Turmas Reduzidas ou Particular VIP',
    headline: 'Destrave sua conversação em inglês para viagens, reuniões e carreira internacional.',
    subheadline: 'Sem decoreba de gramática: método focado em situações reais do dia a dia e inglês corporativo.',
    ctaText: 'Agendar Aula Demonstrativa Grátis',
    catalogTitle: 'Cursos para Adultos, Kids & Empresas',
    aboutText: 'Mais de 94% dos nossos alunos perdem o medo de falar já nos primeiros 3 meses graças à nossa metodologia ativa de imersão.',
    primaryColor: '#2563EB',
    secondaryColor: '#EF4444',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Foco 80% em Conversação Prática', 'Aulas Presenciais ou Ao Vivo no Zoom', 'Preparatório Entrevistas em Inglês & TOEFL', 'Material Didático Digital Incluso'],
    catalog: [
      { name: 'Inglês Acelerado para Adultos & Carreira', description: 'Do básico ao avançado focado em reuniões, viagens e fluência natural.', price: 'Agendar Aula Grátis', category: 'Adultos', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80', badge: 'Mais Procurado' },
      { name: 'Inglês Kids & Teens Interativo', description: 'Aprendizado lúdico e natural para crianças e adolescentes.', price: 'Agendar Aula Grátis', category: 'Kids & Teens', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'autoescola-cfc-habilitacao',
    title: 'Autoescola, CNH Carro/Moto & Aulas para Habilitados',
    category: 'Educação & Infoprodutos',
    layoutVariant: 'bold',
    interactionMode: 'whatsapp',
    name: 'ViaRápida Autoescola & CFC',
    eyebrow: '🚗 Alto Índice de Aprovação no DETRAN • Frota 2026 com Direção Elétrica e Ar',
    headline: 'Tire sua CNH de Carro e Moto rápido e com parcelamento que cabe no bolso.',
    subheadline: 'Instrutores pacientes, simulador moderno, agendamento de aulas pelo app e parcelamento no boleto ou cartão.',
    ctaText: 'Ver Promoção da Semana no WhatsApp',
    catalogTitle: 'Categorias de Habilitação',
    aboutText: 'Mais de 12.000 alunos habilitados. Cuidamos de todo o seu processo junto ao DETRAN com transparência total nas taxas e aulas práticas no próprio percurso da prova.',
    primaryColor: '#EAB308',
    secondaryColor: '#2563EB',
    backgroundColor: '#09090B',
    surfaceColor: '#141418',
    textColor: '#FAFAFA',
    fontFamily: 'Outfit',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Carros Novos com Ar e Direção Elétrica', 'Parcelamento em até 12x ou Boleto', 'Treino no Local Oficial da Prova', 'Aulas para Habilitados com Medo de Dirigir'],
    catalog: [
      { name: '1ª Habilitação Carro + Moto (Categoria AB)', description: 'Pacote completo com curso teórico, aulas práticas de carro e moto e acompanhamento até o exame.', price: 'Condição Especial Hoje', category: '1ª CNH', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=600&q=80', badge: 'Mais Vendido' },
      { name: 'Adição de Categoria ou Aulas para Habilitados', description: 'Perca o medo de dirigir no trânsito, ladeiras e baliza com instrutor especialista.', price: 'Consultar no WhatsApp', category: 'Habilitados', image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80' },
    ],
  },

  // ================= 10. COMÉRCIO & LOJAS (5 MODELOS) =================
  {
    id: 'loja-roupas-moda',
    title: 'Loja de Roupas, Boutique Feminina & Streetwear',
    category: 'Comércio & Lojas',
    layoutVariant: 'luxury',
    interactionMode: 'cart',
    name: 'Velvet Boutique & Concept',
    eyebrow: '👗 Coleção Nova Toda Semana • Entrega Expressa via Motoboy (Malinha Delivery)',
    headline: 'Peças versáteis, caimento impecável e elegância para todos os seus momentos.',
    subheadline: 'Escolha seus looks favoritos na vitrine abaixo e receba hoje mesmo em casa ou retire na loja.',
    ctaText: 'Ver Coleção & Comprar',
    catalogTitle: 'Lançamentos da Semana',
    aboutText: 'Curadoria apaixonada por tecidos nobres, alfaiataria moderna e peças que valorizam o corpo com conforto e sofisticação.',
    primaryColor: '#E11D48',
    secondaryColor: '#FB7185',
    backgroundColor: '#FFF8F9',
    surfaceColor: '#FFFFFF',
    textColor: '#18181B',
    fontFamily: 'Playfair Display',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Enviamos Malinha para Você Provar em Casa', 'Até 6x Sem Juros ou 10% OFF no PIX', 'Troca Fácil Garantida', 'Envio para Todo o Brasil'],
    catalog: [
      { name: 'Conjunto Alfaiataria Linho Premium (Blazer + Calça)', description: 'Corte estruturado com forro acetinado. Disponível nos tamanhos P, M e G.', price: 'R$ 349,90', category: 'Alfaiataria', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80', badge: 'Lançamento' },
      { name: 'Vestido Midi Fluido Cetim Italiano', description: 'Perfeito para jantares e eventos especiais, com alças reguláveis e decote elegante.', price: 'R$ 269,90', category: 'Vestidos', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'loja-iphones-eletronicos',
    title: 'Loja de iPhones, Apple & Eletrônicos',
    category: 'Comércio & Lojas',
    layoutVariant: 'modern',
    interactionMode: 'whatsapp',
    name: 'iStore Prime Apple & Imports',
    eyebrow: '🍎 Lacrados com 1 Ano Apple e Seminovos Revisados • Aceitamos Seu Usado na Troca',
    headline: 'Faça seu upgrade de iPhone hoje com a melhor avaliação do seu aparelho usado.',
    subheadline: 'Transferimos todos os seus dados na hora, parcelamos em até 18x no cartão e entregamos em mãos.',
    ctaText: 'Simular Upgrade / Ver Tabela de Preços',
    catalogTitle: 'Tabela de Aparelhos Pronta-Entrega',
    aboutText: 'Loja física com segurança total, aparelhos 100% originais nunca abertos, saúde de bateria alta e brinde de capa MagSafe + película 3D.',
    primaryColor: '#3B82F6',
    secondaryColor: '#60A5FA',
    backgroundColor: '#09090B',
    surfaceColor: '#13131A',
    textColor: '#F8FAFC',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '24px',
    heroImage: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Seu iPhone Usado Vale como Entrada', 'Parcelamento em até 18x no Cartão', 'Capa + Película + Fonte 20W de Brinde', 'Garantia em Nota Fiscal'],
    catalog: [
      { name: 'iPhone 16 Pro / Pro Max (128GB e 256GB Lacrado)', description: 'Novo lacrado com 1 ano de garantia oficial Apple Brasil. Todas as cores em estoque.', price: 'Cotar ou Dar Usado na Troca', category: 'Lacrados', image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80', badge: 'Pronta-Entrega' },
      { name: 'Linha Seminovos Premium (iPhone 13, 14 e 15)', description: 'Aparelhos impecáveis, 100% originais, bateria acima de 88% e garantia da loja.', price: 'Ver Tabela no WhatsApp', category: 'Seminovos', image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80', badge: 'Custo-Benefício' },
    ],
  },
  {
    id: 'joalheria-relojoaria-semijoias',
    title: 'Joalheria, Alianças em Ouro 18k & Semijoias',
    category: 'Comércio & Lojas',
    layoutVariant: 'luxury',
    interactionMode: 'cart',
    name: 'Aurum Joalheria & Alianças',
    eyebrow: '💍 Ouro 18k 750 Certificado & Prata 925 • Gravação Interna Gratuita',
    headline: 'Joias eternas que celebram histórias de amor e conquistas inesquecíveis.',
    subheadline: 'Alianças de namoro, noivado e casamento sob medida, anéis solitários, colares e relógios originais.',
    ctaText: 'Ver Coleção de Joias',
    catalogTitle: 'Alianças, Solitários & Joias',
    aboutText: 'Fabricação própria de alianças anatômicas sem solda com certificado vitalício do teor do Ouro 18k e polimento gratuito sempre que desejar.',
    primaryColor: '#D4AF37',
    secondaryColor: '#F3E5AB',
    backgroundColor: '#09090B',
    surfaceColor: '#121216',
    textColor: '#F8FAFC',
    fontFamily: 'Playfair Display',
    borderRadius: '8px',
    heroImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Certificado Vitalício Ouro 18k', 'Gravação + Estojo de Veludo Grátis', 'Ajuste de Numeração Garantido', 'Até 10x Sem Juros'],
    catalog: [
      { name: 'Par de Alianças Ouro 18k Abaulada Anatômica + Solitário', description: 'Conforto interno anatômico, acabamento polido espelhado, gravação a laser e estojo luxo.', price: '10x R$ 189,00', category: 'Casamento & Noivado', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80', badge: 'Mais Vendido' },
      { name: 'Par de Alianças Prata 950 com Filete de Ouro', description: 'Perfeitas para namoro e compromisso. Acompanha anel aparador cravejado.', price: 'R$ 349,00', category: 'Namoro', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'floricultura-cestas-presentes',
    title: 'Floricultura, Buquês & Cestas de Café da Manhã',
    category: 'Comércio & Lojas',
    layoutVariant: 'modern',
    interactionMode: 'cart',
    name: 'Jardim Secreto Flores & Cestas',
    eyebrow: '🌹 Entrega Expressa no Mesmo Dia com Cartão Impresso Personalizado',
    headline: 'Surpreenda quem você ama hoje mesmo com flores frescas e cestas inesquecíveis.',
    subheadline: 'Buquês de rosas importadas, orquídeas, cestas de café da manhã, vinhos e chocolates finos.',
    ctaText: 'Escolher Presente p/ Entrega Hoje',
    catalogTitle: 'Buquês, Orquídeas & Cestas',
    aboutText: 'Recebemos flores frescas diretamente de Holambra e montamos cada arranjo e cesta artesanalmente com entrega cuidadosa em horário agendado.',
    primaryColor: '#E11D48',
    secondaryColor: '#16A34A',
    backgroundColor: '#FFF5F7',
    surfaceColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Playfair Display',
    borderRadius: '24px',
    heroImage: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Entrega em até 2 Horas na Cidade', 'Cartão com Sua Mensagem Grátis', 'Rosas Frescas Selecionadas', 'Foto do Arranjo Antes de Sair'],
    catalog: [
      { name: 'Buquê Luxo 12 Rosas Vermelhas Colombianas + Ferrero Rocher', description: 'Embalagem importada com laço de cetim, folhagens nobres e caixa de Ferrero Rocher 8 un.', price: 'R$ 219,00', category: 'Buquês Românticos', image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80', badge: 'Entrega Hoje' },
      { name: 'Cesta Café da Manhã Imperial na Bandeja de Madeira', description: 'Croissants, pães artesanais, frios, frutas, suco integral, iogurte, geleia, caneca e arranjo de flores.', price: 'R$ 269,00', category: 'Cestas', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80', badge: 'Surpresa' },
    ],
  },
  {
    id: 'concessionaria-seminovos-multimarcas',
    title: 'Loja de Carros Seminovos & Multimarcas',
    category: 'Comércio & Lojas',
    layoutVariant: 'bold',
    interactionMode: 'whatsapp',
    name: 'Autohaus Motors Seminovos',
    eyebrow: '🚙 100% Periciados com Laudo Cautelar Aprovado • Melhor Avaliação na Troca',
    headline: 'Seu próximo carro com procedência garantida e financiamento nas melhores taxas.',
    subheadline: 'Aprovamos sua ficha pelo WhatsApp em 15 minutos com ou sem CNH e pegamos seu carro ou moto como entrada.',
    ctaText: 'Simular Financiamento / Ver Estoque',
    catalogTitle: 'Destaques do Estoque',
    aboutText: 'Todos os veículos passam por vistoria cautelar rigorosa, higienização completa e contam com garantia mecânica de motor e câmbio.',
    primaryColor: '#EF4444',
    secondaryColor: '#F59E0B',
    backgroundColor: '#09090B',
    surfaceColor: '#141418',
    textColor: '#FAFAFA',
    fontFamily: 'Space Grotesk',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Laudo Cautelar 100% Aprovado', 'Troco na Troca e 1ª Parcela p/ 60 Dias', 'Trabalhamos com Todos os Bancos', 'Entrada Parcelada no Cartão em 18x'],
    catalog: [
      { name: 'Jeep Compass Longitude T270 Turbo Flex (Único Dono)', description: 'Revisado na concessionária, bancos em couro, painel digital, multimídia e 4 pneus novos.', price: 'Simular Parcelas', category: 'SUVs', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80', badge: 'Impecável' },
      { name: 'Honda Civic Touring / Corolla XEi Automático', description: 'Baixa quilometragem, manual, chave reserva e ipva pago.', price: 'Simular Parcelas', category: 'Sedans', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80' },
    ],
  },

  // ================= 11. EVENTOS & TURISMO (5 MODELOS) =================
  {
    id: 'fotografo-profissional-estudio',
    title: 'Fotógrafo Profissional, Casamentos & Retratos Corporativos',
    category: 'Eventos & Turismo',
    layoutVariant: 'luxury',
    interactionMode: 'booking',
    name: 'Lumina Studio | Fotografia & Filme',
    eyebrow: '📸 Retratos de Posicionamento, Casamentos, Gestantes & Eventos',
    headline: 'Imagens que transmitem autoridade profissional e eternizam suas melhores memórias.',
    subheadline: 'Direção de pose completa para quem não sabe posar. Receba sua prévia de fotos em até 24 horas.',
    ctaText: 'Consultar Agenda & Pacotes',
    catalogTitle: 'Ensaios & Coberturas',
    aboutText: 'Estúdio fotográfico completo com iluminação de cinema, camarim climatizado e consultoria de figurino para você se sentir confiante diante das lentes.',
    primaryColor: '#D4AF37',
    secondaryColor: '#F3E5AB',
    backgroundColor: '#09090B',
    surfaceColor: '#121216',
    textColor: '#F8FAFC',
    fontFamily: 'Playfair Display',
    borderRadius: '8px',
    heroImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Direção Completa de Poses', 'Galeria Online em Alta Resolução', 'Tratamento de Pele Natural', 'Estúdio Próprio ou Externo'],
    catalog: [
      { name: 'Ensaio de Posicionamento Profissional / Corporativo', description: 'Ideal para médicos, advogados, arquitetos e empresários. 20 fotos tratadas + 3 trocas de look.', price: 'R$ 590,00', category: 'Retratos', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80', badge: 'Autoridade' },
      { name: 'Cobertura de Casamento, 15 Anos ou Eventos', description: 'Equipe de fotografia e filmagem 4K com álbum panorâmico encadernado à mão.', price: 'Consultar Data', category: 'Eventos', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'buffet-espaco-eventos',
    title: 'Buffet Completo, Espaço de Festas & Casamentos',
    category: 'Eventos & Turismo',
    layoutVariant: 'luxury',
    interactionMode: 'booking',
    name: 'Villa Imperial Eventos & Gastronomia',
    eyebrow: '🥂 Casamentos, 15 Anos, Formaturas & Eventos Corporativos (50 a 400 Convidados)',
    headline: 'O cenário perfeito e a alta gastronomia para celebrar o dia mais importante da sua vida.',
    subheadline: 'Espaço integrado à natureza, salão climatizado com pé-direito duplo, gerador próprio e buffet autoral.',
    ctaText: 'Agendar Degustação & Visita',
    catalogTitle: 'Formatos de Eventos',
    aboutText: 'Há 18 anos realizando sonhos com festa completa chave na mão: gastronomia farta servida quente, bar de drinks, decoração, DJ e assessoria.',
    primaryColor: '#D97706',
    secondaryColor: '#FDE68A',
    backgroundColor: '#0C0A09',
    surfaceColor: '#1C1917',
    textColor: '#FAFAF9',
    fontFamily: 'Playfair Display',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Degustação Prévia para os Noivos', 'Gerador de Energia Incluso', 'Suíte da Noiva & Estacionamento', 'Parcelamento até a Data da Festa'],
    catalog: [
      { name: 'Pacote Casamento Completo (Espaço + Buffet + Bar + DJ)', description: 'Ilha gastronômica, jantar empratado ou franco-americano, doces finos e open bar.', price: 'Orçar por Nº de Convidados', category: 'Casamentos', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80', badge: 'All Inclusive' },
      { name: 'Festa Infantil / Aniversário / Confraternização', description: 'Cardápio personalizado de coquetel volante, finger foods, ilha de massas ou churrasco.', price: 'Solicitar Orçamento', category: 'Aniversários & Empresas', image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'pousada-hotel-chales',
    title: 'Pousada, Hotel & Chalés Românticos',
    category: 'Eventos & Turismo',
    layoutVariant: 'luxury',
    interactionMode: 'booking',
    name: 'Refúgio da Serra Chalés & Spa',
    eyebrow: '🏞️ Reserva Direta Sem Taxa de Sites • Hidromassagem com Vista, Lareira & Café Colonial',
    headline: 'Acorde acima das nuvens em um chalé privativo pensado para momentos a dois.',
    subheadline: 'Reserve direto pelo nosso site com 15% de desconto garantido sobre o Booking e ganhe espumante de boas-vindas.',
    ctaText: 'Consultar Datas e Reservar Direto',
    catalogTitle: 'Suítes & Chalés',
    aboutText: 'Localizada em meio à mata preservada com piscina aquecida de borda infinita, roupa de cama 600 fios Trussardi e café da manhã servido até às 12h.',
    primaryColor: '#059669',
    secondaryColor: '#D97706',
    backgroundColor: '#FAF8F5',
    surfaceColor: '#FFFFFF',
    textColor: '#1C1917',
    fontFamily: 'Playfair Display',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['15% OFF Reservando Direto no WhatsApp', 'Café da Manhã Colonial Incluso', 'Hidromassagem Dupla Aquecida', 'Pet Friendly'],
    catalog: [
      { name: 'Chalé Master Panorama (Hidro + Lareira + Deck Privativo)', description: 'Cama King Size, banheira de hidromassagem com parede de vidro para o vale e adega climatizada.', price: 'Ver Tarifário da Semana', category: 'Chalés', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80', badge: 'Mais Reservado' },
      { name: 'Pacote Fim de Semana Romântico (2 Diárias + Decoração)', description: '2 noites com pétalas de rosas, espumante, tábua de queijos e late check-out.', price: 'Consultar Datas', category: 'Pacotes', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'agencia-viagens-turismo',
    title: 'Agência de Viagens, Passagens & Pacotes Turísticos',
    category: 'Eventos & Turismo',
    layoutVariant: 'modern',
    interactionMode: 'whatsapp',
    name: 'Horizonte Viagens & Experiências',
    eyebrow: '✈️ Aéreo + Hotel + Passeios em até 12x • Suporte Humano 24h Durante a Viagem',
    headline: 'Viaje tranquilo com roteiros personalizados e tarifas exclusivas de operadora.',
    subheadline: 'Nordeste, Gramado, Caribe, Europa, Cruzeiros e Disney com acompanhamento antes, durante e depois do embarque.',
    ctaText: 'Cotar Minha Viagem no WhatsApp',
    catalogTitle: 'Destinos em Promoção',
    aboutText: 'Esqueça robôs de atendimento. Nossa equipe encontra a melhor combinação de voos e resorts, faz seu check-in e fica à disposição 24h durante toda a sua viagem.',
    primaryColor: '#0284C7',
    secondaryColor: '#F59E0B',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    fontFamily: 'Outfit',
    borderRadius: '24px',
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Assessoria Completa de Check-in e Vistos', 'Parcelamento no Cartão ou Boleto', 'Tarifas Acordadas com Resorts All-Inclusive', 'Plantão 24h para Passageiros'],
    catalog: [
      { name: 'Pacote Nordeste All-Inclusive (Maceió, Porto de Galinhas ou Bahia)', description: 'Passagem aérea ida e volta + 5 a 7 noites em Resort Pé na Areia + Transfer.', price: 'Cotar Datas', category: 'Brasil', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', badge: 'Promoção' },
      { name: 'Roteiro Internacional Sob Medida (Europa, Orlando ou Caribe)', description: 'Montamos seu roteiro completo com voos, hotéis bem localizados, seguro viagem e ingressos.', price: 'Solicitar Roteiro', category: 'Internacional', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'aluguel-brinquedos-festas',
    title: 'Locação para Festas, Decoração & Eventos',
    category: 'Eventos & Turismo',
    layoutVariant: 'modern',
    interactionMode: 'cart',
    name: 'FestaPronta Decorações & Locações',
    eyebrow: '🎈 Pegue e Monte ou Montagem Completa • Mais de 200 Temas Infantis e Adultos',
    headline: 'Transforme qualquer espaço em uma festa linda, completa e inesquecível.',
    subheadline: 'Arcos desconstruídos, painéis sublimados, móveis provençais, louças e brinquedos infláveis higienizados.',
    ctaText: 'Escolher Tema / Reservar Data',
    catalogTitle: 'Kits de Decoração & Brinquedos',
    aboutText: 'Facilitamos sua comemoração com kits práticos que cabem no porta-malas do carro ou com nossa equipe fazendo toda a montagem e desmontagem no local.',
    primaryColor: '#EC4899',
    secondaryColor: '#8B5CF6',
    backgroundColor: '#FDF4FF',
    surfaceColor: '#FFFFFF',
    textColor: '#1E1B4B',
    fontFamily: 'Outfit',
    borderRadius: '24px',
    heroImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=800&q=80',
    ],
    perks: ['Mais de 200 Temas Disponíveis', 'Opção Pegue e Monte Econômica', 'Montagem Pontual no Seu Espaço', 'Brinquedos com Monitores'],
    catalog: [
      { name: 'Kit Pegue e Monte Completo (Painel Redondo + Cilindros + Boleiras)', description: 'Cabe em qualquer carro! Escolha entre +200 temas infantis ou adultos.', price: 'R$ 189,00', category: 'Pegue e Monte', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80', badge: 'Campeão' },
      { name: 'Decoração Luxo com Montagem + Arco de Balões Orgânico', description: 'Nossa equipe entrega e monta toda a estrutura, iluminação e arco de balões no seu local.', price: 'A partir de R$ 690', category: 'Montagem Inclusa', image: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=600&q=80' },
    ],
  },
];

const EXTRA_NICHE_SEEDS: RawTemplateSeed[] = [
  {
    id: 'dedetizadora-controle-pragas',
    title: 'Dedetizadora & Controle de Pragas 24h',
    category: 'Serviços & Automotivo',
    layoutVariant: 'clinical',
    interactionMode: 'whatsapp',
    name: 'BioShield Controle de Pragas',
    eyebrow: '🛡️ Produtos Sem Cheiro (Gel & Microencapsulado) • Laudo ANVISA p/ Comércio',
    headline: 'Elimine baratas, formigas, escorpiões, cupins e roedores sem precisar sair de casa.',
    subheadline: 'Aplicação limpa, segura para crianças e animais, com garantia real de assistência gratuita.',
    ctaText: 'Solicitar Orçamento Imediato',
    catalogTitle: 'Dedetização & Sanitização',
    aboutText: 'Técnicos químicos credenciados utilizando domissanitários Bayer e Syngenta sem odor e sem manchar móveis.',
    primaryColor: '#16A34A',
    secondaryColor: '#22C55E',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    fontFamily: 'Inter',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=85',
    galleryImages: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'],
    perks: ['Produtos Sem Cheiro Bayer/Syngenta', 'Certificado Oficial p/ Vigilância Sanitária', 'Garantia de até 1 Ano', 'Atendimento no Mesmo Dia'],
    catalog: [
      { name: 'Dedetização Residencial Completa (Baratas, Formigas e Aranhas)', description: 'Aplicação combinada em gel e pulverização inodora em ralos, rodapés e cozinha.', price: 'A partir de R$ 160', category: 'Residencial', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80', badge: 'Sem Cheiro' },
      { name: 'Barreira Química Contra Escorpiões & Descupinização', description: 'Proteção perimetral de longa duração e eliminação de focos em madeiras.', price: 'Orçamento Grátis', category: 'Especializado', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'lavanderia-tinturaria-delivery',
    title: 'Lavanderia, Edredons, Ternos & Delivery',
    category: 'Serviços & Automotivo',
    layoutVariant: 'modern',
    interactionMode: 'cart',
    name: 'AcquaPura Lavanderia Express',
    eyebrow: '🧺 Coleta e Entrega Grátis • Edredons, Ternos, Vestidos de Festa & Cestos do Dia a Dia',
    headline: 'Suas roupas lavadas, macias, passadas e cheirosas sem você ter nenhum trabalho.',
    subheadline: 'Buscamos na sua porta e devolvemos prontas para guardar no armário.',
    ctaText: 'Pedir Coleta pelo WhatsApp',
    catalogTitle: 'Tabela de Lavanderia',
    aboutText: 'Secadoras industriais de alta temperatura que esterilizam edredons e roupas do dia a dia com amaciantes hipoalergênicos.',
    primaryColor: '#0EA5E9',
    secondaryColor: '#38BDF8',
    backgroundColor: '#F0F9FF',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    fontFamily: 'Outfit',
    borderRadius: '24px',
    heroImage: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=1200&q=85',
    galleryImages: ['https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80'],
    perks: ['Delivery Busca e Entrega', 'Secagem Quente Anti-Ácaros', 'Pacotes Mensais Econômicos', 'Lavagem a Seco p/ Ternos e Festa'],
    catalog: [
      { name: 'Lavagem e Secagem de Edredom Casal / Queen / King', description: 'Higienização profunda com tira-manchas OMO Profissional e embalagem a vácuo.', price: 'R$ 49,90', category: 'Cama & Banho', image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80', badge: 'Mais Pedido' },
      { name: 'Plano Cesto Mensal (20 Peças Lavadas e Passadas por Semana)', description: 'Ideal para quem mora sozinho ou casais que querem praticidade total.', price: 'R$ 249,00/mês', category: 'Assinatura', image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=600&q=80' },
    ],
  },
  {
    id: 'SaaS-software-b2b-startup',
    title: 'SaaS, Software B2B & Plataforma de IA',
    category: 'Jurídico & Corporativo',
    layoutVariant: 'modern',
    interactionMode: 'whatsapp',
    name: 'NexusCloud AI Platform',
    eyebrow: '⚡ Automação Inteligente em Nuvem • Teste Grátis por 7 Dias',
    headline: 'Centralize toda a operação comercial e financeira da sua empresa em um único painel.',
    subheadline: 'Reduza 14 horas semanais de trabalho manual com relatórios automáticos, CRM integrado ao WhatsApp e emissão de notas.',
    ctaText: 'Criar Conta / Ver Demonstração',
    catalogTitle: 'Planos da Plataforma',
    aboutText: 'Infraestrutura em nuvem com 99,98% de disponibilidade, criptografia ponta a ponta e migração gratuita assistida pelo nosso time de engenharia.',
    primaryColor: '#6366F1',
    secondaryColor: '#10B981',
    backgroundColor: '#09090B',
    surfaceColor: '#121218',
    textColor: '#F8FAFC',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '16px',
    heroImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85',
    galleryImages: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'],
    perks: ['Implementação em 15 Minutos', 'Integração Oficial com WhatsApp', 'Suporte Técnico em Português', 'Sem Fidelidade'],
    catalog: [
      { name: 'Plano Growth (Até 5 Usuários + Automação IA)', description: 'CRM ilimitado, disparos, relatórios financeiros e suporte prioritário.', price: 'R$ 197/mês', category: 'Mensal', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80', badge: 'Mais Popular' },
      { name: 'Plano Enterprise (Usuários Ilimitados + API Dedicada)', description: 'Gerente de conta exclusivo, treinamento da equipe e integrações customizadas.', price: 'Agendar Demo', category: 'Corporativo', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80' },
    ],
  },
];

const ALL_RAW_TEMPLATES: RawTemplateSeed[] = [...RAW_TEMPLATES_PART_1, ...RAW_TEMPLATES_PART_2, ...EXTRA_NICHE_SEEDS];

export const SITE_TEMPLATES: SiteStudioConfig[] = ALL_RAW_TEMPLATES.map((seed) => ({
  templateId: seed.id,
  templateTitle: seed.title,
  category: seed.category,
  layoutVariant: seed.layoutVariant,
  interactionMode: seed.interactionMode,
  name: seed.name,
  eyebrow: seed.eyebrow,
  headline: seed.headline,
  subheadline: seed.subheadline,
  ctaText: seed.ctaText,
  secondaryCtaText: 'Ver Localização & Contato',
  catalogTitle: seed.catalogTitle,
  catalogSubtitle: 'Selecione abaixo e finalize rapidamente pelo WhatsApp com atendimento prioritário.',
  aboutTitle: `Por que escolher a ${seed.name}?`,
  aboutText: seed.aboutText,
  footerText: `© ${new Date().getFullYear()} ${seed.name}. Todos os direitos reservados.`,
  primaryColor: seed.primaryColor,
  secondaryColor: seed.secondaryColor,
  backgroundColor: seed.backgroundColor,
  surfaceColor: seed.surfaceColor,
  textColor: seed.textColor,
  fontFamily: seed.fontFamily,
  borderRadius: seed.borderRadius,
  logoUrl: '',
  heroImage: seed.heroImage,
  galleryImages: seed.galleryImages,
  whatsapp: '5511999999999',
  phone: '(11) 99999-9999',
  address: 'Av. Principal, 1000 - Centro',
  city: 'São Paulo - SP',
  hours: 'Seg a Sáb: 09h às 20h',
  instagram: `@${seed.id.replace(/-/g, '')}`,
  pixKey: '',
  deliveryFee: 'Grátis na Região',
  showPrices: true,
  showGallery: true,
  showReviews: true,
  showFaq: true,
  showFloatingWhatsapp: true,
  perks: seed.perks,
  catalog: seed.catalog.map((item, idx) => ({
    ...item,
    id: `${seed.id}-item-${idx + 1}`,
  })),
  reviews: [
    {
      name: 'Mariana Albuquerque',
      role: 'Cliente Verificada ⭐⭐⭐⭐⭐',
      text: 'Atendimento impecável do começo ao fim! Superou totalmente minhas expectativas, recomendo de olhos fechados.',
      rating: 5,
    },
    {
      name: 'Rodrigo Vasconcelos',
      role: 'Cliente Recorrente ⭐⭐⭐⭐⭐',
      text: 'Qualidade absurda, pontualidade e preço justo. Já indiquei para toda a minha família e amigos.',
      rating: 5,
    },
    {
      name: 'Fernanda Siqueira',
      role: 'Avaliação Google 5.0 ⭐⭐⭐⭐⭐',
      text: 'Muito prático pedir pelo site direto no WhatsApp. Foram super atenciosos e rápidos!',
      rating: 5,
    },
  ],
  faqs: [
    {
      question: 'Como funciona o atendimento ou pedido pelo site?',
      answer: 'Basta escolher os itens ou serviços desejados nesta página e clicar no botão de confirmação. Seu pedido ou agendamento já chega formatado no nosso WhatsApp para atendimento imediato.',
    },
    {
      question: 'Quais são as formas de pagamento aceitas?',
      answer: 'Aceitamos PIX com confirmação instantânea, cartões de crédito com parcelamento facilitado e cartões de débito.',
    },
    {
      question: 'Preciso agendar com antecedência?',
      answer: 'Atendemos tanto por ordem de chegada/pronta-entrega quanto com horário reservado pelo WhatsApp para sua total comodidade.',
    },
  ],
}));

export function findBestTemplateForNiche(nicheOrCategory?: string): SiteStudioConfig {
  if (!nicheOrCategory) return structuredClone(SITE_TEMPLATES[0]);
  const q = nicheOrCategory.toLowerCase();

  const keywordMap: [string[], string][] = [
    [['hamburg', 'burger', 'lanche', 'smash'], 'hamburgueria-artesanal'],
    [['pizza', 'pizzaria', 'forno', 'calzone'], 'pizzaria-forno-lenha'],
    [['sushi', 'japon', 'temaki', 'oriental'], 'restaurante-japones-sushi'],
    [['acai', 'açaí', 'sorvet', 'gelato'], 'acaiteria-sorveteria'],
    [['cafe', 'café', 'padaria', 'panificadora', 'brunch'], 'cafeteria-padaria-artesanal'],
    [['bolo', 'doce', 'confeitaria', 'brigadeiro', 'torta'], 'confeitaria-doceria'],
    [['churrasc', 'espeto', 'espetinho', 'parrilla', 'carne'], 'churrascaria-espetinho'],
    [['marmit', 'fit', 'saudavel', 'saudável', 'restaurante'], 'marmitaria-fit-saudavel'],
    [['bar', 'pub', 'drink', 'cervej'], 'bar-gastrobar-drinks'],
    [['pastel', 'salgado', 'coxinha'], 'lanchonete-pastelaria'],
    [['barbearia', 'barbeiro', 'barber'], 'barbearia-vip'],
    [['salao', 'salão', 'cabel', 'mechas', 'cabeleireir'], 'salao-beleza-cabelo'],
    [['estetic', 'estétic', 'botox', 'harmoniza', 'laser', 'depila'], 'clinica-estetica-avancada'],
    [['unha', 'manicure', 'nail', 'esmalteria'], 'studio-unhas-nail-designer'],
    [['cilio', 'cílio', 'lash', 'sobrancelha'], 'sobrancelhas-cilios-lash'],
    [['spa', 'massag', 'drenagem'], 'spa-massoterapia'],
    [['tatuag', 'tattoo', 'piercing'], 'studio-tatuagem-piercing'],
    [['odonto', 'dentist', 'implante', 'sorriso', 'ortodont'], 'clinica-odontologica'],
    [['medic', 'médic', 'clinica', 'clínica', 'cardio', 'dermato', 'pediatr'], 'clinica-medica-popular'],
    [['psico', 'terapia', 'terapeuta', 'mental'], 'psicologia-terapia'],
    [['nutri', 'emagrec'], 'nutricao-emagrecimento'],
    [['fisio', 'quiro', 'osteopat', 'coluna'], 'fisioterapia-quiropraxia'],
    [['laborat', 'exame', 'sangue'], 'laboratorio-exames'],
    [['otica', 'óptica', 'ótica', 'oculos', 'óculos'], 'otica-saude-visual'],
    [['academia', 'muscula', 'fitness', 'gym'], 'academia-musculacao'],
    [['personal', 'treinador'], 'personal-trainer-consultoria'],
    [['crossfit', 'funcional', 'box'], 'box-crossfit-funcional'],
    [['pilates', 'yoga'], 'studio-pilates-yoga'],
    [['jiu', 'muay', 'luta', 'boxe', 'karate', 'marcia'], 'artes-marciais-jiu-jitsu'],
    [['pet', 'banho e tosa', 'tosa'], 'pet-shop-banho-tosa'],
    [['veterin', 'vet'], 'clinica-veterinaria-24h'],
    [['creche pet', 'hotel pet', 'day care'], 'hotelzinho-creche-pet'],
    [['adestra', 'k9'], 'adestramento-canino'],
    [['oficina', 'mecanica', 'mecânica', 'auto center', 'pneu', 'freio'], 'oficina-mecanica-auto-center'],
    [['lava', 'polimento', 'vitrifica', 'estetica automotiva'], 'estetica-automotiva-lava-jato'],
    [['chaveiro', 'fechadura'], 'chaveiro-24-horas'],
    [['eletric', 'ar condicionado', 'ar-condicionado', 'climatiza'], 'eletricista-manutencao'],
    [['encanador', 'vazamento', 'desentup', 'hidraulic'], 'encanador-caca-vazamentos'],
    [['sofa', 'sofá', 'estofado', 'higieniza', 'tapete'], 'limpeza-estofados-higienizacao'],
    [['celular', 'iphone', 'assistencia', 'assistência', 'conserto', 'notebook'], 'assistencia-tecnica-celulares'],
    [['solar', 'fotovolta'], 'energia-solar-engenharia'],
    [['advog', 'juridic', 'jurídic', 'direito', 'oab'], 'escritorio-advocacia'],
    [['contabil', 'contador', 'cnpj', 'fiscal'], 'contabilidade-consultiva'],
    [['marketing', 'trafego', 'tráfego', 'agencia', 'agência'], 'agencia-marketing-digital'],
    [['seguro', 'plano de saude', 'consórcio', 'consorcio'], 'consultoria-financeira-seguros'],
    [['arquitet', 'interiores', 'decora'], 'arquitetura-design-interiores'],
    [['imobil', 'imóveis', 'imoveis', 'loteamento'], 'imobiliaria-alto-padrao'],
    [['corretor', 'apartamento', 'minha casa'], 'corretor-imoveis-autonomo'],
    [['construt', 'reforma', 'engenharia', 'obra'], 'construtora-reformas-engenharia'],
    [['marcenaria', 'moveis', 'móveis', 'planejado'], 'marcenaria-moveis-planejados'],
    [['vidra', 'esquadria', 'espellho', 'blindex'], 'vidracaria-esquadrias-aluminio'],
    [['curso', 'infoprodut', 'treinamento', 'ebook'], 'curso-online-infoproduto'],
    [['mentor', 'consultoria empresarial'], 'mentoria-executiva-high-ticket'],
    [['ingles', 'inglês', 'idioma'], 'escola-idiomas-ingles'],
    [['autoescola', 'cnh', 'habilita'], 'autoescola-cfc-habilitacao'],
    [['roupa', 'moda', 'boutique', 'vestido', 'loja'], 'loja-roupas-moda'],
    [['joia', 'aliança', 'alianca', 'relogio', 'prata', 'ouro'], 'joalheria-relojoaria-semijoias'],
    [['flor', 'cesta', 'buque', 'buquê'], 'floricultura-cestas-presentes'],
    [['carro', 'seminovo', 'veiculo', 'veículo', 'multimarcas'], 'concessionaria-seminovos-multimarcas'],
    [['fotograf', 'foto', 'ensaio', 'filmagem'], 'fotografo-profissional-estudio'],
    [['buffet', 'casamento', 'evento', 'salao de festa'], 'buffet-espaco-eventos'],
    [['pousada', 'hotel', 'chale', 'chalé', 'hospedagem'], 'pousada-hotel-chales'],
    [['viagen', 'turismo', 'passagen', 'excurs'], 'agencia-viagens-turismo'],
    [['dedetiz', 'praga', 'cupim'], 'dedetizadora-controle-pragas'],
    [['lavanderia', 'tinturaria'], 'lavanderia-tinturaria-delivery'],
    [['saas', 'software', 'sistema', 'tecnologia'], 'SaaS-software-b2b-startup'],
  ];

  for (const [keywords, templateId] of keywordMap) {
    if (keywords.some((k) => q.includes(k))) {
      const found = SITE_TEMPLATES.find((t) => t.templateId === templateId);
      if (found) return structuredClone(found);
    }
  }

  const directMatch = SITE_TEMPLATES.find(
    (t) => t.templateId === q || t.templateTitle.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
  );
  return structuredClone(directMatch || SITE_TEMPLATES[0]);
}

function esc(str: string = ''): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isLightHex(hex: string): boolean {
  const clean = (hex || '#09090B').replace('#', '');
  if (clean.length !== 6) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62;
}

export function compileTemplateToHtml(config: SiteStudioConfig): string {
  const fontPreset = FONT_PRESETS.find((f) => f.id === config.fontFamily) || FONT_PRESETS[0];
  const isLightBg = isLightHex(config.backgroundColor);
  const mutedText = isLightBg ? '#52525B' : '#A1A1AA';
  const borderColor = isLightBg ? 'rgba(15, 23, 42, 0.10)' : 'rgba(255, 255, 255, 0.10)';
  const glassBg = isLightBg ? 'rgba(255, 255, 255, 0.88)' : 'rgba(15, 15, 20, 0.86)';
  const btnTextColor = isLightHex(config.primaryColor) ? '#09090B' : '#FFFFFF';
  const rawWaDigits = (config.whatsapp || config.phone || '5511999999999').replace(/\D/g, '') || '5511999999999';
  const cleanDigits =
    rawWaDigits.length >= 10 && rawWaDigits.length <= 11 && !rawWaDigits.startsWith('55')
      ? `55${rawWaDigits}`
      : rawWaDigits;

  const categories = ['Todos', ...Array.from(new Set(config.catalog.map((c) => c.category).filter(Boolean)))];

  const actionLabel =
    config.interactionMode === 'cart'
      ? '+ Adicionar ao Pedido'
      : config.interactionMode === 'booking'
      ? 'Agendar Horário'
      : 'Solicitar no WhatsApp';

  const catalogCardsHtml = config.catalog
    .map((item, idx) => {
      const isAvailable = item.available !== false;
      const badgeText = !isAvailable ? '⛔ Esgotado Hoje' : item.badge;
      return `
      <div class="catalog-card" data-category="${esc(item.category)}" data-idx="${idx}" style="${!isAvailable ? 'opacity:0.65;' : ''}">
        <div class="card-media">
          <img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy" style="${!isAvailable ? 'filter:grayscale(65%);' : ''}" />
          ${badgeText ? `<span class="card-badge" style="${!isAvailable ? 'background:#EF4444;color:#FFFFFF;' : ''}">${esc(badgeText)}</span>` : ''}
          <span class="card-cat-tag">${esc(item.category)}</span>
        </div>
        <div class="card-body">
          <div class="card-head">
            <h3>${esc(item.name)}</h3>
            ${config.showPrices && item.price ? `<span class="card-price">${esc(item.price)}</span>` : ''}
          </div>
          <p class="card-desc">${esc(item.description)}</p>
          ${
            isAvailable
              ? `<button type="button" class="card-btn" onclick="handleItemAction(${idx})">
                  <span>${actionLabel}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>`
              : `<button type="button" class="card-btn" disabled style="opacity:0.55;cursor:not-allowed;background:rgba(239,68,68,0.12);color:#F87171;border:1px solid rgba(239,68,68,0.3);">
                  <span>Indisponível no momento</span>
                </button>`
          }
        </div>
      </div>`;
    })
    .join('\n');

  const perksHtml = config.perks
    .map(
      (perk) => `
      <div class="perk-pill">
        <span class="perk-dot">✓</span>
        <span>${esc(perk)}</span>
      </div>`
    )
    .join('\n');

  const galleryHtml =
    config.showGallery && config.galleryImages.length > 0
      ? `
    <section class="section" id="galeria">
      <div class="container">
        <div class="section-header">
          <span class="section-kicker">ESTRUTURA & PORTFÓLIO</span>
          <h2>Conheça nosso padrão de qualidade</h2>
        </div>
        <div class="gallery-grid">
          ${config.galleryImages
            .map(
              (img, i) => `
            <div class="gallery-item">
              <img src="${esc(img)}" alt="${esc(config.name)} foto ${i + 1}" loading="lazy" />
            </div>`
            )
            .join('\n')}
        </div>
      </div>
    </section>`
      : '';

  const reviewsHtml =
    config.showReviews && config.reviews.length > 0
      ? `
    <section class="section section-alt" id="avaliacoes">
      <div class="container">
        <div class="section-header">
          <span class="section-kicker">PROVA SOCIAL VERIFICADA</span>
          <h2>O que nossos clientes dizem</h2>
        </div>
        <div class="reviews-grid">
          ${config.reviews
            .map(
              (r) => `
            <div class="review-card">
              <div class="stars">★★★★★</div>
              <p class="review-text">"${esc(r.text)}"</p>
              <div class="review-author">
                <div class="avatar">${esc(r.name.charAt(0))}</div>
                <div>
                  <strong>${esc(r.name)}</strong>
                  <span>${esc(r.role)}</span>
                </div>
              </div>
            </div>`
            )
            .join('\n')}
        </div>
      </div>
    </section>`
      : '';

  const faqHtml =
    config.showFaq && config.faqs.length > 0
      ? `
    <section class="section" id="duvidas">
      <div class="container narrow">
        <div class="section-header">
          <span class="section-kicker">DÚVIDAS FREQUENTES</span>
          <h2>Perguntas & Respostas</h2>
        </div>
        <div class="faq-list">
          ${config.faqs
            .map(
              (f) => `
            <details class="faq-item">
              <summary>${esc(f.question)}</summary>
              <p>${esc(f.answer)}</p>
            </details>`
            )
            .join('\n')}
        </div>
      </div>
    </section>`
      : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(config.name)} — ${esc(config.templateTitle)}</title>
  <meta name="description" content="${esc(config.subheadline)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${fontPreset.importUrl}" rel="stylesheet">
  <style>
    :root {
      --primary: ${config.primaryColor};
      --secondary: ${config.secondaryColor};
      --bg: ${config.backgroundColor};
      --surface: ${config.surfaceColor};
      --text: ${config.textColor};
      --muted: ${mutedText};
      --border: ${borderColor};
      --glass: ${glassBg};
      --btn-text: ${btnTextColor};
      --radius: ${config.borderRadius};
      --font-heading: '${config.fontFamily}', sans-serif;
      --font-body: '${config.fontFamily === 'Playfair Display' || config.fontFamily === 'Syne' ? 'Inter' : config.fontFamily}', sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    .container.narrow { max-width: 820px; }

    /* Navbar */
    .navbar {
      position: sticky;
      top: 0;
      z-index: 50;
      background: var(--glass);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      padding: 16px 0;
    }
    .nav-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .brand { display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--text); font-family: var(--font-heading); font-weight: 800; font-size: 1.25rem; letter-spacing: -0.02em; }
    .brand img { height: 40px; width: 40px; object-fit: cover; border-radius: 10px; }
    .brand-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--primary); box-shadow: 0 0 14px var(--primary); }
    .nav-links { display: flex; align-items: center; gap: 24px; }
    .nav-links a { color: var(--muted); text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color .2s; }
    .nav-links a:hover { color: var(--text); }
    .nav-cta {
      background: var(--primary);
      color: var(--btn-text);
      padding: 10px 20px;
      border-radius: var(--radius);
      font-weight: 700;
      font-size: 0.88rem;
      text-decoration: none;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: transform .2s, opacity .2s;
    }
    .nav-cta:hover { transform: translateY(-1px); opacity: 0.94; }

    /* Hero Layouts */
    .hero {
      padding: 72px 0 56px;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -120px;
      right: -120px;
      width: 480px;
      height: 480px;
      background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
      opacity: 0.14;
      pointer-events: none;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1.12fr 0.88fr;
      gap: 48px;
      align-items: center;
    }
    body.layout-luxury .hero-grid,
    body.layout-minimal .hero-grid {
      grid-template-columns: 1fr;
      text-align: center;
      max-width: 900px;
      margin: 0 auto;
    }
    body.layout-luxury .hero-actions,
    body.layout-minimal .hero-actions,
    body.layout-luxury .perks-row,
    body.layout-minimal .perks-row {
      justify-content: center;
    }
    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 999px;
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--primary);
      font-size: 0.82rem;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .hero h1 {
      font-family: var(--font-heading);
      font-size: clamp(2.1rem, 4.4vw, 3.6rem);
      line-height: 1.1;
      letter-spacing: -0.03em;
      margin-bottom: 20px;
    }
    .hero p.lead {
      font-size: 1.1rem;
      color: var(--muted);
      margin-bottom: 30px;
      max-width: 640px;
    }
    body.layout-luxury .hero p.lead,
    body.layout-minimal .hero p.lead {
      margin-left: auto;
      margin-right: auto;
    }
    .hero-actions { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 32px; }
    .btn-primary {
      background: var(--primary);
      color: var(--btn-text);
      padding: 15px 28px;
      border-radius: var(--radius);
      font-weight: 800;
      font-size: 1rem;
      text-decoration: none;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 12px 30px -10px var(--primary);
      transition: transform .2s;
    }
    .btn-primary:hover { transform: translateY(-2px); }
    .btn-secondary {
      background: var(--surface);
      color: var(--text);
      padding: 15px 24px;
      border-radius: var(--radius);
      font-weight: 600;
      font-size: 0.96rem;
      text-decoration: none;
      border: 1px solid var(--border);
      transition: border-color .2s;
    }
    .btn-secondary:hover { border-color: var(--primary); }

    .perks-row { display: flex; flex-wrap: wrap; gap: 10px; }
    .perk-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 13px;
      border-radius: var(--radius);
      background: var(--surface);
      border: 1px solid var(--border);
      font-size: 0.82rem;
      font-weight: 600;
    }
    .perk-dot {
      color: var(--primary);
      font-weight: 900;
    }
    .hero-visual { position: relative; }
    .hero-visual img {
      width: 100%;
      height: 460px;
      object-fit: cover;
      border-radius: calc(var(--radius) + 4px);
      border: 1px solid var(--border);
      box-shadow: 0 24px 60px rgba(0,0,0,0.35);
    }
    .hero-floating-card {
      position: absolute;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: var(--glass);
      backdrop-filter: blur(14px);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .status-online { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 700; }
    .pulse-dot { width: 10px; height: 10px; border-radius: 50%; background: #10B981; box-shadow: 0 0 10px #10B981; }

    /* Sections */
    .section { padding: 72px 0; }
    .section-alt { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .section-header { text-align: center; max-width: 680px; margin: 0 auto 40px; }
    .section-kicker {
      display: inline-block;
      font-size: 0.76rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--primary);
      margin-bottom: 8px;
    }
    .section-header h2 {
      font-family: var(--font-heading);
      font-size: clamp(1.75rem, 3vw, 2.5rem);
      letter-spacing: -0.02em;
      margin-bottom: 10px;
    }
    .section-header p { color: var(--muted); font-size: 0.98rem; }

    /* Category Filter Tabs */
    .cat-tabs {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      margin-bottom: 34px;
    }
    .cat-tab {
      padding: 9px 18px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--muted);
      font-weight: 600;
      font-size: 0.86rem;
      cursor: pointer;
      transition: all .2s;
    }
    .cat-tab.active, .cat-tab:hover {
      background: var(--primary);
      color: var(--btn-text);
      border-color: var(--primary);
    }

    /* Catalog Grid */
    .catalog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }
    .catalog-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform .22s, border-color .22s;
    }
    .catalog-card:hover {
      transform: translateY(-4px);
      border-color: var(--primary);
    }
    .card-media { position: relative; height: 215px; overflow: hidden; }
    .card-media img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }
    .catalog-card:hover .card-media img { transform: scale(1.05); }
    .card-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: var(--primary);
      color: var(--btn-text);
      font-size: 0.74rem;
      font-weight: 800;
      padding: 4px 11px;
      border-radius: 999px;
    }
    .card-cat-tag {
      position: absolute;
      bottom: 12px;
      right: 12px;
      background: var(--glass);
      backdrop-filter: blur(8px);
      color: var(--text);
      font-size: 0.72rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 999px;
      border: 1px solid var(--border);
    }
    .card-body { padding: 22px; display: flex; flex-direction: column; flex: 1; }
    .card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
    .card-head h3 { font-family: var(--font-heading); font-size: 1.15rem; line-height: 1.3; }
    .card-price {
      color: var(--primary);
      font-weight: 800;
      font-size: 1.05rem;
      white-space: nowrap;
    }
    .card-desc { color: var(--muted); font-size: 0.9rem; margin-bottom: 20px; flex: 1; }
    .card-btn {
      width: 100%;
      padding: 12px 16px;
      border-radius: var(--radius);
      background: var(--primary);
      color: var(--btn-text);
      font-weight: 700;
      font-size: 0.9rem;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: opacity .2s;
    }
    .card-btn:hover { opacity: 0.92; }

    /* About & Contact */
    .about-box {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 36px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 40px;
      align-items: center;
    }
    .info-list { display: flex; flex-direction: column; gap: 14px; }
    .info-row {
      padding: 14px 18px;
      border-radius: var(--radius);
      background: var(--bg);
      border: 1px solid var(--border);
      font-size: 0.92rem;
    }
    .info-row strong { display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--primary); margin-bottom: 2px; }

    /* Gallery & Reviews */
    .gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; }
    .gallery-item img { width: 100%; height: 260px; object-fit: cover; border-radius: var(--radius); border: 1px solid var(--border); }
    .reviews-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
    .review-card { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; }
    .stars { color: #FACC15; font-size: 1.05rem; letter-spacing: 2px; margin-bottom: 12px; }
    .review-text { font-size: 0.95rem; margin-bottom: 18px; color: var(--text); }
    .review-author { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--primary); color: var(--btn-text); display: flex; align-items: center; justify-content: center; font-weight: 800; }
    .review-author strong { display: block; font-size: 0.9rem; }
    .review-author span { font-size: 0.78rem; color: var(--muted); }

    /* FAQ */
    .faq-list { display: flex; flex-direction: column; gap: 12px; }
    .faq-item { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 22px; }
    .faq-item summary { font-weight: 700; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
    .faq-item summary::after { content: '+'; color: var(--primary); font-size: 1.3rem; font-weight: 800; }
    .faq-item[open] summary::after { content: '−'; }
    .faq-item p { margin-top: 12px; color: var(--muted); font-size: 0.92rem; }

    /* Floating Cart Bar & Modal */
    .cart-bar {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 90;
      background: var(--primary);
      color: var(--btn-text);
      padding: 14px 24px;
      border-radius: 999px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      display: none;
      align-items: center;
      gap: 18px;
      cursor: pointer;
      font-weight: 800;
    }
    .cart-bar.visible { display: inline-flex; }
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.75);
      backdrop-filter: blur(6px);
      z-index: 100;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .modal-backdrop.open { display: flex; }
    .modal-card {
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      max-width: 480px;
      width: 100%;
      padding: 28px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-card h3 { font-family: var(--font-heading); font-size: 1.35rem; margin-bottom: 14px; }
    .form-field { margin-bottom: 14px; }
    .form-field label { display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 5px; color: var(--muted); }
    .form-field input, .form-field select, .form-field textarea {
      width: 100%;
      padding: 11px 14px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text);
      font-family: inherit;
    }

    /* Floating WhatsApp */
    .wa-float {
      position: fixed;
      bottom: 22px;
      right: 22px;
      z-index: 80;
      background: #25D366;
      color: #fff;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 12px 30px rgba(37, 211, 102, 0.45);
      text-decoration: none;
      transition: transform .2s;
    }
    .wa-float:hover { transform: scale(1.08); }

    footer {
      padding: 40px 0;
      border-top: 1px solid var(--border);
      text-align: center;
      color: var(--muted);
      font-size: 0.88rem;
    }

    @media (max-width: 860px) {
      .hero-grid, .about-box { grid-template-columns: 1fr; }
      .nav-links { display: none; }
      .hero-visual img { height: 320px; }
    }
  </style>
</head>
<body class="layout-${config.layoutVariant}">
  ${
    config.promoBannerText && config.promoBannerText.trim()
      ? `<div style="background:var(--primary);color:var(--btn-text);text-align:center;padding:9px 16px;font-size:0.84rem;font-weight:800;letter-spacing:0.01em;">
          ${esc(config.promoBannerText)}
        </div>`
      : ''
  }

  <header class="navbar">
    <div class="container nav-inner">
      <a href="#" class="brand">
        ${config.logoUrl ? `<img src="${esc(config.logoUrl)}" alt="${esc(config.name)}" />` : `<span class="brand-dot"></span>`}
        <span>${esc(config.name)}</span>
      </a>
      <nav class="nav-links">
        <a href="#catalogo">${esc(config.catalogTitle)}</a>
        <a href="#sobre">Sobre</a>
        ${config.showReviews ? `<a href="#avaliacoes">Avaliações</a>` : ''}
        ${config.showFaq ? `<a href="#duvidas">Dúvidas</a>` : ''}
        <a href="#contato">Localização</a>
      </nav>
      <a href="#catalogo" class="nav-cta">${esc(config.ctaText)}</a>
    </div>
  </header>

  <section class="hero">
    <div class="container hero-grid">
      <div>
        <div class="eyebrow">${esc(config.eyebrow)}</div>
        <h1>${esc(config.headline)}</h1>
        <p class="lead">${esc(config.subheadline)}</p>
        <div class="hero-actions">
          <a href="#catalogo" class="btn-primary">
            <span>${esc(config.ctaText)}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="#contato" class="btn-secondary">${esc(config.secondaryCtaText)}</a>
        </div>
        <div class="perks-row">
          ${perksHtml}
        </div>
      </div>
      <div class="hero-visual">
        <img src="${esc(config.heroImage)}" alt="${esc(config.name)}" />
        <div class="hero-floating-card">
          <div class="status-online" style="${
            config.storeStatus === 'closed'
              ? 'color:#F87171;'
              : config.storeStatus === 'busy'
              ? 'color:#FBBF24;'
              : 'color:#10B981;'
          }">
            <span class="pulse-dot" style="${
              config.storeStatus === 'closed'
                ? 'background:#EF4444;box-shadow:0 0 10px #EF4444;'
                : config.storeStatus === 'busy'
                ? 'background:#F59E0B;box-shadow:0 0 10px #F59E0B;'
                : 'background:#10B981;box-shadow:0 0 10px #10B981;'
            }"></span>
            <span>${
              config.storeStatus === 'closed'
                ? 'Fechado no momento'
                : config.storeStatus === 'busy'
                ? 'Alta Demanda • Últimos Horários'
                : 'Aberto Agora'
            } • ${esc(config.waitTimeText || config.city)}</span>
          </div>
          <span style="font-size:0.8rem;color:var(--muted);">${esc(config.hours)}</span>
        </div>
      </div>
    </div>
  </section>

  <section class="section section-alt" id="catalogo">
    <div class="container">
      <div class="section-header">
        <span class="section-kicker">${esc(config.category)}</span>
        <h2>${esc(config.catalogTitle)}</h2>
        <p>${esc(config.catalogSubtitle)}</p>
      </div>

      ${
        categories.length > 2
          ? `<div class="cat-tabs">
              ${categories
                .map(
                  (cat, i) =>
                    `<button type="button" class="cat-tab ${i === 0 ? 'active' : ''}" onclick="filterCategory('${esc(cat)}', this)">${esc(cat)}</button>`
                )
                .join('')}
            </div>`
          : ''
      }

      <div class="catalog-grid" id="catalogGrid">
        ${catalogCardsHtml}
      </div>
    </div>
  </section>

  ${galleryHtml}

  <section class="section" id="sobre">
    <div class="container">
      <div class="about-box" id="contato">
        <div>
          <span class="section-kicker">SOBRE NÓS & CONTATO</span>
          <h2 style="font-family:var(--font-heading);font-size:2rem;margin:8px 0 16px;">${esc(config.aboutTitle)}</h2>
          <p style="color:var(--muted);margin-bottom:24px;">${esc(config.aboutText)}</p>
          <a href="https://wa.me/${cleanDigits}?text=${encodeURIComponent(`Olá! Vim pelo site da ${config.name} e gostaria de atendimento.`)}" target="_blank" rel="noopener noreferrer" class="btn-primary">
            Falar no WhatsApp Agora
          </a>
        </div>
        <div class="info-list">
          <div class="info-row">
            <strong>📍 Endereço & Cidade</strong>
            <span>${esc(config.address)} — ${esc(config.city)}</span>
          </div>
          <div class="info-row">
            <strong>🕒 Horário de Funcionamento</strong>
            <span>${esc(config.hours)}</span>
          </div>
          <div class="info-row">
            <strong>📲 WhatsApp & Telefone</strong>
            <span>${esc(config.phone)}</span>
          </div>
          ${
            config.instagram
              ? `<div class="info-row">
                  <strong>📸 Instagram</strong>
                  <span>${esc(config.instagram)}</span>
                </div>`
              : ''
          }
        </div>
      </div>
    </div>
  </section>

  ${reviewsHtml}
  ${faqHtml}

  <footer>
    <div class="container">
      <p>${esc(config.footerText)}</p>
      ${
        config.showAdminLinkInFooter && config.siteSlug
          ? `<div style="margin-top:12px;">
              <a href="/painel/${esc(config.siteSlug)}" target="_blank" style="color:var(--muted);opacity:0.55;font-size:0.75rem;text-decoration:none;">
                🔒 Área do Estabelecimento
              </a>
            </div>`
          : ''
      }
    </div>
  </footer>

  <!-- Interactive Floating Cart Bar -->
  <div id="cartBar" class="cart-bar" onclick="openCheckoutModal()">
    <span id="cartCount">0 itens</span>
    <span>•</span>
    <span>Ver Sacola & Finalizar no WhatsApp →</span>
  </div>

  <!-- Interactive Checkout / Booking Modal -->
  <div id="actionModal" class="modal-backdrop">
    <div class="modal-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h3 id="modalTitle">Finalizar pelo WhatsApp</h3>
        <button onclick="closeModal()" style="background:none;border:none;color:var(--muted);font-size:1.5rem;cursor:pointer;">×</button>
      </div>
      <div id="modalItemsList" style="margin-bottom:16px;font-size:0.9rem;color:var(--muted);"></div>
      <div class="form-field">
        <label>Seu Nome</label>
        <input type="text" id="clientName" placeholder="Digite seu nome completo" />
      </div>
      ${
        config.interactionMode === 'cart'
          ? `<div class="form-field">
              <label>Endereço de Entrega ou Retirada</label>
              <input type="text" id="clientAddress" placeholder="Rua, número, bairro (ou escreva Vou Retirar)" />
            </div>
            <div class="form-field">
              <label>Forma de Pagamento</label>
              <select id="clientPayment">
                <option value="PIX">PIX</option>
                <option value="Cartão de Crédito/Débito">Cartão de Crédito / Débito</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>`
          : `<div class="form-field">
              <label>Dia e Período de Preferência</label>
              <input type="text" id="clientSchedule" placeholder="Ex: Amanhã às 15h ou Sábado de manhã" />
            </div>`
      }
      <div class="form-field">
        <label>Observações (Opcional)</label>
        <textarea id="clientNotes" rows="2" placeholder="Algum detalhe adicional?"></textarea>
      </div>
      <button type="button" class="btn-primary" style="width:100%;justify-content:center;" onclick="sendToWhatsApp()">
        Enviar Agora para o WhatsApp
      </button>
    </div>
  </div>

  ${
    config.showFloatingWhatsapp
      ? `<a href="https://wa.me/${cleanDigits}?text=${encodeURIComponent(`Olá! Vim pelo site da ${config.name} e gostaria de mais informações.`)}" target="_blank" rel="noopener noreferrer" class="wa-float" title="Atendimento no WhatsApp">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z"/></svg>
        </a>`
      : ''
  }

  <script>
    const CATALOG = ${JSON.stringify(
      config.catalog.map((c) => ({ name: c.name, price: c.price, category: c.category }))
    )};
    const MODE = ${JSON.stringify(config.interactionMode)};
    const WA_NUMBER = ${JSON.stringify(cleanDigits)};
    const STORE_NAME = ${JSON.stringify(config.name)};
    let cart = [];
    let selectedItem = null;

    function filterCategory(cat, btn) {
      document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      document.querySelectorAll('.catalog-card').forEach(card => {
        const c = card.getAttribute('data-category');
        card.style.display = (cat === 'Todos' || c === cat) ? 'flex' : 'none';
      });
    }

    function handleItemAction(idx) {
      const item = CATALOG[idx];
      if (!item) return;
      if (MODE === 'cart') {
        const existing = cart.find(i => i.name === item.name);
        if (existing) existing.qty += 1;
        else cart.push({ ...item, qty: 1 });
        updateCartBar();
        openCheckoutModal();
      } else {
        selectedItem = item;
        openCheckoutModal();
      }
    }

    function updateCartBar() {
      const bar = document.getElementById('cartBar');
      const countEl = document.getElementById('cartCount');
      const totalItems = cart.reduce((acc, i) => acc + i.qty, 0);
      if (totalItems > 0) {
        bar.classList.add('visible');
        countEl.textContent = totalItems + (totalItems === 1 ? ' item na sacola' : ' itens na sacola');
      } else {
        bar.classList.remove('visible');
      }
    }

    function changeQty(idx, delta) {
      if (!cart[idx]) return;
      cart[idx].qty += delta;
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
      updateCartBar();
      renderModalItems();
    }

    function renderModalItems() {
      const box = document.getElementById('modalItemsList');
      if (MODE === 'cart') {
        if (cart.length === 0) {
          box.innerHTML = '<p>Sua sacola está vazia. Escolha itens no cardápio.</p>';
          return;
        }
        box.innerHTML = cart.map((i, idx) =>
          '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">' +
            '<div><strong>' + i.qty + 'x ' + i.name + '</strong><br/><small>' + (i.price || '') + '</small></div>' +
            '<div style="display:flex;gap:6px;">' +
              '<button type="button" onclick="changeQty(' + idx + ',-1)" style="width:28px;height:28px;border-radius:6px;border:1px solid var(--border);background:var(--bg);color:var(--text);cursor:pointer;">-</button>' +
              '<button type="button" onclick="changeQty(' + idx + ',1)" style="width:28px;height:28px;border-radius:6px;border:1px solid var(--border);background:var(--bg);color:var(--text);cursor:pointer;">+</button>' +
            '</div>' +
          '</div>'
        ).join('');
      } else if (selectedItem) {
        box.innerHTML = '<div style="padding:12px;border-radius:10px;background:var(--bg);border:1px solid var(--border);"><strong>Selecionado:</strong> ' + selectedItem.name + (selectedItem.price ? ' (' + selectedItem.price + ')' : '') + '</div>';
      }
    }

    function openCheckoutModal() {
      renderModalItems();
      document.getElementById('actionModal').classList.add('open');
    }

    function closeModal() {
      document.getElementById('actionModal').classList.remove('open');
    }

    function sendToWhatsApp() {
      const name = (document.getElementById('clientName')?.value || '').trim() || 'Cliente';
      const notes = (document.getElementById('clientNotes')?.value || '').trim();
      let msg = 'Olá, *' + STORE_NAME + '*! 👋\\n\\n';
      msg += '*Cliente:* ' + name + '\\n';

      if (MODE === 'cart') {
        const address = (document.getElementById('clientAddress')?.value || '').trim();
        const payment = (document.getElementById('clientPayment')?.value || 'PIX');
        msg += '\\n*ITENS DO PEDIDO:*\\n';
        cart.forEach(i => {
          msg += '• ' + i.qty + 'x ' + i.name + (i.price ? ' (' + i.price + ')' : '') + '\\n';
        });
        if (address) msg += '\\n*Entrega/Retirada:* ' + address;
        msg += '\\n*Pagamento:* ' + payment;
      } else {
        const schedule = (document.getElementById('clientSchedule')?.value || '').trim();
        if (selectedItem) msg += '*Interesse:* ' + selectedItem.name + (selectedItem.price ? ' (' + selectedItem.price + ')' : '') + '\\n';
        if (schedule) msg += '*Preferência de Horário:* ' + schedule + '\\n';
      }

      if (notes) msg += '\\n*Obs:* ' + notes;
      const waUrl = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
      const a = document.createElement('a');
      a.href = waUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      closeModal();
    }
  </script>
</body>
</html>`;
}

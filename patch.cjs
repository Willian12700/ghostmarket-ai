const fs = require('fs');
let c = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

const importRegex = /import \{ motion, AnimatePresence \} from 'framer-motion'/;
c = c.replace(importRegex, "import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'");

const componentString = `
const BlockItem = ({ block, onRemove }: { block: Block, onRemove: (id: string) => void }) => {
  const controls = useDragControls()
  return (
    <Reorder.Item
      value={block}
      dragListener={false}
      dragControls={controls}
      className="group relative border-2 border-transparent hover:border-primary/50 transition-colors bg-background"
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-2">
        <button 
          onPointerDown={(e) => controls.start(e)}
          className="p-2 rounded-md bg-panel border border-border text-textSecondary hover:text-white shadow-lg cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button onClick={() => onRemove(block.id)} className="p-2 rounded-md bg-panel border border-border text-error hover:bg-error/10 shadow-lg">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {block.type === 'hero' && (
        <div className="py-20 px-6 md:px-12 text-center bg-gradient-to-b from-primary/10 to-transparent relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
          <h1 
            className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 outline-none"
            contentEditable
            suppressContentEditableWarning
          >
            {block.content.title}
          </h1>
          <p 
            className="text-lg text-textSecondary max-w-2xl mx-auto mb-8 outline-none"
            contentEditable
            suppressContentEditableWarning
          >
            {block.content.subtitle}
          </p>
          <Button size="lg" className="shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            {block.content.button}
          </Button>
        </div>
      )}

      {block.type === 'features' && (
        <div className="py-20 px-6 md:px-12 bg-panel">
          <h2 
            className="text-3xl font-bold text-center text-white mb-12 outline-none"
            contentEditable
            suppressContentEditableWarning
          >
            {block.content.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[block.content.f1, block.content.f2, block.content.f3].map((f: string, i: number) => (
              <div key={i} className="p-6 rounded-xl border border-border bg-background text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 
                  className="text-lg font-bold text-white outline-none"
                  contentEditable
                  suppressContentEditableWarning
                >
                  {f}
                </h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {block.type === 'pricing' && (
        <div className="py-20 px-6 md:px-12 bg-background">
          <div className="max-w-sm mx-auto p-8 rounded-2xl border border-primary/50 bg-panel shadow-[0_0_30px_rgba(139,92,246,0.15)] text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-purple-400" />
            <h3 
              className="text-xl font-bold text-white mb-2 outline-none"
              contentEditable
              suppressContentEditableWarning
            >
              {block.content.title}
            </h3>
            <div 
              className="text-4xl font-extrabold text-primary mb-4 outline-none"
              contentEditable
              suppressContentEditableWarning
            >
              {block.content.price}
            </div>
            <p 
              className="text-textSecondary mb-8 outline-none"
              contentEditable
              suppressContentEditableWarning
            >
              {block.content.desc}
            </p>
            <Button className="w-full">Comprar Agora</Button>
          </div>
        </div>
      )}

      {block.type === 'cta' && (
        <div className="py-24 px-6 md:px-12 text-center bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          <h2 
            className="text-3xl md:text-5xl font-extrabold text-white mb-8 relative z-10 outline-none"
            contentEditable
            suppressContentEditableWarning
          >
            {block.content.title}
          </h2>
          <button className="bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl relative z-10">
            {block.content.button}
          </button>
        </div>
      )}
    </Reorder.Item>
  )
}
`;

c = c.replace('export const SiteBuilder = () => {', componentString + '\n\nexport const SiteBuilder = () => {');

const replaceRegex = /<AnimatePresence>[\s\S]*?<\/AnimatePresence>/;
const newRender = `
<Reorder.Group axis="y" values={blocks} onReorder={setBlocks} className="w-full h-full min-h-[500px]">
  {blocks.map((block) => (
    <BlockItem key={block.id} block={block} onRemove={handleRemoveBlock} />
  ))}
</Reorder.Group>
`;

c = c.replace(replaceRegex, newRender);

// One AnimatePresence is used for the modal. But wait, I replaced the FIRST ONE, but since I use regex non-greedy, it replaced the canvas one! 
// Let's check if there are multiple AnimatePresence. There are two. The second is for Modal.
// The regex /<AnimatePresence>[\s\S]*?<\/AnimatePresence>/ matches the first one. So it's safe.

fs.writeFileSync('src/pages/SiteBuilder.tsx', c, 'utf8');

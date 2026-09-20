const fs = require('fs');
let c = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

c = c.replace('const BlockItem = ({ block, onRemove }: { block: Block, onRemove: (id: string) => void }) => {', 'const BlockItem = ({ block, onRemove, onUpdate }: { block: Block, onRemove: (id: string) => void, onUpdate: (id: string, field: string, value: string) => void }) => {');

// hero title
c = c.replace(/className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 outline-none"\s+contentEditable\s+suppressContentEditableWarning/, 'className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, \'title\', e.currentTarget.textContent || \'\')}');
// hero subtitle
c = c.replace(/className="text-lg text-textSecondary max-w-2xl mx-auto mb-8 outline-none"\s+contentEditable\s+suppressContentEditableWarning/, 'className="text-lg text-textSecondary max-w-2xl mx-auto mb-8 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, \'subtitle\', e.currentTarget.textContent || \'\')}');

// features title
c = c.replace(/className="text-3xl font-bold text-center text-white mb-12 outline-none"\s+contentEditable\s+suppressContentEditableWarning/, 'className="text-3xl font-bold text-center text-white mb-12 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, \'title\', e.currentTarget.textContent || \'\')}');
// feature items
c = c.replace(/className="text-lg font-bold text-white outline-none"\s+contentEditable\s+suppressContentEditableWarning/, 'className="text-lg font-bold text-white outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, \'f\' + (i + 1), e.currentTarget.textContent || \'\')}');

// pricing title
c = c.replace(/className="text-xl font-bold text-white mb-2 outline-none"\s+contentEditable\s+suppressContentEditableWarning/, 'className="text-xl font-bold text-white mb-2 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, \'title\', e.currentTarget.textContent || \'\')}');
// pricing price
c = c.replace(/className="text-4xl font-extrabold text-primary mb-4 outline-none"\s+contentEditable\s+suppressContentEditableWarning/, 'className="text-4xl font-extrabold text-primary mb-4 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, \'price\', e.currentTarget.textContent || \'\')}');
// pricing desc
c = c.replace(/className="text-textSecondary mb-8 outline-none"\s+contentEditable\s+suppressContentEditableWarning/, 'className="text-textSecondary mb-8 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, \'desc\', e.currentTarget.textContent || \'\')}');

// cta title
c = c.replace(/className="text-3xl md:text-5xl font-extrabold text-white mb-8 relative z-10 outline-none"\s+contentEditable\s+suppressContentEditableWarning/, 'className="text-3xl md:text-5xl font-extrabold text-white mb-8 relative z-10 outline-none" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(block.id, \'title\', e.currentTarget.textContent || \'\')}');

// add handleUpdateBlock to SiteBuilder
const oldRenderBlock = '<BlockItem key={block.id} block={block} onRemove={handleRemoveBlock} />';
const newRenderBlock = '<BlockItem key={block.id} block={block} onRemove={handleRemoveBlock} onUpdate={handleUpdateBlock} />';
c = c.replace(oldRenderBlock, newRenderBlock);

const newHandleUpdate = `
  const handleUpdateBlock = (id: string, field: string, value: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, [field]: value } } : b))
  }
`;
c = c.replace('const handleRemoveBlock = (id: string) => {', newHandleUpdate + '\n  const handleRemoveBlock = (id: string) => {');

fs.writeFileSync('src/pages/SiteBuilder.tsx', c, 'utf8');

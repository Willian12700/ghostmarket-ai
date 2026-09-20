const fs = require('fs');

let content = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

const target = `            {step === 5 && (
              <Button onClick={() => setIsPublishModalOpen(true)} className="shadow-[0_0_15px_rgba(139,92,246,0.3)] bg-green-500 hover:bg-green-600 text-white">
                <Globe className="w-4 h-4 mr-2" /> Hospedar Site
              </Button>
            )}`;

const replacement = `            {step === 5 && (
              <Button 
                onClick={editId ? (e) => handlePublish(e as any) : () => setIsPublishModalOpen(true)} 
                disabled={isPublishing}
                className="shadow-[0_0_15px_rgba(139,92,246,0.3)] bg-green-500 hover:bg-green-600 text-white"
              >
                <Globe className="w-4 h-4 mr-2" /> 
                {isPublishing ? 'Salvando...' : (editId ? 'Atualizar Site' : 'Hospedar Site')}
              </Button>
            )}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/SiteBuilder.tsx', content);

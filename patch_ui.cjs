const fs = require('fs');
let content = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

const anchor = '            <Card>\n              <CardHeader className="pb-3 border-b border-border mb-4">\n                <CardTitle>Etapa 2';

const newUI = `            {/* SEÇÃO DE PRODUTOS E SERVIÇOS */}
            <Card>
              <CardHeader className="pb-3 border-b border-border mb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  Serviços e Preços (Opcional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-textSecondary mb-2">
                  Adicione os produtos ou serviços que você quer que a IA inclua na página com seus respectivos valores. Ex: "Corte de Cabelo" - "R$ 35".
                </p>
                {services.map((svc, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input 
                      placeholder="Nome do Produto/Serviço" 
                      value={svc.name} 
                      onChange={(e) => updateService(idx, 'name', e.target.value)} 
                      className="flex-1"
                    />
                    <Input 
                      placeholder="Preço (ex: R$ 35)" 
                      value={svc.price} 
                      onChange={(e) => updateService(idx, 'price', e.target.value)} 
                      className="w-32"
                    />
                    <Button 
                      variant="ghost" 
                      onClick={() => removeService(idx)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 px-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  onClick={addService} 
                  className="w-full border-dashed border-border hover:border-primary text-textSecondary hover:text-primary mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Produto / Serviço
                </Button>
              </CardContent>
            </Card>

`;

const idx = content.indexOf(anchor);
if (idx !== -1) {
  content = content.substring(0, idx) + newUI + content.substring(idx);
  fs.writeFileSync('src/pages/PromptBuilder.tsx', content);
  console.log("Patched UI!");
} else {
  // Try fallback logic
  const backupAnchor = '<CardTitle>Etapa 2';
  const backupIdx = content.indexOf(backupAnchor);
  if (backupIdx !== -1) {
     // go back to `<Card>`
     const finalIdx = content.lastIndexOf('<Card>', backupIdx);
     content = content.substring(0, finalIdx) + newUI + content.substring(finalIdx);
     fs.writeFileSync('src/pages/PromptBuilder.tsx', content);
     console.log("Patched UI via fallback!");
  } else {
     console.log("Failed entirely.");
  }
}

const fs = require('fs');

let content = fs.readFileSync('src/pages/PartnerPanel.tsx', 'utf8');

// Add the state for the last generated code
if (!content.includes('setLastGenerated')) {
    content = content.replace(
    "const [isGenerating, setIsGenerating] = useState(false);",
    "const [isGenerating, setIsGenerating] = useState(false);\n  const [lastGenerated, setLastGenerated] = useState<string | null>(null);"
    );
}

// Set the last generated code after successful generation
content = content.replace(
  /addToast\(`C\ufffddigo de \$\{duration\} minutos gerado!`, 'success'\);/,
  "setLastGenerated(code);\n      addToast(`Código gerado com sucesso!`, 'success');"
);
content = content.replace(
  /addToast\(`Cdigo de \$\{duration\} minutos gerado!`, 'success'\);/,
  "setLastGenerated(code);\n      addToast(`Código gerado com sucesso!`, 'success');"
);

const newHighlightHtml = `</Button>

            {lastGenerated && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="mt-6 p-6 rounded-2xl border border-primary/30 bg-primary/10 flex flex-col items-center gap-4 text-center"
              >
                <div>
                  <p className="text-primary font-medium text-sm mb-1">Código gerado com sucesso!</p>
                  <p className="text-4xl font-black text-white tracking-widest font-mono select-all">
                    {lastGenerated}
                  </p>
                </div>
                <Button 
                  onClick={() => copyToClipboard(lastGenerated)} 
                  variant="secondary" 
                  className="gap-2 bg-white text-black hover:bg-white/90"
                >
                  <Copy className="w-4 h-4" />
                  Copiar Código
                </Button>
              </motion.div>
            )}`;

content = content.replace("</Button>\n          </CardContent>", newHighlightHtml + "\n          </CardContent>");

content = content.replace(/S\ufffdcio/g, 'Sócio');
content = content.replace(/C\ufffddigo/g, 'Código');
content = content.replace(/c\ufffddigo/g, 'código');
content = content.replace(/Dura\ufffdo/g, 'Duração');
content = content.replace(/A\ufffdo/g, 'Ação');
content = content.replace(/Dispon\ufffdvel/g, 'Disponível');
content = content.replace(/Esta \ufffdrea \ufffd restrita aos s\ufffdcios/g, 'Esta área é restrita aos sócios');
content = content.replace(/Gerar Teste Gr\ufffdtis/g, 'Gerar Teste Grátis');
content = content.replace(/tempor\ufffdrios/g, 'temporários');
content = content.replace(/Gere c\ufffddigos/g, 'Gere códigos');

fs.writeFileSync('src/pages/PartnerPanel.tsx', content, 'utf8');


const fs = require('fs');

let content = fs.readFileSync('src/pages/PartnerPanel.tsx', 'utf8');

const replacement = `</Button>
            
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

content = content.replace("</Button>\n          </CardContent>", replacement + "\n          </CardContent>");
content = content.replace("</Button>\r\n          </CardContent>", replacement + "\r\n          </CardContent>");

// Let's replace the `setLastGenerated` inside `try` correctly
content = content.replace(/addToast\([\s\S]*?'success'\);/, "setLastGenerated(code);\n        addToast(`Código gerado com sucesso!`, 'success');");


fs.writeFileSync('src/pages/PartnerPanel.tsx', content, 'utf8');


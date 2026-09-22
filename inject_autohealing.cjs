const fs = require('fs');
let content = fs.readFileSync('src/pages/SiteViewer.tsx', 'utf8');

const oldLogic = `          if (data.rawHtml) {

            setHtml(data.rawHtml)
          } else {`;

const newLogic = `          if (data.rawHtml) {
            let finalHtml = data.rawHtml;
            
            // AUTO-HEALING SYSTEM
            if (data.autoHealed) {
              const autoHealingScript = \`
                <!-- GHOST AUTO-HEALING INJECTED -->
                <style>
                  /* Previne rolagem horizontal no mobile (Botões vazando) */
                  html, body {
                    max-width: 100vw;
                    overflow-x: hidden;
                    box-sizing: border-box;
                  }
                  * { box-sizing: inherit; }
                </style>
                <script>
                  document.addEventListener('DOMContentLoaded', function() {
                    // Substitui qualquer imagem quebrada por um placeholder mantendo o tamanho
                    document.querySelectorAll('img').forEach(img => {
                      img.addEventListener('error', function() {
                        this.src = 'https://placehold.co/600x400/1a1a1a/8b5cf6?text=Imagem+Recuperada';
                        this.style.border = '2px dashed #8b5cf6';
                        this.style.opacity = '0.8';
                        console.log('Ghost Auto-Healing: Imagem 404 reparada com sucesso.');
                      });
                      
                      // Trigger manual caso a imagem já tenha falhado antes do script carregar
                      if (img.complete && img.naturalHeight === 0) {
                        const event = new Event('error');
                        img.dispatchEvent(event);
                      }
                    });
                  });
                </script>
              \`;
              
              // Injeta antes de fechar a tag head, ou no topo do documento
              if (finalHtml.includes('</head>')) {
                finalHtml = finalHtml.replace('</head>', autoHealingScript + '</head>');
              } else {
                finalHtml = autoHealingScript + finalHtml;
              }
            }

            setHtml(finalHtml)
          } else {`;

content = content.replace(oldLogic, newLogic);

fs.writeFileSync('src/pages/SiteViewer.tsx', content, 'utf8');

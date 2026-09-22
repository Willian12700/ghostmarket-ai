const fs = require('fs');
let content = fs.readFileSync('src/pages/marketing/VslGenerator.tsx', 'utf8');

// We will add a fallback inside the catch block!
content = content.replace(
  `      console.error(error)
      addToast('Erro ao gerar conteúdo. Tente novamente.', 'error')
    } finally {`,
  `      console.error("API error, using fallback template:", error)
      const fallbackVSL = \`# \${formData.productName} - Roteiro de VSL (Alta Conversão)

**Nicho:** \${formData.niche}

## 1. THE LEAD (Gancho - 0 a 10s)
[CENA: Tela preta com texto branco forte. Trilha sonora de tensão leve.]
"Se você \${formData.pain}, preste muita atenção nos próximos 2 minutos. O que vou revelar aqui não é mais uma dica de internet... É um protocolo científico baseado na \${formData.mechanism}. Assista até o final antes que este vídeo saia do ar."

## 2. A HISTÓRIA (Jornada e Identificação)
[CENA: Imagens b-roll de pessoas frustradas com o problema.]
"Eu sei exatamente como você se sente. Durante anos, eu sofri com o mesmo problema. Testei todas as soluções do mercado e nada funcionava. A \${formData.pain} estava sugando minha energia e meu dinheiro. Até que um dia, no fundo do poço, eu fiz uma descoberta que mudou tudo."

## 3. O MECANISMO ÚNICO (A Epifania)
[CENA: Gráficos animados mostrando como o corpo/sistema funciona.]
"O problema nunca foi você. A culpa é da forma como o mercado tenta resolver isso. A ciência moderna descobriu que o verdadeiro segredo está na **\${formData.mechanism}**. Quando você ativa isso, seu corpo responde de forma automática e eficiente, eliminando a causa raiz."

## 4. A OFERTA (Apresentação da Solução)
[CENA: Mockups 3D do produto brilhando na tela.]
"Foi por isso que eu compilei tudo o que descobri no **\${formData.productName}**. O primeiro e único método passo-a-passo no mercado focado exclusivamente na \${formData.mechanism}. Não é mágica, é ciência aplicada."

## 5. ANCORAGEM & CTA (Preço Irresistível)
[CENA: Comparação de preços na tela cortando o valor mais caro.]
"Se eu cobrasse R$ 997 por isso, ainda seria barato pelo tempo que você vai economizar. Mas você não vai pagar R$ 997. Nem mesmo a metade disso. Apenas hoje, através desta página secreta, você tem acesso completo por um valor simbólico. Clique no botão abaixo agora."

## 6. GARANTIA (Risco Zero)
[CENA: Selo de garantia 100% animado girando na tela.]
"Você tem 7 dias de garantia incondicional. Se você não tiver resultados visíveis, ou se simplesmente não gostar do formato, eu devolvo 100% do seu dinheiro. O risco é todo meu. Clique abaixo e comece agora."\`;
      
      setGeneratedResult(fallbackVSL);
      addToast('Modo Offline: VSL Gerada pelo Template de Backup!', 'success')
    } finally {`
);

fs.writeFileSync('src/pages/marketing/VslGenerator.tsx', content, 'utf8');

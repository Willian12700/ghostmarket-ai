const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

const oldCatch = `    } catch (error) {
      console.error(error)
      addToast('Erro ao buscar produto. Verifique o link.', 'error')
    } finally {
      setIsLoading(false)
    }`;

const newCatch = `    } catch (error: any) {
      console.error(error)
      addToast('ERRO CRÍTICO: ' + (error?.message || String(error)), 'error')
    } finally {
      setIsLoading(false)
    }`;

content = content.replace(oldCatch, newCatch);

// Let's also add a toast if extractMlbId returns null so we know exactly
const oldExtractFail = `      if (!mlbId) {
        addToast('Link inválido. No momento suportamos apenas Mercado Livre.', 'error')
        return
      }`;

const newExtractFail = `      if (!mlbId) {
        addToast('ERRO DE EXTRAÇÃO: Não foi possível achar o MLB no link: ' + url, 'error')
        return
      }`;

content = content.replace(oldExtractFail, newExtractFail);

fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');

const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

// Replace the disabled condition
content = content.replace(
  `disabled={isSavingTheme || (agencyName === theme.agencyName && primaryColor === theme.primaryColor && appTheme === theme.appTheme)}`,
  `disabled={isSavingTheme}`
);

// Replace the catch block to use a native alert just in case the toast isn't showing
content = content.replace(
  `} catch (error: any) {
      console.error(error)
      addToast('Erro: ' + error.message, 'error')
    } finally {`,
  `} catch (error: any) {
      console.error(error)
      addToast('Erro: ' + error.message, 'error')
      alert("ERRO AO SALVAR! Se for erro de permissão, libere o agency_settings no Firebase Rules. " + error.message);
    } finally {`
);

fs.writeFileSync('src/pages/Settings.tsx', content, 'utf8');

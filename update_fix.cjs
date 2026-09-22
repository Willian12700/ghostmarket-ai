const fs = require('fs');
let content = fs.readFileSync('src/pages/HostedSites.tsx', 'utf8');

// Replace applyAutoFix function
const oldFunc = `  const applyAutoFix = () => {
    setScanStatus('fixing')
    setTimeout(() => {
      setScanStatus('fixed')
      addToast('Auto-Fix aplicado com sucesso!', 'success')
    }, 2000)
  }`;

const newFunc = `  const applyAutoFix = async () => {
    if (!scanningSite) return
    setScanStatus('fixing')
    try {
      const { updateDoc } = require('firebase/firestore'); // ensure it's imported or available
      // we already have updateDoc in imports! wait, let me check.
      const docRef = doc(db, 'sites', scanningSite.id)
      await updateDoc(docRef, { autoHealed: true })
      
      setTimeout(() => {
        setScanStatus('fixed')
        addToast('Auto-Fix injetado com sucesso no servidor!', 'success')
      }, 2000)
    } catch (e) {
      console.error(e)
      addToast('Erro ao aplicar Auto-Fix', 'error')
      setScanStatus('found')
    }
  }`;

content = content.replace(oldFunc, newFunc);

// Check if updateDoc is imported
if (!content.includes('updateDoc')) {
  content = content.replace(
    `import { collection, query, where, getDocs, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore'`,
    `import { collection, query, where, getDocs, deleteDoc, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'`
  );
}

fs.writeFileSync('src/pages/HostedSites.tsx', content, 'utf8');

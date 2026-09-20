const fs = require('fs');

let hs = fs.readFileSync('src/pages/HostedSites.tsx', 'utf8');

const oldHandleRedirect = `  const handleCreateRedirect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!redirectDest || !redirectSlug) return
    setIsCreatingRedirect(true)
    try {
      const siteId = redirectSlug.toLowerCase().replace(/[^a-z0-9-]/g, '')
      await setDoc(doc(db, 'sites', siteId), {`;

const newHandleRedirect = `  import { getDoc } from 'firebase/firestore'
  
  const handleCreateRedirect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!redirectDest || !redirectSlug) return
    setIsCreatingRedirect(true)
    try {
      const siteId = redirectSlug.toLowerCase().replace(/[^a-z0-9-]/g, '')
      
      const docRef = doc(db, 'sites', siteId)
      const snap = await getDoc(docRef)
      if (snap.exists()) {
        addToast('Este link já está em uso! Escolha outro nome.', 'error')
        setIsCreatingRedirect(false)
        return
      }

      await setDoc(docRef, {`;

// Fix the import at the top instead of inside the function!
hs = hs.replace(
  `import { collection, query, where, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore'`,
  `import { collection, query, where, getDocs, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore'`
);

hs = hs.replace(
  `  const handleCreateRedirect = async (e: React.FormEvent) => {\n    e.preventDefault()\n    if (!redirectDest || !redirectSlug) return\n    setIsCreatingRedirect(true)\n    try {\n      const siteId = redirectSlug.toLowerCase().replace(/[^a-z0-9-]/g, '')\n      await setDoc(doc(db, 'sites', siteId), {`,
  `  const handleCreateRedirect = async (e: React.FormEvent) => {\n    e.preventDefault()\n    if (!redirectDest || !redirectSlug) return\n    setIsCreatingRedirect(true)\n    try {\n      const siteId = redirectSlug.toLowerCase().replace(/[^a-z0-9-]/g, '')\n\n      const docRef = doc(db, 'sites', siteId)\n      const snap = await getDoc(docRef)\n      if (snap.exists()) {\n        addToast('Este link já está em uso! Escolha outro nome.', 'error')\n        setIsCreatingRedirect(false)\n        return\n      }\n\n      await setDoc(docRef, {`
);

fs.writeFileSync('src/pages/HostedSites.tsx', hs);

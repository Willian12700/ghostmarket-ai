const fs = require('fs');

let admin = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

const oldHandleGrant = `  const handleGrantFreeAccess = async () => {
    if (!freeAccessEmail.trim()) {
      addToast('Digite o email do usuário', 'error')
      return
    }

    setIsGrantingAccess(true)
    try {
      await setDoc(doc(db, 'allowed_users', freeAccessEmail.toLowerCase().trim()), {
        email: freeAccessEmail.toLowerCase().trim(),
        status: 'approved',
        plan: 'vitalicio',
        grantedByAdmin: true,
        grantedAt: new Date().toISOString()
      }, { merge: true })
      
      addToast(\`Acesso Vitalício liberado para \${freeAccessEmail}!\`, 'success')
      setFreeAccessEmail('')
    } catch (error) {
      console.error(error)
      addToast('Erro ao liberar acesso.', 'error')
    } finally {
      setIsGrantingAccess(false)
    }
  }`;

const newHandleGrant = `  const handleGrantFreeAccess = async () => {
    if (!freeAccessEmail.trim()) {
      addToast('Digite o email do usuário', 'error')
      return
    }

    setIsGrantingAccess(true)
    const emailToGrant = freeAccessEmail.toLowerCase().trim()
    try {
      await setDoc(doc(db, 'allowed_users', emailToGrant), {
        email: emailToGrant,
        status: 'approved',
        plan: 'vitalicio',
        grantedByAdmin: true,
        grantedAt: new Date().toISOString()
      }, { merge: true })
      
      // Update UI optimistically
      setUsers(prev => {
        const existing = prev.find(u => u.email === emailToGrant)
        if (existing) {
          return prev.map(u => u.email === emailToGrant ? { ...u, isAllowed: true, plan: 'vitalicio' } : u)
        } else {
          return [{ email: emailToGrant, name: 'Desconhecido', isAllowed: true, plan: 'vitalicio' }, ...prev]
        }
      })
      
      addToast(\`Acesso Vitalício liberado para \${freeAccessEmail}!\`, 'success')
      setFreeAccessEmail('')
    } catch (error) {
      console.error(error)
      addToast('Erro ao liberar acesso.', 'error')
    } finally {
      setIsGrantingAccess(false)
    }
  }`;

admin = admin.replace(oldHandleGrant, newHandleGrant);

// Also fix the loadUserDetails query array
const oldLoadUserDetails = `      const email = u.email
      const uid = u.uid || email 

      const sitesQuery = query(collection(db, 'sites'), where('userId', 'in', [email, uid]))`;

const newLoadUserDetails = `      const email = u.email
      const uid = u.uid
      const queryIds = uid && uid !== email ? [email, uid] : [email]

      const sitesQuery = query(collection(db, 'sites'), where('userId', 'in', queryIds))`;

admin = admin.replace(oldLoadUserDetails, newLoadUserDetails);

const oldTxsQuery = `const txsQuery = query(collection(db, 'transactions'), where('userId', 'in', [email, uid]))`;
const newTxsQuery = `const txsQuery = query(collection(db, 'transactions'), where('userId', 'in', queryIds))`;
admin = admin.replace(oldTxsQuery, newTxsQuery);

const oldCrmQuery = `const crmQuery = query(collection(db, 'crm_contracts'), where('userId', 'in', [email, uid]))`;
const newCrmQuery = `const crmQuery = query(collection(db, 'crm_contracts'), where('userId', 'in', queryIds))`;
admin = admin.replace(oldCrmQuery, newCrmQuery);

fs.writeFileSync('src/pages/AdminPanel.tsx', admin);

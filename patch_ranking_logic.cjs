const fs = require('fs');

let file = fs.readFileSync('src/pages/Ranking.tsx', 'utf8');

const regex = /\/\/ 1\. Fetch Users[\s\S]*?\/\/ 4\. Convert and Sort/;

const newLogic = `// 1. Fetch Users
        const usersSnap = await getDocs(collection(db, 'users'))
        const usersMap: Record<string, RankedUser> = {}
        
        usersSnap.forEach(doc => {
          const data = doc.data()
          const email = (data.email || '').toLowerCase()
          const uid = data.uid || ''
          const userObj = {
            id: doc.id,
            name: data.name || email.split('@')[0] || 'Usuário Anônimo',
            email: data.email || '',
            photoURL: data.photoURL || '',
            totalSales: 0
          }
          
          if (email) usersMap[email] = userObj
          if (uid) usersMap[uid] = userObj
          usersMap[doc.id] = userObj
        })

        // 2. Fetch SaaS Transactions
        const txsSnap = await getDocs(collection(db, 'transactions'))
        txsSnap.forEach(doc => {
          const t = doc.data()
          const status = (t.status || '').toLowerCase().trim()
          if (status === 'aprovado' || status === 'paid' || status === 'approved' || status === 'fechado') {
            
            let timestampMs = Date.now()
            if (t.timestamp && typeof t.timestamp.toMillis === 'function') {
              timestampMs = t.timestamp.toMillis()
            } else if (t.date_created) {
              timestampMs = new Date(t.date_created).getTime()
            } else if (t.date) {
              if (typeof t.date === 'string' && t.date.includes('/')) {
                const parts = t.date.split('/')
                if (parts.length === 3) {
                  timestampMs = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime()
                }
              } else if (typeof t.date === 'string' && t.date.includes('-')) {
                 const parts = t.date.split('-')
                 if (parts.length === 3) {
                   timestampMs = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime()
                 }
              } else {
                 timestampMs = new Date(t.date).getTime()
              }
            } else if (t.createdAt?.toMillis) {
              timestampMs = t.createdAt.toMillis()
            }

            if (timestampMs >= startOfMonthMs) {
              const uKey = (t.userId || '').toLowerCase()
              if (uKey && usersMap[uKey]) {
                usersMap[uKey].totalSales += Number(t.transaction_amount || t.amount || 0)
              }
            }
          }
        })

        // 3. Fetch CRM Contracts
        const crmSnap = await getDocs(collection(db, 'crm_contracts'))
        crmSnap.forEach(doc => {
          const c = doc.data()
          const status = (c.status || '').toLowerCase().trim()
          if (status === 'fechado' || status === 'aprovado') {
            
            let rawMs = Date.now()
            if (c.date) {
              if (c.date.includes('/')) {
                const parts = c.date.split('/')
                if (parts.length === 3) {
                  rawMs = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime()
                }
              } else if (c.date.includes('-')) {
                const parts = c.date.split('-')
                if (parts.length === 3) {
                  rawMs = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime()
                }
              } else {
                rawMs = new Date(c.date).getTime()
              }
            } else if (c.createdAt?.toMillis) {
              rawMs = c.createdAt.toMillis()
            }
            
            if (rawMs >= startOfMonthMs) {
              const uKey = (c.userId || '').toLowerCase()
              if (uKey && usersMap[uKey]) {
                usersMap[uKey].totalSales += Number(c.amount || 0)
              }
            }
          }
        })

        // Filter out duplicate user objects that were added by both email and uid keys.
        // We can just take the unique user objects from the map values.
        const uniqueUsers = Array.from(new Set(Object.values(usersMap)))
        
        // 4. Convert and Sort`;

file = file.replace(regex, newLogic);
fs.writeFileSync('src/pages/Ranking.tsx', file, 'utf8');
console.log('Fixed Ranking aggregation');

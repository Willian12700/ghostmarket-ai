import { doc, setDoc } from 'firebase/firestore'
import { db } from './config/firebase'

export const fixUser = async () => {
  try {
    await setDoc(doc(db, 'allowed_users', 'vitofrreira877@gmail.com'), {
      email: 'vitofrreira877@gmail.com',
      status: 'active',
      plan: 'mensal',
      createdAt: new Date().toISOString()
    })
    console.log('User vitofrreira877 fixed!')
  } catch(e) {
    console.error(e)
  }
}

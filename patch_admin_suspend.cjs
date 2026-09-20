const fs = require('fs');

let admin = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

// Replace updateDoc with setDoc with merge: true
admin = admin.replace(
  "await updateDoc(doc(db, 'users', selectedUser.id), { isSuspended: newStatus });",
  "await setDoc(doc(db, 'users', selectedUser.email), { isSuspended: newStatus }, { merge: true });"
);

// We need to make sure we also update selectedUser properly in the local state.
admin = admin.replace(
  "setUsers(users.map(u => u.id === selectedUser.id ? { ...u, isSuspended: newStatus } : u));",
  "setUsers(users.map(u => u.email === selectedUser.email ? { ...u, isSuspended: newStatus } : u));"
);

fs.writeFileSync('src/pages/AdminPanel.tsx', admin, 'utf8');
console.log('Fixed suspend toggle logic');

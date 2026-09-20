const fs = require('fs');

let authStore = fs.readFileSync('src/store/authStore.ts', 'utf8');

authStore = authStore.replace(
  `photoURL: photoURL !== undefined ? photoURL : state.user.photoURL\n        } : null\n      }))\n    }\n  },`,
  `photoURL: photoURL !== undefined ? photoURL : state.user.photoURL\n        } : null\n      }))\n      \n      syncUserToFirestore(currentUser)\n    }\n  },`
);

fs.writeFileSync('src/store/authStore.ts', authStore);

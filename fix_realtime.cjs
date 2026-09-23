const fs = require('fs');
let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

// Use regex to match the entire useEffect block for checkSubscription
const checkSubRegex = /useEffect\(\(\) => \{\s*const checkSubscription = async \(\) => \{[\s\S]*?if \(isAuthenticated\) \{\s*checkSubscription\(\)\s*\}\s*\}, \[user, isAuthenticated\]\)/;

const replacement = `useEffect(() => {
    let unsubscribe: () => void;

    const checkSubscription = () => {
      if (!user?.email) return;
      
      try {
        const docRef = doc(db, 'allowed_users', user.email);
        
        // Listen in real-time
        unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const status = docSnap.data().status;
            if (status === 'approved') {
              setHasSubscription(true);
              setIsSuspended(false);
              if (docSnap.data().used !== true) {
                setShowOnboarding(true);
              }
            } else if (status === 'suspended') {
              setHasSubscription(false);
              setIsSuspended(true);
            } else {
              setHasSubscription(false);
              setIsSuspended(false);
            }
          } else {
            setHasSubscription(false);
            setIsSuspended(false);
          }
        }, (error) => {
          console.error("Error listening to subscription:", error);
          setHasSubscription(false);
        });

      } catch (error) {
        console.error("Error setting up subscription listener:", error);
        setHasSubscription(false);
      }
    }

    if (isAuthenticated) {
      checkSubscription();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, isAuthenticated])`;

content = content.replace(checkSubRegex, replacement);

fs.writeFileSync('src/layouts/MainLayout.tsx', content, 'utf8');

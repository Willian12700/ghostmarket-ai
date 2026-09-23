const fs = require('fs');
let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

// 1. Update imports
if (!content.includes('onSnapshot')) {
    content = content.replace(
        "import { doc, getDoc } from 'firebase/firestore'",
        "import { doc, getDoc, onSnapshot } from 'firebase/firestore'"
    );
}

// 2. Update checkSubscription
const target = `  useEffect(() => {
    const checkSubscription = async () => {
      if (!user?.email) return
      
      try {
        const docRef = doc(db, 'allowed_users', user.email)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const status = docSnap.data().status;
          if (status === 'approved') {
            setHasSubscription(true)
            setIsSuspended(false)
            if (docSnap.data().used !== true) {
              setShowOnboarding(true)
            }
          } else if (status === 'suspended') {
            setHasSubscription(false)
            setIsSuspended(true)
          } else {
            setHasSubscription(false)
            setIsSuspended(false)
          }
        } else {
          setHasSubscription(false)
          setIsSuspended(false)
        }
      } catch (error) {
        console.error("Error checking subscription:", error)
        setHasSubscription(false)
      }
    }

    if (isAuthenticated) {
      checkSubscription()
    }
  }, [user, isAuthenticated])`;

const replacement = `  useEffect(() => {
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
  }, [user, isAuthenticated]);`;

if (content.includes('const docSnap = await getDoc(docRef)')) {
    content = content.replace(target, replacement);
}

fs.writeFileSync('src/layouts/MainLayout.tsx', content, 'utf8');

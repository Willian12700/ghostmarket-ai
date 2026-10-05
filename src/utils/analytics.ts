import { db } from "@/config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const trackCheckoutClick = async (planType: string) => {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const ref = searchParams.get('ref') || 'direct';
    
    await addDoc(collection(db, 'checkout_clicks'), {
      plan: planType,
      source: ref,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
    });
  } catch (error) {
    console.error("Error tracking click:", error);
  }
};

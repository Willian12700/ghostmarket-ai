const fs = require('fs');

const content = \import { db } from "@/config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const trackCheckoutClick = async (planType: string) => {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const ref = searchParams.get('ref') || 'direct';
    const utmSource = searchParams.get('utm_source') || localStorage.getItem('utm_source') || 'direct';
    const utmMedium = searchParams.get('utm_medium') || localStorage.getItem('utm_medium') || '';
    const utmCampaign = searchParams.get('utm_campaign') || localStorage.getItem('utm_campaign') || '';
    
    await addDoc(collection(db, 'checkout_clicks'), {
      plan: planType,
      source: ref,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
    });
  } catch (error) {
    console.error("Error tracking click:", error);
  }
};

export const handleCheckoutRedirect = (e: React.MouseEvent<HTMLAnchorElement>, plan: string, url: string) => {
  e.preventDefault();
  
  Promise.race([
    trackCheckoutClick(plan),
    new Promise(resolve => setTimeout(resolve, 500))
  ]).finally(() => {
    try {
      const checkoutUrl = new URL(url);
      const searchParams = new URLSearchParams(window.location.search);
      
      const utmSource = searchParams.get('utm_source') || localStorage.getItem('utm_source');
      const utmMedium = searchParams.get('utm_medium') || localStorage.getItem('utm_medium');
      const utmCampaign = searchParams.get('utm_campaign') || localStorage.getItem('utm_campaign');
      
      if (utmSource) checkoutUrl.searchParams.set('utm_source', utmSource);
      if (utmSource) checkoutUrl.searchParams.set('src', utmSource);
      if (utmMedium) checkoutUrl.searchParams.set('utm_medium', utmMedium);
      if (utmCampaign) checkoutUrl.searchParams.set('utm_campaign', utmCampaign);
      
      window.location.href = checkoutUrl.toString();
    } catch (err) {
      window.location.href = url;
    }
  });
};
\;

fs.writeFileSync('src/utils/analytics.ts', content, 'utf8');

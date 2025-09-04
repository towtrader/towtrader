import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export default function SEOHead({
  title = "TowTrader - New & Used Tow Truck Sales | Commercial Tow Truck Marketplace",
  description = "TowTrader is the leading marketplace for new and used tow truck sales. Browse thousands of commercial tow trucks and recovery vehicles, connect with dealers nationwide, and find the perfect new or used tow truck for your business.",
  keywords = "tow truck sales, new tow trucks, used tow trucks, commercial tow truck sales, tow truck marketplace, buy tow truck, sell tow truck, new commercial vehicles, used commercial vehicles, recovery vehicles, towing equipment",
  canonicalUrl = "https://tow-trader.com",
  ogTitle,
  ogDescription,
  ogImage
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Update Open Graph tags
    updateMetaTag('og:title', ogTitle || title, true);
    updateMetaTag('og:description', ogDescription || description, true);
    updateMetaTag('og:url', canonicalUrl, true);
    
    if (ogImage) {
      updateMetaTag('og:image', ogImage, true);
    }

    // Update Twitter tags
    updateMetaTag('twitter:title', ogTitle || title);
    updateMetaTag('twitter:description', ogDescription || description);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // Ensure favicon is set (fallback if not in HTML)
    const faviconUrl = '/attached_assets/FullLogo_NoBuffer_1752952018278.jpg';
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      favicon.setAttribute('type', 'image/png');
      document.head.appendChild(favicon);
    }
    favicon.setAttribute('href', faviconUrl);

  }, [title, description, keywords, canonicalUrl, ogTitle, ogDescription, ogImage]);

  return null;
}
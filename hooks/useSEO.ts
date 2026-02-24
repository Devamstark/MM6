/**
 * useSEO — sets document title and meta description dynamically per page.
 * Call this at the top of every page component.
 *
 * Usage:
 *   useSEO({
 *     title: "Men's Fashion | SmartShop",
 *     description: "Shop the latest men's clothing, shoes and accessories. Free shipping over $100.",
 *   });
 */

import { useEffect } from 'react';

interface SEOProps {
    title: string;
    description?: string;
    canonical?: string;
    ogImage?: string;
}

export function useSEO({ title, description, canonical, ogImage }: SEOProps) {
    useEffect(() => {
        // --- Title ---
        document.title = title;

        // --- Meta Description ---
        if (description) {
            let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = 'description';
                document.head.appendChild(metaDesc);
            }
            metaDesc.content = description;
        }

        // --- Open Graph (Facebook/WhatsApp/Twitter preview) ---
        setMeta('property', 'og:title', title);
        if (description) setMeta('property', 'og:description', description);
        if (ogImage) setMeta('property', 'og:image', ogImage);
        setMeta('property', 'og:type', 'website');
        setMeta('property', 'og:site_name', 'SmartShop');

        // --- Twitter Card ---
        setMeta('name', 'twitter:card', 'summary_large_image');
        setMeta('name', 'twitter:title', title);
        if (description) setMeta('name', 'twitter:description', description);
        if (ogImage) setMeta('name', 'twitter:image', ogImage);

        // --- Canonical URL ---
        if (canonical) {
            let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
            if (!link) {
                link = document.createElement('link');
                link.rel = 'canonical';
                document.head.appendChild(link);
            }
            link.href = canonical;
        }
    }, [title, description, canonical, ogImage]);
}

// Helper to upsert a <meta> tag
function setMeta(attrKey: string, attrValue: string, content: string) {
    let el = document.querySelector<HTMLMetaElement>(`meta[${attrKey}="${attrValue}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrKey, attrValue);
        document.head.appendChild(el);
    }
    el.content = content;
}

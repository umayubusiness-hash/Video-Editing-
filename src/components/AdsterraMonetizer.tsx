import React, { useEffect, useRef, useState } from 'react';
import { DollarSign } from 'lucide-react';

// ==========================================
// PASTE YOUR ADSTERRA CODES HERE (यहाँ अपने कोड पेस्ट करें)
// ==========================================
export interface AdsterraConfig {
  enabled: boolean;
  popunderScript: string;   // Paste Popunder Script Code or URL here
  socialBarScript: string;  // Paste Social Bar/In-Page Push Script here
  banner300x250Key: string; // Paste 300x250 Banner Key here (32 chars)
  banner468x60Key: string;  // Paste 468x60 Banner Key here (32 chars)
  banner320x50Key: string;  // Paste 320x50 Banner Key here (32 chars)
  directLinkUrl: string;    // Paste Direct Link URL here
}

export const HARDCODED_ADSTERRA_CONFIG: AdsterraConfig = {
  enabled: true, // Turn TRUE to activate ads everywhere
  
  // 1. Popunder (पॉपअंडर स्क्रिप्ट): Paste full script or URL
  popunderScript: ``, 
  
  // 2. Social Bar (सोशल बार स्क्रिप्ट): Paste full script or URL
  socialBarScript: ``, 
  
  // 3. Banner Keys (बैनर कीज़): 32 character key from your Adsterra dashboard
  banner300x250Key: ``, // e.g. "5d5a9d821379b398df3634045f2cf212"
  banner468x60Key: ``,  // e.g. "8fa160912f2c81893d594fbc266f81b1"
  banner320x50Key: ``,  // e.g. "05df0bc8e56b8cdab8012ba4d7e98188"
  
  // 4. Direct Link (डायरेक्ट लिंक): Open on bypass button click
  directLinkUrl: ``     // e.g. "https://www.highperformanceformat.com/xxxx/direct-link"
};

export function useAdsterra() {
  const [config] = useState<AdsterraConfig>(HARDCODED_ADSTERRA_CONFIG);

  // Dynamically inject popunder & social bar global scripts
  useEffect(() => {
    if (!config.enabled) return;

    const injectedElements: HTMLScriptElement[] = [];

    const injectScript = (scriptContent: string, id: string) => {
      if (!scriptContent) return;

      try {
        if (scriptContent.startsWith('http://') || scriptContent.startsWith('https://') || scriptContent.startsWith('//')) {
          const script = document.createElement('script');
          script.src = scriptContent;
          script.async = true;
          script.id = id;
          document.head.appendChild(script);
          injectedElements.push(script);
        } else {
          const srcMatch = scriptContent.match(/src=["']([^"']+)["']/);
          if (srcMatch && srcMatch[1]) {
            const script = document.createElement('script');
            script.src = srcMatch[1];
            script.async = true;
            script.id = id;
            document.head.appendChild(script);
            injectedElements.push(script);
          } else {
            const cleanJS = scriptContent.replace(/<\/?script[^>]*>/gi, '');
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.innerHTML = cleanJS;
            script.id = id;
            document.head.appendChild(script);
            injectedElements.push(script);
          }
        }
      } catch (e) {
        console.error("Adsterra Script injection error for: " + id, e);
      }
    };

    // Clean up old ones
    ['adsterra-popunder', 'adsterra-socialbar'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    injectScript(config.popunderScript, 'adsterra-popunder');
    injectScript(config.socialBarScript, 'adsterra-socialbar');

    return () => {
      injectedElements.forEach(el => el.remove());
    };
  }, [config.enabled, config.popunderScript, config.socialBarScript]);

  return { config };
}

interface AdsterraBannerProps {
  zoneKey: string;
  width: number;
  height: number;
}

export const AdsterraBanner: React.FC<AdsterraBannerProps> = ({ zoneKey, width, height }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!zoneKey || !containerRef.current) {
      return;
    }

    containerRef.current.innerHTML = '';

    const scriptConfig = document.createElement('script');
    scriptConfig.type = 'text/javascript';
    scriptConfig.innerHTML = `
      atOptions = {
        'key' : '${zoneKey.trim()}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    `;

    const scriptInvoke = document.createElement('script');
    scriptInvoke.type = 'text/javascript';
    scriptInvoke.src = `//www.highperformanceformat.com/${zoneKey.trim()}/invoke.js`;
    scriptInvoke.async = true;

    containerRef.current.appendChild(scriptConfig);
    containerRef.current.appendChild(scriptInvoke);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [zoneKey, width, height]);

  if (!zoneKey) {
    return null; // Don't show anything to standard users if no key is pasted
  }

  return (
    <div 
      className="mx-auto flex flex-col items-center justify-center overflow-hidden bg-black/40 border border-zinc-900 rounded-xl"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

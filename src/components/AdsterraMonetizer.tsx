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
  nativeBannerScript: string; // Native Banner Script URL
  nativeBannerContainerId: string; // Native Banner Container ID
}

export const HARDCODED_ADSTERRA_CONFIG: AdsterraConfig = {
  enabled: true, // Turn TRUE to activate ads everywhere
  
  // 1. Popunder (पॉपअंडर स्क्रिप्ट): Paste full script or URL
  popunderScript: `https://pl30104297.effectivecpmnetwork.com/d6/2a/d0/d62ad012f6587adcb705ab36a0b74d3c.js`, 
  
  // 2. Social Bar (सोशल बार स्क्रिप्ट): Paste full script or URL
  socialBarScript: `https://pl30104360.effectivecpmnetwork.com/dd/22/b3/dd22b318921f0a8a4d7cf73cf3c661e7.js`, 
  
  // 3. Banner Keys (बैनर कीज़): 32 character key from your Adsterra dashboard
  banner300x250Key: `4389be4bf775e84160a52342bdc7e847`, // Banner 300x250 Key
  banner468x60Key: `3495561ddc14e1f009cd5e0c801a34d2`,  // Banner 468x60 Key
  banner320x50Key: `6f083136706ab0055c231928dd7c7701`,  // Banner 320x50 Key
  
  // 4. Direct Link (डायरेक्ट लिंक): Open on bypass button click
  directLinkUrl: `https://www.effectivecpmnetwork.com/tq576e9rc?key=a20845a649805d02cb54b2827bdbc91b`,

  // 5. Native Banner
  nativeBannerScript: `https://pl30104359.effectivecpmnetwork.com/31c206580630f0a3aab2a9736f2a5281/invoke.js`,
  nativeBannerContainerId: `container-31c206580630f0a3aab2a9736f2a5281`
};

export function getActiveAdsterraConfig(): AdsterraConfig {
  try {
    const saved = localStorage.getItem('adsterra_monetization_config');
    if (saved) {
      return { ...HARDCODED_ADSTERRA_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {}
  return HARDCODED_ADSTERRA_CONFIG;
}

export function useAdsterra() {
  const [config, setConfig] = useState<AdsterraConfig>(getActiveAdsterraConfig);

  useEffect(() => {
    const handleStorage = () => {
      setConfig(getActiveAdsterraConfig());
    };
    window.addEventListener('storage', handleStorage);
    // Periodically sync if needed
    const interval = setInterval(handleStorage, 2000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

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
          script.onerror = (e) => {
            try {
              e.preventDefault();
              e.stopPropagation();
            } catch (err) {}
          };
          document.head.appendChild(script);
          injectedElements.push(script);
        } else {
          const srcMatch = scriptContent.match(/src=["']([^"']+)["']/);
          if (srcMatch && srcMatch[1]) {
            const script = document.createElement('script');
            script.src = srcMatch[1];
            script.async = true;
            script.id = id;
            script.onerror = (e) => {
              try {
                e.preventDefault();
                e.stopPropagation();
              } catch (err) {}
            };
            document.head.appendChild(script);
            injectedElements.push(script);
          } else {
            const cleanJS = scriptContent.replace(/<\/?script[^>]*>/gi, '');
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.innerHTML = cleanJS;
            script.id = id;
            script.onerror = (e) => {
              try {
                e.preventDefault();
                e.stopPropagation();
              } catch (err) {}
            };
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
    scriptInvoke.onerror = (e) => {
      try {
        e.preventDefault();
        e.stopPropagation();
      } catch (err) {}
    };

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

interface AdsterraNativeBannerProps {
  scriptUrl: string;
  containerId: string;
}

export const AdsterraNativeBanner: React.FC<AdsterraNativeBannerProps> = ({ scriptUrl, containerId }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scriptUrl || !containerId || !containerRef.current) {
      return;
    }

    containerRef.current.innerHTML = '';

    const targetDiv = document.createElement('div');
    targetDiv.id = containerId;
    containerRef.current.appendChild(targetDiv);

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.onerror = (e) => {
      try {
        e.preventDefault();
        e.stopPropagation();
      } catch (err) {}
    };

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [scriptUrl, containerId]);

  if (!scriptUrl || !containerId) {
    return null;
  }

  return (
    <div 
      className="mx-auto flex flex-col items-center justify-center overflow-hidden bg-black/40 border border-zinc-900 rounded-xl p-2 w-full max-w-[320px] min-h-[100px]"
    >
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

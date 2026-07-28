import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

const seoData: Record<string, { title: string; description?: string; noindex: boolean }> = {
  '/': {
    title: 'linQ — Share the way',
    description: 'linQ connects you with verified riders going your way. Carpool, bikepool, or share a cab easily.',
    noindex: false
  },
  '/pricing': {
    title: 'Pricing Plans | linQ',
    description: 'Affordable and transparent pricing for daily commuters. Choose a plan that fits your carpooling needs.',
    noindex: false
  },
  '/safety': {
    title: 'Safety Guidelines | linQ',
    description: 'Learn about the safety measures and guidelines on linQ. We prioritize secure, verified, and transparent carpooling experiences.',
    noindex: false
  },
  '/search': {
    title: 'Find Hotspots | linQ',
    description: 'Search for popular colleges and office destinations on linQ to find your perfect carpool match.',
    noindex: false
  },
  '/trips': { title: 'Your Trips | linQ', noindex: true },
  '/profile': { title: 'Your Profile | linQ', noindex: true },
  '/payments': { title: 'Payment History | linQ', noindex: true },
  '/matches': { title: 'Find Matches | linQ', noindex: true },
};

export function seoPrerenderPlugin(): Plugin {
  return {
    name: 'vite-plugin-seo-prerender',
    enforce: 'post',
    apply: 'build',
    closeBundle() {
      const distPath = path.resolve(process.cwd(), 'dist');
      const baseHtmlPath = path.join(distPath, 'index.html');
      
      if (!fs.existsSync(baseHtmlPath)) {
        console.warn('index.html not found in dist. Skipping SEO prerendering.');
        return;
      }
      
      let baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8');
      
      for (const [route, data] of Object.entries(seoData)) {
        let routeHtml = baseHtml;
        
        // Inject Title
        routeHtml = routeHtml.replace(/<title>.*?<\/title>/, `<title>${data.title}</title>`);
        
        // Prepare meta tags
        let metaTags = '';
        
        if (data.description) {
          metaTags += `\n    <meta name="description" content="${data.description}" />`;
          metaTags += `\n    <meta property="og:description" content="${data.description}" />`;
          metaTags += `\n    <meta name="twitter:description" content="${data.description}" />`;
        }
        
        metaTags += `\n    <meta property="og:title" content="${data.title}" />`;
        metaTags += `\n    <meta name="twitter:title" content="${data.title}" />`;
        metaTags += `\n    <link rel="canonical" href="https://linqrides.in${route === '/' ? '' : route}" />`;
        metaTags += `\n    <meta property="og:url" content="https://linqrides.in${route === '/' ? '' : route}" />`;
        metaTags += `\n    <meta property="og:type" content="website" />`;
        
        if (data.noindex) {
          metaTags += `\n    <meta name="robots" content="noindex, nofollow" />`;
        } else {
           metaTags += `\n    <meta name="robots" content="index, follow" />`;
        }

        // Insert just before </head>
        routeHtml = routeHtml.replace('</head>', `${metaTags}\n  </head>`);
        
        if (route === '/') {
          fs.writeFileSync(baseHtmlPath, routeHtml);
        } else {
          // Remove leading slash for folder creation inside dist
          const folderName = route.substring(1);
          const routeDir = path.join(distPath, folderName);
          if (!fs.existsSync(routeDir)) {
            fs.mkdirSync(routeDir, { recursive: true });
          }
          fs.writeFileSync(path.join(routeDir, 'index.html'), routeHtml);
        }
      }
      console.log('✅ Generated static HTML files with SEO metadata for pure SPA!');
    }
  }
}

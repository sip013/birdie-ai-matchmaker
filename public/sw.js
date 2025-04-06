const CACHE_NAME = 'birdie-match-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/pages/match-logger/MatchLoggerPage.tsx',
  '/src/pages/match-logger/MatchForm.tsx',
  '/src/pages/match-logger/components/TeamSection.tsx',
  '/src/components/ui/button.tsx',
  '/src/components/ui/form.tsx',
  '/src/components/ui/input.tsx',
  '/src/components/ui/select.tsx',
  '/src/components/ui/calendar.tsx',
  '/src/components/ui/popover.tsx',
  '/src/components/ui/badge.tsx',
  '/src/components/ui/scroll-area.tsx',
  '/src/components/ui/card.tsx',
  '/src/components/ui/tabs.tsx',
  '/src/hooks/use-mobile.tsx',
  '/src/integrations/supabase/client.ts',
  '/src/context/AuthContext.tsx',
  '/src/lib/utils.ts',
  '/src/styles/globals.css'
];

// Helper function to check if a URL is cacheable
function isCacheable(url) {
  try {
    const parsedUrl = new URL(url);
    // Only cache http and https URLs
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Filter out any invalid URLs before caching
        const validUrls = urlsToCache.filter(url => isCacheable(url));
        return cache.addAll(validUrls);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and non-cacheable URLs
  if (event.request.method !== 'GET' || !isCacheable(event.request.url)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response before caching
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Only cache if URL is cacheable
                if (isCacheable(event.request.url)) {
                  cache.put(event.request, responseToCache);
                }
              });
            return response;
          });
      })
  );
}); 
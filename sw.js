const CACHE_NAME = 'productivity-suite-v1.1.0';
const RUNTIME_CACHE = 'productivity-runtime-v1.1.0';

// Files to cache for offline use
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Routes that should always try network first
const NETWORK_FIRST_ROUTES = [
  '/countdown',
  '/todo', 
  '/pomodoro',
  '/chat'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static assets');
        // Cache the essential files, ignore errors for missing files
        return Promise.allSettled(
          STATIC_CACHE_URLS.map(url => 
            cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err);
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log('✅ Static assets cached');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old cache versions
              return cacheName.startsWith('productivity-') && 
                     cacheName !== CACHE_NAME && 
                     cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip non-same-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Strategy 1: Cache First for static assets (JS, CSS, images)
    if (isStaticAsset(pathname)) {
      return await cacheFirst(request);
    }
    
    // Strategy 2: Network First for HTML and API routes
    if (isHtmlRequest(request) || isApiRoute(pathname)) {
      return await networkFirst(request);
    }
    
    // Strategy 3: Stale While Revalidate for everything else
    return await staleWhileRevalidate(request);
    
  } catch (error) {
    console.error('❌ Fetch failed:', error);
    
    // Fallback to offline page for navigation requests
    if (isNavigationRequest(request)) {
      return await getOfflineFallback();
    }
    
    // Return cached version if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Last resort - return error response
    return new Response('Offline and no cache available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Cache First Strategy - for static assets
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Network First Strategy - for HTML and API
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Fetch in background to update cache
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null); // Ignore network errors
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If no cache, wait for network
  return await fetchPromise;
}

// Helper functions
function isStaticAsset(pathname) {
  return pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

function isHtmlRequest(request) {
  return request.headers.get('accept')?.includes('text/html');
}

function isApiRoute(pathname) {
  return pathname.startsWith('/api/');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

async function getOfflineFallback() {
  try {
    // Try to get the cached main page
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match('/');
    if (cached) {
      return cached;
    }
  } catch (error) {
    console.warn('Could not serve offline fallback:', error);
  }
  
  // Create a basic offline page
  return new Response(
    `<!DOCTYPE html>
    <html>
    <head>
      <title>Offline - Productivity Suite</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          text-align: center; 
          padding: 50px 20px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          min-height: 100vh;
          margin: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        h1 { margin-bottom: 20px; }
        .icon { font-size: 4rem; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="icon">📱</div>
      <h1>You're Offline</h1>
      <p>The Productivity Suite is available offline, but this page needs an internet connection.</p>
      <p>Please check your connection and try again.</p>
      <button onclick="window.location.reload()" style="
        background: rgba(255,255,255,0.2); 
        border: 2px solid white; 
        color: white; 
        padding: 12px 24px; 
        border-radius: 8px; 
        cursor: pointer;
        font-size: 16px;
        margin-top: 20px;
      ">Try Again</button>
    </body>
    </html>`,
    {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      }
    }
  );
}

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notify clients about updates
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'SW_UPDATED',
          message: 'Service Worker updated successfully!'
        });
      });
    })
  );
});

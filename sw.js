const CORE_CACHE = 'tmp-core-v33';
const ARTICLE_CACHE = 'tmp-articles-v33';
const ASSET_CACHE = 'tmp-assets-v33';
const CORE_ASSETS = [
    '/',                      
    '/index.html',            
    '/offline.html',  
    'https://author.tmpnews.com/profile/tmpnews.webp',     
    '/assets/style/style.css',
    '/assets/style/index-menu.css',
    '/assets/style/home.css',
    '/assets/style/dark-mode.css',
    '/assets/style/post.css',
    '/assets/style/menu.css',
    '/assets/style/profile.css',
    '/assets/style/login.css',
    '/assets/style/live.css',    
    '/assets/header-injector.js',
    '/assets/bottom-nav.js',
    '/assets/js/live.js',   
    '/post.js',
    '/home.js',
    '/cache-manager.js',
    '/favicon-32x32.png',
    '/favicon.svg'
];
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > size) {
                cache.delete(keys[0]).then(() => limitCacheSize(name, size));
            }
        });
    });
};
self.addEventListener('install', (event) => {
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(CORE_CACHE).then(async (cache) => {
            console.log('SW: Caching Core App Shell v33');
            for (let asset of CORE_ASSETS) {
                try {
                    const response = await fetch(asset);
                    if (response.ok) {
                        await cache.put(asset, response);
                    }
                } catch (err) {
                    console.error(`SW Install: Network error on ${asset}`);
                }
            }
        })
    );
});
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CORE_CACHE && cacheName !== ARTICLE_CACHE && cacheName !== ASSET_CACHE) {
                        console.log('SW: Wiping old cache memory ->', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim(); 
});
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Hard refresh or forced refresh detection: let browser bypass SW completely
    const hasForcedBypass = request.cache === 'reload' ||
                           request.headers.get('Cache-Control')?.includes('no-cache') ||
                           request.headers.get('Pragma')?.includes('no-cache') ||
                           url.searchParams.has('refresh') ||
                           url.searchParams.has('nocache');

    if (
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        url.pathname.includes('ORGcms.html') ||
        url.pathname.includes('liveCMS.html') ||
        url.origin.includes('supabase.co') || 
        url.origin.includes('accounts.google.com') ||
        url.origin.includes('data.tmpnews.com') ||
        url.pathname.startsWith('/api/') ||           
        url.pathname.startsWith('/functions/') ||     
        url.pathname.endsWith('.json') ||             
        request.method !== 'GET' ||                   
        request.headers.get('accept')?.includes('application/json') ||
        hasForcedBypass
    ) {
        return; 
    }

    // Live script Network-First strategy
    if (url.pathname.includes('/assets/js/live.js')) {
        event.respondWith(
            fetch(request).then((networkResponse) => {
                if (networkResponse && networkResponse.ok) {
                    const responseClone = networkResponse.clone();
                    caches.open(CORE_CACHE).then((cache) => cache.put(request, responseClone));
                }
                return networkResponse;
            }).catch(() => caches.match(request))
        );
        return;
    }

    if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
        
        const isHomePage = (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '');
        const isLivePage = (url.pathname === '/live' || url.pathname === '/live/' || url.pathname === '/live.html' || url.pathname.startsWith('/live/'));

        // Both Homepage and Live page use Network-First to guarantee real-time updates
        if (isHomePage || isLivePage) {
            event.respondWith(
                fetch(request).then((networkResponse) => {
                    if (networkResponse && networkResponse.ok) {
                        const responseClone = networkResponse.clone();
                        caches.open(CORE_CACHE).then((cache) => cache.put(request, responseClone));
                    }
                    return networkResponse;
                }).catch(() => {
                    return caches.match(request).then(cached => cached || caches.match('/offline.html'));
                })
            );
            return; 
        }
        event.respondWith(
            caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
                
                const fetchPromise = fetch(request).then((networkResponse) => {
                    if (networkResponse && networkResponse.ok) {
                        const responseClone = networkResponse.clone();
                        caches.open(ARTICLE_CACHE).then((cache) => {
                            cache.put(request, responseClone).then(() => {
                                limitCacheSize(ARTICLE_CACHE, 150);
                            });
                        });
                    }
                    return networkResponse;
                }).catch(() => { return null; }); 

                if (cachedResponse) {
                    event.waitUntil(fetchPromise); 
                    return cachedResponse;
                }
                return fetchPromise.then((networkResponse) => {
                    return networkResponse || caches.match('/offline.html');
                });
            })
        );
        return;
    }
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
                    const responseClone = networkResponse.clone();
                    caches.open(ASSET_CACHE).then((cache) => {
                        cache.put(request, responseClone).then(() => {
                            limitCacheSize(ASSET_CACHE, 100); 
                        });
                    });
                }
                return networkResponse;
            }).catch(() => { /* Silent network fail */ });
            if (cachedResponse) {
                event.waitUntil(fetchPromise); 
                return cachedResponse;
            }
            return fetchPromise;
        })
    );
});
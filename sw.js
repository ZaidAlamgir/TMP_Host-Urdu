const CORE_CACHE = 'tmp-core-v41';
const ARTICLE_CACHE = 'tmp-articles-v41';
const ASSET_CACHE = 'tmp-assets-v41';
const CORE_ASSETS = [
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
    '/assets/style/infolens.css',
    '/assets/header-injector.js',
    '/assets/bottom-nav.js',
    '/assets/js/live.js',   
    '/assets/js/infolens.js',
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
// Listen for messages from clients to skip waiting or clear caches immediately
self.addEventListener('message', (event) => {
    if (event.data && (event.data.type === 'SKIP_WAITING' || event.data.action === 'skipWaiting' || event.data === 'skipWaiting')) {
        self.skipWaiting();
    }
    if (event.data && (event.data.type === 'CLEAR_OLD_CACHES' || event.data.action === 'clearCache')) {
        event.waitUntil(
            caches.keys().then((keys) => {
                return Promise.all(
                    keys.map((k) => {
                        if (k !== CORE_CACHE && k !== ARTICLE_CACHE && k !== ASSET_CACHE) {
                            console.log('SW: Explicitly deleting cache ->', k);
                            return caches.delete(k);
                        }
                    })
                );
            })
        );
    }
});

self.addEventListener('install', (event) => {
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(CORE_CACHE).then(async (cache) => {
            console.log('SW: Caching Core App Shell v41');
            for (let asset of CORE_ASSETS) {
                try {
                    const response = await fetch(asset, { cache: 'reload' });
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
        }).then(() => {
            return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({ type: 'SW_ACTIVATED', version: CORE_CACHE });
                });
            });
        })
    );
    return self.clients.claim(); 
});
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Hard refresh or forced refresh detection: force fresh network fetch and update cache
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
        request.headers.get('accept')?.includes('application/json')
    ) {
        return; 
    }

    // Live scripts, live styles & InfoLens assets: Network-First strategy
    if (
        url.pathname.includes('/assets/js/live.js') ||
        url.pathname.includes('/assets/bottom-nav.js') ||
        url.pathname.includes('/assets/style/live.css') ||
        url.pathname.includes('/assets/style/infolens.css') ||
        url.pathname.includes('/assets/js/infolens.js')
    ) {
        const fetchOpts = hasForcedBypass ? { cache: 'reload' } : { cache: 'no-cache' };
        event.respondWith(
            fetch(request, fetchOpts).then((networkResponse) => {
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
        const isInfolensPage = (url.pathname === '/infolens' || url.pathname === '/infolens/' || url.pathname === '/infolens.html' || url.pathname.startsWith('/infolens/'));

        // Homepage, Live, and InfoLens use Network-First to guarantee real-time updates and respect force refresh
        if (isHomePage || isLivePage || isInfolensPage) {
            const fetchOpts = hasForcedBypass ? { cache: 'reload' } : { cache: 'no-cache' };
            event.respondWith(
                fetch(request, fetchOpts).then((networkResponse) => {
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

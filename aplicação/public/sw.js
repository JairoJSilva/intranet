/**
 * Omniflowti — Service Worker (PWA)
 * Cache de recursos estáticos e suporte à instalação offline do portal.
 */

const CACHE_NAME = 'omniflowti-v1.4.1';
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/assets/css/app.css',
    '/assets/img/pwa-icon.svg',
    '/assets/img/flowti-label.svg',
    '/assets/js/state.js',
    '/assets/js/api.js',
    '/assets/js/router.js',
    '/assets/js/components/Toast.js',
    '/assets/js/components/Modal.js',
    '/assets/js/components/ThemeManager.js',
    '/assets/js/components/NotificationManager.js',
    '/assets/js/components/BroadcastBanner.js',
    '/assets/js/components/CommandPalette.js',
    '/assets/js/components/Sidebar.js',
    '/assets/js/components/Topbar.js',
    '/assets/js/components/LoginForm.js',
    '/assets/js/components/Dashboard.js',
    '/assets/js/components/PanelManager.js',
    '/assets/js/components/UserManager.js',
    '/assets/js/components/GroupManager.js',
    '/assets/js/app.js'
];

// Instalação do Service Worker e pré-cache de assets essenciais
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Ativação e limpeza de versões legadas de cache
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Interceptação de requisições de rede
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Requisições à API REST nunca são cacheadas pelo Service Worker para manter dados em tempo real
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    // Para assets estáticos: Network-First com Fallback para Cache
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    if (event.request.mode === 'navigate') {
                        return caches.match('/');
                    }
                });
            })
    );
});

// ═══════════════════════════════════════════════════════════════
//  KAMER360 — Service Worker v2.0
//  Mode hors-ligne complet + Cache stratégique
// ═══════════════════════════════════════════════════════════════

var CACHE_NAME = 'kamer360-v3-2026';
var CACHE_STATIC  = 'kamer360-static-v3';
var CACHE_DYNAMIC = 'kamer360-dynamic-v3';

// Ressources à mettre en cache immédiatement (App Shell)
var STATIC_ASSETS = [
  '/',
  '/index.html',
  '/boutique.html',
  '/style.css',
  '/boutique.css',
  '/design-upgrade.css',
  '/manifest.json',
  '/script.js',
  '/boutique.js',
  '/marketplace.js',
  '/marketplace-data.js',
  '/kamer-impact.js',
  '/config.js',
  '/villes.js',
  '/db.js',
  '/paiement.js',
  '/fidelite.js',
  '/promotions.js',
  '/retours.js',
  '/multi-users.js',
  '/abonnements.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
];

// ── Install — mettre en cache l'app shell ─────────────────────────
self.addEventListener('install', function(evt) {
  self.skipWaiting();
  evt.waitUntil(
    caches.open(CACHE_STATIC).then(function(cache) {
      // Charger chaque ressource individuellement (ignorer les erreurs réseau)
      return Promise.allSettled(
        STATIC_ASSETS.map(function(url) {
          return cache.add(url).catch(function(e) {
            console.warn('[SW] Cache miss:', url, e.message);
          });
        })
      );
    })
  );
});

// ── Activate — nettoyer anciens caches ────────────────────────────
self.addEventListener('activate', function(evt) {
  evt.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) {
          return k !== CACHE_STATIC && k !== CACHE_DYNAMIC;
        }).map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

// ── Fetch — stratégie Cache First pour assets, Network First pour API ──
self.addEventListener('fetch', function(evt) {
  var req = evt.request;
  var url = new URL(req.url);

  // Ignorer les requêtes non-GET
  if (req.method !== 'GET') return;
  // Ignorer les extensions Chrome
  if (url.protocol === 'chrome-extension:') return;
  // Ignorer les requêtes Supabase (données temps réel)
  if (url.hostname.includes('supabase.co')) return;
  // Ignorer Railway (API)
  if (url.hostname.includes('railway.app')) return;

  // Stratégie: Cache First pour les assets statiques
  if (url.pathname.match(/\.(js|css|html|png|jpg|svg|ico|woff2?)$/) ||
      url.hostname === 'fonts.googleapis.com' ||
      url.hostname === 'fonts.gstatic.com' ||
      url.hostname === 'cdnjs.cloudflare.com' ||
      url.hostname === 'unpkg.com') {
    evt.respondWith(
      caches.match(req).then(function(cached) {
        if (cached) return cached;
        return fetch(req).then(function(resp) {
          if (resp && resp.status === 200) {
            var clone = resp.clone();
            caches.open(CACHE_DYNAMIC).then(function(c) { c.put(req, clone); });
          }
          return resp;
        }).catch(function() {
          // Offline fallback pour les pages HTML
          if (req.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
    );
    return;
  }

  // Stratégie: Network First pour les pages dynamiques
  evt.respondWith(
    fetch(req).then(function(resp) {
      if (resp && resp.status === 200) {
        var clone = resp.clone();
        caches.open(CACHE_DYNAMIC).then(function(c) { c.put(req, clone); });
      }
      return resp;
    }).catch(function() {
      return caches.match(req).then(function(cached) {
        return cached || caches.match('/index.html');
      });
    })
  );
});

// ── Background Sync — synchroniser les actions hors-ligne ─────────
self.addEventListener('sync', function(evt) {
  if (evt.tag === 'sync-offline-queue') {
    evt.waitUntil(
      self.clients.matchAll().then(function(clients) {
        clients.forEach(function(client) {
          client.postMessage({ type: 'SYNC_OFFLINE' });
        });
      })
    );
  }
});

// ── Push Notifications ────────────────────────────────────────────
self.addEventListener('push', function(evt) {
  var data = evt.data ? evt.data.json() : {};
  var title  = data.title  || 'KAMER360';
  var options = {
    body:    data.body  || 'Vous avez une nouvelle notification',
    icon:    data.icon  || '/icons/icon-192.png',
    badge:   '/icons/badge-72.png',
    tag:     data.tag   || 'kamer360-notif',
    vibrate: [200, 100, 200],
    data:    { url: data.url || '/' },
    actions: data.actions || [
      { action: 'open',    title: 'Ouvrir' },
      { action: 'dismiss', title: 'Ignorer' },
    ]
  };
  evt.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(evt) {
  evt.notification.close();
  if (evt.action === 'dismiss') return;
  var url = evt.notification.data.url || '/';
  evt.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(wcs) {
      for (var i = 0; i < wcs.length; i++) {
        if ('focus' in wcs[i]) return wcs[i].focus();
      }
      return clients.openWindow(url);
    })
  );
});

// ── Message depuis l'app ──────────────────────────────────────────
self.addEventListener('message', function(evt) {
  if (evt.data && evt.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (evt.data && evt.data.type === 'CACHE_URLS') {
    caches.open(CACHE_DYNAMIC).then(function(cache) {
      cache.addAll(evt.data.urls || []);
    });
  }
});

// ══════════════════════════════════════════════════════════════
//  NOTIFICATIONS PUSH — réception et affichage
// ══════════════════════════════════════════════════════════════
self.addEventListener('push', function(event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e) {}

  var title = data.title || 'KAMER360';
  var options = {
    body: data.body || 'Vous avez une nouvelle notification',
    icon: data.icon || '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Clic sur la notification → ouvrir l'app à la bonne page
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      for (var client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

const CACHE_NAME = 'servis-panel-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
];

// Kurulum — kaynakları önbelleğe al
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Kaynaklar önbelleğe alınıyor...');
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Bazı dosyalar bulunamazsa sessizce geç
        console.log('[SW] Bazı dosyalar önbelleğe alınamadı, devam ediliyor.');
      });
    })
  );
  self.skipWaiting();
});

// Aktivasyon — eski önbellekleri temizle
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — önce önbellekten, sonra ağdan
self.addEventListener('fetch', event => {
  // Sadece GET isteklerini yakala
  if (event.request.method !== 'GET') return;

  // chrome-extension ve diğer şemaları atla
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          // Geçerli yanıtları önbelleğe al
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline — HTML istekleri için index.html döndür
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html');
          }
        });
    })
  );
});

// ── PUSH BİLDİRİMLERİ ────────────────────────────────────────────
self.addEventListener('push', event => {
  let data = { title: 'Scor-Pi', body: 'Yeni bildirim', icon: '/logo192.png', badge: '/logo192.png', tag: 'default' };

  if (event.data) {
    try { Object.assign(data, event.data.json()); }
    catch { data.body = event.data.text(); }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    data.icon || '/logo192.png',
      badge:   data.badge || '/logo192.png',
      tag:     data.tag,
      data:    data,
      requireInteraction: data.requireInteraction || false,
      vibrate: [200, 100, 200],
      actions: data.actions || [],
    })
  );
});

// ── BİLDİRİM TIKLANMASI ───────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Zaten açık pencere varsa odaklan
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICK', data: event.notification.data });
          return client.focus();
        }
      }
      // Yoksa yeni sekme aç
      return clients.openWindow(url);
    })
  );
});

// ── BİLDİRİM KAPATMA ─────────────────────────────────────────────
self.addEventListener('notificationclose', event => {
  console.log('[SW] Bildirim kapatıldı:', event.notification.tag);
});

// ── PUSH ABONE DEĞIŞIMI ───────────────────────────────────────────
self.addEventListener('pushsubscriptionchange', event => {
  console.log('[SW] Push aboneliği değişti, yenileniyor...');
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
  );
});

// ── SYNC (arka plan senkronizasyon) ──────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-incidents') {
    console.log('[SW] Arka plan senkronizasyonu: arızalar');
  }
});
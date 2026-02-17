const CACHE_NAME = 'servis-panel-v1';
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
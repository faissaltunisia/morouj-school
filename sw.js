const CACHE_NAME = 'murooj-v2';
const assets = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Tajawal:wght@300;500;800&display=swap'
];

// تثبيت ملفات الكاش الأساسية
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// تفعيل المحرك ومسح الكاش القديم
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    })
  );
});

// إدارة الطلبات (توفير السرعة)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

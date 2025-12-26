const CACHE_NAME = 'murooj-v9';
const assets = [
  './', './index.html', './style.css', './script.js', './splash.html', './dua.html',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Tajawal:wght@500;800&display=swap'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(assets)));
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('supabase.co') || e.request.url.includes('youtube.com')) return;
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});

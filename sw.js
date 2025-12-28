const CACHE_NAME = 'murooj-v12'; // قمت بترقية النسخة للتأكد من التحديث
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './splash.html',
  './dua.html',
  './manifest.json'
];

// التثبيت وتخزين الملفات
self.addEventListener('install', (e) => {
  self.skipWaiting(); // إجبار النسخة الجديدة على التفعيل فوراً
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => {
      console.log('تم تخزين الملفات بنجاح');
      return c.addAll(assets);
    })
  );
});

// تنظيف الكاش القديم (مهم جداً لظهور التحديثات)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
});

// جلب الملفات (Offline Mode)
self.addEventListener('fetch', (e) => {
  // استثناء روابط قاعدة البيانات والفيديوهات من الكاش
  if (e.request.url.includes('supabase.co') || e.request.url.includes('youtube.com') || e.request.url.includes('googlevideo')) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request).catch(() => {
        // إذا كان المستخدم أوفلاين والملف غير موجود بالكاش
        console.log('المستخدم غير متصل بالإنترنت');
      });
    })
  );
});

/* ════════════════════════════════════════════════════════════
   TaroEcho 芋音 — Service Worker
   策略：Cache-First（核心殼層） + Network-First（圖片/外部資源）
   ════════════════════════════════════════════════════════════ */

const CACHE_NAME   = 'taroecho-v2';
const RUNTIME_CACHE = 'taroecho-runtime-v2';

/* 安裝時預快取的核心資源（App Shell） */
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  /* 外部 CDN 字型與 icon — 快取後離線可用 */
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-regular-400.woff2',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700;900&display=swap'
];

/* ── INSTALL：預快取 App Shell ─────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())   // 立即接管，不等舊 SW 退場
  );
});

/* ── ACTIVATE：清除舊版快取 ────────────────────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== RUNTIME_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())  // 立即控制所有分頁
  );
});

/* ── FETCH：路由策略 ────────────────────────────────────── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* 1. 非 GET 請求：直接放行，不快取 */
  if (request.method !== 'GET') return;

  /* 2. App Shell（同源 HTML / JS / CSS / manifest）
        策略：Cache-First → 離線也能開啟 App */
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request));
    return;
  }

  /* 3. Google Fonts CSS（跨域）
        策略：Stale-While-Revalidate → 快取回應同時背景更新 */
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  /* 4. Font Awesome CDN
        策略：Cache-First，版本固定不需頻繁更新 */
  if (url.hostname === 'cdnjs.cloudflare.com') {
    event.respondWith(cacheFirst(request));
    return;
  }

  /* 5. Unsplash 圖片 / 其他外部資源
        策略：Network-First → 有網路用新圖，離線降級顯示快取版 */
  event.respondWith(networkFirst(request));
});

/* ════════════════════════════════════════════════════════════
   策略函式
   ════════════════════════════════════════════════════════════ */

/** Cache-First：優先從快取回應，未命中才去網路並寫入快取 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/** Network-First：優先從網路取，失敗才用快取；成功則更新快取 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? new Response('Offline', { status: 503 });
  }
}

/** Stale-While-Revalidate：立即回傳快取，背景同時更新快取 */
async function staleWhileRevalidate(request) {
  const cache  = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  return cached ?? fetchPromise;
}

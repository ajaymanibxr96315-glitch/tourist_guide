/**
 * sw.js — Service Worker for TravelGuide
 *
 * Strategy: Cache-first for static assets (HTML, CSS, JS, SVG).
 * Network-only for map tiles, online photos, fonts, and external libraries.
 *
 * Phase 5 compliance:
 * ✅ Static assets cached on install (offline-capable core)
 * ✅ Map tiles are NOT cached in bulk (tile provider policy compliance)
 * ✅ Google Maps links and map tiles remain network-only
 * ✅ Cache versioned — old caches cleared on activation
 */

'use strict';

const CACHE_NAME   = 'travelguide-v15';
const OFFLINE_URL  = './index.html';

/** Static assets to pre-cache on install */
const PRECACHE_URLS = [
  './index.html',
  './css/style.css',
  './js/data.js',
  './js/api.js',
  './js/map.js',
  './js/script.js',
  './manifest.json',
  './assets/jaipur.svg',
  './assets/jaipur-offline-map.svg',
  './assets/manali.svg',
  './assets/nashik.svg',
  './assets/goa.svg',
  './assets/delhi.svg',
  './assets/varanasi.svg',
  './assets/hostel.svg',
  './assets/heritage-hotel.svg',
  './assets/garden-hotel.svg',
  './assets/premium-hotel.svg',
  './assets/food-meal.svg',
  './assets/food-snack.svg',
  './assets/food-drink.svg',
  './assets/food-dessert.svg',
  './assets/food-thali.svg',
  './assets/food-chaat.svg',
  './assets/food-greens.svg',
  './assets/food-sweet.svg',
  './assets/food-aktori.webp',
  './assets/food-banarasi-lassi.webp',
  './assets/food-bebinca.webp',
  './assets/food-bedai-sabzi.webp',
  './assets/food-bhel-puri.webp',
  './assets/food-biryani.webp',
  './assets/food-bombil-fry.webp',
  './assets/food-butter-chicken.webp',
  './assets/food-chole-bhature.webp',
  './assets/food-dal-baati-churma.webp',
  './assets/food-dilli-chaat.webp',
  './assets/food-ghewar.webp',
  './assets/food-goan-fish-curry-rice.webp',
  './assets/food-goan-fish-curry.webp',
  './assets/food-jalebi.webp',
  './assets/food-kachori-sabzi.webp',
  './assets/food-lassi.webp',
  './assets/food-malaiyyo.webp',
  './assets/food-misal-pav.webp',
  './assets/food-mughlai-biryani.webp',
  './assets/food-pav-bhaji.webp',
  './assets/food-petha.webp',
  './assets/food-prawn-balchao.webp',
  './assets/food-puran-poli.webp',
  './assets/food-pyaaz-kachori.webp',
  './assets/food-sabudana-khichdi.webp',
  './assets/food-seasonal-sweet.webp',
  './assets/food-seekh-kebab.webp',
  './assets/food-siddu.webp',
  './assets/food-street-chaat.webp',
  './assets/food-tamatar-chaat.webp',
  './assets/food-thukpa.webp',
  './assets/food-trout-fish-curry.webp',
  './assets/food-vada-pav.webp',
  './assets/food-xacuti-chicken.webp',
  './assets/icon-192.svg'
];

/** Hostnames whose requests should always go to the network (no caching) */
const NETWORK_ONLY_HOSTS = [
  'tiles.openfreemap.org',
  'openfreemap.org',
  'en.wikipedia.org',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'unpkg.com',
  'cdn.jsdelivr.net'
];

// ---------------------------------------------------------------------------
// Install — pre-cache static assets
// ---------------------------------------------------------------------------
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Pre-cache failed (some assets may be missing):', err))
  );
});

// ---------------------------------------------------------------------------
// Activate — delete old caches
// ---------------------------------------------------------------------------
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ---------------------------------------------------------------------------
// Fetch — cache-first for static assets, network-only for external services
// ---------------------------------------------------------------------------
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always network-only for external APIs, fonts, and map tiles
  if (NETWORK_ONLY_HOSTS.some(h => url.hostname === h || url.hostname.endsWith('.' + h))) {
    // Do not intercept — let the browser handle it
    return;
  }

  // For same-origin requests: cache-first, fall back to network, then offline page
  if (url.origin === self.location.origin || event.request.url.startsWith(self.registration.scope)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;

        return fetch(event.request)
          .then(response => {
            // Only cache successful same-origin GET responses
            if (
              response.ok &&
              event.request.method === 'GET' &&
              !url.pathname.includes('sw.js')
            ) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => {
            // Offline fallback: return the cached index.html for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
    );
  }
});

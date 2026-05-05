/* ════════════════════════════════════════
   StudEarn Service Worker — sw.js
   Upload this file to your Vercel project ROOT
   so it's accessible at: https://studearn.vercel.app/sw.js
════════════════════════════════════════ */

const CACHE_NAME = 'studearn-v9';
const ICON_URL = 'https://img.icons8.com/emoji/96/money-bag.png';

/* ── Install ── */
self.addEventListener('install', event => {
  self.skipWaiting();
});

/* ── Activate ── */
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

/* ── Push event — fires when server sends a push ── */
self.addEventListener('push', event => {
  let data = { title: '⚡ StudEarn', body: "Don't miss today's earnings!" };
  if (event.data) {
    try { data = event.data.json(); } catch(e) { data.body = event.data.text(); }
  }
  const options = {
    body: data.body,
    icon: ICON_URL,
    badge: ICON_URL,
    tag: data.tag || 'studearn',
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: { url: data.url || 'https://studearn.vercel.app/#dash' },
    actions: [
      { action: 'open', title: '💰 Earn Now' },
      { action: 'dismiss', title: 'Later' }
    ]
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

/* ── Notification click ── */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || 'https://studearn.vercel.app/#dash';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('studearn.vercel.app') && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

/* ── Scheduled push messages (client-side via postMessage) ── */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SCHEDULE_PUSH') {
    const { title, body, delay } = event.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body, icon: ICON_URL, tag: 'studearn-scheduled',
        data: { url: 'https://studearn.vercel.app/#tasks' }
      });
    }, delay);
  }
});

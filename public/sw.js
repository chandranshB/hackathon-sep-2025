// AirWatch Service Worker for PWA functionality
const CACHE_NAME = 'airwatch-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log('AirWatch SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('AirWatch SW: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('AirWatch SW: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('AirWatch SW: Installation failed', error);
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  console.log('AirWatch SW: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('AirWatch SW: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('AirWatch SW: Activation complete');
      return self.clients.claim();
    })
  );
});

// Push notification handler
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'View Details',
          icon: '/icons/icon-96x96.png'
        },
        {
          action: 'close',
          title: 'Close notification',
          icon: '/icons/icon-96x96.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification('AirWatch Alert', options)
    );
  }
});

// Background sync for offline reports
self.addEventListener('sync', event => {
  if (event.tag === 'pollution-report-sync') {
    event.waitUntil(
      // Sync pending reports when back online
      syncPendingReports()
    );
  }
});

async function syncPendingReports() {
  try {
    // Get pending reports from IndexedDB
    const pendingReports = await getPendingReports();
    
    for (const report of pendingReports) {
      try {
        // Attempt to send each report
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(report)
        });
        
        if (response.ok) {
          // Remove from pending queue
          await removePendingReport(report.id);
          console.log('AirWatch SW: Synced pending report', report.id);
        }
      } catch (error) {
        console.error('AirWatch SW: Failed to sync report', report.id, error);
      }
    }
  } catch (error) {
    console.error('AirWatch SW: Background sync failed', error);
  }
}

// Placeholder functions for IndexedDB operations
async function getPendingReports() {
  // In a real app, this would fetch from IndexedDB
  return [];
}

async function removePendingReport(reportId) {
  // In a real app, this would remove from IndexedDB
  console.log('Removing pending report:', reportId);
}
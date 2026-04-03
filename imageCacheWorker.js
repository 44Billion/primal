export const version = import.meta.env.PRIMAL_VERSION;
const IMAGE_CACHE = `images-${version}`;

const DAY = 1000 * 60 * 60 * 24;

let imageToElementMap = {};

// Install event - precache critical images
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(IMAGE_CACHE).then(async (cache) => {
      try {
        // Fetch the manifest
        const manifestResponse = await fetch('/manifest.json');
        const manifest = await manifestResponse.json();

        // Extract asset URLs from manifest
        const assetUrls = Object.values(manifest)
          .filter(entry => entry.file && entry.file.match(/\.(png|jpg|jpeg|svg|webp)$/))
          .map(entry => `/${entry.file}`);

        const uniqueAssetUrls = [...new Set(assetUrls)];

        return cache.addAll(uniqueAssetUrls);
      }
      catch (e) {
        console.log('Error fertching manifest: ', e)
      }
    }).catch((e => {
      if (self.location.hostname === 'localhost') {
        console.log('Error prefetching cached images: ', e);
      }
    }))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== IMAGE_CACHE)
          .map(k => caches.delete(k))
      )
    )
    .then(() => self.clients.claim())
    .then(() => {
      // Notify all open tabs that a new version is active
      self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_ACTIVATED' });
        });
      });
    })
  );
});

// Fetch event - intercept image requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isLocal = url.origin === location.origin;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache',
        },
      }).catch(() => caches.match(event.request))
    );
    return;  // important: stop processing other handlers
  }

  if (event.request.destination === 'document') {
    // Always go to network for HTML
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .catch(() => caches.match(event.request))
    );
  }

  if (event.request.destination === 'image') {

    event.respondWith(
      caches.open(IMAGE_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            return response;
          }

          if (isLocal) {
            // Fetch fresh image
            return fetch(event.request, { mode: 'no-cors' }).then(fetchResponse => {
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            }).catch(error => {
              // console.error('FAILED TO FETCH IMAGE: ', url);
            });
          }


          return fetch(event.request).then(fetchResponse => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          }).catch(error => {
            console.error('FAILED TO FETCH IMAGE: ', url);
          });
        });
      }).catch(error => {
        console.error('FAILED TO OPEN IMAGE: ', url);
      })
    );
  }
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CACHE_AVATAR' && typeof event.data.url === 'string') {
    const url = event.data.url;

    event.waitUntil(new Promise(async (resolve) => {
      try {
        const cache = await caches.open(IMAGE_CACHE);
        const response = await cache.match(url);
        if (!!response) {
          resolve();
        }
        else {
          try {
            // Fetch with no-cors for cross-origin avatars
            const fetchResponse = await fetch(url, { mode: 'no-cors' });
            await cache.put(url, fetchResponse);
            resolve();
          } catch {
            console.error('Failed to cache avatar:', url, error);
            resolve();
          }
        }
      }
      catch (e) {
        console.error('Failed to open cache: ', e);
        resolve();
      }
    }));
  }
});

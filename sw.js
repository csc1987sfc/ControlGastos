const NOMBRE_CACHE = 'presufacil-v4';

// MEJORA C: Quitamos el enlace externo de Tailwind para que la caché nunca se bloquee al instalarse
const ARCHIVOS_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './cerdito.png'
];

// Al instalar la app, descarga y guarda los archivos propios sin bloquearse
self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(NOMBRE_CACHE)
      .then(cache => cache.addAll(ARCHIVOS_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Borra versiones antiguas de la caché si actualizas la app
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then(nombresCache => {
      return Promise.all(
        nombresCache.map(cache => {
          if (cache !== NOMBRE_CACHE) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Cuando la app pide internet, primero mira si lo tiene guardado en la memoria
self.addEventListener('fetch', (evento) => {
  // Ignoramos las llamadas a la base de datos de Supabase para que siempre vayan en tiempo real
  if (evento.request.url.includes('supabase.co') || evento.request.method !== 'GET') {
    return;
  }

  evento.respondWith(
    caches.match(evento.request).then(respuestaCache => {
      return respuestaCache || fetch(evento.request);
    })
  );
});

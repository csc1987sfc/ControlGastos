const NOMBRE_CACHE = 'presufacil-v1';

// Estos son los archivos que el móvil guardará en su memoria interna
const ARCHIVOS_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './cerdito.png',
  'https://cdn.tailwindcss.com'
];

// Al instalar la app, descarga y guarda los archivos
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
    })
  );
});

// Cuando la app pide internet, primero mira si lo tiene guardado en la memoria
self.addEventListener('fetch', (evento) => {
  // Ignoramos las llamadas a la base de datos de Supabase para que no se atasquen
  if (evento.request.url.includes('supabase.co') || evento.request.method !== 'GET') {
    return;
  }

  evento.respondWith(
    caches.match(evento.request).then(respuestaCache => {
      // Si el archivo está en la memoria, lo devuelve al instante. Si no, lo busca en internet.
      return respuestaCache || fetch(evento.request);
    })
  );
});

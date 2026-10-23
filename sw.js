const NOMBRE_CACHE = 'presufacil-automatico';

const ARCHIVOS_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './cerdito.png'
];

// 1. Al instalar, guarda la primera copia de seguridad
self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(NOMBRE_CACHE)
      .then(cache => cache.addAll(ARCHIVOS_CACHE))
      .then(() => self.skipWaiting())
  );
});

// 2. Limpia memorias antiguas si las hubiera
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

// 3. NUEVO SISTEMA: Primero busca en internet (para tener siempre lo último)
// y actualiza la memoria. Si no hay internet, usa la memoria guardada.
self.addEventListener('fetch', (evento) => {
  // Ignoramos Supabase para que los datos bancarios vayan siempre directos
  if (evento.request.url.includes('supabase.co') || evento.request.method !== 'GET') {
    return;
  }

  evento.respondWith(
    fetch(evento.request)
      .then((respuestaRed) => {
        // Si hay internet y el archivo se descargó bien, actualizamos la copia en memoria
        if (respuestaRed && respuestaRed.status === 200) {
          const copiaParaGuardar = respuestaRed.clone();
          caches.open(NOMBRE_CACHE).then((cache) => {
            cache.put(evento.request, copiaParaGuardar);
          });
        }
        // Y te mostramos en pantalla la versión recién descargada de internet
        return respuestaRed;
      })
      .catch(() => {
        // Si NO hay internet (falla el fetch), sacamos el archivo de la memoria del móvil
        return caches.match(evento.request);
      })
  );
});

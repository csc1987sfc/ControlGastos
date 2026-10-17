// Este archivo permite que la aplicación se instale en el móvil
self.addEventListener('install', (evento) => {
  console.log('App instalada correctamente');
});

self.addEventListener('fetch', (evento) => {
  // Dejamos pasar todas las peticiones de internet de momento
});

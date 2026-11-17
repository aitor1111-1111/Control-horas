const CACHE='control-horas-profesional-v5-10-1-20261117';
const FILES=[
  './','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
  './saco_monedas_agitandose.wav?v=5.10.1',
  './fajo_billetes_contandose.wav?v=5.10.1'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  const isAudio=/\.(wav|mp3|ogg)$/i.test(url.pathname);
  event.respondWith(
    caches.match(event.request).then(cached=>{
      if(cached) return cached;
      return fetch(event.request).then(response=>{
        if(response&&response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        }
        return response;
      }).catch(()=>{
        if(isAudio) return new Response('No se encontró el archivo de sonido.',{status:404,headers:{'Content-Type':'text/plain'}});
        return caches.match('./index.html');
      });
    })
  );
});

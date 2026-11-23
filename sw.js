/* Horizonte de Eventos: guarda el juego en el teléfono para jugar sin internet */
const VERSION = 'horizonte-v24';
const ARCHIVOS = [
  './', 'index.html', 'three.min.js', 'turbo-circuito.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
  // Las voces se guardan aparte, sin frenar la instalación.
  caches.open(VERSION).then((c) => c.addAll(['vox-es.json', 'vox-en.json', 'pilots/aeli-tass.jpg', 'pilots/amaya-kest.jpg', 'pilots/dax-mero.jpg', 'pilots/drak-omm.jpg', 'pilots/elara-kyn.jpg', 'pilots/elian-mora.jpg', 'pilots/jorin-vale.jpg', 'pilots/kairo-ren.jpg', 'pilots/kess-ardan.jpg', 'pilots/korvax.jpg', 'pilots/lira-voss.jpg', 'pilots/mira-sol.jpg', 'pilots/mirex-sai.jpg', 'pilots/nem-vor.jpg', 'pilots/nira-dael.jpg', 'pilots/nyx-tal.jpg', 'pilots/orun-vek.jpg', 'pilots/ren-tavik.jpg', 'pilots/rhaz-kor.jpg', 'pilots/rhem-solar.jpg', 'pilots/sena-tor.jpg', 'pilots/soraya-ix.jpg', 'pilots/tali-venn.jpg', 'pilots/thorin-vek.jpg', 'pilots/tomas-ryde.jpg', 'pilots/vesha-nol.jpg', 'pilots/voran-ix.jpg', 'pilots/zara-kai.jpg', 'pilots/zeth-ark.jpg', 'pilots/zyra-qel.jpg'])).catch(() => {});
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nombres) => Promise.all(nombres.filter((n) => n !== VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // La página del juego: primero internet (para recibir mejoras), y si no hay, la copia guardada.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((r) => { const copia = r.clone(); caches.open(VERSION).then((c) => c.put('index.html', copia)); return r; })
        .catch(() => caches.match(req).then((r) => r || caches.match('index.html')))
    );
    return;
  }
  // Todo lo demás (voces, 3D, íconos y las letras de Google): la copia guardada primero.
  if (url.origin === location.origin || url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com')) {
    e.respondWith(
      caches.match(req).then((guardado) => guardado || fetch(req).then((r) => {
        if (r.ok || r.type === 'opaque') { const copia = r.clone(); caches.open(VERSION).then((c) => c.put(req, copia)); }
        return r;
      }))
    );
  }
});

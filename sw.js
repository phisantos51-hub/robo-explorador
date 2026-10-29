/*
 * Robô Explorador — guarda os arquivos do jogo no navegador para funcionar sem internet.
 * Com internet, sempre busca a versão mais nova (assim as perguntas novas aparecem).
 */
var CACHE = 'robo-explorador-v2';
var ARQUIVOS = [
  './',
  'index.html',
  'css/estilo.css',
  'perguntas.js',
  'js/fases.js',
  'js/obstaculos.js',
  'js/desenho.js',
  'js/jogo.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARQUIVOS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.filter(function (n) { return n !== CACHE; }).map(function (n) { return caches.delete(n); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (resposta) {
      var copia = resposta.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
      return resposta;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true });
    })
  );
});

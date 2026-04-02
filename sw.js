
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuração do Firebase (os valores reais serão injetados ou lidos do config)
// Nota: Em um ambiente real, esses valores devem vir do seu firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyDFpQOZ0AekVJuFcrrT1uXj1x-hivwp61w",
  authDomain: "impacto-x-hipica.firebaseapp.com",
  projectId: "impacto-x-hipica",
  storageBucket: "impacto-x-hipica.firebasestorage.app",
  messagingSenderId: "129023106186",
  appId: "1:129023106186:web:993ff4faf66a9321c32173"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Manipulador de mensagens em segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Mensagem recebida em segundo plano: ', payload);
  
  const notificationTitle = payload.notification.title || 'Alerta Impacto X';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/logo.png',
    badge: '/assets/logo.png',
    data: payload.data,
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

const CACHE_NAME = 'impactox-v1';
const urlsToCache = ['/'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// Lógica para abrir o app ao clicar na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});

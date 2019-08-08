self.addEventListener('install', event => {
    console.log('The service worker is being installed.');
});

self.addEventListener('push', function (event) {
    const data = event.data.json();
    console.log("Getting push data", data);

    if ('BroadcastChannel' in self) {
        const bc = new BroadcastChannel('main_channel');
        bc.postMessage(data.msg);
    }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.msg,
            vibrate: [500, 100, 500]
        })
    );
});

// serviceworker.js
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(clients.openWindow('http://www.google.com'));
});
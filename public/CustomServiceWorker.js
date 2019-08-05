self.addEventListener('install', event => {
    console.log('The service worker is being installed.');
});

self.addEventListener('push', function (event) {
    const data = event.data.json();
    console.log("Getting push data", data);

    const bc = new BroadcastChannel('main_channel');
    bc.postMessage(data.msg);

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.msg,
            vibrate: [500, 100, 500]
        })
    );
});


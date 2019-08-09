self.addEventListener('install', event => {
    console.log('The service worker is being installed.');
});

self.addEventListener('push', function (event) {
    const data = event.data.json();
    console.log("Getting push data", data);

    // The BroadcastChannel is mainly used to be able to log messages in the React app as well.
    // It is not essential for the push or notification functionality.
    if ('BroadcastChannel' in self) {
        const bc = new BroadcastChannel('main_channel');
        bc.postMessage(data.msg);
    }

    event.waitUntil(
        // This is how we show the message to the user.
        // You can check out the documentation for the API here:
        // https://developer.mozilla.org/en-US/docs/Web/API/notification
        self.registration.showNotification(
            // The title in the pop up
            data.title, {
                // The message in the pop up
                body: data.msg,
                // Some vibration on your device
                vibrate: [500, 100, 500]
            })
    );
});

// If you want to handle when the user clicks on a message, you should
// do it by subscribing to this event:
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // We are overriding default behaviour, so we need to close it ourselves.
    event.waitUntil(clients.openWindow('http://www.google.com')); // Open a new window.
});
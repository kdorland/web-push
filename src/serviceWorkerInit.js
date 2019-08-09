const vapidPublicKey = 'BHAbi2JPNK35b9e3RJm92f3Gr27rdc2EJVL9CKR8gX6wiD9ht_vdkpBIYEKCjdHWYfZ_v2uCRQaAQmMvhkMWYZs';

export function register() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./CustomServiceWorker.js')
        .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
                subscribeToPush();
            }
        )
        .catch(error => console.log('ServiceWorker registration failed: ', error));
    }
}

// This is where we do the following:
// 1. Create a subscription object by communicating with the messaging server.
//    If a subscription was already created earlier, we will get the same one back.
// 2. We send the subscription to our own server using a HTTP POST request.
function subscribeToPush() {
    const API_URL = process.env.REACT_APP_API_URL;
    navigator.serviceWorker.ready.then(
        function (serviceWorkerRegistration) {
            // Register to push events here
            // The server key has to be encoded using this function to work with the Push API
            const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
            const options = {
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            };
            // This method will create the subscription (or retrive an existing one)
            serviceWorkerRegistration.pushManager.subscribe(options).then(
                function (pushSubscription) { // And this callback will get the subscription
                    console.log(pushSubscription);
                    fetch(`${API_URL}/subscribe`, { // And now we can send it to our server.
                        method: 'post',
                        headers: {
                            'Content-type': 'application/json'
                        },
                        body: JSON.stringify(pushSubscription), // Our subscription is sent as JSON in the body
                    }).catch(error => console.error(error));
                }, function (error) {
                    console.log(error);
                }
            );
        });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
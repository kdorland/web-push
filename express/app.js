const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const webpush = require('web-push');

/**** Configuration ****/
const port = (process.env.PORT || 8080);
const app = express();

app.use(cors());
app.use(bodyParser.json()); // Parse JSON from the request body
app.use(morgan('combined')); // Log all requests to the console
app.use(express.static(path.join(__dirname, '../build'))); // Serve React app

// Supply these keys using environment variables.
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webpush.setVapidDetails('mailto:krdo@eaaa.dk', publicVapidKey, privateVapidKey);
const subscriptions = []; // TODO: Move this to a database

/**** Routes ****/

// The purpose of this endpoint is to store the subscription object that
// was created in the React app.
app.post('/api/subscribe', (req, res) => {
    const subscription = req.body;
    const sub = subscriptions.find(elm => elm.endpoint === subscription.endpoint);

    if (sub) {
        let msg = "Subscription already stored";
        console.log(msg, sub);
        res.status(201).json({msg: msg});
    } else {
        subscriptions.push(subscription);
        console.log(subscription);
        res.status(201).json({msg: 'Successfully subscribed'});
    }
});

// And here we are removing an subscription if it exists.
app.post('/api/unsubscribe', (req, res) => {
    const subscription = req.body;
    const sub = subscriptions.find(elm => elm.endpoint === subscription.endpoint);
    const index = subscriptions.indexOf(sub);

    if (index !== -1) {
        subscriptions.splice(index, 1);
        let msg = "Subscription removed";
        res.status(201).json({msg: msg});
    } else {
        let msg = "Subscription not found";
        res.status(201).json({msg: msg});
    }
});

// This endpoint broadcasts a message to all subscriptions stored on this server.
app.post('/api/send_push_message', (req, res) => {
    let msg = req.body.msg;
    let title = req.body.title;

    subscriptions.forEach((sub) => {
        // The payload can be anything you want that fits in JSON
        const payload = JSON.stringify({
            msg: msg,
            title: title
        });
        // This method will send the payload to the messaging server using the subscription object.
        webpush.sendNotification(sub, payload).catch(error => {
            if (error.statusCode === 410) {
                console.log("The subscription is no longer active");
                subscriptions.splice(subscriptions.indexOf(sub), 1);
                console.log(subscriptions);
            } else {
                console.error(error.stack, error);
            }
        });
    });
    res.json({msg: "Sending push messages initiated"});
});

/**** Reroute all unknown requests to react index.html ****/
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
});

/****** Error handling ******/
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send({msg: 'Something broke!'})
});

/**** Start server ****/
const server = app.listen(port,
    () => console.log(`API Service running on port ${port}!`));

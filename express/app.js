const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors')
const webpush = require('web-push');

/**** Configuration ****/
const port = (process.env.PORT || 8080);
const app = express();

app.use(cors());
app.use(bodyParser.json()); // Parse JSON from the request body
app.use(morgan('combined')); // Log all requests to the console
app.use(express.static(path.join(__dirname, '../build'))); // Serve React app

// TODO: Don't put these directly in source! Keep them somewhere else.
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webpush.setVapidDetails('mailto:krdo@eaaa.dk', publicVapidKey, privateVapidKey);
const subscriptions = [];

/**** Routes ****/
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

app.post('/api/send_push_message', (req, res) => {
    let msg = req.body.msg;
    let title = req.body.title;

    subscriptions.forEach((sub) => {
        const payload = JSON.stringify({
            msg: msg,
            title: title
        });
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

    res.json({message: "Sending push messages initiated"});
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

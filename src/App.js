import React, {Component} from 'react';

/**
 * The sole purpose of this React app is show Push messages received and make it possible to unsubscribe from them.
 * Everything else happens in the service worker implementation.
 */
class App extends Component {

    constructor(props) {
        super(props);
        this.unsubscribePush = this.unsubscribePush.bind(this);

        this.state = {
            messages: []
        };

        // The BroadcastChannel API is used to receive messages from the service worker, and is not essential
        // for the actual push and notification functionality.
        try {
            const bc = new BroadcastChannel('main_channel');
            bc.onmessage = msg => {
                console.log(msg);
                this.setState({messages: [...this.state.messages, msg.data]});
            }
        } catch(err) {
            console.log("BroadcastChannel not available", err);
        }
    }

    unsubscribePush() {
        navigator.serviceWorker.ready.then(function(reg) {
            reg.pushManager.getSubscription().then(function(subscription) {
                if (subscription) {
                    subscription.unsubscribe().then(function(successful) {
                        console.log("Push unsubscribed", successful);
                    }).catch(function(e) {
                        console.log("Push unsubscribed failed", e);
                    })
                } else {
                    console.log("No subscription");
                }
            })
        });
    }

    render() {
        const msgList = this.state.messages.map((msg, index) => <p key={index}>{msg}</p>);
        return (
            <div className="container">
                <h1>Push Notifications</h1>

                <p>This page will display Notifications from Web Push.</p>

                <button onClick={this.unsubscribePush}>Unsubscribe</button>

                <h3>Messages:</h3>
                {msgList}
            </div>
        );
    }
}

export default App;

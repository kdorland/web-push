import React, {Component} from 'react';

class App extends Component {

    constructor(props) {
        super(props);
        this.unsubscribePush = this.unsubscribePush.bind(this);

        this.state = {
            messages: []
        };

        const bc = new BroadcastChannel('main_channel');
        bc.onmessage = msg => {
            console.log(msg);
            this.setState({messages : [...this.state.messages, msg.data]});
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

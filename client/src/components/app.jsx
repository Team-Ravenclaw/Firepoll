import React from 'react';
import { withRouter } from 'react-router';
import { Route } from 'react-router-dom';
import Landing from './landing.jsx';
import Create from './create.jsx';
import Dashboard from './dashboard.jsx';
import Analytics from './analytics.jsx';
import Live from './live.jsx';
import Login from './login.jsx';
import PollDist from './responseClient';
import firebase from '../config.js';
import ResponseClient from './responseClient';
// require('../auth.js');


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null
    };

    this.vote = this.vote.bind(this);
  }

  vote() {
    console.log('should be changing');
    this.props.history.push('/polldist');
  }

  componentDidMount() {
    const initApp = () => {
      firebase.auth().onAuthStateChanged(user => {
        console.log(user);
        console.log(user.displayName);
        console.log(user.email);
        if (user) {
          this.setState({user: user.displayName});
        } else {
          // document.getElementById('sign-in-status').textContent = 'Signed out';
          // document.getElementById('sign-in').textContent = 'Sign in';
          // document.getElementById('account-details').textContent = 'null';
        }
      }, err => console.log(err));
    };
    
    window.addEventListener('load', () => initApp());

  }
  
  render() {
    let user = this.state.user || 'anonymous';
    return (
      <div>
        <Route exact path="/" render={props => <Landing {...props} vote={this.vote}/> } />
        <Route exact path="/create" render={(props) => <Create {...props} user={user}/> } />
        <Route exact path="/dashboard" render={props => <Dashboard {...props} user={user}/> } />
        <Route exact path="/analytics" render={props => <Analytics {...props} /> } />
        <Route exact path="/live" render={props => <Live {...props} /> } />
        <Route exact path="/login" render={props => <Login {...props} user={user} /> } />
        <Route exact path="/polldist" render={props => <ResponseClient {...props}/> } />
        {/* <Route exact path="/polls/:id" render={props => <Register {...props} />} /> */}
        {/* <AuthRoute exact path="/auth" component={Auth} /> */}
        {/* <PollAudienceClientTest />  enter any nonexistent route to render your test components */}
        {/* <PollManagerClientTest /> */}
      </div>
    )
  }
}

export default withRouter(App);
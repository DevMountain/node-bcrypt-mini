import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      loggedInUser: {}
    };
  }

  async login() {
    let { email, password } = this.state;
    let res = await axios.post('/auth/login', {
      email: email,
      password: password
    });
    this.setState({ loggedInUser: res.data, email: '', password: '' });
  }

  async signup() {
    let { email, password } = this.state;
    let res = await axios.post('/auth/signup', {
      email,
      password
    });
    this.setState({ loggedInUser: res.data, email: '', password: '' });
  }

  async logout() {
    await axios.get('/auth/logout');
    this.setState({ loggedInUser: {} });
  }

  render() {
    let { loggedInUser, email, password } = this.state;

    return (
      <div className="App">
        <h2>Auth w/ Bcrypt</h2>
        <p>
          Email:
          <input
            value={email}
            onChange={e => this.setState({ email: e.target.value })}
            type="text"
          />
        </p>
        <p>
          Password:
          <input
            value={password}
            type="password"
            onChange={e => this.setState({ password: e.target.value })}
          />
        </p>
        <button onClick={() => this.login()}>Login</button>
        <button onClick={() => this.signup()}>Sign up</button>

        <hr />

        <h4>Status: {loggedInUser.email ? 'Logged In' : 'Logged Out'}</h4>
        <h4>User Data:</h4>
        <p> {JSON.stringify(loggedInUser)} </p>
        <br />
        {loggedInUser.email ? (
          <button onClick={() => this.logout()}>Logout</button>
        ) : null}
      </div>
    );
  }
}

export default App;

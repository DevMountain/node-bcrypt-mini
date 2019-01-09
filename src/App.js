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

  async login() {}

  async signup() {}

  async logout() {}

  render() {
    let { loggedInUser, email, password } = this.state;

    return (
      <div className="App">
        <h2>Auth w/ Bcrypt</h2>
        <p>
          Email:
          <input value={email} onChange={() => null} type="text" />
        </p>
        <p>
          Password:
          <input value={password} type="password" onChange={() => null} />
        </p>
        <button onClick={() => this.login()}>Login</button>
        <button onClick={() => this.signup()}>Sign up</button>

        <hr />

        <h4>Status: {loggedInUser.email ? 'Logged In' : 'Logged Out'}</h4>
        <h4>User Data:</h4>
        <p> {JSON.stringify(loggedInUser)} </p>
        <br />
        {loggedInUser.email ? (
          <button onClick={() => null}>Logout</button>
        ) : null}
      </div>
    );
  }
}

export default App;

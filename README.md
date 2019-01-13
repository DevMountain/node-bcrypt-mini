<img src="https://s3.amazonaws.com/devmountain/readme-logo.png" width="250" align="right">

# Project Summary

In this project we'll use a package called `bcrypt` to authenticate users. Bcrypt is a package based off the popular bcrypt hashing algorithm. It exposes several functions that we can use to salt, hash, and compare our passwords without exposing the users plain-text password.

## Setup

* `Fork` and `clone` this repository.
* `cd` into the project directory.
* Run `npm install`.
* Review the provided code.
    * Your basic server has been built for you, we'll focus on working with bcrypt and authentication.
* Using your SQL GUI (pgweb, SQLTabs, Postico, etc.) add the following table to your database.
    ```sql
    CREATE TABLE users
    (
    id SERIAL PRIMARY KEY,
    email VARCHAR(200),
    user_password TEXT
    )
    ```

## Step 1

### Summary

In this step, create your `.env` file.

### Instructions

Create your `.env` file in the root of your directory. It should have three properties: `SESSION_SECRET` for your `express-session` middleware, `SERVER_PORT` for the port your server will run on, and `CONNECTION_STRING` which should be your database connection.

### Solution

<details>
<summary><code> .env </code></summary>

```
CONNECTION_STRING=string_from_heroku_db
SESSION_SECRET=some_cool_secret
SERVER_PORT=3001
```

</details>

## Step 2

### Summary

With our database connected, we're ready to start handling user authentication. We need to provide an endpoint for our users to signup for our website. We'll then need to store that users email and password to our database. This is where bcrypt comes in. Remember, we have to be careful with our users data; bcrypt will hash their password before we keep it for longterm storage.

### Instructions

* Open `server/index.js`
* Beneath your middlewares, write an endpoint with the `post` method, and a path of `/auth/signup`.
* This endpoint should:
    * Expect to receive `email` and `password` properties on `req.body`.
    * Check if the user has already signed up using the `check_user_exists` sql statement in `db/`.
        * If the user exists, send an error back.
    * If the user hasn't signed up
        * `hash` and `salt` the password using bcrypts `genSaltSync` and `hashSync` methods
        * You can see how to use them <a href="https://www.npmjs.com/package/bcryptjs#usage---sync">here</a>.
        * Add the user's email and hashed password to the database using the `create_user` sql statement found in `db/`.
        * Put the user object on session (excluding their hashed password) so we can reference them in other endpoints in our server and send the new user's data back to the client.

### Solution

<details>
<summary><code> index.js </code></summary>

```js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const massive = require('massive');

const app = express();
app.use(express.json());

let { SERVER_PORT, CONNECTION_STRING, SECRET } = process.env;

app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: false
}));

massive(CONNECTION_STRING).then(db => {
  app.set('db', db);
});

app.post('/auth/signup', async (req, res) => {
  let { email, password } = req.body;
  let db = req.app.get('db')
  let userFound = await db.check_user_exists([email]);
  if (userFound[0]) {
    return res.status(200).send('Email already exists')
  }
  let salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(password, salt);
  let createdUser = await db.create_customer([email, hash])
  req.session.user = { id: createdUser[0].id, email: createdUser[0].email }
  res.status(200).send(req.session.user)
});

app.listen(SERVER_PORT, () => {
  console.log(`Listening on port: ${SERVER_PORT}`)
});
```

</details>

## Step 3

### Summary

In this step we'll create login functionality. Bcrypt is only one of many hashing algorithms. When hashing passwords, it's important that we use the same algorithm that we used for creating hashed passwords when comparing hashed passwords. With hashing, using the same alogrithm with the same input (password here) will create the same hash. This allows us to know that a user entered the correct email and password, despite not saving their password in plain-text.

### Instructions

* Beneath your previous endpoint, write another post request, this time to `/auth/login`
* We should do some of the same things we did in the previous endpoint:
    * `req.body` will have email and password properties
    * We should check that the user is in our database
    * If they're not, send an error, they probably entered their email or password wrong.
* If their email is in our database:
    * Use bcrypts `compareSync` method to compare the input password on `req.body` with the users `user_password`.
        * You can review use for `compareSync` <a href="https://www.npmjs.com/package/bcryptjs#usage---sync">here</a>.
    * If the passwords match, then the user has successfully authenticated, put the user object on session (excluding their hashed password) and send it to the client.
* The user can now `login` to your website!

### Solution

<details>
<summary><code> index.js </code></summary>

```js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const massive = require('massive');

const app = express();
app.use(express.json());

let { SERVER_PORT, CONNECTION_STRING, SECRET } = process.env;

app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: false
}));

massive(CONNECTION_STRING).then(db => {
  app.set('db', db);
});

app.post('/auth/signup', async (req, res) => {
  let { email, password } = req.body;
  let db = req.app.get('db')
  let userFound = await db.customer_check([email]);
  if (userFound[0]) {
    return res.status(200).send('Email already exists')
  }
  let salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(password, salt);
  let createdUser = await db.create_customer([email, hash])
  req.session.user = { id: createdUser[0].id, email: createdUser[0].email }
  res.status(200).send(req.session.user)
});

app.post('/auth/login', async (req, res) => {
  let { email, password } = req.body;
  let db = req.app.get('db')
  let userFound = await db.check_user_exists(email)
  if (!userFound[0]) {
    return res.status(200).send('Incorrect email. Please try again.');
  }
  let result = bcrypt.compareSync(password, userFound[0].user_password)
  if (result) {
    req.session.user = { id: userFound[0].id, email: userFound[0].email }
    res.status(200).send(req.session.user)
  } else {
    return res.status(401).send('Incorrect email/password')
  }
});

app.listen(SERVER_PORT, () => {
  console.log(`Listening on port: ${SERVER_PORT}`)
});
```

</details>

## Step 4

### Summary

With the essential authentication functionality done, we'll write the matching frontend functions so a user can signup and login to our site.

### Instructions

* Open `src/App.js`
  * A few things to note:
    * The functions we'll work with already exist, we're going to write the functionality.
    * The inputs are already setup to update our `email` and `password` state items as we type into them.
    * The buttons already have the function calls mapped to them.
* Find the `signup` function on our App Component
* This function should:
  * Make a post request to `/auth/signup`.
  * The body should be an object with our email and password from state assigned as properties on the object.
  * When the response comes back, we should set the returned user on state and reset the username and password fields.
* Take a look at your database to make sure the user was successfully added.
  * Notice the format of the `user_password`. It looks nothing like what we typed in. That's a hashed value!

* Next find the `login` function
* This function will look identical to the `signup` function, except we'll be posting to the `/auth/login` endpoint instead of the signup endpoint.
* It should make the post request, set the returned user on state, and reset the input fields.

### Solution

<details>
<summary><code> App.js </code></summary>

```js
async signup() {
  let { email, password } = this.state;
  let res = await axios.post('/auth/signup', {
    email,
    password
  });
  this.setState({ loggedInUser: res.data, email: '', password: '' });
}

async login() {
  let { email, password } = this.state;
  let res = await axios.post('/auth/login', {
    email,
    password
  });
  this.setState({ loggedInUser: res.data, email: '', password: '' });
}
```

</details>

## Step 5

### Summary

Once a user is logged in, they need a way to logout. In this step, we'll add logout functionality, which is really just the user telling our app that we can close their session for now.

### Instructions

* Open `server/index.js`
* Add a `get` endpoint to `/auth/logout`
* This endpoint should:
  * Destroy the user's session.
  * Send a status of 200.

### Solution

<details>
<summary><code> index.js </code></summary>

```js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const massive = require('massive');

const app = express();
app.use(express.json());

let { SERVER_PORT, CONNECTION_STRING, SECRET } = process.env;

app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: false
}));

massive(CONNECTION_STRING).then(db => {
  app.set('db', db);
});

app.post('/auth/signup', async (req, res) => {
  let { email, password } = req.body;
  let db = req.app.get('db')
  let userFound = await db.customer_check([email]);
  if (userFound[0]) {
    return res.status(200).send('Email already exists')
  }
  let salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(password, salt);
  let createdUser = await db.create_customer([email, hash])
  req.session.user = { id: createdUser[0].id, email: createdUser[0].email }
  res.status(200).send(req.session.user)
});

app.post('/auth/login', async (req, res) => {
  let { email, password } = req.body;
  let db = req.app.get('db')
  let userFound = await db.customer_check([email])
  if (!userFound[0]) {
    return res.status(200).send('Incorrect email. Please try again.');
  }
  let result = bcrypt.compareSync(password, userFound[0].hash_value)
  if (result) {
    req.session.user = { id: userFound[0].id, email: userFound[0].email }
    res.status(200).send(req.session.user)
  } else {
    return res.status(401).send('Incorrect email/password')
  }
});

app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  res.sendStatus(200);
});

app.listen(SERVER_PORT, () => {
  console.log(`Listening on port: ${SERVER_PORT}`)
});
```

</details>

## Step 6

### Summary

In this step we'll write our logout functionality.

### Instructions

* Open `App.js`
* Find the `logout` function
* This function should:
  * make a `get` request to `/auth/logout`.
  * Set the `loggedInUser` on state back to an empty object.
* You should now be able to sign a user up, login, and logout!

### Solution
<details>
<summary><code> App.js </code></summary>

```js
logout() {
  axios.get('/auth/logout');
  this.setState({ loggedInUser: {} });
}
```

</details>

## Step 7

### Summary

One final piece of server code is needed to complete our authentication process. We need a way to check that our user is logged in and pull their information into our application if they are.

### Instructions

* Open `index.js`
* Add a `get` enpoint to `/auth/user`
* This endpoint should:
  * Check if their is a user on session.
  * If there is, send it up.
  * If there isn't send an error.

### Solution
<details>
<summary><code> index.js </code></summary>

```js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const massive = require('massive');

const app = express();
app.use(express.json());

let { SERVER_PORT, CONNECTION_STRING, SECRET } = process.env;

app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: false
}));

massive(CONNECTION_STRING).then(db => {
  app.set('db', db);
});

app.post('/auth/signup', async (req, res) => {
  let { email, password } = req.body;
  let db = req.app.get('db')
  let userFound = await db.customer_check([email]);
  if (userFound[0]) {
    return res.status(200).send('Email already exists')
  }
  let salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(password, salt);
  let createdUser = await db.create_customer([email, hash])
  req.session.user = { id: createdUser[0].id, email: createdUser[0].email }
  res.status(200).send(req.session.user)
});

app.post('/auth/login', async (req, res) => {
  let { email, password } = req.body;
  let db = req.app.get('db')
  let userFound = await db.customer_check([email])
  if (!userFound[0]) {
    return res.status(200).send('Incorrect email. Please try again.');
  }
  let result = bcrypt.compareSync(password, userFound[0].hash_value)
  if (result) {
    req.session.user = { id: userFound[0].id, email: userFound[0].email }
    res.status(200).send(req.session.user)
  } else {
    return res.status(401).send('Incorrect email/password')
  }
});

app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  res.sendStatus(200);
});

app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.status(200).send(req.session.user)
  } else {
    res.status(401).send('please log in')
  }
});

app.listen(SERVER_PORT, () => {
  console.log(`Listening on port: ${SERVER_PORT}`)
});
```

</details>

## Summary

You are now able to use form based, local authentication via bcrypt to have users signup, login, logout, and access their data. Authentication will allow your projects to be more flexible, dynamic, and engaging, and using bcrypt will help make sure that your users data is safe.

## Contributions

If you see a problem or a typo, please fork, make the necessary changes, and create a pull request so we can review your changes and merge them into the master repo and branch.

## Copyright

© DevMountain LLC, 2019. Unauthorized use and/or duplication of this material without express and written permission from DevMountain, LLC is strictly prohibited. Excerpts and links may be used, provided that full and clear credit is given to DevMountain with appropriate and specific direction to the original content.

<p align="center">
<img src="https://s3.amazonaws.com/devmountain/readme-logo.png" width="250">
</p>

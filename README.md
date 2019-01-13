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

In this step, create your `/.env` file.

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
        * Put the user on session so we can reference them in other endpoints in our server and send the new users data back to the client.

### Solution

<details>
<summary><code> index.js </code></summary>

```js
require('dotenv').config()
const express = require('express');
const session = require('express-session')
const bcrypt = require('bcryptjs')
const massive = require('massive')

const app = express();
app.use(express.json())

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

app.listen(SERVER_PORT, () => {
  console.log(`Listening on port: ${SERVER_PORT}`)
});
```

</details>

## Step 3

### Summary



### Instructions


### Solution

<details>
<summary><code> .env </code></summary>


</details>

## Step 4

### Summary



### Instructions


### Solution

<details>
<summary><code> .env </code></summary>


</details>

## Step 5

### Summary



### Instructions


### Solution

<details>
<summary><code> .env </code></summary>


</details>

## Contributions

If you see a problem or a typo, please fork, make the necessary changes, and create a pull request so we can review your changes and merge them into the master repo and branch.

## Copyright

© DevMountain LLC, 2019. Unauthorized use and/or duplication of this material without express and written permission from DevMountain, LLC is strictly prohibited. Excerpts and links may be used, provided that full and clear credit is given to DevMountain with appropriate and specific direction to the original content.

<p align="center">
<img src="https://s3.amazonaws.com/devmountain/readme-logo.png" width="250">
</p>

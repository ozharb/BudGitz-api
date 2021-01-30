# BudGitz Api

Financial planning simplified. Easily create budgets for your personal projects or expenses.

This is the backend for `BudGitz`.  A live version of the app can be found at [https://budgitz-client.ozharb.vercel.app/]

The front end client can be found at [https://github.com/ozharb/BudGit-client].

## Introduction

Watch your total costs update in real-time as you add, remove, and edit items in each BudGit.

## App Screenshot

![screenshot](https://i.ibb.co/4s5B7Vc/Screen-Shot-2021-01-30-at-10-48-45-AM.png)

## How to use Api

 * API_ENDPOINT: https://peaceful-shelf-32168.herokuapp.com/api,
 
 * For testing use: 'http://localhost:8000/api',
   
 * Bearer token required: TOKEN_KEY: 'budgitz-client-auth-token',

#### Base URL
The Base URL is the root URL for all of the API, if you ever make a request get back a 404 NOT FOUND response then check the Base URL first.

The Base URL is https://peaceful-shelf-32168.herokuapp.com/api

#### Authentication
Requires bearer token. You may use the front end client to register an account and create a token.


#### CRUD requests
API supports Get, Post, Delete, and Patch requests.

#### Endpoints
* `/lists ` get all lists for user
* `/lists:id` get specific list for user or delete list.
* `/items` get all items in lists
* `/items/:id` get specific item or delete or udpate item.
* `/users` get all users. Saves bcryped passwords.


#### Back End

* Node and Express
  * Authentication via JWT
  * RESTful Api
* Testing
  * Supertest (integration)
  * Mocha and Chai (unit)
* Database
  * Postgres
  * Knex.js - SQL wrapper

#### Production

Deployed via Heroku


## Set up

Major dependencies for this repo include Postgres and Node.

To get setup locally, do the following:

1. Clone this repository to your machine, `cd` into the directory and run `npm install`
2. Create the dev and test databases: `createdb -U postgres -d budgitz` and `createdb -U postgres -d  budgitz-test`

3. Create a `.env` file in the project root

Inside these files you'll need the following:

````
NODE_ENV=development
PORT=8000

DATABASE_URL="postgresql://postgres@localhost/budgitz"
TEST_DATABASE_URL="postgresql://postgres@localhost/budgitz-test"
JWT_SECRET="oz-special-jwt-secret"

````

4. Run the migrations for dev - `npm run migrate`
5. Run the migrations for test - `npm run migrate:test`
6. Seed the database for dev

* `psql -U <db-user> -d bettr-dev -f ./seeds/seed.budgitz_tables.sql`

Now, run those three commands above again for the test database as well.

7. Run the tests - `npm t`
8. Start the app - `npm run dev`
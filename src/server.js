'use strict';

require('dotenv').config();
const knex = require('knex');
const app = require('./app');

const port = process.env.PORT || 8000;

const db = knex({
  client: 'pg', 
  connection: process.env.DB_URL,
})

app.set('db', db);

app.listen(port, () => console.log(`Server running at https://localhost:${port}`));
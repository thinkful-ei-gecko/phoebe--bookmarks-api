require('dotenv').config();
const { express } = require('chai');
const knex = require('knex');
const app = require('../src/app');

describe('Bookmarks endpoints', () => {
  before('Make a knex instance', () => {
    const db = knex({
      client: 'pg', 
      connection: 'TEST_DB_URL'
    });
  });

  beforeEach('Empty db', () => db('bookmarks').truncate());

  afterEach('Empty db', () => db('bookmarks').truncate());

  after('disconnect from db', () => db.destroy());
  
  describe('GET /bookmarks', () => {
    context('Given there are no bookmarks in the table', () => {

    })

    context('Given there are bookmarks in the table', () => {

    })
  })

  describe('GET /bookmarks/:bookmarkId', () => {
    context
  })
});
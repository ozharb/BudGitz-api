const knex = require('knex')
const app = require('../src/app')
// const helpers = require('./test-helpers')
const { makeItemsArray } = require('./items.fixtures');
const { makeListsArray } = require('./lists.fixtures');

describe('Items Endpoints', function() {
  let db

  const testLists = makeListsArray();
  const testItems = makeItemsArray();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy());
  
  before('clean the table', () => db.raw('TRUNCATE budgitz_lists, budgitz_items RESTART IDENTITY CASCADE'));

  afterEach('cleanup',() => db.raw('TRUNCATE budgitz_lists, budgitz_items RESTART IDENTITY CASCADE'));

  describe(`POST /api/items`, () => {
    beforeEach('insert lists', () =>{
        return db
        .into('budgitz_lists')
        .insert(testLists)
        .then(() =>
          db
            .into('budgitz_items')
            .insert(testItems)
        )
      
      })

    it(`creates an item, responding with 201 and the new item`, function() {
      this.retries(3)
    const testList = testLists[0]
   const testItem = testItems[0]
      const newItem = {
      item_name:'mug',
      content:'for whatever',
      price: '3',
      calc: false,
      list_id: 1,
      }
      return supertest(app)
        .post('/api/items')
        .send(newItem)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body.item_name).to.eql(newItem.item_name)
          expect(res.body.content).to.eql(newItem.content)
          expect(res.body.list_id).to.eql(newItem.list_id)
          expect(res.body.price).to.eql(newItem.price)
          expect(res.headers.location).to.eql(`/api/items/${res.body.id}`)
          const expectedDate = new Date().toLocaleString()
          const actualDate = new Date(res.body.date_made).toLocaleString()
          expect(actualDate).to.eql(expectedDate)
        })
        .expect(res =>
          db
            .from('budgitz_items')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.content).to.eql(newItem.content)
              expect(row.price).to.eql(newItem.price)
              expect(row.list_id).to.eql(newItem.list_id)
              expect(row.item_name).to.eql(newItem.item_name)
              const expectedDate = new Date().toLocaleString()
              const actualDate = new Date(row.date_created).toLocaleString()
              expect(actualDate).to.eql(expectedDate)
            })
        )
    })

    const requiredFields = ['item_name', 'price', 'list_id']

    requiredFields.forEach(field => {
      const testList = testLists[0]
      const testItem = testItems[0]
      const newItem = {
        item_name: 'Test new item',
        price: 3,
        list_id: 1,
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newItem[field]

        return supertest(app)
          .post('/api/items')
          .send(newItem)
          .expect(400, {
            error: { message: `Missing '${field}' in request body`},
          })
      })
    })
  })
})
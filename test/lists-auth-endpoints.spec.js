const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Lists Endpoints', function() {
  let db

  const {
    testUsers,
    testLists,
    testItems,

  } = helpers.makeListsFixtures()

  function makeAuthHeader(user) {
       const token = Buffer.from(`${user.user_name}:${user.password}`).toString('base64')
       return `Basic ${token}`
     }

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))
  describe (`Protected endpoints`, () => {
       beforeEach('insert lists', () =>
         helpers.seedListsTables(
           db,
           testUsers,
           testLists,
           testItems,
         )
       )
       const protectedEndpoints = [
            {
              name: 'GET /api/lists/:lists_id',
              path: '/api/lists/1'
            },
            {
             name: 'GET /api/items/:item_id',
             path: '/api/items/1'
            },
          ]
          
          protectedEndpoints.forEach(endpoint => {
       describe(endpoint.name, () => {
        it(`responds 401 'Missing bearer token' when no bearer token`, () => {
           return supertest(app)
             .get(endpoint.path)
             .expect(401, { error: `Missing bearer token` })
         })
         it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
          const validUser = testUsers[0]
          const invalidSecret = 'bad-secret'

            return supertest(app)
            .get(endpoint.path)
            .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
            .expect(401, { error: `Unauthorized request` })
              })
         it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
          const invalidUser = { user_name: 'user-not-existy', id: 1 }
            return supertest(app)
            .get(endpoint.path)
            .set('Authorization', helpers.makeAuthHeader(invalidUser))
            .expect(401, { error: `Unauthorized request` })
             })
       })
      })
     })

  describe(`GET /api/lists`, () => {
    context(`Given no lists`, () => {
      beforeEach(() =>
      helpers.seedUsers(db, testUsers)
       )
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/lists')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, [])
      })
    })

    context('Given there are lists in the database', () => {
      beforeEach('insert lists', () =>
        helpers.seedListsTables(
          db,
          testUsers,
          testLists,
          testItems,
        )
      )

      it('responds with 200 and all of the lists', () => {
        const expectedLists = testLists.map(lists =>
          helpers.makeExpectedList(
            testUsers,
            lists,
            testItems,
          )
        )
        return supertest(app)
          .get('/api/lists')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedLists)
      })
    })

    context(`Given an XSS attack list`, () => {
      const testUser = helpers.makeUsersArray()[1]
      const {
        maliciousList,
        expectedList,
      } = helpers.makeMaliciousList(testUser)

      beforeEach('insert malicious list', () => {
        return helpers.seedMaliciousList(
          db,
          testUser,
          maliciousList,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/lists`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(expectedList.title)
            expect(res.body[0].content).to.eql(expectedList.content)
          })
      })
    })
  })

  describe(`GET /api/lists/:lists_id`, () => {
    context(`Given no lists`, () => {
      beforeEach(() =>
      helpers.seedUsers(db, testUsers)
           )
      it(`responds with 404`, () => {
        const listsId = 123456
        return supertest(app)
          .get(`/api/lists/${listsId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: { message: `List doesn't exist` }})
      })
    })
    

    context('Given there are lists in the database', () => {
      beforeEach('insert lists', () =>
        helpers.seedListsTables(
          db,
          testUsers,
          testLists,
          testItems,
        )
      )

      it('responds with 200 and the specified list', () => {
        const listId = 2
        const expectedList = helpers.makeExpectedList(
          testUsers,
          testLists[listId - 1],
          testItems,
        )

        return supertest(app)
          .get(`/api/lists/${listId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedList)
      })
    })

    context(`Given an XSS attack list`, () => {
      const testUser = helpers.makeUsersArray()[1]
      const {
        maliciousList,
        expectedList,
      } = helpers.makeMaliciousList(testUser)

      beforeEach('insert malicious list', () => {
        return helpers.seedMaliciousList(
          db,
          testUser,
          maliciousList,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/lists/${maliciousList.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedList.title)
            expect(res.body.content).to.eql(expectedList.content)
          })
      })
    })
  })

  describe(`GET /api/lists/:list_id`, () => {
    context(`Given no lists`, () => {
      beforeEach(() =>
      helpers.seedUsers(db, testUsers)
     )
      it(`responds with 404`, () => {
        const listId = 123456
        return supertest(app)
          .get(`/api/lists/${listId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: { message: `List doesn't exist` } })
      })
    })

    context('Given there are items for list in the database', () => {
      beforeEach('insert lists', () =>
        helpers.seedListsTables(
          db,
          testUsers,
          testLists,
          testItems,
        )
      )

      it.skip('responds with 200 and the specified items', () => {
        const listId = 1
        const expectedItems = helpers.makeExpectedListItems(
          testUsers, listId, testItems
        )

        return supertest(app)
          .get(`/api/lists/${listId}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(200, expectedItems)
      })
    })
  })
})

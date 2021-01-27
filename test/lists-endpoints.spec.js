
'use strict';

const  {expect}  = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeListsArray } = require('./lists.fixtures');
const { makeUsersArray } = require('./users.fixtures')
const helpers = require('./test-helpers')

describe('Lists Endpoints', function() {
  let db;
  const {
    testUsers,
    testLists,
    testItems,

  } = helpers.makeListsFixtures()
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });
  
  after('disconnect from db', () => db.destroy());
  
  before('clean the table', () => db.raw('TRUNCATE budgitz_users, budgitz_lists, budgitz_items RESTART IDENTITY CASCADE'));

  afterEach('cleanup',() => db.raw('TRUNCATE budgitz_users, budgitz_lists, budgitz_items RESTART IDENTITY CASCADE'));
  describe('POST /api/lists', () => {
    beforeEach(() =>
      helpers.seedUsers(db, testUsers)
       )
    it('responds with 400 and an error message when the \'list_name\' is missing', () => {
      return supertest(app)
        .post('/api/lists')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send({})
        .expect(400, {
          error: { message: 'Missing \'list_name\' in request body' }
        });
    });
    it('creates a list, responding with 201 and the new list',  function() {
      this.retries(3);
      const newList = {
        list_name: 'Test new list',
      };
      const testUser = testUsers[0]
      return supertest(app)
        .post('/api/lists')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newList)
        .expect(201)
        .expect(res => {
          expect(res.body.list_name).to.eql(newList.list_name);
          expect(res.body.user_id).to.eql(testUser.id)
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/api/lists/${res.body.id}`);
          const expected = new Intl.DateTimeFormat('en-US').format(new Date())
          const actual = new Intl.DateTimeFormat('en-US').format(new Date(res.body.date_published))
          expect(actual).to.eql(expected)
        });
    });
  });
  describe('GET /api/lists', () => {
    context('Given no lists', () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers)
       )
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/lists')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });
    context('Given there are lists in the database', () => {
      const testUsers = makeUsersArray();
      const testLists = makeListsArray();

      beforeEach('insert lists', () => {
        return  helpers.seedUsers(db, testUsers)
          .then(() => {
        return db
          .into('budgitz_lists')
          .insert(testLists);
      })
    })

      it('responds with 200 and all of the Lists', () => {
        // eslint-disable-next-line no-undef
          const testUser = testUsers[0]
          const expectedLists = testLists.filter(list=>
            list.user_id === testUser.id)
          return supertest(app, testUser.id)
          .get('/api/lists')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedLists);
      });
    });
  });

  describe('GET /api/lists/:list_id', () => {
    
    context('Given no lists', () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers)
       )
      it('responds with 404', () => {
        const listId = 123456;
        return supertest(app)
          .get(`/api/lists/${listId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: { message: 'List doesn\'t exist' } });
      });
    });
        
    context('Given there are lists in the database', () => {
      const testUsers = makeUsersArray();
      const testLists = makeListsArray();

      beforeEach('insert lists', () => {
        return  helpers.seedUsers(db, testUsers)
          .then(() => {
        return db
          .into('budgitz_lists')
          .insert(testLists);
      })
    })

      it('responds with 200 and the specified list', () => {
        const listId = 3;
        const expectedList = testLists[listId - 1];
        // eslint-disable-next-line no-undef
        return supertest(app)
          .get(`/api/lists/${listId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedList);
      });
    });
  });
  describe('DELETE /api/lists/:lists_id', () => {

    context('Given no lists', () => {
      beforeEach(() =>
       helpers.seedUsers(db, testUsers)
       )
      it('responds with 404', () => {
        const listId = 123456;
        return supertest(app)
          .delete(`/api/lists/${listId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: { message: 'List doesn\'t exist' } });
      });
    });
    context('Given there are lists in the database', () => {
      const testUsers = makeUsersArray();
      const testLists = makeListsArray();
    
      beforeEach('insert lists', () => {
        return  helpers.seedUsers(db, testUsers)
          .then(() => {
        return db
          .into('budgitz_lists')
          .insert(testLists);
      })
    })
    
      it('responds with 204 and removes the List', () => {
        const testUser = testUsers[0]
        const idToRemove = 2;
        
        const expectedLists = testLists.filter(list => list.id !== idToRemove && list.user_id === testUser.id);
        return supertest(app)
          .delete(`/api/lists/${idToRemove}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(204)
          .then(res =>
            supertest(app, testUser.id)
              .get('/api/lists')
              .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
              .expect(expectedLists)
          );
      });
    });
  });
  describe('PATCH /api/lists/:lists_id', () => {
    context('Given no lists', () => {
      beforeEach(() =>
     helpers.seedUsers(db, testUsers)
       )
      it('responds with 404', () => {
        const listId = 123456;
        return supertest(app)
          .patch(`/api/lists/${listId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: { message: 'List doesn\'t exist' } });
      });

    });

    context('Given there are lists in the database', () => {
      const testUsers = makeUsersArray();
      const testLists = makeListsArray();
        
      beforeEach('insert lists', () => {
        return  helpers.seedUsers(db, testUsers)
          .then(() => {
        return db
          .into('budgitz_lists')
          .insert(testLists);
      })
    })
        
      it('responds with 204 and updates the list', () => {
        const idToUpdate = 2;
        const updateList = {
          list_name: 'updated list list_name'
        };
        const expectedList = {
                 ...testLists[idToUpdate - 1],
                 ...updateList
               }
        return supertest(app)
          .patch(`/api/lists/${idToUpdate}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(updateList)
          .expect(204)
          .then(res => {
              supertest(app)
              .get(`/api/lists/${idToUpdate}`)
              .expect(expectedList)
          })
      });
      it(`responds with 400 when no required fields supplied`, () => {
             const idToUpdate = 2
             return supertest(app)
               .patch(`/api/lists/${idToUpdate}`)
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .send({ irrelevantField: 'foo' })
               .expect(400, {
                 error: {
                   message: `Request body must contain 'list_name'`
                 }
               })
            })
            it(`responds with 204 when updating only a subset of fields`, () => {
                      const idToUpdate = 2
                      const updateList = {
                        list_name: 'updated list list_name',
                      }
                      const expectedList = {
                        ...testLists[idToUpdate - 1],
                        ...updateList
                      }
                
                      return supertest(app)
                        .patch(`/api/lists/${idToUpdate}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send({
                          ...updateList,
                          fieldToIgnore: 'should not be in GET response'
                        })
                        .expect(204)
                        .then(res =>
                          supertest(app)
                            .get(`/api/lists/${idToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(expectedList)
                        )
                    })
                  

    });
  });
});
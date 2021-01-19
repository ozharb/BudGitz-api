
'use strict';

const  {expect}  = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeListsArray } = require('./lists.fixtures');



describe('Lists Endpoints', function() {
  let db;
  
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });
  
  after('disconnect from db', () => db.destroy());
  
  before('clean the table', () => db.raw('TRUNCATE budgitz_lists, budgitz_items RESTART IDENTITY CASCADE'));

  afterEach('cleanup',() => db.raw('TRUNCATE budgitz_lists, budgitz_items RESTART IDENTITY CASCADE'));
  describe('POST /api/lists', () => {
    it('responds with 400 and an error message when the \'list_name\' is missing', () => {
      return supertest(app)
        .post('/api/lists')
        .send({})
        .expect(400, {
          error: { message: 'Missing \'list_name\' in request body' }
        });
    });
    it('creates an list, responding with 201 and the new list',  function() {
      this.retries(3);
      const newList = {
        list_name: 'Test new list',
      };
      return supertest(app)
        .post('/api/lists')
        .send(newList)
        .expect(201)
        .expect(res => {
          expect(res.body.list_name).to.eql(newList.list_name);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/api/lists/${res.body.id}`);
        //   const expected = new Intl.DateTimeFormat('en-US').format(new Date())
        //   const actual = new Intl.DateTimeFormat('en-US').format(new Date(res.body.date_created))
        //   expect(actual).to.eql(expected)
        });
    });
  });
  describe('GET /api/lists', () => {
    context('Given no lists', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/lists')
          .expect(200, []);
      });
    });
    context('Given there are lists in the database', () => {
      const testLists = makeListsArray();

      beforeEach('insert lists', () => {
        return db
          .into('budgitz_lists')
          .insert(testLists);
      });

      it('responds with 200 and all of the Lists', () => {
        // eslint-disable-next-line no-undef
        return supertest(app)
          .get('/api/lists')
          .expect(200, testLists);
      });
    });
  });

  describe('GET /api/lists/:list_id', () => {
    context('Given no lists', () => {
      it('responds with 404', () => {
        const listId = 123456;
        return supertest(app)
          .get(`/api/lists/${listId}`)
          .expect(404, { error: { message: 'List doesn\'t exist' } });
      });
    });
        
    context('Given there are lists in the database', () => {
      const testLists = makeListsArray();

      beforeEach('insert lists', () => {
        return db
          .into('budgitz_lists')
          .insert(testLists);
      });

      it('responds with 200 and the specified list', () => {
        const listId = 3;
        const expectedList = testLists[listId - 1];
        // eslint-disable-next-line no-undef
        return supertest(app)
          .get(`/api/lists/${listId}`)
          .expect(200, expectedList);
      });
    });
  });
  describe('DELETE /api/lists/:lists_id', () => {

    context('Given no lists', () => {
      it('responds with 404', () => {
        const listId = 123456;
        return supertest(app)
          .delete(`/api/lists/${listId}`)
          .expect(404, { error: { message: 'List doesn\'t exist' } });
      });
    });
    context('Given there are lists in the database', () => {
      const testLists = makeListsArray();
    
      beforeEach('insert lists', () => {
        return db
          .into('budgitz_lists')
          .insert(testLists);
      });
    
      it('responds with 204 and removes the List', () => {
        const idToRemove = 2;
        const expectedLists = testLists.filter(list => list.id !== idToRemove);
        return supertest(app)
          .delete(`/api/lists/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get('/api/lists')
              .expect(expectedLists)
          );
      });
    });
  });
  describe('PATCH /api/lists/:lists_id', () => {
    context('Given no lists', () => {
      it('responds with 404', () => {
        const listId = 123456;
        return supertest(app)
          .patch(`/api/lists/${listId}`)
          .expect(404, { error: { message: 'List doesn\'t exist' } });
      });

    });

    context('Given there are lists in the database', () => {
      const testLists = makeListsArray();
        
      beforeEach('insert lists', () => {
        return db
          .into('budgitz_lists')
          .insert(testLists);
      });
        
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
                        .send({
                          ...updateList,
                          fieldToIgnore: 'should not be in GET response'
                        })
                        .expect(204)
                        .then(res =>
                          supertest(app)
                            .get(`/api/lists/${idToUpdate}`)
                            .expect(expectedList)
                        )
                    })
                  

    });
  });
});
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      full_name: 'Test user 1',
      nickname: 'TU1',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      user_name: 'test-user-2',
      full_name: 'Test user 2',
      nickname: 'TU2',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      user_name: 'test-user-3',
      full_name: 'Test user 3',
      nickname: 'TU3',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      user_name: 'test-user-4',
      full_name: 'Test user 4',
      nickname: 'TU4',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ]
}

function makeListsArray(users) {
  return [
    {
      id: 1,
      date_published: '2029-01-22T16:28:32.615Z',
      list_name: 'Road Trip',
      user_id: users[0].id
    },
    {
      id: 2,
      date_published: '2010-01-22T16:28:32.615Z',
      list_name: 'Clothes',
      user_id: users[1].id
    },
    {
      id: 3,
      date_published: '2017-01-22T16:28:32.615Z',
      list_name: 'Car',
      user_id: users[2].id
    },
    {
      id: 4,
      date_published: '1999-03-24T16:28:32.615Z',
      list_name: 'Tools',
      user_id: users[3].id
    },
  ];
}

function makeItemsArray() {
  return [
    {
      id:1,
      date_made: '2029-01-22T16:28:32.615Z',
      item_name: 'paint',
      price: 20,
      calc: false,
      list_id: 1,
    },
    {
        id: 2,
        date_made: '2019-01-12T16:28:32.615Z',
        item_name: 'thingy',
        price: 20,
        calc: true,
        list_id: 1,
    },
    {
        id: 3,
        date_made: '2029-01-23T16:28:30.615Z',
        item_name: 'wrench',
        price: 77,
        calc: false,
        list_id: 2,
    },
    {
        id: 4,
        date_made: '2029-01-22T16:28:32.615Z',
        item_name: 'watch',
        price: 557,
        calc: true,
        list_id: 3,
    },
  ];
}

function makeExpectedList(users, list, items=[]) {
  const listUser = users
    .find(user => user.id === list.user_id)

  const number_of_items = items
    .filter(item => item.list_id === list.id)
    .length

  return {
    id: list.id,
    list_name: list.list_name,
    date_published: list.date_published,
    user_id:list.user_id,
  
  }
}

function makeExpectedListItems(lists, listId, items) {
  const expectedItems = items
    .filter(item => item.list_id === listId)

  return expectedItems.map(item => {
    const itemsList = lists.find(list => list.id === item.list_id)
    return {
      id: item.id,
      item_name: item.item_name,
      price:item.price,
      quantity: item.quantity,
      calc:item.calc,
      date_made: item.date_made,
      list_id: itemsList.id
    }
  })
}
function makeMaliciousList(user) {
  const maliciousList = {
    id: 911,
    date_published: new Date(),
    list_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    user_id: user.id,
  }
  const expectedList = {
    ...makeExpectedList([user], maliciousList),
    list_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
  }
  return {
    maliciousList,
    expectedList,
  }
}

function makeListsFixtures() {
  const testUsers = makeUsersArray()
  const testLists = makeListsArray(testUsers)
  const testItems = makeItemsArray(testUsers, testLists)
  return { testUsers, testLists, testItems }
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        budgitz_lists,
        budgitz_users,
        budgitz_items
      `
    )
    .then(() =>
      Promise.all([
        trx.raw(`ALTER SEQUENCE budgitz_lists_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE budgitz_users_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE budgitz_items_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('budgitz_lists_id_seq', 0)`),
        trx.raw(`SELECT setval('budgitz_users_id_seq', 0)`),
        trx.raw(`SELECT setval('budgitz_items_id_seq', 0)`),
      ])
    )
  )
}
function seedUsers(db, users) {
     const preppedUsers = users.map(user => ({
       ...user,
       password: bcrypt.hashSync(user.password, 1)
     }))
     return db.into('budgitz_users').insert(preppedUsers)
       .then(() =>
         // update the auto sequence to stay in sync
         db.raw(
           `SELECT setval('budgitz_users_id_seq', ?)`,
           [users[users.length - 1].id],
         )
       )
   }

function seedListsTables(db, users, lists, items=[]) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('budgitz_lists').insert(lists)
    // update the auto sequence to match the forced id values
    await trx.raw(
             `SELECT setval('budgitz_lists_id_seq', ?)`,
             [lists[lists.length - 1].id],
           )
    // only insert items if there are some, also update the sequence counter
    if (items.length) {
      await trx.into('budgitz_items').insert(items)
      await trx.raw(
        `SELECT setval('budgitz_items_id_seq', ?)`,
        [items[items.length - 1].id],
      )
    }
  })
}

function seedMaliciousList(db, user, article) {
  return seedUsers(db, [user])
    .then(() =>
      db
        .into('budgitz_lists')
        .insert([article])
    )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
         subject: user.user_name,
         algorithm: 'HS256',
       })
     return `Bearer ${token}`
   }
  

module.exports = {
  makeUsersArray,
  makeListsArray,
  makeExpectedList,
  makeExpectedListItems,
  makeMaliciousList,
  makeItemsArray,
  seedUsers,
  makeListsFixtures,
  cleanTables,
  seedListsTables,
  seedMaliciousList,
  makeAuthHeader,
}
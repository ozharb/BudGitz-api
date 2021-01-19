'use strict';

const ListsService = {

  getAllLists(knex) {
    return knex.select('*').from('budgitz_lists');
  },
  insertList(knex, newList) {
    return knex
      .insert(newList)
      .into('budgitz_lists')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex.from('budgitz_lists').select('*').where('id', id).first();
  },
  deleteList(knex, id) {
    return knex('budgitz_lists')
      .where({ id })
      .delete();
  },
  updateList(knex, id, newListFields) {
    return knex('budgitz_lists')
      .where({ id })
      .update(newListFields);
  },
};

 

module.exports = ListsService;
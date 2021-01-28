'use strict';

const ItemsService = {
  getAllItems(knex) {
    return knex.select('*').from('budgitz_items');
  },
  getByIdUser(knex, id) {
    return knex
    .from(
        'budgitz_items'
      )
      
      .select(`*`,
      `budgitz_users.id AS "user"`
      )
      .join(
        `budgitz_lists`,
        `budgitz_lists.id`,
        `budgitz_items.list_id`
      )
      .join(
        `budgitz_users`,
        `budgitz_users.id`,
        `budgitz_lists.user_id`
      )
      .where(
        `budgitz_users.id`, '=', id
      )

      
            },
  insertItem(knex, newItem) {
    return knex
      .insert(newItem)
      .into('budgitz_items')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  
  getById(knex, id) {
    return knex
      .from('budgitz_items')
      .select('*')
      .where('id', id)
      .first();
  },
  
  deleteItem(knex, id) {
    return knex('budgitz_items')
      .where({ id })
      .delete();
  },
  
  updateItem(knex, id, newItemFields) {
    return knex('budgitz_items')
      .where({ id })
      .update(newItemFields);
  },
};
  
module.exports = ItemsService;
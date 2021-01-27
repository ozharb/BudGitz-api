'use strict';

const ListsService = {

  getAllLists(knex, user_id) {
    return knex.select('*').from('budgitz_lists').where({user_id});
  },
  insertList(knex, newList) {
    return knex
      .insert(newList)
      .into('budgitz_lists')
      .returning('*')
      .then(rows => {
        return rows[0];
      })
      .then(list =>
        ListsService.getByIdUser(knex, list.id)
      )
  },
  getByIdUser(knex, id) {
    return knex
      .from('budgitz_lists AS list')
      .select(
        'list.id',
        'list.list_name',
        'list.date_published',
        'list.user_id',
        knex.raw(
          `json_strip_nulls(
            json_build_object(
              'id', usr.id,
              'user_name', usr.user_name,
              'full_name', usr.full_name,
              'nickname', usr.nickname,
              'date_created', usr.date_created,
              'date_modified', usr.date_modified
            )
          ) AS "user"`
        )
      )
      .leftJoin(
        'budgitz_users AS usr',
        'list.user_id',
        'usr.id',
      )
      .where('list.id', id)
      .first()
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
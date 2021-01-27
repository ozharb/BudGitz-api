const xss = require('xss')
const bcrypt = require('bcryptjs')
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {
    getAllUsers(knex) {
      return knex.select('*').from('budgitz_users')
    },
  
    insertUser(knex, newUser) {
      return knex
        .insert(newUser)
        .into('budgitz_users')
        .returning('*')
        .then(([user]) => user)
    },
  
    getById(knex, id) {
      return knex
        .from('budgitz_users')
        .select('*')
        .where('id', id)
        .first()
    },
  
    deleteUser(knex, id) {
      return knex('budgitz_users')
        .where({ id })
        .delete()
    },
  
    updateUser(knex, id, newUserFields) {
      return knex('budgitz_users')
        .where({ id })
        .update(newUserFields)
    },
    hasUserWithUserName(db, user_name) {
           return db('budgitz_users')
             .where({ user_name })
             .first()
             .then(user => !!user)
         },
    validatePassword(password) {
      if (password.length < 8) {
        return 'Password must be longer than 8 characters'
      }
      if (password.length > 72) {
        return 'Password must be less than 72 characters'
      }
      if (password.startsWith(' ') || password.endsWith(' ')) {
         return 'Password must not start or end with empty spaces'
       }
       if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
           return 'Password must contain 1 upper case, lower case, number and special character'
         }
         return null
    },
    hashPassword(password) {
       return bcrypt.hash(password, 12)
     },
    serializeUser(user) {
         return {
           id: user.id,
           full_name: xss(user.full_name),
           user_name: xss(user.user_name),
           nickname: xss(user.nick_name),
           date_created: new Date(user.date_created),
         }
       },
  }
  
  module.exports = UsersService
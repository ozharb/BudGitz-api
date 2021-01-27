function makeUsersArray() {
    return [
      {
        id: 1,
        date_created: '2029-01-22T16:28:32.615Z',
        full_name: 'Sam Gamgee',
        user_name: 'sam.gamgee@shire.com',
        password: 'secret',
        nickname: 'Sam'
      },
      {
        id: 2,
        date_created: '2100-05-22T16:28:32.615Z',
        full_name: 'Peregrin Took',
        user_name: 'peregrin.took@shire.com',
        password: 'secret',
        nickname: 'Pippin'
      }
    ]
  }
  
  module.exports = {
    makeUsersArray
  }
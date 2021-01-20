function makeExpectedThing(users, thing, reviews=[]) {
    const user = users
      .find(user => user.id === thing.user_id)
  
    const thingReviews = reviews
      .filter(review => review.thing_id === thing.id)
  
    const number_of_reviews = thingReviews.length
    const average_review_rating = calculateAverageReviewRating(thingReviews)
  
    return {
      id: thing.id,
      image: thing.image,
      title: thing.title,
      content: thing.content,
      date_created: thing.date_created,
      number_of_reviews,
      average_review_rating,
      user: {
        id: user.id,
        user_name: user.user_name,
        full_name: user.full_name,
        nickname: user.nickname,
        date_created: user.date_created,
      },
    }
  }
  
  function calculateAverageReviewRating(reviews) {
    if(!reviews.length) return 0
  
    const sum = reviews
      .map(review => review.rating)
      .reduce((a, b) => a + b)
  
    return Math.round(sum / reviews.length)
  }
  
  function makeExpectedThingReviews(users, thingId, reviews) {
    const expectedReviews = reviews
      .filter(review => review.thing_id === thingId)
  
    return expectedReviews.map(review => {
      const reviewUser = users.find(user => user.id === review.user_id)
      return {
        id: review.id,
        text: review.text,
        rating: review.rating,
        date_created: review.date_created,
        user: {
          id: reviewUser.id,
          user_name: reviewUser.user_name,
          full_name: reviewUser.full_name,
          nickname: reviewUser.nickname,
          date_created: reviewUser.date_created,
        }
      }
    })
  }
  
  function makeMaliciousThing(user) {
    const maliciousThing = {
      id: 911,
      image: 'http://placehold.it/500x500',
      date_created: new Date().toISOString(),
      title: 'Naughty naughty very naughty <script>alert("xss");</script>',
      user_id: user.id,
      content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    }
    const expectedThing = {
      ...makeExpectedThing([user], maliciousThing),
      title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    }
    return {
      maliciousThing,
      expectedThing,
    }
  }
  
  function makeThingsFixtures() {
    const testUsers = makeUsersArray()
    const testThings = makeThingsArray(testUsers)
    const testReviews = makeReviewsArray(testUsers, testThings)
    return { testUsers, testThings, testReviews }
  }
  
  function cleanTables(db) {
    return db.raw(
      `TRUNCATE
        thingful_things,
        thingful_users,
        thingful_reviews
        RESTART IDENTITY CASCADE`
    )
  }
  
  function seedThingsTables(db, users, things, reviews=[]) {
    return db
      .into('thingful_users')
      .insert(users)
      .then(() =>
        db
          .into('thingful_things')
          .insert(things)
      )
      .then(() =>
        reviews.length && db.into('thingful_reviews').insert(reviews)
      )
  }
  
  function seedMaliciousThing(db, user, thing) {
    return db
      .into('thingful_users')
      .insert([user])
      .then(() =>
        db
          .into('thingful_things')
          .insert([thing])
      )
  }
  
//   module.exports = {
//     makeUsersArray,
//     makeThingsArray,
//     makeExpectedThing,
//     makeExpectedThingReviews,
//     makeMaliciousThing,
//     makeReviewsArray,
  
//     makeThingsFixtures,
//     cleanTables,
//     seedThingsTables,
//     seedMaliciousThing,
//   }
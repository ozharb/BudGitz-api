'use strict';

function makeItemsArray() {
  return [
    {
      
      date_made: '2029-01-22T16:28:32.615Z',
      item_name: 'paint',
      price: 20,
      calc: false,
      list_id: 1,
    },
    {
       
        date_made: '2019-01-12T16:28:32.615Z',
        item_name: 'thingy',
        price: 20,
        calc: true,
        list_id: 1,
    },
    {
        
        date_made: '2029-01-23T16:28:30.615Z',
        item_name: 'wrench',
        price: 77,
        calc: false,
        list_id: 2,
    },
    {
        
        date_made: '2029-01-22T16:28:32.615Z',
        item_name: 'watch',
        price: 557,
        calc: true,
        list_id: 3,
    },
  ];
}
  
module.exports = {
  makeItemsArray,
};
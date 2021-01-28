'use strict';
const path = require('path')
const express = require('express');
const xss = require('xss');
const ListsService = require('./lists-service');
const { requireAuth } = require('../middleware/jwt-auth')

const listsRouter = express.Router();
const jsonParser = express.json();
const serializeList = list => ({ 
    ...list,
    list_name: xss(list.list_name),
    user_id: list.user_id
});

listsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    
    ListsService.getAllLists(
      req.app.get('db'),req.user.id)
  
      .then(lists => {
        res.json(lists.map(serializeList),
        );
      })
      .catch(next);
  })
  .post(requireAuth,jsonParser, (req, res, next) => {
    const { list_name } = req.body;
    const newList = { list_name };
    for (const [key, value] of Object.entries(newList)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }
    newList.user_id = req.user.id

    ListsService.insertList(
      req.app.get('db'),
      newList
    )
      .then(list => {
        res
          .status(201)
         .location(path.posix.join(req.originalUrl, `/${list.id}`))
          .json(list);
      })
      .catch(next);
  });

listsRouter
  .route('/:list_id')
  .all(requireAuth)
  .all((req, res, next) => {
         ListsService.getById(
           req.app.get('db'),
           req.params.list_id
         )
           .then(list => {
             if (!list) {
               return res.status(404).json({
                 error: { message: `List doesn't exist` }
               })
             }
             res.list = list // save the list for the next middleware
             next() // don't forget to call next so the next middleware happens!
           })
           .catch(next)
       })
  .get((req, res, next) => {
    res.json(serializeList(res.list));
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get('db');
    ListsService.deleteList(knexInstance, req.params.list_id)
      .then (()=>{
      res.status(204).end()
      })
      .catch(next)
  })
  .patch(requireAuth,jsonParser, (req,res, next) => {
      const {list_name} = req.body
      const listToUpdate = { list_name }
      const numberOfValues = Object.values(listToUpdate).filter(Boolean).length
   if (numberOfValues === 0) {
     return res.status(400).json({
       error: {
         message: `Request body must contain 'list_name'`
       }
     })
   }

      ListsService.updateList(
          req.app.get('db'),
          req.params.list_id,
               listToUpdate
             )
               .then(numRowsAffected => {
                 res.status(204).end()
               })
               .catch(next)
  })

  /* async/await syntax for promises */
async function checkListExists(req, res, next) {
  try {
    const article = await ListsService.getById(
      req.app.get('db'),
      req.params.list_id
    )

    if (!list)
      return res.status(404).json({
        error: `List doesn't exist`
      })

    res.list= list
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = listsRouter;
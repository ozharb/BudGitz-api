/* eslint-disable eqeqeq */
'use strict';

const path = require('path');
const express = require('express');
const xss = require('xss');
const ItemsService = require('./items-service');
const { requireAuth } = require('../middleware/jwt-auth')
const itemsRouter = express.Router();
const jsonParser = express.json();

const serializeItem = item => ({
  id: item.id,
  item_name: xss(item.item_name),
  price: xss(item.price),
  quantity: xss(item.quantity),
  calc: item.calc,
  content: xss(item.content),
  list_id: item.list_id,
  date_made: item.date_made,
});

itemsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    ItemsService.getAllItems(knexInstance)
      .then(items => {
        res.json(items.map(serializeItem));
      })
      .catch(next);
  })
  .post(requireAuth, jsonParser, (req, res, next) => {
    const { item_name, price, quantity, calc, content, list_id } = req.body;
    const newItem = { item_name, price, list_id };

    for (const [key, value] of Object.entries(newItem)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }
   

    newItem.quantity = quantity;
    newItem.calc = calc;
    newItem.content = content;


    ItemsService.insertItem(
      req.app.get('db'),
      newItem
    )
      .then(item => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${item.id}`))
          .json(serializeItem(item));
      })
      .catch(next);
  });

itemsRouter
  .route('/:item_id')
  .all(requireAuth)
  .all((req, res, next) => {
    ItemsService.getById(
      req.app.get('db'),
      req.params.item_id
    )
      .then(item => {
        if (!item) {
          return res.status(404).json({
            error: { message: 'Item doesn\'t exist' }
          });
        }
        res.item = item;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeItem(res.item));
  })
  .delete((req, res, next) => {
    ItemsService.deleteItem(
      req.app.get('db'),
      req.params.item_id
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(requireAuth, jsonParser, (req, res, next) => {
    const {  item_name, price, quantity, calc, content, list_id  } = req.body;
    const itemToUpdate = { item_name, price, content, list_id, quantity, calc};

    const numberOfValues = Object.values(itemToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: 'Request body must contain either \'item_name\', \'price\', \'content\',\'list_id\',\'quantity\', or \'calc\''
        }
      });
    
  
  
    ItemsService.updateItem(
      req.app.get('db'),
      req.params.item_id,
      itemToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = itemsRouter;
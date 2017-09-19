'use strict';

const knex = require('../knex');

function getUserByName(name) {
  return knex.select().from('users').where('name', name);
}

module.exports = {getUserByName};

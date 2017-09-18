'use strict';

const knex = require('../knex');

function login(name) {
  return knex.select().from('users').where('name', name);
}

function logout() {
  if (!req.session) {
    res.json({logout: false});
    return;
  }

  req.session.destroy(function (error) {
    if (error) {
      res.send({logout: false, msg: 'logout error: ' + error});
      return;
    }

    res.send({logout: true});
  });
}

module.exports = {login, logout};

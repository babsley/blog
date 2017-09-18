'use strict';

const express = require('express');
const router = express.Router();

module.exports = function () {
  require('./user')(router);
  require('./posts')(router);

  return router;
};




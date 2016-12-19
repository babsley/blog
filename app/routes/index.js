'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');

module.exports = () => {
    require('./posts')(router);
    require('./auth')(router);
    require('./user')(router);

    return router;
};




'use strict';

const auth = require('../auth');
const ctrl = require('../controllers/posts');
const middleware = require('../middleware');


module.exports = (router) => {
    router.route('/api/posts/:id')
        .get(middleware.checkRole([1, 2]), (req, res) => {
            ctrl.getOne(req, res);
        })
        .put(middleware.checkRole(1), (req, res) => {
            ctrl.update(req, res);
        })
        .delete(middleware.checkRole(1), (req, res) => {
            ctrl.remove(req, res);
        });

    router.route('/api/posts')
        .get(middleware.checkRole([1, 2]), (req, res) => {
            ctrl.getOrderList(req, res);
        })
        .post(middleware.checkRole(1), (req, res) => {
            ctrl.create(req, res);
        })
};
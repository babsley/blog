'use strict';
const userModel = require('../models/user');
const pino = require('pino')();

module.exports = function (router) {
  router.route('/api/users/logout')
    .get(function (req, res) {
      if (!req.session) {
        pino.info('logout: false');
        res.json({ logout: false });
        return;
      }

      req.session.destroy(function (error) {
        if (error) {
          pino.error(error);
          res.send({ logout: false, msg: 'logout error: ' + error });
          return;
        }

        res.send({ logout: true });
      });
    });

  router.route('/api/users/login')
    .get(function (req, res) {
      if (req.session.userId) {
        pino.info('session: true');
        res.json({ session: true, role: req.session.userRole });
        return;
      }

      res.json({ session: false });
    })
    .post(function (req, res) {
      const name = req.body.name;
      const password = req.body.password;

      if (!name || !password) {
        pino.error('data not found');
        res.send(401);
        return;
      }

      userModel.getUserByName(name)
        .then(function (data) {
          try {
            const user = data[0];

            if (user.password === password) {
              req.session.userId = user.id;
              req.session.userRole = user.role;
              pino.info('{auth: true, role: user.role}');
              res.json({ auth: true, role: user.role });
            } else {
              pino.error('password problem');
              res.status(401);
              res.json({errors: ''});
              return;
            }
          } catch (error) {
            pino.error(error);
            res.status(401);
            res.json({});
          }
        }, function (error) {
          pino.error(error);
          res.status(401);
          res.json({});
        });
    });

  return router;
};

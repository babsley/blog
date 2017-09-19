'use strict';
const userModel = require('../models/user');

module.exports = function (router) {
  router.route('/api/users/logout')
    .get(function (req, res) {
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
    });

  router.route('/api/users/login')
    .get(function (req, res) {
      if (req.session.userId) {
        res.json({session: true, role: req.session.userRole});
        return;
      }

      res.json({session: false});
    })
    .post(function (req, res) {
      const name = req.body.name;
      const password = req.body.password;

      if (!name || !password) {
        res.send(401);
      }

      userModel.getUserByName(name)
        .then(function (data) {
          try {
            const user = data[0];

            if (user.password === password) {
              req.session.userId = user.id;
              req.session.userRole = user.role;
              res.json({auth: true, role: user.role});
            }
          } catch (error) {
            res.send(401);
          }
        }, function () {
          res.send(401);
        });
    });

  return router;
};
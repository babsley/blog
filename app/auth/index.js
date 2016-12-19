'use strict';

const user = require('../models/user');


class Auth {
    constructor() {
        this.counter = 0;
    }

    checkSession(req, res) {
        if (req.session.userId) {
            res.json({session: true, role: req.session.userRole});

            return;
        }

        res.json({session: false});
    };

    login(req, res) {

        if (!req.body) {
            res.send(401);

            return;
        }

        let userName = req.body.name,
            userPass = req.body.password;

        if (!userName || !userPass) {
            res.send(401);
        }

        if (req.session.userId && req.session.userRole) {
            res.json({auth: true, role: req.session.role});

            return;
        }

        user.findByName(userName)
            .then(
                (resolve) => {
                    if (resolve.password === userPass) {
                        req.session.userId = resolve.id;
                        req.session.userRole = resolve.role;
                        res.json({auth: true, role: resolve.role});
                    } else {
                        res.send(401);
                    }
                },
                (reject) => {
                    res.send(401);
                }
            )
    };

    logout(req, res) {
        if (!req.session) {
            res.json({logout: false});

            return;
        }

        req.session.destroy(function (err) {
            if (err) {
                res.send({logout: false, msg: 'logout error: ' + err});

                return;
            }

            res.send({logout: true});
        });

    };

}

module.exports = new Auth();
'use strict';

const model = require('../models/user');


class User {
    create(req, res) {
        if (!req.body) {
            req.json('User ctrl error: data not found');

            return;
        }

        model.create(req.body)
            .then((resolve)=> {
                res.json('User created')
            }, (reject)=> {
                res.json('User ctrl error: ' + reject);
            });


    }
}

module.exports = new User();
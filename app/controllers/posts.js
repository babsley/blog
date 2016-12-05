'ust strict';

const model = require('../models/posts');


class Posts {

    getOne(req, res) {
        model.getOne(req.params.id)
            .then((resolve) => {
                    res.json(resolve);
                },
                (reject) => {
                    res.send(404);
                }
            );
    };

    update(req, res) {
        let data;

        if (!req.body && !req.files) {
            res.json('Posts put error: data not found');

            return;
        }

        data = {
            heading: req.body.heading || null,
            text: req.body.text || null,
            file: req.files ? req.files.file : null,
            id: req.params.id || null
        };

        model.update(data)
            .then((resolve) => {
                    res.json(resolve)
                },
                (reject) => {
                    res.json('Posts put error: ' + reject);
                }
            );

    };

    remove(req, res) {

        model.remove({
            id: req.params.id
        })
            .then((response)=> {
                    res.json(response);
                },
                (reject) => {
                    res.json('Posts remove error: ' + reject);
                }
            );

    };

    getOrderList(req, res) {


        if (!req.query.limit || !req.query.page) {
            res.json('Posts get order list error: request params not found');

            return;
        }

        model.getOrderList(req.query)
            .then((resolve) => {
                    if (resolve.posts.length < 1) {
                        res.send(404);
                        return;
                    }
                    res.json(resolve);
                },
                (reject) => {
                    res.send(404);
                }
            );

    };

    create(req, res) {
        let data;

        if (!req.body || !req.files || !req.files.file) {
            res.json('Posts create error: data not available');

            return;
        }

        data = {
            heading: req.body.heading,
            text: req.body.text,
            file: req.files.file
        };

        model.create(data)
            .then((resolve) => {
                    res.json(resolve);
                },
                (reject) => {
                    res.json('Posts create error: ' + reject);
                }
            );
    };

}

module.exports = new Posts();
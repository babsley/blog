'use strict';

const ctrl = require('../controllers/user');


module.exports = (router) => {

    router.route('/api/user')
        .post((req,res)=>{
            ctrl.create(req,res);
        });


    return router;
};
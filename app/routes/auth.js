'use strict';

const auth = require('../auth');


module.exports = (router) => {

    router.route('/api/auth')
        .get((req, res)=> {
            auth.checkSession(req, res);
        })
        .post((req, res)=> {
            auth.login(req, res);
        })
        .delete((req, res)=> {
            auth.logout(req, res);
        })

};
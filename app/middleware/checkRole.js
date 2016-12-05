'use strict';

module.exports = function (roles) {
    return function (req, res, next) {
        if (req.session && req.session.userRole) {
            let isValidRoles;

            if (roles) {
                if (!Array.isArray(roles)) {
                    roles = [roles];
                }

                isValidRoles = roles.some(function (role) {
                    return role === req.session.userRole;
                });

                if (isValidRoles) {
                    next();

                    return;
                }
            }
        } else {
            res.send(401, 'Unauthorized');
        }

    };
};
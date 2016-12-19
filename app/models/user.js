'use strict';

const dbHelper = require('../helpers/db');
const config = require('../config');

class User {

    constructor() {
        this.table = config.user.table;
    };

    findByName(data) {
        return new Promise(function (resolve, reject) {
            return dbHelper.getOne({
                    table: this.table,
                    field: 'name',
                    value: data
                }
            ).then(function (result) {
                if (result) {
                    resolve(result)
                } else {
                    reject(result);
                }
            })
        }.bind(this));
    };

    findById(data) {
        return new Promise(function (resolve, reject) {

            if (isNaN(Number(data))) {
                reject('bad request, id != number');

                return;
            }

            resolve(dbHelper.getOne({
                    table: this.table,
                    field: 'id',
                    value: data
                })
            );
        }.bind(this));
    };


    create(data) {
        return new Promise(function (resolve, reject) {

            if (!data.name || !data.password) {
                reject('data not found');

                return;
            }

            this.findByName(data.name)
                .then((result)=> {
                        if (result) {
                            reject('this name employed');

                            return false;
                        }

                        return true;
                    }
                )
                .then((result)=> {
                    if (result) {
                        resolve(dbHelper.create({
                            table: this.table,
                            data: {
                                name: data.name,
                                password: data.password,
                                role: config.user.role
                            }
                        }))
                    } else {
                        reject(result);
                    }
                })
                .catch((err)=> {
                    reject(err);
                });

        }.bind(this));
    };

    update(data) {

    };

    remove(data) {

    };

}

module.exports = new User();

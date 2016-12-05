'use strict';

const dbHelper = require('../helpers/db');
const filesHelper = require('../helpers/files');
const config = require('../config.json');
const path = require('path');


class Posts {

    constructor() {
        this.table = config.posts.table;
        this.counter = 0;
        this.imgStorage = config.posts.imgStorage;
        this.imgPath = path.join(__dirname + config.posts.pathImgStorage);
        this.imgMimeTypes = config.posts.mimeTypes;
    };


    getOne(data) {
        return new Promise(function (resolve, reject) {

            if (isNaN(Number(data))) {
                reject('bad request, id != number');
            }

            dbHelper.getOne({
                table: this.table,
                field: 'id',
                value: data
            })
                .then((result)=> {
                    if (!result) {
                        reject('record not found');

                        return;
                    }

                    resolve(result);
                });
        }.bind(this));
    };

    remove(data) {
        return new Promise(function (resolve, reject) {

            if (isNaN(Number(data.id))) {
                reject('bad request, id != number');
            }

            resolve(dbHelper.remove({
                    table: this.table,
                    id: data.id
                })
            );

        }.bind(this));
    };

    getOrderList(data) {
        return new Promise(function (resolve, reject) {
            if (!data.limit || !data.page) {
                reject('bad request');
            }

            resolve(
                Promise.all([
                    dbHelper.getOrder({
                        table: this.table,
                        limit: data.limit,
                        page: data.page,
                        fields: ['id, heading, image']
                    }),
                    dbHelper.getSum({
                        table: this.table
                    })
                ]).then((result)=> {
                    return {posts: result[0], postsSum: result[1]}
                })
            );

        }.bind(this));
    };

    update(data) {
        return new Promise(function (resolve, reject) {
            let result;

            if (!data.id) {
                reject('id not found');

                return;
            }


            if (!data.heading && !data.text && !data.file) {

                reject('data not found');


                return;
            }

            if (data.file && data.file.name) {
                result = Promise.all([
                    filesHelper.upload({
                        file: data.file,
                        path: this.imgPath + this.imgStorage,
                        mimeTypes: this.imgMimeTypes
                    }),
                    dbHelper.getOne({
                        table: this.table,
                        field: 'id',
                        value: data.id
                    })
                ])
            } else {
                result = Promise.resolve(null);
            }

            result.then((result)=> {
                let newFile = result ? result[0] : null,
                    oldFile = result ? result[1].image : null;


                return Promise.all([
                    dbHelper.update({
                        table: this.table,
                        data: {
                            heading: data.heading,
                            text: data.text,
                            image: newFile ? this._replacePath(newFile, this.imgStorage) : null
                        },
                        id: data.id
                    }),
                    oldFile ? filesHelper.remove(path.join(this.imgPath + oldFile)) : null
                ])

            })
                .then((result)=> {
                    resolve(result);
                })
                .catch((err)=> {
                    reject(err);
                });

        }.bind(this));
    };

    create(data) {
        return new Promise(function (resolve, reject) {

            if (!data.heading || !data.text || !data.file) {
                reject('data not found');
            }


            filesHelper.upload({
                file: data.file,
                path: this.imgPath + this.imgStorage,
                mimeTypes: this.imgMimeTypes
            })
                .then(function (file) {
                    resolve(dbHelper.create({
                            table: this.table,
                            data: {
                                heading: data.heading,
                                text: data.text,
                                image: this._replacePath(file, this.imgStorage)
                            }
                        })
                    );
                }.bind(this))
                .catch((err)=> {
                    reject(err);
                });
        }.bind(this));
    };


    _replacePath(file, storage) {
        let path = storage + file;

        return path.replace(/\\/g, '/');
    }
}

module.exports = new Posts();

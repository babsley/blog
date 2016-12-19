'use strict';

class DbFunctions {

    connection(connect) {
        this.connect = connect;
    };

    getOne(data) {
        return new Promise(function (resolve, reject) {

            this.connect.query('SELECT * FROM ' + data.table + ' WHERE ' + data.field + '="' + data.value + '";', function (err, result) {

                if (err) {
                    reject(err);

                    return;
                }

                resolve(result[0]);

            });

        }.bind(this));
    };

    getSum(data) {
        return new Promise(function (resolve, reject) {

            this.connect.query('SELECT COUNT(*) FROM ' + data.table + ' ;', function (err, result) {

                if (err) {
                    reject(err);
                }

                resolve(result[0]['COUNT(*)']);
            });

        }.bind(this));
    };

    getOrder(data) {
        return new Promise(function (resolve, reject) {

            this.connect.query('SELECT ' + data.fields + ' FROM ' + data.table + ' ORDER BY id DESC LIMIT ' + data.page * data.limit + ' , ' + data.limit + ';', function (err, result) {

                if (err) {
                    reject(err);
                }

                resolve(result);
            });

        }.bind(this));
    };

    create(data) {
        let fields,
            fieldsData;

        fields = Object.keys(data.data);
        fieldsData = [];

        for (let i = 0; i < fields.length; i++) {
            fieldsData.push('"' + data.data[fields[i]] + '"');
        }

        fields = fields.join(',');

        return new Promise(function (resolve, reject) {

            this.connect.query('INSERT INTO ' + data.table + ' ( ' + fields + ' ) VALUES (' + fieldsData + ');', function (err, result) {

                if (err) {
                    reject(err);

                    return;
                }

                if (result.affectedRows == 0) {
                    reject('row not create');
                }

                resolve({id: result.insertId});
            });

        }.bind(this));
    };

    update(data) {
        let arr = [];

        for (let key in data.data) {

            if (data.data[key] == undefined || data.data[key] == '') {
                continue
            }

            arr.push(key + '="' + data.data[key] + '"');
        }


        arr.join(', ');

        return new Promise(function (resolve, reject) {

            this.connect.query('UPDATE ' + data.table + ' SET ' + arr + 'WHERE id="' + data.id + '";', function (err, result) {

                if (err) {
                    reject(err);

                    return;
                }

                if (result.affectedRows > 0) {
                    resolve(true);

                    return;
                }

                reject('row not change');
            });

        }.bind(this));
    };

    remove(data) {
        return new Promise(function (resolve, reject) {

            this.connect.query('DELETE FROM ' + data.table + ' WHERE ID="' + data.id + '";', function (err, result) {

                if (err) {
                    reject(err);
                }

                if (result.affectedRows == 0) {
                    reject('data not found');
                }

                if (result.affectedRows == 1) {
                    resolve(true);
                }
            });

        }.bind(this));
    };
}

module.exports = new DbFunctions();

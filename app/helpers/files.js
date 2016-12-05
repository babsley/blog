'use strict';

const fs = require('fs');
const uuid = require('uuid');

class Files {

    upload(options) {
        return new Promise((resolve, reject)=> {
            let file,
                fileType,
                pathFile,
                isValidMimeType;


            if (!options.file || !options.file.name) {

                reject('file does not exist ');

                return;
            }

            if (!options.path) {
                reject('path not found');
            }

            if (!fs.existsSync(options.path)) {
                fs.mkdirSync(options.path);
            }

            if (options.mimeTypes) {
                if (!Array.isArray(options.mimeTypes)) {
                    options.mimeTypes = [options.mimeTypes];
                }

                isValidMimeType = options.mimeTypes.some(function (type) {
                    return type === options.file.mimetype;
                });

                if (!isValidMimeType) {
                    reject('wrong file extension');

                    return;
                }
            }


            fileType = options.file.mimetype.split('/');
            fileType = '.' + fileType[fileType.length - 1];

            file = uuid.v4() + fileType;

            pathFile = options.path + '\\' + file;

            options.file.mv(pathFile, function (err) {
                if (err) {
                    reject(err);

                    return;
                }

                resolve(file);

            });
        });
    }


    remove(filePath) {
        return new Promise((resolve, reject)=> {

            fs.unlink(filePath, function (err) {

                if (err) {
                    reject(err);

                    return;
                }

                resolve(true);

            });
        });


    }
}

module.exports = new Files();
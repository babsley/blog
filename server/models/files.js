'use strict';
const fs = require('fs');
const knex = require('../knex');
const uuid = require('uuid');

async function upload(data) {
  let file,
    fileType,
    pathFile,
    isValidMimeType;

  if (!data.file || !data.file.name) {
    throw('file does not exist ');
  }

  if (!data.path) {
    throw('path not found');
  }

  if (!fs.existsSync(data.path)) {
    fs.mkdirSync(data.path);
  }

  if (data.mimeTypes) {
    if (!Array.isArray(data.mimeTypes)) {
      data.mimeTypes = [data.mimeTypes];
    }

    isValidMimeType = data.mimeTypes.some(function (type) {
      return type === data.file.mimetype;
    });

    if (!isValidMimeType) {
      throw('wrong file extension');
    }
  }

  fileType = data.file.mimetype.split('/');
  fileType = '.' + fileType[fileType.length - 1];
  file = uuid.v4() + fileType;
  pathFile = data.path + '/' + file;

  try {
    const path = await new Promise(function (resolve, reject) {
      data.file.mv(pathFile, function (error) {
        if (error) {
          reject(error);
        }
        resolve(file);
      });
    });

    return knex('files').insert({path: path});
  } catch (e) {
    return e;
  }
}

module.exports = {upload};
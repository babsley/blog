'use strict';

const knex = require('../knex');

function getOne(id) {
  if (isNaN(Number(id))) {
    return Promise.reject('bad request, id != number');
  }

  return knex.from('posts').select(['posts.*', 'files.path as file_path'])
    .innerJoin('files', 'posts.file', 'files.id')
    .where("posts.id", id);
}

function getOrderList(page = 1, limit = 9) {
  page = page - 1;

  return Promise.all([
    knex.from('posts').select(['posts.*', 'files.path as file_path'])
      .orderBy('id', 'desc').limit(limit).offset(page * limit)
      .innerJoin('files', 'posts.file', 'files.id'),
    knex('posts').count('id as qty')
  ]).then(function (data) {
    return {
      posts: data[0],
      postsSum: data[1][0].qty
    }
  });
}

function create(data) {
  if (!data.heading || !data.text || !data.file) {
    throw('data not found');
  }

  return knex('posts').insert({heading: data.heading, text: data.text, file: data.file});
}

function update(data) {
  if (!data.id) {
    throw('id not found');
  }

  if (!data.heading && !data.text && !data.file) {
    throw('data not found');
  }

  return knex('posts').where('id', data.id).update({heading: data.heading, text: data.text, file: data.file});
}

function remove(id) {
  if (isNaN(Number(id))) {
    throw('bad request, id != number');
  }

  return knex('posts').where('id', id).del();
}

module.exports = {getOne, getOrderList, create, update, remove};

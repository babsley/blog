'use strict';

const config = require('./config');
const path = require('path');
const express = require('express');
const fileUploader = require('express-fileupload');
const session = require('express-session');
const knex = require('./knex');
const knexSessionStore = require('connect-session-knex')(session);
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const store = new knexSessionStore({knex: knex, tablename: 'sessions'});
const routes = require('./routes/index')();

app.use(bodyParser.json());
app.use(fileUploader());
app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  key: config.session.key,
  cookie: config.session.cookie,
  store: store
}));

app.use(routes);
app.use(express.static(path.join(__dirname + '/../uploads')));
app.use(express.static(path.join(__dirname + '/../public')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname + '/../public/index.html'));
});

app.listen(process.env.PORT || config.port);
'use strict';

const config = require('./app/config');
const path = require('path');
const express = require('express');
const fileUploader = require('express-fileupload');
const session = require('express-session');
const sessionStore = require('express-mysql-session')(session);
const cookieParser = require('cookie-parser');
const app = express();
const mysql = require('mysql');
const connection = mysql.createConnection(config.db);
console.log(connection);
const dbHelper = require('./app/helpers/db').connection(connection);
const routes = require('./app/routes')(app);
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(fileUploader());

app.use(cookieParser());

app.use(session({
    secret: config.session.secret,
    key: config.session.key,
    cookie: config.session.cookie,
    store: new sessionStore({}, connection)
}));

app.use(routes);

app.use(express.static(path.join(__dirname, '/app/public/app/')));

app.use(express.static(path.join(__dirname, '/app/public/')));

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '/app/public/app/index.html'));
});


app.listen(process.env.PORT || config.port);



import express from 'express'
import bodyParser from 'body-parser';
import mysql  from 'mysql';
import cors from 'cors';

import allConfig  from './config.js';
const app = express();

// APIs
import UserApis from './apis/user.js'



// Body Parser Middleware
app.use(bodyParser.json());
app.use(cors());

const env = process.env.NODE_ENV || 'development';
const config = allConfig[env];

const con = mysql.createConnection(config.database);
con.connect();
const userApis = new UserApis(con);
app.post('/signup', function (req, res) {
    userApis.register(req, res)
});

app.post('/login', function (req, res) {
    userApis.login(req, res)
});

app.post('/delete', function (req, res) {
    userApis.deleteUser(req, res)
});

//Setting up server
const server = app.listen(config.server.port, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port)
});
import express from 'express'
import bodyParser from 'body-parser';
import mysql  from 'mysql';
import cors from 'cors';
import multer from 'multer';
import allConfig  from './config.js';
import path from 'path';
const __dirname = path.resolve();
const app = express();

// APIs
import UserApis from './apis/user.js'



// Body Parser Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'))

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

app.post('/update-username', function (req, res) {
    userApis.updateUserName(req, res)
});
app.post('/update-user-email', function (req, res) {
    userApis.updateUserEmail(req, res)
});
app.post('/update-user-password', function (req, res) {
    userApis.updateUserPassword(req, res)
});
app.post('/update-user-display-name', function (req, res) {
    userApis.updateUserDisplayName(req, res);
});

const upload = multer({ dest: __dirname + '/public/uploads/' });
const type = upload.single('picture');
app.get('/user-profile-picture', function (req, res) {
    userApis.getProfilePicture(req, res)
});
app.post('/set-user-profile-picture', type, function (req, res) {
    userApis.setProfilePicture(req, res)
});

//Setting up server
const server = app.listen(config.server.port, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port)
});
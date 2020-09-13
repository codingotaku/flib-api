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
import BookApis from './apis/book.js';


const upload = multer({ dest: __dirname + '/public/uploads/' });
const type = upload.single('picture');

// Body Parser Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'))
app.use(upload.any()); 
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

const env = process.env.NODE_ENV || 'development';
const config = allConfig[env];

const con = mysql.createConnection(config.database);
con.connect();
const userApis = new UserApis(con);
const bookApis = new BookApis(con);

// User APIs
app.post('/signup', function (req, res) {
    userApis.register(req, res)
});

app.post('/login', function (req, res) {
    userApis.login(req, res)
});

app.post('/delete', function (req, res) {
    userApis.deleteUser(req, res)
});
app.post('/set-user-profile', function (req, res) {
    userApis.updateProfile(req, res)
});
app.get('/user-profile', function (req, res) {
  userApis.getProfile(req, res)
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

app.post('/set-social-links', function (req, res) {
    userApis.setSocialLinks(req, res);
});

app.get('/social-links', function (req, res) {
    userApis.getSocialLinks(req, res);
});
app.get('/user-profile-picture', function (req, res) {
    userApis.getProfilePicture(req, res)
});

app.get('/books', function (req, res) {
    bookApis.getAllBooks(req, res)
});

app.get('/pages', function (req, res) {
    bookApis.getAllPages(req, res)
});

app.get('/book-by-id', function (req, res) {
    bookApis.getBookById(req, res)
});

app.get('/book-cover-by-id', function (req, res) {
    bookApis.getBookCoverById(req, res)
});

// Book APIs
app.post('/create-book', function (req, res) {
    bookApis.createBook(req, res)
});


app.post('/create-page', function (req, res) {
    bookApis.createPage(req, res)
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

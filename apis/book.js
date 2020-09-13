import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import { SECRET, getUserId } from '../utils/authentication.js';
import fs from 'fs'
import path from 'path';
const __dirname = path.resolve();

export default class BookApis {
    constructor(conn) {
        this.conn = conn;
    }

    async createBook(req, res) {
        const userId = await getUserId(req);
        if (userId == null || userId.message) {
            res.send({ status: 401, error: "login expired or not provided", response: null });
            return;
        }
        if (!req.body.title) {
            res.send({ status: 401, error: "Please provide the book title", response: null });
            return;
        }
        const id = userId.id;
        const data = {
            user: id,
            title: req.body.title,
            description: req.body.description,
            license: req.body.license,
            anonymous: req.body.anonymous,
        }
        if (req.files.length) {
            const file = req.files[0];
            const temp_path = file.path;
            const targetPath = path.join(__dirname, `./public/uploads/${id}-${req.body.title}-cover${path.extname(file.originalname)}`);
            data.cover = `${id}-${req.body.title}-cover${path.extname(file.originalname)}`;
            fs.rename(temp_path, targetPath, err => {
                if (err) {
                    res.json({
                        status: 200, error: null,
                        response: err.message
                    });
                }
            });
        }


        const conn = this.conn;
        console.log(req.body);
        const pairs = { tags: [] };
        if (req.body.tags) {
            for (let tag of req.body.tags) {
                if (tag) {
                    pairs.tags.push(tag)
                }
            }
            data.tags = JSON.stringify(pairs);
        }

        let insSql = "INSERT INTO flib_books SET ?";
        conn.query(insSql, data, function (modErr, result) {
            if (modErr) throw modErr;
            else {
                res.json({
                    status: 200, error: null,
                    response: result
                });
            }
        });
    }


    //For demo, will remove later
    async getAllBooks(req, res) {
        const userId = await getUserId(req);
        const bookId = req.query.id;
        const conn = this.conn;


        let selSql = "SELECT `flib_users`.`uname`, `flib_books`.`title`, `flib_books`.`id` as book_id, `flib_books`.description, `flib_books`.`tags`, count(`flib_pages`.`id`) AS chapters FROM `flib_books` JOIN `flib_users` ON `flib_books`.`user` = `flib_users`.`id` JOIN `flib_pages` ON `flib_pages`.`book` = `flib_books`.`id` GROUP BY `flib_books`.`id`";
        conn.query(selSql, function (modErr, result) {
            if (modErr) throw modErr;
            else {
                if (result[0]) {
                    res.json({
                        status: 200, error: null,
                        response: result
                    });
                }
                else {
                    res.json({
                        status: 200, error: "Nothing here",
                        response: null
                    });
                }
            }
        });
    }

    //For demo, will remove later
    async getAllPages(req, res) {
        const userId = await getUserId(req);
        const bookId = req.query.id;
        const conn = this.conn;


        let selSql = "SELECT * FROM flib_pages where book=?";
        conn.query(selSql, [bookId], function (modErr, result) {
            if (modErr) throw modErr;
            else {
                if (result[0]) {
                    res.json({
                        status: 200, error: null,
                        response: result
                    });
                }
                else {
                    res.json({
                        status: 200, error: "Nothing here",
                        response: null
                    });
                }
            }
        });
    }


    async getBookById(req, res) {
        const userId = await getUserId(req);
        if (!req.query.id) {
            res.send({ status: 401, error: "Please provide the book id", response: null });
            return;
        }
        const id = userId.id;
        const bookId = req.query.id;
        const conn = this.conn;


        let selSql = "SELECT * FROM flib_books where id=?";
        conn.query(selSql, [bookId], function (modErr, result) {
            if (modErr) throw modErr;
            else {
                if (result[0]) {
                    res.json({
                        status: 200, error: null,
                        response: result[0]
                    });
                }
                else {
                    res.json({
                        status: 200, error: "Nothing here",
                        response: null
                    });
                }
            }
        });
    }

    async createPage(req, res) {
        const userId = await getUserId(req);
        if (userId == null || userId.message) {
            res.send({ status: 401, error: "login expired or not provided", response: null });
            return;
        }
        if (!req.body.id, !req.body.title) {
            res.send({ status: 401, error: "Please provide the book title and book id", response: null });
            return;
        }
        const id = userId.id;
        const data = {
            book: id,
            title: req.body.title,
            content: req.body.content,
            published: req.body.published,
        }

        const conn = this.conn;
        let insSql = "INSERT INTO flib_pages SET ?";
        conn.query(insSql, data, function (modErr, result) {
            if (modErr) throw modErr;
            else {
                res.json({
                    status: 200, error: null,
                    response: result
                });
            }
        });
    }

    async getPageById(req, res) {
        const userId = await getUserId(req);
        if (!req.query.id) {
            res.send({ status: 401, error: "Please provide the book id", response: null });
            return;
        }
        const id = userId.id;
        const bookId = req.query.id;
        const conn = this.conn;


        let selSql = "SELECT * FROM flib_pages where id=?";
        conn.query(selSql, [bookId], function (modErr, result) {
            if (modErr) throw modErr;
            else {
                if (result[0]) {
                    res.json({
                        status: 200, error: null,
                        response: result[0]
                    });
                }
                else {
                    res.json({
                        status: 200, error: "Nothing here",
                        response: null
                    });
                }
            }
        });
    }
    async getBookCoverById(req, res) {
        const userId = await getUserId(req);
        console.log(req);
        if (!req.params.id) {
            res.send({ status: 401, error: "Please provide the book id", response: null });
            return;
        }
        const id = userId.id;
        const bookId = req.body.id;
        const conn = this.conn;


        let selSql = "SELECT * FROM flib_books where id=?";
        conn.query(selSql, [bookId], function (modErr, result) {
            if (modErr) throw modErr;
            else {

                if (result[0].cover) {
                    res.sendFile(path.join(__dirname, 'public/uploads/', result[0].cover));
                } else {
                    res.sendFile(path.join(__dirname, 'public/default_pp.svg'));
                }
            }
        });
    }
    async setBookCover(req, res) {
        const userId = await getUserId(req);
        if (userId == null || userId.message) {
            res.send({ status: 401, error: "login expired or not provided", response: null });
            return;
        }
        const id = userId.id;
        const bookId = req.body.bookId;
        const file = req.file;
        const conn = this.conn;
        const temp_path = file.path;
        let modSql = "UPDATE flib_books set cover=? where id=?";
        const targetPath = path.join(__dirname, `./public/uploads/${bookId}-cover${path.extname(req.file.originalname)}`);
        fs.rename(temp_path, targetPath, err => {
            if (err) {
                res.json({
                    status: 200, error: null,
                    response: err.message
                });
            }
            conn.query(modSql, [`${bookId}-profile${path.extname(req.file.originalname)}`, bookId], function (modErr, modResult) {
                if (modErr) throw modErr;
                else {
                    res.json({
                        status: 200, error: null,
                        response: "Book cover is updated"
                    });
                }
            });
        });

    }
}
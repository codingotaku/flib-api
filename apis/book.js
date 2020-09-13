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
        if (req.files) {
            const file = req.files[0];
            const temp_path = file.path;
            const targetPath = path.join(__dirname, `./public/public/${id}-${req.body.title}-cover${path.extname(file.originalname)}`);
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
        conn.query(insSql, data, function (modErr, modResult) {
            if (modErr) throw modErr;
            else {
                res.json({
                    status: 200, error: null,
                    response: "Created Book"
                });
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
        const targetPath = path.join(__dirname, `./public/books/${bookId}-cover${path.extname(req.file.originalname)}`);
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
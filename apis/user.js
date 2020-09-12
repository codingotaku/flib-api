// https://medium.com/nonstopio/pagination-authentication-and-authorization-in-nodejs-with-mysql-b65bc80a83be

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import { SECRET, getUserId } from '../utils/authentication.js';

export default class UserApis {
    constructor(conn) {
        this.conn = conn;
    }

    async register(req, res) {
        const uname = req.body.uname;
        const email = req.body.email;
        if (!uname || !req.body.pass) {
            res.json({ status: 404, error: "please enter both username and password" });
            return;
        }
        let sql = "SELECT * from flib_users where email=? or uname=?";
        const conn = this.conn;
        conn.query(sql, [email, uname], function (err, result) {
            if (err) throw err;
            if (result.length > 0) {
                const response = {
                    "status": 302
                }
                console.log(result);
                if (result[0].uname === uname) {
                    response.error = "Username already exists!";
                } else {
                    response.error = "Email already exists!";
                }
                res.json(response);
                return;
            }
            // Hash the password
            bcrypt.hash(req.body.pass, 12).then(hashedPass => {
                console.log(hashedPass);
                let data = {
                    uname: uname,
                    email: email,
                    password: hashedPass
                };

                let insSql = "INSERT into flib_users SET ?";
                conn.query(insSql, data, function (err, result) {
                    if (err) throw err;
                    res.json({ "status": 200, "error": null, "response": result });
                });
            });

        })
    }

    async login(req, res) {
        const uname = req.body.uname;
        // User can login with either username or email, doesn't matter witch
        let sql = "SELECT * from flib_users where email=? or uname=?";
        const conn = this.conn;
        conn.query(sql, [uname, uname], function (err, result) {
            if (err) throw err;
            if (result.length === 0) {
                res.json({ "status": 404, "error": "User does not exist!", "token": null });
                return;
            }
            bcrypt.compare(req.body.pass, result[0].password).then(valid => {
                console.log(valid);
                if (!valid) {
                    res.json({ "status": 404, "error": "Incorrect password!", "token": null });
                } else {
                    const token = jwt.sign({ user: _.pick(result[0], ['id', 'email']) },
                        SECRET, {
                        expiresIn: '1w'
                    });
                    res.json({
                        status: 200, error: null,
                        userDetails: {
                            uname: result[0].uname,
                            email: result[0].email,
                            name: result[0].name,
                            token: token
                        }
                    });
                }
            })

        });
    }

    async deleteUser(req, res) {
        const uname = req.body.uname;
        const userId = await getUserId(req);
        if (userId == null || userId.message) {
            res.send({ status: 401, error: "login expired or not provided", response: null });
            return;
        }

        const conn = this.conn;
        let delSql = "DELETE FROM flib_users WHERE uname=?";
        conn.query(delSql, [uname], function (delErr, delResult) {
            if (delErr) throw delErr;
            else {
                res.json({
                    status: 204, error: null,
                    response: "User is deleted"
                });
            }
        });

    }
}
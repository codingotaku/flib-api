import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import { SECRET, getUserId } from '../utils/authentication.js';
import fs from 'fs'
import path from 'path';
const __dirname = path.resolve();

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
                if (!valid) {
                    res.json({ "status": 404, "error": "Incorrect password!", "token": null });
                } else {
                    const token = jwt.sign({ user: _.pick(result[0], ['id', 'uname']) },
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

    async updateProfile(req, res) {
        const userId = await getUserId(req);
        if (userId == null || userId.message) {
            res.send({ status: 401, error: "login expired or not provided", response: null });
            return;
        }
        if (!req.body.name && !req.body.profileDesc && !req.body.links) {
            res.send({ status: 401, error: "Please profile name, bio or links", response: null });
            return;
        }
        const id = userId.id;
        const name = req.body.name;
        const profile_desc = req.body.profileDesc;
        const links = req.body.links;
        const conn = this.conn;
        console.log(req.body);
        const pairs = { links: [] };
        for (let link of links) {
            console.log(link);
            if (link.title && link.href) {
                console.log(link);
                pairs.links.push({ title: link.title, href: link.href })
            }
        }

        let modSql = "UPDATE flib_users set name=?, profile_desc=?, links=? where id=?";
        conn.query(modSql, [name, profile_desc, JSON.stringify(pairs), id], function (modErr, modResult) {
            if (modErr) throw modErr;
            else {
                res.json({
                    status: 200, error: null,
                    response: "Updated profile"
                });
            }
        });
    }
    async getProfile(req, res) {
        const userId = await getUserId(req);
        if (userId == null || userId.message) {
            res.send({ status: 401, error: "login expired or not provided", response: null });
            return;
        }
        const id = userId.id;
        const conn = this.conn;
        let modSql = "SELECT name, profile_desc, links FROM flib_users where id=?";
        conn.query(modSql, [id], function (modErr, result) {
            if (modErr) throw modErr;
            else {
                if (!result[0].links) {
                    result[0].links = [];
                } else {
                    result[0].links = JSON.parse(result[0].links).links;
                }
                res.json(result[0]);
            }
        });
    }

    async updateUserName(req, res) {
        const userId = await getUserId(req);
        if (userId == null || userId.message) {
            res.send({ status: 401, error: "login expired or not provided", response: null });
            return;
        }
        const id = userId.id;
        const uname = req.body.uname;
        if (uname) {
            const conn = this.conn;
            let modSql = "UPDATE flib_users set uname=? where id=?";
            conn.query(modSql, [uname, id], function (modErr, modResult) {
                if (modErr) throw modErr;
                else {
                    res.json({
                        status: 200, error: null,
                        response: "User name is updated"
                    });
                }
            });
        } else {
            res.json({
                status: 400, error: "username cannot be empty",
                response: null
            });
        }
    }

    async updateUserEmail(req, res) {
        const userId = await getUserId(req);
        if (userId == null || userId.message) {
            res.send({ status: 401, error: "login expired or not provided", response: null });
            return;
        }
        const id = userId.id;
        const email = req.body.email;
        const conn = this.conn;
        let modSql = "UPDATE flib_users set email=? where id=?";
        conn.query(modSql, [email, id], function (modErr, modResult) {
            if (modErr) throw modErr;
            else {
                res.json({
                    status: 200, error: null,
                    response: "email is updated"
                });
            }
        });
    }

    async updateUserPassword(req, res) {
        const userId = await getUserId(req);
        if (userId == null || userId.message) {
            res.send({ status: 401, error: "login expired or not provided", response: null });
            return;
        }
        const id = userId.id;
        const pass = req.body.pass;
        const newPass = req.body.newPass;
        if (pass) {
            let sql = "SELECT * from flib_users where id=?";
            const conn = this.conn;
            conn.query(sql, [id], function (err, result) {
                if (err) throw err;
                if (result.length === 0) {
                    res.json({ "status": 404, "error": "User does not exist!" });
                    return;
                }
                bcrypt.compare(req.body.pass, result[0].password).then(valid => {
                    if (!valid) {
                        res.json({ "status": 404, "error": "Incorrect password!" });
                    } else {
                        // Hash the new password
                        bcrypt.hash(req.body.newPass, 12).then(hashedPass => {
                            let modSql = "UPDATE flib_users set password=? where id=?";
                            conn.query(modSql, [hashedPass, id], function (modErr, modResult) {
                                if (modErr) throw modErr;
                                else {
                                    res.json({
                                        status: 200, error: null,
                                        response: "password is updated"
                                    });
                                }
                            });
                        });
                    }
                })
            });
        } else {
            res.json({
                status: 400, error: "password cannot be empty!",
                response: null
            });
        }
    }

    async updateUserDisplayName(req, res) {
        const userId = await getUserId(req);
        if (userId == null || userId.message) {
            res.send({ status: 401, error: "login expired or not provided", response: null });
            return;
        }
        const id = userId.id;
        const name = req.body.name;
        const conn = this.conn;
        let modSql = "UPDATE flib_users set name=? where id=?";
        conn.query(modSql, [name, id], function (modErr, modResult) {
            if (modErr) throw modErr;
            else {
                res.json({
                    status: 200, error: null,
                    response: "Name is updated"
                });
            }
        });
    }

    async deleteUser(req, res) {
        const userId = await getUserId(req);
        if (userId == null || userId.message) {
            res.send({ status: 401, error: "login expired or not provided", response: null });
            return;
        }
        const id = userId.id;
        const pass = req.body.pass;
        if (pass) {
            let sql = "SELECT * from flib_users where id=?";
            const conn = this.conn;
            conn.query(sql, [id], function (err, result) {
                if (err) throw err;
                if (result.length === 0) {
                    res.json({ "status": 404, "error": "User does not exist!" });
                    return;
                }
                bcrypt.compare(req.body.pass, result[0].password).then(valid => {
                    if (!valid) {
                        res.json({ "status": 404, "error": "Incorrect password!" });
                    } else {
                        let delSql = "DELETE FROM flib_users WHERE id=?";
                        conn.query(delSql, [id], function (delErr, delResult) {
                            if (delErr) throw delErr;
                            else {
                                res.json({
                                    status: 204, error: null,
                                    response: "User is deleted"
                                });
                            }
                        });
                    }
                })
            });
        } else {
            res.json({
                status: 400, error: "password cannot be empty!",
                response: null
            });
        }

    }

    async getProfilePicture(req, res) {
        const userId = await getUserId(req);
        if (userId == null || userId.message) {
            res.send({ status: 401, error: "login expired or not provided", response: null });
            return;
        }
        const id = userId.id;
        const conn = this.conn;
        let modSql = "SELECT profile_pic FROM flib_users where id=?";
        conn.query(modSql, [id], function (modErr, result) {
            if (modErr) throw modErr;
            else {
                if (result[0].profile_pic) {
                    res.sendFile(path.join(__dirname, 'public/uploads/', result[0].profile_pic));
                } else {
                    res.sendFile(path.join(__dirname, 'public/default_pp.svg'));
                }
            }
        });
    }
    async setProfilePicture(req, res) {
        const userId = await getUserId(req);
        if (userId == null || userId.message) {
            res.send({ status: 401, error: "login expired or not provided", response: null });
            return;
        }
        const id = userId.id;
        const file = req.file;
        const conn = this.conn;
        const temp_path = file.path;
        let modSql = "UPDATE flib_users set profile_pic=? where id=?";
        const targetPath = path.join(__dirname, `./public/uploads/${id}-profile${path.extname(req.file.originalname)}`);
        fs.rename(temp_path, targetPath, err => {
            if (err) {
                res.json({
                    status: 200, error: null,
                    response: err.message
                });
            }
            conn.query(modSql, [`${id}-profile${path.extname(req.file.originalname)}`, id], function (modErr, modResult) {
                if (modErr) throw modErr;
                else {
                    res.json({
                        status: 200, error: null,
                        response: "Profile picture is updated"
                    });
                }
            });
        });

    }
    async setSocialLinks(req, res) {
        const userId = await getUserId(req);
        if (userId == null || userId.message) {
            res.send({ status: 401, error: "login expired or not provided", response: null });
            return;
        }
        const id = userId.id;
        const links = req.body.links;
        const pairs = { links: [] };

        for (let link of links) {
            console.log(link);
            if (link.title && link.href) {
                console.log(link);
                pairs.links.push({ title: link.title, href: link.href })
            }
        }
        if (pairs.links.length > 0) {
            const conn = this.conn;
            let modSql = "UPDATE flib_users set links=? where id=?";
            conn.query(modSql, [JSON.stringify(pairs), id], function (modErr, modResult) {
                if (modErr) throw modErr;
                else {
                    res.json({
                        status: 200, error: null,
                        response: "Links are updated"
                    });
                }
            });
        } else {
            res.json({
                status: 400, error: null,
                response: "Links cannot be empty"
            });
        }

    }

    async getSocialLinks(req, res) {
        const userId = await getUserId(req);
        if (userId == null || userId.message) {
            res.send({ status: 401, error: "login expired or not provided", response: null });
            return;
        }
        const id = userId.id;
        const conn = this.conn;
        let modSql = "SELECT links FROM flib_users where id=?";
        conn.query(modSql, [id], function (modErr, result) {
            if (modErr) throw modErr;
            else {
                res.json({
                    status: 200, error: null,
                    response: JSON.parse(result[0].links)
                });
            }
        });
    }

}
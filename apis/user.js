// https://medium.com/nonstopio/pagination-authentication-and-authorization-in-nodejs-with-mysql-b65bc80a83be

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
const SECRET = 'ajdfadvasdy5788y9idyhbwwekdbsjjkahfbv';

export default class UserApis {
    constructor(conn) {
        this.conn = conn;
    }

    async register(req, res) {
        console.log(this.conn);
        res.send('Hello World');
    }
}
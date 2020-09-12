const SECRET = 'ajdfadvasdy5788y9idyhbwwekdbsjjkahfbv';
import jwt from 'jsonwebtoken';

async function getUserId(req) {
    const token = req.headers.authorization;
    if (typeof token !== undefined) {
        try {
            const {user} = await jwt.verify(token, SECRET);
            return user;
        } catch(err) {
            return {message: err.message};
        }
    } else {
        console.log('Token Undefined');
        return null;
    }
}
export {SECRET, getUserId}

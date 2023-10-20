import {
    testAdminUsername,
    testModeActive,
} from '../controllers/performanceTest.js';
import jwt from 'jsonwebtoken';

function normalOperationsChecker(req, res, next) {
    if (!testModeActive) {
        return next();
    }
    const token = req.cookies.jwtToken;
    let username;

    if (!token) {
        return res.status(401).json({});
    }
    try {
        const decodedUser = jwt.verify(token, process.env.SECRET_KEY);
        username = decodedUser.username;
    } catch (e) {
        return res.status(401).json({});
    }
    if (username != testAdminUsername) {
        return res.render('suspend');
    }
    return next();
}

export default normalOperationsChecker;

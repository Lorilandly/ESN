import { testAdminUsername, testModeActive } from "../controllers/performanceTest.js";
import jwt from 'jsonwebtoken';

function normalOperationsChecker(req, res, next) {
    // console.log("in normalOperationsChecker!");
    // console.log(`testModeActive ${testModeActive}`);
    if (!testModeActive) {
        return next();
    }
    const token = req.cookies.jwtToken;
    // console.log(process.env.SECRET_KEY)
    let username;
    // console.log(`Current username: ${username}`);
    // console.log(`Test admin username: ${testAdminUsername}`);

    if (!token) {
        // console.log("no token!");
        return res.status(401).json({});
    }
    try {
        const decodedUser = jwt.verify(token, process.env.SECRET_KEY);
        username = decodedUser.username;
    } catch (e) {
        // console.log("failed to decode token!");
        // console.log(`exception: ${e}`);
        return res.status(401).json({});
    }
    if (username != testAdminUsername){
        // display alert or error or suspend message
        // console.log(`Username does not match!: ${username}`);
        return res.render('suspend');
    }
    return next();
}

export default normalOperationsChecker;
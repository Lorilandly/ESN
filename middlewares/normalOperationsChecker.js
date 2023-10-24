import {
    testAdminUsername,
    testModeActive,
} from '../controllers/performanceTest.js';
import passport from 'passport';

function normalOperationsChecker(req, res, next) {
    if (!testModeActive) {
        return next();
    }
    passport.authenticate('jwt', (err, user) => {
        if (err) return res.status(500).json({});

        if (user.username != testAdminUsername) {
            return res.render('suspend');
        }
        return next();
    })(req, res);
}

export default normalOperationsChecker;

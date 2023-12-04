import express from 'express';
import passport from 'passport';
import {
    startPerformanceTestMode,
    endPerformanceTestMode,
    testModeActive,
} from '../controllers/performanceTest.js';
import { requireAdminPrivileges } from '../controllers/auth.js';
const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', requireAdminPrivileges, (req, res) => {
    return res.render('performanceTest');
});

router.post('/start', requireAdminPrivileges, startPerformanceTestMode);

router.post('/stop', requireAdminPrivileges, endPerformanceTestMode);

router.get('/testStatus', (req, res) => {
    return res.json({ testModeActive });
});

export default router;

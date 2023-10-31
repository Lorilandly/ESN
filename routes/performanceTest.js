import express from 'express';
import passport from 'passport';
import {
    startPerformanceTestMode,
    endPerformanceTestMode,
    testModeActive,
} from '../controllers/performanceTest.js';
const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', (req, res) => {
    return res.render('performanceTest');
});

router.post('/start', startPerformanceTestMode);

router.post('/stop', endPerformanceTestMode);

router.get('/testStatus', (req, res) => {
    return res.json({ testModeActive });
});

export default router;

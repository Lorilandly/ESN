import express from 'express';
import passport from 'passport';
import {
    startPerformanceTestMode,
    endPerformanceTestMode,
} from '../controllers/performanceTest.js';
let router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', (req, res) => {
    return res.render('performanceTest');
});

router.post('/start', startPerformanceTestMode);

router.post('/stop', endPerformanceTestMode);

export default router;

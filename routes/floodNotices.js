import express from 'express';
import passport from 'passport';
import { stateAbbreviations } from '../controllers/floodReport.js';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', (_, res) => {
    return res.render('floodNotices');
});

router.get('/create', (_, res) => {
    return res.render('createFloodReport', { states: stateAbbreviations });
});

export default router;

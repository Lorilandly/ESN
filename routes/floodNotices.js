import express from 'express';
import passport from 'passport';
import {
    getFloodReportByID,
    stateOptions,
} from '../controllers/floodReport.js';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', (_, res) => {
    return res.render('floodNotices');
});

router.get('/update/:floodReportID', async (req, res) => {
    const floodReportID = req.params.floodReportID;
    const floodReport = await getFloodReportByID(floodReportID);
    if (!floodReport) {
        return res.sendStatus(404);
    }
    return res.render('floodReportForm', {
        id: floodReportID,
        address: floodReport.address,
        city: floodReport.city,
        state: floodReport.state,
        zipcode: floodReport.zipcode,
        description: floodReport.description,
        states: stateOptions,
        updateExisting: true,
    });
});

router.get('/create', (_, res) => {
    return res.render('floodReportForm', {
        id: '',
        address: '',
        city: '',
        state: '',
        zipcode: '',
        description: '',
        states: stateOptions,
        updateExisting: false,
    });
});

export default router;

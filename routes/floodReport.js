import express from 'express';
import passport from 'passport';
import {
    getAllFloodReports,
    createFloodReport,
    deleteFloodReportByID,
} from '../controllers/floodReport.js';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', async (_, res) => {
    return getAllFloodReports()
        .then((floodReports) => {
            res.status(200).json({ floodReports });
        })
        .catch((err) => {
            console.error(err);
            return res.sendStatus(500);
        });
});

router.post('/', await createFloodReport, async (_, res) => {
    return res.status(201).json({});
});

router.delete('/:floodReportID', async (req, res) => {
    return deleteFloodReportByID(req.params.floodReportID).catch((err) => {
        console.error(err);
        return res.sendStatus(500);
    });
});

export default router;

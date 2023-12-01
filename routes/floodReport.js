import express from 'express';
import passport from 'passport';
import {
    getAllFloodReports,
    createFloodReport,
    updateFloodReportByID,
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

router.put('/:floodReportID', async (req, res) => {
    const result = await updateFloodReportByID(
        req.params.floodReportID,
        req.body,
    );
    if (Array.isArray(result)) {
        return res.status(400).json({ errors: result });
    }
    if (!result) {
        return res.status(404);
    }
    return res.status(200).json({});
});

router.delete('/:floodReportID', async (req, res) => {
    try {
        const deleted = await deleteFloodReportByID(req.params.floodReportID);
        if (deleted) {
            return res.sendStatus(200);
        }
        return res.sendStatus(404);
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

export default router;

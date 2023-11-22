import express from 'express';
import passport from 'passport';
import {
    shareCurrentLocation,
    updateCurrentLocation,
    stopSharingCurrentLocation,
    getAllLocations,
} from '../controllers/location.js';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', (req, res) => {
    return res.render('shareLocation');
});

router.get('/all', async (req, res) => {
    return getAllLocations()
        .then((locations) => {
            console.log('All locations: ' + JSON.stringify(locations));
            res.status(200).json({ locations });
        })
        .catch((err) => {
            console.error(err);
            return res.sendStatus(500);
        });
});

router.post('/', await shareCurrentLocation, async (req, res) => {
    return res.status(201).json({});
});

router.put(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    updateCurrentLocation,
    (req, res) => {
        return res.status(200).json({});
    },
);

router.delete(
    '/',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        try {
            await stopSharingCurrentLocation(req.user.id, res);
            // Assuming you have a similar function for handling the response after deleting location
            // For example: await handleDeleteLocationResponse(req.user.id, res);
            return res.status(200).json({});
        } catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    },
);

export default router;

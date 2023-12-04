import express from 'express';
import passport from 'passport';
import {
    shareCurrentLocation,
    updateCurrentLocation,
    stopSharingCurrentLocation,
    getAllLocations,
    getUserLocation,
} from '../controllers/location.js';
import {
    respondCurrentLocation,
    getLocationResponse,
} from '../controllers/response.js';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', (req, res) => {
    return res.render('shareLocation');
});

router.get('/all', async (req, res) => {
    return getAllLocations()
        .then((locations) => {
            res.status(200).json({ locations });
        })
        .catch((err) => {
            console.error(err);
            return res.sendStatus(500);
        });
});

router.get('/:id', async (req, res) => {
    return getUserLocation(req.params.id)
        .then((curLocation) => {
            res.status(200).json({ curLocation });
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
    stopSharingCurrentLocation,
    (req, res) => {
        return res.status(200).json({});
    },
);

router.post(
    '/:locationId/respond',
    passport.authenticate('jwt', { session: false }),
    await respondCurrentLocation,
    async (req, res) => {
        return res.status(201).json({});
    },
);

router.get(
    '/:locationId/responses',
    passport.authenticate('jwt', { session: false }),
    getLocationResponse,
    (req, res) => {
        return res.status(200).json({});
    },
);

export default router;

import express from 'express';
import passport from 'passport';
import {
    createAidRequest,
    updateAidRequest,
    cancelAidRequest,
    getAllAidRequests,
    getSubmittedAidRequests,
    getAcceptedAidRequests,
    acceptAidRequest,
    resolveAidRequest,
} from '../controllers/aidRequest';
const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', async (req, res) => {
    return getAllAidRequests()
        .then((aidRequests) => res.status(200).json({ aidRequests }))
        .catch((err) => {
            console.error(err);
            return res.sendStatus(500);
        });
});

router.post('/', async (req, res) => {
    return createAidRequest({
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        creatorId: req.user.id,
        acceptorId: 0,
        status: 'SUBMITTED',
    }).then(() => res.status(201).json({}));
});

router.put('/', async (req, res) => {
    return updateAidRequest(
        req.body.title,
        req.body.description,
        req.body.priority,
        req.body.aidRequestId,
    ).then(() => res.status(200).json({}));
});

router.delete('/', async (req, res) => {
    return cancelAidRequest(req.body.aidRequestId).then(() =>
        res.status(200).json({}),
    );
});

router.get('/submitted', async (req, res) => {
    return getSubmittedAidRequests(req.user.id)
        .then((aidRequests) => res.status(200).json({ aidRequests }))
        .catch((err) => {
            console.error(err);
            return res.sendStatus(500);
        });
});

router.put('/', async (req, res) => {
    return updateAidRequest(
        req.body.title,
        req.body.description,
        req.body.priority,
        req.body.aidRequestId,
    ).then(() => res.status(200).json({}));
});

router.get('/accepted', async (req, res) => {
    return getAcceptedAidRequests(req.user.id)
        .then((aidRequests) => res.status(200).json({ aidRequests }))
        .catch((err) => {
            console.error(err);
            return res.sendStatus(500);
        });
});

router.put('/accepted', async (req, res) => {
    return acceptAidRequest(req.body.aidRequestId).then(() =>
        res.status(200).json({}),
    );
});

router.put('/resolved', async (req, res) => {
    return resolveAidRequest(req.body.aidRequestId).then(() =>
        res.status(200).json({}),
    );
});

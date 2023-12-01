import express from 'express';
import passport from 'passport';
import {
    createAidRequest,
    updateAidRequest,
    cancelAidRequest,
    getAllAidRequests,
    getAidRequest,
    getSubmittedAidRequests,
    getAcceptedAidRequests,
    resolveAidRequest,
    acceptAidRequest,
} from '../controllers/aidRequest.js';
import AidRequestModel from '../models/aidRequest.js';
const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/all', async (req, res) => {
    return getAllAidRequests()
        .then((aidRequests) => res.status(200).json({ aidRequests }))
        .catch((err) => {
            console.error(err);
            return res.sendStatus(500);
        });
});

router.get('/all/:aidRequestId', async (req, res) => {
    return getAidRequest(req.params.aidRequestId)
        .then((aidRequest) => res.status(200).json({ aidRequest }))
        .catch((err) => {
            console.error(err);
            return res.sendStatus(500);
        });
});

router.post('/', async (req, res) => {
    if (!AidRequestModel.validTitle(req.body.title)) {
        return res.status(403).json({ error: 'Invalid title' });
    }
    return createAidRequest({
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        creatorId: req.user.id,
        acceptorId: 0,
        status: 'SUBMITTED',
    })
        .then(() => res.status(201).json({}))
        .catch((err) => {
            console.error(err);
            return res.sendStatus(500);
        });
});

router.put('/all/:aidRequestId', async (req, res) => {
    return updateAidRequest(
        req.body.title,
        req.body.description,
        req.body.priority,
        req.params.aidRequestId,
    ).then(() => res.status(200).json({}));
});

router.delete('/:aidRequestId', async (req, res) => {
    return cancelAidRequest(req.params.aidRequestId).then(() =>
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

router.get('/accepted', async (req, res) => {
    return getAcceptedAidRequests(req.user.id)
        .then((aidRequests) => res.status(200).json({ aidRequests }))
        .catch((err) => {
            console.error(err);
            return res.sendStatus(500);
        });
});

router.put('/accepted/:aidRequestId', async (req, res) => {
    return acceptAidRequest(req.params.aidRequestId, req.user.id).then(() =>
        res.status(200).json({}),
    );
});

router.put('/resolved/:aidRequestId', async (req, res) => {
    return resolveAidRequest(req.params.aidRequestId).then(() =>
        res.status(200).json({}),
    );
});

export default router;

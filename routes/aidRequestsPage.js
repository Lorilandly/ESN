import express from 'express';
import passport from 'passport';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.get('/all', (req, res) => {
    return res.render('aidRequests');
});

router.get('/detail/:aidRequestId', (req, res) => {
    return res.render('aidRequestDetail');
});

router.get('/new', (req, res) => {
    return res.render('aidRequestCreateForm');
});

router.get('/edit/:aidRequestId', (req, res) => {
    return res.render('aidRequestEditForm');
});

router.get('/submitted', (req, res) => {
    return res.render('aidRequests');
});

router.get('/accepted', (req, res) => {
    return res.render('aidRequests');
});

export default router;

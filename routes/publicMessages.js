import express from 'express';
import passport from 'passport';
import { createPublicMessage } from '../controllers/publicMessage.js';
let router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

/* GET page. */
router.get('/:id', (req, res) => {
    return res.json("{'page': 'resources'}");
});

/* POST page */
router.post('/', await createPublicMessage);

export default router;

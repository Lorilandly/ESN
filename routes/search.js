import express from 'express';
import passport from 'passport';
import searchContextFactory from '../controllers/search.js';

const router = express.Router();
router.use(passport.authenticate('jwt', { session: false }));

router.get('/', async (req, res) => {
    const { context, criteria, input } = req.query;
    let searchContext;
    try {
        searchContext = searchContextFactory(context, criteria);
    } catch (err) {
        // err caused by bad combination of context and criteria
        console.error(err);
        return res.sendStatus(400);
    }
    return await searchContext
        .search(input)
        .then((result) => res.status(200).json(result))
        .catch((err) => {
            // err caused by db queries
            console.error(err);
            return res.sendStatus(500);
        });
});

export default router;

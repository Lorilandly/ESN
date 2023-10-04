import express from 'express';
let router = express.Router();

/* GET join page. */
router.get('/', (req, res) => {
    res.render('join');
});

export default router;

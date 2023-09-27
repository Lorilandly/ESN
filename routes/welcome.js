import express from 'express';
let router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
    // Redirect to "/login" if not logged in
    res.render('welcome');
});

export default router;

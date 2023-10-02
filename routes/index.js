import express from 'express';
import { 
    checkUserAuthenticated
} from '../controllers/auth.js';
let router = express.Router();

router.use(checkUserAuthenticated);

/* GET home page. */
router.get('/', (req, res) => {
    res.render('index');
});

export default router;
import express from 'express';
import { 
    checkUserAuthenticated,
    getAllUsers     
} from '../controllers/auth.js';
let router = express.Router();

router.use(checkUserAuthenticated);

/* GET home page. */
router.get('/', (req, res) => {
    if (!res.locals.isAuthenticated) {
        return res.render('join');
    } else {
        res.render('index');
    }
});

export default router;

import express from 'express';
import { checkUserAuthenticated } from '../controllers/auth.js';
import { createPublicMessage } from '../controllers/publicMessages.js';
let router = express.Router();

/* GET page. */
router.get("/:id", (req, res) => {
    return res.json("{'page': 'resources'}");
});

/* POST page */
router.post("/", checkUserAuthenticated, await createPublicMessage)

export default router;

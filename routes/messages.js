import express from 'express';
import { checkUserAuthenticated } from '../controllers/auth.js';
import { createMessage } from '../controllers/messages.js';
let router = express.Router();

/* GET page. */
router.get("/:id", (req, res) => {
    res.send("page");
});

/* POST page */
router.post("/", checkUserAuthenticated, await createMessage)

export default router;

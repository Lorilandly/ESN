import express from "express";
import { checkUserAuthenticated } from "../controllers/auth.js";
let router = express.Router();

/* GET users listing. */
router.get("/", checkUserAuthenticated, (req, res) => {
	console.log(`req.user: ${JSON.stringify(req.user)}`);
	res.render("welcome");
});

export default router;

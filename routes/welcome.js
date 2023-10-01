import express from "express";
import { checkUserAuthenticated } from "../controllers/auth.js";
let router = express.Router();

/* GET users listing. */
router.get("/", checkUserAuthenticated, (req, res) => {
	res.render("welcome");
});

export default router;

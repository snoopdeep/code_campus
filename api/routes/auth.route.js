import express from "express";
const router = express.Router();
import {signup,signin,google} from "../controllers/auth.controller.js";
import { verifyEmail } from "../util/verifyEmail.js";

router.post("/signup", verifyEmail, signup);
router.post('/signin',signin);
router.post('/google',google);
export default router;

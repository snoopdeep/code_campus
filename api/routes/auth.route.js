import express from "express";
const router = express.Router();
import {signup,signin,google} from "../controllers/auth.controller.js";
import { verifyEmail } from "../util/verifyEmail.js";
import { otpVerification,resendOTP } from "../util/otpVarification.js";

router.post("/signup", verifyEmail, signup);
router.post("/verifyOTP",otpVerification);
router.post("/resendOTP", resendOTP);
router.post('/signin',signin);
router.post('/google',google);
export default router;

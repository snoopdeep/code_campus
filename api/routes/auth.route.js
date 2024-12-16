import express from "express";
const router = express.Router();
import {signup,signin,google,forgetPassword,resetPassword} from "../controllers/auth.controller.js";
import { verifyEmail } from "../util/verifyEmail.js";
import { otpVerification,resendOTP } from "../util/otpVarification.js";

router.post("/signup", verifyEmail, signup);
router.post('/signin',signin);
router.post("/verifyOTP",otpVerification);
router.post("/resendOTP", resendOTP);
router.post('/google',google);
router.post('/forget-password',forgetPassword);
router.post('/reset-password/:resetToken',resetPassword);
export default router;

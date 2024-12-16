// controllers/auth.controller.js
import User from "../models/user.model.js";
import { errorHandler } from "../util/error.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const otpVerification = async (req, res, next) => {
  const { email, otp } = req.body;
  console.log("this is otpVerification route", email, otp);
  if (!email || !otp) {
    return next(errorHandler(400, "Email and OTP are required"));
  }
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    // check if user is blocked
    if (user?.isUserBlocked) {
      return next(
        errorHandler(
          403,
          "Your account has been suspended due to policy violations. Contact support for assistance."
        )
      );
    }
    // Check if user is already verified
    if (user.isVerified) {
      return next(errorHandler(400, "User is already verified"));
    }

    // Check if OTP is valid
    if (user.otp !== otp) {
      return next(errorHandler(400, "Invalid OTP"));
    }

    // Check if OTP has expired
    if (user.otpExpiry < Date.now()) {
      return next(errorHandler(400, "OTP has expired"));
    }

    // OTP is valid, mark the email as verified
    user.isVerified = true;
    user.otp = undefined; // Clear OTP after successful verification
    user.otpExpiry = undefined; // Clear OTP expiry
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS, // Your Gmail password or App Password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Signup Verification",
    text: `Your OTP is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};
export const resendOTP = async (req, res, next) => {
  const { email } = req.body;
  if (!email || email.trim() === "") {
    return next(errorHandler(400, "Email is required"));
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    // check if user is blocked
    if (user?.isUserBlocked) {
      return next(
        errorHandler(
          403,
          "Your account has been suspended due to policy violations. Contact support for assistance."
        )
      );
    }
    if (user.isVerified) {
      return next(errorHandler(400, "User is already verified"));
    }

    // Generate new OTP and update user
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "OTP has been resent to your email." });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

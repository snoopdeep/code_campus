import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../util/error.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendMail } from "../util/sendMail.js";

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

function checkPassword(str) {
  var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  return re.test(str);
}

// const createAndSentJWTToken = async () => {};

//1: signup
export const signup = async (req, res, next) => {
  console.log("Hello from signup controller ", " Request body:", req.body);
  const { userName, fullName, email, password, confirmPassword } = req.body; // USN,
  if (
    !fullName ||
    !userName ||
    !email ||
    // !USN ||
    !password ||
    !confirmPassword ||
    fullName.trim() === "" ||
    userName.trim() === "" ||
    email.trim() === "" ||
    // USN.trim() === "" ||
    password.trim() === "" ||
    confirmPassword.trim() === ""
  ) {
    return next(errorHandler(400, "All fields are required"));
  }
  // Password validation
  if (!checkPassword(password)) {
    return next(
      errorHandler(
        400,
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character."
      )
    );
  }
  if (password !== confirmPassword) {
    return next(errorHandler(404, "passwords are not matching"));
  }
  // Check if user already exists with this email or useruserName
  const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
  if (existingUser) {
    // check if user is blocked by admin
    if (existingUser.isUserBlocked) {
      return next(
        errorHandler(
          403,
          "Your account has been suspended due to policy violations. Contact support for assistance."
        )
      );
    }
    if (existingUser.isVerified) {
      return next(
        errorHandler(
          400,
          "An account with this email or User Name already exists but isn't verified. Reset your password to verify your account."
        )
      );
    }
    if (existingUser.email === email)
      return next(
        errorHandler(400, "User with this email already exists. Please log in.")
      );
    if (existingUser.userName === userName)
      return next(
        errorHandler(
          400,
          "This User Name is already taken, kindly try another."
        )
      );
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);
  const otp = generateOTP();
  try {
    const newUser = await User.create({
      userName,
      fullName,
      email,
      // USN,
      password: hashedPassword,
      otp,
      otpExpiry: Date.now() + 10 * 60 * 1000, // OTP valid for 10 minutes
    });
    console.log("New User successfully created in database!");
    // await sendOTPEmail(email, otp);
    const message = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #f9f9f9;
      text-align: center;
    }
    .header {
      background-color: #007BFF;
      color: #fff;
      padding: 10px;
      font-size: 1.5em;
      border-radius: 6px 6px 0 0;
    }
    .content {
      margin: 20px 0;
    }
    .otp {
      font-size: 1.5em;
      font-weight: bold;
      color: #007BFF;
    }
    .footer {
      margin-top: 20px;
      font-size: 0.9em;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">AceConnect OTP Verification</div>
    <div class="content">
      <p>Hi <strong>${fullName}</strong>,</p>
      <p>Thank you for signing up for AceConnect!</p>
      <p>Your One-Time Password (OTP) for account verification is:</p>
      <p class="otp">${otp}</p>
      <p>This OTP is valid for the next 10 minutes. Please use it to complete your registration.</p>
    </div>
    <div class="footer">
      <p>If you did not sign up for AceConnect, please ignore this email.</p>
      <p>Thank you,<br>The AceConnect Team</p>
    </div>
  </div>
</body>
</html>
`;
    await sendMail(email, "otpSignUp", message);
    // Do not send the OTP back to the client for security reasons
    return res.status(201).json({
      message: "User created successfully. OTP sent to email.",
      user: {
        id: newUser._id,
        userName: newUser.userName,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

// 2: signin
export const signin = async (req, res, next) => {
  console.log("Hello from signin controller ", " Request body:", req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password || email === "" || password === "") {
      return next(errorHandler(400, "All fields are required"));
    }

    const validUser = await User.findOne({ email });
    // console.log(validUser);
    if (!validUser) {
      return next(errorHandler(400, "User not found"));
    }
    // check if the user is blocked
    if (validUser?.isUserBlocked) {
      return next(
        errorHandler(
          403,
          "Your account has been suspended due to policy violations. Contact support for assistance."
        )
      );
    }
    // Check if the user is verified
    if (!validUser.isVerified) {
      return next(
        errorHandler(
          400,
          "Your account isn't verified. Reset Your Password to complete verification."
        )
      );
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    // console.log(validPassword);
    if (!validPassword) {
      return next(errorHandler(400, "Invalid password"));
    }
    // user is validate
    validUser.password = undefined;
    const token = jwt.sign(
      {
        id: validUser._id,
        isAdmin: validUser.isAdmin,
        isModerator: validUser.isModerator,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "5h",
      }
    );
    res
      .status(200)
      .cookie("access_token", token, { httpOnly: true })
      .json(validUser);
  } catch (err) {
    console.log("Error:", err.message);
    return next(err);
  }
};

export const google = async (req, res, next) => {
  console.log("Hello from google controller ", " Request body:", req.body);
  const { email, name, googlePhotoURL } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      // check if user is blocked
      if (user?.isUserBlocked) {
        return next(
          errorHandler(
            403,
            "Your account has been suspended due to policy violations. Contact support for assistance."
          )
        );
      }
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin, isModerator: user.isModerator },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      user.password = undefined;
      res
        .status(200)
        .cookie("access_token", token, { httpOnly: true })
        .json(user);
    } else {
      const generatePassword = Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatePassword, 10);
      const newUser = await User.create({
        name:
          name.toLowerCase().split(" ").join("") +
          Math.random().toString(9).slice(-5),
        email,
        password: hashedPassword,
        profilePicture: googlePhotoURL,
      });
      await newUser.save();
      console.log("New User successfully created in database!");
      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      newUser.password = undefined;
      res
        .status(200)
        .cookie("access_token", token, { httpOnly: true })
        .json(newUser);
    }
  } catch (err) {
    next(err);
  }
};

// forget password
export const forgetPassword = async (req, res, next) => {
  console.log("hi from the forget password");
  try {
    const userEmail = req.body.email;
    console.log(userEmail);
    if (!userEmail) return next(errorHandler(404, "No email is provided"));
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return next(errorHandler(400, "No user is found."));
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
    const resetToken = user.createResetToken();

    await user.save({ validateBeforeSave: false });

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #f9f9f9;
      text-align: center;
    }
    .header {
      background-color: #007BFF;
      color: #fff;
      padding: 10px;
      font-size: 1.5em;
      border-radius: 6px 6px 0 0;
    }
    .content {
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      font-size: 1em;
      color: #fff;
      background-color: #007BFF;
      text-decoration: none;
      border-radius: 4px;
    }
    .footer {
      margin-top: 20px;
      font-size: 0.9em;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Password Reset Request</div>
    <div class="content">
      <p>Hi <strong>${user.fullName}</strong>,</p>
      <p>We received a request to reset your password for your AceConnect account.</p>
      <p>If you made this request, please click the button below to reset your password:</p>
      <a href="${resetLink}" class="button">Reset Password</a>
      <p>If the button above doesn’t work, you can also copy and paste the following link into your browser:</p>
      <p>${resetLink}</p>
      <p>This link will expire in 10 minutes. If you didn’t request a password reset, please ignore this email or contact our support team for assistance.</p>
    </div>
    <div class="footer">
      <p>Thank you,<br>The AceConnect Team</p>
    </div>
  </div>
</body>
</html>
`;
    await sendMail(userEmail, "password_reset", message);
    res.status(200).json({
      status: "success",
      url: resetLink,
      message: "password change link send successfully",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// reset password
export const resetPassword = async (req, res, next) => {
  console.log("hi from reset password");
  try {
    const resetToken = req.params.resetToken;
    console.log("resetToken:", resetToken);

    // Password validation
    if (!req.body.password) {
      return next(errorHandler(404, "Password is required."));
    }

    if (!checkPassword(req.body.password)) {
      return next(
        errorHandler(
          400,
          "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character."
        )
      );
    }

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    console.log("hashedResetToken:", hashedResetToken);

    const user = await User.findOne({
      passwordResetToken: hashedResetToken,
      passwordResetTokenExpire: { $gt: Date.now() },
    });

    // check if user is blocked
    if (user?.isUserBlocked) {
      return next(
        errorHandler(
          403,
          "Your account has been suspended due to policy violations. Contact support for assistance."
        )
      );
    }
    console.log("User found:", user);

    if (!user) {
      return next(
        errorHandler(404, "No user found or reset link has expired.")
      );
    }

    // Check if new password matches old password
    if (bcryptjs.compareSync(req.body.password, user.password)) {
      return next(
        errorHandler(
          404,
          "New password should not be the same as the old password."
        )
      );
    }

    // Ensure password doesn't contain username or email prefix
    console.log(user);
    if (
      req.body.password.includes(user.name) ||
      req.body.password.includes(user.email.split("@")[0])
    ) {
      return next(
        errorHandler(
          404,
          "New password should not contain your username or email."
        )
      );
    }

    // Hash the new password (make sure to await the promise)
    const hashedPassword = await bcryptjs.hash(req.body.password, 10);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;
    user.isVerified = true;
    await user.save();

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin, isModerator: user.isModerator },
      process.env.JWT_SECRET,
      {
        expiresIn: "5h",
      }
    );
    res.status(200).cookie("access_token", token, { httpOnly: true }).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    console.error("Error in resetPassword controller:", err);
    next(err);
  }
};

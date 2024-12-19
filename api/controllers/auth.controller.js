import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../util/error.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendMail } from "../util/sendMail.js";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
// Get the directory name from the current module URL
const __dirname = dirname(fileURLToPath(import.meta.url));

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
  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { userName }],
  });
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
    if (existingUser.email === email.toLowerCase())
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
      email: email.toLowerCase(),
      // USN,
      password: hashedPassword,
      otp,
      otpExpiry: Date.now() + 10 * 60 * 1000, // OTP valid for 10 minutes
    });

    const templatePath = path.join(
      __dirname,
      "..",
      "util",
      "emailTemplates",
      "signupEmailMessage.html"
    );
    const htmlContent = fs.readFileSync(templatePath, "utf-8");
    const message = htmlContent
      .replace("{{fullName}}", fullName)
      .replace("{{otp}}", otp);

    await sendMail(email.toLowerCase(), "otpSignUp", message);
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
  try {
    const { email, password } = req.body;
    if (!email || !password || email === "" || password === "") {
      return next(errorHandler(400, "All fields are required"));
    }

    const validUser = await User.findOne({ email: email.toLowerCase() });
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
        expiresIn: "5d",
        // expiresIn: 1000*60*5,

      }
    );
    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
        maxAge: 5 * 24* 60 * 60 * 1000,
      })
      .json(validUser);
  } catch (err) {
    console.log("Error:", err.message);
    return next(err);
  }
};

export const google = async (req, res, next) => {
  const { userName, fullName, email, googlePhotoURL } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    // check if user is blocked
    if (user?.isUserBlocked) {
      return next(
        errorHandler(
          403,
          "Your account has been suspended due to policy violations. Contact support for assistance."
        )
      );
    }
    // if user already exist
    if (user) {
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin, isModerator: user.isModerator },
        process.env.JWT_SECRET,
        {
          expiresIn: "5h",
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
        userName: userName.toLowerCase() + Math.random().toString(9).slice(-5),
        fullName,
        email,
        password: hashedPassword,
        profilePicture: googlePhotoURL,
      });
      // verify the user
      newUser.isVerified = true;
      await newUser.save();
      const token = jwt.sign(
        {
          id: newUser._id,
          isAdmin: newUser.isAdmin,
          isModerator: newUser.isModerator,
        },
        process.env.JWT_SECRET,
        { expiresIn: "5h" }
      );
      newUser.password = undefined;
      res
        .status(200)
        .cookie("access_token", token, { httpOnly: true })
        .json(newUser);
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// forget password
export const forgetPassword = async (req, res, next) => {
  try {
    const userEmail = req.body.email.toLowerCase();
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

    const templatePath = path.join(
      __dirname,
      "..",
      "util",
      "emailTemplates",
      "forgetPasswordMessage.html"
    );
    const htmlContent = fs.readFileSync(templatePath, "utf-8");
    const message = htmlContent
      .replace("{{fullName}}", user.fullName)
      .replace("{{resetLink}}", resetLink);

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
  try {
    const resetToken = req.params.resetToken;

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

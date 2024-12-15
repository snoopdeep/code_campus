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
  const { name, fullName, email,password, confirmPassword } = req.body; // USN, 
  if (
    !name ||
    !fullName ||
    !email ||
    // !USN ||
    !password ||
    !confirmPassword ||
    name.trim() === "" ||
    fullName.trim() === "" ||
    email.trim() === "" ||
    // USN.trim() === "" ||
    password.trim() === "" ||
    confirmPassword.trim() === ""
  ) {
    return next(errorHandler(400, "All fields are required"));
  }
  // checking usn and email compitability
  // if (email.toLowerCase().split("@")[0] !== USN) {
  //   return next(
  //     errorHandler(
  //       404,
  //       `The provided USN ${USN} does not match the email ${email}. ` +
  //         `Please ensure you are using the correct email associated with your USN.`
  //     )
  //   );
  // }
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
  // Check if user already exists with this email or username
  const existingUser = await User.findOne({ $or: [{ email }, { name }] });
  if (existingUser) {
    if (existingUser.email === email)
      return next(errorHandler(400, "User with this email already exists"));
    if (existingUser.name === name)
      return next(errorHandler(400, "Username is already taken"));
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);
  const otp = generateOTP();
  try {
    const newUser = await User.create({
      name,
      fullName,
      email,
      // USN,
      password: hashedPassword,
      otp,
      otpExpiry: Date.now() + 10 * 60 * 1000, // OTP valid for 10 minutes
    });
    console.log("New User successfully created in database!");
    // await sendOTPEmail(email, otp);
    await sendMail(email, "otp", otp);
    // Do not send the OTP back to the client for security reasons
    return res.status(201).json({
      message: "User created successfully. OTP sent to email.",
      user: {
        id: newUser._id,
        name: newUser.name,
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
    // Check if the user is verified
    if (!validUser.isVerified) {
      return next(errorHandler(400, "Please verify your email first"));
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
    const resetToken = user.createResetToken();

    await user.save({ validateBeforeSave: false });

    const urlString = `http://localhost:5173/reset-password/${resetToken}`;
    await sendMail(userEmail, "password_reset", urlString);
    res.status(200).json({
      status: "success",
      url: urlString,
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
    user.isVerified=true;
    await user.save();

    console.log("JWT secret:", process.env.JWT_SECRET);

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin, isModerator: user.isModerator },
      process.env.JWT_SECRET,
      {
        expiresIn: "5h",
      }
    );

    console.log("Generated token:", token);

    res.status(200).cookie("access_token", token, { httpOnly: true }).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    console.error("Error in resetPassword controller:", err);
    next(err);
  }
};

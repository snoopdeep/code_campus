import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import { errorHandler } from "../util/error.js";
import { sendMail } from "../util/sendMail.js";
import crypto from "crypto";
import Razorpay from "razorpay";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
// Get the directory name from the current module URL
const __dirname = dirname(fileURLToPath(import.meta.url));

function checkPassword(str) {
  var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  return re.test(str);
}
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};
export const updateUser = async (req, res, next) => {
  console.log("hi from the update user", req.body);
  // check if the user id in the request is the same as the user id in the token
  if (req.params.userId !== req.user.id) {
    return next(errorHandler(401, "You are not allowed to update this user"));
  }
  const {
    userName,
    fullName,
    password,
    email,
    github,
    linkedIn,
    profilePicture,
  } = req.body;
  // now check all the data in the request body
  if (!req.body) {
    return next(errorHandler(400, "nothing to update"));
  }
  if (password) {
    if (!checkPassword(password)) {
      return next(
        errorHandler(
          400,
          "password must be at least 8 char long and have at least one upper, one lower, one digit and one special character."
        )
      );
    }
  }
  // check if the password is same as old passoword
  if (password) {
    const currentUser = await User.findById(req.user.id);
    if (currentUser) {
      if (bcryptjs.compareSync(password, currentUser.password)) {
        return next(
          errorHandler(
            400,
            "New password should not be the same as the old password."
          )
        );
      }
    }
  }

  // check username
  if (userName) {
    if (userName.length < 5 || userName.length > 20) {
      return next(
        errorHandler(400, "Username should be between 5 and 20 characters long")
      );
    }
    console.log("userName is :", userName);
    if (userName.includes(" ")) {
      return next(errorHandler(400, "Username should not contain spaces"));
    }
    if (userName !== userName.toLowerCase()) {
      return next(errorHandler(400, "Username should be in lowercase"));
    }
    if (userName.match(/[^a-z0-9]/)) {
      return next(
        errorHandler(400, "Username should contain only letters and numbers")
      );
    }

    const existingUserByUsername = await User.findOne({
      userName,
      _id: { $ne: req.params.userId },
    });
    if (existingUserByUsername) {
      return next(errorHandler(400, "Username is already taken"));
    }
  }
  console.log("email is :", email);
  if (email) {
    const existingUserByEmail = await User.findOne({
      email,
      _id: { $ne: req.params.userId },
    });
    console.log("existingUserByEmail is :", existingUserByEmail);
    if (existingUserByEmail) {
      return next(errorHandler(400, "Email is already in use"));
    }
  }
  try {
    const otp = generateOTP();
    let hashedPassword;
    if (password) hashedPassword = bcryptjs.hashSync(password, 10);
    // updating only those fields which are present in req.body
    const updateFields = {};
    const allowedFields = [
      "userName",
      "fullName",
      "email",
      "password",
      "linkedIn",
      "github",
      "profilePicture",
    ];

    for (const [key, value] of Object.entries(req.body)) {
      if (value !== undefined && allowedFields.includes(key)) {
        if (key === "password") updateFields[key] = hashedPassword;
        else updateFields[key] = value;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          ...updateFields,
          otp,
          otpExpiry: Date.now() + 10 * 60 * 1000,
        },
      },
      { new: true } // Return the updated document
    );

    const templatePath = path.join(
      __dirname,
      "..",
      "util",
      "emailTemplates",
      "userUpdateOTP.html"
    );
    console.log(templatePath);
    const emailTemplates = fs.readFileSync(templatePath, "utf-8");
    const message = emailTemplates
      .replace("{{fullName}}", updatedUser.fullName)
      .replace("{{otp}}", otp);
    await sendMail(updatedUser.email, "otpUpdate", message);
    // unverify the user
    updatedUser.isVerified = false;
    console.log("updated user", updatedUser);
    await updatedUser.save();
    updatedUser.password = undefined;
    // seperate the password from the user object
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

// // delete user controller

export const deleteUser = async (req, res, next) => {
  const userIdToDelete = req.params.userId;
  const requestingUserId = req.user.id;
  const isAdmin = req.user.isAdmin;

  try {
    const userToDelete = await User.findById(userIdToDelete);
    if (!userToDelete) {
      return next(errorHandler(404, "User not found"));
    }

    if (isAdmin) {
      if (requestingUserId.toString() === userIdToDelete.toString()) {
        return next(errorHandler(403, "Admins cannot delete themselves"));
      }
    } else {
      if (requestingUserId.toString() !== userIdToDelete.toString()) {
        // Non-admin trying to delete someone else
        return next(errorHandler(403, "You can only delete your own account"));
      }
    }

    //delete the user
    console.log(userToDelete);
    userToDelete.name = `[Deleted]_${userToDelete._id}`;
    userToDelete.email = `deleted_${userToDelete._id}@example.com`;
    userToDelete.password = `deleted_${userToDelete._id}`;
    userToDelete.profilePicture =
      "https://i.pinimg.com/736x/b2/36/f4/b236f4e7dc2d7ef2f5c8b6c3f910881c.jpg";
    userToDelete.isAdmin = false;
    userToDelete.isDeleted = true;
    userToDelete.isVerified = false;
    userToDelete.isModerator = false;
    await userToDelete.save({ validateBeforeSave: false });
    // await User.findByIdAndDelete(userIdToDelete);
    res.status(200).json({ message: "User has been deleted" });
  } catch (err) {
    console.error("Error deleting user:", err.message);
    next(err);
  }
};

// signout controller
export const signout = (req, res, next) => {
  try {
    res.clearCookie("token");
    res.status(200).json("User has been signed out");
  } catch (err) {
    next(err);
  }
};

// get users controller
export const getUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to see all users"));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      users: usersWithoutPassword,
      totalUsers,
      lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
};

// get user controller
export const getUser = async (req, res, next) => {
  try {
    console.log("hi from getuser controller", req.params);
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    // change the name of deleted user
    if (user?.isDeleted) user.name = "[Deleted]";

    const { password, ...rest } = user._doc;
    res.status(200).json({
      status: "success",
      data: rest,
    });
  } catch (err) {
    next(err);
  }
};

// post feedback

export const postFeedback = async (req, res, next) => {
  try {
    console.log("This is postFeedback controller");
    console.log(req.body);

    const feedbackData = req.body;

    const templatePath = path.join(
      __dirname,
      "..",
      "util",
      "emailTemplates",
      "feedbackEmailMessage.html"
    );
    const htmlContent = fs.readFileSync(templatePath, "utf-8");
    
    const feedbackEmail = htmlContent
      .replace("{{fullName}}", feedbackData.user.fullName)
      .replace("{{email}}", feedbackData.user.email)
      .replace("{{profilePicture}}", feedbackData.user.profilePicture)
      .replace(
        "{{createdAt}}",
        new Date(feedbackData.user.createdAt).toLocaleString()
      )
      .replace(
        "{{updatedAt}}",
        new Date(feedbackData.user.updatedAt).toLocaleString()
      )
      .replace("{{rating}}", feedbackData.rating)
      .replace("{{contentRating}}", feedbackData.contentRating)
      .replace("{{feedback}}", feedbackData.feedback)
      .replace("{{suggestions}}", feedbackData.suggestions);

    // Send the feedback email to the admin
    await sendMail(feedbackData.user.email, "feedback", feedbackEmail, true);

    // Respond to the user
    res.status(200).json({
      status: "success",
      message: "Thanks for your feedback!",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// create order
export const createOrder = async (req, res, next) => {
  // console.log(process.env.RAZORPAY_KEY_ID);
  // Razorpay instance
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log("this is createOrder middleware");
  try {
    const { amount } = req.body;
    // console.log(amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid donation amount" });
    }
    // Create an order with the user-defined amount
    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });
    // console.log("this is createOrder and order is :", order);

    res.json({
      amount: order.amount,
      order_id: order.id,
    });
  } catch (err) {
    console.error("Error creating order", err);
    res.status(500).send("Something went wrong");
  }
};

// payment success
export const paymentSuccess = async (req, res, next) => {
  console.log("this is paymentSuccess middleware");
  const { payment_id, order_id, email, amount } = req.body;
  try {
    // Fetch payment details from Razorpay (optional but recommended)
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log(
      "this is paymentSuccess::",
      payment_id,
      order_id,
      email,
      amount
    );
    const paymentDetails = await razorpay.payments.fetch(payment_id);

    const templatePath = path.join(
      __dirname,
      "..",
      "util",
      "emailTemplates",
      "paymentSuccess.html"
    );
    const htmlContent = fs.readFileSync(templatePath, "utf-8");
    htmlContent = htmlContent
      .replace("{{amout}}", amount / 100)
      .replace("{{payment_id}}", payment_id)
      .replace("{{order_id}}", order_id)
      .replace("{{date}}", new Date().toLocaleDateString());

    await sendMail(email, "paymentSuccess", htmlContent);
    // Respond to the user
    res.status(200).json({
      status: "success",
      message: "Thanks for your donation!",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

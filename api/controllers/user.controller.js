import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import { errorHandler } from "../util/error.js";
import { sendMail } from "../util/sendMail.js";
import Razorpay from "razorpay";

function checkPassword(str) {
  var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  return re.test(str);
}
export const updateUser = async (req, res, next) => {
  // check if the user id in the request is the same as the user id in the token
  if (req.params.userId !== req.user.id) {
    return next(errorHandler(401, "You are not allowed to update this user"));
  }
  // now check all the data in the request body
  if (req.body.password) {
    // password should have at least 8 char includeing upper and lower case with digit and one special character
    if (!checkPassword(req.body.password)) {
      return next(
        errorHandler(
          400,
          "password must be at least 8 char long and have at least one upper, one lower, one digit and one special character."
        )
      );
    }
  }
  // if password is correct then encrypt it
  if (req.body.password) {
    console.log("Password:", req.body.password);
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }
  // check username
  if (req.body.name) {
    if (req.body.name.length < 5 || req.body.name.length > 20) {
      return next(
        errorHandler(400, "Username should be between 5 and 20 characters long")
      );
    }
    if (req.body.name.includes(" ")) {
      return next(errorHandler(400, "Username should not contain spaces"));
    }
    if (req.body.name !== req.body.name.toLowerCase()) {
      return next(errorHandler(400, "Username should be in lowercase"));
    }
    if (req.body.name.match(/[^a-z0-9]/)) {
      return next(
        errorHandler(400, "Username should contain only letters and numbers")
      );
    }
  }
  try {
    const upadatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          name: req.body.username,
          email: req.body.email,
          profilePicture: req.body.profilePicture,
          password: req.body.password,
        },
      },
      { new: true }
    );
    console.log("updated user", upadatedUser);
    // await upadatedUser.save();
    // seperate the password from the user object
    upadatedUser.password = undefined;
    res.status(200).json(upadatedUser);
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
    userToDelete.isModerator=false;
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

    // Construct the HTML content for the email
    const feedbackEmail = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; background-color: #f4f4f4; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #007bff; color: white; text-align: center; padding: 10px 0; border-radius: 10px 10px 0 0;">
          <h2>New Feedback Submitted on CodeCampus</h2>
        </div>
        <div style="padding: 20px;">
          <p><strong>User Information:</strong></p>
          <p>
            <strong>Name:</strong> ${feedbackData.user.name}<br>
            <strong>Email:</strong> <a href="mailto:${
              feedbackData.user.email
            }">${feedbackData.user.email}</a><br>
            <strong>Profile Picture:</strong> <a href="${
              feedbackData.user.profilePicture
            }">View Profile Picture</a><br>
            <strong>Account Created At:</strong> ${new Date(
              feedbackData.user.createdAt
            ).toLocaleString()}<br>
            <strong>Last Updated:</strong> ${new Date(
              feedbackData.user.updatedAt
            ).toLocaleString()}
          </p>
          <hr>
          <p><strong>Feedback Details:</strong></p>
          <p>
            <strong>Overall Rating:</strong> ${feedbackData.rating}/5<br>
            <strong>Content Quality Rating:</strong> ${
              feedbackData.contentRating
            }/5<br>
            <strong>Feedback:</strong> ${feedbackData.feedback}<br>
            <strong>Suggestions for Improvement:</strong> ${
              feedbackData.suggestions
            }
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 0.9em; color: #777;">
          Please review this feedback and take any necessary actions to enhance the platform experience.<br><br>
          Thank you, <br>
          <strong>CodeCampus Feedback System</strong>
        </div>
      </div>
    `;

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

    // Define the HTML content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #444;">
        <h2 style="color: #1a73e8;">Thank You for Your Donation!</h2>
        <p>Dear Donor,</p>
        <p>We sincerely appreciate your generous contribution to <strong>CodeCampus</strong>. Your support helps us continue our mission.</p>
        
        <h3>Donation Details:</h3>
        <ul>
          <li><strong>Amount:</strong> INR ${amount/100}</li>
          <li><strong>Payment ID:</strong> ${payment_id}</li>
          <li><strong>Order ID:</strong> ${order_id}</li>
          <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
        </ul>

        <p>Thank you again for your support!</p>
        <p>Warm regards,<br/><strong>The CodeCampus Team</strong></p>
      </div>
    `;
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

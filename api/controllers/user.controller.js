import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import { errorHandler } from "../util/error.js";



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
        return next(
          errorHandler(403, "Admins cannot delete themselves")
        );
      }
    } else {
      if (requestingUserId.toString() !== userIdToDelete.toString()) {
        // Non-admin trying to delete someone else
        return next(
          errorHandler(403, "You can only delete your own account")
        );
      }
    }

    //delete the user
    console.log(userToDelete);
    userToDelete.isDeleted=true;
    userToDelete.name="[Deleted]";
    userToDelete.profilePicture="https://i.pinimg.com/736x/b2/36/f4/b236f4e7dc2d7ef2f5c8b6c3f910881c.jpg";
    // user.email = null; // Optional: Anonymize email
    await userToDelete.save();
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
    console.log("hi from get user controller");
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (err) {
    next(err);
  }
};

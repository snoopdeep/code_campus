import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import { errorHandler } from "../util/error.js";
// function test(req,res){
//     res.send("Hello from user controller!!");
// }
// export default test;

export const test = (req, res) => {
  res.send("Hello from user controller!!");
};

export const updateUser = async (req, res, next) => {
  // check if the user id in the request is the same as the user id in the token
  if (req.params.userId !== req.user.id) {
    return next(errorHandler(401, "You are not allowed to update this user"));
  }
  // now check all the data in the request body
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(
        errorHandler(400, "Password should be at least 6 characters long")
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

// delete user controller

export const deleteUser = async (req, res, next) => {
  console.log('hi from delete user');
  // if user is admin do not delete
  // console.log(req.user);
  if (req.user.id===req.params.userId) {
    return next(errorHandler(403, "You are admin and you can't delete yourself"));
  }
  // console.log('req.params.userId',req.params.userId);
  // console.log('req.user.id',req.user.id);
  // if (req.params.userId !== req.user.id) {
  //   return next(errorHandler(401, "You are not allowed to delete this user"));
  // }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json("User has been deleted");
  } catch (err) {
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
    return next(errorHandler(403, 'You are not allowed to see all users'));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === 'asc' ? 1 : -1;

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
    console.log('hi from get user controller');
    const user = await User.findById(req.params.userId);
    if(!user){
      return next(errorHandler(404,'User not found'));
    }
    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (err) {
    next(err);
  }
};
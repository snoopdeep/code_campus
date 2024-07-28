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
  if (req.params.userId !== req.user.id) {
    return next(errorHandler(401, "You are not allowed to delete this user"));
  }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json("User has been deleted");
  } catch (err) {
    next(err);
  }
};

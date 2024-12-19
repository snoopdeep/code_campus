import jwt from "jsonwebtoken";
import { errorHandler } from "../util/error.js";

export const verifyToken = async (req, res, next) => {
  // get the cookie from the request using cookie-parser

  const token = req.cookies.access_token; // access_token is the name of the cookie
  if (!token) {
    return next(errorHandler(401, "Please login again!"));
  }
  // verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(errorHandler(401, "Unauthorized"));
    }
    req.user = user;
    next();
  });
};

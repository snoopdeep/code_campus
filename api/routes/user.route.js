import express from "express";
const router = express.Router();
import { updateUser, test } from "../controllers/user.controller.js";
import { verifyToken } from "../util/verifyUser.js";
console.log("Hello from user route!!");
router.get("/test", test);
router.put(
  "/update/:userId",
  (req, res, next) => {
    // console.log("insdie update");
    console.log(req.body);
    next();
  },
  verifyToken,
  updateUser
);

export default router;

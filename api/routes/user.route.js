import express from "express";
const router = express.Router();
import { updateUser, test, deleteUser } from "../controllers/user.controller.js";
import { verifyToken } from "../util/verifyUser.js";
console.log("Hello from user route!!");
router.get("/test", test);
router.put(
  "/update/:userId",

  verifyToken,
  updateUser
);
router.delete('/delete/:userId', verifyToken, deleteUser);

export default router;

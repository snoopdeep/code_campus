import express from "express";
const router = express.Router();
import {
  updateUser,
  deleteUser,
  signout,
  getUsers,
  getUser,
  postFeedback,
  createOrder,
  paymentSuccess
} from "../controllers/user.controller.js";
import { verifyToken } from "../util/verifyUser.js";
console.log("Hello from user route!!");

router.get("/getusers", verifyToken, getUsers);
router.put("/update/:userId", verifyToken, updateUser);
router.delete("/delete/:userId", verifyToken, deleteUser);
router.post("/signout", signout);
router.get("/:userId", getUser);
router.post("/feedback", verifyToken, postFeedback);
router.post("/create-order", verifyToken, createOrder);
router.post('/payment-success',verifyToken,paymentSuccess);

export default router;

import express from "express";
const router = express.Router();
import { updateUser, deleteUser,signout,getUsers,getUser,postFeedback } from "../controllers/user.controller.js";
import { verifyToken } from "../util/verifyUser.js";
console.log("Hello from user route!!");
// router.get("/test", test);
router.get('/getusers',verifyToken,getUsers);
router.put("/update/:userId",verifyToken,updateUser);
router.delete('/delete/:userId', verifyToken, deleteUser);
router.post('/signout',signout);
router.get('/:userId',getUser);
router.post('/feedback',verifyToken,postFeedback);

export default router;

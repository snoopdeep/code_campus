import express from "express";
const router=express.Router();
import { verifyToken } from "../util/verifyUser.js"
import { createComment,getPostComments } from "../controllers/comment.controller.js";

router.post('/create',verifyToken,createComment);
router.get('/getPostComments/:postId',getPostComments);
export default router;
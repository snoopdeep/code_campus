import express from "express";
import { verifyToken } from "../util/verifyUser.js";
import { create } from "../controllers/post.controller.js";
import { getposts } from "../controllers/post.controller.js";
import { deletePost } from "../controllers/post.controller.js";
import { updatePost } from "../controllers/post.controller.js";
const router=express.Router();

router.get('/getposts',getposts);
router.post('/create',verifyToken,create);
router.delete('/deletepost/:postId/:userId',verifyToken,deletePost);
router.put('/updatepost/:postId/:userId',verifyToken,updatePost);
export default router;
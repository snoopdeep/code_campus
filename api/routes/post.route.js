import express from "express";
import { verifyToken } from "../util/verifyUser.js";
import { create } from "../controllers/post.controller.js";
import { getposts } from "../controllers/post.controller.js";
import { deletePost } from "../controllers/post.controller.js";
import { updatePost,getAllPosts,verifyPost,getVerifiedAndunVerifiedPost } from "../controllers/post.controller.js";
const router=express.Router();

router.get('/getposts',verifyToken,getposts);
router.get('/getAllPosts',getAllPosts);
router.post('/create',verifyToken,create);
router.delete('/deletepost/:postId/:userId',verifyToken,deletePost);
router.put('/updatepost/:postId/:userId',verifyToken,updatePost);
router.post('/verifyPost/:postId',verifyToken,verifyPost);
router.get('/getVerifiedAndunVerifiedPost',getVerifiedAndunVerifiedPost);
// router.get('/getunVerifyPosts',verifyToken,getunVerifyPosts)
export default router;
import express from "express";
const router = express.Router();
import { verifyToken } from "../util/verifyUser.js";
import {
  createComment,
  getPostComments,
  likeComment,
  editComment,
  deleteComment,
  getAllComments,
} from "../controllers/comment.controller.js";

import { perspectiveMiddleware } from "../util/perspectiveContentAnalyse.js";

router.post("/create", verifyToken, perspectiveMiddleware, createComment);
router.get("/getPostComments/:postId", getPostComments);
router.put("/likeComment/:commentId", verifyToken, likeComment);
router.put(
  "/editComment/:commentId",
  verifyToken,
  perspectiveMiddleware,
  editComment
);
router.delete("/deleteComment/:commentId", verifyToken, deleteComment);
router.get("/getAllComments", verifyToken, getAllComments);
export default router;

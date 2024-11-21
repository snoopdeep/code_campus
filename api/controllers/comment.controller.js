import { errorHandler } from "../util/error.js";
import Comment from "../models/comment.model.js";

export const createComment = async (req, res, next) => {
  try {
    console.log("hi from createComment");
    console.log("req.body:", req.body); // Log the request body

    const { content, postId, userId } = req.body;

    if (userId !== req.user.id) {
      return next(errorHandler("Unauthorized", 401));
    }

    const newComment = new Comment({
      content,
      postId,
      userId,
    });

    console.log("new comment is:", newComment);
    await newComment.save();
    res.status(200).json(newComment);
    console.log("comment created");
  } catch (err) {
    console.log("Error:", err);
    next(err); // Pass the error to the next middleware
  }
};

export const getPostComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({
      postId: req.params.postId,
    }).sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (err) {
    console.log("Error:", err);
    next(err); // Pass the error to the next middleware
  }
};

export const likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler("Comment not found", 404));
    }
    const index = comment.likes.indexOf(req.user.id);
    if (index === -1) {
      comment.likes.push(req.user.id);
      comment.numberOfLikes++;
    } else {
      comment.likes.splice(index, 1);
      comment.numberOfLikes--;
    }
    await comment.save();
    res.status(200).json(comment);
  } catch (err) {
    console.log("Error:", err);
    next(err); // Pass the error to the next middleware
  }
};

// edit comment
export const editComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, "comment is not found"));
    }
    if (comment.userId != req.user.id || !req.user.isAdmin) {
      return next(errorHandler(404, "you are not allow to edit this comment"));
    }
    const editedComment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      {
        content: req.body.content,
      },
      { new: true }
    );
    res.status(200).json(editedComment);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// delete comment // only admin or the owner of the comment is allowed
export const deleteComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const comment = await Comment.findById(commentId);
    if(!comment){
      return next(errorHandler(404,"Comment not found"))
    }
    if (comment.userId !== req.user.id || !req.user.isAdmin) {
      return next(
        errorHandler(404, "you are not allow to delete this comment")
      );
    }
    const response = await Comment.findByIdAndDelete(commentId);
    if (response) {
      res.status(200).json({ message: "comment deleted successfully" });
    }
  } catch (err) {
    next(err);
  }
};

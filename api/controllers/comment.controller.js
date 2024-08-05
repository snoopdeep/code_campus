import { errorHandler } from "../util/error.js";
import Comment from "../models/comment.model.js";

export const createComment = async (req, res, next) => {
    try {
        console.log('hi from createComment');
        console.log('req.body:', req.body); // Log the request body

        const { content, postId, userId } = req.body;

        if (userId !== req.user.id) {
            return next(errorHandler("Unauthorized", 401));
        }

        const newComment = new Comment({
            content,
            postId,
            userId,
        });

        console.log('new comment is:', newComment);
        await newComment.save();
        res.status(200).json(newComment);
        console.log('comment created');

    } catch (err) {
        console.log('Error:', err);
        next(err); // Pass the error to the next middleware
    }
};

export const getPostComments = async (req, res, next) => {
    try{
        const comments=await Comment.find({
            postId:req.params.postId
        }).sort({createdAt:-1});
        res.status(200).json(comments);
    }catch(err){
        console.log('Error:', err);
        next(err); // Pass the error to the next middleware
    }   
}
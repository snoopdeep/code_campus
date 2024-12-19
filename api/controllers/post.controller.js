import Post from "../models/post.model.js";
import { errorHandler } from "../util/error.js";
import User from "../models/user.model.js";
import { sendMail } from "../util/sendMail.js";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
// Get the directory name from the current module URL
const __dirname = dirname(fileURLToPath(import.meta.url));

// Create a new post
export const create = async (req, res, next) => {
  if (!req.body.title || !req.body.content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  const slug = req.body.title
    .toLowerCase()
    .split(" ")
    .join("-")
    .replace(/[^a-zA-Z0-9-]/g, "");
  const post = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });

  try {
    const savedPost = await post.save();
    // send mail to the user that ur post is under review
    const user = await User.findById(req.user.id);
    if (user) {
      const templatePath = path.join(
        __dirname,
        "..",
        "util",
        "emailTemplates",
        "postSubmission.html"
      );
      const htmlContent = fs.readFileSync(templatePath, "utf-8");
      const message = htmlContent
        .replace("{{fullName}}", user.fullName)
        .replace("{{title}}", req.body.title)
        .replace("{{date}}", new Date().getFullYear());
      await sendMail(user.email, "userPostVerification", message);
    }
    res.status(201).json(savedPost);
  } catch (err) {
    next(err);
  }
};

export const getposts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    // Build the filter based on user role
    let filter = {};
    const userResponse = await fetch(
      `http://localhost:3000/api/users/${req.user.id}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    const user = await userResponse.json();
  
    // Non-admins see only their posts
    if (!req?.user?.isAdmin && !req.user.isModerator) {
      filter.userId = req.user.id;
      if (user?.isModerator) filter.userId = user.data.userId;
    }
    // if(!req.user.isAdmin)filter.isVerified = true;

    // Apply additional filters from query parameters
    if (req.query.category) filter.category = req.query.category;
    if (req.query.slug) filter.slug = req.query.slug;
    if (req.query.postId) filter._id = req.query.postId;
    if (req.query.searchTerm) {
      filter.$or = [
        { title: { $regex: req.query.searchTerm, $options: "i" } },
        { content: { $regex: req.query.searchTerm, $options: "i" } },
      ];
    }
    const tempPosts = await Post.find(filter)
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit)
      .populate("userId", [
        "userName",
        "profilePicture",
        "isAdmin",
        "isDeleted",
        "isModerator",
      ]);

    // if user is deleted then change the name of it
    const posts = tempPosts.map((post) => {
      // Check if the user exists and is marked as deleted
      if (post?.userId?.isDeleted) {
        post.userId.name = `[Deleted]`;
      }
      return post;
    });

    const totalPosts = await Post.countDocuments(filter);

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      ...filter,
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPosts = async (req, res, next) => {
  try {

    // Parse query parameters for pagination and sorting
    const startIndex = parseInt(req.query.startIndex, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    // Build the filter based solely on query parameters
    let filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.slug) {
      filter.slug = req.query.slug;
    }

    if (req.query.postId) {
      filter._id = req.query.postId;
    }

    if (req.query.searchTerm) {
      filter.$or = [
        { title: { $regex: req.query.searchTerm, $options: "i" } },
        { content: { $regex: req.query.searchTerm, $options: "i" } },
      ];
    }
    // // adding isVerified field to the filter object so that only verified post fetched
    filter.isVerified = true;

    // Fetch posts based on the filter, with sorting and pagination
    const tempPosts = await Post.find(filter)
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit)
      .populate("userId", [
        "userName",
        "profilePicture",
        "isVerified",
        "isDeleted",
        "isAdmin",
        "isModerator",
        "fullName",
        "email",
        "linkedIn",
        "github",
      ]);

    // check if the user is deleted so change the response before sending..
    const posts = tempPosts.map((post) => {
      if (post?.userId?.isDeleted) {
        post.userId.userName = "[Deleted]";
        post.userId.email = null;
        post.userId.fullName = null;
      }
      return post;
    });

    // Count total number of posts matching the filter
    const totalPosts = await Post.countDocuments(filter);

    // Calculate the number of posts created in the last month
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      ...filter,
      createdAt: { $gte: oneMonthAgo },
    });

    // Respond with the fetched posts and counts
    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    console.error("Error in getAllPosts:", error);
    next(error);
  }
};

// Delete a post with access control
export const deletePost = async (req, res, next) => {


  // Corrected logical condition: Use AND instead of OR
  if (
    !req.user.isAdmin && // Not an admin
    req.user.id !== req.params.userId && // Not the owner of the post
    !req.user.isModerator // Not a moderator
  ) {
    return res
      .status(403)
      .json({ message: "You are not allowed to delete this post" });
  }

  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Update a post with access control
export const updatePost = async (req, res, next) => {


  // Corrected logical condition: Use AND instead of OR
  if (
    !req.user.isAdmin &&
    req.user.id !== req.params.userId &&
    !req.user.isModerator
  ) {
    return res
      .status(403)
      .json({ message: "You are not allowed to update this post" });
  }


  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: req.body.image,
          isVerified:false,
        },
      },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    next(err);
  }
};

// verify post
export const verifyPost = async (req, res, next) => {
  try {

    if (!req.user.isAdmin && !req.user.isModerator) {
      return next(
        errorHandler(
          404,
          "you are not allow to verify post! Only admin || moderator can do it."
        )
      );
    }
    const post = await Post.findById(req.params.postId).populate("userId", [
      "email",
      "name",
      // "isModerator",
    ]);
    if (!post) return next(errorHandler(404, "No post is found"));

    if (post.isVerified) {
      return next(errorHandler(400, "Post is already verified."));
    }
    post.isVerified = true;
    post.save();

    const templatePath = path.join(
      __dirname,
      "..",
      "util",
      "emailTemplates",
      "postVerificationConfirm.html"
    );
    const htmlContent = fs.readFileSync(templatePath, "utf-8");
    const message = htmlContent
      .replace("{{fullName}}", post?.userId?.fullName)
      .replace("{{title}}", post.title)
      .replace("{{postLiveLink}}", `http://localhost:5173/post/${post.slug}`)
      .replace("{{date}}", new Date().getFullYear());

    await sendMail(post.userId.email, "postVerificationConfirmed", message);

    res.status(200).json({
      status: "success",
      message: "post is verify successfully",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};


export const getVerifiedAndunVerifiedPost = async (req, res, next) => {
  try {
    const { slug } = req.query;
    if (!slug) return next(errorHandler(404, "No post Slug"));
    const post = await Post.findOne({ slug }).populate("userId", [
      "userName",
      "profilePicture",
      "isVerified",
      "isDeleted",
      "isAdmin",
      "isModerator",
      "fullName",
      "email",
      "linkedIn",
      "github",
    ]);
    if (!post) return next(errorHandler(404, "No post is found"));
    // check if the user is deleted so change the response before sending..
    if (post?.userId?.isDeleted) {
      post.userId.userName = "[Deleted]";
      post.userId.email = null;
      post.userId.fullName = null;
    }
    res.status(200).json({
      status: "success",
      post,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

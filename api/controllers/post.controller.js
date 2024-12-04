import Post from "../models/post.model.js";
import { errorHandler } from "../util/error.js";

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
    res.status(201).json(savedPost);
  } catch (err) {
    next(err);
  }
};

// Get posts with access control
export const getposts = async (req, res, next) => {
  try {
    console.log('hi from getposts');
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === 'asc' ? 1 : -1;

    // Build the filter based on user role
    let filter = {};
    console.log(req.user);

    if (!req.user.isAdmin) {
      filter.userId = req.user.id; // Non-admins see only their posts
    }

    // Apply additional filters from query parameters
    if (req.query.category) filter.category = req.query.category;
    if (req.query.slug) filter.slug = req.query.slug;
    if (req.query.postId) filter._id = req.query.postId;
    if (req.query.searchTerm) {
      filter.$or = [
        { title: { $regex: req.query.searchTerm, $options: 'i' } },
        { content: { $regex: req.query.searchTerm, $options: 'i' } },
      ];
    }
    console.log(req.query);
    console.log("filter is ",filter);
    const posts = await Post.find(filter)
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
      console.log(posts);

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

// Get all posts without access control
export const getAllPosts = async (req, res, next) => {
  try {
    console.log('hi from getAllPosts');

    // Parse query parameters for pagination and sorting
    const startIndex = parseInt(req.query.startIndex, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 9;
    const sortDirection = req.query.order === 'asc' ? 1 : -1;

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
        { title: { $regex: req.query.searchTerm, $options: 'i' } },
        { content: { $regex: req.query.searchTerm, $options: 'i' } },
      ];
    }

    // Fetch posts based on the filter, with sorting and pagination
    const posts = await Post.find(filter)
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    // console.log(posts);

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
    console.error('Error in getAllPosts:', error);
    next(error);
  }
};

// Delete a post with access control
export const deletePost = async (req, res, next) => {
  console.log('hi from deletePost');

  // Corrected logical condition: Use AND instead of OR
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    return res.status(403).json({ message: 'You are not allowed to delete this post' });
  }

  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // If not admin, ensure the user owns the post
    if (!req.user.isAdmin && post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not allowed to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Update a post with access control
export const updatePost = async (req, res, next) => {
  console.log('hi from updatePost');
  console.log(req.params);
  console.log(req.user);

  // Corrected logical condition: Use AND instead of OR
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    return res.status(403).json({ message: 'You are not allowed to update this post' });
  }

  console.log('req.body', req.body);

  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // If not admin, ensure the user owns the post
    if (!req.user.isAdmin && post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not allowed to update this post' });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: req.body.image,
        },
      },
      { new: true }
    );

    console.log('updatedPost', updatedPost);
    res.status(200).json(updatedPost);
  } catch (err) {
    next(err);
  }
};

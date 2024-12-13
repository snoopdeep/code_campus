import Post from "../models/post.model.js";
import { errorHandler } from "../util/error.js";
import User from "../models/user.model.js";
import { sendMail } from "../util/sendMail.js";

// Create a new post
export const create = async (req, res, next) => {
  console.log('this is create post.jsx :',req.body);
  if (!req.body.title || !req.body.content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  const slug = req.body.title
    .toLowerCase()
    .split(" ")
    .join("-")
    .replace(/[^a-zA-Z0-9-]/g, "");
  console.log("this is create new post, post is : ", req.body);
  const post = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });

  try {
    const savedPost = await post.save();
    console.log("this is post create middleware and post is :");
    // send mail to the user that ur post is under review
    const user = await User.findById(req.user.id);
    if (user) {
      const message = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .email-container {
              font-family: Arial, sans-serif;
              color: #333;
              line-height: 1.6;
            }
            .header {
              background-color: #4CAF50;
              color: white;
              text-align: center;
              padding: 10px 0;
            }
            .content {
              padding: 20px;
              text-align: left;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 0.9em;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Thank You for Your Contribution!</h1>
            </div>
            <div class="content">
              <p>Dear ${user.name},</p>
              <p>Thank you for contributing to <strong>CodeCampus</strong>. Your post titled "<strong>${
                req.body.title
              }</strong>" has been successfully submitted.</p>
              <p>We appreciate your effort in sharing valuable content with our community. To ensure that all posts adhere to our platform's guidelines, your submission is currently under review by our moderators. Once approved, it will be published on the platform.</p>
              <p>If you have any questions or concerns, feel free to reach out to us.</p>
              <p>Thank you for being an integral part of our community!</p>
              <p>Best regards,<br/>The CodeCampus Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} CodeCampus. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      await sendMail(user.email, "userPostVerification", message);
    }
    res.status(201).json(savedPost);
  } catch (err) {
    next(err);
  }
};

// 1: Get posts with access control ie req.user will be avaible
// 2: non admin can only see there posts
// 3: populate userId field and if user is deleted change name to [Deleted]
// 4: if user is admin show all posts else show only post of that user
export const getposts = async (req, res, next) => {
  try {
    console.log("hi from getposts");
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    // Build the filter based on user role
    let filter = {};
    // console.log(req.user);
    const userResponse = await fetch(
      `http://localhost:3000/api/users/${req.user.id}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    const user = await userResponse.json();
    // if(user.status!=="success")return next(404,"No user is found");
    console.log("this is getposts and user is ", req.user);
    // Non-admins see only their posts
    if (!req?.user?.isAdmin && !req.user.isModerator) {
      console.log("hi from the if block");
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
    // console.log(req.query);
    console.log("filter is ", filter);
    const tempPosts = await Post.find(filter)
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit)
      .populate("userId", [
        "name",
        "profilePicture",
        "isAdmin",
        "isDeleted",
        "isModerator",
      ]);
    // console.log(tempPosts);

    // if user is deleted then change the name of it
    const posts = tempPosts.map((post) => {
      // Check if the user exists and is marked as deleted
      if (post?.userId?.isDeleted) {
        post.userId.name = `[Deleted]`;
      }
      return post;
    });
    // console.log(posts);

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

// 1: getAllPosts -> without access control ie req.user will not be there
// 2: if user id deleted -> [Deleted]
// 3: it should only show verified post to user and admin
export const getAllPosts = async (req, res, next) => {
  try {
    console.log("hi from getAllPosts");

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
      .populate("userId", "name profilePicture isAdmin isDeleted isModerator");

    // if user is deleted then change the name of it
    const posts = tempPosts.map((post) => {
      // Check if the user exists and is marked as deleted
      if (post.userId?.isDeleted) {
        post.userId.name = `[Deleted]`;
      }
      return post;
    });

    // Count total number of posts matching the filter
    const totalPosts = await Post.countDocuments(filter);
    // console.log('This is get all posts :',posts,totalPosts);

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
  console.log("hi from deletePost", req.user);
  console.log("req.params.userId", req.params.userId);

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
  console.log("hi from updatePost");
  console.log(req.params);
  console.log(req.user);

  // Corrected logical condition: Use AND instead of OR
  if (!req.user.isAdmin && req.user.id !== req.params.userId&&  !req.user.isModerator){  
    return res
      .status(403)
      .json({ message: "You are not allowed to update this post" });
  }

  console.log("req.body", req.body);

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
        },
      },
      { new: true }
    );

    console.log("updatedPost", updatedPost);
    res.status(200).json(updatedPost);
  } catch (err) {
    next(err);
  }
};

// verify post
export const verifyPost = async (req, res, next) => {
  console.log("hello from the verify post");
  try {
    // let responseUser=req.user.;
    // if(req.responseUser) user=await fetch(`http://localhost:3000/api/users/${req.user.id}`,{
    //   method:"GET",
    //   credentials:"include"
    // });
    // const user=await responseUser.json();
    // console.log('user is ',user);
    if (!req.user.isAdmin && !req.user.isModerator) {
      return next(
        errorHandler(
          404,
          "you are not allow to verify post! Only admin || moderator can do it."
        )
      );
    }
    // console.log(req.params);
    const post = await Post.findById(req.params.postId).populate("userId", [
      "email",
      "name",
      // "isModerator",
    ]);
    if (!post) return next(errorHandler(404, "No post is found"));
    // change the isVarify filed of the post to true
    // console.log(post);
    // if (!post.userId.isModerator) {
    //   return next(errorHandler(404, "You are not allowed to verify a post"));
    // }
    if (post.isVerified) {
      return next(errorHandler(400, "Post is already verified."));
    }
    post.isVerified = true;
    post.save();
    // send mail to the user that his/her post is now available
    console.log("this is verify post and post is :", post);
    const message = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .email-container {
              font-family: Arial, sans-serif;
              color: #333;
              line-height: 1.6;
            }
            .header {
              background-color: #4CAF50;
              color: white;
              text-align: center;
              padding: 10px 0;
            }
            .content {
              padding: 20px;
              text-align: left;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 0.9em;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Congratulations! Your Post is Live!</h1>
            </div>
            <div class="content">
              <p>Dear ${post?.userId?.name},</p>
              <p>We are excited to inform you that your post titled "<strong>${
                post.title
              }</strong>" has been approved and is now available on <strong>CodeCampus</strong>!</p>
              <p>Thank you for sharing valuable content with our community. Your post is now accessible to our users, and we’re confident it will make a positive impact.</p>
              <p>You can view your post <a href="https://localhost:3000/post/${
                post.slug
              }" style="color: #4CAF50; text-decoration: none;">here</a>.</p>
              <p>If you have more experiences or insights to share, we encourage you to continue contributing to the platform.</p>
              <p>Thank you for being an integral part of our community!</p>
              <p>Best regards,<br/>The CodeCampus Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} CodeCampus. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

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

// get both verified and unverified post
// 1: req.user will be there
export const getVerifiedAndunVerifiedPost = async (req, res, next) => {
  console.log("this is getunVerifyPosts");
  try {
    console.log(req.query);
    const { slug } = req.query;
    console.log({ slug });
    if (!slug) return next(errorHandler(404, "No post Slug"));
    const post = await Post.findOne({ slug }).populate("userId", [
      "name",
      "profilePicture",
      "isVerified",
      "isDeleted",
    ]);
    if (!post) return next(errorHandler(404, "No post is found"));
    // console.log("hi this is from getVerandUnver post :", post);
    res.status(200).json({
      status: "success",
      post,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

import Post from "../models/post.model.js";
import { errorHandler } from "../util/error.js";
export const create = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return res
      .status(403)
      .json({ message: "You are not allowed to create a post" });
  }
  if (!req.body.title || !req.body.content) {
    return res.status(400).json({ message: "Title and content are required" });
  }
//   console.log(req.user.id);
//   console.log('req.user:', req.user);  // Log the req.user object to check its content
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
//   console.log("post", post);
  try{
    const savedPost = await post.save();
    res.status(201).json(savedPost);

  }catch(err){
    next(err)
  }
};

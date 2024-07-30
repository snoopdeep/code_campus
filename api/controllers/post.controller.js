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

export const getposts=async(req,res,next)=>{
  try{
    const startIndex=parseInt(req.query.startIndex||0);
    const limit=parseInt(req.query.limit||9);
    const sortDirection=req.query.order==='asc'?1:-1;
    const posts=await Post.find({
      ...(req.query.userId&&{userId:req.query.userId}),
      ...(req.query.category&&{category:req.query.category}),
      ...(req.query.slug&&{slug:req.query.slug}),
      ...(req.query.postId&&{postId:req.query.postId}),
      ...(req.query.searchTerm&&{
        $or:[
          {title:{ $regex: req.query.searchTerm, $options: "i" }},
          {content:{ $regex: req.query.searchTerm, $options: "i" }},
        ]
      })
    })
    .sort({updatedAt:sortDirection})
    .skip(startIndex)
    .limit(limit);
    const totalPosts=await Post.countDocuments();
    const now=new Date();
    const oneMonthAgo=new Date(
  now.getFullYear(),
  now.getMonth()-1,
  now.getDate()
);
const lastMonthPosts=await Post.countDocuments({
  createdAt:{$gte:oneMonthAgo}
});
res.status(200).json({posts,totalPosts,lastMonthPosts});
  }catch(err){
    next(err);

  }
}
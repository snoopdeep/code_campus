import { Link } from "react-router-dom";

export default function PostCard({ post }) {
  // console.log("this is postCard.jsx and post is :", post);

  return (
    <div className="group relative w-full border border-teal-500 hover:border-2 h-[450px] overflow-hidden rounded-lg sm:w-[430px]">
      <Link to={`/post/${post.slug}`}>
        <img
          src={post.image}
          alt="post cover"
          className="h-[260px] w-full object-cover group-hover:h-[200px] translate-all duration-300 z-20"
        />
      </Link>
      <div className="p-3 flex flex-col gap-5">
        <p className="text-lg font-semibold line-clamp-2">{post.title}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={post.userId.profilePicture}
              alt="user profile"
              className="w-5 h-5 rounded-full object-cover border border-gray-700"
            />
            <p
              className={
                post?.userId?.isAdmin
                  ? "text-sm font-medium text-red-600"
                  : post?.userId?.isModerator
                  ? "text-sm text-violet-600 font-medium"
                  : "text-sm font-medium"
              }
            >
              {post.userId.userName}
            </p>
          </div>
          <span className="italic text-sm text-gray-600">{post.category}</span>
        </div>
        <Link
          to={`/post/${post.slug}`}
          className="z-10 group-hover:bottom-0 absolute bottom-[-200px] left-0 right-0 border border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white translate-all duration-300 text-center py-2 rounded-md !rounded-tl-none m-2"
        >
          Read article
        </Link>
      </div>
    </div>
  );
}

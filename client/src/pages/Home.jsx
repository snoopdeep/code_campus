import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CallToAction from "../components/CallToAction.jsx";
import PostCard from "../components/PostCard.jsx";
export default function Home() {
  const [posts, setPost] = useState([]);

  useEffect(() => {
    const fetctPosts = async () => {
      const res = await fetch("http://localhost:3000/api/post/getAllPosts", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data) setPost(data.posts);
    };
    fetctPosts();
  }, []);
  console.log(posts);
  return (
    <div>
      <div className="flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold lg:text-5xl">
          Welcome to CodeCampus
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm">
          Hi, everyone! Welcome to my first blog post! My name is Alina Jiang
          and I am the current Grad student of NYU. I came from China and have
          been studying in America for 5 years.
        </p>
        <Link
          to={"/search"}
          className="text-xm sm:text-sm font-bold text-teal-500 hover:underline"
        >
          See All Posts
        </Link>
      </div>
      <div className="p-3 bg-amber-100 dark:bg-slate-500">
        <CallToAction />
      </div>
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7">
        {posts && posts.length > 0 && (
          <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-semibold text-center">Recent Posts</h1>
            <div className="flex flex-wrap gap-4">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            <Link
              to={"/search"}
              className="text-lg font-bold text-teal-500 hover:underline text-center "
            >
              View All Posts
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
